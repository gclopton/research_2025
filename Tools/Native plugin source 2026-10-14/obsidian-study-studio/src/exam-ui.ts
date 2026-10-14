import {finalGrade} from './final-grade';
import {ReviewStore} from './review';
import {Menu} from 'obsidian';
import {RichMarkdown} from './rich-markdown';
import {drawingPreview} from "./drawing-ui";
import {rubricReview,writtenReference} from "./written-ui";
import {renderDiagram} from "./diagram-render";
import {codeFence,fillCode} from "./code-model";
import {StudioPanel} from "./workspace-panel";
import {App,Component,Modal,Notice,MarkdownRenderer} from 'obsidian';
import {Question,Response} from './model';
import {ExamDefinition,ExamSession,ExamEntry,Ordered,validateExam,submitSession,submitEntry,examScores,assessWrittenEntry} from './exam-model';
export interface ExamResponseOptions {response:Response;order:string[];mathIds:string[];changed:(response:Response,mathIds:string[])=>void;busy:(active:boolean)=>void}
export type ExamCardFactory=(el:HTMLElement,q:Question,options:ExamResponseOptions)=>Component & {ready?:Promise<void>};
const uid=(prefix:string)=>`${prefix}-${crypto.randomUUID().slice(0,8)}`;
export function newExam():ExamDefinition{return {version:1,id:uid('exam'),title:'New exam',mode:'sections',allowBack:true,shuffleSections:false,sections:[{id:uid('section'),title:'Section 1',shuffleGroups:false,groups:[{id:uid('group'),title:'Group 1',shuffleQuestions:false,questions:[]}]}]};}
export class ExamEditor extends StudioPanel {
 private exam:ExamDefinition;
 constructor(app:App,exam:ExamDefinition,private bank:Question[],private save:(exam:ExamDefinition)=>Promise<void>){super(app);this.exam=structuredClone(exam);this.modalEl.addClass('study-exam-editor');}
 onOpen(){this.titleEl.setText('Build exam');this.render();this.scope.register(['Ctrl'],'Enter',()=>{this.contentEl.querySelector<HTMLButtonElement>('button.mod-cta:not(:disabled)')?.click();return false;});}
 private text(parent:HTMLElement,label:string,value:string,change:(v:string)=>void){const l=parent.createEl('label',{cls:'study-exam-field',text:label});const input=l.createEl('input',{type:'text'});input.value=value;input.oninput=()=>change(input.value);}
 private toggle(parent:HTMLElement,label:string,value:boolean,change:(v:boolean)=>void){const l=parent.createEl('label',{cls:'study-group-pick'});const input=l.createEl('input',{type:'checkbox'});input.checked=value;input.onchange=()=>change(input.checked);l.appendText(label);}
 private select(parent:HTMLElement,label:string,value:string,options:[string,string][],change:(v:string)=>void){const l=parent.createEl('label',{cls:'study-exam-field',text:label});const input=l.createEl('select');for(const [id,text]of options)input.createEl('option',{value:id,text});input.value=value;input.onchange=()=>change(input.value);}
 private button(parent:HTMLElement,title:string,action:()=>void){parent.createEl('button',{text:title,attr:{type:'button'}}).onclick=action;}
 private ordering<T extends Ordered>(parent:HTMLElement,item:T,items:T[],label:(x:T)=>string){
  const i=items.indexOf(item),bar=parent.createDiv('study-actions');
  this.button(bar,'Move up',()=>{if(i>0){[items[i-1],items[i]]=[items[i],items[i-1]];this.render();}});
  this.button(bar,'Move down',()=>{if(i<items.length-1){[items[i+1],items[i]]=[items[i],items[i+1]];this.render();}});
  this.button(bar,'Remove',()=>{items.splice(i,1);for(const x of items)x.after=x.after?.filter(id=>id!==item.id);this.render();});
  if(items.length>1){const d=parent.createEl('details');d.createEl('summary',{text:'Ordering constraints'});d.createEl('p',{text:'This item must appear after the checked items. Conflicting fixed order or cycles will be rejected.'});for(const other of items.filter(x=>x!==item))this.toggle(d,label(other),(item.after??[]).includes(other.id),checked=>{item.after=checked?[...new Set([...(item.after??[]),other.id])]:(item.after??[]).filter(id=>id!==other.id);});}
 }
 private render(){const root=this.contentEl;root.empty();const e=this.exam;
  root.createEl('p',{text:'Switch tabs freely; save this draft before closing its tab or restarting. Create sections and groups, then choose questions. Choose when submitted answers receive feedback. The default keeps answers hidden until the whole exam is submitted. Each blank is one point; a multiple-choice question is one point.'});
  this.text(root,'Exam title',e.title,v=>e.title=v);
  this.select(root,'Display',e.mode,[['all','Whole exam'],['sections','One section at a time']],v=>e.mode=v as 'all'|'sections');
  this.select(root,'Grading',e.grading??'on-submit',[['on-submit','After submitting the whole exam (default)'],['immediate','After each question is submitted']],v=>{e.grading=v as 'on-submit'|'immediate';this.render();});
  if(e.grading==='immediate')root.createEl('p',{text:'Each submitted question locks and reveals feedback. Earlier solutions may help answer later questions.'});
  this.toggle(root,'Allow returning to previous sections',e.allowBack,v=>e.allowBack=v);
  this.toggle(root,'Shuffle sections (respect constraints)',e.shuffleSections,v=>e.shuffleSections=v);
  for(const s of e.sections){const section=root.createDiv('study-exam-section');this.text(section,'Section title',s.title,v=>s.title=v);this.toggle(section,'Shuffle groups',s.shuffleGroups,v=>s.shuffleGroups=v);this.ordering(section,s,e.sections,x=>x.title);
   for(const g of s.groups){const group=section.createDiv('study-exam-group');this.text(group,'Group title',g.title,v=>g.title=v);this.toggle(group,'Shuffle question slots',g.shuffleQuestions,v=>g.shuffleQuestions=v);this.ordering(group,g,s.groups,x=>x.title);
    for(const slot of g.questions){const row=group.createDiv('study-exam-slot');this.select(row,'Question',slot.questionId,this.bank.map(q=>[q.definition.id,q.definition.title]),v=>slot.questionId=v);this.select(row,'Versions to include',String(slot.variants),[['1','One random family version'],['2','Up to two family versions'],['3','Up to three family versions'],['all','All family versions'],['exact','This exact question']],v=>slot.variants=(v==='exact'||v==='all'?v:Number(v)) as typeof slot.variants);this.ordering(row,slot,g.questions,x=>this.bank.find(q=>q.definition.id===x.questionId)?.definition.title??x.questionId);}
    this.button(group,'Add question',()=>{if(!this.bank.length){new Notice('Create a question first.');return;}g.questions.push({id:uid('slot'),questionId:this.bank[0].definition.id,variants:1});this.render();});
   }
   this.button(section,'Add group',()=>{s.groups.push({id:uid('group'),title:`Group ${s.groups.length+1}`,shuffleQuestions:false,questions:[]});this.render();});
  }
  this.button(root,'Add section',()=>{e.sections.push({id:uid('section'),title:`Section ${e.sections.length+1}`,shuffleGroups:false,groups:[{id:uid('group'),title:'Group 1',shuffleQuestions:false,questions:[]}]});this.render();});
  const button=root.createEl('button',{text:'Save exam',cls:'mod-cta'});button.onclick=()=>{try{validateExam(e);button.disabled=true;void this.save(structuredClone(e)).then(()=>this.close(),err=>{button.disabled=false;new Notice(String(err));});}catch(err){new Notice(String(err));}};
 }
}
export class ExamRunner extends StudioPanel {
 private owner?:Component;private generation=0;private mathOpen=0;private status?:HTMLElement;private controls:HTMLButtonElement[]=[];private rendering=false;private pending:Promise<void>=Promise.resolve();private failure?:unknown;
 constructor(app:App,private session:ExamSession,private write:(s:ExamSession)=>Promise<void>,private cards:ExamCardFactory,private released:()=>void,private reviews?:ReviewStore){super(app);this.modalEl.addClass('study-exam-runner');}
 onOpen(){this.titleEl.setText(this.session.exam.title);void this.render();}
 private save(){const snapshot=structuredClone(this.session);this.status?.setText('Saving exam…');const operation=this.pending.catch(()=>{}).then(()=>this.write(snapshot));this.pending=operation;void operation.then(()=>{if(this.pending===operation){this.failure=undefined;this.status?.setText('Exam saved locally');}},e=>{this.failure=e;this.status?.setText('Save failed. Keep this exam open and retry.');});return operation;}
 private lock(){this.contentEl.inert=this.rendering;for(const button of this.controls)button.disabled=this.rendering||this.mathOpen>0;}
 private button(parent:HTMLElement,label:string,action:()=>void){const b=parent.createEl('button',{text:label});b.onclick=action;this.controls.push(b);return b;}
 private async render(){
  const generation=++this.generation;this.owner?.unload();this.owner=new Component();this.owner.load();this.mathOpen=0;this.controls=[];this.rendering=true;this.lock();this.contentEl.empty();const root=this.contentEl,s=this.session;
  root.createEl('p',{text:`Course: ${s.course?.title??'Unassigned'}`,cls:'study-muted'});
  this.status=root.createEl('p',{cls:'study-muted',text:s.state==='submitted'?'Submitted exam — saved results':'Responses save locally. Finish any open math or drawing editor before navigating or closing.'});
  if(s.state==='submitted'){await this.results(root);this.rendering=false;this.lock();return;}
  this.button(root,'Retry save',()=>{void this.save().catch(()=>{});});
  const visible=s.exam.mode==='all'?s.sectionOrder:[s.sectionOrder[s.currentSection]];
  try{for(const sectionId of visible){const entries=s.entries.filter(e=>e.sectionId===sectionId);root.createEl('h2',{text:entries[0].sectionTitle});let group='';for(const entry of entries){if(entry.groupId!==group){root.createEl('h3',{text:entry.groupTitle});group=entry.groupId;}const host=root.createDiv();if(entry.submittedAt){await this.entryResult(host,entry);continue;}const card=this.cards(host,entry.question,{response:entry.response,order:entry.order,mathIds:entry.mathIds,changed:(r,mathIds)=>{if(entry.submittedAt)return;entry.response=structuredClone(r);entry.mathIds=mathIds;void this.save().catch(()=>{});},busy:active=>{this.mathOpen+=active?1:-1;this.lock();}});this.owner.addChild(card);await card.ready;if(generation!==this.generation)return;if(s.exam.grading==='immediate')this.button(host,'Submit this question',()=>void this.submitQuestion(entry.id));}}
   const nav=root.createDiv('study-actions');
   if(s.exam.mode==='sections'){root.createEl('p',{text:`Section ${s.currentSection+1} of ${s.sectionOrder.length}. ${s.exam.allowBack?'You can return to earlier sections.':'Leaving a section locks navigation back to it.'}`});
    if(s.exam.allowBack&&s.currentSection>0)this.button(nav,'Previous section',()=>void this.navigate(-1));
    if(s.currentSection<s.sectionOrder.length-1)this.button(nav,'Next section',()=>void this.navigate(1));
   }
   if(s.exam.mode==='all'||s.currentSection===s.sectionOrder.length-1){root.createEl('p',{text:'Submitting locks all remaining responses. Unanswered items receive zero; essays and drawings await rubric assessment. Solutions appear for submitted questions only.'});this.button(nav,'Submit exam',()=>void this.submit());}
  }catch(e){root.createEl('p',{text:`Could not render exam: ${String(e)}`,cls:'study-error'});}
  this.rendering=false;this.lock();
 }
 private async navigate(delta:number){if(this.mathOpen||this.rendering)return;this.rendering=true;this.lock();const old=this.session.currentSection;this.session.currentSection+=delta;try{await this.save();await this.render();}catch{this.session.currentSection=old;this.rendering=false;this.lock();}}
 private async submitQuestion(id:string){if(this.mathOpen||this.rendering)return;this.rendering=true;this.lock();try{await this.save();const next=submitEntry(this.session,id);await this.write(next);this.session=next;await this.render();}catch(e){this.status?.setText(`Could not submit question: ${String(e)}`);this.rendering=false;this.lock();}}
 private async submit(){if(this.mathOpen||this.rendering)return;this.rendering=true;this.lock();try{await this.save();const finished=submitSession(this.session);await this.write(finished);this.session=finished;await this.render();}catch(e){this.status?.setText(`Could not submit: ${String(e)}. Your responses remain here.`);this.rendering=false;this.lock();}}
 private async results(root:HTMLElement){const totals=examScores(this.session);if(!totals.overall.pending)finalGrade(root,totals.overall.earned,totals.overall.possible);root.createEl('h2',{text:`Overall: ${totals.overall.earned} / ${totals.overall.possible}${totals.overall.pending?` graded · ${totals.overall.pending} awaiting self-assessment`:""}`});for(const section of totals.sections){root.createEl('h3',{text:`${section.title}: ${section.earned} / ${section.possible}${section.pending?` graded · ${section.pending} awaiting self-assessment`:""}`});for(const entry of this.session.entries.filter(e=>e.sectionId===section.id)){const d=root.createEl('details');d.createEl('summary',{text:`${entry.question.definition.title}: ${entry.result?.pending?'Awaiting assessment':`${entry.result?.earned??0} / ${entry.result?.possible??0}`}`});await this.entryResult(d,entry);}}}
 private async entryResult(d:HTMLElement,entry:ExamEntry){
 d.tabIndex=0;const actions=(event:MouseEvent|KeyboardEvent)=>{event.preventDefault();event.stopPropagation();const menu=new Menu();this.reviews?.questionMenu(menu,entry.question,d,`exam:${this.session.id}`);const r=d.getBoundingClientRect();menu.showAtPosition({x:'clientX' in event?event.clientX:r.left,y:'clientY' in event?event.clientY:r.top});};d.oncontextmenu=actions;d.onkeydown=e=>{if(e.ctrlKey&&e.code==='Space')actions(e);};
 d.createEl('h3',{text:entry.question.definition.title});d.createEl('p',{text:entry.result?.pending?'Submitted · awaiting rubric assessment':`Submitted · ${entry.result?.earned??0} / ${entry.result?.possible??0}${entry.result?.basis==='self-assessed'?' · self-assessed':''}`});
await RichMarkdown.render(this.app,entry.question.prompt,d.createDiv('markdown-rendered'),entry.question.path,this.owner!);d.createEl('p',{text:'Your submitted response:'});if((["short-answer","drawing"].includes(entry.question.definition.type))){
 if(entry.question.definition.type==='drawing')drawingPreview(d,entry.response.blanks.response??'');else await RichMarkdown.render(this.app,entry.response.blanks.response||'*(unanswered)*',d.createDiv('markdown-rendered'),entry.question.path,this.owner!);
 if(entry.response.blanks.response?.trim())await rubricReview(this.app,d,entry.question,this.owner!,entry.response.selfAssessment,async scores=>{if(this.rendering)throw Error('Another assessment is saving. Try again.');this.rendering=true;this.lock();try{await this.pending;const updated=assessWrittenEntry(this.session,entry.id,scores);await this.write(updated);this.session=updated;await this.render();}finally{this.rendering=false;this.lock();}});
 else await writtenReference(this.app,d,entry.question,this.owner!);return;
 }d.createEl('pre',{text:['choice','ordering'].includes(entry.question.definition.type)?entry.response.choices.map(id=>entry.question.definition.choices?.find(c=>c.id===id)?.text??id).join('\n'):Object.entries(entry.response.blanks).map(([id,value])=>`${id}: ${value||'(blank)'}`).join('\n')||'(unanswered)'});const q=entry.question;if(q.definition.type==='diagram'){renderDiagram(this.app,d,q.definition.diagram!,q.path,(host,id)=>{const a=q.definition.answers!.find(a=>a.id===id)!;const value=a.accepted[0];host.addClass('study-diagram-solution');void RichMarkdown.render(this.app,q.definition.diagram!.labels.find(l=>l.id===id)?.math&&!value.startsWith('$')?`$${value}$`:value,host,q.path,this.owner!);});}const correct=q.definition.type==='code'?[codeFence(fillCode(q.definition.code!.source,Object.fromEntries(q.definition.answers!.map(a=>[a.id,a.accepted[0]]))),q.definition.code!.language)]:q.definition.type==='ordering'?q.definition.correct!.map((id,i)=>`${i+1}. ${q.definition.choices!.find(c=>c.id===id)!.text}`):q.definition.type==='choice'?q.definition.choices!.filter(c=>q.definition.correct!.includes(c.id)).map(c=>c.text):q.definition.answers!.map(a=>{const v=a.accepted.find(x=>/[\\$]/.test(x))??a.accepted[0];return /[\\^_]/.test(v)&&!v.startsWith('$')?`$${v}$`:v;});await RichMarkdown.render(this.app,'**Correct answers**\n\n'+correct.join('\n\n')+'\n\n'+q.explanation,d.createDiv('markdown-rendered'),q.path,this.owner!);
 }
 onClose(){this.generation++;this.owner?.unload();void this.pending.then(()=>this.released(),()=>{new Notice('The last exam save failed. Resume uses the last saved responses.');this.released();});}
}
