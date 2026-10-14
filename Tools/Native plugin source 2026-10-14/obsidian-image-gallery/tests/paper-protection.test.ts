import test from 'node:test';
import assert from 'node:assert/strict';
import {PaperProtectionIndex,workingCopyName} from '../src/paper-protection-model';
import {LibraryCatalog,relocatePaperPaths} from '../src/library-model';
import {rebasePaperLink,equivalentLocalLinks} from '../src/working-copy';
const catalog=():LibraryCatalog=>({schema:1,revision:1,sources:{paper:{title:'Native defects in CeO₂',pdf:{path:'Papers/Author 2023 - Native defects in CeO2.pdf',sha256:'a'.repeat(64),bytes:3},conversion:{path:'Papers/Reading/Author 2023 - Native defects in CeO2.md'},cleanup:{markdownPath:'Papers/Reading/Author 2023 - Native defects in CeO2.md',pdfSha256:'a'.repeat(64),markdownSha256:'b'.repeat(64),verifiedAt:'2026-10-13T12:00:00Z'}}},libraries:{},memberships:[]});
test('source text locks while annotations elsewhere and unchanged autosaves remain writable',()=>{
 const c=catalog(),index=new PaperProtectionIndex(c),path=c.sources.paper.conversion!.path;
 assert.throws(()=>index.assertContent(path,'source','edited'),/protected/);
 assert.doesNotThrow(()=>index.assertContent(path,'source','source'));
 assert.doesNotThrow(()=>index.assertContent('.obsidian/study-studio-review.json','old','annotation'));
 c.sources.paper.pdf.sha256='c'.repeat(64);assert.equal(new PaperProtectionIndex(c).isProtected(path),true);
 delete c.sources.paper.cleanup;assert.equal(new PaperProtectionIndex(c).isProtected(path),false);
});
test('reserved paper title applies across folders, case, unicode and native duplicate suffixes',()=>{
 const index=new PaperProtectionIndex(catalog());
 for(const p of ['Other/NATIVE DEFECTS IN CeO2.md','Other/Native defects in CeO₂.pdf','Deep/Author 2023 - Native defects in CeO2 1.md','Native defects in CeO2 (copy).md'])assert.throws(()=>index.assertDestination(p),/belongs to/);
 assert.doesNotThrow(()=>index.assertDestination('Other/Native defects in CeO2 — Outline.md'));
 assert.doesNotThrow(()=>index.assertDestination('Other/Unrelated note.md'));
});
test('canonical moves retain reservation and source lock but duplicate copies are rejected',()=>{
 const c=catalog(),old=c.sources.paper.conversion!.path,index=new PaperProtectionIndex(c);
 assert.doesNotThrow(()=>index.assertDestination('Archive/'+old,old));
 assert.throws(()=>index.assertDestination('Archive/'+old));
 relocatePaperPaths(c,'Papers','Archive/Papers',true);assert.equal(new PaperProtectionIndex(c).isProtected('Archive/'+old),true);
});
test('working copies require meaningful distinct descriptors',()=>{
 assert.match(workingCopyName('A paper.md','Outline'),/A paper — Outline.md$/);
 for(const description of ['','copy','backup','../Original'])assert.throws(()=>workingCopyName('A paper.md',description));
});
test('registration can create its own canonical file and figure assets are protected',()=>{
 const index=new PaperProtectionIndex(catalog());
 assert.doesNotThrow(()=>index.assertDestination(catalog().sources.paper.pdf.path));
 assert.equal(index.isProtected('Papers/Reading/images/fig.png'),true);
 assert.equal(index.isProtected('Elsewhere/images/fig.png'),false);
 assert.throws(()=>index.assertDestination('Other/Native defects in CeO2.pdf'));
});
test('working copy rebases image assets and fragments without losing captions or titles',()=>{
 assert.equal(rebasePaperLink('![caption | 300](images/fig(1).png "Figure 1")','Papers/A/images/fig(1).png'),'![caption | 300](<Papers/A/images/fig(1).png> "Figure 1")');
 assert.equal(rebasePaperLink('[term](<old paper.md#Math>)','Papers/New paper.md','#Math'),'[term](<Papers/New%20paper.md#Math>)');
 assert.equal(rebasePaperLink('![[old.png|left|300]]','Papers/image.png'),'![[Papers/image.png|left|300]]');
 assert.equal(rebasePaperLink('[[old#Equation|alias]]','Papers/A.md','#Equation'),'[[Papers/A.md#Equation|alias]]');
 assert.equal(rebasePaperLink('[external](https://example.org)','A #1.md'),'[external](<A%20%231.md>)');
});
test('automatic link shortening can be ignored only with identical resolved targets and prose',()=>{
 const resolve=(s:string)=>['images/fig.svg','fig.svg'].includes(s)?'Paper/images/fig.svg':undefined;
 const a='Text. ![Figure](images/fig.svg)\n[Section](#Results)';
 assert.equal(equivalentLocalLinks(a,a.replace('images/fig.svg','fig.svg'),resolve),true);
 for(const b of [a.replace('images/fig.svg','other.svg'),a.replace('Text.','Changed.'),a.replace('Figure','Different caption'),a.replace('#Results','#Methods')])assert.equal(equivalentLocalLinks(a,b,resolve),false);
});

test('numeric working-copy names remain distinct and pass paper title reservations',()=>{
 const index=new PaperProtectionIndex(catalog());
 for(const n of ['1','2']){const name=workingCopyName('Native defects in CeO2.md',n);assert.equal(name,`Native defects in CeO2 — Working copy ${n}.md`);assert.doesNotThrow(()=>index.assertDestination('Paper notes/'+name));}
});
