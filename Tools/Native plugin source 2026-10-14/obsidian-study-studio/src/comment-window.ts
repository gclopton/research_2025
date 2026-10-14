import {Modal,setIcon} from 'obsidian';
/** Resize the shared sticky/highlight editor without recreating its document. */
export function resizeCommentWindow(modal:Modal){
 const box=modal.modalEl;let maximized=false,previous={width:'',height:''};
 const toggle=box.createEl('button',{cls:'study-comment-maximize',attr:{'aria-label':'Maximize comment','title':'Maximize comment'}});setIcon(toggle,'maximize');
 toggle.onclick=()=>{maximized=!maximized;if(maximized){previous={width:box.style.width,height:box.style.height};box.style.width='calc(100vw - 32px)';box.style.height='calc(100vh - 32px)';}else{box.style.width=previous.width;box.style.height=previous.height;}box.classList.toggle('is-maximized',maximized);toggle.setAttribute('aria-label',maximized?'Restore comment size':'Maximize comment');toggle.title=maximized?'Restore comment size':'Maximize comment';setIcon(toggle,maximized?'minimize':'maximize');};
 for(const edge of ['n','s','e','w','ne','nw','se','sw']){
  const handle=box.createDiv({cls:`study-comment-resize study-comment-resize-${edge}`});handle.setAttribute('aria-hidden','true');
  handle.onpointerdown=e=>{if(maximized)return;e.preventDefault();handle.setPointerCapture(e.pointerId);const rect=box.getBoundingClientRect(),x=e.clientX,y=e.clientY;const win=box.ownerDocument.defaultView!;
   const move=(event:PointerEvent)=>{if(edge.includes('e')||edge.includes('w'))box.style.width=`${Math.max(Math.min(320,win.innerWidth-32),Math.min(win.innerWidth-32,rect.width+2*(event.clientX-x)*(edge.includes('w')?-1:1)))}px`;if(edge.includes('s')||edge.includes('n'))box.style.height=`${Math.max(Math.min(240,win.innerHeight-32),Math.min(win.innerHeight-32,rect.height+2*(event.clientY-y)*(edge.includes('n')?-1:1)))}px`;};
   const stop=()=>{handle.removeEventListener('pointermove',move);handle.removeEventListener('pointerup',stop);handle.removeEventListener('pointercancel',stop);};handle.addEventListener('pointermove',move);handle.addEventListener('pointerup',stop);handle.addEventListener('pointercancel',stop);
  };
 }
}
