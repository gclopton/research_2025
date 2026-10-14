import { test } from "node:test";
import assert from "node:assert/strict";
import {
  scanEmbeds,
  changedEmbed,
  replaceExact,
  layout,
  foldersFor,
} from "../src/embeds";
test("replace only selected repeated attachment in a nested callout, preserving caption and title", () => {
  const s =
    'Before\n> [!figure] Caption\n> > ![center|800](<images/old photo.png> "Keep this title")\n> > Caption **unchanged**.\n\n![other](<images/old photo.png>)\nAfter';
  const e = scanEmbeds(s);
  assert.equal(e.length, 2);
  const next = replaceExact(
    s,
    s,
    e[0],
    changedEmbed(e[0], { destination: "images/new image.png" }),
  );
  assert.equal(
    next,
    s.replace("<images/old photo.png>", "<images/new%20image.png>"),
  );
});
test("wiki replacement retains alias, layout, size and only edits one occurrence", () => {
  const s = "> ![[a.png|caption|right|480x240]]\n> ![[a.png|300]]";
  const [a, b] = scanEmbeds(s);
  assert.equal(
    changedEmbed(a, { destination: "new/f.png" }),
    "![[new/f.png|caption|right|480x240]]",
  );
  assert.equal(changedEmbed(b, { width: null }), "![[a.png]]");
  assert.equal(changedEmbed(a, { width: 360 }), "![[a.png|caption|right|360]]");
});
test("align and natural size preserve alt, caption surroundings and path spelling", () => {
  const e = scanEmbeds('![caption|center|800](images/a%20b.png "Title")')[0];
  assert.equal(
    changedEmbed(e, { align: "left", width: null }),
    '![caption|left](images/a%20b.png "Title")',
  );
  assert.equal(
    changedEmbed(scanEmbeds("![[a.png]]")[0], { align: "center", width: 300 }),
    "![[a.png|center|300]]",
  );
});
test("ignores inline/fenced code, escaped markers and comments, including callout fences", () => {
  const s =
    "`![code](a.png)`\n> ```md\n> ![[code.png]]\n> ```\n\\![literal](a.png)\n<!-- ![[comment.png]] -->\n%% ![[hidden.png]] %%\n![real](a.png)";
  assert.deepEqual(
    scanEmbeds(s).map((e) => e.raw),
    ["![real](a.png)"],
  );
});
test("balanced and escaped paths and labels; reference images deliberately excluded", () => {
  const s = '![a [b]](fig(1).png "title") ![x](fig\\(2\\).png) ![ref][id]';
  const e = scanEmbeds(s);
  assert.equal(e.length, 2);
  assert.equal(e[0].destination, "fig(1).png");
  assert.equal(e[1].destination, "fig\\(2\\).png");
  assert.equal(
    changedEmbed(e[0], { destination: "new (x).png" }),
    '![a [b]](new%20%28x%29.png "title")',
  );
});
test("stale snapshots fail closed, including moved duplicate embeds", () => {
  const s = "![[a.png]]\n![[a.png]]";
  const e = scanEmbeds(s)[1];
  assert.throws(
    () => replaceExact("Changed\n" + s, s, e, "![[b.png]]"),
    /note changed/,
  );
});
test("invalid sizes are rejected, existing dimensions stay until explicitly changed", () => {
  const e = scanEmbeds("![alt|100x50](a.png)")[0];
  for (const width of [0, -1, 1.5, NaN, 10001])
    assert.throws(() => changedEmbed(e, { width }), /Width/);
  assert.equal(
    changedEmbed(e, { align: "right" }),
    "![alt|right|100x50](a.png)",
  );
  assert.deepEqual(layout("caption|center|600"), {
    alt: "caption",
    width: 600,
    height: undefined,
    align: "center",
  });
});
test("folder scope resolves attachment folder relative to the note, not vault root", () => {
  assert.deepEqual(foldersFor("Books/Ch1/note.md", "./images", "Figures"), [
    "Figures",
    "Books/Ch1/images",
    "Books/Ch1/attachments",
  ]);
  assert.deepEqual(foldersFor("note.md", "Attachments", ""), [
    "Attachments",
    "images",
    "attachments",
  ]);
});

test("frontmatter is not editable image content and paths escape reserved characters", () => {
  const text =
    '---\nexample: "![[ignored.png]]"\n---\n![center|100](old.png "title")';
  const items = scanEmbeds(text);
  assert.equal(items.length, 1);
  assert.equal(
    changedEmbed(items[0], { destination: "images/50% #1?.png" }),
    '![center|100](images/50%25%20%231%3F.png "title")',
  );
});
