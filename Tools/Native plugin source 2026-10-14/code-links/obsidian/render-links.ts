import {codeLinkRegex,linkTokens} from './link-syntax';

// Mustache paths are not native Markdown tokens. An underscore in a path can
// pair with a later math subscript before postprocessing ever sees the link.
// Escape only the rendering copy; source paths and launch arguments stay exact.
export function protectLinkEmphasis(source: string): string {
 if(!source.includes('{{'))return source;
 const literals: [number,number][]=[];
 const literal=/^ {0,3}(`{3,}|~{3,})[^\n]*\n[\s\S]*?^ {0,3}\1[^\n]*$|(`+)[^`]*?\2|\$\$[\s\S]*?\$\$|(?<![\\$])\$(?!\$)[^\n$]*?\$/gm;
 for(const m of source.matchAll(literal))literals.push([m.index!,m.index!+m[0].length]);
 let result=source;
 for(const token of linkTokens(source).reverse()) {
  if(token.raw.startsWith('``')||token.raw.startsWith('{{links:')||literals.some(([a,b])=>token.index>=a&&token.index<b))continue;
  const safe=token.raw.replace(/(?<!\\)[_*]/g,'\\$&');
  result=result.slice(0,token.index)+safe+result.slice(token.index+token.raw.length);
 }
 return result;
}

// Use the caller's exact Markdown, not a possibly unrelated open note. This also
// restores paths split into emphasis nodes by MarkdownRenderer.
export function renderSourceLinks(el: HTMLElement, source: string, make: (raw: string) => HTMLElement) {
 const doc=el.ownerDocument;
 for(const match of linkTokens(source)) {
  const raw=match.raw;
  if(raw.startsWith('``dir:')){
   const value=raw.slice(2,-2);const code=Array.from(el.querySelectorAll('code')).find(n=>!n.closest('pre')&&n.textContent===value);if(code)code.replaceWith(make(raw));continue;
  }
  const group=raw.startsWith('{{links:');
  const escaped=[...raw].map(c=>c==='_'||c==='*'?'[\\'+c+']?':c.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('');
  const w=doc.createTreeWalker(el,4);const spans:{node:Text;start:number;end:number}[]=[];let text='';
  while(w.nextNode()) {
   const n=w.currentNode as Text;
   if(n.parentElement?.closest(group?'pre,code,.code-links-target,.code-links-panel,script,style':'pre,code,a,.code-links-panel,script,style')){text+='\n';continue;}
   const start=text.length;text+=n.textContent||'';spans.push({node:n,start,end:text.length});
  }
  let found=new RegExp(escaped).exec(text);
  if(!found&&group){
   // Wiki/Markdown links inside the group may already be rendered as anchors.
   const visible=raw.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,(_,p,l)=>l||p).replace(/\[([^\]]+)\]\(https?:[^)]+\)/g,'$1');
   const at=text.indexOf(visible);if(at>=0)found=Object.assign([visible],{index:at}) as RegExpExecArray;
  }
  if(!found)continue;
  const first=spans.find(n=>n.start<=found.index&&n.end>found.index);
  const end=found.index+found[0].length;const last=spans.find(n=>n.start<end&&n.end>=end);
  if(!first||!last)continue;
  const range=doc.createRange();range.setStart(first.node,found.index-first.start);range.setEnd(last.node,end-last.start);
  range.deleteContents();range.insertNode(make(raw));
 }
 // Fallback for hosts without section information; never enter literal code.
 const walker=doc.createTreeWalker(el,4);const nodes:Text[]=[];
 while(walker.nextNode()){const n=walker.currentNode as Text;if(!n.parentElement?.closest('pre,code,a,.code-links-panel,script,style'))nodes.push(n);}
 for(const n of nodes){const text=n.textContent||'';const matches=linkTokens(text);if(!matches.length)continue;
  const frag=doc.createDocumentFragment();let prev=0;
  for(const m of matches){frag.append(text.slice(prev,m.index));frag.append(make(m.raw));prev=m.index+m.raw.length;}
  frag.append(text.slice(prev));n.replaceWith(frag);
 }
}
