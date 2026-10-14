import { test } from 'node:test';
import assert from 'node:assert/strict';
import { titleSlide } from '../src/presentation';
import { serialize, deserialize, newDeck, BOTTOM } from '../src/model';

test('starter presentation retains its source and independently editable title fields on disk', () => {
  const source = 'Books/Fluid Kinematics.md';
  const slide = titleSlide({ title: 'Fluid Kinematics' }, source);
  assert.equal(slide.type, 'intro');
  assert.equal(slide.source, source);
  assert.deepEqual(slide.blocks.map(b => b.text), [
    '# Fluid Kinematics', 'Author name', 'Department · Institution', 'Date',
  ]);
  assert.equal(new Set(slide.blocks.map(b => b.id)).size, 4);
  for (let i = 1; i < slide.blocks.length; i++)
    assert.ok(slide.blocks[i-1].y + slide.blocks[i-1].h <= slide.blocks[i].y);
  assert.ok(slide.blocks.every(b => b.y + b.h <= BOTTOM));
  assert.deepEqual(deserialize(serialize(slide)), slide);
  const deck = newDeck(slide.title, [{ id: slide.id, file: 'Slides/Fluid Kinematics.md', section: '' }]);
  assert.deepEqual(deserialize(serialize(deck)), deck);
  assert.equal(deck.slides.length, 1);
  assert.equal(deck.slides[0].id, slide.id);
});

test('entered details replace placeholders and optional event is omitted unless supplied', () => {
  const slide = titleSlide({ title: ' Flow ', author: 'A. Researcher', affiliation: 'Lab', date: 'October 7, 2026', event: 'Seminar' });
  assert.deepEqual(slide.blocks.map(b => b.text), ['# Flow', 'A. Researcher', 'Lab', 'October 7, 2026', 'Seminar']);
  assert.ok(slide.blocks.at(-1)!.y + slide.blocks.at(-1)!.h <= BOTTOM);
  assert.equal(titleSlide({ title: '', event: '  ' }).blocks.length, 4);
});
