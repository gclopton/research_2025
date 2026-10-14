import {test} from 'node:test';
import assert from 'node:assert/strict';
import {embedSource,parseEmbed,embedPage} from '../src/embed-core';
test('copied embeds preserve identity and special characters in paths',()=>{
 const path='Presentations/Fluids "A"/Lecture 1.md',id='fixed-uuid';
 const source=embedSource(id,path).split('\n').slice(1,-1).join('\n');
 assert.deepEqual(parseEmbed(source),{id,path});
});
test('handwritten embed targets accept wiki aliases and ordinary paths',()=>{
 assert.deepEqual(parseEmbed('[[Presentations/Deck|My title]]'),{path:'Presentations/Deck'});
 assert.deepEqual(parseEmbed('Presentations/Deck.md'),{path:'Presentations/Deck.md'});
 assert.throws(()=>parseEmbed('{"path":42}'));
 assert.throws(()=>parseEmbed(''));
 assert.throws(()=>parseEmbed('one\ntwo'));
});
test('navigation is bounded including empty and shortened decks',()=>{
 assert.equal(embedPage(-1,3),0);assert.equal(embedPage(5,3),2);
 assert.equal(embedPage(2,0),0);assert.equal(embedPage(2,2),1);
});
