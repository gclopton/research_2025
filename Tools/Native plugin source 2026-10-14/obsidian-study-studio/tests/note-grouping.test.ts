import {test} from 'node:test';
import assert from 'node:assert/strict';
import {groupOccurrences} from '../src/note-grouping';
import {embeds,embedSource} from '../src/note-authoring';
test('group chosen occurrences in page order while preserving prose and other occurrences',()=>{
 const raw=`Intro\n${embedSource(['a'])}\nBetween\n${embedSource(['b'])}\nAfter\n${embedSource(['a'])}`;
 const blocks=embeds(raw),lines=blocks.slice(0,2).map(b=>raw.slice(0,b.start).split('\n').length-1);
 const result=groupOccurrences(raw,lines.reverse(),'Review','Shared passage');
 assert.deepEqual(embeds(result).map(b=>b.ids),[['a','b'],['a']]);assert.ok(result.includes('Between'));assert.ok(result.includes('After'));assert.equal(embeds(result)[0].prompt,'Shared passage');
 assert.throws(()=>groupOccurrences(raw,[999],'Bad'));
 assert.throws(()=>groupOccurrences(raw,[lines[1],raw.slice(0,blocks[2].start).split('\n').length-1],'Duplicates'));
});
test('empty groups serialize and parse so shared material can be authored first',()=>{
 const source=embedSource([],'Passage first','Read this.');assert.deepEqual(embeds(source)[0].ids,[]);assert.equal(embeds(source)[0].prompt,'Read this.');
});
