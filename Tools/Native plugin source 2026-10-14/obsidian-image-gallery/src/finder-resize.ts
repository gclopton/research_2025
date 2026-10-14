import {Component,Modal} from 'obsidian';
export type FinderDimensions={width?:number;height?:number};
export function clampDimensions(width:number,height:number,viewportWidth:number,viewportHeight:number){return {width:Math.min(Math.max(420,width),Math.max(240,viewportWidth-32)),height:Math.min(Math.max(360,height),Math.max(200,viewportHeight-32))};}
/** Symmetric edge resizing preserves Obsidian's centered modal positioning. */
export function resizeFinder(modal:Modal,owner:Component,saved:FinderDimensions,save:(size:FinderDimensions)=>void){
 const el=modal.modalEl,win=el.ownerDocument.defaultView!;let preferred={...saved},frame=0;let pending:{w:number;h:number}|undefined;
 let drag:{handle:HTMLElement;id:number;x:number;y:number;w:number;h:number;edge:string}|undefined;
 const defaults=()=>({width:Math.min(1480,win.innerWidth*.96),height:Math.min(920,win.innerHeight*.88)});
 const apply=(w:number,h:number)=>{const size=clampDimensions(w,h,win.innerWidth,win.innerHeight);el.style.width=size.width+'px';el.style.height=size.height+'px';};
 const fit=()=>{const d=defaults();apply(preferred.width??d.width,preferred.height??d.height);};
 const finish=(cancel=false)=>{if(!drag)return;cancelAnimationFrame(frame);if(pending&&!cancel)apply(pending.w,pending.h);pending=undefined;const d=drag;drag=undefined;if(cancel)apply(d.w,d.h);else{const r=el.getBoundingClientRect();preferred={width:r.width,height:r.height};save(preferred);}if(d.handle.hasPointerCapture(d.id))d.handle.releasePointerCapture(d.id);};
 for(const edge of ['n','s','e','w','ne','nw','se','sw']){
  const handle=el.createDiv({cls:'igf-resize igf-resize-'+edge,attr:{'aria-hidden':'true'}});
  owner.registerDomEvent(handle,'pointerdown',e=>{if(e.button!==0)return;e.preventDefault();e.stopPropagation();const r=el.getBoundingClientRect();drag={handle,id:e.pointerId,x:e.clientX,y:e.clientY,w:r.width,h:r.height,edge};handle.setPointerCapture(e.pointerId);});
  owner.registerDomEvent(win,'pointermove',e=>{if(!drag||drag.handle!==handle||drag.id!==e.pointerId)return;const d=drag;cancelAnimationFrame(frame);pending={w:d.w+(d.edge.includes('e')?2:d.edge.includes('w')?-2:0)*(e.clientX-d.x),h:d.h+(d.edge.includes('s')?2:d.edge.includes('n')?-2:0)*(e.clientY-d.y)};frame=win.requestAnimationFrame(()=>{if(pending)apply(pending.w,pending.h);});});
  owner.registerDomEvent(win,'pointerup',e=>{if(drag?.handle!==handle)return;e.stopPropagation();finish();},true);owner.registerDomEvent(win,'pointercancel',()=>{if(drag?.handle===handle)finish(true);});
  owner.registerDomEvent(handle,'click',e=>e.stopPropagation());owner.registerDomEvent(handle,'dblclick',e=>{e.preventDefault();e.stopPropagation();reset();});
 }
 const reset=()=>{preferred={};save({});fit();};
 owner.registerDomEvent(win,'blur',()=>finish(true));
 owner.registerDomEvent(win,'resize',fit);owner.register(()=>{cancelAnimationFrame(frame);finish(true);el.querySelectorAll('.igf-resize').forEach(h=>h.remove());});
 fit();return {reset};
}
