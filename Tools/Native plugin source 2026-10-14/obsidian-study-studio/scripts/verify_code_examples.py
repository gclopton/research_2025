"""Execute only checked-in, synthetic reference programs during development.
This is not part of the plugin and never executes learner responses.
"""
import json,subprocess,tempfile,sys
from pathlib import Path
root=Path(__file__).resolve().parents[1]
examples=json.loads((root/'tests/fixtures/code-reference-programs.json').read_text())
python=Path('/Users/gradyclopton/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3')
expected={'code-shell-quoting':'lecture notes.txt','code-shell-loop':'alpha\nbeta','code-shell-pipeline':'run-12\nrun-3','code-shell-status':'ok','code-wolfram-pattern':'25','code-wolfram-map':'{1, 4, 9}','code-wolfram-table':'{{2, 3, 4}, {3, 4, 5}}','code-wolfram-replace':'10'}
count=0
with tempfile.TemporaryDirectory(prefix='study-code-reference-') as directory:
 p=Path(directory)
 for e in examples:
  for i,source in enumerate([e['source'],*e['alternatives']]):
   language=e['language']
   if language=='python':command=[str(python),'-c',source]
   elif language=='bash':command=['/bin/bash','-c',source]
   elif language=='mathematica':
    script=p/'reference.wls';script.write_text(source);command=['/Applications/Wolfram.app/Contents/MacOS/wolframscript','-file',str(script)]
   else:
    script=p/'reference.cpp';script.write_text(source);binary=p/'reference';subprocess.run(['/usr/bin/clang++','-std=c++17',str(script),'-o',str(binary)],check=True,capture_output=True,text=True);command=[str(binary)]
   result=subprocess.run(command,check=True,capture_output=True,text=True,timeout=60)
   if e['id'] in expected:assert result.stdout.strip()==expected[e['id']],(e['id'],result.stdout,result.stderr)
   count+=1
  print(e['id'],'passed',flush=True)
print(f'{count} reference programs/alternatives passed. No learner responses executed.')
