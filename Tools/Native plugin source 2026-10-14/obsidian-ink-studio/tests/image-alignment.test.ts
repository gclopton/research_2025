import { test } from "node:test";
import assert from "node:assert/strict";
import { alignImage } from "../src/image-alignment";
test("wiki alignment preserves target, label and trailing image dimensions", () => {
  assert.equal(
    alignImage("![[images/a.png|Caption|450x300]]", "right"),
    "![[images/a.png|Caption|right|450x300]]",
  );
  assert.equal(alignImage("![[a.png]]", "center"), "![[a.png|center]]");
  assert.equal(
    alignImage("![[a.png|left|450]]", "center"),
    "![[a.png|center|450]]",
  );
});
test("markdown alignment preserves escaped alt and complex destination/title", () => {
  assert.equal(
    alignImage('![plot\\]|left|450](images/a(b).png "Title")', "right"),
    '![plot\\]|right|450](images/a(b).png "Title")',
  );
});
test("reset strips only alignment and keeps dimensions and caption", () => {
  assert.equal(
    alignImage("![[a.png|caption|center|450]]", "default"),
    "![[a.png|caption|450]]",
  );
  assert.equal(alignImage("![|right](a.png)", "default"), "![](a.png)");
});
