import test from 'node:test';
import assert from 'node:assert/strict';
import {embeds,embedSource,moveToGroup,removeMember} from '../src/note-authoring';
import {parseGroup} from '../src/practice-state';
const prompt='Read the passage.\n\n| Time | Rate |\n| --- | --- |\n| 1 | $x^2$ |\n\n![[figure.png]]\n\n```python\nx = 2\n```';
test('group stimulus round trips Markdown math, table, image and code',()=>{
 const blocks=embeds(embedSource(['a','b'],'Shared stimulus',prompt));
 assert.equal(blocks.length,1);assert.equal(blocks[0].prompt,prompt);
 assert.throws(()=>parseGroup('title: Test\nprompt: 42\nquestions: [a]'));
});
test('moving and removing members preserve each shared stimulus',()=>{
 let note=embedSource(['a','b'],'First',prompt)+'\n\n'+embedSource(['c'],'Second','Another passage');
 let [a,b]=embeds(note);note=moveToGroup(note,a,'a',b);
 assert.equal(embeds(note)[0].prompt,prompt);assert.equal(embeds(note)[1].prompt,'Another passage');
 note=removeMember(note,embeds(note)[0],'b');assert.ok(note.startsWith(prompt));
});
