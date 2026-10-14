import {App,Component,Modal} from 'obsidian';
import {Deck,Slide,Theme} from './model';
import {OutlinePage,outlineContext,outlineWindow} from './outlines';
import {element,renderSlide} from './render';

export async function renderOutline(app:App,stage:HTMLElement,deck:Deck,page:OutlinePage,path:string,owner:Component,theme:Theme){
  const {active,roots,parent,children,numbers,rootIndex}=outlineContext(deck,page.sectionId,page.sectionIds);
  const dummy:Slide={kind:'slide',version:1,id:`outline-${page.sectionId}`,title:'Outline',type:'content',section:'',source:'',appearance:theme.mode,style:theme.style,pattern:false,blocks:[]};
  await renderSlide(app,stage,dummy,path,owner,{...theme,backgroundPattern:false},deck.title,'');
  stage.classList.add('ss-outline-stage');
  const body=element(stage,'div','ss-outline-body');
  const header=element(body,'div','ss-outline-heading');
  element(header,'h1','','Outline');
  const columns=element(body,'div','ss-outline-columns');
  const list=element(columns,'ol','ss-outline-overview');list.setAttribute('aria-label','Presentation sections');
  const window=outlineWindow(roots,rootIndex,roots.every(g=>g.title.length<=30)?7:5);
  if(window.earlier)element(list,'li','ss-outline-more',`${window.earlier} earlier section${window.earlier===1?'':'s'}`);
  window.items.forEach((g,i)=>{
    const index=window.start+i,row=element(list,'li','ss-outline-root');
    row.classList.toggle('is-current',index===rootIndex);row.classList.toggle('is-complete',index<rootIndex);
    if(index===rootIndex)row.setAttribute('aria-current','step');
    element(row,'span','ss-outline-part',numbers.get(g.id)!);
    element(row,'span','ss-outline-name',g.title);
  });
  if(window.later)element(list,'li','ss-outline-more',`${window.later} later section${window.later===1?'':'s'}`);
  columns.classList.toggle('ss-outline-single',!children.length);
  if(children.length){
    const detail=element(columns,'div','ss-outline-detail');
    const local=element(detail,'ol','ss-outline-children');local.setAttribute('aria-label',`Subsections of ${parent.title}`);
    const at=children.findIndex(g=>g.id===active.id),items=outlineWindow(children,Math.max(0,at),4);
    if(items.earlier)element(local,'li','ss-outline-more',`${items.earlier} earlier subsection${items.earlier===1?'':'s'}`);
    items.items.forEach((g,i)=>{const row=element(local,'li','ss-outline-child');row.classList.toggle('is-current',g.id===active.id);if(g.id===active.id)row.setAttribute('aria-current','step');element(row,'span','ss-outline-part',numbers.get(g.id)!);element(row,'span','ss-outline-name',g.title);});
    if(items.later)element(local,'li','ss-outline-more',`${items.later} later subsection${items.later===1?'':'s'}`);
    // A fixed detail panel stays readable while the connector follows the active root.
    const svg=stage.ownerDocument.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.classList.add('ss-outline-connector');svg.setAttribute('aria-hidden','true');
    const pathEl=stage.ownerDocument.createElementNS(svg.namespaceURI,'path');svg.append(pathEl);columns.append(svg);
    const connect=()=>{
      const selected=list.querySelector<HTMLElement>('.is-current');if(!selected)return;
      const x=selected.offsetLeft+selected.offsetWidth,y=selected.offsetTop+selected.offsetHeight/2;
      const endX=detail.offsetLeft,endY=detail.offsetTop+30,mid=(x+endX)/2;
      svg.setAttribute('viewBox',`0 0 ${columns.clientWidth} ${columns.clientHeight}`);
      pathEl.setAttribute('d',`M ${x} ${y} H ${mid} V ${endY} H ${endX}`);
    };
    const resize=new ResizeObserver(connect);resize.observe(columns);resize.observe(detail);resize.observe(list);
    owner.register(()=>resize.disconnect());

  }
}
export function previewOutline(app:App,deck:Deck,page:OutlinePage,path:string,theme:Theme){
  const modal=new Modal(app),owner=new Component();owner.load();
  modal.titleEl.textContent='Outline preview';modal.modalEl.classList.add('ss-outline-preview');
  const mount=element(modal.contentEl,'div','ss-outline-preview-mount'),stage=element(mount,'div','ss-stage');
  const fit=()=>stage.style.transform=`scale(${mount.clientWidth/1600})`;
  const resize=new ResizeObserver(fit);resize.observe(mount);modal.onClose=()=>{resize.disconnect();owner.unload();};
  void renderOutline(app,stage,deck,page,path,owner,theme).then(fit);modal.open();
}
