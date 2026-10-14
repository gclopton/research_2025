import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkedReplacement } from '../src/persistence';
test('compare-before-write preserves an external edit', () => {
  let disk = 'external edit';
  assert.throws(() => {
    disk = checkedReplacement(disk, 'old source', 'local draft');
  }, /changed outside/);
  assert.equal(disk, 'external edit');
});
test('a second editor with stale state cannot overwrite the first editor', () => {
  let disk = 'initial';
  disk = checkedReplacement(disk, 'initial', 'first editor');
  assert.throws(() => {
    disk = checkedReplacement(disk, 'initial', 'second editor');
  }, /changed outside/);
  assert.equal(disk, 'first editor');
});
test('successive acknowledged writes preserve the latest draft', () => {
  let disk = 'initial';
  disk = checkedReplacement(disk, 'initial', 'draft one');
  disk = checkedReplacement(disk, 'draft one', 'draft two');
  assert.equal(disk, 'draft two');
});
