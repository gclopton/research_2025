import {palettePosition} from './palette-position';
import {Plugin,Notice,setIcon,Menu,MarkdownView} from 'obsidian';
import {ReviewStore} from './review';
import {AnnotationStyle,annotationStyles,styleNames,CommentColor} from './review-model';
import {swatchTitle} from './annotation-menu';
export class FloatingPalette {
 private el?:HTMLElement;private cleanupResize?:()=>void;private style:AnnotationStyle='highlight';private x=80;private y=110;
 private pending=Promise.resolve();private saved='';private index=0;private returnFocus?:()=>void;
 constructor(readonly plugin:Plugin,readonly store:ReviewStore,readonly apply:(style:AnnotationStyle,p:CommentColor)=>Promise<void>,readonly capture:()=>void){
  const refresh=()=>this.renderColors();store.listeners.add(refresh);plugin.register(()=>{store.listeners.delete(refresh);this.cleanupResize?.();this.el?.remove();});
 }
 private get path(){return `${this.plugin.app.vault.configDir}/study-studio-palette-ui.json`;}
 async load(){try{if(await this.plugin.app.vault.adapter.exists(this.path)){const p=JSON.parse(await this.plugin.app.vault.adapter.read(this.path));if(Number.isFinite(p.x))this.x=p.x;if(Number.isFinite(p.y))this.y=p.y;if(annotationStyles.includes(p.style))this.style=p.style;this.saved=JSON.stringify({x:this.x,y:this.y,style:this.style,open:!!p.open});if(p.open)this.plugin.app.workspace.onLayoutReady(()=>this.open());}}catch{/* The note records are stored separately. */}}
 private save(open=true){const raw=JSON.stringify({x:this.x,y:this.y,style:this.style,open});if(raw===this.saved)return;this.saved=raw;this.pending=this.pending.catch(()=>{}).then(()=>this.plugin.app.vault.adapter.write(this.path,raw));void this.pending.catch(e=>{this.saved='';new Notice('Could not remember palette position: '+String(e));});}
 close(restore=false){this.cleanupResize?.();this.cleanupResize=undefined;this.el?.remove();this.el=undefined;this.save(false);if(restore)this.returnFocus?.();}
 private remember(){const view=this.plugin.app.workspace.getActiveViewOfType(MarkdownView);if(view){this.returnFocus=()=>{this.plugin.app.workspace.setActiveLeaf(view.leaf,{focus:true});if(view.getMode()==='source')view.editor.focus();else{view.contentEl.tabIndex=-1;view.contentEl.focus({preventScroll:true});}};}this.capture();}
 private choose(style:AnnotationStyle,focus=false){this.style=style;this.index=0;for(const b of this.el?.querySelectorAll<HTMLElement>('[data-palette-style]')??[])b.setAttribute('aria-pressed',String(b.dataset.paletteStyle===style));this.renderColors();this.save();if(focus)this.focusColor();}
 private focusColor(){this.el?.querySelectorAll<HTMLButtonElement>('.study-palette-color')[this.index]?.focus({preventScroll:true});}
 private use(p:CommentColor,keyboard=false){void this.apply(this.style,p).then(()=>{if(keyboard)this.returnFocus?.();}).catch(e=>new Notice(String(e)));}
 open(style?:AnnotationStyle,keyboard=false){
  const doc=this.plugin.app.workspace.getMostRecentLeaf()?.view.containerEl.ownerDocument??document,win=doc.defaultView!;
  if(keyboard)this.remember();
  if(this.el?.isConnected&&this.el.ownerDocument===doc){if(style)this.choose(style);if(keyboard)this.focusColor();return;}
  this.cleanupResize?.();this.el?.remove();if(style)this.style=style;
  const el=doc.createElement('section');this.el=el;el.className='study-floating-palette';el.tabIndex=-1;el.setAttribute('aria-label','Annotation palette');el.setAttribute('role','region');
  const head=el.createDiv('study-palette-handle');head.createSpan({text:'Annotations'});head.setAttribute('aria-label','Drag to move; arrow keys move when focused');head.tabIndex=0;
  const close=head.createEl('button',{cls:'clickable-icon',attr:{'aria-label':'Close annotation palette'}});setIcon(close,'x');close.onclick=()=>this.close(true);
  el.addEventListener('mousedown',e=>{if((e.target as HTMLElement).closest('button')){if(!el.contains(doc.activeElement))this.remember();e.preventDefault();}});
  const types=el.createDiv('study-palette-types');types.setAttribute('role','toolbar');types.setAttribute('aria-label','Annotation style');
  const icons={highlight:'highlighter',underline:'underline',text:'type',sticky:'sticky-note'};
  for(const style of annotationStyles){const b=types.createEl('button',{cls:'clickable-icon',attr:{'aria-label':styleNames[style],'aria-pressed':String(style===this.style)}});b.dataset.paletteStyle=style;setIcon(b,icons[style]);b.onclick=e=>this.choose(style,e.detail===0);}
  el.createDiv('study-palette-colors');el.createDiv('study-palette-meaning').setAttribute('aria-live','polite');
  let drag:{id:number;x:number;y:number;left:number;top:number}|undefined;
  const clamp=()=>{const header=doc.querySelector('.workspace-tab-header-container')?.getBoundingClientRect().bottom??40;const at=palettePosition(this.x,this.y,el.offsetWidth,el.offsetHeight,win.innerWidth,win.innerHeight,header);this.x=at.x;this.y=at.y;el.style.left=this.x+'px';el.style.top=this.y+'px';};
  head.onpointerdown=e=>{if((e.target as HTMLElement).closest('button'))return;e.preventDefault();drag={id:e.pointerId,x:e.clientX,y:e.clientY,left:this.x,top:this.y};head.setPointerCapture(e.pointerId);};
  head.onpointermove=e=>{if(!drag||e.pointerId!==drag.id)return;this.x=drag.left+e.clientX-drag.x;this.y=drag.top+e.clientY-drag.y;clamp();};
  const finish=()=>{if(drag){drag=undefined;this.save();}};head.onpointerup=finish;head.onpointercancel=finish;head.onlostpointercapture=finish;
  head.onkeydown=e=>{if(e.target!==head)return;const delta:{[key:string]:number[]}={ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]};if(delta[e.key]){e.preventDefault();e.stopPropagation();this.x+=delta[e.key][0];this.y+=delta[e.key][1];clamp();this.save();}};
  el.addEventListener('keydown',e=>{if(e.metaKey||e.ctrlKey||e.altKey)return;const style=({h:'highlight',u:'underline',t:'text',p:'sticky'} as Record<string,AnnotationStyle>)[e.key.toLowerCase()];const colors=this.store.paletteFor(this.style);if(e.key==='Escape'){e.preventDefault();e.stopPropagation();this.close(true);}else if(style){e.preventDefault();e.stopPropagation();this.choose(style,true);}else if(/^[1-9]$/.test(e.key)){e.preventDefault();e.stopPropagation();const p=colors[Number(e.key)-1];if(p)this.use(p,true);}else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();e.stopPropagation();this.index=(this.index+(['ArrowLeft','ArrowUp'].includes(e.key)?-1:1)+colors.length)%Math.max(1,colors.length);this.renderColors();this.focusColor();}});
  el.oncontextmenu=e=>{e.preventDefault();new Menu().addItem(i=>i.setTitle('Color meanings…').setIcon('palette').onClick(()=>{(this.plugin.app as any).setting.open();(this.plugin.app as any).setting.openTabById('study-studio');})).showAtMouseEvent(e);};
  doc.body.append(el);this.renderColors();clamp();this.save();win.addEventListener('resize',clamp);this.cleanupResize=()=>win.removeEventListener('resize',clamp);if(keyboard)this.focusColor();
 }
 private renderColors(){const el=this.el;if(!el)return;const colors=el.querySelector<HTMLElement>('.study-palette-colors')!,meaning=el.querySelector<HTMLElement>('.study-palette-meaning')!,focused=colors.contains(el.ownerDocument.activeElement);colors.empty();meaning.setText(styleNames[this.style]);const entries=this.store.paletteFor(this.style);this.index=Math.min(this.index,Math.max(0,entries.length-1));entries.forEach((p,index)=>{const b=colors.createEl('button',{cls:'study-palette-color',attr:{'aria-label':`${index+1}. ${styleNames[this.style]}: ${p.meaning||p.color}`}});b.tabIndex=index===this.index?0:-1;b.append(swatchTitle(this.style,p,''));b.querySelector('.study-palette-swatch')?.nextSibling?.remove();b.onmouseenter=()=>meaning.setText(`${index+1} · ${p.meaning||p.color}`);b.onfocus=()=>{this.index=index;meaning.setText(`${index+1} · ${p.meaning||p.color}`);};b.onmouseleave=()=>meaning.setText(styleNames[this.style]);b.onclick=e=>this.use(p,e.detail===0);});if(!entries.length)meaning.setText('Add colors in settings');if(focused)this.focusColor();}
}
