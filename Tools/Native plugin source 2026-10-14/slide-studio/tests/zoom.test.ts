import {test} from 'node:test';
import assert from 'node:assert/strict';
import {zoomAt,constrainPan,fitZoom} from '../src/zoom-core';

test('cursor stays on the same content point while zooming with a panned viewport',()=>{
  const start={zoom:2,x:100,y:-60}, point={x:270,y:125};
  const next=zoomAt(start,1.25,point.x,point.y);
  assert.equal((point.x-start.x)/start.zoom,(point.x-next.x)/next.zoom);
  assert.equal((point.y-start.y)/start.zoom,(point.y-next.y)/next.zoom);
  assert.deepEqual(start,{zoom:2,x:100,y:-60});
});
test('zoom bounds use the actual clamped ratio without drifting at the limit',()=>{
  const high={zoom:8,x:23,y:60};assert.deepEqual(zoomAt(high,2,100,100),high);
  assert.equal(zoomAt(fitZoom(),.01).zoom,.5);
  assert.equal(zoomAt(fitZoom(),100).zoom,8);
});
test('zoom in and out return to the same view before edge constraints',()=>{
  const start={zoom:1.6,x:62,y:17};const end=zoomAt(zoomAt(start,1.25,134,77),.8,134,77);
  assert.ok(Math.abs(end.zoom-start.zoom)<1e-10);
  assert.ok(Math.abs(end.x-start.x)<1e-10);assert.ok(Math.abs(end.y-start.y)<1e-10);
});
test('pan limits keep a very wide image reachable and center an undersized axis',()=>{
  assert.deepEqual(constrainPan({zoom:2,x:9999,y:9999},1000,800,952,100),{zoom:2,x:500,y:0});
  assert.deepEqual(constrainPan({zoom:.5,x:100,y:-100},1000,800,952,752),{zoom:.5,x:0,y:0});
});
test('resizing a viewport bounds existing pan and fit clears previous inspection',()=>{
  const s=constrainPan({zoom:2,x:-900,y:400},800,600,752,423);
  assert.deepEqual(s,{zoom:2,x:-400,y:171});
  assert.deepEqual(fitZoom(),{zoom:1,x:0,y:0});
});
