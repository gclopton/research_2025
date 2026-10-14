import {menuGroup} from './menu-groups';
import {paletteItems,swatchTitle} from './annotation-menu';
import {AnnotationStyle,annotationStyles,styleNames,styleOf,typeKey,stylePalettes} from './review-model';
import {AnnotationVisibility,readVisibility,annotationVisible} from './annotation-visibility';
import {mergeReview,commentPaths,sanitizedReview} from './margin-model';
import {resizeCommentWindow} from './comment-window';
import {RichMarkdown} from './rich-markdown';
import {writtenEditor} from './written-editor';
import {App,Menu,Modal,Notice,Component} from 'obsidian';
import {Question} from './model';
import {Critique,QuestionReview,safeColor,locateQuote,CommentColor,commentPalette,darkCommentColor} from './review-model';
export interface ReviewChange {paths:Set<string>;commentIds:Set<string>;annotations:boolean}
export class ReviewStore {
 data:{version:1;questions:QuestionReview[];comments:Critique[];palette?:CommentColor[];palettes?:Record<AnnotationStyle,CommentColor[]>;paletteSpectrumVersion?:number}={version:1,questions:[],comments:[]};
 private hoverNodes=new WeakSet<HTMLElement>();private hoverClosers=new Set<()=>void>();
 closeHoverPreviews(){for(const close of [...this.hoverClosers])close();}
 openMargin?:(anchor?:Pick<Critique,'path'|'quote'|'before'|'after'>&Partial<Critique>,editing?:boolean)=>Promise<void>;
 addToMargin?:(anchors:import('./review-model').MarginAnchor[])=>void;
 private baseline:any;private pending=Promise.resolve();readonly listeners=new Set<(change?:ReviewChange)=>void>();
 visibility:AnnotationVisibility=readVisibility(null);private visibilityPending=Promise.resolve();private visibilityBlocked=false;
 constructor(readonly app:App){}
 private get visibilityPath(){return `${this.app.vault.configDir}/study-studio-annotation-visibility.json`;}
 isAnnotationVisible(c:Critique){return annotationVisible(c,this.visibility);}
 async setVisibility(value:AnnotationVisibility){
  if(this.visibilityBlocked){new Notice('Annotation visibility settings could not be read. The original file has been preserved.');return;}
  const next=readVisibility(value);if(next.enabled===this.visibility.enabled&&[...next.hiddenTypes].sort().join('\0')===[...this.visibility.hiddenTypes].sort().join('\0'))return;this.visibility=next;const raw=JSON.stringify(this.visibility,null,2);
  const comments=this.data.comments.filter(c=>!c.questionId);this.notify({annotations:true,paths:new Set(comments.flatMap(c=>[...commentPaths(c)])),commentIds:new Set(comments.map(c=>c.id))});
  this.visibilityPending=this.visibilityPending.catch(()=>{}).then(()=>this.app.vault.adapter.write(this.visibilityPath,raw));await this.visibilityPending;
 }
 renameVisibilityType(style:AnnotationStyle,old:string,next:string){if(this.visibility.hiddenTypes.includes(typeKey(style,old)))void this.setVisibility({...this.visibility,hiddenTypes:[...new Set([...this.visibility.hiddenTypes,typeKey(style,next)])]}).catch(e=>new Notice(String(e)));}
 visibilityMenu(position?:{x:number;y:number}){const menu=new Menu();this.populateVisibility(menu);const win=(this.app.workspace.getMostRecentLeaf()?.view.containerEl.ownerDocument??document).defaultView!;menu.showAtPosition(position??{x:win.innerWidth/2,y:120});}
 private populateVisibility(menu:Menu){
  const change=(value:AnnotationVisibility)=>void this.setVisibility(value).catch(e=>new Notice(String(e)));
  menu.addItem(i=>i.setTitle('Show annotations in notes').setChecked(this.visibility.enabled).onClick(()=>change({...this.visibility,enabled:!this.visibility.enabled})));
  for(const style of annotationStyles){const child=menuGroup(menu,'visibility-'+style,styleNames[style],style==='sticky'?'sticky-note':style==='underline'?'underline':style==='text'?'type':'highlighter');
   const entries=this.paletteFor(style).map(p=>({...p}));for(const c of this.data.comments.filter(c=>!c.deletedAt&&!c.questionId&&styleOf(c)===style))if(!entries.some(p=>p.meaning===c.intent))entries.push({meaning:c.intent,color:c.color,darkColor:c.darkColor});
   for(const p of entries){const key=typeKey(style,p.meaning);child.addItem(i=>i.setTitle(swatchTitle(style,p)).setChecked(!this.visibility.hiddenTypes.includes(key)).onClick(()=>change({...this.visibility,hiddenTypes:this.visibility.hiddenTypes.includes(key)?this.visibility.hiddenTypes.filter(t=>t!==key):[...this.visibility.hiddenTypes,key]})));}
  }
  menu.addItem(i=>i.setTitle('Show all').onClick(()=>change({version:2,enabled:true,hiddenTypes:[]})));
 }
 addVisibilityMenu(menu:Menu,_position?:{x:number;y:number}){const child=menuGroup(menu,'annotation-visibility','Annotations','eye');if((child as any).__studyVisibility)return;(child as any).__studyVisibility=true;this.populateVisibility(child);}
 addMarkMenu(menu:Menu,anchor:Pick<Critique,'path'|'quote'|'before'|'after'>&Partial<Critique>){
  if((menu as any).__studyMarkMenu)return;(menu as any).__studyMarkMenu=true;
  for(const style of ['highlight','underline','text'] as const){const child=menuGroup(menu,'mark-'+style,styleNames[style],style==='highlight'?'highlighter':style==='underline'?'underline':'type');paletteItems(child,style,this.paletteFor(style),p=>void this.createMark(anchor,style,p));}
 }
 async createMark(anchor:Pick<Critique,'path'|'quote'|'before'|'after'>&Partial<Critique>,style:AnnotationStyle,p:CommentColor){
  const c:Critique={...anchor,id:crypto.randomUUID(),comment:'',intent:p.meaning,color:p.color,darkColor:p.darkColor,markStyle:style==='sticky'?undefined:style,kind:style==='sticky'?'sticky':undefined,updated:new Date().toISOString(),resolved:false};
  this.data.comments.push(c);let saved=false;try{await this.save({paths:commentPaths(c),commentIds:new Set([c.id]),annotations:true});saved=true;this.warnHidden(c);await this.openMargin?.(c);}catch(e){if(!saved)this.data.comments=this.data.comments.filter(item=>item.id!==c.id);new Notice((saved?'Annotation saved; could not open margin: ':'Could not save annotation: ')+String(e));}
 }
 warnHidden(c:Critique){if(this.isAnnotationVisible(c))return;const fragment=document.createDocumentFragment();fragment.append((c.intent||'This type')+' is hidden in the main note. ');const show=document.createElement('a');show.textContent='Show';show.href='#';fragment.append(show);const notice=new Notice(fragment,7000);show.onclick=e=>{e.preventDefault();void this.setVisibility({enabled:true,hiddenTypes:this.visibility.hiddenTypes.filter(t=>t!==typeKey(styleOf(c),c.intent))}).catch(e=>new Notice(String(e)));notice.hide();};}

