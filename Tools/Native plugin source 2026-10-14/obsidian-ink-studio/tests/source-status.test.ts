import { test } from "node:test";
import assert from "node:assert/strict";
import { sourceStatus } from "../src/source-status";
import type { AnnotationSource } from "../src/annotation";
const source = { excerpt: "original", from: 2, to: 10 } as AnnotationSource;
test("source status distinguishes unchanged, moved, changed, ambiguous and missing passages", () => {
  assert.equal(sourceStatus("  original end", source), "Source unchanged");
  assert.equal(
    sourceStatus("prefix original end", source),
    "Source unchanged (moved)",
  );
  assert.match(sourceStatus("edited", source), /Earlier snapshot/);
  assert.match(sourceStatus("original original", source), /ambiguous/);
  assert.match(sourceStatus(null, source), /missing/);
});
