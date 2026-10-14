import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newDeck,newSlide} from '../src/model';
import {researchOutline} from '../src/research-outline';

test('research outline preserves depth, playback order, repeated slides and source', () => {
  const deck = newDeck('Talk'), title = newSlide('Title','intro'), slide = newSlide('$x^2$');
  deck.sections = [{id:'a',title:'First'},{id:'b',title:'Second'},{id:'aa',title:'Detail',parent:'a'},{id:'aaa',title:'Evidence',parent:'aa'}];
  deck.slides = [undefined,'aaa','b','aaa'].map((sectionId,i)=>({id:i===0?title.id:slide.id,file:'same.md',section:'',sectionId}));
  const before = JSON.stringify(deck);
  const rows = researchOutline(deck,[title,slide,slide,slide]);
  assert.deepEqual(rows.filter(r=>r.kind==='slide').map(r=>r.slideIndex),[0,1,2,3]);
  assert.equal(rows.find(r=>r.heading==='1.1.1 Evidence')?.level,4);
  assert.equal(rows.filter(r=>r.heading==='1 First').length,2);
  assert.equal(rows.filter(r=>r.kind==='slide')[1].level,5);
  assert.equal(rows.filter(r=>r.kind==='slide')[0].heading,'Title');
  assert.equal(rows.filter(r=>r.kind==='slide')[3].heading,'3 · $x^2$');
  assert.equal(JSON.stringify(deck),before);
});
test('empty, missing and unsectioned slides remain navigable without invented sections', () => {
  const deck=newDeck('Empty');deck.slides=[];
  assert.equal(researchOutline(deck,[])[0].slideIndex,-1);
  deck.sections=[];deck.slides=[{id:'missing',file:'missing.md',section:''}];
  const rows=researchOutline(deck,[null]);
  assert.equal(rows.length,2);assert.match(rows[1].heading,/Missing slide/);assert.equal(rows[1].level,2);
});
test('legacy sections and Wrong Convention use the existing numbering model', () => {
  const deck=newDeck('Legacy'), a=newSlide('Title','intro'),b=newSlide('Body');
  delete deck.sections; deck.theme.titlePagination=true;
  deck.slides=[a,b].map((s,i)=>({id:s.id,file:s.title+'.md',section:i?'Methods':'Intro'}));
  const rows=researchOutline(deck,[a,b]);
  assert.deepEqual(rows.filter(r=>r.kind==='slide').map(r=>r.heading),['1 · Title','2 · Body']);
  assert.deepEqual(rows.filter(r=>r.kind==='section').map(r=>r.heading),['Intro','Methods']);
});

test('section numbers match outline slides when a title-only section precedes content', () => {
  const deck=newDeck('Talk'), title=newSlide('Title','intro'), body=newSlide('Body');
  deck.sections=[{id:'title',title:'Title'},{id:'empty',title:'Empty'},{id:'main',title:'Methods'}];
  deck.slides=[{id:title.id,file:'title.md',section:'',sectionId:'title'},{id:body.id,file:'body.md',section:'',sectionId:'main'}];
  assert.deepEqual(researchOutline(deck,[title,body]).filter(r=>r.kind==='section').map(r=>r.heading),['1 Methods']);
});
