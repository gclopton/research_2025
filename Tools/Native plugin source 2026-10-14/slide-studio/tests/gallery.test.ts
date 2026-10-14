import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chooseImage, naturalImageGeometry } from '../src/gallery';
import { newSlide, block, serialize, deserialize, clampGeometry } from '../src/model';
test('optional gallery receives context and cancellation does not open fallback', async () => {
  let fallback = 0;
  const options = { sourcePath: 'Slides/a.md', currentPath: 'images/a.png', title: 'Replace' };
  const host = {
    plugins: {
      getPlugin: (id: string) => {
        assert.equal(id, 'image-gallery');
        return {
          api: {
            version: 1,
            pickImage: async (got: unknown) => {
              assert.deepEqual(got, options);
              return null;
            },
          },
        };
      },
    },
  };
  assert.equal(
    await chooseImage(host, options, async () => {
      fallback++;
      return { path: 'wrong' };
    }),
    null,
  );
  assert.equal(fallback, 0);
});
test('absent and incompatible gallery use filename fallback', async () => {
  for (const host of [{}, { plugins: { getPlugin: () => ({ api: { version: 2 } }) } }])
    assert.deepEqual(
      await chooseImage(host, { sourcePath: 'a.md', title: 'Add' }, async () => ({
        path: 'chosen.png',
      })),
      { path: 'chosen.png' },
    );
});
test('natural dimensions retain ratio, fit canvas and keep small native images', () => {
  assert.deepEqual(naturalImageGeometry(480, 240, 100, 220), { w: 480, h: 240, x: 100, y: 220 });
  assert.deepEqual(naturalImageGeometry(2000, 1000, 100, 220), { w: 1584, h: 792, x: 16, y: 0 });
  assert.deepEqual(naturalImageGeometry(8, 4, 1599, 791), { w: 8, h: 4, x: 1592, y: 788 });
  assert.throws(() => naturalImageGeometry(0, 100, 0, 0));
});
test('image path replacement and small image geometry survive older schema roundtrip', () => {
  const slide = newSlide('Compatibility');
  const image = block('old.png', { kind: 'image' });
  Object.assign(image, { x: 143, y: 257, w: 8, h: 4 });
  slide.blocks.push(image);
  const before = { ...image };
  image.text = 'images/replacement.svg';
  clampGeometry(image);
  assert.deepEqual({ ...image, text: before.text }, before);
  assert.deepEqual(deserialize(serialize(slide)), slide);
});
import {chooseFile} from '../src/gallery';
test('file gallery forwards type and preserves cancellation',async()=>{
 const options={sourcePath:'Slides/a.md',kind:'code'};
 assert.equal(await chooseFile({plugins:{getPlugin:()=>({api:{pickFile:async (v:unknown)=>{assert.deepEqual(v,options);return null;}}})}},options),null);
 await assert.rejects(()=>chooseFile({},options),/enable Image Gallery/);
});
