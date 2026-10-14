import {test} from 'node:test';import assert from 'node:assert/strict';
import {equations} from '../src/math-model';import {renderedEquations} from '../src/written-model';
const block='$$\n\\int_0^1 x^2\\,dx=\\frac{1}{3}\n$$';
test('typing incomplete inline and display math above a display block never consumes it',()=>{
 for(const draft of ['$','$x','$x$','$$','$$x','$$x$$','$$\n','$$\nx','$$\nx\n$$']){
  const source='Prose '+draft+'\n\n'+block+'\n\nBelow.';
  const found=equations(source);assert.ok(found.some(q=>q.raw===block),draft);assert.ok(!found.some(q=>q.raw.includes('Prose')),draft);
 }
});
test('single dollars cannot steal the delimiters of a following display expression',()=>{
 const source='$unfinished $$y$$';assert.deepEqual(equations(source).map(q=>q.raw),['$$y$$']);
 assert.deepEqual(equations('$$unfinished $x$\n\n'+block).map(q=>q.raw),['$x$',block]);
});
test('equation stays source while caret or selection touches it, renders on leaving',()=>{
 for(const source of ['$x^2$',block]){for(let at=0;at<=source.length;at++)assert.deepEqual(renderedEquations(source,[{from:at,to:at}]),[]);
  assert.equal(renderedEquations(source+' prose',[{from:source.length+2,to:source.length+2}]).length,1);
  assert.equal(renderedEquations(source,[{from:0,to:0}],true).length,1);
 }
 assert.equal(renderedEquations('$$$$',[]).length,0);assert.equal(renderedEquations('$$\n\n$$',[]).length,0);
});
test('multiline display, escaped dollars and literal code retain their expected parsing',()=>{
 assert.equal(equations(block)[0].raw,block);
 assert.equal(equations('Cost \\$5, math $x$ and `$$no$$`.')[0].raw,'$x$');
 assert.equal(equations('$$unfinished\n```python\nx=1\n```\n\n'+block).at(-1)?.raw,block);
});

import {anchoredEquations} from '../src/written-model';
test('existing display remains a boundary even with no blank line above it',()=>{for(const prefix of ['$$\n','$x\n','$$x\n']){const source=prefix+block,parsed=anchoredEquations(source,[{from:prefix.length,to:source.length}]);assert.deepEqual(parsed.map(q=>q.raw),[block]);}});
test('anchors release deleted delimiters and equations placed inside fenced code',()=>{assert.equal(anchoredEquations('x',[{from:0,to:1}]).length,0);const source='```latex\n'+block+'\n```';assert.equal(anchoredEquations(source,[{from:9,to:9+block.length}]).length,0);});
