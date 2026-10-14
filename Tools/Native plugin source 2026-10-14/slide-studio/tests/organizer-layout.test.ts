import {test} from 'node:test';
import assert from 'node:assert/strict';
import {gridSlot,translatePositions} from '../src/organizer-layout';
import {newDeck,serialize,deserialize,trashSlide,restoreSlide} from '../src/model';
import {ensureSections,orderSlides} from '../src/sections';
const rects=[0,120,240].map(left=>({left,top:0,right:left+100,bottom:80}));
test('grid gutters resolve to insertion slots, not the end of a section',()=>{
 assert.equal(gridSlot(rects,110,40),1);assert.equal(gridSlot(rects,230,40),2);
 assert.equal(gridSlot(rects,340,40),3);assert.equal(gridSlot(rects,-10,40),0);
});
test('wrapped rows, row gutters, empty sections and trailing canvas have stable slots',()=>{
 const two=[...rects,...rects.map(r=>({...r,top:100,bottom:180}))];
 assert.equal(gridSlot(two,110,130),4);assert.equal(gridSlot(two,110,95),4);
 assert.equal(gridSlot(two,0,200),6);assert.equal(gridSlot([],40,40),0);
});
test('free positions clamp together and do not change presentation order; survive save/trash/restore',()=>{
 assert.deepEqual(translatePositions([{x:0,y:0},{x:120,y:100}],-50,80),[{x:0,y:80},{x:120,y:180}]);
 const d=newDeck('Canvas',[{id:'a',file:'a.md',section:''},{id:'b',file:'b.md',section:''}]);ensureSections(d);
 d.slides[0].canvas={x:600,y:400};d.slides[1].canvas={x:10,y:10};orderSlides(d);
 assert.deepEqual(d.slides.map(e=>e.id),['a','b']);
 assert.deepEqual(deserialize(serialize(d)),d);
 trashSlide(d,0);const saved=deserialize(serialize(d));assert.ok(saved);assert.equal(saved.kind,'deck');
 if(saved.kind==='deck'){restoreSlide(saved,0);assert.deepEqual(saved.slides[0].canvas,{x:600,y:400});}
});
