import {test} from 'node:test';import assert from 'node:assert/strict';import {equations,numberingEdits,safeReplacement,splitTag,unsupported,compose} from '../src/model';
test('ignores frontmatter, fenced code, inline code, escapes and currency',()=>{const s='---\nx: $bad$\n---\n`$bad$`\n```latex\n$$bad$$\n```\n\\$5 and \\$10\n$x$ then $$y$$';assert.deepEqual(equations(s).map(x=>x.body),['x','y']);});
test('preserves nested matrix bytes and repeated occurrences',()=>{const s='a $x$ b $x$\n$$\n\\begin{bmatrix}1&2\\\\3&4\\end{bmatrix}\n$$';const q=equations(s);assert.equal(q.length,3);const edit=safeReplacement(s,q[1],'$z$');assert.equal(s.slice(0,edit.from)+edit.insert+s.slice(edit.to),'a $x$ b $z$\n'+q[2].raw);assert.equal(safeReplacement(s,q[2],q[2].raw).insert,q[2].raw);});
test('stale edits fail rather than replacing a duplicate elsewhere',()=>{const q=equations('$x$ $x$')[0];assert.throws(()=>safeReplacement('$y$ $x$',q,'$z$'));});
test('comments/macros/complex labels stay native',()=>{for(const x of ['x % keep','\\newcommand{\\x}{y}','x\\label{a}','x\\tag{a}\\tag{b}'])assert.ok(unsupported(x));assert.equal(unsupported('x\\tag{2}\n% math-studio:auto:abc'),null);});
test('automatic numbering is document ordered; manual tags untouched',()=>{const doc='$$x\\tag{8}\n% math-studio:auto:one\n$$\n$$y\\tag{A.2}$$\n$$z\\tag{9}\n% math-studio:auto:two\n$$';const e=numberingEdits(doc);assert.equal(e.length,2);assert.match(e[0].insert,/tag\{1\}/);assert.match(e[1].insert,/tag\{2\}/);assert.equal(splitTag(e[0].insert).tag.kind,'auto');});
test('tag labels cannot inject latex and inline has no display tag',()=>{const q=equations('$x$')[0];assert.equal(compose(q,'y',{kind:'none',label:''}),'$y$');assert.throws(()=>compose(q,'x',{kind:'manual',label:'a}\\evil{'}));});

import {equationAt} from '../src/model';
test('caret lookup supports inline, display and empty math without touching code',()=>{
 assert.equal(equationAt('A $x^2$ B',4)?.body,'x^2');
 assert.equal(equationAt('$$\nx^2\n$$',5)?.display,true);
 assert.equal(equationAt('A $$ B',3)?.body,'');
 assert.equal(equationAt('$$$$',2)?.display,true);
 assert.equal(equationAt('`$$`',2),undefined);
 assert.equal(equationAt('```\n$$\n```',5),undefined);
});


test('empty inline caret wins over a later display delimiter without capturing prose',()=>{
 const tail='\n\n## Eulerian approach\n\nAttention is fixed on points.\n\n$$\nV(x,y,z,t)\n$$\n\nMore prose.';
 for(const prefix of ['', 'An equation: ', '$a$ then ', '---\ntitle: Example\n---\n']){
  const source=prefix+'$$'+tail, at=prefix.length+1;
  const q=equationAt(source,at)!;
  assert.deepEqual(q,{from:at-1,to:at+1,bodyFrom:at,bodyTo:at,body:'',display:false,raw:'$$'});
  const edit=safeReplacement(source,q,compose(q,'x^2',{kind:'none',label:''}));
  assert.equal(source.slice(0,edit.from)+edit.insert+source.slice(edit.to),prefix+'$x^2$'+tail);
 }
});
test('empty pair targeting respects code, escapes, frontmatter and display caret positions',()=>{
 for(const [source,at] of [['`$$`',2],['```\n$$\n```',5],['~~~\n$$\n~~~',5],['    $$',5],['---\nx: $$\n---',8],['\\$$',2]] as const)
  assert.equal(equationAt(source,at),undefined,source);
 for(const [source,at] of [['$$\nx^2\n$$',2],['$$\nx^2\n$$',5],['$$$$',2],['$$\n\n$$',3]] as const)
  assert.equal(equationAt(source,at)?.display,true,source);
 assert.equal(equationAt('$x$ and $$\ny\n$$',2)?.body,'x');
});
