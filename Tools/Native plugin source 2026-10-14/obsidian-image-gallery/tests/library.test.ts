import {test} from 'node:test';
import assert from 'node:assert/strict';
import {LibraryCatalog,addMembership,duplicateMatch,moveLibrary,paperIds,resolvePaperPath,validateCatalog} from '../src/library-model';
function fixture():LibraryCatalog{return {schema:1,revision:1,sources:{s:{title:'Defect chemistry',authors:'Zhang et al',year:2023,pdf:{path:'Papers/source.pdf',sha256:'a'.repeat(64),bytes:10},conversion:{path:'Papers/source.md'},equivalentPdfs:[{sha256:'b'.repeat(64),reason:'Publisher metadata'}],aliases:[{path:'Papers/old.md',target:'Papers/source.md'}]}},libraries:{a:{title:'Ceria',parent:null},b:{title:'Defects',parent:'a'},c:{title:'Simulation',parent:null}},memberships:[{library:'b',source:'s'},{library:'c',source:'s'}]};}
test('multiple library memberships retain one paper identity',()=>{const c=fixture();addMembership(c,'s','a');addMembership(c,'s','a');assert.equal(c.memberships.length,3);assert.deepEqual(paperIds(c,null),['s']);assert.deepEqual(paperIds(c,'a'),['s']);});
test('intake recognizes exact and equivalent publisher downloads',()=>{const c=fixture();assert.equal(duplicateMatch(c,'a'.repeat(64),'renamed')?.kind,'exact');assert.equal(duplicateMatch(c,'b'.repeat(64),'renamed')?.kind,'exact');assert.equal(duplicateMatch(c,'c'.repeat(64),'Zhang et al 2023 - Defect chemistry.pdf')?.kind,'candidate');assert.equal(duplicateMatch(c,'c'.repeat(64),'Distinct work'),null);});
test('retired source aliases retain heading suffixes',()=>assert.equal(resolvePaperPath(fixture(),'Papers/old.md#Methods'),'Papers/source.md#Methods'));
test('library cycles and path traversal are rejected',()=>{const c=fixture();assert.throws(()=>moveLibrary(c,'a','b'));c.sources.s.pdf.path='../outside.pdf';assert.throws(()=>validateCatalog(c));});
test('same source path cannot belong to two catalog records',()=>{const c=fixture();c.sources.duplicate=structuredClone(c.sources.s);assert.throws(()=>validateCatalog(c));});
test('extensionless aliases preserve section links',()=>assert.equal(resolvePaperPath(fixture(),'Papers/old#Methods'),'Papers/source#Methods'));
test('live paths take precedence and invalid overlapping aliases are rejected',()=>{const c=fixture();c.sources.s.aliases!.push({path:'Papers/source.md',target:'Papers/source.md'});assert.equal(resolvePaperPath(c,'Papers/source.md'),'Papers/source.md');assert.throws(()=>validateCatalog(c));});
test('duplicate identities are rejected even at different paths',()=>{const c=fixture();c.sources.other={title:'Other',pdf:{path:'Papers/other.pdf',sha256:'b'.repeat(64),bytes:10}};assert.throws(()=>validateCatalog(c));});
test('publisher filenames match the registered DOI',()=>{const c=fixture();c.sources.s.doi='10.1000/ceria';assert.deepEqual(duplicateMatch(c,'c'.repeat(64),'publisher-download.pdf','https://doi.org/10.1000/CERIA'),{kind:'candidate',ids:['s']});});

import {relocatePaperPaths,librarySearchPage,CATALOG_PATH,LEGACY_CATALOG_PATH} from '../src/library-model';
import {preparePaperCatalog} from '../src/library-storage';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {tmpdir} from 'node:os';

