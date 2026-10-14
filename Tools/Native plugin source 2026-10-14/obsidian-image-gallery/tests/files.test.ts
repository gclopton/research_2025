import { test } from "node:test";
import assert from "node:assert/strict";
import {
  linkAt,
  pickedLink,
  folderMatches,
  kindMatches,
  usefulFile,
} from "../src/files";
test("nested image categories and folder prefix stay independent", () => {
  assert(folderMatches("a/assets/nested/plot.svg", "a", "assets"));
  assert(!folderMatches("aa/assets/a.png", "a", "assets"));
  assert(!folderMatches("a/figures/a.png", "", "images"));
  assert(folderMatches("a/figures/nested/a.png", "", "figures"));
});
test("link replacement covers only the active pair and preserves display text", () => {
  const text = "Before [[Old note|caption]] after [[Other]]";
  const slot = linkAt(text, 14)!;
  assert.equal(text.slice(slot.start, slot.end), "[[Old note|caption]]");
  assert.equal(pickedLink("New.md", false, slot), "[[New.md|caption]]");
  assert.equal(
    text.slice(0, slot.start) +
      pickedLink("New.md", false, slot) +
      text.slice(slot.end),
    "Before [[New.md|caption]] after [[Other]]",
  );
});
test("unfinished links seed search, code fragments survive replacement", () => {
  assert.equal(linkAt("Text [[ceria", 12)?.query, "ceria");
  const slot = linkAt("{{scripts/a.py#L2-L9|Method}}", 10)!;
  assert.equal(slot.query, "scripts/a.py");
  assert.equal(
    pickedLink("scripts/b.py", true, slot),
    "{{scripts/b.py#L2-L9|Method}}",
  );
  assert.equal(linkAt("{{blank:a}}", 7), undefined);
});
test("images remain embedded when replacing only their wiki target", () => {
  const text = "![[old.png|400]]";
  const slot = linkAt(text, 8)!;
  assert.equal(
    text.slice(0, slot.start) + pickedLink("images/new.png", false, slot),
    "![[images/new.png|400]]",
  );
});
test("junk compiled files are excluded and VASP files included", () => {
  assert(!usefulFile("scripts/__pycache__/a.pyc"));
  assert(!usefulFile("node_modules/lib/a.js"));
  assert(kindMatches("run/OUTCAR", "code"));
  assert(kindMatches("a.pdf", "pdf"));
  assert(!kindMatches("a.png", "notes"));
  assert.throws(() => pickedLink("bad#name.py", true));
});
