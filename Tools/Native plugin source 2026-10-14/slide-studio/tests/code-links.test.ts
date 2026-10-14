import { test } from 'node:test';
import assert from 'node:assert/strict';
import { codeLinksBridge, replaceBlockLinkText } from '../src/code-links';
import { newSlide, block, serialize, deserialize } from '../src/model';
test('optional Code Links host contract ignores absent or older plugins', () => {
 assert.equal(codeLinksBridge({}), null);
 assert.equal(codeLinksBridge({plugins:{getPlugin:()=>({})}}), null);
 const plugin = {renderInHost(){},async replace(){}};
 assert.equal(codeLinksBridge({plugins:{getPlugin:id=>{assert.equal(id,'code-links');return plugin;}}}), plugin);
});
test('edits are scoped to one block and preserve source metadata and sibling links', () => {
 const raw='!{{runs/OUTCAR#L12-L14,L28-L30|Forces}}{height=5}';
 const slide=newSlide('Sources'); slide.source='Research/source.md#Question';
 const a=block(raw),b=block(raw);slide.blocks=[a,b];
 const replacement='!{{runs/OUTCAR#^abc|Energy $&}}{height=5}';
 a.text=replaceBlockLinkText(a.text,raw,replacement);
 const saved=deserialize(serialize(slide));
 assert.deepEqual(saved,slide); assert.equal(a.text,replacement); assert.equal(b.text,raw);
 assert.throws(()=>replaceBlockLinkText('changed',raw,replacement));
 assert.throws(()=>replaceBlockLinkText(raw+'\n'+raw,raw,replacement));
});
