import test from 'node:test';import assert from 'node:assert/strict';
import {sourceBlocks,nearestBlock,placementFor,placementFromAnchors,locatePlacement,placementOf,validPlacement,cachedPlacementEnd,endInRange} from '../src/sticky-placement';
import {isProtectedPaper} from '../src/paper-protection';
import {sanitizedReview,mergeReview} from '../src/margin-model';

const paper=`---
title: Paper
---
# Results

The vacancy formation energy is 4.2 eV in this cell.
A second line of the same paragraph.

\`\`\`python
x = 1

y = 2
\`\`\`

$$
E = mc^2

F = ma
$$

Conclusion paragraph.`;

test('blocks keep fences and display math whole and skip frontmatter',()=>{
 const blocks=sourceBlocks(paper).map(b=>paper.slice(b.from,b.to));
 assert.equal(blocks[0],'# Results');
 assert.ok(blocks[1].startsWith('The vacancy')&&blocks[1].endsWith('paragraph.'));
 assert.ok(blocks[2].startsWith('```python')&&blocks[2].includes('y = 2')&&blocks[2].endsWith('```'));
 assert.ok(blocks[3].startsWith('$$')&&blocks[3].includes('F = ma'));
 assert.equal(blocks.at(-1),'Conclusion paragraph.');
 assert.ok(!blocks.some(b=>b.includes('title: Paper')));
});

test('a caret anchors after the end of its block; the source text is untouched',()=>{
 const before=paper,caret=paper.indexOf('formation');
 const p=placementFor(paper,caret,caret)!;assert.ok(p);
 assert.equal(paper,before);
 assert.equal(locatePlacement(paper,p),paper.indexOf('paragraph.')+'paragraph.'.length);
});

test('a caret on a blank line uses the previous block; before the first block uses the first',()=>{
 const blank=paper.indexOf('\n\n```')+1;
 assert.equal(locatePlacement(paper,placementFor(paper,blank,blank)!),paper.indexOf('paragraph.')+'paragraph.'.length);
 const start=paper.indexOf('---\n#')+4,first=placementFor(paper,start,start)!;
 assert.equal(locatePlacement(paper,first),paper.indexOf('# Results')+'# Results'.length);
 assert.equal(placementFor('',0,0),undefined);
});

test('a selection anchors at its trimmed end',()=>{
 const from=paper.indexOf('vacancy'),to=paper.indexOf('4.2 eV')+'4.2 eV'.length;
 const p=placementFor(paper,from,to+1)!; // trailing space is trimmed
 assert.equal(locatePlacement(paper,p),to);
 const lead=placementFor(paper,from-1,to)!;assert.equal(locatePlacement(paper,lead),to);
 const q=placementFor(paper,from,to)!;assert.equal(locatePlacement(paper,q),to);
});

test('long blocks keep a bounded tail; repeated text is disambiguated by context',()=>{
 const long='Intro.\n\n'+'word '.repeat(200).trim()+' end.\n\nNext.';const caret=long.indexOf('word')+10;
 const p=placementFor(long,caret,caret)!;assert.ok(p.quote.length<=160);assert.equal(locatePlacement(long,p),long.indexOf(' end.')+5);
 const repeated='Same text.\n\nSame text.\n\nSame text.';const second=repeated.indexOf('Same text.',5)+2;
 const r=placementFor(repeated,second,second)!;assert.equal(locatePlacement(repeated,r),repeated.indexOf('Same text.',5)+10);
});

test('placements survive unrelated edits elsewhere and report changes to their passage',()=>{
 const caret=paper.indexOf('Conclusion'),p=placementFor(paper,caret,caret)!;
 const edited=paper.replace('# Results','# Results and discussion');
 assert.equal(locatePlacement(edited,p),edited.length);
 assert.equal(locatePlacement(paper.replace('Conclusion paragraph.','Rewritten.'),p),undefined);
});

test('selection anchors from the margin machinery become end placements; math and section fallbacks are ignored',()=>{
 const quote='The vacancy formation energy is 4.2 eV',a={id:'1',path:'P.md',quote,before:'',after:' in this cell.'};
 const p=placementFromAnchors(paper,[{...a,kind:'math' as const},a])!;assert.equal(locatePlacement(paper,p),paper.indexOf(quote)+quote.length);
 assert.equal(placementFromAnchors(paper,[{...a,sectionSource:'x'}]),undefined);
 assert.equal(placementFromAnchors(paper,[{...a,quote:'not present'}]),undefined);
 assert.equal(placementFromAnchors(paper,undefined),undefined);
});

test('only well-formed sticky placements are used',()=>{
 const c:any={id:'s',kind:'sticky',path:'P.md',quote:'',before:'',after:'',comment:'',color:'#e2b714',intent:'',updated:'1',resolved:false,placement:{quote:'x',before:'',after:''}};
 assert.ok(placementOf(c));assert.equal(placementOf({...c,kind:undefined}),undefined);
 for(const bad of [undefined,null,'x',{quote:'',before:'',after:''},{quote:'x',before:1,after:''},{quote:'x',before:'',after:'',renderedQuote:2}])assert.equal(validPlacement(bad),false);
 assert.equal(placementOf({...c,placement:{quote:'x'}}),undefined);
});

test('sidecar placements persist through review sanitizing and three-way merges',()=>{
 const c:any={id:'s',kind:'sticky',path:'P.md',quote:'',before:'',after:'',comment:'',color:'#e2b714',intent:'',updated:'1',resolved:false,placement:{quote:'Conclusion paragraph.',before:'',after:''}};
 const review={version:1,comments:[c],questions:[]};
 assert.deepEqual(sanitizedReview(review).comments[0].placement,c.placement);
 const merged=mergeReview({version:1,comments:[],questions:[]},review,{version:1,comments:[],questions:[]});
 assert.deepEqual(merged.comments[0].placement,c.placement);
});

test('cached placement lookup follows text changes and section bounds are end-inclusive',()=>{
 const p=placementFor(paper,paper.indexOf('Conclusion'),paper.indexOf('Conclusion'))!;
 assert.equal(cachedPlacementEnd('P.md',paper,p),paper.length);
 assert.equal(cachedPlacementEnd('P.md',paper+'\n\nMore.',p),paper.length);
 assert.equal(cachedPlacementEnd('P.md','changed',p),undefined);
 assert.ok(endInRange(10,0,10));assert.ok(!endInRange(0,0,10));assert.ok(!endInRange(11,0,10));
});

test('protection comes only from the Image Gallery API and fails closed to unprotected',()=>{
 const app=(fn:unknown)=>({plugins:{getPlugin:(id:string)=>id==='image-gallery'?{api:{library:{isProtected:fn}}}:undefined}});
 assert.equal(isProtectedPaper(app((p:string)=>p==='P.md'),'P.md'),true);
 assert.equal(isProtectedPaper(app((p:string)=>p==='P.md'),'Q.md'),false);
 assert.equal(isProtectedPaper(app(()=>'yes'),'P.md'),false);
 assert.equal(isProtectedPaper(app(()=>{throw Error('x');}),'P.md'),false);
 assert.equal(isProtectedPaper({plugins:{getPlugin:()=>undefined}},'P.md'),false);
 assert.equal(isProtectedPaper(undefined,'P.md'),false);
});
