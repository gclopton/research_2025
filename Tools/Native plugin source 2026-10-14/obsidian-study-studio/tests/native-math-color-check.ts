// Bundle with esbuild (iife), then run in the disposable Obsidian lab console.
import {describePart,resolvePart} from '../src/math-parts';
import {mathSignature} from '../src/math-semantic';
const math=(s:string)=>(window as any).MathJax.tex2chtml(s,{display:true}).querySelector('mjx-math') as HTMLElement;
const node=(m:HTMLElement,s:string)=>Array.from(m.querySelectorAll<HTMLElement>('[data-latex]')).find(n=>n.getAttribute('data-latex')===s)!;
const check=(label:string,value:boolean)=>{if(!value)throw Error(label);console.log('PASS',label);};
for(const [before,after,part]of [
 ['E=mc^2+\\color{blue}{kT}','E=mc^2+\\textcolor{#d49b00}{{kT}}','{kT}'],
 ['a+b','a+\\textcolor{red}{b}','b'],
 ['a+\\textcolor{red}{b}','a+b','b'],
 ['a+{\\color{red}b+c}','a+{\\color{green}b+c}','b']
]){
 const old=math(before),chosen=node(old,part)||node(old,part.replace('kT','k T'));check('fixture '+before,!!chosen);
 const anchor=describePart(old,[chosen]);check('color recovery '+before,resolvePart(math(after),anchor).length===1);
}
const legacy={nodes:[{latex:'{k T}',parentLatex:'E=mc^2+\\color{blue}{kT}',occurrence:0}]};
check('legacy lab kT recovery',resolvePart(math('E=mc^2+\\textcolor{#d49b00}{{kT}}'),legacy).length===1);
check('script grouping stays distinct',mathSignature(math('x^{ab}'))!==mathSignature(math('x^ab')));
check('fraction slots stay distinct',mathSignature(math('\\frac{a}{bc}'))!==mathSignature(math('\\frac{ab}{c}')));
const repeated=math('x+x'),xs=Array.from(repeated.querySelectorAll<HTMLElement>('[data-latex="x"]')),second=describePart(repeated,[xs[1]]);
check('repeated second token stays second',resolvePart(math('x+\\textcolor{red}{x}'),second)[0]?.getAttribute('data-latex')==='\\textcolor{red}{x}');
check('changed count is refused',resolvePart(math('x+\\textcolor{red}{x}+x'),second).length===0);
check('ambiguous legacy token is refused',resolvePart(math('\\textcolor{red}{x}+x'),{nodes:[{latex:'x',parentLatex:'x+x',occurrence:0}]}).length===0);
const multi=math('a+b+c'),selection=describePart(multi,[node(multi,'a'),node(multi,'b')]);
check('multi-node selection survives color',resolvePart(math('\\textcolor{red}{a}+\\textcolor{blue}{b}+c'),selection).length===2);
console.log('NATIVE_MATH_COLOR_CHECKS_COMPLETE');
