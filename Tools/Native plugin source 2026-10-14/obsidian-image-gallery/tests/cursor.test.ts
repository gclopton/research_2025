import { test } from "node:test";
import assert from "node:assert/strict";
import { embedAtCursor } from "../src/embeds";
test("cursor controls select exact repeated occurrence and fail closed between two images", () => {
  const text = "![[a.png]] ![[a.png]]";
  assert.equal(embedAtCursor(text, 13)?.start, 11);
  assert.equal(embedAtCursor(text, 10), undefined);
  assert.equal(embedAtCursor(text, text.length), undefined);
});
test("single-image line fallback preserves callout context and ignores fenced code", () => {
  const text = "> ![[a.png|right|600]]\ncaption\n```\n![[a.png]]\n```";
  assert.equal(embedAtCursor(text, 0)?.label, "right|600");
  assert.equal(embedAtCursor(text, 24), undefined);
  assert.equal(embedAtCursor(text, text.indexOf("![[a.png]]")), undefined);
});
