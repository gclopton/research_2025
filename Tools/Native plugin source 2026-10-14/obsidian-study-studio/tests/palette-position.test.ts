import test from 'node:test';import assert from 'node:assert/strict';import {palettePosition} from '../src/palette-position';
test('drag past top-left keeps handle below macOS controls',()=>{assert.deepEqual(palettePosition(-100,-100,228,175,1440,900,40),{x:8,y:48});});
test('resize clamps an existing location inside the smaller window',()=>{assert.deepEqual(palettePosition(1300,800,228,175,800,500,40),{x:564,y:317});});
test('popout header and extreme small viewport remain bounded',()=>{assert.equal(palettePosition(10,8,228,175,800,500,60).y,68);const p=palettePosition(-10,-10,228,175,300,220,40);assert.ok(p.y>=8&&p.y+175<=212);});
