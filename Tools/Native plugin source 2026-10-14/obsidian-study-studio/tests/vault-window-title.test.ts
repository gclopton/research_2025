import test from 'node:test';
import assert from 'node:assert/strict';
import {vaultWindowTitle} from '../src/vault-window-title';

test('vault identity survives long chapter names and punctuation in vault names', () => {
  assert.equal(vaultWindowTitle('docs', '22.A3 - Polaron Geometry - docs - Obsidian 1.14.4'), 'docs — 22.A3 - Polaron Geometry');
  assert.equal(vaultWindowTitle('A [B] + C', 'Results - A [B] + C - Obsidian 1.14.4'), 'A [B] + C — Results');
  assert.equal(vaultWindowTitle('docs', 'Notes - docs - something - docs - Obsidian 1.14.4'), 'docs — Notes - docs - something');
  assert.equal(vaultWindowTitle('docs', 'Chapter - docs - Obsidian v1.13.1'), 'docs — Chapter');
  assert.equal(vaultWindowTitle('docs', 'Chapter - docs - Obsidian v1.14.0-beta'), 'docs — Chapter');
  assert.equal(vaultWindowTitle('Cafe\u0301', 'Note - Café - Obsidian v1.13.1'), 'Café — Note');
});

test('empty windows, unknown title formats and repeated title updates retain identity', () => {
  assert.equal(vaultWindowTitle('docs', 'docs - Obsidian 1.14.4'), 'docs');
  assert.equal(vaultWindowTitle('docs', ''), 'docs');
  assert.equal(vaultWindowTitle('docs', 'Slide Studio'), 'docs — Slide Studio');
  assert.equal(vaultWindowTitle('docs', 'docs — Slide Studio'), 'docs — Slide Studio');
  assert.equal(vaultWindowTitle('docs', 'docs — Chapter - docs - Obsidian 1.14.4'), 'docs — docs — Chapter');
});
