import {test} from 'node:test';
import assert from 'node:assert/strict';
import {QuestionIndex} from '../src/question-index';
import {template} from '../src/model';
const raw=(id:string)=>template('blank',id,id);
function fixture(){const files=new Map([['a.md',raw('a')],['b.md',raw('b')]]);let reads=0;const index=new QuestionIndex({paths:()=>[...files.keys()],read:async p=>{reads++;return files.get(p);}});return {files,index,reads:()=>reads};}
test('concurrent initialization shares reads; warm lookups read nothing; one edit reads one file',async()=>{
 const f=fixture();await Promise.all([f.index.find('a'),f.index.find('b'),f.index.all()]);assert.equal(f.reads(),2);
 for(let i=0;i<100;i++)await f.index.find('a');assert.equal(f.reads(),2);
 f.files.set('a.md',raw('new'));f.index.invalidate('a.md');assert.equal((await f.index.find('new')).definition.id,'new');assert.equal(f.reads(),3);await assert.rejects(f.index.find('a'),/not found/);
});
test('create, delete, file rename, and folder rename remove obsolete index entries',async()=>{
 const f=fixture();await f.index.all();f.files.set('c.md',raw('c'));f.index.invalidate('c.md');assert.equal((await f.index.all()).length,3);
 f.files.delete('a.md');f.index.invalidate('a.md');await assert.rejects(f.index.find('a'),/not found/);
 f.files.set('folder/b.md',f.files.get('b.md')!);f.files.delete('b.md');f.index.invalidate('b.md');f.index.invalidate('folder/b.md');assert.equal((await f.index.find('b')).path,'folder/b.md');
 f.files.set('other/b.md',f.files.get('folder/b.md')!);f.files.delete('folder/b.md');f.index.invalidatePrefix('folder');f.index.discover();assert.equal((await f.index.find('b')).path,'other/b.md');
});
test('duplicate and malformed definitions fail visibly and recover when fixed',async()=>{
 const f=fixture();await f.index.all();f.files.set('b.md',raw('a'));f.index.invalidate('b.md');await assert.rejects(f.index.find('a'),/Duplicate/);
 f.files.set('b.md','broken');f.index.invalidate('b.md');await assert.rejects(f.index.all(),/b.md/);
 f.files.set('b.md',raw('b'));f.index.invalidate('b.md');assert.equal((await f.index.all()).length,2);
});
test('an edit or delete during a pending read cannot resurrect stale results',async()=>{
 let release!:()=>void;let calls=0;let value:string|undefined=raw('old');
 const index=new QuestionIndex({paths:()=>['a.md'],read:async()=>{const snapshot=value;if(++calls===1)await new Promise<void>(r=>release=r);return snapshot;}});
 const reading=index.all();value=raw('new');index.invalidate('a.md');release();assert.equal((await reading)[0].definition.id,'new');assert.equal(calls,2);
 value=undefined;index.invalidate('a.md');assert.equal((await index.all()).length,0);
});
test('late metadata discovery adds previously unknown questions without rereading known files',async()=>{
 const f=fixture();await f.index.all();f.files.set('late.md',raw('late'));f.index.discover();assert.equal((await f.index.find('late')).path,'late.md');assert.equal(f.reads(),3);
});
test('explicitly authored chapter question is available before discovery metadata arrives',async()=>{const files=new Map<string,string>(),index=new QuestionIndex({paths:()=>[],read:async p=>files.get(p)});await index.ready();const path='Course/Chapter/Questions/new.md';files.set(path,raw('created'));index.invalidate(path);await index.ready();assert.equal((await index.find('created')).path,path);});
