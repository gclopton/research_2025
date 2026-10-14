import {test} from 'node:test';import assert from 'node:assert/strict';
import {readRecords,writeRecords,findPassage,recordURI,sameKeys,validateSelection,digest} from '../src/evidence-records';
const records={version:1 as const,claims:{claim:{label:'Example',papers:[{citekey:'paper',label:'Paper',path:'Papers/a.md',selections:[{quote:'shown here',color:'#123456',darkColor:'#abcdef'}]}]}}};
test('human readable records round trip colors and occurrence identities',()=>{assert.deepEqual(readRecords(writeRecords(records)),records);const uri=new URL(recordURI('papers vault','Evidence/22T.yaml','claim',['a','b']));assert.equal(uri.searchParams.get('keys'),'a|b');assert.ok(!uri.href.includes('+'));});
test('duplicate IDs, duplicate papers, path escapes and empty targets fail',()=>{assert.throws(()=>readRecords('version: 1\nclaims:\n  a: 1\n  a: 2'));for(const path of ['../a.md','/a.md','file:a.md']){const r=structuredClone(records);r.claims.claim.papers[0].path=path;assert.throws(()=>readRecords(writeRecords(r)));}const r=structuredClone(records);r.claims.claim.papers.push(r.claims.claim.papers[0]);assert.throws(()=>readRecords(writeRecords(r)));});
test('context selects repeated text without fuzzy matching',()=>{assert.equal(findPassage('first quote second quote',{quote:'quote'}),null);assert.deepEqual(findPassage('first quote second quote',{quote:'quote',before:'second'}),{from:19,to:24});assert.equal(findPassage('first Quote',{quote:'quote'}),null);assert.ok(sameKeys(['b','a'],['a','b']));assert.ok(!sameKeys(['a'],['a','b']));});
test('area integrity, bounds and cell addresses are mandatory',async()=>{const sha256=await digest('figure');validateSelection({image:'figure.png',whole:true,sha256,color:'#cc8800'});assert.throws(()=>validateSelection({image:'figure.png',whole:true}));assert.throws(()=>validateSelection({table:1,cells:[[0,1]],sha256}));assert.throws(()=>validateSelection({image:'figure.png',rect:[.9,0,.5,1],sha256}));assert.throws(()=>validateSelection({quote:'ok',color:'red;display:none'}));});
import {tableSources,renderablePaper} from '../src/evidence-records';
test('OCR tables render with a separate caption without changing evidence source',()=>{const raw='Caption\n| Name | Value |\n| :--- | ---: |\n| A | 12 |\n';assert.equal(tableSources(raw).length,1);assert.ok(renderablePaper(raw).startsWith('Caption\n\n|'));assert.equal(tableSources(raw)[0],tableSources(renderablePaper(raw))[0]);});
import {linkedEvidence} from '../src/evidence-records';
test('fallback hiding requires an adjacent citation with exactly matching keys',()=>{
 const href=recordURI('papers','Evidence/22T.yaml','one',['a','b']);
 const text=`Claim [@a; @b] [evidence](${href})`;
 assert.equal(linkedEvidence(text).length,1);
 assert.equal(text.slice(linkedEvidence(text)[0].from,linkedEvidence(text)[0].to),`[evidence](${href})`);
 assert.equal(linkedEvidence(`[@a] [evidence](${href})`).length,0);
 assert.equal(linkedEvidence(`[@a; @b] unrelated text [evidence](${href})`).length,0);
 assert.equal(linkedEvidence(`${text}. Another ${text}`).length,2);
});

test('partially empty table rows are not mistaken for delimiter rows',()=>{
 const raw='Caption\n| Model | Value |\n| --- | --- |\n| First | 2 |\n| Second | 3 |\n| | -0.3% |\n| | 1.6% |\n';
 assert.equal(renderablePaper(raw),raw.replace('Caption\n','Caption\n\n'));
});
