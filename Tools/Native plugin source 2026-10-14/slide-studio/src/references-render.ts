import {sourceMenu} from './citation-sources';
import {App,Component,Modal,Menu} from 'obsidian';
import {Slide,Theme} from './model';
import {Reference} from './citations-core';
import {element,renderSlide} from './render';
import {showReference,openBibliographySource,openBibliographyEvidence} from './citation-render';
export async function renderReferences(app:App,stage:HTMLElement,refs:Reference[],index:number,total:number,path:string,owner:Component,theme:Theme){
 const dummy:Slide={kind:'slide',version:1,id:'references',title:'References',type:'content',section:'',source:'',appearance:theme.mode,style:theme.style,pattern:false,blocks:[]};
 await renderSlide(app,stage,dummy,path,owner,{...theme,footer:false,backgroundPattern:false},'','');
 stage.classList.add('ss-references-stage');
 const body=element(stage,'div','ss-references-body');element(body,'h1','','References');
 const list=element(body,'div','ss-references-list');
 for(const ref of refs){const row=element(list,'div','ss-reference-entry');element(row,'span','ss-reference-number',String(ref.number));const a=element(row,'a','ss-reference-full-link',ref.full);a.href='#';a.onclick=e=>{e.preventDefault();e.stopPropagation();openBibliographySource(app,ref);};a.oncontextmenu=e=>{e.preventDefault();e.stopPropagation();const menu=new Menu();if(ref.occurrences.length)menu.addItem(v=>v.setTitle('Open evidence viewer').onClick(()=>openBibliographyEvidence(app,ref)));menu.addItem(v=>v.setTitle('Reference details').onClick(()=>showReference(app,ref)));sourceMenu(app,menu,ref);if(document.fullscreenElement)menu.setParentElement(document.fullscreenElement as HTMLElement);menu.showAtMouseEvent(e);};}
 if(total>1)element(body,'span','ss-references-sheet',`${index+1} / ${total}`);
 // Fit unusually long bibliographies without truncating source information.
 const fit=()=>{for(let font=28;font>=18;font--){list.style.fontSize=font+'px';if(list.scrollHeight<=list.clientHeight)break;}};
 const ro=new ResizeObserver(fit);ro.observe(list);owner.register(()=>ro.disconnect());fit();
}
export function previewReferences(app:App,pages:Reference[][],path:string,theme:Theme,start=0){
 const m=new Modal(app);m.titleEl.textContent='References';m.modalEl.classList.add('ss-outline-preview');let owner:Component|undefined,index=start;
 const controls=element(m.contentEl,'div','ss-reference-preview-controls');
 const mount=element(m.contentEl,'div','ss-outline-preview-mount');
 const draw=async()=>{owner?.unload();owner=new Component();owner.load();mount.replaceChildren();const stage=element(mount,'div','ss-stage');await renderReferences(app,stage,pages[index],index,pages.length,path,owner,theme);stage.style.transform=`scale(${mount.clientWidth/1600})`;};
 for(const [label,delta]of [['Previous',-1],['Next',1]] as const){const b=element(controls,'button','',label);b.onclick=()=>{index=Math.max(0,Math.min(pages.length-1,index+delta));void draw();};}
 const ro=new ResizeObserver(()=>{const stage=mount.querySelector<HTMLElement>('.ss-stage');if(stage)stage.style.transform=`scale(${mount.clientWidth/1600})`;});ro.observe(mount);m.onClose=()=>{owner?.unload();ro.disconnect();};m.open();void draw();
}
