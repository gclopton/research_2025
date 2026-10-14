import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {validateLatex,convertLatexToMarkup} from 'mathlive/ssr';import {equations,splitTag} from '../src/model';
test('engine accepts synthetic corpus including nested matrices and closed multiple integrals',()=>{for(const q of equations(readFileSync('fixtures/Equation corpus.md','utf8'))){const latex=splitTag(q.body).latex;assert.deepEqual(validateLatex(latex),[],latex);assert.ok(convertLatexToMarkup(latex).length>30);}});
test('engine flags unknown research macros instead of treating them as valid',()=>{assert.ok(validateLatex('\\researchOperator{u}').length);});

import {saveableLatex} from '../src/model';
test('unfinished visual slots save as native empty groups, including matrix cells and bounds',()=>{
 const input=String.raw`\frac{\placeholder{}}{x}+\int_{\placeholder{}}^{2}\placeholder{}+\begin{bmatrix}a&\placeholder{}\\\placeholder{}&d\end{bmatrix}`;
 const output=saveableLatex(input);
 assert.equal(output,String.raw`\frac{{}}{x}+\int_{{}}^{2}{}+\begin{bmatrix}a&{}\\{}&d\end{bmatrix}`);
 assert.deepEqual(validateLatex(output),[]);
 assert.equal(saveableLatex(String.raw`\oint_S f\,dS`),String.raw`\oint_S f\,dS`);
});
