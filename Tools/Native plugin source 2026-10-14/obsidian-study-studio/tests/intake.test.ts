import {test} from 'node:test';
import assert from 'node:assert/strict';
import {selectedTable,intakeDraft,cardInsertion,calloutSelection} from '../src/intake';
import {validate,parseQuestion} from '../src/model';
import {tableDraft,toggleBlank,applyTable,editedSource} from '../src/authoring-model';
test('imports a complete mathematical table as answer cells with preserved source',()=>{
 const text='| Function | Derivative |\n| :--- | ---: |\n| $x^2$ | $2x$ |\n| $x$ | $1$ |';
 const q=intakeDraft('table','qa-import','Derivatives',text,'Questions/Test.md');
 assert.deepEqual(q.definition.table?.columns,['Function','Derivative']);
 assert.equal(q.definition.table?.rows[0][0].sourceText,'$x^2$');
 assert.equal(q.definition.answers?.length,4);
 const grid=tableDraft(q);toggleBlank(grid.rows[0][0]);toggleBlank(grid.rows[1][0]);
 const saved=parseQuestion(editedSource(q,applyTable(q.definition,grid),"Supply the derivatives.",q.explanation),q.path);
 assert.equal(saved.definition.answers?.[0].accepted[0],'2x');
 assert.equal(saved.definition.table?.rows[0][1].sourceText,'$2x$');
});
test('table parser respects escaped pipes and inline code',()=>{
 const table=selectedTable('| a | b |\n| --- | --- |\n| `a|b` | $a \\| b$ |');
 assert.equal(table?.rows[0][0].text,'`a|b`');assert.equal(table?.rows[0][1].text,'$a \\| b$');
 assert.throws(()=>selectedTable('| a | b |\n| --- | --- |\n| x |'));
 assert.equal(selectedTable('ordinary prose'),null);
});
test('blank intake preserves selected passage and waits for user to choose blanks',()=>{
 const text='The derivative of $x^2$ is $2x$.';
 const q=intakeDraft('blank','qa-blank','Derivative',text,'Questions/Test.md');
 assert.equal(q.prompt,text);assert.deepEqual(q.definition.answers,[]);
 assert.throws(()=>validate(q.definition,q.prompt));
 assert.equal(intakeDraft('choice','qa-choice','Derivative',text,'Questions/Test.md').prompt,text);
});
test('card insertion preserves the entire source even for a midline selection',()=>{
 const source='Before selected after\nNext paragraph';const patch=cardInsertion(source,15,'id');
 assert.equal(patch.at,21);const next=source.slice(0,patch.at)+patch.text+source.slice(patch.at);
 assert.equal(next.replace(patch.text,''),source);assert.match(next,/Before selected after\n\n```study\nid\n```/);
 assert.equal(cardInsertion('last line',9,'id').at,9);
});
test('partial multiline definition strips only wrapper and inserts after complete callout',()=>{
 const source='Before\n\n> [!definition]+ Streakline\n> A **line** at $t$.\n> More $x>0$ details.\n>\n> Unselected tail.\n\nAfter';
 const from=source.indexOf('A **'),to=source.indexOf(' details.')+9;
 const intake=calloutSelection(source,from,to);
 assert.equal(intake.text,'A **line** at $t$.\nMore $x>0$ details.');
 assert.equal(source.slice(0,intake.insertionEnd).endsWith('> Unselected tail.'),true);
 const patch=cardInsertion(source,intake.insertionEnd,'q');
 const next=source.slice(0,patch.at)+patch.text+source.slice(patch.at);
 assert.equal(next.replace(patch.text,''),source);
 assert.ok(next.indexOf('```study')>next.indexOf('> Unselected tail.'));
});
test('whole callout drops heading and imports its table',()=>{
 const source='> [!note]- Table\n> | A | B |\n> | --- | --- |\n> | $x$ | $y$ |';
 const intake=calloutSelection(source,0,source.length);
 assert.equal(selectedTable(intake.text)?.rows[0][0].text,'$x$');
});
test('ordinary quotes, fenced examples and math greater-than signs stay literal',()=>{
 for(const source of ['> A quote\n> Another line','```md\n> [!note] Example\n> body\n```','$x>0$'])
   assert.equal(calloutSelection(source,0,source.length).text,source);
});
test('adjacent callout stays after inserted card and partial first line is preserved',()=>{
 const source='> [!note] One\n> abc def\n> tail\n> [!note] Two\n> next';
 const intake=calloutSelection(source,source.indexOf('def'),source.indexOf('def')+3);
 assert.equal(intake.text,'def');assert.equal(intake.insertionEnd,source.indexOf('\n> [!note] Two'));
});

test('card follows the callout block ID so existing links keep their target',()=>{
 const source='> [!definition] D\n> body\n^definition-1\n\nAfter';
 const picked=calloutSelection(source,source.indexOf('body'),source.indexOf('body')+4);
 assert.equal(source.slice(0,picked.insertionEnd).endsWith('^definition-1'),true);
});

test('new multiple choice draft has no filler choices or implied correct answer',()=>{
 const q=intakeDraft('choice','empty-choice','Empty choice','Selected real prompt','Question.md');
 assert.deepEqual(q.definition.choices?.map(c=>c.text),['','']);
 assert.deepEqual(q.definition.correct,[]);
 assert.equal(q.prompt,'Selected real prompt');
 assert.equal(q.explanation,'');
});

test('new table authoring starts with empty required answer cells and no filler',()=>{
 const q=intakeDraft('table','empty-table','Empty table','','Question.md');
 assert.equal(q.prompt,'');assert.equal(q.explanation,'');assert.equal(q.definition.answers?.length,4);assert.ok(q.definition.answers?.every(a=>!a.accepted.length));
 assert.deepEqual(q.definition.table?.columns,['','']);assert.equal(new Set(q.definition.table?.rows.flat().map(c=>c.blank)).size,4);
 const grid=tableDraft(q);assert.ok(grid.rows.flat().every(c=>c.blank&&c.text===''&&c.accepted===''));
 const imported=intakeDraft('table','imported','Imported','| Function | Value |\n| --- | --- |\n| $x$ | $2$ |','Question.md');
 assert.equal(imported.prompt,'');assert.equal(imported.explanation,'');assert.deepEqual(imported.definition.table?.columns,['Function','Value']);assert.equal(imported.definition.table?.rows[0][1].sourceText,'$2$');
});
