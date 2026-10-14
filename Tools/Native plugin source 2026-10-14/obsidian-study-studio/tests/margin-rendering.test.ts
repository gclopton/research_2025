import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EditorState} from '@codemirror/state';
import {equations} from '../src/math-model';
import {anchoredEquations} from '../src/written-model';
import {marginFormatting} from '../src/margin-format';
const cases=[
 ['1. **Catalysis**\n    1. Products\n        1. $CO_{2}$ and $E=mc^2$',['$CO_{2}$','$E=mc^2$']],
 ['- Parent\n\n    $$\n    E=mc^2\n    $$',['$$\n    E=mc^2\n    $$']],
 ['- Parent\n\t- $x$',['$x$']],
 ['Paragraph\n\n    $code$\n\n$x$',['$x$']],
 ['- Parent\n    ```tex\n    $code$\n    ```\n\n$x$',['$x$']],
 ['- Parent\n    - Child\n        ```tex\n        $code$\n        ```',[]],
 ['`$code$` and $x$',['$x$']],
 ['---\nmath: $no$\n---\n$x$',['$x$']],
 ['$a$\n\n- Parent\n    - $b$\n\n$c$',['$a$','$b$','$c$']],
] as const;
for(const [source,expected] of cases)test('math context: '+source.slice(0,38),()=>assert.deepEqual(equations(source).map(q=>q.raw),expected));
test('old math anchors are released in inline, indented, nested fenced code and frontmatter',()=>{
 for(const source of ['`$x$`','    $x$','- Parent\n    ```\n    $x$\n    ```','---\na: $x$\n---']){
  const from=source.indexOf('$x$');assert.deepEqual(anchoredEquations(source,[{from,to:from+3}]),[]);
 }
});
test('typing nested math from scratch discovers closing delimiters',()=>{
 let text='- Parent\n    - ',qs=equations(text);
 for(const ch of '$CO_{2}$'){text+=ch;qs=anchoredEquations(text,qs);}
 assert.deepEqual(qs.map(q=>q.raw),['$CO_{2}$']);
});
test('formatting hides only unselected markup and never interprets math or code',()=>{
 const source='**Catalysis** *rate* `literal` $x^{*} y^{*}$\n\n```\n**raw**\n```';
 const state=EditorState.create({doc:source,selection:{anchor:source.length}}),ranges=marginFormatting(state,equations(source));
 assert.ok(ranges.some(r=>r.value.spec.class==='study-live-strong'));
 assert.ok(ranges.some(r=>r.value.spec.class==='study-live-em'));
 assert.ok(ranges.some(r=>r.value.spec.class==='study-live-code'));
 assert.ok(ranges.some(r=>r.from===0&&r.to===2&&r.value.spec.class===undefined));
 const math=equations(source)[0];assert.ok(!ranges.some(r=>r.from<math.to&&r.to>math.from));
 assert.ok(!ranges.some(r=>r.from>=source.indexOf('```')));
 const selected=marginFormatting(EditorState.create({doc:'**Catalysis**',selection:{anchor:5}}),[]);
 assert.equal(selected.length,1);assert.equal(selected[0].value.spec.class,'study-live-strong');
});

test('inline anchor releases when delimiters grow to display math',()=>assert.deepEqual(anchoredEquations('$$x$$',[{from:1,to:4}]).map(q=>q.raw),['$$x$$']));
test('emphasis cannot hide underscores across two equations',()=>{const source='$a_i$ and $b_i$';assert.equal(marginFormatting(EditorState.create({doc:source}),equations(source)).length,0);});
import {markdownContext} from '../src/markdown-context';
test('HTML-like expectation values remain display math',()=>{
 for(const body of ['<p> = mv','<li> x','<x> = \\int x','<!-- c -->']){
  for(const source of [`$$\n${body}\n$$\n\n$y$`,`- Parent\n    $$\n    ${body}\n    $$\n\n$y$`])assert.equal(equations(source).length,2,source);
 }
});
test('small fragment scans cannot evict a large incremental tree',()=>{
 const source='Paragraph $x$.\n\n'.repeat(5000);markdownContext(source);
 for(let i=0;i<20;i++)equations(`$x_${i}$`);
 assert.ok(markdownContext(source.slice(0,500)+'z'+source.slice(500)).reusedFragments>0);
});
test('bold around math is styled without hiding anything inside math',()=>{
 const source='**energy $E$ here**',q=equations(source)[0],ranges=marginFormatting(EditorState.create({doc:source+' end',selection:{anchor:source.length+4}}),[q]);
 assert.ok(ranges.some(r=>r.value.spec.class==='study-live-strong'));
 assert.ok(!ranges.some(r=>r.value.spec.class===undefined&&r.from<q.to&&r.to>q.from));
});
