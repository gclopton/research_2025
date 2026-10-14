import { test } from "node:test";
import assert from "node:assert/strict";
import {
  template,
  parseQuestion,
  grade,
  orderChoices,
  makeAttempt,
  serialize,
} from "../src/model";
const q = (type: "choice" | "blank" | "table") =>
  parseQuestion(template(type, "fixture", "Fixture"), "Fixture.md");
test("all three portable formats round-trip with mathematics", () => {
  for (const type of ["choice", "blank", "table"] as const) {
    const a = q(type);
    const b = parseQuestion(
      serialize(
        a.definition,
        a.prompt + "\n$$L_{ij}=\\frac{\\partial u_i}{\\partial x_j}$$",
        a.explanation,
      ),
      "Renamed.md",
    );
    assert.equal(b.definition.id, "fixture");
    assert.match(b.prompt, /\\frac/);
    assert.equal(b.path, "Renamed.md");
  }
});
test("multi-select uses exact sets: extra or missing answers cannot earn credit", () => {
  const a = q("choice");
  a.definition.choices!.push({ id: "c", text: "C" });
  a.definition.correct = ["a", "c"];
  assert.equal(grade(a, { choices: ["c", "a"], blanks: {} }).earned, 1);
  for (const selected of [[], ["a"], ["a", "b", "c"]])
    assert.equal(grade(a, { choices: selected, blanks: {} }).earned, 0);
});
test("blank matching accepts alternatives, whitespace and case but no fuzzy mathematics", () => {
  const a = q("blank");
  a.definition.answers![0].accepted = ["Velocity gradient", "L"];
  assert.equal(
    grade(a, { choices: [], blanks: { a: " VELOCITY   gradient " } }).earned,
    1,
  );
  assert.equal(grade(a, { choices: [], blanks: { a: "2*L/2" } }).earned, 0);
  a.definition.answers![0].caseSensitive = true;
  assert.equal(grade(a, { choices: [], blanks: { a: "l" } }).earned, 0);
  assert.equal(grade(a, { choices: [], blanks: { a: "" } }).earned, 0);
});
test("table grading weights blanks independently and keeps fixed cells out of score", () => {
  const a = q("table");
  a.definition.answers!.push({ id: "b", accepted: ["second"] });
  a.definition.table!.rows.push([{ text: "Other" }, { blank: "b" }]);
  const b = parseQuestion(serialize(a.definition, a.prompt), "Table.md");
  assert.deepEqual(
    grade(b, { choices: [], blanks: { a: "answer", b: "wrong" } }).details.map(
      (x) => x.correct,
    ),
    [true, false],
  );
  assert.equal(grade(b, { choices: [], blanks: { a: "answer" } }).possible, 2);
});
test("invalid layouts, unmatched IDs, duplicate IDs and unknown schema fail clearly", () => {
  const a = q("table");
  a.definition.table!.rows[0].pop();
  assert.throws(() => serialize(a.definition, a.prompt), /column count/);
  const b = q("blank");
  b.definition.answers![0].id = "missing";
  assert.throws(() => serialize(b.definition, b.prompt), /must match/);
  const c = q("choice");
  c.definition.choices![1].id = "a";
  assert.throws(() => serialize(c.definition, c.prompt), /Duplicate/);
  assert.throws(
    () =>
      parseQuestion(
        template("choice", "q", "Q").replace("version: 1", "version: 9"),
        "q",
      ),
    /version/,
  );
});
test("merged table cells are rejected rather than silently flattened", () => {
  const a = q("table");
  (a.definition.table!.rows[0][0] as any).rowspan = 2;
  assert.throws(() => serialize(a.definition, a.prompt), /Merged/);
});
test("shuffling preserves IDs and does not mutate the question", () => {
  const a = q("choice");
  const before = structuredClone(a);
  assert.deepEqual(
    orderChoices(a, () => 0),
    ["b", "a"],
  );
  assert.deepEqual(a, before);
  a.definition.shuffle = false;
  assert.deepEqual(
    orderChoices(a, () => 0),
    ["a", "b"],
  );
});
test("attempt is an immutable snapshot and reveal is unscored", () => {
  const a = q("blank"),
    r = { choices: [], blanks: { a: "answer" } };
  const attempt = makeAttempt(
    a,
    r,
    [],
    "attempt",
    "note",
    "2026-09-28",
    "attempt1",
  );
  a.definition.answers![0].accepted = ["changed"];
  r.blanks.a = "changed";
  assert.equal(attempt.question.definition.answers![0].accepted[0], "answer");
  assert.equal(attempt.response.blanks.a, "answer");
  assert.equal(attempt.grade!.earned, 1);
  assert.equal(
    makeAttempt(a, r, [], "reveal", "note", "now", "attempt2").grade,
    null,
  );
});

import { selectVariants } from "../src/model";
test("families select one by default, multiple without repeats, preserving standalone questions", () => {
  const a = q("table"),
    b = q("table"),
    c = q("table"),
    solo = q("blank");
  a.definition.id = "lhs";
  b.definition.id = "rhs";
  c.definition.id = "mixed";
  for (const item of [a, b, c]) item.definition.familyId = "identity";
  solo.definition.id = "standalone";
  const bank = [a, b, c, solo];
  assert.equal(selectVariants(bank, 1, () => 0).length, 2);
  assert.equal(selectVariants(bank, 2, () => 0).length, 3);
  assert.equal(selectVariants([...bank, a], 99, () => 0).length, 4);
  assert.deepEqual(
    bank.map((q) => q.definition.id),
    ["lhs", "rhs", "mixed", "standalone"],
  );
  assert.throws(() => selectVariants(bank, 0), /positive/);
});