 get palette(){return this.paletteFor('highlight');}
 paletteFor(style:AnnotationStyle){this.data.palettes??=stylePalettes(undefined,this.data.palette);return this.data.palettes[style];}
 private get path(){return `${this.app.vault.configDir}/study-studio-review.json`;}
 async load(){if(await this.app.vault.adapter.exists(this.visibilityPath)){try{this.visibility=readVisibility(JSON.parse(await this.app.vault.adapter.read(this.visibilityPath)));}catch{this.visibilityBlocked=true;new Notice('Annotation visibility settings could not be read. All marks are visible; the original file was preserved.');}}if(await this.app.vault.adapter.exists(this.path)){const value=JSON.parse(await this.app.vault.adapter.read(this.path));if(value.version!==1||!Array.isArray(value.questions)||!Array.isArray(value.comments))throw Error('Invalid Study Studio review file; original preserved.');this.baseline=JSON.parse(JSON.stringify(this.clean(value)));this.data=this.clean(value);this.data.palette=commentPalette(value.palette);this.data.palettes=stylePalettes(value.palettes,value.palette);}this.baseline??=JSON.parse(JSON.stringify(this.data));if(!this.data.paletteSpectrumVersion){this.data.palettes??=stylePalettes(undefined,this.data.palette);for(const style of annotationStyles){const list=this.data.palettes[style];for(const color of stylePalettes(undefined,undefined)[style])if(!list.some(p=>p.color.toLowerCase()===color.color.toLowerCase()||p.meaning===color.meaning))list.push(color);}this.data.paletteSpectrumVersion=1;}}
 private reportedInvalid='';
 private clean(raw:any){const value=sanitizedReview(raw),invalid=raw.comments.filter((c:any)=>!value.comments.includes(c));const signature=JSON.stringify(invalid);if(invalid.length&&signature!==this.reportedInvalid)new Notice(`${invalid.length} invalid margin record(s) were left intact in the review file. Other notes remain available.`);this.reportedInvalid=signature;return value;}
 private notify(change?:ReviewChange){this.closeHoverPreviews();setTimeout(()=>{for(const fn of [...this.listeners]){try{fn(change);}catch(error){console.error('Study Studio review refresh',error);}}},0);}
 async refresh(){await this.pending.catch(()=>{});if(!await this.app.vault.adapter.exists(this.path))return;const remote=JSON.parse(await this.app.vault.adapter.read(this.path));const merged=mergeReview(this.baseline??this.data,this.data,remote);if(JSON.stringify(merged)===JSON.stringify(this.data))return;this.data=this.clean(merged);this.baseline=JSON.parse(JSON.stringify(this.clean(remote)));this.notify();}
 async save(change?:ReviewChange){
  if(this.data.palettes)this.data.palette=this.data.palettes.highlight;
  const local=JSON.parse(JSON.stringify(this.data)),base=JSON.parse(JSON.stringify(this.baseline??this.data));
  const write=this.pending.catch(()=>{}).then(async()=>{
   const remote=await this.app.vault.adapter.exists(this.path)?JSON.parse(await this.app.vault.adapter.read(this.path)):base;
   const merged=mergeReview(base,local,remote);await this.app.vault.adapter.write(this.path,JSON.stringify(merged,null,2));
   const current=this.data;this.data=this.clean(JSON.stringify(current)===JSON.stringify(local)?merged:mergeReview(local,current,merged));this.baseline=JSON.parse(JSON.stringify(this.clean(merged)));
   let actual=change;
   const external=this.clean(merged).comments.filter((c:Critique)=>JSON.stringify(c)!==JSON.stringify(local.comments.find((x:Critique)=>x.id===c.id)));
   external.push(...local.comments.filter((c:Critique)=>!merged.comments.some((x:Critique)=>x?.id===c.id)));
   if(external.length)actual={annotations:true,paths:new Set([...(change?.paths??[]),...external.flatMap((c:Critique)=>[...commentPaths(c)])]),commentIds:new Set([...(change?.commentIds??[]),...external.map((c:Critique)=>c.id)])};
   this.notify(actual);
  });this.pending=write;await write;
 }
 decorate(host:HTMLElement,questionId:string){
  host.querySelectorAll('.study-critique').forEach(mark=>mark.replaceWith(...Array.from(mark.childNodes)));
  for(const c of this.data.comments.filter(c=>c.questionId===questionId&&!c.resolved&&c.quote)){
   const walker=host.ownerDocument.createTreeWalker(host,NodeFilter.SHOW_TEXT),nodes:Text[]=[];let node:Node|null;
   while((node=walker.nextNode()))if(!node.parentElement?.closest('input,textarea,button,.cm-editor,.study-critique,mjx-container'))nodes.push(node as Text);
   const raw=nodes.map(n=>n.data).join(''),at=locateQuote(raw,c);if(!at)continue;let offset=0;
   for(const n of nodes){const end=offset+n.length;if(end>at.from&&offset<at.to){const start=Math.max(0,at.from-offset),len=Math.min(end,at.to)-offset-start,piece=n.splitText(start);piece.splitText(len);const mark=host.ownerDocument.createElement('span');mark.className='study-critique';mark.style.setProperty('--critique-color',safeColor(c.color));mark.style.setProperty('--critique-dark',darkCommentColor(c));mark.onmouseenter=()=>this.hover(mark,c);mark.tabIndex=0;piece.replaceWith(mark);mark.append(piece);mark.onclick=e=>{e.preventDefault();e.stopPropagation();this.edit(c);};mark.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();this.edit(c);}};}offset=end;}
  }
 }
 hover(node:HTMLElement,c:Critique){
  if(!c.comment.trim()||this.hoverNodes.has(node))return;this.closeHoverPreviews();this.hoverNodes.add(node);
  const popup=node.ownerDocument.createElement('div');popup.className='study-comment-popover';popup.setAttribute('role','tooltip');popup.style.setProperty('--critique-color',safeColor(c.color));popup.style.setProperty('--critique-dark',darkCommentColor(c));const content=node.ownerDocument.createElement('div');content.className='markdown-rendered';popup.append(content);
  const owner=new Component();owner.load();const rect=node.getBoundingClientRect();popup.style.position='fixed';popup.style.left=`${Math.max(8,Math.min(rect.left,(node.ownerDocument.defaultView?.innerWidth??800)-440))}px`;popup.style.top=`${Math.max(8,Math.min(rect.bottom+4,(node.ownerDocument.defaultView?.innerHeight??600)-300))}px`;node.ownerDocument.body.append(popup);void RichMarkdown.render(this.app,c.comment,content,c.path,owner);
  const close=()=>{popup.remove();owner.unload();this.hoverNodes.delete(node);this.hoverClosers.delete(close);node.removeEventListener('mouseleave',close);node.removeEventListener('click',close);node.ownerDocument.removeEventListener('scroll',onScroll,true);node.ownerDocument.defaultView?.removeEventListener('resize',close);};const onScroll=(event:Event)=>{if(!popup.contains(event.target as Node))close();};node.ownerDocument.addEventListener('scroll',onScroll,true);node.ownerDocument.defaultView?.addEventListener('resize',close);this.hoverClosers.add(close);node.addEventListener('mouseleave',close,{once:true});node.addEventListener('click',close,{once:true});
 }
 questionMenu(menu:Menu,q:Question,host:HTMLElement,context:string){
  const review=this.data.questions.find(r=>r.questionId===q.definition.id&&r.context===context);
  const selection=host.ownerDocument.getSelection();const quote=selection&&host.contains(selection.anchorNode)?selection.toString():'';
  menu.addItem(i=>i.setTitle(review?.remove?'Unmark question for removal':'Mark question for removal').setIcon('flag').onClick(()=>{
   const item=review??{questionId:q.definition.id,path:q.path,title:q.definition.title,context,remove:false,updated:''};item.remove=!item.remove;item.updated=new Date().toISOString();if(!review)this.data.questions.push(item);
   void this.save({paths:new Set(),commentIds:new Set(),annotations:false}).then(()=>{host.querySelector('.study-review-status')?.remove();if(item.remove)host.createSpan({cls:'study-review-status',text:'Marked for removal'});new Notice(item.remove?'Marked for review. Question and exam remain unchanged.':'Removal mark cleared.');}).catch(e=>new Notice(String(e)));
  }));
  menu.addItem(i=>i.setTitle(quote?'Comment on selection…':'Comment on question…').setIcon('message-square').onClick(()=>this.edit({path:q.path,questionId:q.definition.id,context,quote,before:'',after:''},()=>this.decorate(host,q.definition.id))));
  const comments=this.data.comments.filter(c=>c.questionId===q.definition.id&&!c.resolved);if(comments.length)menu.addItem(i=>i.setTitle(`Review comments (${comments.length})…`).onClick(()=>this.list(q.definition.id)));
 }
 edit(anchor:Pick<Critique,'path'|'quote'|'before'|'after'>&Partial<Critique>,saved?:()=>void){
  if(!anchor.questionId&&this.openMargin){void this.openMargin(anchor);return;}
  const draftId=anchor.id??crypto.randomUUID();const modal=new Modal(this.app);modal.modalEl.addClass('study-comment-editor');modal.titleEl.setText(anchor.kind==='sticky'?'Sticky note':anchor.id?'Edit comment':'Add comment');
  if(anchor.quote)modal.contentEl.createEl('blockquote',{text:anchor.quote});
  resizeCommentWindow(modal);
  const choices=this.paletteFor(styleOf(anchor)).map(c=>({...c}));
  let chosen=choices.findIndex(c=>c.meaning===anchor.intent&&c.color.toLowerCase()===anchor.color?.toLowerCase());
  if(anchor.intent!==undefined&&chosen<0){chosen=choices.length;choices.push({meaning:anchor.intent,color:safeColor(anchor.color??''),darkColor:darkCommentColor({color:anchor.color??'',darkColor:anchor.darkColor})});}
  if(!choices.length)choices.push({meaning:'Other',color:'#55aa77'});
  const select=modal.contentEl.createEl('select',{attr:{'aria-label':'Comment meaning'}});
  choices.forEach((c,index)=>select.createEl('option',{text:c.meaning.trim()||c.color,value:String(index)}));select.value=String(chosen<0?0:chosen);
  const color=modal.contentEl.createEl('input',{type:'color',attr:{'aria-label':'Comment color'}});color.value=safeColor(anchor.color??choices[Number(select.value)].color);const dark=modal.contentEl.createEl('input',{type:'color',attr:{'aria-label':'Dark-mode comment color'}});dark.value=darkCommentColor(anchor.color?{color:anchor.color,darkColor:anchor.darkColor}:choices[Number(select.value)]);select.onchange=()=>{color.value=choices[Number(select.value)].color;dark.value=darkCommentColor(choices[Number(select.value)]);};
  const owner=new Component();owner.load();let busy=false;const editor=writtenEditor(this.app,modal.contentEl,anchor.path,anchor.comment??'',owner,()=>{},active=>busy=active,'Comment',{rich:true,toolbar:false,placeholder:'Write your critique…'});modal.onClose=()=>owner.unload();
  const error=modal.contentEl.createEl('p',{cls:'study-error'});const save=modal.contentEl.createEl('button',{text:'Save comment · Ctrl+Enter',cls:'mod-cta'});
  save.onclick=()=>{if(save.disabled)return;if(busy){error.setText('Finish the active equation or image editor first.');return;}if(!editor.value.trim()){error.setText('Write a comment first.');editor.focus();return;}const item:Critique={...anchor,id:draftId,path:anchor.path,kind:anchor.kind,questionId:anchor.questionId,context:anchor.context,quote:anchor.quote,before:anchor.before,after:anchor.after,comment:editor.value,color:color.value,darkColor:dark.value,intent:choices[Number(select.value)].meaning,updated:new Date().toISOString(),resolved:anchor.resolved??false};const index=this.data.comments.findIndex(c=>c.id===item.id);if(index<0)this.data.comments.push(item);else this.data.comments[index]=item;save.disabled=true;save.setText('Saving…');void this.save({paths:new Set([item.path]),commentIds:new Set([item.id]),annotations:!item.questionId}).then(()=>{modal.close();saved?.();}).catch(e=>{error.setText(String(e));save.disabled=false;save.setText('Save comment · Ctrl+Enter');});};
  if(this.data.comments.some(c=>c.id===anchor.id)){const resolve=modal.contentEl.createEl('button',{text:anchor.resolved?'Reopen':'Resolve'});resolve.onclick=()=>{if(resolve.disabled||save.disabled)return;resolve.disabled=true;save.disabled=true;const c=this.data.comments.find(c=>c.id===anchor.id)!;c.resolved=!c.resolved;void this.save({paths:new Set([c.path]),commentIds:new Set([c.id]),annotations:!c.questionId}).then(()=>modal.close()).catch(e=>{error.setText(String(e));resolve.disabled=false;save.disabled=false;});};}
  modal.modalEl.addEventListener('keydown',e=>{if(e.ctrlKey&&e.key==='Enter'){e.preventDefault();e.stopPropagation();save.click();}},true);modal.open();editor.focus();
 }
 list(questionId?:string){if(!questionId&&this.openMargin){void this.openMargin();return;}const modal=new Modal(this.app);modal.titleEl.setText('Review queue');for(const r of this.data.questions.filter(r=>r.remove&&(!questionId||r.questionId===questionId))){const row=modal.contentEl.createDiv();row.createEl('p',{text:`Remove: ${r.title}`});row.createEl('small',{text:r.context});row.createEl('button',{text:'Unmark'}).onclick=()=>{r.remove=false;void this.save({paths:new Set(),commentIds:new Set(),annotations:false}).then(()=>row.remove()).catch(e=>new Notice(String(e)));};}for(const c of this.data.comments.filter(c=>!c.resolved&&(!questionId||c.questionId===questionId))){const row=modal.contentEl.createDiv();row.createEl('p',{text:`${c.intent}: ${c.quote||c.questionId||c.path}`});const owner=new Component();owner.load();const previous=modal.onClose.bind(modal);modal.onClose=()=>{owner.unload();previous();};void RichMarkdown.render(this.app,c.comment,row.createDiv('markdown-rendered'),c.path,owner);row.createEl('button',{text:'Edit comment'}).onclick=()=>this.edit(c);}if(!modal.contentEl.childElementCount)modal.contentEl.createEl('p',{text:'No open critiques.'});modal.open();}
}
