import { test } from "node:test";
import assert from "node:assert/strict";
import { template, parseQuestion, grade } from "../src/model";
import {
  tableDraft,
  toggleBlank,
  applyTable,
  editedSource,
  checkedReplacement,
} from "../src/authoring-model";
const question = () =>
  parseQuestion(template("table", "table", "Table"), "Table.md");
test("turning a supplied equation into a blank retains its content and seeds a plain answer", () => {
  const q = question(),
    g = tableDraft(q),
    cell = g.rows[0][1];
  assert.equal(cell.text, "$2$");
  toggleBlank(cell);
  assert.equal(cell.accepted, "2");
  const d = applyTable(q.definition, g);
  const updated = parseQuestion(
    editedSource(q, d, q.prompt, q.explanation),
    "Table.md",
  );
  assert.equal(
    grade(updated, { choices: [], blanks: { [cell.id]: "2", a: "answer" } })
      .earned,
    2,
  );
  toggleBlank(cell);
  assert.equal(applyTable(q.definition, g).table!.rows[0][1].text, "$2$");
  assert.equal(q.definition.answers!.length, 1);
});
test("editing a grid preserves stable blank IDs and alternative/case rules", () => {
  const q = question(),
    g = tableDraft(q);
  g.rows[1][1].accepted = "Answer\nAlternative";
  g.rows[1][1].caseSensitive = true;
  const d = applyTable(q.definition, g);
  assert.deepEqual(d.answers, [
    { id: "a", accepted: ["Answer", "Alternative"], caseSensitive: true },
  ]);
  assert.equal(d.table!.rows[1][1].blank, "a");
});
test("removing a row removes its answer rules and new columns remain rectangular", () => {
  const q = question(),
    g = tableDraft(q);
  toggleBlank(g.rows[0][1]);
  g.rows.splice(1, 1);
  const d = applyTable(q.definition, g);
  assert.equal(d.answers!.length, 1);
  assert.doesNotThrow(() => editedSource(q, d, q.prompt, q.explanation));
});
test("rules save preserves unrelated frontmatter, comments and untouched body bytes", () => {
  let q = question();
  q = parseQuestion(
    q.raw.replace(
      "study:",
      "# custom property\naliases: [Example]\ncustom: keep-me\nstudy:",
    ) + "\n",
    "Table.md",
  );
  const d = structuredClone(q.definition);
  d.title = "Changed";
  const next = editedSource(q, d, q.prompt, q.explanation);
  assert.match(next, /# custom property/);
  assert.match(next, /aliases: \[\s*Example\s*\]/);
  assert.match(next, /custom: keep-me/);
  assert.equal(next.split("\n---\n")[1], q.raw.split("\n---\n")[1]);
  assert.equal(parseQuestion(next, "Table.md").definition.id, "table");
});
test("conflict protection never replaces externally edited source", () => {
  assert.equal(checkedReplacement("old", "old", "next"), "next");
  assert.throws(
    () => checkedReplacement("external", "old", "next"),
    /nothing was overwritten/,
  );
});
test("invalid or empty accepted answers cannot save", () => {
  const q = question(),
    g = tableDraft(q);
  g.rows[1][1].accepted = "\n";
  assert.throws(
    () => editedSource(q, applyTable(q.definition, g), q.prompt, q.explanation),
    /nonempty/,
  );
});

test("saving and reopening a blank retains its original Markdown for unblanking", () => {
  const q = question(),
    g = tableDraft(q);
  toggleBlank(g.rows[0][1]);
  const saved = parseQuestion(
    editedSource(q, applyTable(q.definition, g), q.prompt, q.explanation),
    "Table.md",
  );
  const reopened = tableDraft(saved);
  assert.equal(reopened.rows[0][1].text, "$2$");
  toggleBlank(reopened.rows[0][1]);
  assert.equal(
    applyTable(saved.definition, reopened).table!.rows[0][1].text,
    "$2$",
  );
});

import {newAnswerCell,setTableCellText,tableIssues} from '../src/authoring-model';
test('answer-first cells synchronize their grading answer while preserving alternatives',()=>{
 const cell=newAnswerCell();assert.equal(cell.blank,true);setTableCellText(cell,'$x^2$');assert.equal(cell.accepted,'x^2');
 cell.accepted+='\nx*x';setTableCellText(cell,'$x^{2}$');assert.equal(cell.accepted,'x^{2}\nx*x');
 toggleBlank(cell);assert.equal(cell.blank,false);setTableCellText(cell,'');
 const grid={columns:['Given','Answer'],rows:[[cell,newAnswerCell()]]};
 assert.deepEqual(tableIssues(grid).map(i=>i.field),['answer:0:1']);
 setTableCellText(grid.rows[0][1],'42');assert.deepEqual(tableIssues(grid),[]);
 const d=applyTable(question().definition,grid);assert.deepEqual(d.table?.rows[0][0],{text:''});assert.equal(d.answers?.[0].accepted[0],'42');
});
test('table validation permits empty headings and formatting cells but requires answers',()=>{
 const a=newAnswerCell(),b=newAnswerCell();b.blank=false;
 const grid={columns:['','Named'],rows:[[a,b]]};assert.deepEqual(tableIssues(grid).map(i=>i.field),['answer:0:0']);
 a.blank=false;assert.deepEqual(tableIssues(grid).map(i=>i.field),['blanks']);
});

 test('empty table headings survive validation and a saved-question round trip',()=>{const q=question(),grid=tableDraft(q);grid.columns=['',''];const saved=parseQuestion(editedSource(q,applyTable(q.definition,grid),q.prompt,q.explanation),q.path);assert.deepEqual(saved.definition.table?.columns,['','']);});
