import test from 'node:test';
import assert from 'node:assert/strict';
import {sectionLines} from '../src/section-lines';
import {equations} from '../src/model';
test('section extraction preserves source and equation order including CRLF',()=>{
 for(const text of ['', 'a\n', 'one\r\n$z$ and $\\oiint_S f$\r\n\n$$\n\\oiiint_V f\n$$\nend']){
  const lines=text.split('\n');for(let first=0;first<=lines.length;first++)for(let last=first;last<=lines.length;last++){
   const old=lines.slice(first,last+1).join('\n'),now=sectionLines(text,first,last);assert.equal(now,old);assert.deepEqual(equations(now),equations(old));
  }
 }
});
