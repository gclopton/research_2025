import {App,Modal,Notice,TFile} from 'obsidian';
import {parse} from 'yaml';
import {Course,CourseContext,courseSource,parseCourse,replaceProperty,validateMembership} from './course-model';
import {StudioPanel} from './workspace-panel';
import {parseQuestion} from './model';
import {parseExam} from './exam-model';
import {filterHistory,HistoryFile,normalizeHistory} from './history-model';
const ROOT='Study Studio/Courses';
export async function courses(app:App):Promise<{course:Course;file:TFile}[]> {
 const files=app.vault.getMarkdownFiles().filter(f=>f.path.startsWith(ROOT+'/')||app.metadataCache.getFileCache(f)?.frontmatter?.studyCourse);
 const out=[];const ids=new Set<string>();for(const file of files){const course=parseCourse(await app.vault.read(file));if(ids.has(course.id))throw Error(`Duplicate course ID: ${course.id}`);ids.add(course.id);out.push({course,file});}return out.sort((a,b)=>a.course.title.localeCompare(b.course.title));
}
export async function manageCourses(app:App){
 const entries=await courses(app),panel=new StudioPanel(app);panel.titleEl.setText('Courses');
 panel.contentEl.createEl('p',{text:'Courses use stable IDs. Rename a title here without changing its identity. Assign questions and exams with “Assign current note to courses” while viewing their source note. Existing history is never reassigned.'});
 const add=panel.contentEl.createDiv('study-actions'),title=add.createEl('input',{type:'text',attr:{'aria-label':'New course title',placeholder:'New course title'}}),create=add.createEl('button',{text:'Create course'});
 create.onclick=()=>{void(async()=>{if(!title.value.trim())throw Error('Enter a course title.');create.disabled=true;const c:Course={version:1,id:`course-${crypto.randomUUID()}`,title:title.value.trim()};if(!app.vault.getAbstractFileByPath(ROOT))await app.vault.createFolder(ROOT);await app.vault.create(`${ROOT}/${c.id}.md`,courseSource(c));panel.close();await manageCourses(app);})().catch(e=>{create.disabled=false;new Notice(String(e));});};
 for(const {course,file} of entries){const row=panel.contentEl.createDiv('study-history-row'),input=row.createEl('input',{type:'text',attr:{'aria-label':`Course title: ${course.title}`}});input.value=course.title;row.createEl('p',{text:`ID: ${course.id}`,cls:'study-muted'});const save=row.createEl('button',{text:'Save course title'});save.onclick=()=>{void(async()=>{if(!input.value.trim())throw Error('Enter a course title.');save.disabled=true;await app.vault.process(file,raw=>{const current=parseCourse(raw);if(current.title!==course.title)throw Error('Course changed externally. Reopen Courses.');return replaceProperty(raw,'studyCourse',{...current,title:input.value.trim()});});course.title=input.value.trim();new Notice('Course title saved. Historical course labels remain unchanged.');})().catch(e=>new Notice(String(e))).finally(()=>save.disabled=false);};}
 if(!entries.length)panel.contentEl.createEl('p',{text:'No courses yet. Existing questions and history remain unassigned.'});panel.open();
}
export async function assignCourses(app:App,file:TFile){
 const original=await app.vault.read(file),front=parse(/^---\r?\n([\s\S]*?)\r?\n---/.exec(original)?.[1]??'');
 const key=front?.study?'study':front?.studyExam?'studyExam':undefined;if(!key)throw Error('Open a question or exam source note first.');
 const definition=key==='study'?parseQuestion(original,file.path).definition:parseExam(original),entries=await courses(app),selected=new Set(definition.courseIds??[]);
 const modal=new Modal(app);modal.titleEl.setText(`Courses · ${definition.title}`);modal.contentEl.createEl('p',{text:'Membership affects future study choices, not past history. No selection means unassigned. Reopen any already-open editors/cards after saving.'});
 const options=new Map(entries.map(e=>[e.course.id,e.course.title]));for(const id of selected)if(!options.has(id))options.set(id,`Missing course (${id})`);
 for(const [id,title]of options){const label=modal.contentEl.createEl('label',{cls:'study-group-pick'}),input=label.createEl('input',{type:'checkbox'});input.checked=selected.has(id);input.onchange=()=>input.checked?selected.add(id):selected.delete(id);label.appendText(title);}
 if(!options.size)modal.contentEl.createEl('p',{text:'Create a course with “Manage courses” first.'});
 const save=modal.contentEl.createEl('button',{text:'Save memberships',cls:'mod-cta'});save.onclick=()=>{save.disabled=true;void app.vault.process(file,raw=>{if(raw!==original)throw Error('Source changed. Reopen membership editor.');const courseIds=[...selected];validateMembership(courseIds);return replaceProperty(raw,key,{...definition,courseIds,...('chapters' in definition?{chapters:definition.chapters?.filter(p=>courseIds.includes(p.courseId))}:{})});}).then(()=>{modal.close();new Notice('Memberships saved. Existing history unchanged.');},e=>{save.disabled=false;new Notice(String(e));});};modal.open();
}
export async function chooseCourse(app:App,ids:string[]|undefined):Promise<CourseContext|undefined>{
 const all=await courses(app),available=all.filter(x=>(ids??[]).includes(x.course.id));
 if((ids??[]).some(id=>!all.some(x=>x.course.id===id)))throw Error('A course membership references a missing course. Repair it before starting.');
 if(!available.length)return null;
 return new Promise(resolve=>{const modal=new Modal(app);let decided=false;modal.titleEl.setText('Course for this exam');modal.contentEl.createEl('p',{text:'This choice is saved with the session and will not change if memberships change later.'});for(const c of [null,...available.map(x=>({id:x.course.id,title:x.course.title}))]){modal.contentEl.createEl('button',{text:c?.title??'Unassigned'}).onclick=()=>{decided=true;resolve(c);modal.close();};}modal.onClose=()=>{if(!decided)resolve(undefined);};modal.open();});
}
export async function historyView(app:App){
 const panel=new StudioPanel(app);panel.titleEl.setText('Course and review history');const root=panel.contentEl;root.createEl('p',{text:'Loading practice and exam records…'});panel.open();
 const files=app.vault.getFiles().filter(f=>f.extension==='json'&&(f.path.startsWith('Study Studio/Attempts/')||f.path.startsWith('Study Studio/Exam sessions/'))),input:HistoryFile[]=[],readErrors:string[]=[];
 for(let i=0;i<files.length;i+=8)await Promise.all(files.slice(i,i+8).map(async f=>{try{input.push({path:f.path,raw:await app.vault.read(f),kind:f.path.startsWith('Study Studio/Attempts/')?'practice':'exam'});}catch(e){readErrors.push(`${f.path}: ${String(e)}`);}}));
 const data=normalizeHistory(input);root.empty();root.createEl('p',{text:'Practice and submitted exam questions appear together once per recorded event. First/retry refers to scored attempts for the same question and course in available history; reveals do not count as scored attempts. Variants remain distinct questions. Active time is not measured.'});
 root.createEl('p',{text:`${data.rows.length} history events · ${data.activeSessions} unfinished exam sessions (not scored here).`});
 for(const error of [...readErrors,...data.errors])root.createEl('p',{text:error,cls:'study-error'});
 const bar=root.createDiv('study-actions'),course=bar.createEl('select',{attr:{'aria-label':'Filter history by course'}}),kind=bar.createEl('select',{attr:{'aria-label':'Filter history by attempt type'}});
 course.createEl('option',{value:'all',text:'All courses'});course.createEl('option',{value:'unassigned',text:'Unassigned'});
 const labels=new Map(data.rows.filter(r=>r.course).map(r=>[r.course!.id,r.course!.title]));try{for(const {course:c}of await courses(app))labels.set(c.id,c.title);}catch(e){root.createEl('p',{text:String(e),cls:'study-error'});}
 for(const [id,title]of labels)course.createEl('option',{value:id,text:title});for(const [id,title]of [['all','All event types'],['first','First scored attempts'],['retry','Retries'],['reveal','Unscored reveals']])kind.createEl('option',{value:id,text:title});
 const count=root.createEl('p'),list=root.createDiv();let limit=100;
 const render=()=>{list.empty();const rows=filterHistory(data.rows,course.value,kind.value).slice().reverse();count.setText(`${rows.length} matching events. Showing ${Math.min(limit,rows.length)}.`);for(const r of rows.slice(0,limit)){const row=list.createDiv('study-history-row');row.createEl('strong',{text:r.title});row.createEl('p',{text:`${r.course?.title??'Unassigned'} · ${r.source}${r.section?' · '+r.section:''} · ${r.assessment==='pending'?'Pending assessment':r.classification==='first'?'First scored attempt':r.classification==='retry'?'Retry':'Unscored reveal'} · ${r.assessment==='pending'?'Awaiting self-assessment':r.earned===null?'No score':`${r.earned}/${r.possible}${r.assessment==='self-assessed'?' (self-assessed)':''}`} · ${new Date(r.finished).toLocaleString()}`});row.createEl('p',{text:`Question: ${r.questionId} · Family: ${r.familyId}`,cls:'study-muted'});row.createEl('button',{text:'Open original record'}).onclick=()=>{void(async()=>{const file=app.vault.getAbstractFileByPath(r.paths[0]);if(!(file instanceof TFile))throw Error('Original record is no longer available.');const raw=await app.vault.read(file),record=new StudioPanel(app);record.titleEl.setText('Saved history record');record.contentEl.createEl('p',{text:file.path});record.contentEl.createEl('pre',{text:raw});record.open();})().catch(e=>new Notice(String(e)));};}if(rows.length>limit)list.createEl('button',{text:'Show 100 more'}).onclick=()=>{limit+=100;render();};};course.onchange=kind.onchange=()=>{limit=100;render();};render();
}
