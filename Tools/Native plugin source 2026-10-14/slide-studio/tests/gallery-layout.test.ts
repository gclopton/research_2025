import {test} from 'node:test';
import assert from 'node:assert/strict';
import {galleryColumns,thumbnailSize,DEFAULT_THUMBNAIL_SIZE,galleryWheelSize} from '../src/gallery-layout';
test('default gallery keeps the original 230px thumbnail minimum',()=>{
  assert.equal(DEFAULT_THUMBNAIL_SIZE,100);
  for(const width of [320,700,1000,1600,2500])assert.equal(galleryColumns(width,100),Math.max(1,Math.floor((width+14)/244)));
});
test('larger thumbnails reduce columns and narrow windows retain one usable column',()=>{
  assert.equal(galleryColumns(1000,100),4);assert.equal(galleryColumns(1000,200),2);
  assert.equal(galleryColumns(300,300),1);assert.equal(galleryColumns(0,300),1);
  assert.equal(galleryColumns(2500,200),5);
});
test('gallery resizing respects actual gaps at column breakpoints',()=>{
  assert.equal(galleryColumns(473,100),1);assert.equal(galleryColumns(474,100),2);
  assert.equal(galleryColumns(717,100),2);assert.equal(galleryColumns(718,100),3);
});
test('thumbnail zoom has bounded accessible steps and a safe default',()=>{
  assert.equal(thumbnailSize(999),300);assert.equal(thumbnailSize(-10),60);
  assert.equal(thumbnailSize(NaN),100);assert.equal(thumbnailSize(129),130);
});

test('small pinch events accumulate and bounds do not overshoot',()=>{
  let size=100;for(let i=0;i<40;i++)size=galleryWheelSize(size,-1,0,800);
  assert.equal(thumbnailSize(size),120);
  assert.equal(galleryWheelSize(300,-1000,0,800),300);
  assert.equal(galleryWheelSize(60,1000,0,800),60);
  assert.equal(galleryWheelSize(100,-1,1,800),galleryWheelSize(100,-16,0,800));
});
