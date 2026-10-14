/** MathJax presentation wrappers are transparent; mathematical operators remain structural. */
function signatureItems(node:Element):unknown[]{
 const tag=node.tagName.toLowerCase();
 if(tag==='mjx-break')return [];
 if(['mjx-math','mjx-mrow','mjx-mstyle','mjx-texatom','mjx-script'].includes(tag))return Array.from(node.children).flatMap(signatureItems);
 if(['mjx-mi','mjx-mn','mjx-mo','mjx-mtext'].includes(tag))return [[tag,node.textContent]];
 // Keep each child slot distinct: numerator/denominator and base/script cannot merge.
 return [[tag,Array.from(node.children).map(signatureItems)]];
}
export function mathSignature(node:Element):string{return JSON.stringify(signatureItems(node));}
export function mathParentSignature(node:Element){
 const own=mathSignature(node);let parent=node.parentElement;
 while(parent&&parent.tagName.toLowerCase().startsWith('mjx-')){const key=mathSignature(parent);if(key!==own)return key;parent=parent.parentElement;}
 return '';
}
export function semanticMatches(math:Element,key:string,parent:string):HTMLElement[]{
 const all=Array.from(math.querySelectorAll<HTMLElement>('[data-latex]'));
 // Equivalent nested presentation wrappers represent one target, not several occurrences.
 return all.filter(n=>mathSignature(n)===key&&mathParentSignature(n)===parent)
  .filter(n=>!all.some(p=>p!==n&&p.contains(n)&&mathSignature(p)===key&&mathParentSignature(p)===parent));
}
const renderedKeys=new Map<string,string|undefined>();
export function latexSignature(latex:string,doc:Document){
 if(renderedKeys.has(latex))return renderedKeys.get(latex);
 const mj=(doc.defaultView as any)?.MathJax;if(!mj?.tex2chtml)return;
 let key:string|undefined;try{const rendered=mj.tex2chtml(latex,{display:false}) as HTMLElement;const math=rendered.querySelector('mjx-math');if(math&&!math.querySelector('mjx-merror'))key=mathSignature(math);}catch{/* Unresolved expressions stay attached to their saved quotation. */}
 renderedKeys.set(latex,key);if(renderedKeys.size>64)renderedKeys.delete(renderedKeys.keys().next().value!);return key;
}