test('nested folder moves preserve source IDs, memberships, evidence paths and image redirects',()=>{
 const c=fixture(),memberships=structuredClone(c.memberships);c.libraries.a.folder='Papers';
 relocatePaperPaths(c,'Papers','Research/References',true);
 assert.equal(c.sourceRoot,'Research/References');assert.equal(c.sources.s.pdf.path,'Research/References/source.pdf');
 assert.equal(resolvePaperPath(c,'Papers/old#Methods'),'Research/References/source#Methods');
 assert.equal(resolvePaperPath(c,'Papers/images/figure.png'),'Research/References/images/figure.png');
 relocatePaperPaths(c,'Research/References/images','Assets/Scientific figures',true);
 // An asset-only folder has no registered source, so it follows Obsidian's ordinary image-link updater.
 assert.deepEqual(c.memberships,memberships);assert.equal(Object.keys(c.sources).length,1);validateCatalog(c);
 relocatePaperPaths(c,'Research/References','Papers',true);
 assert.equal(resolvePaperPath(c,'Research/References/source.md'),'Papers/source.md');
 assert.equal(resolvePaperPath(c,'Research/References/images/figure.png'),'Papers/images/figure.png');validateCatalog(c);
});
test('successive queued moves apply to the latest paths and retain all prior aliases',()=>{
 const c=fixture();relocatePaperPaths(c,'Papers','Nested/Papers',true);relocatePaperPaths(c,'Nested/Papers','Archive/Papers',true);
 assert.equal(resolvePaperPath(c,'Papers/source#Summary'),'Archive/Papers/source#Summary');
 assert.equal(resolvePaperPath(c,'Nested/Papers/source.pdf'),'Archive/Papers/source.pdf');
 assert.equal(resolvePaperPath(c,'Papers/images/fig.png'),'Archive/Papers/images/fig.png');validateCatalog(c);
});
test('unrelated rename leaves catalog unchanged',()=>{const c=fixture(),before=JSON.stringify(c);relocatePaperPaths(c,'Notes','Personal/Notes',true);assert.equal(JSON.stringify(c),before);});
test('catalog migration stays outside movable paper folders and survives restart',async()=>{
 const base=await fs.mkdtemp(path.join(tmpdir(),'paper-move-'));
 try{assert.equal(await preparePaperCatalog(base),false);const old=path.join(base,LEGACY_CATALOG_PATH);await fs.mkdir(path.dirname(old),{recursive:true});const raw=JSON.stringify(fixture());await fs.writeFile(old,raw);
 assert.equal(await preparePaperCatalog(base),true);assert.equal(await fs.readFile(path.join(base,CATALOG_PATH),'utf8'),raw);
 await fs.mkdir(path.join(base,'Research'));await fs.rename(path.join(base,'Papers'),path.join(base,'Research/Papers'));
 assert.equal(await preparePaperCatalog(base),true);assert.equal(await fs.readFile(path.join(base,CATALOG_PATH),'utf8'),raw);
 }finally{await fs.rm(base,{recursive:true,force:true});}
});
test('large-catalog search returns a bounded page and covers all matching sources',()=>{
 const c=fixture();c.sources={};c.memberships=[];
 for(let i=0;i<10000;i++){const id='s'+i;c.sources[id]={title:'Paper '+i+' ceria',pdf:{path:'Papers/'+id+'.pdf',sha256:i.toString(16).padStart(64,'0'),bytes:10}};c.memberships.push({source:id,library:'b'});}
 const start=performance.now(),first=librarySearchPage(c,null,'ceria'),last=librarySearchPage(c,'a','ceria',249);
 console.log('10,000 sources: two searches in '+(performance.now()-start).toFixed(1)+' ms');
 assert.equal(first.total,10000);assert.equal(first.ids.length,40);assert.equal(last.ids.length,40);assert.equal(first.ids[0],'s0');assert.equal(last.ids[39],'s9999');
 assert.deepEqual(librarySearchPage(c,null,'no such title').ids,[]);
});

import {paperCleanupBadge} from '../src/library-model';
test('cleanup badge requires an explicit review of the current PDF, not merely a conversion',()=>{
 const source=fixture().sources.s;
 assert.equal(paperCleanupBadge(source).icon,'🤢');
 source.cleanup={markdownPath:source.conversion!.path,verifiedAt:'2026-10-14T02:00:00Z',pdfSha256:source.pdf.sha256,markdownSha256:'c'.repeat(64)};
 assert.equal(paperCleanupBadge(source).icon,'✨');
 source.pdf.sha256='d'.repeat(64);assert.equal(paperCleanupBadge(source).icon,'🤢');
 source.pdf.sha256=source.cleanup.pdfSha256;delete source.conversion;assert.equal(paperCleanupBadge(source).icon,'🤢');
});

test('cleanup review follows folder moves but not a replacement reading copy',()=>{
 const c=fixture(),source=c.sources.s;
 source.cleanup={markdownPath:source.conversion!.path,verifiedAt:'2026-10-14T02:00:00Z',pdfSha256:source.pdf.sha256,markdownSha256:'c'.repeat(64)};
 relocatePaperPaths(c,'Papers','Archive/Papers',true);
 assert.equal(source.cleanup.markdownPath,source.conversion!.path);
 assert.equal(paperCleanupBadge(source).icon,'✨');
 source.conversion!.path='Archive/new-conversion.md';assert.equal(paperCleanupBadge(source).icon,'🤢');
 delete source.conversion;assert.equal(paperCleanupBadge(source).label,'No reading copy yet');
});
