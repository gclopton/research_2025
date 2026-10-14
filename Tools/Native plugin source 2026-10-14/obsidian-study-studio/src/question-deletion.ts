import {App,Modal,TFile,MarkdownView,Notice} from 'obsidian';
import {Question} from './model';
import {parseExam} from './exam-model';
import {removeQuestionEmbeds,examUsesQuestions} from './deletion-model';

interface Change {file:TFile;before:string;after:string;count:number}
interface Plan {notePath?:string;questions:{q:Question;file:TFile;raw:string}[];changes:Change[];blocked:string[]}
export interface DeletionHost {app:App;bank():Promise<Question[]>;ensureFolder(path:string):Promise<void>;deletionBusy(ids:string[]):boolean}

async function readCurrent(app:App,file:TFile){
 const views=app.workspace.getLeavesOfType('markdown').map(l=>l.view).filter((v):v is MarkdownView=>v instanceof MarkdownView&&v.file?.path===file.path&&v.getMode()==='source');
 const sources=views.map(v=>v.editor.getValue());
 if(new Set(sources).size>1)throw Error(`Open copies of ${file.path} disagree. Save or close those copies first.`);
 return sources[0]??await app.vault.read(file);
}
async function plan(host:DeletionHost,questions:Question[],bank:Question[],notePath?:string):Promise<Plan>{
 const app=host.app,ids=new Set(questions.map(q=>q.definition.id)),out:Plan={notePath,questions:[],changes:[],blocked:[]};
 for(const q of questions){const file=app.vault.getAbstractFileByPath(q.path);if(!(file instanceof TFile))throw Error(`Question disappeared: ${q.definition.title}`);const raw=await readCurrent(app,file);if(raw!==q.raw)throw Error(`Question changed: ${q.definition.title}. Reopen deletion to review its current version.`);out.questions.push({q,file,raw});}
 const questionPaths=new Set(bank.map(q=>q.path));
 for(const file of app.vault.getMarkdownFiles()){
  if(notePath?file.path!==notePath:questionPaths.has(file.path))continue;
  const raw=await readCurrent(app,file);
  const frontmatter=/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(raw)?.[1];
  if(!notePath&&frontmatter&&/^studyExam:/m.test(frontmatter)){
   try{if(examUsesQuestions(parseExam(raw),questions,bank))out.blocked.push(file.path);}
   catch{out.blocked.push(`${file.path} (exam could not be checked)`);}
   continue;
  }
  if(!raw.includes('study'))continue;
  const result=removeQuestionEmbeds(raw,ids);
  if(result.count)out.changes.push({file,before:raw,after:result.raw,count:result.count});
 }
 return out;
}
const activeDeletions=new WeakSet<App>();
async function apply(host:DeletionHost,p:Plan){
 if(activeDeletions.has(host.app))throw Error('Another deletion is still finishing. Try again shortly.');
 activeDeletions.add(host.app);
 try{await applyLocked(host,p);}finally{activeDeletions.delete(host.app);}
}
async function applyLocked(host:DeletionHost,p:Plan){
 const {app}=host,ids=p.questions.map(x=>x.q.definition.id);
 if(host.deletionBusy(ids))throw Error('Finish the active answer or math editor before deleting these questions.');
 const current=await plan(host,p.questions.map(x=>x.q),await host.bank(),p.notePath);
 if(current.blocked.length)throw Error('An exam template now uses these questions. Reopen the deletion review.');
 if(JSON.stringify(current.changes.map(c=>[c.file.path,c.before,c.after]))!==JSON.stringify(p.changes.map(c=>[c.file.path,c.before,c.after])))throw Error('Question placements changed. Reopen deletion to review the current impact.');
 const folder='Study Studio/Deletion backups';await host.ensureFolder(folder);
 const backup=await app.vault.create(`${folder}/${Date.now()}-${crypto.randomUUID()}.json`,JSON.stringify({version:1,status:'prepared',questions:p.notePath?[]:p.questions.map(x=>({path:x.file.path,raw:x.raw})),notes:p.changes.map(c=>({path:c.file.path,before:c.before,after:c.after}))},null,2));
 const edited:Change[]=[],trashed:Plan['questions']=[];
 try{
  for(const c of p.changes){
   if(await readCurrent(app,c.file)!==c.before)throw Error(`Note changed: ${c.file.path}`);
   // Flush the current editor through its public save method before guarded disk mutation.
   for(const leaf of app.workspace.getLeavesOfType('markdown')){const v=leaf.view;if(v instanceof MarkdownView&&v.file?.path===c.file.path)await v.save();}
   await app.vault.process(c.file,raw=>{if(raw!==c.before)throw Error(`Note changed: ${c.file.path}`);return c.after;});edited.push(c);
  }
  for(const q of p.notePath?[]:p.questions){if(await readCurrent(app,q.file)!==q.raw)throw Error(`Question changed: ${q.file.path}`);await app.vault.trash(q.file,false);trashed.push(q);}
  await app.vault.process(backup,raw=>JSON.stringify({...JSON.parse(raw),status:'complete'},null,2));
 }catch(error){
  let restored=true;
  for(const q of trashed)try{if(app.vault.getAbstractFileByPath(q.q.path))restored=false;else await app.vault.create(q.q.path,q.raw);}catch{restored=false;}
  for(const c of edited.reverse())try{await app.vault.process(c.file,raw=>{if(raw!==c.after)throw Error('Changed during rollback');return c.before;});}catch{restored=false;}
  throw Error(`${String(error)}. ${restored?'Changes rolled back.':'Some changes could not be rolled back.'} Recovery copy: ${backup.path}`);
 }
 const removed=p.changes.reduce((n,c)=>n+c.count,0);
 new Notice(p.notePath?`Removed ${removed} question card${removed===1?'':'s'} from this note. Question files and other notes are unchanged.`:`Moved ${p.questions.length} question${p.questions.length===1?'':'s'} to vault trash. Recorded history is preserved.`,8000);
}

