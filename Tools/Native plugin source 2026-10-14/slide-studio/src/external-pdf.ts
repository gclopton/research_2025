import {Component, loadPdfJs} from 'obsidian';
import {promises as fs} from 'node:fs';
/** Read-only PDF pages; only pages near the scroll viewport own rendered canvases. */
export class ExternalPDF extends Component {
 private live=false;private task:any;private observer?:IntersectionObserver;private zoom=1;
 private pdf:any;private pages:HTMLElement[]=[];private rendered=new Map<HTMLElement,{cancel:()=>void}>();
 private resize?:ResizeObserver;private frame=0;
 constructor(private body:HTMLElement,private full:string,private page:number){super();}
 onload(){this.live=true;void this.start();}
 private async start(){
  try{
   const lib=await loadPdfJs();if(!this.live)return;
   if((await fs.stat(this.full)).size>128*1024*1024)throw Error('This PDF exceeds the embedded viewer limit (128 MB). Open the source from the context menu.');
   const bytes=await fs.readFile(this.full);if(!this.live)return;
   this.task=lib.getDocument({data:new Uint8Array(bytes)});this.pdf=await this.task.promise;if(!this.live)return;
   this.body.empty();this.body.addClass('ss-external-pdf');
   const first=await this.pdf.getPage(Math.min(this.page,this.pdf.numPages));if(!this.live)return;
   const view=first.getViewport({scale:1});first.cleanup();
   const size=()=>{
    for(const [el,job] of this.rendered){job.cancel();el.empty();}this.rendered.clear();
    const width=Math.max(100,Math.min(this.body.clientWidth-20,(this.body.clientHeight-16)*view.width/view.height))*this.zoom;
    this.body.style.setProperty('--ss-pdf-width',`${width}px`);
    for(const el of this.pages){el.style.width=width+'px';el.style.height=width*view.height/view.width+'px';this.observer?.unobserve(el);this.observer?.observe(el);}
   };
   this.observer=new IntersectionObserver(entries=>{
    for(const e of entries){const el=e.target as HTMLElement;if(e.isIntersecting)void this.render(el);else{this.rendered.get(el)?.cancel();this.rendered.delete(el);el.empty();}}
   },{root:this.body,rootMargin:'100px'});
   for(let n=1;n<=this.pdf.numPages;n++){
    const el=this.body.createDiv({cls:'ss-external-page',attr:{'aria-label':`PDF page ${n} of ${this.pdf.numPages}`,role:'img'}});el.dataset.page=String(n);this.pages.push(el);
   }
   size();this.body.scrollTop=this.pages[Math.min(this.page,this.pages.length)-1].offsetTop-this.pages[0].offsetTop;
   this.resize=new ResizeObserver(()=>{cancelAnimationFrame(this.frame);this.frame=requestAnimationFrame(size);});this.resize.observe(this.body);
   this.registerDomEvent(this.body,'wheel',e=>{if(!e.ctrlKey&&!e.metaKey)return;e.preventDefault();this.zoom=Math.max(1,Math.min(3,this.zoom*(e.deltaY<0?1.1:1/1.1)));size();},{passive:false});
  }catch(e){if(this.live)this.body.textContent='PDF preview unavailable: '+(e as Error).message;}
 }
 private async render(el:HTMLElement){
  if(this.rendered.has(el)||!this.live)return;
  let alive=true,task:any,page:any;const job={cancel:()=>{alive=false;task?.cancel();}};this.rendered.set(el,job);
  try{
   page=await this.pdf.getPage(Number(el.dataset.page));if(!alive||!this.live)return;
   const base=page.getViewport({scale:1}),scale=el.clientWidth/base.width;
   const viewport=page.getViewport({scale:scale*Math.min(2,window.devicePixelRatio||1)});
   const canvas=el.createEl('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);canvas.style.width='100%';canvas.style.height='auto';el.style.height=(base.height*scale)+'px';
   task=page.render({canvasContext:canvas.getContext('2d'),viewport});await task.promise;
  }catch(e){if(alive&&this.live)el.textContent='Could not render this page.';}finally{page?.cleanup();}
 }
 onunload(){this.live=false;cancelAnimationFrame(this.frame);this.observer?.disconnect();this.resize?.disconnect();for(const job of this.rendered.values())job.cancel();this.rendered.clear();void this.task?.destroy();}
}
