import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newDeck, newSlide, serialize, deserialize, sectionAt, trashSlide, restoreSlide } from '../src/model';
import { ensureSections, createSection, moveSection, moveSlidesTo, orderSlides, setSectionFooter, fragment } from '../src/sections';
function fixture() {
 const deck=newDeck('Talk',Array.from({length:6},(_,i)=>({id:`s${i}`,file:`s${i}.md`,section:i===3?'Results':''})));
 ensureSections(deck);return deck;
}
test('legacy grouping preserves slide order and footers, then roundtrips nested sections',()=>{
 const d=fixture();assert.deepEqual(d.slides.map(e=>e.id),['s0','s1','s2','s3','s4','s5']);
 assert.equal(d.sections?.length,2);assert.equal(sectionAt(d,2,[]),'Talk');assert.equal(sectionAt(d,3,[]),'Results');
 const sub=createSection(d,'Evidence',[4,5],d.sections![1].id);
 assert.equal(sectionAt(d,4,[]),'Results');setSectionFooter(d,sub.id,'Details');assert.equal(sectionAt(d,4,[]),'Details');
 assert.deepEqual(deserialize(serialize(d)),d);
 setSectionFooter(d,d.sections![1].id,'Findings',true);assert.equal(sectionAt(d,5,[]),'Findings');
});
test('moving nested sections preserves descendant membership and refuses cycles',()=>{
 const d=fixture(), first=d.sections![0].id, second=d.sections![1].id;
 const sub=createSection(d,'Child',[1,2],first);
 moveSection(d,second,first);assert.deepEqual(d.slides.map(e=>e.id),['s3','s4','s5','s0','s1','s2']);
 assert.throws(()=>moveSection(d,first,sub.id,true),/itself/);
 moveSection(d,first,second,true);assert.equal(d.sections!.find(g=>g.id===first)?.parent,second);
 assert.deepEqual(d.slides.map(e=>e.id),['s3','s4','s5','s0','s1','s2']);
});
test('multi-slide moves retain order, can enter an empty section, and trash restores membership',()=>{
 const d=fixture();const g=createSection(d,'Empty');moveSlidesTo(d,[0,2],g.id);
 assert.deepEqual(d.slides.filter(e=>e.sectionId===g.id).map(e=>e.id),['s0','s2']);
 const before=d.slides.find(e=>e.id==='s0')!;moveSlidesTo(d,[d.slides.findIndex(e=>e.id==='s2')],g.id,before);
 assert.deepEqual(d.slides.slice(-2).map(e=>e.id),['s2','s0']);
 trashSlide(d,5);restoreSlide(d,0);orderSlides(d);assert.equal(d.slides[5].sectionId,g.id);
});
test('fragment retains ancestor footers and rejects cyclic or unknown membership on read',()=>{
 const d=fixture();const sub=createSection(d,'Child',[4],d.sections![1].id);
 const f=fragment(d,[d.slides.findIndex(e=>e.sectionId===sub.id)]);
 assert.equal(f.slides.length,1);assert.equal(f.sections!.length,2);assert.equal(sectionAt(f,0,[]),'Results');
 const broken=structuredClone(d);broken.sections![0].parent=broken.sections![0].id;
 assert.throws(()=>deserialize(serialize(broken)),/cyclic/);
 broken.sections![0].parent=undefined;broken.slides[0].sectionId='unknown';
 assert.throws(()=>deserialize(serialize(broken)),/missing slide section/);
});

test('precise slide positions move a multi-selection together and between groups',async()=>{
 const {positionSlides}=await import('../src/sections');const d=fixture(),group=d.sections![1].id;
 positionSlides(d,[0,2],group,2);
 assert.deepEqual(d.slides.map(e=>e.id),['s1','s3','s0','s2','s4','s5']);
 assert.throws(()=>positionSlides(d,[0],group,99),/Position/);
});
test('section position inserts or swaps siblings and preserves their subtrees',async()=>{
 const {positionSection}=await import('../src/sections');const d=fixture(),a=d.sections![0],b=d.sections![1];
 const child=createSection(d,'Child',[1],a.id);
 positionSection(d,b.id,undefined,1);assert.deepEqual(d.slides.map(e=>e.id),['s3','s4','s5','s0','s2','s1']);
 positionSection(d,b.id,undefined,2,true);assert.deepEqual(d.slides.map(e=>e.id),['s0','s2','s1','s3','s4','s5']);
 assert.equal(child.parent,a.id);
 positionSection(d,child.id,undefined,1);assert.equal(child.parent,undefined);assert.equal(d.slides[0].id,'s1');
 positionSection(d,child.id,b.id,1);assert.equal(child.parent,b.id);
 assert.throws(()=>positionSection(d,b.id,child.id,1),/parent/);
 assert.throws(()=>positionSection(d,child.id,undefined,1,true),/same parent/);
 assert.deepEqual(deserialize(serialize(d)),d);
});
