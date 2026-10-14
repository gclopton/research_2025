import {test} from 'node:test';
import assert from 'node:assert/strict';
import {equations,compose,safeReplacement,fieldEquations,replaceFieldMath} from '../src/math-model';
test('mixed field scanner skips code and preserves equation offsets',()=>{
 const text='Compare $x^2$ with `code $z$` and $$\\int_0^1 x\\,dx$$.';
 const qs=equations(text);assert.equal(qs.length,2);assert.equal(qs[0].body,'x^2');assert.equal(qs[1].display,true);
 const replacement=compose(qs[0],'x^3',{kind:'none',label:''});
 const change=safeReplacement(text,qs[0],replacement);
 assert.equal(text.slice(0,change.from)+change.insert+text.slice(change.to),'Compare $x^3$ with `code $z$` and $$\\int_0^1 x\\,dx$$.');
 assert.throws(()=>safeReplacement(text.replace('x^2','y^2'),qs[0],replacement));
});

test('raw accepted answers keep plain storage while wrapped answers keep delimiters',()=>{
 const source='x^2\nx²\n$x^3$';const qs=fieldEquations(source,true);
 assert.equal(replaceFieldMath(source,qs[0],'x^4',{kind:'none',label:''}),'x^4\nx²\n$x^3$');
 assert.equal(replaceFieldMath(source,qs[2],'x^5',{kind:'none',label:''}),'x^2\nx²\n$x^5$');
 assert.throws(()=>replaceFieldMath(source,qs[0],'x\ny',{kind:'none',label:''}));
});
