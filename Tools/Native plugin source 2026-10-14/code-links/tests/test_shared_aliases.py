import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]/'core'))
import code_links as c


class SharedAliases(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.base = Path(self.tmp.name).resolve()
        self.registry = self.base/'aliases.psv'
        self.env = patch.dict(os.environ, {'NAV_REGISTRY': str(self.registry)})
        self.env.start()
        self.a = self.base/'vault-a'; self.a.mkdir()
        self.b = self.base/'vault-b'; self.b.mkdir()
        self.folder = self.base/'data Ω'; self.folder.mkdir()
        (self.folder/'code.py').write_text('print(1)\n')
        self.nav = Path.home()/'utils/.nav/nav.py'

    def tearDown(self):
        self.env.stop(); self.tmp.cleanup()

    def apply(self, **args):
        plan = c.root_manager(self.a, **args)
        return c.root_manager(self.a, **args, apply=True, token=plan['token'])

    def test_terminal_vaults_and_redirect_move(self):
        self.apply(action='add', name='bdm', path=str(self.folder))
        for root in (self.a, self.b):
            self.assertEqual(c.resolve(root, 'bdm:code.py'), self.folder/'code.py')
        run = subprocess.run([sys.executable, str(self.nav), 'bdm'], capture_output=True, text=True)
        self.assertEqual(run.returncode, 0); self.assertEqual(run.stdout.strip(), str(self.folder))
        self.apply(action='rename', name='bdm', new='ceria')
        self.apply(action='rename', name='ceria', new='research')
        moved = self.base/'moved'; self.folder.rename(moved)
        self.apply(action='move', name='research', path=str(moved))
        for name in ('bdm', 'ceria', 'research'):
            self.assertEqual(c.resolve(self.b, name+':code.py'), moved/'code.py')
        self.assertEqual(set(c.roots(self.a, active=True)), {'', 'research'})

    def test_migration_preserves_tags_and_unrelated_settings(self):
        self.registry.write_text('nav|'+str(self.base)+'|tools,work\n')
        cp = self.a/'.code-links.json'
        cp.write_text(json.dumps({'roots': {'bdm': str(self.folder)}, 'other': 12}))
        legacy = self.base/'roots.json'; legacy.write_text(json.dumps({'qm': str(self.b)}))
        self.apply(action='migrate', projects=[str(self.a), str(self.b)], legacy_registry=str(legacy))
        self.assertEqual(json.loads(cp.read_text()), {'other': 12})
        self.assertEqual(json.loads(legacy.read_text()), {})
        self.assertEqual(c.resolve(self.b, 'bdm:code.py'), self.folder/'code.py')
        items = c.root_manager(self.a)['items']
        self.assertEqual(next(x for x in items if x['name']=='nav')['tags'], ['tools','work'])

    def test_conflicting_local_definition_never_overrides(self):
        self.apply(action='add', name='bdm', path=str(self.folder))
        cp = self.b/'.code-links.json'; cp.write_text(json.dumps({'roots': {'bdm': str(self.a)}}))
        before = self.registry.read_text()
        with self.assertRaisesRegex(ValueError, 'Local overrides'):
            c.resolve(self.b, 'bdm:code.py')
        with self.assertRaisesRegex(ValueError, 'conflict'):
            c.root_manager(self.b, action='migrate')
        self.assertEqual(self.registry.read_text(), before)
        self.assertTrue(json.loads(cp.read_text())['roots'])

    def test_stale_edit_does_not_overwrite_terminal_change(self):
        self.apply(action='add', name='bdm', path=str(self.folder))
        preview = c.root_manager(self.a, action='rename', name='bdm', new='new')
        run = subprocess.run([sys.executable, str(self.nav), 'bdm', 'tag', 'add', 'science'], capture_output=True, text=True)
        self.assertEqual(run.returncode, 0, run.stderr)
        with self.assertRaisesRegex(ValueError, 'changed since preview'):
            c.root_manager(self.a, action='rename', name='bdm', new='new', apply=True, token=preview['token'])
        self.assertIn('science', self.registry.read_text())

    def test_retired_names_stay_reserved(self):
        self.apply(action='add', name='bdm', path=str(self.folder))
        self.apply(action='remove', name='bdm')
        self.assertEqual(c.resolve(self.b, 'bdm:code.py'), self.folder/'code.py')
        self.assertNotIn('bdm', c.roots(self.b, active=True))
        with self.assertRaises(ValueError):
            self.apply(action='add', name='bdm', path=str(self.a))

    def test_duplicate_registry_rejected(self):
        self.registry.write_text('bdm|'+str(self.a)+'|\nbdm|'+str(self.b)+'|\n')
        with self.assertRaisesRegex(ValueError, 'Duplicate'):
            c.root_manager(self.a)

    def test_api_uses_same_registry(self):
        req = dict(action='add', name='fromcli', path=str(self.folder))
        def call(args):
            run = subprocess.run([sys.executable, str(self.nav), 'api'], input=json.dumps(args), capture_output=True, text=True)
            self.assertEqual(run.returncode, 0, run.stdout+run.stderr)
            return json.loads(run.stdout)['result']
        plan = call(req)
        call({**req, 'apply': True, 'token': plan['token']})
        self.assertEqual(c.resolve(self.b, 'fromcli:code.py'), self.folder/'code.py')

    def test_migration_rolls_back_if_local_cleanup_fails(self):
        cp = self.a/'.code-links.json'
        before = json.dumps({'roots': {'bdm': str(self.folder)}, 'other': 'keep'})
        cp.write_text(before)
        module = c.nav_registry()
        plan = module.manager(self.a, action='migrate')
        original = module.write_text
        def fail_cleanup(path, value):
            if path == cp:
                raise OSError('Simulated interrupted local write')
            return original(path, value)
        with patch.object(module, 'write_text', side_effect=fail_cleanup):
            with self.assertRaises(OSError):
                module.manager(self.a, action='migrate', apply=True, token=plan['token'])
        self.assertFalse(self.registry.exists())
        self.assertEqual(cp.read_text(), before)

    def test_same_directory_through_symlink_is_duplicate(self):
        self.apply(action='add', name='bdm', path=str(self.folder))
        link = self.base/'alias-to-data'; link.symlink_to(self.folder)
        with self.assertRaisesRegex(ValueError, 'already has a shared alias'):
            self.apply(action='add', name='other', path=str(link))

    def test_terminal_rename_preserves_tags_and_old_links(self):
        self.apply(action='add', name='bdm', path=str(self.folder))
        self.apply(action='tags', name='bdm', tags=['research'])
        run = subprocess.run([sys.executable, str(self.nav), 'bdm', 'change'],
                             input='ceria\n\ny\n', text=True, capture_output=True)
        self.assertEqual(run.returncode, 0, run.stderr)
        items = c.root_manager(self.b)['items']
        self.assertEqual(next(x for x in items if x['name']=='ceria')['tags'], ['research'])
        self.assertEqual(c.resolve(self.b, 'bdm:code.py'), self.folder/'code.py')


if __name__ == '__main__':
    unittest.main()
