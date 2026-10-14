import { test } from "node:test";
import assert from "node:assert/strict";
import {
  blankScene,
  readScene,
  scenePath,
  assertUnchanged,
  SaveQueue,
} from "../src/model";
test("scene round trip retains strokes and image assets", () => {
  const scene = blankScene("id");
  scene.elements = [
    {
      type: "freedraw",
      points: [
        [1, 2],
        [3, 4],
      ],
      pressures: [0.2, 0.7],
    },
  ];
  scene.files = { image: { dataURL: "data:image/png;base64,abc" } };
  assert.deepEqual(readScene(JSON.stringify(scene)), scene);
});
test("reject incompatible scene formats without mutating source", () => {
  for (const text of [
    "{}",
    "broken",
    JSON.stringify({ ...blankScene("id"), version: 2 }),
  ])
    assert.throws(() => readScene(text));
});
test("derive sibling data file without changing parent dots or filenames", () => {
  assert.equal(
    scenePath("Notes.v1/images/a.ink.svg"),
    "Notes.v1/images/a.ink.json",
  );
  assert.throws(() => scenePath("photo.svg"));
});
test("external edits are conflicts, not silently overwritten", () => {
  assert.doesNotThrow(() => assertUnchanged("old", "old"));
  assert.throws(() => assertUnchanged("external", "old"));
});
test("queue serializes saves and recovers after errors", async () => {
  const q = new SaveQueue();
  const calls: string[] = [];
  let release!: () => void;
  const wait = new Promise<void>((r) => (release = r));
  const a = q.run(async () => {
    await wait;
    calls.push("first");
  });
  const b = q.run(async () => {
    calls.push("second");
    throw new Error("disk full");
  });
  const caught = b.catch(() => {});
  const c = q.run(async () => {
    calls.push("third");
  });
  assert.deepEqual(calls, []);
  release();
  await Promise.all([a, caught, c]);
  assert.deepEqual(calls, ["first", "second", "third"]);
});
