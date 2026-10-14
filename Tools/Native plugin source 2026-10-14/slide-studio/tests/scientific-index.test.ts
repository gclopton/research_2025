import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ScientificDocumentIndex} from '../src/scientific-index';
import {newScientific,scientificSource,parseScientific} from '../src/scientific-core';

test('184 panels share one read and parse; prose edits reuse YAML and update positions',async()=>{
 let parses=0,reads=0;const index=new ScientificDocumentIndex(8,(...args)=>{parses++;return parseScientific(...args);});
 const figures=Array.from({length:184},()=>newScientific('figure'));
 const raw=figures.map(scientificSource).join('\n\n');
 const all=await Promise.all(figures.map(()=>index.read('note',async()=>{reads++;return raw;})));
 assert.equal(reads,1);assert.equal(parses,184);assert.ok(all.every(result=>result===all[0]));
 const next=index.get('note','New paragraph\n\n'+raw);
 assert.equal(parses,184);assert.equal(next.blocks[0].line,2);assert.equal(next.blocks[0].from,15);
 assert.deepEqual([...next.numbers],[...all[0].numbers]);
});
test('same-length changes, reorder, removal, numbering toggles, and table edits invalidate correctly',()=>{
 const index=new ScientificDocumentIndex();const a=newScientific('figure'),b=newScientific('figure'),t=newScientific('table');
 a.title='One';let raw=[a,b,t].map(scientificSource).join('\n');
 index.get('note',raw);a.title='Two';b.numbered=false;
 raw=[t,b,a].map(scientificSource).join('\n');const next=index.get('note',raw);
 assert.equal(next.blocks[2].value.title,'Two');assert.equal(next.numbers.get(a.id),'1');assert.equal(next.numbers.has(b.id),false);assert.equal(next.numbers.get(t.id),'1');
 const removed=index.get('note',scientificSource(b));assert.equal(removed.numbers.size,0);assert.equal(removed.blocks.length,1);
});
test('malformed blocks can be repaired; fences and CRLF preserve source positions',()=>{
 const index=new ScientificDocumentIndex();const f=scientificSource(newScientific('figure'));const bad=f.replace('numbered: true','numbered: nope');
 assert.equal(index.get('note',bad).blocks.length,0);
 const raw=('Prose\n\n````markdown\n'+f+'\n````\n'+f).replace(/\n/g,'\r\n');
 const good=index.get('note',raw);assert.equal(good.blocks.length,1);
 assert.equal(raw.slice(0,good.blocks[0].from).split('\n').length-1,good.blocks[0].line);
 assert.equal(raw.slice(good.blocks[0].from,good.blocks[0].to),f.replace(/\n/g,'\r\n'));
});
test('failed reads are retryable and document retention is bounded',async()=>{
 let count=0;const index=new ScientificDocumentIndex(1,(...args)=>{count++;return parseScientific(...args);});const raw=scientificSource(newScientific('figure'));
 await assert.rejects(index.read('note',async()=>{throw Error('read failed');}));
 await index.read('note',async()=>raw);index.get('other',raw);index.get('note',raw);assert.equal(count,3);
 index.clear();index.get('note',raw);assert.equal(count,4);
});
test('a save during an in-flight read cannot publish stale numbering',async()=>{
 const index=new ScientificDocumentIndex(),a=newScientific('figure'),b=newScientific('figure');
 let release!:(raw:string)=>void;let calls=0;
 const load=()=>++calls===1?new Promise<string>(r=>release=r):Promise.resolve([b,a].map(scientificSource).join('\n'));
 const old=index.read('note',load);await Promise.resolve();index.invalidate('note');
 const fresh=index.read('note',load);release(scientificSource(a));
 const [first,last]=await Promise.all([old,fresh]);assert.equal(first,last);assert.equal(first.numbers.get(a.id),'2');assert.equal(calls,2);
});
test('buffer and disk variants reuse YAML without displacing each other',async()=>{
 let parses=0;const index=new ScientificDocumentIndex(8,(...a)=>{parses++;return parseScientific(...a);});
 const raw=scientificSource(newScientific('figure'));const disk=await index.read('note',async()=>raw);
 const buffer=index.get('note','Unsaved prose\n'+raw);
 assert.equal((await index.read('note',async()=>raw)),disk);assert.equal(index.get('note','Unsaved prose\n'+raw),buffer);assert.equal(parses,1);
});
