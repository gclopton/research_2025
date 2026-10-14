import test from 'node:test';
import assert from 'node:assert/strict';
import {locateMarginAnchor} from '../src/math-anchor-location';
const a={quote:'$$E=mc^2+\\color{blue}{kT}$$',before:'The energy is\n\n',after:'\n\nNext passage.',kind:'math' as const};
test('equation color edits and display delimiter reflow keep the equation located',()=>{
 const q='$$\nE=mc^2+\\textcolor{#d49b00}{{kT}}\n$$',raw=a.before+q+a.after;
 assert.deepEqual(locateMarginAnchor(raw,a),{from:a.before.length,to:a.before.length+q.length});
});
test('context fallback refuses ambiguous equations and ordinary text edits',()=>{
 const raw=a.before+'$$x$$'+a.after;
 assert.equal(locateMarginAnchor(raw+'\n'+raw,a),undefined);
 assert.equal(locateMarginAnchor(raw,{...a,kind:'text'}),undefined);
 assert.equal(locateMarginAnchor('$$x$$',{...a,before:'',after:''}),undefined);
});
test('equation recovery works in a large chapter containing many tables and images',()=>{
 const prefix=('Paragraph.\n\n|a|b|\n|-|-|\n|1|2|\n\n![[figure.png]]\n\n').repeat(20000);
 const q='$$\nE=mc^2+\\textcolor{red}{kT}\n$$',raw=prefix+a.before+q+a.after;
 assert.deepEqual(locateMarginAnchor(raw,a),{from:prefix.length+a.before.length,to:prefix.length+a.before.length+q.length});
});
