import {test} from 'node:test';
import assert from 'node:assert/strict';
import {finderLayout,finderQuery,folderLabels,rankFiles,pathLabel,previewExcerpt,FinderEntry,Fuzzy} from '../src/finder-model';
function entry(path:string,recent=999):FinderEntry {const filename=path.split('/').pop()!,extension=filename.split('.').pop()!;return {path,name:filename.slice(0,-extension.length-1),extension:extension.toLowerCase(),folder:path.slice(0,-filename.length),mtime:0,recent,aliases:[]};}
function fuzzy(query:string):Fuzzy{return text=>{const i=text.toLowerCase().indexOf(query.toLowerCase());return i<0?null:{score:-i,matches:[[i,i+query.length]]};};}
test('default paper search excludes all associated images; type tokens opt in',()=>{
 const all=[entry('one/Toward a consistent prediction.md'),entry('two/Toward a consistent prediction.PDF'),...Array.from({length:200},(_,i)=>entry(`Toward a consistent/images/${i}.jpg`))];
 assert.equal(rankFiles(all,'documents',[],'toward a consistent',fuzzy('toward a consistent')).length,2);
 const q=finderQuery('.jpg toward a consistent');assert.deepEqual(q,{text:'toward a consistent',extensions:['jpg']});assert.equal(rankFiles(all,'documents',q.extensions,q.text,fuzzy(q.text)).length,200);
});
test('filename beats alias and parent paths; recency resolves ties',()=>{
 const a=entry('a/ceria.md',2),b=entry('b/ceria.md',0),alias=entry('notes/other.md');alias.aliases=['ceria'];const path=entry('ceria/index.md');
 const results=rankFiles([path,alias,a,b],'documents',[],'ceria',fuzzy('ceria'));
 assert.deepEqual(results.map(m=>m.entry.path),[b.path,a.path,alias.path,path.path]);assert.equal(results[2].alias,'ceria');assert.deepEqual(results[3].pathRanges,[[0,5]]);
});
test('recent files lead empty search, and duplicate names remain separate',()=>{
 const all=[entry('a/x.md',3),entry('b/x.md',0),entry('c/y.pdf',1)];assert.deepEqual(rankFiles(all,'documents',[],'',null).map(m=>m.entry.path),['b/x.md','c/y.pdf','a/x.md']);
});
test('layout adapts from narrow split view to desktop without horizontal overflow',()=>{
 for(const w of [240,375,559,560,800,1280,1440])for(const size of [60,100,200]){const l=finderLayout(w,size);assert(l.cardWidth>0);assert(l.columns*l.cardWidth+(l.columns-1)*14<=w+.001);assert.equal(l.compact,w<560);assert(l.stride>l.height);}
});
test('paths retain branch context and preview excerpts omit executable fences and embeds',()=>{
 const path='Papers/Computational Architecture/'+('deep/'.repeat(20))+'pdfs/';assert(pathLabel(path).startsWith('Papers/Computational'));assert(pathLabel(path).endsWith('pdfs/'));
 const out=previewExcerpt('---\naliases: secret\n---\n# Title\n```dataviewjs\ndanger()\n```\n![[huge.md]]\n![x](huge.png)\nTerm $x^2$.');assert(!out.includes('danger'));assert(!out.includes('huge'));assert(!out.includes('secret'));assert(out.includes('$x^2$'));
});
test('50,000 file fixture keeps document selection correct',()=>{
 const all=Array.from({length:50000},(_,i)=>entry(`data/paper ${i}.${i%20===0?'md':'json'}`));
 const started=performance.now();const matches=rankFiles(all,'documents',[],'paper',fuzzy('paper'));assert.equal(matches.length,2500);console.log('50k metadata search:',Math.round(performance.now()-started),'ms');
});

test('same paper names expose the differing branch, even under a common fixture root',()=>{
 const entries=[entry('Fixture/Papers/DFT method/markdown_originals/Paper/Paper.md'),entry('Fixture/Papers/Computational Architecture/markdown_originals/Paper/Paper.md')];
 const labels=folderLabels(entries);assert(labels.get(entries[0].path)!.startsWith('…/DFT method/'));assert(labels.get(entries[1].path)!.startsWith('…/Computational Architecture/'));assert(!labels.get(entries[0].path)!.endsWith('/Paper/'));
});

test('math inequalities survive miniature excerpts',()=>{assert.equal(previewExcerpt('$a<b$ and $c>d$'),'$a<b$ and $c>d$');assert.equal(previewExcerpt('<script>bad()</script> $a<b$'),' $a<b$');});
