import {PracticeSession} from './practice-session';
import {finalGrade} from './final-grade';
import {App} from 'obsidian';
import {StudioPanel} from './workspace-panel';
import {HistoryFile} from './history-model';
import {Attempt,Question,Response,Grade} from './model';
import {parseSession} from './exam-model';
import {RichMarkdown} from './rich-markdown';
import {gradeTone} from './dashboard-widgets';
import {renderDiagram} from './diagram-render';
import {drawingPreview} from './drawing-ui';
import {codeFence,fillCode} from './code-model';
type Entry={question:Question;response:Response;result?:Grade|null;sectionTitle?:string};
export async function recordedResponse(app:App,record:HistoryFile,questionId?:string,frozen?:PracticeSession,provided?:StudioPanel){
 const session=!frozen&&record.kind==='exam'?parseSession(record.raw):undefined;
 const attempt=session||frozen?undefined:JSON.parse(record.raw) as Attempt;
 const all:Entry[]=frozen?frozen.attempts.map(a=>({question:a.question,response:a.response,result:a.grade})):session?session.entries:[{question:attempt!.question,response:attempt!.response,result:attempt!.grade}];
 const entries=all.filter(e=>!questionId||e.question.definition.id===questionId);
 const title=frozen?.title??session?.exam.title??attempt!.question.definition.title;
 const view=provided??new StudioPanel(app);view.titleEl.setText(title+' · Responses');if(!provided)view.open();const root=view.contentEl;root.empty();root.addClass('study-response-review');
 const render=(text:string,host:HTMLElement,q:Question)=>RichMarkdown.render(app,text,host,q.path,view);
 const scored=entries.filter(e=>e.result&&!e.result.pending),earned=scored.reduce((n,e)=>n+e.result!.earned,0),possible=scored.reduce((n,e)=>n+e.result!.possible,0),pending=entries.filter(e=>e.result?.pending).length;
 const status=(e:Entry)=>!e.result?'Unscored':e.result.pending?'Pending':e.result.earned===e.result.possible?'Correct':e.result.earned===0?'Incorrect':'Partial';
 if(frozen){finalGrade(root,earned,possible);root.createEl('p',{text:'Submitted session · Read only',cls:'study-muted'});}
 const header=root.createDiv('study-response-header');header.createEl('p',{text:[frozen?.course?.title??session?.course?.title??attempt?.course?.title,frozen?.finished??session?.finished??attempt?.finished].filter(Boolean).map((s,i)=>i===1?new Date(s!).toLocaleString():s).join(' · '),cls:'study-muted'});
 const summary=header.createDiv('study-response-summary');summary.createEl('strong',{text:possible?`${Math.round(100*earned/possible)}%`:'—',cls:gradeTone(earned,possible)});summary.createSpan({text:`${earned} / ${possible} scored points · ${entries.length} questions${pending?` · ${pending} pending`:''}`});
 const toolbar=root.createDiv('study-response-toolbar'),search=toolbar.createEl('input',{type:'search',attr:{placeholder:'Search questions…','aria-label':'Search recorded questions'}}),filter=toolbar.createEl('select',{attr:{'aria-label':'Filter recorded responses'}});for(const label of ['All responses','Needs review','Correct','Pending'])filter.createEl('option',{text:label,value:label});const count=toolbar.createSpan({cls:'study-muted'});
 const feedbackPanels:HTMLDetailsElement[]=[];
 let expandAnswers:boolean|undefined;
 const setAnswersExpanded=(expanded:boolean)=>{expandAnswers=expanded;for(const panel of feedbackPanels)panel.open=expanded;};
 const expand=toolbar.createEl('button',{text:'Expand all answers'}),collapse=toolbar.createEl('button',{text:'Collapse all answers'});
 expand.onclick=()=>setAnswersExpanded(true);collapse.onclick=()=>setAnswersExpanded(false);
 const cards:{element:HTMLElement;entry:Entry}[]=[];
 for(const [index,e]of entries.entries()){
  const q=e.question,d=q.definition,card=root.createEl('article',{cls:'study-response-question'});cards.push({element:card,entry:e});const top=card.createDiv('study-response-question-heading');top.createSpan({text:String(all.indexOf(e)+1),cls:'study-response-number'});top.createEl('h2',{text:d.title});top.createSpan({text:status(e)+(e.result&&!e.result.pending?` · ${e.result.earned}/${e.result.possible}`:''),cls:'study-response-status '+(e.result&&!e.result.pending?gradeTone(e.result.earned,e.result.possible):'study-muted')});
  const prompt=card.createDiv('study-response-prompt markdown-rendered');await render(q.prompt.replace(/\{\{blank:([^}]+)\}\}/g,(_,id)=>`**[${(d.answers??[]).findIndex(a=>a.id===id)+1}]**`),prompt,q);
  if(frozen&&d.choices){const list=prompt.createEl('ol');const order=frozen.attempts[all.indexOf(e)].choiceOrder;for(const id of order)await render(d.choices.find(c=>c.id===id)?.text??id,list.createEl('li'),q);}
  if(d.table){const table=prompt.createEl('table'),head=table.createEl('thead').createEl('tr');for(const col of d.table.columns)await render(col,head.createEl('th'),q);const body=table.createEl('tbody');for(const row of d.table.rows){const tr=body.createEl('tr');for(const cell of row)await render(cell.blank?`**[${d.answers!.findIndex(a=>a.id===cell.blank)+1}]**`:cell.text??cell.sourceText??'',tr.createEl('td'),q);}}
  if(d.diagram)renderDiagram(app,prompt,d.diagram,q.path,(host,id)=>{host.setText(String(d.answers!.findIndex(a=>a.id===id)+1));});
  const answers=card.createDiv('study-response-answer');answers.createEl('h3',{text:'Your response'});
  if(d.type==='drawing')drawingPreview(answers,e.response.blanks.response??'');
  else if(d.type==='short-answer')await render(e.response.blanks.response||'*No response submitted.*',answers.createDiv('markdown-rendered'),q);
  else if(d.type==='code'&&d.code)await render(codeFence(fillCode(d.code.source,e.response.blanks),d.code.language),answers.createDiv('markdown-rendered'),q);
  else if(d.choices){const list=answers.createEl(d.type==='ordering'?'ol':'ul');for(const id of e.response.choices)await render(d.choices.find(c=>c.id===id)?.text??id,list.createEl('li'),q);if(!e.response.choices.length)answers.createEl('p',{text:'No response submitted.',cls:'study-muted'});}
  else for(const [i,a]of (d.answers??[]).entries()){const row=answers.createDiv('study-response-blank');if((d.answers?.length??0)>1)row.createSpan({text:String(i+1),cls:'study-response-number'});const value=e.response.blanks[a.id];await render(value?(a.math&&!value.startsWith('$')?`$${value}$`:value):'*No response submitted.*',row.createDiv('markdown-rendered'),q);}
  const feedback=card.createEl('details',{cls:'study-response-feedback'});feedback.open=expandAnswers??(status(e)==='Incorrect'||status(e)==='Partial');feedbackPanels.push(feedback);feedback.createEl('summary',{text:'Answer and explanation'});const content=feedback.createDiv('markdown-rendered');
  let correct=d.written?.reference??(d.correct?d.correct.map(id=>d.choices?.find(c=>c.id===id)?.text??id).join('\n\n'):(d.answers??[]).map((a,i)=>`${(d.answers?.length??0)>1?`${i+1}. `:''}${a.math?`$${a.accepted[0]}$`:a.accepted[0]}`).join('\n\n'));
  if(d.code)correct=codeFence(fillCode(d.code.source,Object.fromEntries((d.answers??[]).map(a=>[a.id,a.accepted[0]]))),d.code.language);
  if(correct)await render(correct,content,q);if(q.explanation)await render(q.explanation,content.createDiv(),q);
  if(d.written){const rubric=content.createEl('table');for(const criterion of d.written.rubric){const row=rubric.createEl('tr');row.createEl('td',{text:criterion.text});row.createEl('td',{text:e.response.selfAssessment?.[criterion.id]===undefined?'Pending':`${e.response.selfAssessment[criterion.id]} / 1`});}}
 }
 const apply=()=>{let visible=0;for(const {element,entry}of cards){const state=status(entry);element.hidden=!(entry.question.definition.title+' '+entry.question.prompt).toLocaleLowerCase().includes(search.value.toLocaleLowerCase())||(filter.value==='Needs review'&&!['Incorrect','Partial','Pending'].includes(state))||(filter.value==='Correct'&&state!=='Correct')||(filter.value==='Pending'&&state!=='Pending');if(!element.hidden)visible++;}count.setText(`${visible} of ${entries.length} questions`);};search.oninput=apply;filter.onchange=apply;apply();
}
