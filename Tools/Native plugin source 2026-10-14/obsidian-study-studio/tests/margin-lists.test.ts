import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EditorState,EditorSelection,type StateCommand} from '@codemirror/state';
import {markdown,insertNewlineContinueMarkup} from '@codemirror/lang-markdown';
import {history,undo} from '@codemirror/commands';
import {syntaxTree} from '@codemirror/language';
import {changeListLevel,marginLists,newlineInMarginMath} from '../src/margin-lists';
function editor(doc:string,anchor=doc.length,head=anchor){let state=EditorState.create({doc,selection:EditorSelection.single(anchor,head),extensions:[markdown(),marginLists,history()]});return {get state(){return state;},run(command:StateCommand){return command({state,dispatch:tr=>{state=tr.state;}});}};}
// Tests exercise the same CodeMirror state/commands used by the margin editor.
test('Tab nests a bullet with math and links; Shift-Tab reverses it',()=>{const raw='- Parent\n- $E=mc^2$ and [[Paper]]',e=editor(raw);assert.ok(e.run(changeListLevel()));assert.equal(e.state.doc.toString(),'- Parent\n    - $E=mc^2$ and [[Paper]]');assert.match(syntaxTree(e.state).toString(),/ListItem\(ListMark,Paragraph,BulletList/);e.run(changeListLevel(true));assert.equal(e.state.doc.toString(),raw);});
test('numbered list nests and continues its number',()=>{const e=editor('1. Parent\n2. Child');e.run(changeListLevel());e.run(insertNewlineContinueMarkup);assert.equal(e.state.doc.toString(),'1. Parent\n    1. Child\n    2. ');});
test('checked task continues as unchecked at the nested level',()=>{const e=editor('- Parent\n- [x] Done');e.run(changeListLevel());e.run(insertNewlineContinueMarkup);assert.equal(e.state.doc.toString(),'- Parent\n    - [x] Done\n    - [ ] ');});
test('moves the whole subtree when caret is on its parent',()=>{const raw='- Before\n- Parent\n    - Child\n- After',e=editor(raw,raw.indexOf('Parent')+6);e.run(changeListLevel());assert.equal(e.state.doc.toString(),'- Before\n    - Parent\n        - Child\n- After');e.run(changeListLevel(true));assert.equal(e.state.doc.toString(),raw);});
test('selected siblings indent together, preserving following line',()=>{const raw='- Parent\n- One\n- Two\n- After',e=editor(raw,raw.indexOf('- One'),raw.indexOf('- After'));e.run(changeListLevel());assert.equal(e.state.doc.toString(),'- Parent\n    - One\n    - Two\n- After');});
test('first sibling is not turned into a code block',()=>{const e=editor('- First');assert.equal(e.run(changeListLevel()),true);assert.equal(e.state.doc.toString(),'- First');});
test('Tab outside a list is left to focus navigation',()=>{for(const raw of ['Prose','```\n- code\n```']){const e=editor(raw,raw.includes('code')?raw.indexOf('code')+4:raw.length);assert.equal(e.run(changeListLevel()),false);assert.equal(e.state.doc.toString(),raw);}});
test('undo restores text and caret after nesting',()=>{const raw='- Parent\n- Child',e=editor(raw);e.run(changeListLevel());e.run(undo);assert.equal(e.state.doc.toString(),raw);assert.equal(e.state.selection.main.head,raw.length);});
test('Enter on an empty root item leaves the list',()=>{const e=editor('- ');e.run(insertNewlineContinueMarkup);assert.equal(e.state.doc.toString(),'');});

test('keeps display math and a fenced block attached to their parent',()=>{const raw='- Before\n- Parent\n    $$\n    E=mc^2\n    $$\n\n    ```python\n    x = 1\n    ```\n- After',e=editor(raw,raw.indexOf('Parent')+6);e.run(changeListLevel());assert.ok(e.state.doc.toString().includes('        E=mc^2'));assert.ok(e.state.doc.toString().includes('        x = 1'));e.run(changeListLevel(true));assert.equal(e.state.doc.toString(),raw);});
test('Enter inside display math never inserts a bullet',()=>{const raw='- Parent\n    $$\n    E=mc^2\n    $$',e=editor(raw,raw.indexOf('E=mc^2')+6);assert.ok(e.run(newlineInMarginMath));assert.equal(e.state.doc.toString().match(/- /g)?.length,1);assert.ok(e.state.doc.toString().includes('E=mc^2\n'));});
test('blockquote list indentation is not corrupted',()=>{const raw='> - Parent\n> - Child',e=editor(raw);e.run(changeListLevel());assert.equal(e.state.doc.toString(),raw);});

test('caret inside a continued paragraph moves its whole list item',()=>{const raw='- Before\n- Parent\n  continued\n\n  $$\n  E=mc^2\n  $$\n- After';for(const word of ['continued','$$','E=mc^2']){const e=editor(raw,raw.indexOf(word)+1);e.run(changeListLevel());assert.ok(e.state.doc.toString().includes('    - Parent'));assert.ok(e.state.doc.toString().includes('      $$'));e.run(changeListLevel(true));assert.equal(e.state.doc.toString(),raw);}});
test('ordered levels get their own numbering and outdent rejoins parent',()=>{const raw='1. First\n2. Second\n3. Third',e=editor(raw);e.run(changeListLevel());assert.equal(e.state.doc.toString(),'1. First\n2. Second\n    1. Third');e.run(changeListLevel(true));assert.equal(e.state.doc.toString(),raw);});
test('joins an existing ordered child list',()=>{const e=editor('1. Parent\n    1. Child\n2. Next');e.run(changeListLevel());assert.equal(e.state.doc.toString(),'1. Parent\n    1. Child\n    2. Next');});
