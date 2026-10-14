import {App,TFile} from 'obsidian';
import {DiagramDefinition,Rect} from './diagram-model';
export function position(el:HTMLElement,r:Rect){Object.assign(el.style,{left:`${r.x*100}%`,top:`${r.y*100}%`,width:`${r.width*100}%`,height:`${r.height*100}%`});}
export function diagramImage(app:App,image:string,path:string){
 const file=app.metadataCache.getFirstLinkpathDest(image,path)??app.vault.getAbstractFileByPath(image);
 if(!(file instanceof TFile)||!['png','jpg','jpeg','gif','webp','svg'].includes(file.extension.toLowerCase()))throw Error(`Diagram image unavailable: ${image}`);
 return file;
}
export function renderDiagram(app:App,parent:HTMLElement,d:DiagramDefinition,path:string,label:(host:HTMLElement,id:string,index:number)=>void,allowMissing=false){
 const wrap=parent.createDiv('study-diagram-scroll'),stage=wrap.createDiv('study-diagram');
 if(d.minWidth){stage.style.minWidth=`${d.minWidth}px`;stage.style.maxWidth=`${Math.max(1200,d.minWidth)}px`;}
 let file:TFile;
 try{file=diagramImage(app,d.image,path);}catch(error){if(!allowMissing)throw error;wrap.setText(String(error));return stage;}
 const img=stage.createEl('img',{attr:{alt:d.alt,src:app.vault.getResourcePath(file),draggable:'false'}});img.onerror=()=>{stage.createDiv({text:'Unable to load diagram image.',cls:'study-error'});};
 for(const c of d.covers){const cover=stage.createDiv('study-diagram-cover');position(cover,c);cover.style.backgroundColor=c.color;}
 const svg=stage.ownerDocument.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 1000 1000');svg.setAttribute('preserveAspectRatio','none');svg.classList.add('study-diagram-lines');stage.append(svg);
 d.labels.forEach((r,i)=>{if(r.target){const line=stage.ownerDocument.createElementNS(svg.namespaceURI,'line');for(const [k,v]of Object.entries({x1:(r.x+r.width/2)*1000,y1:(r.y+r.height/2)*1000,x2:r.target.x*1000,y2:r.target.y*1000}))line.setAttribute(k,String(v));line.setAttribute('stroke','#416b8d');line.setAttribute('stroke-width','2');line.setAttribute('vector-effect','non-scaling-stroke');svg.append(line);}const host=stage.createDiv('study-diagram-label');position(host,r);host.dataset.label=r.id;label(host,r.id,i);});
 return stage;
}
