import test from 'node:test';
import assert from 'node:assert/strict';
import type {App} from 'obsidian';
import {imageFolder,importPromptImage} from '../src/image-import';
function vault(){const files=new Map<string,unknown>([['Courses/Test/Chapter/Chapter.md',{}]]);const app={vault:{getAbstractFileByPath:(path:string)=>files.get(path),createFolder:async(path:string)=>{files.set(path,{});},createBinary:async(path:string,data:ArrayBuffer)=>{assert.ok(!files.has(path));files.set(path,new Uint8Array(data));return {path};}}} as unknown as App;return {app,files};}
test('pasted and dropped image files use nearest chapter figures and unique names',async()=>{
 const {app,files}=vault();assert.equal(await imageFolder(app,'Courses/Test/Chapter/Questions/Q.md'),'Courses/Test/Chapter/figures');
 const file=new File([new Uint8Array([1,2,3])],'screenshot.png',{type:'image/png'}),first=await importPromptImage(app,'Courses/Test/Chapter/Note.md',file),second=await importPromptImage(app,'Courses/Test/Chapter/Note.md',file);
 assert.notEqual(first,second);assert.match(first,/^!\[\[Courses\/Test\/Chapter\/figures\/image-[\w-]+\.png\]\]$/);assert.deepEqual(files.get(first.slice(3,-2)),new Uint8Array([1,2,3]));
});
test('standalone prompts use sibling assets; unsupported files never write',async()=>{
 const {app,files}=vault();assert.equal(await imageFolder(app,'Practice/Note.md'),'Practice/assets');assert.equal(await imageFolder(app,'Note.md'),'assets');const size=files.size;
 await assert.rejects(importPromptImage(app,'Note.md',new File(['text'],'note.txt',{type:'text/plain'})));assert.equal(files.size,size);
});
