import {test} from 'node:test';
import assert from 'node:assert/strict';
import {documentChunks,documentSource,parseDocument} from '../src/document-core';
test('document window paths round trip with Unicode, quotes, page and heading targets',()=>{
 for(const path of ['papers/A: "B".pdf#page=3','notes/温度.md#Energy','Chapter.md#^equation']) {
  const source=documentSource(path,360).split('\n').slice(1,-1).join('\n');
  assert.deepEqual(parseDocument(source),{path,height:360});
 }
 assert.equal(parseDocument('"[[Notes#Method|Label]]"').path,'Notes#Method');
 assert.throws(()=>parseDocument('path: test\nheight: -20'));
 assert.throws(()=>parseDocument('path: [test]'));
});
test('progressive rendering never splits fenced code or display math at blank lines',()=>{
 for(const block of ['```latex\nA\n\nB\n```','~~~text\nA\n\nB\n~~~','$$\nA\n\nB\n$$']) {
  const raw='Before\n\n'+block+'\n\nAfter\n\n';
  const chunks=documentChunks(raw,4);
  assert.ok(chunks.some(c=>c.includes(block)));
  assert.equal(chunks.join('\n'),raw);
 }
});
test('long ordinary documents render in bounded batches',()=>{
 const raw=Array.from({length:200},(_,i)=>`Paragraph ${i}.\n`).join('\n');
 const chunks=documentChunks(raw,150);
 assert.ok(chunks.length>10);
 assert.ok(chunks.every(c=>c.length<200));
 assert.equal(chunks.join('\n'),raw);
});

import {emptyDocumentEmbed} from '../src/document-core';
import {externalPDF,scanPDFs,selectVault,vaultsFromRegistry} from '../src/document-vaults';
import {mkdtemp,mkdir,writeFile,symlink,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
test('empty embed trigger replaces only its own brackets and leaves literal syntax alone',()=>{
 assert.deepEqual(emptyDocumentEmbed('Before\n![[]]\nAfter',10),{start:7,end:12});
 for(const text of ['```md\n![[','~~~\n![[','`![[','\\![[','    ![[','---\nexample: ![['])assert.equal(emptyDocumentEmbed(text,text.length),undefined,text);
 assert.ok(emptyDocumentEmbed('```md\ncode\n```\n![[',18));
});
test('cross-vault targets retain identity and resolve uniquely across machines',()=>{
 const source=documentSource('Papers/A.pdf#page=4',560,'papers','abc').split('\n').slice(1,-1).join('\n');
 assert.deepEqual(parseDocument(source),{path:'Papers/A.pdf#page=4',height:560,vault:'papers',vaultId:'abc'});
 const vaults=vaultsFromRegistry({vaults:{new:{path:'/other/papers'},second:{path:'/other/notes'}}});
 assert.equal(selectVault(vaults,'papers','old').id,'new');
 assert.throws(()=>selectVault([...vaults,{id:'duplicate',name:'papers',root:'/duplicate/papers'}],'papers'));
 assert.throws(()=>selectVault(vaults,'missing'));
});
test('PDF discovery skips private/config trees and validates real paths without copying files',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'ss-documents-'));
 try{
  await mkdir(path.join(root,'vault/Papers'),{recursive:true});await mkdir(path.join(root,'vault/.obsidian'));
  await writeFile(path.join(root,'vault/Papers/paper.pdf'),'fixture');await writeFile(path.join(root,'vault/.obsidian/hidden.pdf'),'hidden');await writeFile(path.join(root,'outside.pdf'),'outside');
  await symlink(path.join(root,'outside.pdf'),path.join(root,'vault/Papers/escape.pdf'));
  const vault={id:'a',name:'vault',root:path.join(root,'vault')};
  assert.deepEqual(await scanPDFs(vault.root,()=>false),['Papers/paper.pdf']);
  assert.equal((await externalPDF(vault,'Papers/paper.pdf')).size,7);
  await assert.rejects(externalPDF(vault,'../outside.pdf'));
  await assert.rejects(externalPDF(vault,'Papers/escape.pdf'));
  assert.deepEqual(await scanPDFs(vault.root,()=>true),[]);
 }finally{await rm(root,{recursive:true,force:true});}
});
