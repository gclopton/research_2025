import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newDeck,newSlide,serialize,deserialize,slidePageNumber} from '../src/model';
import {outlinePlan,outlineContext,outlineWindow} from '../src/outlines';
const section=(id:string,parent?:string)=>({id,title:id,...(parent?{parent}:{})});
test('outlines precede each occupied section and ancestor, leave title first, and never change page numbers',()=>{
 const slides=[newSlide('Title','intro'),newSlide('A'),newSlide('B'),newSlide('C')];
 const d=newDeck('Talk',slides.map((s,i)=>({id:s.id,file:`${i}.md`,section:'',sectionId:['title','a','sub','b'][i]})));
 d.sections=[section('title'),section('a'),section('sub','a'),section('b'),section('empty')];d.showOutlines=true;
 const before=serialize(d),p=outlinePlan(d,slides);
 assert.deepEqual(p.pages.map(p=>p.kind==='outline'?p.sectionId:p.index),[0,'a',1,'sub',2,'b',3]);
 assert.equal(serialize(d),before);assert.equal(slidePageNumber(d.theme,slides,3),'3/3');
 const page=p.pages.find(p=>p.kind==='outline')!;assert.equal(page.kind,'outline');
 if(page.kind==='outline')assert.deepEqual(outlineContext(p.deck,page.sectionId,page.sectionIds).roots.map(s=>s.id),['a','b']);
 assert.deepEqual([...outlineContext(p.deck,'sub',page.kind==='outline'?page.sectionIds:[]).numbers.values()],['1','1.1','2']);
 d.showOutlines=false;assert.equal(outlinePlan(d,slides).pages.length,4);
 assert.equal(slidePageNumber(d.theme,slides,3),'3/3');
 assert.deepEqual(deserialize(serialize(d)),d);
});
test('deep empty ancestors share one outline highlighting the leaf; legacy decks work',()=>{
 const slide=newSlide('Content'),d=newDeck('Talk',[{id:slide.id,file:'s.md',section:'',sectionId:'leaf'}]);
 d.sections=[section('root'),section('middle','root'),section('leaf','middle')];d.showOutlines=true;
 const p=outlinePlan(d,[slide]);assert.deepEqual(p.pages.map(p=>p.kind==='outline'?p.sectionId:p.index),['leaf',0]);
 assert.deepEqual(outlineContext(p.deck,'leaf').chain.map(s=>s.id),['root','middle','leaf']);
 assert.deepEqual([...outlineContext(p.deck,'leaf').numbers.values()],['1','1.1','1.1.1']);
 const legacy=newDeck('Legacy',[{id:slide.id,file:'s.md',section:'Results'}]);legacy.showOutlines=true;
 assert.equal(outlinePlan(legacy,[slide]).pages.length,2);assert.equal(legacy.sections,undefined);
});
test('large outlines show a bounded readable window containing the active section',()=>{
 const list=Array.from({length:30},(_,i)=>i);for(const active of [0,4,15,29]){
 const w=outlineWindow(list,active,5);assert.ok(w.items.includes(active));assert.equal(w.items.length,5);assert.equal(w.earlier+w.items.length+w.later,30);
 }
});
test('no sections, empty decks and title-only sections do not invent outline slides',()=>{
 const slide=newSlide('Content'),title=newSlide('Title','intro');
 const plain=newDeck('No sections',[{id:slide.id,file:'s.md',section:''}]);plain.showOutlines=true;
 assert.deepEqual(outlinePlan(plain,[slide]).pages,[{kind:'slide',index:0}]);
 const empty=newDeck('Empty');empty.showOutlines=true;assert.deepEqual(outlinePlan(empty,[]).pages,[]);
 const titleOnly=newDeck('Title only',[{id:title.id,file:'t.md',section:'',sectionId:'g'}]);titleOnly.sections=[section('g')];titleOnly.showOutlines=true;
 assert.deepEqual(outlinePlan(titleOnly,[title]).pages,[{kind:'slide',index:0}]);
});

test('a section beginning directly in its first subsection emits only the subsection outline',()=>{
 const slides=[newSlide('Title','intro'),newSlide('First'),newSlide('Second')];
 const d=newDeck('Talk',slides.map((s,i)=>({id:s.id,file:`${i}.md`,section:'',sectionId:['root','first','second'][i]})));
 d.sections=[section('root'),section('first','root'),section('second','root')];d.showOutlines=true;
 const p=outlinePlan(d,slides);
 assert.deepEqual(p.pages.map(p=>p.kind==='outline'?p.sectionId:p.index),[0,'first',1,'second',2]);
 const page=p.pages[1];assert.equal(page.kind,'outline');
 if(page.kind==='outline'){
   const context=outlineContext(p.deck,page.sectionId,page.sectionIds);
   assert.equal(context.active.id,'first');assert.equal(context.numbers.get('first'),'1.1');
   assert.deepEqual(context.roots.map(g=>g.id),['root']);
   assert.deepEqual(context.children.map(g=>g.id),['first','second']);
 }
});
