import {sourceMenu,openReferencePDF,webVersion,openPreferredSource} from './citation-sources';
import {App,Component,Menu,Modal} from 'obsidian';
import type {Slide,Theme} from './model';
import {CitationBlock,CitationContext,blockKey} from './citation-context';
import {Reference} from './citations-core';
// Use regular anchors so presentation navigation never consumes citation clicks.
function link(parent:HTMLElement,label:string,action:()=>void,cls='ss-citation-link'){
 const a=parent.ownerDocument.createElement('a');a.className=cls;a.href='#';a.textContent=label;
 a.onclick=e=>{e.preventDefault();e.stopPropagation();action();};a.onkeydown=e=>{if(e.key===' '){e.preventDefault();e.stopPropagation();action();}};parent.append(a);return a;
}
function openURI(href:string){if(/^(https?:\/\/|obsidian:\/\/study-evidence\?)/i.test(href))window.open(href);}
export function showReference(app:App,ref:Reference){
 const modal=new Modal(app);modal.titleEl.textContent=`Reference ${ref.number}`;
 const p=modal.contentEl.createEl('p',{text:ref.full});p.className='ss-reference-detail';
 link(modal.contentEl,'Open PDF',()=>void openReferencePDF(app,ref),'ss-reference-evidence');
 const web=webVersion(ref);if(web)link(modal.contentEl,'Open web version',()=>openURI(web),'ss-reference-evidence');
 for(const occurrence of ref.occurrences)link(modal.contentEl,`Source selections · ${occurrence.slide}`,()=>openURI(occurrence.href),'ss-reference-evidence');
 const close=modal.contentEl.createEl('button',{text:'Back to slide'});close.onclick=()=>{modal.close();document.querySelector<HTMLElement>('.ss-present')?.focus();};
 modal.open();
 if(document.fullscreenElement)document.fullscreenElement.append(modal.containerEl);
}
export function citationMarkdown(data:CitationBlock){
 let result='',end=0;data.occurrences.forEach((c,i)=>{result+=data.content.slice(end,c.from)+`[citation](#ss-citation-${i})`;end=c.to;});return result+data.content.slice(end);
}
export function renderInlineCitations(app:App,target:HTMLElement,data:CitationBlock,ctx:CitationContext){
 target.querySelectorAll<HTMLAnchorElement>('a[href^="#ss-citation-"]').forEach(a=>{
  const i=Number(a.getAttribute('href')!.slice('#ss-citation-'.length)),occurrence=data.occurrences[i];if(!occurrence)return;
  const group=target.ownerDocument.createElement('sup');group.className='ss-citation';group.setAttribute('aria-label',occurrence.raw);
  occurrence.members.forEach((m,j)=>{const ref=ctx.refs.get(m.key);if(!ref)return;if(j)group.append(', ');if(m.prefix)group.append(m.prefix+' ');
   const action=()=>void openPreferredSource(app,ref,()=>occurrence.evidence?openURI(occurrence.evidence):showReference(app,ref));
   const anchor=link(group,ref.item?String(ref.number):`?${m.key}`,action);anchor.dataset.citekey=m.key;anchor.title=`${occurrence.raw}\n${ref.full}`;
   anchor.setAttribute('aria-label',`Reference ${ref.number}: ${ref.full}${occurrence.evidence?'; open source PDF':''}`);if(!ref.item)anchor.classList.add('is-unresolved');
   anchor.oncontextmenu=e=>{e.preventDefault();e.stopPropagation();const menu=new Menu();if(occurrence.evidence)menu.addItem(v=>v.setTitle('Open Citation Source Viewer').onClick(()=>openURI(occurrence.evidence!)));menu.addItem(v=>v.setTitle('Reference details').onClick(()=>showReference(app,ref)));sourceMenu(app,menu,ref);if(document.fullscreenElement)menu.setParentElement(document.fullscreenElement as HTMLElement);menu.showAtMouseEvent(e);};
   if(m.suffix)group.append(m.suffix);
  });a.replaceWith(group);
 });
}
function footerSources(slide:Slide,ctx:CitationContext,key:string){
 const choices=new Map<string,string>();
 for(const b of slide.blocks){const data=ctx.blocks.get(blockKey(slide,b));if(!data)continue;
  for(const c of data.occurrences){if(!c.evidence||!c.members.some(m=>m.key===key))continue;
   const passage=data.content.slice(Math.max(0,c.from-160),c.from).split(/\n\s*\n/).pop()?.replace(/[#*_]/g,'').trim();
   choices.set(c.evidence,passage||'Supporting passage');
  }
 }
 return [...choices.entries()];
}
function openFooterEvidence(app:App,slide:Slide,ctx:CitationContext,ref:Reference){
 const choices=footerSources(slide,ctx,ref.key);
 if(choices.length===1){openURI(choices[0][0]);return;}
 if(choices.length>1){
  const modal=new Modal(app);modal.titleEl.textContent=`Supporting passages · Reference ${ref.number}`;
  for(const [href,label]of choices)link(modal.contentEl,label,()=>{modal.close();openURI(href);},'ss-reference-evidence');
  modal.open();if(document.fullscreenElement)document.fullscreenElement.append(modal.containerEl);return;
 }
 if(ref.url)openURI(ref.url);else showReference(app,ref);
}
export function openBibliographyEvidence(app:App,ref:Reference){
 const choices=[...new Map(ref.occurrences.map(o=>[o.href,o.slide])).entries()];
 if(choices.length===1){openURI(choices[0][0]);return;}
 if(choices.length>1){
  const modal=new Modal(app);modal.titleEl.textContent=`Source passages · Reference ${ref.number}`;
  choices.forEach(([href,slide],i)=>link(modal.contentEl,`${i+1}. ${slide}`,()=>{modal.close();openURI(href);},'ss-reference-evidence'));
  if(ref.url)link(modal.contentEl,'Open publication',()=>openURI(ref.url!),'ss-reference-evidence');
  modal.open();if(document.fullscreenElement)document.fullscreenElement.append(modal.containerEl);return;
 }
 if(ref.url)openURI(ref.url);else showReference(app,ref);
}
export function openBibliographySource(app:App,ref:Reference){void openPreferredSource(app,ref,()=>openBibliographyEvidence(app,ref));}
export function citationFooter(app:App,stage:HTMLElement,slide:Slide,ctx:CitationContext,theme:Theme,page:string,openReferences?:()=>void){
 const refs=(ctx.slideKeys.get(slide.id)||[]).map(k=>ctx.refs.get(k)!).filter(Boolean);if(!refs.length)return;
 stage.querySelector('.ss-footer')?.remove();
 stage.querySelector('.ss-citation-footer')?.remove();
 const footer=stage.ownerDocument.createElement('footer');footer.className='ss-citation-footer';stage.append(footer);
 const list=footer.ownerDocument.createElement('div');list.className='ss-citation-footer-list';footer.append(list);
 for(const ref of refs.slice(0,3)){const row=list.ownerDocument.createElement('div');row.className='ss-citation-footer-row';list.append(row);const number=row.ownerDocument.createElement('span');number.textContent=String(ref.number);number.className='ss-reference-number';row.append(number);const a=link(row,ref.short,()=>void openPreferredSource(app,ref,()=>openFooterEvidence(app,slide,ctx,ref)),'ss-citation-footer-link');a.title='Open source · '+ref.full;
 a.oncontextmenu=e=>{e.preventDefault();e.stopPropagation();const menu=new Menu();menu.addItem(v=>v.setTitle('Open source').onClick(()=>void openPreferredSource(app,ref,()=>openFooterEvidence(app,slide,ctx,ref))));if(footerSources(slide,ctx,ref.key).length)menu.addItem(v=>v.setTitle('Open Citation Source Viewer').onClick(()=>openFooterEvidence(app,slide,ctx,ref)));menu.addItem(v=>v.setTitle('Reference details').onClick(()=>showReference(app,ref)));sourceMenu(app,menu,ref);if(document.fullscreenElement)menu.setParentElement(document.fullscreenElement as HTMLElement);menu.showAtMouseEvent(e);};}
 if(refs.length>3)link(footer,`+${refs.length-3} in References`,openReferences||(()=>showAllReferences(app,ctx)),'ss-reference-overflow');
 if(theme.pagination&&page){const n=footer.ownerDocument.createElement('span');n.className='ss-page-number';n.textContent=page;footer.append(n);}
}
export function showAllReferences(app:App,ctx:CitationContext){
 const m=new Modal(app);m.titleEl.textContent='References';m.modalEl.classList.add('ss-reference-list-modal');
 for(const ref of ctx.refs.values()){const p=m.contentEl.createEl('p');link(p,`${ref.number}. ${ref.full}`,()=>openBibliographySource(app,ref),'ss-reference-full-link');}m.open();if(document.fullscreenElement)document.fullscreenElement.append(m.containerEl);
}