/** Confirmation only: bulk selection happens beside the questions in their note. */
export class DeleteQuestions extends Modal {
 private running=false;
 constructor(private host:DeletionHost,private questions:Question[],private done:()=>void,private notePath?:string){super(host.app);}
 onOpen(){
  this.modalEl.addClass('study-delete-modal');this.titleEl.setText(this.notePath?'Remove questions from this note':'Delete question everywhere');
  this.scope.register(['Ctrl'],'Enter',()=>false);
  this.contentEl.createEl('p',{text:'Checking question placements…'});void this.review();
 }
 close(){if(!this.running)super.close();}
 private async review(){
  if(this.running||!this.questions.length)return;this.running=true;let p:Plan;
  try{p=await plan(this.host,this.questions,await this.host.bank(),this.notePath);}catch(e){this.contentEl.empty();this.contentEl.createEl('p',{text:String(e),cls:'study-error'});this.running=false;this.contentEl.createEl('button',{text:'Close'}).onclick=()=>this.close();return;}this.running=false;
  const placements=p.changes.reduce((n,c)=>n+c.count,0);
  const root=this.contentEl;root.empty();root.createEl('h3',{text:`${this.notePath?'Remove':'Delete'} ${p.questions.length} question${p.questions.length===1?'':'s'}${this.notePath?' from this note':' everywhere'}?`});
  const titles=root.createEl('details');titles.createEl('summary',{text:`${p.questions.length} selected question${p.questions.length===1?'':'s'}`});for(const q of p.questions)titles.createEl('p',{text:q.q.definition.title});
  root.createEl('p',{text:this.notePath?`Remove ${placements} card${placements===1?'':'s'} from this note only. Reusable question files, other notes, exams, and history are unchanged.`:`Move the reusable question files to vault trash and remove ${placements} practice placement${placements===1?'':'s'} from ${p.changes.length} note${p.changes.length===1?'':'s'}. Recorded attempts, started exams, and shared images stay intact.`});
  const details=root.createEl('details');details.createEl('summary',{text:'Affected notes'});p.changes.forEach(c=>details.createEl('p',{text:c.file.path}));
  if(p.blocked.length){root.createEl('p',{text:'These exam templates still use the selected questions. Remove or replace those exam slots before deleting:',cls:'study-error'});p.blocked.forEach(path=>root.createEl('p',{text:path}));}
  const error=root.createDiv('study-error'),bar=root.createDiv('study-actions');
  const cancel=bar.createEl('button',{text:'Cancel'});cancel.onclick=()=>this.close();
  const remove=bar.createEl('button',{text:this.notePath?`Remove ${p.questions.length} from this note`:`Move ${p.questions.length} to trash`,cls:'mod-warning'});remove.disabled=!!p.blocked.length;
  remove.onclick=async()=>{if(this.running)return;this.running=true;remove.disabled=true;cancel.disabled=true;try{await apply(this.host,p);}catch(e){error.setText(String(e));remove.disabled=false;cancel.disabled=false;this.running=false;return;}this.running=false;this.close();this.done();};
  cancel.focus();
 }
}
