import unittest,tempfile,sys,json,os,time
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'core'))
import code_links as c
class Core(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.root=Path(self.tmp.name);(self.root/'.code-links.json').write_text('{}');self.env=patch.dict(os.environ,{'NAV_REGISTRY':str(self.root/'aliases.psv')});self.env.start();self.p=self.root/'a.py';self.p.write_text('α = 1\nprint(α)\n# end\n')
 def tearDown(self):self.env.stop();self.tmp.cleanup()
 def test_root_manager(self):
  def apply(**args):
   preview=c.root_manager(self.root,**args)
   return c.root_manager(self.root,**args,apply=True,token=preview['token'])
  apply(action='add',name='campaign',path=str(self.root))
  self.assertEqual(c.resolve(self.root,'campaign:a.py'),self.p.resolve())
  (self.root/'note.md').write_text('{{campaign:a.py|Code}}')
  anchored=c.make_anchor(self.root,'{{campaign:a.py#L1-L2|Evidence}}')['link']
  (self.root/'evidence.md').write_text(anchored)
  preview=c.root_manager(self.root,action='rename',name='campaign',new='bdm')
  apply(action='tags',name='campaign',tags=['test'])
  with self.assertRaises(ValueError):c.root_manager(self.root,action='rename',name='campaign',new='bdm',apply=True,token=preview['token'])
  apply(action='rename',name='campaign',new='bdm')
  self.assertIn('campaign:',(self.root/'note.md').read_text())
  self.assertEqual(c.resolve(self.root,'bdm:a.py'),c.resolve(self.root,'campaign:a.py'))
  self.assertEqual(c.excerpt(self.root,(self.root/'evidence.md').read_text())['lines'],['α = 1','print(α)'])
  apply(action='retire',name='bdm')
  self.assertNotIn('bdm',c.roots(self.root,active=True))
  self.assertEqual(c.resolve(self.root,'campaign:a.py'),self.p.resolve())
  apply(action='restore',name='bdm')
  self.assertIn('bdm',c.roots(self.root,active=True))
  with self.assertRaises(ValueError):c.root_manager(self.root,action='add',name='duplicate',path=str(self.root))
  with self.assertRaises(ValueError):c.root_manager(self.root,action='add',name='../bad',path=str(self.root))
  with self.assertRaises(ValueError):c.root_manager(self.root,action='add',name='missing',path='/definitely-not-a-directory')
 def test_parse(self):
  l=c.parse('!{{a.py#L2-L3|small alias}}{height=10}');self.assertEqual((l['start'],l['end'],l['height'],l['embed']),(2,3,10,True))
  for raw in ['{{a.py#L4-L2}}','{{a.py]]','{{a.py#L0}}','{{a.py#L1-L50000}}']:
   with self.assertRaises(ValueError):c.parse(raw)
 def test_range(self):
  r=c.excerpt(self.root,'{{a.py#L1-L2}}');self.assertEqual(r['lines'],['α = 1','print(α)']);self.assertIn('untracked',r['status'])
  with self.assertRaises(ValueError):c.excerpt(self.root,'{{a.py#L2-L8}}')
 def test_escape_binary_markdown(self):
  for p in ['../x.py','/etc/passwd']:
   with self.assertRaises(ValueError):c.resolve(self.root,p)
  (self.root/'x.md').write_text('note')
  with self.assertRaises(ValueError):c.resolve(self.root,'x.md',True)
  (self.root/'b.txt').write_bytes(b'\x00binary\n')
  with self.assertRaises(ValueError):c.excerpt(self.root,'{{b.txt#L1}}')
 def test_anchor_move_change_ambiguity(self):
  raw=c.make_anchor(self.root,'{{a.py#L1-L2|evidence}}')['link']
  self.p.write_text('# prepend\nα = 1\nprint(α)\n# end\n')
  r=c.excerpt(self.root,raw);self.assertEqual(r['start'],2);self.assertEqual(r['status'],'verified-relocated')
  self.p.write_text('α = 1\nprint(α)\nα = 1\nprint(α)\n')
  with self.assertRaisesRegex(ValueError,'Ambiguous'):c.excerpt(self.root,raw)
  self.p.write_text('different\n')
  with self.assertRaisesRegex(ValueError,'changed or disappeared'):c.excerpt(self.root,raw)
 def test_rename(self):
  raw=c.make_anchor(self.root,'{{a.py#L1-L2}}')['link'];note=self.root/'notes.md';note.write_text('See '+raw+' and {{a.py|alias}}')
  c.rename(self.root,'a.py','b.py',True)
  self.assertFalse(self.p.exists());self.assertIn('{{b.py|alias}}',note.read_text());self.assertEqual(c.excerpt(self.root,raw)['lines'][0],'α = 1')
 def test_index(self):
  (self.root/'node_modules').mkdir();(self.root/'node_modules/hidden.py').write_text('x')
  (self.root/'folder').mkdir();(self.root/'folder/a.py').write_text('x')
  files=c.index(self.root)['items'];names=[x['target'] for x in files]
  self.assertIn('a.py',names);self.assertIn('folder/a.py',names);self.assertNotIn('node_modules/hidden.py',names)
 def test_comment_only_refactor(self):
  self.p.write_text('# {{a.py|self}}\ns = "{{a.py|literal}}"\n')
  js=self.root/'test.js';js.write_text('// {{a.py|ref}}\nconst x="{{a.py|literal}}";\n')
  note=self.root/'note.md';note.write_text('{{a.py|yes}}\n`{{a.py|literal}}`\n```\n{{a.py|example}}\n```')
  c.rename(self.root,'a.py','b.py',True)
  self.assertIn('# {{b.py|self}}',(self.root/'b.py').read_text());self.assertIn('"{{a.py|literal}}"',(self.root/'b.py').read_text())
  self.assertIn('// {{b.py|ref}}',js.read_text());self.assertIn('"{{a.py|literal}}"',js.read_text())
  self.assertIn('{{b.py|yes}}',note.read_text());self.assertIn('`{{a.py|literal}}`',note.read_text())
 def test_already_moved_and_cached_backlinks(self):
  note=self.root/'note.md';note.write_text('{{a.py|yes}}')
  for _ in range(2):self.assertEqual(len(c.backlinks(self.root,'a.py')),1)
  self.p.rename(self.root/'b.py');c.rename(self.root,'a.py','b.py',True,True)
  self.assertEqual(note.read_text(),'{{b.py|yes}}');self.assertEqual(len(c.backlinks(self.root,'a.py')),0)
 def test_large_warm_read(self):
  self.p.write_text(''.join(f'{i} α\n' for i in range(1,200001)))
  for _ in range(2):self.assertEqual(c.excerpt(self.root,'{{a.py#L150000-L150010}}')['lines'][0],'150000 α')
 def test_long_line(self):
  self.p.write_text('x'*(c.MAX_LINE+1))
  with self.assertRaises(ValueError):c.excerpt(self.root,'{{a.py#L1}}')
if __name__=='__main__':unittest.main()
