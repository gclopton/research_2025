import {editGroup} from './group-editor';
import {App,Editor,FuzzySuggestModal,MarkdownView,Modal,Notice,TFile} from 'obsidian';
import {Question} from './model';
import {ChapterPlacement} from './chapter-model';
import {parseCourse} from './course-model';
import {embeds,embedSource,replaceEmbed,removeMember,moveToGroup,chapterConfig,scopeQuestions} from './note-authoring';
export class Pick<T> extends FuzzySuggestModal<T>{constructor(app:App,private items:T[],private label:(v:T)=>string,private choose:(v:T)=>void,title:string){super(app);this.setPlaceholder(title);}getItems(){return this.items;}getItemText(v:T){return this.label(v);}onChooseItem(v:T){this.choose(v);}}
export class ScopedQuestionPicker extends FuzzySuggestModal<Question>{
 private level:'chapter'|'course'|'all';
 constructor(app:App,private bank:Question[],private placement:{courseId:string;chapterId?:string}|undefined,private choose:(q:Question)=>void,title:string){super(app);this.level=placement?.chapterId?'chapter':placement?'course':'all';this.setPlaceholder(title);this.emptyStateText='No questions in this scope. Change scope to reuse a question elsewhere.';const label=this.modalEl.createEl('label',{text:'Search in ',cls:'study-picker-scope'}),select=label.createEl('select',{attr:{'aria-label':'Question scope'}});this.inputEl.parentElement?.after(label);for(const [id,text]of [['chapter','Current chapter'],['course','Current course'],['all','All courses']]){const o=select.createEl('option',{value:id,text});o.disabled=id==='chapter'?!placement?.chapterId:id==='course'&&!placement;}select.value=this.level;
 const change=()=>{this.level=select.value as typeof this.level;this.inputEl.dispatchEvent(new Event('input'));this.inputEl.focus();};select.onchange=change;(['chapter','course','all'] as const).forEach((scope,i)=>this.scope.register(['Alt'],String(i+1),()=>{if(scope==='all'||(scope==='course'&&placement)||(scope==='chapter'&&placement?.chapterId)){select.value=scope;change();}return false;}));this.setInstructions([{command:'Alt+1/2/3',purpose:'chapter / course / all'},{command:'↑↓ Enter',purpose:'choose question'}]);}
 onOpen(){super.onOpen();this.inputEl.focus();}
 getItems(){return scopeQuestions(this.bank,this.level,this.placement);}getItemText(q:Question){return q.definition.title+' · '+(q.definition.chapters?.map(p=>p.title).join(', ')||'Unassigned chapter');}onChooseItem(q:Question){this.choose(q);}
}
export async function chapterDestination(app:App,source?:TFile):Promise<{folder:string;placement?:ChapterPlacement;scope?:{courseId:string;chapterId?:string}}>{let folder=source?.parent;while(folder){const base=folder.path==='/'?'':folder.path+'/';const file=app.vault.getAbstractFileByPath(base+'Chapter.md');if(file instanceof TFile){const placement=chapterConfig(await app.vault.read(file));if(placement)return {folder:base+'Questions',placement,scope:placement};}const courseFile=app.vault.getAbstractFileByPath(base+'Course.md');if(courseFile instanceof TFile){const raw=await app.vault.read(courseFile);if(/^studyCourse:/m.test(raw)){const course=parseCourse(raw);return {folder:base+'Questions',placement:undefined,scope:{courseId:course.id}};}}folder=folder.parent;}return {folder:'Study Studio/Questions',placement:undefined,scope:undefined};}

