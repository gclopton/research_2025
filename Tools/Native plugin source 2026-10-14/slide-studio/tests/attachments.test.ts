import test from 'node:test';
import assert from 'node:assert/strict';
import { isImageFile, imageName, localImageFolder, imageGeometry } from '../src/attachments';

test('external screenshots are recognized without trusting arbitrary file extensions', () => {
  assert.equal(isImageFile({ name: 'Screenshot.PNG', type: '' }), true);
  assert.equal(isImageFile({ name: 'image', type: 'image/png' }), true);
  assert.equal(isImageFile({ name: 'notes.pdf', type: 'application/pdf' }), false);
  assert.equal(imageName({ name: 'Screenshot #1.png', type: 'image/png' }), 'Screenshot -1.png');
  assert.equal(imageName({ name: '', type: 'image/jpeg' }), 'Screenshot.jpg');
});
test('fallback attachment folders are relative to the slide, including root notes', () => {
  assert.equal(localImageFolder('Slides/Part I/Introduction.md'), 'Slides/Part I/images');
  assert.equal(localImageFolder('Introduction.md'), 'images');
});
test('large dropped images fit the content area and preserve proportions', () => {
  assert.deepEqual(imageGeometry(1920, 1080, 1550, 880), { w: 720, h: 405, x: 880, y: 387 });
  assert.deepEqual(imageGeometry(300, 900, -10, -10), { w: 160, h: 480, x: 0, y: 0 });
});
