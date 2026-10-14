import {RichMarkdown} from './rich-markdown';
import {drawingInput,drawingPreview} from "./drawing-ui";
import {App,Component,MarkdownRenderer} from 'obsidian';
import {Question,Response,Attempt,grade} from './model';
import {writtenEditor} from './written-editor';

export async function writtenReference(app:App,host:HTMLElement,q:Question,owner:Component){
 host.createEl('h4',{text:'Reference answer'});
 if(q.definition.type==='drawing'&&q.definition.drawing)drawingPreview(host,JSON.stringify(q.definition.drawing));
 await RichMarkdown.render(app,q.definition.written!.reference,host.createDiv('markdown-rendered'),q.path,owner);
 if(q.explanation)await RichMarkdown.render(app,q.explanation,host.createDiv('markdown-rendered'),q.path,owner);
}
export async function rubricReview(app:App,host:HTMLElement,q:Question,owner:Component,initial:Record<string,number>|undefined,save:(scores:Record<string,number>)=>Promise<void>){
 await writtenReference(app,host,q,owner);
 host.createEl('p',{text:'Self-assessment: compare your original response with each criterion. Equivalent reasoning is welcome. This is your judgment, not automatic or AI grading.'});
 const inputs:HTMLSelectElement[]=[];
 for(const criterion of q.definition.written!.rubric){const row=host.createDiv('study-rubric-row');await RichMarkdown.render(app,criterion.text,row.createDiv('markdown-rendered'),q.path,owner);const input=row.createEl('select',{attr:{'aria-label':`Score criterion ${inputs.length+1}`}});for(const [value,text]of [['','Choose score'],['0','Not met — 0'],['0.5','Partly met — 0.5'],['1','Met — 1']])input.createEl('option',{value,text});input.value=initial?.[criterion.id]?.toString()??'';inputs.push(input);}
 const status=host.createEl('p',{cls:'study-written-status',attr:{'aria-live':'polite'}}),button=host.createEl('button',{text:initial?'Update self-assessment':'Save self-assessment',cls:'mod-cta'});
 button.onclick=async()=>{if(inputs.some(i=>i.value==='')){status.setText('Choose a score for every criterion.');inputs.find(i=>i.value==='')?.focus();return;}button.disabled=true;inputs.forEach(i=>i.disabled=true);try{await save(Object.fromEntries(q.definition.written!.rubric.map((r,i)=>[r.id,Number(inputs[i].value)])));}catch(e){status.hidden=false;status.setText(`Could not save: ${String(e)}. Your scores remain here.`);button.disabled=false;inputs.forEach(i=>i.disabled=false);}};
}
export function writtenInput(app:App,host:HTMLElement,q:Question,response:Response,owner:Component,changed:()=>void,busy:(active:boolean)=>void){
 if(q.definition.type==='drawing')return drawingInput(app,host,response.blanks.response??'',owner,value=>{response.blanks.response=value;delete response.selfAssessment;changed();},busy);
 return writtenEditor(app,host,q.path,response.blanks.response??'',owner,value=>{response.blanks.response=value;delete response.selfAssessment;changed();},busy);
}
export async function writtenPractice(app:App,host:HTMLElement,q:Question,response:Response,owner:Component,prior:Attempt|undefined,preview:boolean,persist:()=>void,save:(mode:Attempt['mode'])=>Promise<Attempt>,retry:()=>void,next?:()=>void,activity:(active:boolean)=>void=()=>{},markOutcome:(outcome:string)=>void=()=>{}){
 let mathOpen=false,working=false,record=prior;
 const inputHost=host.createDiv(),actions=host.createDiv('study-actions'),review=host.createDiv(),status=host.createEl('p',{cls:'study-written-status',attr:{'aria-live':'polite'}});
 const input=writtenInput(app,inputHost,q,response,owner,persist,active=>{mathOpen=active;activity(active);actions.querySelectorAll('button').forEach(b=>(b as HTMLButtonElement).disabled=active);});
 const finish=async(mode:Attempt['mode'])=>{if(working||mathOpen)return;working=true;activity(true);review.inert=true;actions.inert=true;try{record=await save(mode);await display();}catch(e){status.hidden=false;status.setText(`Could not save: ${String(e)}. Your response remains here.`);throw e;}finally{working=false;activity(false);review.inert=false;actions.inert=false;}};
 const display=async()=>{
  actions.empty();review.empty();status.hidden=false;input.disabled=!!record||response.reviewed===true;
  if(record?.grade?.pending){record=undefined;response.reviewed=true;}
  const g=record?.grade;markOutcome(!g||g.pending?'unanswered':g.earned===g.possible?'correct':g.earned>0?'partial':'incorrect');
  if(record){const g=record.grade;status.setText(g?`${g.earned} / ${g.possible} — ${g.basis==='unanswered'?'unanswered':'self-assessed'}${preview?' (preview only)':''}`:'Reference revealed — not scored');await writtenReference(app,review,q,owner);for(const r of q.definition.written!.rubric){await RichMarkdown.render(app,`${g?.basis==='unanswered'?0:record.response.selfAssessment?.[r.id]??'—'} / 1: ${r.text}`,review.createDiv('markdown-rendered'),q.path,owner);}actions.createEl('button',{text:next?'Next question':'Try again'}).onclick=next??retry;return;}
  if(response.reviewed){status.setText('Response locked. Compare it with the reference, then score each criterion.');await rubricReview(app,review,q,owner,response.selfAssessment,async scores=>{response.selfAssessment=scores;persist();await finish('attempt');});actions.createEl('button',{text:'Reveal without scoring',cls:'study-secondary-reveal'}).onclick=()=>void finish('reveal').catch(()=>{});return;}
  status.empty();status.hidden=true;
  const submit=actions.createEl('button',{text:'Submit response · Ctrl+Enter',cls:'mod-cta'});submit.onclick=()=>{if(mathOpen||working)return;if(!input.value.trim()){void finish('attempt').catch(()=>{});return;}response.reviewed=true;persist();void display();};
  actions.createEl('button',{text:'Reveal without scoring',cls:'study-secondary-reveal'}).onclick=()=>void finish('reveal').catch(()=>{});
 };
 owner.registerDomEvent(input.dom,'keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();e.stopPropagation();if(!mathOpen&&!response.reviewed&&!record)actions.querySelector<HTMLButtonElement>('.mod-cta')?.click();}});
 await display();
}