export async function manageNote(app:App,bank:Question[],edit:(id:string)=>void,onlyId?:string,sourcePath?:string){
 const view=app.workspace.getActiveViewOfType(MarkdownView),file=sourcePath?app.vault.getAbstractFileByPath(sourcePath):view?.file;if(!(file instanceof TFile))throw Error('Open a note with study questions first.');
 const destination=await chapterDestination(app,file);
 const editor:Editor|undefined=view?.file===file&&view.getMode()==='source'?view.editor:undefined;
 const raw=editor?editor.getValue():await app.vault.read(file),blocks=embeds(raw),titles=new Map(bank.map(q=>[q.definition.id,q.definition.title]));
 const commit=async(next:string)=>{if(editor){if(view?.file!==file||editor.getValue()!==raw)throw Error('Note changed. Reopen question controls.');editor.replaceRange(next,{line:0,ch:0},editor.offsetToPos(raw.length));}else await app.vault.process(file,current=>{if(current!==raw)throw Error('Note changed. Reopen question controls.');return next;});};
 const run=(action:()=>Promise<void>|void)=>void Promise.resolve().then(action).catch(e=>new Notice(String(e)));
 const nameGroup=(value:string,save:(title:string)=>Promise<void>)=>{const modal=new Modal(app);modal.titleEl.setText('Group title');const input=modal.contentEl.createEl('input',{type:'text',attr:{'aria-label':'Group title'}});input.value=value;const submit=()=>run(async()=>{if(!input.value.trim())throw Error('Enter a group title.');await save(input.value.trim());modal.close();});modal.contentEl.createEl('button',{text:'Save group title',cls:'mod-cta'}).onclick=submit;modal.scope.register([],'Enter',()=>{submit();return false;});modal.open();input.select();};
 const choices=blocks.flatMap(b=>[...(b.group&&!onlyId?[{b,id:'',label:`Group: ${b.title}`}]:[]),...b.ids.filter(id=>!onlyId||id===onlyId).map(id=>({b,id,label:`${titles.get(id)??id}${b.group?' · '+b.title:' · Individual question'} · line ${raw.slice(0,b.start).split('\n').length}`}))]);
 if(!choices.length)throw Error('No matching questions in this note.');
 new Pick(app,choices,x=>x.label,({b,id})=>{
  const actions:{label:string;act:()=>void|Promise<void>}[]=[];
  if(id){actions.push({label:'Edit question',act:()=>edit(id)},{label:'Remove this question from this note (keep reusable source and history)',act:()=>commit(removeMember(raw,b,id))});
   actions.push({label:'Move question into a group',act:()=>{const targets=blocks.filter(e=>e.group&&e.start!==b.start);if(!targets.length){new Notice('No other groups. Use Make a group first.');return;}new Pick(app,targets,e=>e.title,target=>run(()=>commit(moveToGroup(raw,b,id,target))),'Choose destination group').open();}});
  }
  if(!b.group)actions.push({label:'Make a group from this question',act:()=>nameGroup(titles.get(b.ids[0])??'Review',title=>commit(replaceEmbed(raw,b,embedSource(b.ids,title,b.prompt))))});
  if(b.group){actions.push({label:'Edit group and parent prompt',act:()=>editGroup(app,file.path,bank,raw.slice(0,b.start).split('\n').length-1,b.title)},{label:'Rename this group',act:()=>nameGroup(b.title,title=>commit(replaceEmbed(raw,b,embedSource(b.ids,title,b.prompt))))},{label:'Add an existing question to this group',act:()=>{new ScopedQuestionPicker(app,bank.filter(q=>!b.ids.includes(q.definition.id)),destination.scope,q=>run(()=>commit(replaceEmbed(raw,b,embedSource([...b.ids,q.definition.id],b.title,b.prompt)))),'Choose question to add').open();}},{label:'Ungroup into individual question cards',act:()=>commit(replaceEmbed(raw,b,[b.prompt,...b.ids.map(id=>embedSource([id]))].filter(Boolean).join('\n\n')))});}
  new Pick(app,actions,a=>a.label,a=>run(a.act),'Question actions · type to filter, Enter to choose').open();
 },'Questions in this note · type to filter, Enter to choose').open();
}
