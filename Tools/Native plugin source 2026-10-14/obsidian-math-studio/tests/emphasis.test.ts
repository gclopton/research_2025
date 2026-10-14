import test from 'node:test';
import assert from 'node:assert/strict';
import {emphasizedEquations} from '../src/emphasis';

test('math inherits only its enclosing emphasis, across Markdown delimiter styles',()=>{
 const s='**words $x_i$ words** then $y$\n\n***$z$***\n\n_**$a$**_\n\n*only $b$ italic*';
 assert.deepEqual(emphasizedEquations(s).map(x=>[s.slice(x.from,x.to),x.strong,x.em]),[['$x_i$',true,false],['$z$',true,true],['$a$',true,true],['$b$',false,true]]);
});
test('TeX stars, underscores and explicit colors do not change emphasis boundaries',()=>{
 const s='**$x^*+y_1+\\textcolor{red}{z}$** outside $w$';
 assert.equal(emphasizedEquations(s).length,1);
 assert.equal(emphasizedEquations(s)[0].strong,true);
});
test('code, escaped markers and ordinary math do not become bold',()=>{
 assert.deepEqual(emphasizedEquations('`**$x$**`\n\n\\*\\*$y$\\*\\*\n\n$z$\n\n```\n**$w$**\n```'),[]);
});
test('multi-line emphasis and equations adjacent to delimiters work',()=>{
 assert.equal(emphasizedEquations('**across\nlines $x$**')[0].strong,true);
 assert.equal(emphasizedEquations('__$x$__')[0].strong,true);
});

test('incremental emphasis matches full parsing through delimiter, fence and line edits',async()=>{
 const {EmphasisIndex}=await import('../src/emphasis');
 const cache=new EmphasisIndex();
 let source=('**Words $x_i$ more**\n\nPlain $y$ and _italic $z$_.\n\n```yaml\nvalue: $hidden$\n```\n\n$$a^2+b^2$$\n\n').repeat(25);
 assert.deepEqual(cache.scan(source),emphasizedEquations(source));
 let seed=81473;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const inserts=['x','$','$$','*','_','`','```\n','\n\n','\\$','~','    ','\r\n'];
 for(let i=0;i<180;i++){
  const from=Math.floor(rand()*(source.length+1)),to=Math.min(source.length,from+Math.floor(rand()*8)),text=inserts[Math.floor(rand()*inserts.length)];
  source=source.slice(0,from)+text+source.slice(to);
  assert.deepEqual(cache.scan(source),emphasizedEquations(source),`edit ${i}`);
 }
});
