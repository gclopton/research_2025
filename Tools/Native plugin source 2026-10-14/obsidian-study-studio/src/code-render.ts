import {loadPrism} from 'obsidian';
import {CodeDefinition,codeMarkers} from './code-model';
/** Highlight only the supplied skeleton: reference answers never enter the active code DOM. */
export async function renderCode(parent:HTMLElement,code:CodeDefinition,blank:(host:HTMLElement,id:string)=>void){
 const pre=parent.createEl('pre',{cls:'study-code'}),root=pre.createEl('code',{cls:`language-${code.language}`});
 const prism=await loadPrism(),grammar=prism.languages[code.language];
 if(grammar)root.innerHTML=prism.highlight(code.source,grammar,code.language);else root.textContent=code.source;
 // Prism may split markers into tokens. Replace by text offsets, from right to left.
 const doc=root.ownerDocument;
 for(const m of codeMarkers(code.source).reverse()){
  const walker=doc.createTreeWalker(root,4);let node:Node|null,offset=0,start:Text|undefined,end:Text|undefined,startOffset=0,endOffset=0;
  while((node=walker.nextNode())){const length=node.textContent?.length??0;if(!start&&m.from>=offset&&m.from<offset+length){start=node as Text;startOffset=m.from-offset;}if(m.to>offset&&m.to<=offset+length){end=node as Text;endOffset=m.to-offset;break;}offset+=length;}
  if(!start||!end)throw Error('Could not locate code blank in highlighted source.');
  const range=doc.createRange();range.setStart(start,startOffset);range.setEnd(end,endOffset);range.deleteContents();const host=doc.createElement('span');host.className='study-code-slot';range.insertNode(host);blank(host,m.id);
 }
 return pre;
}
