import {App,Component,MarkdownView,Notice,TFile,Menu} from 'obsidian';
import {StudioPanel} from './workspace-panel';
import {writtenEditor} from './written-editor';
import {Question,Kind} from './model';
import {QuestionGroup} from './practice-state';
import {embeds,embedSource,replaceEmbed,scopeQuestions} from './note-authoring';
import {chapterDestination} from './note-authoring-ui';
import {RichMarkdown} from './rich-markdown';
export interface GroupTools {
 create:(kind:Kind,accept:(question:Question)=>void)=>void;
 preview:(host:HTMLElement,question:Question)=>Component;
}
const kinds:[Kind,string][]=[['choice','Multiple choice'],['blank','Fill in the blank'],['table','Complete the table'],['code','Complete the code'],['diagram','Label the diagram'],['ordering','Put steps in order'],['short-answer','Short answer / essay'],['drawing','Drawing response']];
export class GroupEditor extends StudioPanel {
 constructor(app:App,private path:string,private bank:Question[],private initial:QuestionGroup,private saveGroup:(group:QuestionGroup)=>Promise<void>,private placement?:{courseId:string;chapterId?:string},private tools?:GroupTools){super(app);this.titleEl.setText('Edit question group');}
 onOpen(){
  const title=this.contentEl.createEl('input',{attr:{placeholder:'Group title','aria-label':'Group title'}});title.value=this.initial.title;
  let prompt=this.initial.prompt??'',busy=false,saving=false,page=0;
  writtenEditor(this.app,this.contentEl,this.path,prompt,this,value=>prompt=value,value=>busy=value,'Parent prompt',{toolbar:false,placeholder:'Shared instructions, passage, table, or image'});
  const selected=[...this.initial.questions],members=this.contentEl.createDiv(),actions=this.contentEl.createDiv('study-actions');
  const create=()=>{if(busy||!this.tools)return;const menu=new Menu();kinds.forEach(([kind,label],i)=>menu.addItem(item=>item.setTitle(`${i+1} · ${label}`).onClick(()=>this.tools!.create(kind,q=>{if(!this.contentEl.isConnected)return;const old=this.bank.findIndex(x=>x.definition.id===q.definition.id);if(old<0)this.bank.push(q);else this.bank[old]=q;if(!selected.includes(q.definition.id))selected.push(q.definition.id);renderMembers();renderBank();this.reveal();}))));const rect=actions.getBoundingClientRect();menu.showAtPosition({x:rect.left,y:rect.bottom});};
  actions.createEl('button',{text:'New question · Alt+Enter'}).onclick=create;
  const browse=this.contentEl.createEl('details'),summary=browse.createEl('summary',{text:'Add existing questions'}),browser=browse.createDiv();
  const scope=browser.createEl('select',{attr:{'aria-label':'Question scope'}});
  for(const [value,text]of [['chapter','Current chapter'],['course','Current course'],['all','All courses']]){const o=scope.createEl('option',{value,text});o.disabled=value==='chapter'?!this.placement?.chapterId:value==='course'&&!this.placement;}
  scope.value=this.placement?.chapterId?'chapter':this.placement?'course':'all';
  const search=browser.createEl('input',{type:'search',attr:{placeholder:'Search titles, prompts, or concepts','aria-label':'Search existing questions'}}),choices=browser.createDiv(),nav=browser.createDiv('study-actions');
  let memberOwner=new Component(),bankOwner=new Component();this.addChild(memberOwner);this.addChild(bankOwner);
  const preview=(host:HTMLElement,q:Question,owner:Component)=>{host.createEl('strong',{text:q.definition.title});host.createSpan({text:` · ${q.definition.type}`,cls:'study-muted'});void RichMarkdown.render(this.app,q.prompt.replace(/\{\{blank:[^}]+\}\}/g,'________'),host.createDiv('markdown-rendered'),q.path,owner);const details=host.createEl('details');details.createEl('summary',{text:'Full question preview'});let loaded=false;details.ontoggle=()=>{if(details.open&&!loaded&&this.tools){loaded=true;owner.addChild(this.tools.preview(details.createDiv(),q));}};};
  const renderMembers=()=>{this.removeChild(memberOwner);memberOwner=new Component();this.addChild(memberOwner);members.empty();members.createEl('h3',{text:`Questions (${selected.length})`});if(!selected.length)members.createEl('p',{text:'Create a question here, or add an existing one.'});selected.forEach((id,i)=>{const q=this.bank.find(q=>q.definition.id===id),row=members.createDiv('study-group-member');row.tabIndex=0;row.title='Alt+Up/Down reorders · Ctrl+Space or right-click for actions';row.setAttribute('aria-label',`Question ${i+1}: ${q?.definition.title??id}`);row.createSpan({text:`${i+1}. `});if(q)preview(row,q,memberOwner);else row.createSpan({text:`Unavailable question: ${id}`});const move=(delta:number)=>{const next=i+delta;if(next<0||next>=selected.length)return;[selected[i],selected[next]]=[selected[next],selected[i]];renderMembers();(members.querySelectorAll<HTMLElement>('.study-group-member')[next])?.focus();};const menu=(e:MouseEvent|KeyboardEvent)=>{e.preventDefault();e.stopPropagation();const m=new Menu().addItem(x=>x.setTitle('1 · Move up').setDisabled(i===0).onClick(()=>move(-1))).addItem(x=>x.setTitle('2 · Move down').setDisabled(i===selected.length-1).onClick(()=>move(1))).addItem(x=>x.setTitle('3 · Remove from group').onClick(()=>{selected.splice(i,1);renderMembers();renderBank();}));const r=row.getBoundingClientRect();m.showAtPosition({x:r.left,y:r.top});};row.oncontextmenu=menu;row.onkeydown=e=>{if(e.ctrlKey&&e.code==='Space')menu(e);if(e.altKey&&['ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();move(e.key==='ArrowUp'?-1:1);}};});};
  const renderBank=()=>{this.removeChild(bankOwner);bankOwner=new Component();this.addChild(bankOwner);choices.empty();nav.empty();const query=search.value.toLocaleLowerCase(),all=scopeQuestions(this.bank,scope.value as 'chapter'|'course'|'all',this.placement).filter(q=>`${q.definition.title} ${q.prompt} ${(q.definition.concepts??[]).join(' ')}`.toLocaleLowerCase().includes(query));page=Math.max(0,Math.min(page,Math.ceil(all.length/5)-1));for(const q of all.slice(page*5,page*5+5)){const row=choices.createDiv('study-group-member'),label=row.createEl('label'),box=label.createEl('input',{type:'checkbox',attr:{'aria-label':`Include ${q.definition.title}`}});box.checked=selected.includes(q.definition.id);label.appendText(' Include in group');preview(row,q,bankOwner);box.onchange=()=>{if(box.checked)selected.push(q.definition.id);else selected.splice(selected.indexOf(q.definition.id),1);renderMembers();};}if(!all.length)choices.createEl('p',{text:'No matching questions.'});const prev=nav.createEl('button',{text:'Previous'});prev.disabled=page===0;prev.onclick=()=>{page--;renderBank();nav.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();};nav.createSpan({text:`Page ${page+1} of ${Math.max(1,Math.ceil(all.length/5))} · ${all.length} questions`});const next=nav.createEl('button',{text:'Next'});next.disabled=(page+1)*5>=all.length;next.onclick=()=>{page++;renderBank();nav.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();};};
  browser.addEventListener('keydown',e=>{if(e.altKey&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();page+=e.key==='ArrowRight'?1:-1;renderBank();}else if((e.target as HTMLElement).matches('input[type=checkbox]')&&['ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const boxes=[...choices.querySelectorAll<HTMLInputElement>('input[type=checkbox]')],index=boxes.indexOf(e.target as HTMLInputElement);boxes[index+(e.key==='ArrowDown'?1:-1)]?.focus();}});
  scope.onchange=search.oninput=()=>{page=0;renderBank();};browse.ontoggle=()=>{if(browse.open)renderBank();};
  const save=async()=>{if(busy||saving)return;if(!title.value.trim()){new Notice('Enter a group title.');title.focus();return;}saving=true;try{await this.saveGroup({title:title.value.trim(),prompt,questions:selected});this.close();}catch(e){new Notice(String(e));}finally{saving=false;}};
  this.contentEl.createEl('button',{text:'Save group · Ctrl+Enter',cls:'mod-cta'}).onclick=()=>void save();
  const keys=(e:KeyboardEvent)=>{if(busy||(e.target as HTMLElement).closest('.study-card'))return;if(e.altKey&&!e.ctrlKey&&!e.metaKey&&e.key==='Enter'){e.preventDefault();e.stopPropagation();create();}else if(e.ctrlKey&&e.key==='Enter'&&!e.shiftKey&&!e.altKey&&!e.metaKey){e.preventDefault();e.stopPropagation();void save();}};
  this.modalEl.addEventListener('keydown',keys,true);this.register(()=>this.modalEl.removeEventListener('keydown',keys,true));renderMembers();title.focus();
 }
}
export async function editGroup(app:App,path:string,bank:Question[],line:number|undefined,title:string,tools?:GroupTools){
 const file=app.vault.getAbstractFileByPath(path);if(!(file instanceof TFile))throw Error('Group note is unavailable.');
 const raw=await app.vault.read(file),matches=embeds(raw).filter(b=>b.group&&b.title===title),block=matches.find(b=>line!==undefined&&raw.slice(0,b.start).split('\n').length-1===line)??(matches.length===1?matches[0]:undefined);
 if(!block)throw Error('Group changed. Reopen its controls.');
 const destination=await chapterDestination(app,file);
 new GroupEditor(app,path,bank,{title:block.title,prompt:block.prompt,questions:block.ids},async group=>{
  await app.vault.process(file,current=>{const found=embeds(current).filter(b=>b.raw===block.raw);if(found.length!==1)throw Error('Group changed or has duplicate copies. Reopen its controls.');return replaceEmbed(current,found[0],embedSource(group.questions,group.title,group.prompt));});
  const leaf=app.workspace.getLeavesOfType('markdown').find(leaf=>leaf.view instanceof MarkdownView&&leaf.view.file?.path===path);if(leaf)await app.workspace.revealLeaf(leaf);
 },destination.scope,tools).open();
}
