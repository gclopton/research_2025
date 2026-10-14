import {Component,MarkdownView,Notice} from 'obsidian';
import {DeletionHost} from './question-deletion';

/** Temporary controls on the rendered questions; selections survive Live Preview virtualization. */
export class NoteGrouping extends Component {
 private selected=new Set<string>();
 private bar!:HTMLElement;
 private observer!:MutationObserver;
 private expanded:HTMLDetailsElement[]=[];
 private reviewing=false;
 constructor(private host:DeletionHost,private view:MarkdownView,private path:string,private ended:()=>void,private complete:(lines:number[])=>Promise<void>){super();}
 onload(){
  const root=this.view.contentEl;root.addClass('study-removal-mode');
  this.bar=createDiv('study-removal-bar');root.prepend(this.bar);
  const count=this.bar.createSpan({text:'0 selected · this note only'});
  this.bar.createSpan({text:'↑↓ move · Space selects',cls:'study-muted'});
  const review=this.bar.createEl('button',{text:'Group selected · Ctrl+Enter'});review.disabled=true;
  this.bar.createEl('button',{text:'Cancel · Esc'}).onclick=()=>this.unload();
  const update=()=>{count.setText(`${this.selected.size} selected · this note only`);review.disabled=!this.selected.size;
   root.querySelectorAll<HTMLInputElement>('input.study-removal-checkbox').forEach(box=>box.checked=this.selected.has(box.dataset.questionId!));};
  const render=()=>{
   if(this.view.file?.path!==this.path){this.unload();return;}
   for(const target of root.querySelectorAll<HTMLElement>('summary[data-study-source-line]')){
    if(target.querySelector(':scope > .study-removal-pick'))continue;
    const id=target.dataset.studySourceLine!,title=target.dataset.studyQuestionTitle??id;
    const label=createEl('label',{cls:'study-removal-pick'}),box=label.createEl('input',{type:'checkbox',cls:'study-removal-checkbox',attr:{'aria-label':`Select ${title} for grouping`}});
    box.dataset.questionId=id;box.checked=this.selected.has(id);label.createSpan({text:'Select for grouping'});target.prepend(label);
    label.addEventListener('click',event=>event.stopPropagation());label.addEventListener('pointerdown',event=>event.stopPropagation());
    box.addEventListener('keydown',event=>{if(event.code==='Space')event.stopPropagation();});
    box.onchange=()=>{box.checked?this.selected.add(id):this.selected.delete(id);update();};
   }
  };
  review.onclick=async()=>{
   if(!this.selected.size||this.reviewing)return;this.reviewing=true;
   try{if(this.view.file?.path!==this.path){this.unload();return;}
    await this.complete([...this.selected].map(Number));this.unload();
   }catch(e){new Notice(String(e));}finally{this.reviewing=false;}
  };
  this.registerDomEvent(root,'keydown',event=>{
   if((event.target as HTMLElement).matches('input.study-removal-checkbox')&&['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();event.stopImmediatePropagation();const boxes=[...root.querySelectorAll<HTMLInputElement>('input.study-removal-checkbox')],index=boxes.indexOf(event.target as HTMLInputElement),next=boxes[index+(event.key==='ArrowDown'?1:-1)];next?.focus();next?.scrollIntoView({block:'nearest'});}
   else if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();this.unload();}
   else if(event.ctrlKey&&!event.shiftKey&&!event.altKey&&!event.metaKey&&event.key==='Enter'){event.preventDefault();event.stopImmediatePropagation();review.click();}
  },true);
  this.observer=new MutationObserver(render);this.observer.observe(root,{childList:true,subtree:true});
  this.registerEvent(this.host.app.workspace.on('file-open',()=>{if(this.view.file?.path!==this.path)this.unload();}));
  for(const group of root.querySelectorAll<HTMLDetailsElement>('details.study-embed'))if(!group.open){this.expanded.push(group);group.open=true;}
  render();root.querySelector<HTMLInputElement>('input.study-removal-checkbox')?.focus();
 }
 onunload(){this.observer?.disconnect();this.bar?.remove();this.view.contentEl.removeClass('study-removal-mode');this.view.contentEl.querySelectorAll('.study-removal-pick').forEach(el=>el.remove());for(const group of this.expanded)if(group.isConnected)group.open=false;this.ended();}
}
