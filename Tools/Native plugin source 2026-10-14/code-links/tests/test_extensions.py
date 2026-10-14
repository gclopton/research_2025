import unittest,tempfile,sys,json,os
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'core'))
import code_links as c
class Extensions(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.root=Path(self.tmp.name);(self.root/'.code-links.json').write_text('{}');self.env=patch.dict(os.environ,{'NAV_REGISTRY':str(self.root/'aliases.psv')});self.env.start();self.p=self.root/'source.py';self.p.write_text(''.join(f'line {n}\n' for n in range(1,51)))
 def tearDown(self):self.env.stop();self.tmp.cleanup()
 def test_multiple_and_navigation(self):
  r=c.excerpt(self.root,'!{{source.py#L2-L4,L20-L21}}');self.assertEqual(r['line_numbers'],[2,3,4,None,20,21]);self.assertEqual(r['lines'][-1],'line 21')
  for raw in ['{{source.py#L3-L8,L7-L10}}','{{source.py#L20,L5}}']:
   with self.assertRaises(ValueError):c.parse(raw)
 def test_tracking_multiple_rename_shift(self):
  r=c.make_anchor(self.root,'!{{source.py#L2-L4,L20-L21}}{height=6}')
  self.p.write_text('prefix\n'+self.p.read_text());a=c.excerpt(self.root,r['link']);self.assertEqual(a['line_numbers'],[3,4,5,None,21,22]);self.assertEqual(a['link']['height'],6)
  c.rename(self.root,'source.py','new.py',True);a=c.excerpt(self.root,r['link']);self.assertTrue(a['path'].endswith('new.py'))
 def test_regex(self):
  spec=dict(pattern=r'^line [23]0$',before=1,after=1,occurrence='all')
  r=c.selection(self.root,'!{{source.py}}',spec,True);self.assertEqual(r['line_numbers'],[19,20,21,None,29,30,31]);self.assertEqual(c.excerpt(self.root,r['new_link'])['lines'],r['lines'])
  spec['occurrence']='last';self.assertEqual(c.selection(self.root,'{{source.py}}',spec)['start'],29)
  spec['occurrence']='first';self.assertEqual(c.selection(self.root,'{{source.py}}',spec)['end'],21)
  spec['pattern']='absent'
  with self.assertRaisesRegex(ValueError,'No matching'):c.selection(self.root,'{{source.py}}',spec)
 def test_regex_stale_launch(self):
  r=c.selection(self.root,'!{{source.py}}',dict(pattern='line 5$',before=0,after=0,occurrence='all'),True)
  self.p.write_text('changed\n')
  with self.assertRaises(ValueError):c.launch(self.root,r['new_link'],5,expected_signature=r['signature'])
 def test_scenes(self):
  for ext,app in [('.vesta','VESTA'),('.blend','Blender')]:
   (self.root/('view'+ext)).write_bytes(b'\0binary')
   r=c.excerpt(self.root,'{{view'+ext+'}}');self.assertEqual(r['application'],app)
   with self.assertRaises(ValueError):c.excerpt(self.root,'!{{view'+ext+'#L1}}')
   with patch.object(c.subprocess,'run') as run:
    c.launch(self.root,'{{view'+ext+'}}');self.assertEqual(run.call_args.args[0][-1],str((self.root/('view'+ext)).resolve()))
 def test_data_uses_system_default(self):
  for ext in ('.csv','.tsv'):
   p=self.root/('values'+ext);p.write_text('site,value\nCe1,0.968\n')
   with patch.object(c.subprocess,'run') as run:
    result=c.launch(self.root,'{{values'+ext+'}}')
    self.assertEqual(result['opened'],'default application')
    run.assert_called_once_with(['/usr/bin/open',str(p.resolve())],check=True,capture_output=True)
 def test_data_source_action_still_uses_neovim(self):
  p=self.root/'values.csv';p.write_text('site,value\nCe1,0.968\n')
  with patch.object(c,'atomic',side_effect=RuntimeError('Neovim request reached')):
   for raw,action in [('{{values.csv}}','source'),('{{values.csv#L2}}','auto')]:
    with self.assertRaisesRegex(RuntimeError,'Neovim request reached'):
     c.launch(self.root,raw,action=action)
 def test_regex_timeout(self):
  import subprocess
  with patch.object(c.subprocess,'run',side_effect=subprocess.TimeoutExpired('regex',8)):
   with self.assertRaisesRegex(ValueError,'8 seconds'):c.bounded_regex(self.p,dict(pattern='x'))
if __name__=='__main__':unittest.main()
