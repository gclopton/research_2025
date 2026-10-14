import test from 'node:test';
import assert from 'node:assert/strict';
import {richTables,cellMarkdown,imageSpans,imageExtension} from '../src/rich-blocks';
test('tables preserve empty headings, alignment, escaped pipes and exact cell ranges',()=>{
 const source='Before\n\n| | Formula |\n| --- | ---: |\n| A | $x^2$ |\n| B | left \\| right |\n\nAfter';const [t]=richTables(source);
 assert.equal(t.rows.length,3);assert.equal(t.rows[0][0].text,'');assert.equal(t.align[1],'right');assert.equal(t.rows[2][1].text,'left \\| right');
 for(const row of t.rows)for(const cell of row)assert.equal(source.slice(cell.from,cell.to),cell.text);
 const cell=t.rows[1][1],updated=source.slice(0,cell.from)+'$y^2$'+source.slice(cell.to);
 assert.equal(richTables(updated)[0].rows[1][1].text,'$y^2$');assert.ok(updated.endsWith('After'));
});
test('code examples and ragged tables stay source; standard tables without edge pipes work',()=>{
 assert.equal(richTables('```md\n| A | B |\n|---|---|\n|1|2|\n```').length,0);
 assert.equal(richTables('|A|B|\n|---|---|\n|1|').length,0);
 assert.equal(richTables('A | B\n--- | ---\n1 | 2')[0].rows[1][1].text,'2');
});
test('cell edits escape structural pipes and preserve LaTeX and existing escapes',()=>{
 assert.equal(cellMarkdown('a|b\nc'), 'a\\|b<br>c');
 assert.equal(cellMarkdown('a\\|b'), 'a\\|b');assert.equal(cellMarkdown('\\frac{x}{y}'), '\\frac{x}{y}');
});
test('image embeds render but code examples do not; inline and block images differ',()=>{
 const source='![[figures/example.png|300]]\n\nText ![sample](assets/image.png) end.\n`![[literal.png]]`\n```md\n![example](skip.png)\n```';
 const spans=imageSpans(source);assert.equal(spans.length,2);assert.equal(spans[0].block,true);assert.equal(spans[1].block,false);
 assert.equal(imageExtension('image/png','clipboard'),'png');assert.equal(imageExtension('','photo.JPG'),'jpg');assert.equal(imageExtension('text/plain','note.txt'),undefined);
});

import {alignImage,imageAlignment} from '../src/rich-blocks';
test('image alignment round trips as one editable image without nesting wrappers',()=>{
 const image='![[figures/test.png|300]]',center=alignImage(image,'center');assert.equal(imageAlignment(center),'center');
 const spans=imageSpans('Before\n\n'+center+'\n\nAfter');assert.equal(spans.length,1);assert.equal(spans[0].raw,center);assert.equal(spans[0].block,true);
 const right=alignImage(center,'right');assert.equal((right.match(/<div/g)??[]).length,1);assert.equal(imageAlignment(right),'right');assert.ok(right.includes(image));
});
