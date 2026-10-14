import {test} from 'node:test';
import assert from 'node:assert/strict';
import {equations,equationAt,replaceFieldMath,unsupported} from '../src/scientific-math-model';
import {newScientific,scientificSource,scientificBlocks} from '../src/scientific-core';

test('editing a caption integral preserves surrounding prose and other equations',()=>{
 const source=String.raw`Energy $E$ follows $\int_0^1 x\,dx$; compare **$F$**.`;
 const q=equations(source)[1];
 assert.equal(replaceFieldMath(source,q,String.raw`\int_0^2 x^2\,dx`,{kind:'none',label:''}),String.raw`Energy $E$ follows $\int_0^2 x^2\,dx$; compare **$F$**.`);
});
test('empty inline caret opens locally without swallowing later text or display equations',()=>{
 const source='Result $$ follows.\n\n$$\ny=2\n$$';const q=equationAt(source,8)!;
 assert.equal(q.raw,'$$');assert.equal(q.display,false);
 assert.equal(replaceFieldMath(source,q,'x',{kind:'none',label:''}),'Result $x$ follows.\n\n$$\ny=2\n$$');
 assert.equal(equationAt('`$$`',2),undefined);
});
test('scientific source preserves multiline display integrals in titles and captions',()=>{
 const figure=newScientific('figure');figure.title=String.raw`Integral $\int f\,dx$`;figure.caption='Flux:\n\n$$\n\\int_S \\mathbf{u}\\cdot\\mathbf{n}\\,dS\n$$';
 assert.deepEqual(scientificBlocks(scientificSource(figure))[0].value,figure);
 assert.equal(equations(figure.caption)[0].display,true);
});
test('stale replacements and unsupported macros cannot be silently rewritten',()=>{
 const q=equations('$x$')[0];assert.throws(()=>replaceFieldMath('$y$',q,'z',{kind:'none',label:''}));assert.ok(unsupported(String.raw`\newcommand{\a}{b}`));
});
