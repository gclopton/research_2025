import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {questions,chapterRoot,placement} from '../scripts/kinematics-practice';import {parseQuestion,grade} from '../src/model';import {embeds} from '../src/note-authoring';
test('42 original questions cover sections 1 to 4 with chapter metadata and resolvable embeds',()=>{assert.equal(questions.length,42);const ids=new Set(questions.map(q=>q.definition.id));assert.equal(ids.size,42);const blocks=embeds(readFileSync(`fixtures/${chapterRoot}/Sections 1–4 practice.md`,'utf8'));assert.equal(blocks.flatMap(b=>b.ids).length,42);for(const block of blocks)for(const id of block.ids)assert.ok(ids.has(id));for(const q of questions){assert.ok(/^[1-4](\.|$)/.test(q.section));const parsed=parseQuestion(readFileSync(`fixtures/${chapterRoot}/Questions/${q.definition.id}.md`,'utf8'),'question.md');assert.deepEqual(parsed.definition.chapters,[placement]);assert.equal(parsed.definition.id,q.definition.id);}assert.ok(blocks.some(b=>!b.group));assert.ok(blocks.some(b=>b.group));});
test('answer keys yield full credit for auto-graded questions; essays remain rubric based',()=>{for(const q of questions){const parsed=parseQuestion(readFileSync(`fixtures/${chapterRoot}/Questions/${q.definition.id}.md`,'utf8'),'question.md');if(parsed.definition.written){assert.ok(parsed.definition.written.rubric.length>=2);continue;}const response={choices:parsed.definition.correct??[],blanks:Object.fromEntries((parsed.definition.answers??[]).map(a=>[a.id,a.accepted[0]]))};const result=grade(parsed,response);assert.equal(result.earned,result.possible,q.definition.title);assert.ok(result.possible>0);}});
test('generated LaTeX survives JSON, YAML and Markdown without cooked escapes',()=>{
 const strings=(value:unknown):string[]=>typeof value==='string'?[value]:Array.isArray(value)?value.flatMap(strings):value&&typeof value==='object'?Object.values(value).flatMap(strings):[];
 for(const q of questions){
  const parsed=parseQuestion(readFileSync('fixtures/'+chapterRoot+'/Questions/'+q.definition.id+'.md','utf8'),'question.md');
  assert.deepEqual(parsed.definition,q.definition);assert.equal(parsed.prompt,q.prompt);assert.equal(parsed.explanation,q.explanation);
  for(const text of strings(q)){assert.ok(!/[\x00-\x08\x0b-\x1f]/.test(text),q.definition.id);
   for(const math of text.matchAll(/\$([^$]+)\$/g))assert.ok(!/(?<!\\)\b(?:mathbf|mathrm|partial|varepsilon|nabla|omega|Omega|Delta|mathcal|gamma|theta|cdot)\b/.test(math[1]),q.definition.id+': '+math[1]);
  }
 }
 const table=questions.find(q=>q.definition.id==='fk-tensor-table')!;
 assert.ok(table.prompt.includes('\\begin{bmatrix}2&6&0\\\\-2&-2&0\\\\0&0&0\\end{bmatrix}'));
 assert.equal(table.definition.table!.rows[3][0].text,'$\\nabla\\cdot\\mathbf V$');
 assert.ok(table.explanation.includes('\\dot\\varepsilon'));
});
