import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateLatex} from 'mathlive/ssr';
import {alignEquation} from '../src/layout';
test('align display rows without splitting nested matrices or colored expressions',()=>{
 const source=String.raw`\displaylines{x=\begin{bmatrix}a&b\\c&d\end{bmatrix}\\ y=\textcolor{red}{a=b}}`;
 const aligned=alignEquation(source,'equals');
 assert.equal(aligned,String.raw`\begin{aligned}x &= \begin{bmatrix}a&b\\c&d\end{bmatrix}\\ y &= \textcolor{red}{a=b}\end{aligned}`);
 for(const mode of ['left','center','right','equals'] as const)assert.deepEqual(validateLatex(alignEquation(aligned,mode)),[]);
});
test('empty lines and repeated equals survive alignment changes',()=>{
 const source=String.raw`\begin{gathered}a=b=c\\ {}\end{gathered}`;
 assert.equal(alignEquation(source,'equals'),String.raw`\begin{aligned}a &= b=c\\ {} & {}\end{aligned}`);
 assert.equal(alignEquation(alignEquation('x=y','right'),'left'),String.raw`\begin{array}{l}\displaystyle x=y\end{array}`);
});
test('complex existing layout is not silently flattened',()=>{
 assert.throws(()=>alignEquation(String.raw`\begin{aligned}a&=b&c&=d\end{aligned}`,'center'));
 assert.throws(()=>alignEquation(String.raw`\begin{gathered}a\\[2em]b\end{gathered}`,'center'));
});
test('realign a new row typed in the left cell of an existing aligned layout',()=>{
 assert.equal(alignEquation(String.raw`\begin{aligned}x&=y\\ q=9&{}\end{aligned}`,'equals'),String.raw`\begin{aligned}x &= y\\ q &= 9{}\end{aligned}`);
});
test('adjacent independent environments are not mistaken for one outer wrapper',()=>{
 assert.throws(()=>alignEquation(String.raw`\begin{aligned}a&=b\end{aligned}+\begin{aligned}c&=d\end{aligned}`,'center'));
});
