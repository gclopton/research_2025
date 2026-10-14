import {test} from 'node:test';
import assert from 'node:assert/strict';
import {citations,buildReferences,referencePages,referenceText} from '../src/citations-core';
test('groups, locators and text citations retain first occurrence order',()=>{
 const c=citations('A [see @alpha, pp. 2–3; @beta] and @gamma. Again [@alpha].');
 assert.deepEqual(c.map(c=>c.members.map(m=>m.key)),[['alpha','beta'],['gamma'],['alpha']]);
 assert.equal(c[0].members[0].prefix,'see');assert.equal(c[0].members[0].suffix,', pp. 2–3');
});
test('code, math, code links, wiki links, URLs and email are not citations',()=>{
 assert.equal(citations('`[@no]`\n```python\n@decorator\n```\n{{alias:@file}} [[@note]] $@math$ a@b.com [web](https://host/@x)').length,0);
});
test('each claim preserves its own evidence URI; mismatched evidence stays visible',()=>{
 const uri=(id:string,keys:string)=>`obsidian://study-evidence?file=e.yaml&id=${id}&keys=${keys}`;
 const a=`[@a] [evidence](${uri('first','a')})`,b=`[@a] [evidence](${uri('second','a')})`;
 const c=citations(a+' '+b);assert.equal(c[0].evidence,uri('first','a'));assert.equal(c[1].evidence,uri('second','a'));assert.equal(c[0].to,a.length);
 const bad=citations(`[@a] [evidence](${uri('wrong','b')})`)[0];assert.equal(bad.evidence,undefined);assert.equal(bad.to,4);
 const group=citations(`[@b; @a] [evidence](${uri('both','a%7Cb')})`)[0];assert.equal(group.evidence,uri('both','a%7Cb'));
});
test('deck bibliography deduplicates without losing evidence or inventing missing metadata',()=>{
 const items=new Map([['a',{id:'a',title:'Paper A',author:[{family:'Researcher',given:'A.'}],issued:{'date-parts':[[2026]]},DOI:'10.1/example'}]]);
 const refs=buildReferences([{slide:'one',occurrences:citations('[@a; @missing]')},{slide:'two',occurrences:citations('[@a]')}],items);
 assert.equal(refs.size,2);assert.equal(refs.get('a')?.number,1);assert.equal(refs.get('missing')?.number,2);assert.match(refs.get('missing')!.full,/Missing/);
 assert.equal(refs.get('a')?.url,'https://doi.org/10.1/example');
 assert.match(referenceText(items.get('a')!).full,/Paper A/);
});
test('all sources retained beyond footer cap and reference pages split',()=>{
 const refs=buildReferences([{slide:'x',occurrences:citations(Array.from({length:12},(_,i)=>`[@paper${i}]`).join(' '))}],new Map());
 const pages=referencePages([...refs.values()]);assert.equal(refs.size,12);assert.equal(pages.flat().length,12);assert.ok(pages.every(p=>p.length<=5));assert.equal(pages.length,3);
});
import {newSlide,newDeck,serialize,deserialize} from '../src/model';
test('bibliography selection survives slide and presentation edits',()=>{
 for(const doc of [newSlide('Example'),newDeck('Example',[])]){doc.bibliography=['Sources/library.json','Sources/extra.bib'];assert.deepEqual(deserialize(serialize(doc))?.bibliography,doc.bibliography);}
});
import {pdfCandidates,webVersion} from '../src/citations-core';
test('PDF discovery follows exact source filenames and the existing paper archive layout',()=>{
 assert.deepEqual(pdfCandidates('Papers/Section/markdown_originals/Sun 2017/Sun 2017.md'),['Papers/Section/markdown_originals/Sun 2017/Sun 2017.pdf','Papers/Section/pdfs/Sun 2017.pdf']);
 const ref=buildReferences([{slide:'s',occurrences:citations('[@a]')}],new Map([['a',{id:'a',DOI:'10.1/test',URL:'https://example.org/article.pdf'}]])).get('a')!;
 assert.equal(webVersion(ref),'https://doi.org/10.1/test');
});
