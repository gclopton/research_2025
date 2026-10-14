import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseEvidence,uniquePassage,evidenceURI} from '../src/evidence-model';
test('evidence links preserve multiple passages, comments and cross-vault destination',()=>{
 const target={path:'Papers/A + B.md',passages:[{quote:'A & B',comment:'Why this supports the claim.'},{quote:'second passage'}],window:true};
 const uri=new URL(evidenceURI('Paper vault',target));assert.equal(uri.searchParams.get('vault'),'Paper vault');assert.deepEqual(parseEvidence(uri.searchParams.get('target')!),target);assert.ok(!uri.href.includes('+'));
});
test('missing and repeated quotations cannot silently select the wrong evidence',()=>{assert.equal(uniquePassage('x x','x'),null);assert.equal(uniquePassage('abc','z'),null);assert.deepEqual(uniquePassage('abc','b'),{from:1,to:2});});
test('invalid sources and empty targets are rejected',()=>{for(const v of [{path:'../p.md',passages:[{quote:'a'}]},{path:'x.md',passages:[]},{path:'x.md',passages:[{quote:''}]}])assert.throws(()=>parseEvidence(JSON.stringify(v)));});
test('area-only links retain normalized image or table rectangles',()=>{const t={path:'p.md',passages:[],areas:[{kind:'image',target:'figure.svg',rect:[0.1,0.2,0.5,0.4],comment:'Panel B'}]};assert.deepEqual(parseEvidence(JSON.stringify(t)),t);for(const rect of [[0,0,0,1],[0.8,0,0.5,1],[0,0,-1,1]])assert.throws(()=>parseEvidence(JSON.stringify({...t,areas:[{...t.areas[0],rect}]})));});
