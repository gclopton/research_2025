import unittest,tempfile,sys,os
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'core'))
import code_links as c
class NewLinks(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.root=Path(self.tmp.name).resolve();self.env=patch.dict(os.environ,{'NAV_REGISTRY':str(self.root/'aliases.psv')});self.env.start()
 def tearDown(self):self.env.stop();self.tmp.cleanup()
 def test_creation_and_resolution(self):
  r=c.inspect_link(self.root,'{{hello.py}}');self.assertFalse(r['exists']);self.assertEqual(r['path'],str(self.root/'scripts/hello.py'));self.assertFalse((self.root/'scripts').exists())
  c.create_file(self.root,'{{hello.py}}');p=c.resolve(self.root,'hello.py',True);p.write_text('preserve')
  c.create_file(self.root,'{{hello.py}}');self.assertEqual(p.read_text(),'preserve')
  c.create_file(self.root,'{{./root.py}}');self.assertTrue((self.root/'root.py').exists())
 def test_invalid_creation(self):
  for raw in ['{{../escape.py}}','{{/tmp/escape.py}}','{{x.py#L1}}','!{{x.py}}','{{x.blend}}','{{blank:a}}','{{bad.exe}}']:
   with self.assertRaises(ValueError):c.create_file(self.root,raw)
  (self.root/'scripts').symlink_to('/tmp',target_is_directory=True)
  with self.assertRaises(ValueError):c.create_file(self.root,'{{escape.py}}')
 def test_alias_and_directory(self):
  (self.root/'code').mkdir();(self.root/'aliases.psv').write_text('demo|'+str(self.root/'code')+'\n')
  c.create_file(self.root,'{{demo:x.wls}}');self.assertTrue((self.root/'code/x.wls').exists())
  r=c.excerpt(self.root,'``dir:demo:.|Code``');self.assertEqual(r['path'],str(self.root/'code'));self.assertTrue(r['directory'])
  with patch.object(c.subprocess,'run') as run:
   c.launch(self.root,'{{dir:demo:.}}',action='finder');self.assertEqual(run.call_args.args[0],['/usr/bin/open',str(self.root/'code')])
 def test_wolfram(self):
  for ext in ['wl','wls','nb']:
   raw='{{test.'+ext+'}}';c.create_file(self.root,raw)
   with patch.object(c.subprocess,'run') as run:
    c.launch(self.root,raw);self.assertEqual(run.call_args.args[0][2],'/Applications/Wolfram.app')
  self.assertTrue((self.root/'scripts/test.nb').read_text().startswith('Notebook['))
  with patch.object(c,'CACHE',self.root/'cache'),patch.object(c.subprocess,'run') as run:
   c.launch(self.root,'{{test.wls}}',action='run');script=next((self.root/'cache').glob('*.command')).read_text();self.assertIn('wolframscript',script);self.assertIn(' -file ',script)
 def test_group_rename(self):
  c.create_file(self.root,'{{a.py}}');note=self.root/'note.md';note.write_text('{{links:Evidence|{{a.py|Code}}; [[other]]; {{scripts/a.py#L1}}}}')
  c.rename(self.root,'scripts/a.py','scripts/b.py',True)
  self.assertEqual(note.read_text(),'{{links:Evidence|{{scripts/b.py|Code}}; [[other]]; {{scripts/b.py#L1}}}}')
