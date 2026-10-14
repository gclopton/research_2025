import {Component, Menu} from 'obsidian';
import {element, button} from './render';
import {ZoomViewport} from './zoom';
import {fitZoom} from './zoom-core';

/** Lives inside the presentation root, including when that root is fullscreen. */
export class ImageViewer extends Component {
  root!: HTMLElement;
  viewport!: ZoomViewport;
  private previous: HTMLElement | null = null;
  constructor(private parent: HTMLElement, private source: HTMLImageElement, private done: () => void){super();}
  onload(){
    this.previous=this.parent.ownerDocument.activeElement as HTMLElement|null;
    this.root=element(this.parent,'div','ss-image-viewer');this.root.tabIndex=-1;
    this.root.setAttribute('role','dialog');this.root.setAttribute('aria-modal','true');
    this.root.setAttribute('aria-label',`Image detail: ${this.source.alt || 'Slide image'}`);
    const mount=element(this.root,'div','ss-image-viewer-mount');
    const img=element(mount,'img','ss-image-viewer-image');img.alt=this.source.alt;img.draggable=false;
    const bar=element(this.root,'div','ss-image-viewer-bar');
    const status=element(bar,'span','');status.setAttribute('aria-live','polite');
    element(bar,'span','ss-image-viewer-hint','Scroll or pinch to zoom · Drag to pan · + / − · 0 fit · Esc return');
    button(bar,'Return to slide (Esc)',()=>this.done());
    this.viewport=this.addChild(new ZoomViewport(mount,img,()=>({width:img.naturalWidth||1600,height:img.naturalHeight||900}),fitZoom(),true,s=>{status.textContent=`${Math.round(s.zoom*100)}% of fit`;}));
    const fit=()=>{img.style.width=`${img.naturalWidth||1600}px`;img.style.height=`${img.naturalHeight||900}px`;this.viewport.fit();};
    this.registerDomEvent(img,'load',fit);
    this.registerDomEvent(img,'error',()=>{status.textContent='Image unavailable';});
    img.src=this.source.currentSrc||this.source.src;fit();
    this.registerDomEvent(this.root,'keydown',e=>{
      e.stopPropagation();
      if(e.key==='Escape'){e.preventDefault();this.done();}
      else if(['+','='].includes(e.key)){e.preventDefault();this.viewport.zoom(1.25);}
      else if(e.key==='-'){e.preventDefault();this.viewport.zoom(.8);}
      else if(e.key==='0'){e.preventDefault();this.viewport.reset();}
      else if(e.key.startsWith('Arrow')){e.preventDefault();this.viewport.pan(e.key==='ArrowLeft'?80:e.key==='ArrowRight'?-80:0,e.key==='ArrowUp'?80:e.key==='ArrowDown'?-80:0);}
      else if(e.key==='Tab'){e.preventDefault();bar.querySelector('button')?.focus();}
    });
    this.registerDomEvent(mount,'dblclick',e=>{e.preventDefault();this.viewport.reset();});
    this.registerDomEvent(this.root,'contextmenu',e=>{
      e.preventDefault();e.stopPropagation();const menu=new Menu();
      menu.addItem(i=>i.setTitle('Zoom in (+)').onClick(()=>this.viewport.zoom(1.25)));
      menu.addItem(i=>i.setTitle('Zoom out (−)').onClick(()=>this.viewport.zoom(.8)));
      menu.addItem(i=>i.setTitle('Fit image (0)').onClick(()=>this.viewport.reset()));
      menu.addSeparator();menu.addItem(i=>i.setTitle('Return to slide (Esc)').onClick(()=>this.done()));menu.showAtMouseEvent(e);
    });
    this.root.focus({preventScroll:true});
  }
  onunload(){this.root?.remove();if(this.previous?.isConnected)this.previous.focus({preventScroll:true});}
}
