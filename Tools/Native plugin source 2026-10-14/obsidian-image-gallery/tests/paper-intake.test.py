import importlib.util, pathlib, tempfile, json, hashlib, subprocess, sys, unittest
SCRIPT=pathlib.Path(__file__).resolve().parents[1]/'scripts/paper-library.py'
class Intake(unittest.TestCase):
 def test_existing_source_reused_and_second_conversion_refused(self):
  with tempfile.TemporaryDirectory() as temp:
   v=pathlib.Path(temp);(v/'Papers/.library').mkdir(parents=True);pdf=v/'Papers/paper.pdf';pdf.write_bytes(b'%PDF-1.4\nsynthetic');md=v/'Papers/paper.md';md.write_text('Paper');other=v/'Papers/other.md';other.write_text('Other')
   c={'schema':1,'revision':1,'sources':{'s':{'title':'Paper','pdf':{'path':'Papers/paper.pdf','sha256':hashlib.sha256(pdf.read_bytes()).hexdigest(),'bytes':pdf.stat().st_size},'conversion':{'path':'Papers/paper.md'}}},'libraries':{'a':{'title':'A','parent':None},'b':{'title':'B','parent':None}},'memberships':[{'source':'s','library':'a'}]};catalog=v/'Papers/.library/catalog.json';catalog.write_text(json.dumps(c))
   def run(*args):return subprocess.run([sys.executable,str(SCRIPT),'--vault',str(v),*args],capture_output=True,text=True)
   self.assertEqual(run('import',str(pdf),'--library','b').returncode,0);after=json.loads(catalog.read_text());self.assertEqual(len(after['sources']),1);self.assertEqual(len(after['memberships']),2)
   self.assertNotEqual(run('register-conversion','s','Papers/other.md').returncode,0);self.assertEqual(json.loads(catalog.read_text()),after)
   self.assertEqual(run('convert','s').returncode,0);self.assertEqual(list((v/'Papers').glob('*.pdf')),[pdf])
   (v/'Papers/copy.pdf').write_bytes(pdf.read_bytes());self.assertNotEqual(run('check').returncode,0)
 def test_moved_paper_root_uses_stable_catalog(self):
  with tempfile.TemporaryDirectory() as temp:
   v=pathlib.Path(temp);(v/'.paper-library').mkdir();folder=v/'Research/References';folder.mkdir(parents=True);pdf=folder/'paper.pdf';pdf.write_bytes(b'%PDF-1.4 synthetic')
   c={'schema':1,'revision':1,'sourceRoot':'Research/References','sources':{'s':{'title':'Paper','pdf':{'path':'Research/References/paper.pdf','sha256':hashlib.sha256(pdf.read_bytes()).hexdigest(),'bytes':pdf.stat().st_size}}},'libraries':{'a':{'title':'A','parent':None}},'memberships':[{'source':'s','library':'a'}]};(v/'.paper-library/catalog.json').write_text(json.dumps(c))
   def run(*a):return subprocess.run([sys.executable,str(SCRIPT),'--vault',str(v),*a],capture_output=True,text=True)
   self.assertEqual(run('check').returncode,0)
   new=v/'Download.pdf';new.write_bytes(b'%PDF-1.4 different synthetic')
   result=run('import',str(new),'--library','a');self.assertEqual(result.returncode,0,result.stderr)
   after=json.loads((v/'.paper-library/catalog.json').read_text());self.assertEqual(len(after['sources']),2)
   added=[s for i,s in after['sources'].items() if i!='s'][0];self.assertTrue(added['pdf']['path'].startswith('Research/References/Sources/'));self.assertFalse((v/'Papers').exists())
if __name__=='__main__':unittest.main()
