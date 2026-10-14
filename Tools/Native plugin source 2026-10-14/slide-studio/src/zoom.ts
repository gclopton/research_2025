import {Component} from 'obsidian';
import {constrainPan, fitZoom, zoomAt, type ZoomState} from './zoom-core';

/** Transform-only zoom. No render, source mutation, or layout measurement during dragging. */
export class ZoomViewport extends Component {
  private base = 1;
  private width = 0;
  private height = 0;
  private space = false;
  private drag?: {id: number; x: number; y: number; panX: number; panY: number};
  constructor(private mount: HTMLElement, private surface: HTMLElement,
    private size: () => {width: number; height: number}, public state: ZoomState,
    private image = false, private changed?: (state: ZoomState) => void) { super(); }
  onload() {
    const editable = (target: EventTarget | null) => (target as HTMLElement | null)?.closest('input,textarea,[contenteditable=true],.cm-editor');
    this.registerDomEvent(this.mount, 'wheel', e => {
      if (!this.image && editable(e.target)) return;
      if (this.image || e.ctrlKey || e.metaKey) {
        e.preventDefault(); e.stopPropagation();
        const r = this.mount.getBoundingClientRect();
        const delta = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? this.height : 1);
        this.zoom(Math.exp(-Math.max(-100, Math.min(100, delta)) * .01), e.clientX-r.left-r.width/2, e.clientY-r.top-r.height/2);
      } else if (this.state.zoom > 1) {
        e.preventDefault(); e.stopPropagation();
        const unit=e.deltaMode===1?16:e.deltaMode===2?this.height:1;
        this.pan(-e.deltaX*unit,-e.deltaY*unit);
      }
    }, {passive: false, capture: true});
    this.registerDomEvent(this.mount.ownerDocument, 'keydown', e => {
      if(e.code==='Space' && !editable(e.target) && this.mount.contains(this.mount.ownerDocument.activeElement)) {
        this.space=true; this.mount.classList.add('ss-pan-ready'); e.preventDefault();
      }
    });
    this.registerDomEvent(this.mount.ownerDocument, 'keyup', e => {if(e.code==='Space')this.release();});
    this.registerDomEvent(this.mount.ownerDocument.defaultView!, 'blur', () => this.release());
    this.registerDomEvent(this.mount, 'pointerdown', e => {
      if (e.button !== 1 && !(e.button === 0 && (this.image || this.space))) return;
      if(!this.image && editable(e.target))return;
      e.preventDefault(); e.stopImmediatePropagation();
      this.drag={id:e.pointerId,x:e.clientX,y:e.clientY,panX:this.state.x,panY:this.state.y};
      this.mount.setPointerCapture(e.pointerId); this.mount.classList.add('ss-panning');
    }, {capture:true});
    this.registerDomEvent(this.mount,'pointermove',e=>{
      const d=this.drag;if(!d||d.id!==e.pointerId)return;
      e.preventDefault();e.stopPropagation();
      this.update({...this.state,x:d.panX+e.clientX-d.x,y:d.panY+e.clientY-d.y});
    });
    const end=()=>this.release();
    this.registerDomEvent(this.mount,'pointerup',end);
    this.registerDomEvent(this.mount,'pointercancel',end);
    this.registerDomEvent(this.mount,'lostpointercapture',end);
    this.registerDomEvent(this.mount,'dragstart',e=>{if(this.image||this.space)e.preventDefault();});
    const resize=new ResizeObserver(()=>this.fit());resize.observe(this.mount);
    this.register(()=>resize.disconnect());this.fit();
  }
  release() {
    const id=this.drag?.id;this.drag=undefined;this.space=false;
    if(id!==undefined&&this.mount.hasPointerCapture(id))this.mount.releasePointerCapture(id);
    this.mount.classList.remove('ss-pan-ready','ss-panning');
  }
  fit() {
    const r=this.mount.getBoundingClientRect(),s=this.size();
    this.width=r.width;this.height=r.height;
    this.base=Math.max(.001,Math.min(Math.max(1,r.width-48)/s.width,Math.max(1,r.height-48)/s.height));
    this.update(this.state);
  }
  zoom(factor: number, x=0,y=0) {this.update(zoomAt(this.state,factor,x,y));}
  pan(x:number,y:number){this.update({...this.state,x:this.state.x+x,y:this.state.y+y});}
  reset(){this.update(fitZoom());}
  private update(state:ZoomState){
    const s=this.size();this.state=constrainPan(state,this.width,this.height,s.width*this.base,s.height*this.base);
    this.surface.style.transform=`translate(calc(-50% + ${this.state.x}px),calc(-50% + ${this.state.y}px)) scale(${this.base*this.state.zoom})`;
    this.mount.dataset.zoom=String(Math.round(this.state.zoom*100));
    this.changed?.(this.state);
  }
  onunload(){this.release();}
}
