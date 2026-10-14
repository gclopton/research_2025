import {ATTEMPT_COLUMNS,visibleAttempt,attemptColumnLabel} from './attempt-window';
import {PracticeSession,PRACTICE_SESSIONS,parsePracticeSession} from './practice-session';
import {registerChapterHome} from './chapter-home';
import {practiceSetSummary,practiceSetRuns} from './practice-set-model';
import {dataGrid,scoreCell,GridColumn} from './dashboard-widgets';
import {recordedResponse} from './recorded-response';
import {learningView} from './learning-ui';
import {ItemView, WorkspaceLeaf, Plugin, TFile, Menu, Notice, setIcon} from 'obsidian';
import {courses} from './course-ui';
import {Question} from './model';
import {dashboard} from './dashboard';
import {courseMetrics} from './metrics-model';
import {HistoryFile, normalizeHistory} from './history-model';
import {parseExam, parseSession, ExamSession, ExamDefinition} from './exam-model';
const HOME='study-studio-home', SIDE='study-studio-home-sidebar';
type Hooks={frozen:(session:PracticeSession)=>void;bank:()=>Promise<Question[]>;start:(exam:ExamDefinition)=>Promise<void>;resume:(session:ExamSession)=>void;practice:(questions:Question[],title?:string,course?:{id:string;title:string})=>void};
type Preferences={pins:string[];sort:string};
export function registerStudyHome(plugin:Plugin,hooks:Hooks){
 const prefPath=`${plugin.app.vault.configDir}/study-studio-home.json`;
 let prefs:Preferences={pins:[],sort:'title'};
 const ready=plugin.app.vault.adapter.read(prefPath).then(raw=>{const p=JSON.parse(raw);if(Array.isArray(p.pins)&&p.pins.every((x:unknown)=>typeof x==='string'))prefs={pins:p.pins,sort:['title','recent'].includes(p.sort)?p.sort:'title'};}).catch(()=>{});
 let writes=Promise.resolve();
 const save=()=>{const raw=JSON.stringify(prefs);writes=writes.catch(()=>{}).then(()=>plugin.app.vault.adapter.write(prefPath,raw));void writes.catch(e=>new Notice(`Could not save Home preferences: ${e}`));};
 let currentCourse='';let opening=false;
 const sideRefresh=()=>{for(const leaf of plugin.app.workspace.getLeavesOfType(SIDE))void (leaf.view as Sidebar).draw();};
 const open=async(courseId='',page='chapters',chapterId='')=>{if(opening)return;opening=true;try{if(courseId)currentCourse=courseId;let leaf=plugin.app.workspace.getLeavesOfType(HOME)[0];if(!leaf)leaf=plugin.app.workspace.getLeaf('tab');await leaf.setViewState({type:HOME,state:{selected:courseId,page,chapterId,query:''}});await plugin.app.workspace.revealLeaf(leaf);plugin.app.workspace.setActiveLeaf(leaf,{focus:true});sideRefresh();}finally{opening=false;}};

 registerChapterHome(plugin,{course:id=>void open(id),practice:(id,chapter)=>void open(id,'practice',chapter),grades:(id,chapter)=>void dashboard(plugin.app,hooks.bank,id,chapter)});
 class Home extends ItemView {
  private refreshTimer:ReturnType<typeof setTimeout>|undefined;private revision=0;private query='';private selected='';private page='chapters';private chapterId='';private scroll=0;private focusId='';
  getViewType(){return HOME;}getDisplayText(){return 'Study Home';}getIcon(){return 'house';}
  getState(){return {query:this.query,selected:this.selected,page:this.page,chapterId:this.chapterId};}
  async setState(s:{query?:string;selected?:string;page?:string;chapterId?:string},r:any){this.chapterId=s.chapterId??'';this.query=s.query??'';this.selected=s.selected??'';this.page=['chapters','practice','exams','quizzes'].includes(s.page??'')?s.page!:'chapters';if(this.selected)currentCourse=this.selected;await super.setState(s,r);await this.draw();}
  async onOpen(){this.contentEl.addClass('study-home');
   const refresh=()=>{if(this.refreshTimer)clearTimeout(this.refreshTimer);this.refreshTimer=setTimeout(()=>void this.draw(),700);};
   this.registerEvent(this.app.metadataCache.on('changed',refresh));
   this.registerEvent(this.app.vault.on('modify',file=>{if(file.path.startsWith('Study Studio/Exam sessions/')||file.path.startsWith('Study Studio/Attempts/'))refresh();}));
   this.registerEvent(this.app.vault.on('create',file=>{if(file.path.startsWith(PRACTICE_SESSIONS+'/'))refresh();}));
   this.registerEvent(this.app.vault.on('delete',refresh));this.registerEvent(this.app.vault.on('rename',refresh));
  }
  async onClose(){this.revision++;if(this.refreshTimer)clearTimeout(this.refreshTimer);}
  private async draw(){
   const rev=++this.revision,root=this.contentEl;root.setText('Loading your study library…');
   try{
    await ready;
    const [catalog,bank]=await Promise.all([courses(this.app),hooks.bank()]);
    const inputs:HistoryFile[]=[];const sessions:{file:TFile;session:ExamSession}[]=[];const errors:string[]=[];
    const files=this.app.vault.getFiles().filter(f=>f.extension==='json'&&/^Study Studio\/(Attempts|Exam sessions)\//.test(f.path));
    for(let i=0;i<files.length;i+=8)await Promise.all(files.slice(i,i+8).map(async file=>{try{const raw=await this.app.vault.read(file),kind=file.path.startsWith('Study Studio/Attempts/')?'practice':'exam';inputs.push({path:file.path,raw,kind});if(kind==='exam')sessions.push({file,session:parseSession(raw)});}catch(e){errors.push(`${file.path}: ${e}`);}}));
    const snapshots:PracticeSession[]=[];
    await Promise.all(this.app.vault.getFiles().filter(f=>f.extension==='json'&&f.path.startsWith(PRACTICE_SESSIONS+'/')).map(async file=>{try{snapshots.push(parsePracticeSession(await this.app.vault.read(file)));}catch(e){errors.push(`${file.path}: ${e}`);}}));
    let history=normalizeHistory(inputs);errors.push(...history.errors);
    if(rev!==this.revision)return;root.empty();
    const nav=root.createDiv('study-home-nav');nav.createEl('button',{text:'All courses'}).onclick=()=>{void open();};
    nav.createEl('button',{text:'Refresh',attr:{'aria-label':'Refresh study library'}}).onclick=()=>void this.draw();
    if(errors.length){const d=root.createEl('details');d.createEl('summary',{text:`${errors.length} records could not be loaded`});d.createEl('pre',{text:errors.join('\n')});}
    const selected=catalog.find(c=>c.course.id===this.selected);
    if(this.selected&&!selected){root.createEl('p',{text:'This course is unavailable. Return Home or refresh after repairing its metadata.'});return;}
    const openNote=(file:TFile)=>void this.app.workspace.getLeaf('tab').openFile(file);
    if(selected){
     const {course,file}=selected;nav.createSpan({text:` / ${course.title}`});root.createEl('h1',{text:course.title});
     if(this.page!=='chapters'){const back=nav.createEl('button',{text:'Course overview'});back.onclick=()=>void open(course.id);}
     const actions=root.createDiv('study-actions');actions.createEl('button',{text:'Practice'}).onclick=()=>void open(course.id,'practice');actions.createEl('button',{text:'Course dashboard',cls:'mod-cta'}).onclick=()=>void dashboard(this.app,hooks.bank,course.id);actions.createEl('button',{text:'Course note'}).onclick=()=>openNote(file);
     for(const [tab,label]of [['review','Spaced review'],['calendar','Study calendar'],['vocabulary','Vocabulary']])actions.createEl('button',{text:label}).onclick=()=>void learningView(this.app,hooks.bank,course.id,hooks.practice,tab);
     const filter=root.createEl('input',{type:'search',attr:{placeholder:'Search this page…','aria-label':'Search course study content'}});const body=root.createDiv();
     const chapters=this.app.vault.getMarkdownFiles().filter(f=>this.app.metadataCache.getFileCache(f)?.frontmatter?.studyChapter?.courseId===course.id).sort((a,b)=>a.path.localeCompare(b.path,undefined,{numeric:true}));
     const exams:{file:TFile;exam:ExamDefinition}[]=[];
     for(const f of this.app.vault.getMarkdownFiles().filter(f=>this.app.metadataCache.getFileCache(f)?.frontmatter?.studyExam?.courseIds?.includes(course.id))){try{exams.push({file:f,exam:parseExam(await this.app.vault.read(f))});}catch(e){errors.push(`${f.path}: ${e}`);}}
     if(rev!==this.revision)return;
     const render=()=>{body.empty();const match=(s:string)=>s.toLocaleLowerCase().includes(filter.value.toLocaleLowerCase());
      let count=0;
      if(this.page==='chapters'){
       body.createEl('h2',{text:'Chapters'});
       const groups=new Map<string,TFile[]>();
       for(const f of chapters){const c=this.app.metadataCache.getFileCache(f)!.frontmatter!.studyChapter;const unit=typeof c.unit==='string'?c.unit:'';if(!match(`${unit} ${c.title}`))continue;const key=unit||'Chapters';groups.set(key,[...(groups.get(key)??[]),f]);}
       for(const [unit,items]of groups){const section=unit==='Chapters'?body.createDiv('study-unit'):body.createEl('details',{cls:'study-unit'});if(section instanceof HTMLDetailsElement){section.open=!!filter.value||groups.size===1;section.createEl('summary',{text:`${unit} · ${items.length} chapters`});}const grid=section.createDiv('study-chapter-grid');
        for(const f of items){const c=this.app.metadataCache.getFileCache(f)!.frontmatter!.studyChapter;const qs=bank.filter(q=>q.definition.chapters?.some(ch=>ch.courseId===course.id&&ch.chapterId===c.chapterId));const m=courseMetrics(qs,history.rows.filter(r=>qs.some(q=>q.definition.id===r.questionId)),course.id);const card=grid.createEl('button',{cls:'study-chapter-card',attr:{'aria-label':c.title}});
         const index=chapters.indexOf(f),palette=['#326a85','#75618f','#397c72','#9c6946','#537b56','#9a596e'];card.style.setProperty('--chapter-color',/^#[0-9a-f]{6}$/i.test(c.color)?c.color:palette[index%palette.length]);
         const cover=card.createDiv('study-chapter-cover');cover.setAttribute('aria-hidden','true');cover.createSpan({cls:'study-chapter-number',text:String(c.number??index+1).padStart(2,'0')});const emblem=cover.createSpan({cls:'study-chapter-emblem'});setIcon(emblem,typeof c.icon==='string'?c.icon:'book-open');
         if(typeof c.cover==='string'){const image=this.app.metadataCache.getFirstLinkpathDest(c.cover,f.path);if(image&&['svg','png','jpg','jpeg','webp'].includes(image.extension)){cover.style.backgroundImage=`url("${this.app.vault.getResourcePath(image)}")`;cover.addClass('has-cover');}}
         const info=card.createDiv('study-chapter-info');info.createSpan({cls:'study-chapter-kicker',text:`CHAPTER ${String(c.number??index+1).padStart(2,'0')}`});info.createEl('strong',{text:c.title.replace(/^\d+\s*[-–·.]\s*/, '')});info.createSpan({text:`${qs.length} practice questions`,cls:'study-muted'});const tested=m.questions.filter(q=>q.graded.length).length;const foot=info.createDiv('study-chapter-status');foot.createSpan({text:`${tested} of ${qs.length} scored`});foot.createSpan({text:m.latest.possible?`${Math.round(100*m.latest.earned/m.latest.possible)}% score`:'Not yet scored'});const progress=info.createEl('progress');progress.max=Math.max(1,qs.length);progress.value=tested;progress.setAttribute('aria-label','Questions scored');card.onclick=()=>openNote(f);
         const context=(e:MouseEvent|KeyboardEvent)=>{e.preventDefault();const menu=new Menu();menu.addItem(i=>i.setTitle('Open chapter').onClick(()=>openNote(f)));menu.addItem(i=>i.setTitle('Chapter gradebook').onClick(()=>void dashboard(this.app,hooks.bank,course.id,c.chapterId)));if(qs.length)menu.addItem(i=>i.setTitle('Practice chapter').onClick(()=>hooks.practice(qs)));const r=card.getBoundingClientRect();menu.showAtPosition({x:'clientX'in e?e.clientX:r.left,y:'clientY'in e?e.clientY:r.bottom});};card.oncontextmenu=context;card.onkeydown=e=>{if(e.ctrlKey&&e.code==='Space')context(e);};
        }count+=items.length;
       }if(!count)body.createEl('p',{text:'No matching chapters.'});
      }else if(this.page==='practice'){
       body.createEl('h2',{text:'Practice'});
       body.createEl('p',{text:'Select a chapter and a practice set. Practice records are separate from assessment grades.',cls:'study-muted'});
       const layout=body.createDiv('study-practice-layout'), index=layout.createDiv('study-practice-index'),detail=layout.createDiv('study-practice-detail');
       const candidates=chapters.map(f=>({file:f,c:this.app.metadataCache.getFileCache(f)!.frontmatter!.studyChapter,questions:bank.filter(q=>q.definition.chapters?.some(c=>c.courseId===course.id&&c.chapterId===this.app.metadataCache.getFileCache(f)!.frontmatter!.studyChapter.chapterId))}));
       const drawChapter=(item:typeof candidates[number])=>{this.chapterId=item.c.chapterId;this.app.workspace.requestSaveLayout();detail.empty();index.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.chapter===item.c.chapterId)));detail.createEl('h3',{text:item.c.title});detail.createEl('button',{text:'Open chapter'}).onclick=()=>openNote(item.file);
        const sets=new Map<string,Question[]>();for(const q of [...item.questions].sort((a,b)=>a.path.localeCompare(b.path,undefined,{numeric:true}))){const topic=q.definition.concepts.find(c=>c.startsWith('Practice set: '))?.slice(14)??q.definition.concepts.find(c=>!c.startsWith('Vocabulary: '))??'Chapter practice';sets.set(topic,[...(sets.get(topic)??[]),q]);}
        const toolbar=detail.createDiv('study-practice-toolbar');const status=toolbar.createEl('select',{attr:{'aria-label':'Filter practice by competency'}});for(const value of ['All sections','Below 90%','Needs work','Developing','Incomplete coverage','Unmeasured','Proficient'])status.createEl('option',{text:value,value});
        const note=detail.createEl('p',{text:'Competency uses the latest scored practice response for each question. Proficient requires 90% or higher and every question measured. Self-assessed work is included.',cls:'study-muted'});
        const tableHost=detail.createDiv();const models=[...sets].filter(([title,qs])=>match(item.c.title+' '+title)||qs.some(q=>match(q.definition.title+' '+q.prompt))).sort(([a],[b])=>a.localeCompare(b,undefined,{numeric:true})).map(([title,qs])=>{const part=/^Part (\d+) · (.*)$/.exec(title);return {title,part:part?`Part ${part[1]}`:'',topic:part?.[2]??title,qs,runs:practiceSetRuns(qs,history.rows,course.id,snapshots),...practiceSetSummary(qs,history.rows,course.id)};});
        const drawSets=()=>{tableHost.empty();const visible=models.filter(m=>status.value==='All sections'||(status.value==='Below 90%'?m.percent!==null&&m.percent<90:m.status===status.value));
         type SetRow=typeof models[number];const columns:GridColumn<SetRow>[]=[...(models.some(m=>m.part)?[{label:'Part',value:(m:SetRow)=>m.part}]:[]),{label:'Section',value:m=>m.topic,render:(cell,m)=>{cell.createEl('button',{text:m.topic,cls:'study-grid-link'}).onclick=()=>hooks.practice(m.qs,m.title,course);}},{label:'Latest competency',value:m=>m.percent??-1,render:(cell,m)=>scoreCell(cell,m.earned,m.possible)},{label:'Measured',value:m=>m.coverage,render:(cell,m)=>cell.setText(`${m.coverage} / ${m.total}`)}];
         const attemptCount=Math.min(ATTEMPT_COLUMNS,Math.max(0,...models.map(m=>m.runs.length)));
         for(let i=0;i<attemptCount;i++)columns.push({label:attemptColumnLabel(i,attemptCount),value:m=>{const r=visibleAttempt(m.runs,i,attemptCount)?.attempt;return r?.possible?r.earned/r.possible:-1;},render:(cell,m)=>{const entry=visibleAttempt(m.runs,i,attemptCount),run=entry?.attempt;if(!run){cell.setText('—');return;}if(run.frozen){const link=cell.createEl('button',{cls:'study-grid-link',attr:{'aria-label':`View submitted attempt ${entry!.number} for ${m.title}`}});scoreCell(link,run.earned,run.possible);link.onclick=()=>hooks.frozen(run.frozen!);}else {scoreCell(cell,run.earned,run.possible);cell.createEl('small',{text:'Not submitted'});}cell.createEl('small',{text:`Attempt ${entry!.number}`});cell.createEl('small',{text:new Date(run.date).toLocaleDateString(undefined,{month:'short',day:'numeric'})});if(run.pending)cell.createEl('small',{text:`${run.pending} pending`});if(run.coverage<run.total)cell.createEl('small',{text:`${run.coverage}/${run.total} answered`});cell.title=`${run.earned}/${run.possible} scored points; ${run.coverage}/${run.total} answered`;}});
         columns.push({label:'Change since first (pp)',value:m=>{const a=m.runs[0],b=m.runs.at(-1);return a?.possible&&b?.possible?100*(b.earned/b.possible-a.earned/a.possible):-Infinity;},render:(cell,m)=>{const a=m.runs[0],b=m.runs.at(-1);if(m.runs.length<2||!a?.possible||!b?.possible||a.pending||b.pending||a.coverage<a.total||b.coverage<b.total){cell.setText('—');return;}const change=100*(b.earned/b.possible-a.earned/a.possible);cell.setText(`${change>0?'+':''}${change.toFixed(1)}`);}},{label:'',value:m=>m.title,render:(cell,m)=>{cell.createEl('button',{text:'Practice',attr:{'aria-label':`Practice ${m.title}`}}).onclick=()=>hooks.practice(m.qs,m.title,course);}});
         const grid=dataGrid(tableHost,'Practice sets',visible,columns,m=>m.title);grid.addClass('study-practice-sheet');
        };status.onchange=drawSets;drawSets();
        const records=history.rows.filter(r=>r.source==='practice'&&r.course?.id===course.id&&r.chapters?.some(c=>c.chapterId===item.c.chapterId&&c.courseId===course.id));
        dataGrid(detail,'Practice history',records,[{label:'Question',value:r=>r.title},{label:'Date',value:r=>r.finished,render:(cell,r)=>cell.setText(new Date(r.finished).toLocaleString())},{label:'Score',value:r=>r.possible&&r.earned!==null?r.earned/r.possible:-1,render:(cell,r)=>{if(r.mode==='reveal')cell.setText('Reveal');else if(r.assessment==='pending')cell.setText('Pending');else scoreCell(cell,r.earned??0,r.possible??0);}},{label:'Response',value:r=>r.title,render:(cell,r)=>{cell.createEl('button',{text:'View response',cls:'study-grid-link'}).onclick=()=>{const input=inputs.find(f=>f.path===r.paths[0]);if(input)void recordedResponse(this.app,input,r.questionId);};}}],r=>r.title);

       };
       const visible=candidates.filter(item=>match(item.c.title)||item.questions.some(q=>match(q.definition.title+' '+q.prompt+' '+q.definition.concepts.join(' '))));
       for(const item of visible){const button=index.createEl('button',{attr:{'aria-pressed':'false'}});button.dataset.chapter=item.c.chapterId;button.createEl('strong',{text:item.c.title});button.createEl('small',{text:`${item.questions.length} questions`});button.onclick=()=>drawChapter(item);}
       if(visible.length)drawChapter(visible.find(item=>item.c.chapterId===this.chapterId)??visible[0]);else detail.createEl('p',{text:'No matching chapters.'});
      }else if(this.page==='exams'||this.page==='quizzes'){
       body.createEl('h2',{text:this.page==='exams'?'Exams':'Quizzes'});
       const kindOf=(exam:ExamDefinition,file?:TFile)=>file&&this.app.metadataCache.getFileCache(file)?.frontmatter?.studyAssessment?.kind||exam.kind||(/checkpoint|vocabulary|quiz/i.test(exam.title)?'quiz':'exam');
       const onPage=(exam:ExamDefinition,file?:TFile)=>(this.page==='quizzes')===(kindOf(exam,file)==='quiz');
       const active=[...new Map(sessions.filter(s=>s.session.state==='active'&&s.session.course?.id===course.id).map(s=>[s.session.id,s.session])).values()].sort((a,b)=>b.started.localeCompare(a.started));
       const unfinished=active.filter(s=>{const original=exams.find(e=>e.exam.id===s.exam.id);return onPage(original?.exam??s.exam,original?.file)&&match(s.exam.title);});
       if(unfinished.length){body.createEl('h3',{text:'In progress'});for(const session of unfinished){count++;const row=body.createDiv('study-home-destination');const info=row.createDiv();info.createEl('strong',{text:session.exam.title});info.createEl('small',{text:`Started ${new Date(session.started).toLocaleString()}`,cls:'study-muted'});row.createEl('button',{text:'Resume',attr:{'aria-label':`Resume ${session.exam.title}, started ${new Date(session.started).toLocaleString()}`}}).onclick=()=>hooks.resume(session);}body.createEl('h3',{text:'Available assessments'});}
       for(const {file:f,exam}of exams.sort((a,b)=>a.file.path.localeCompare(b.file.path,undefined,{numeric:true}))){if(!onPage(exam,f)||!match(exam.title))continue;count++;const row=body.createDiv('study-home-destination');row.createEl('strong',{text:exam.title});row.createEl('button',{text:active.some(s=>s.exam.id===exam.id)?'Start new attempt':'Start'}).onclick=()=>void hooks.start(exam).catch(e=>new Notice(String(e)));}
       if(!count)body.createEl('p',{text:'No matching assessments.'});
      }
     };filter.oninput=render;render();body.onkeydown=e=>{if(!(e.target instanceof HTMLButtonElement)||!['ArrowDown','ArrowUp'].includes(e.key))return;const buttons=Array.from(body.querySelectorAll<HTMLButtonElement>('button'));const index=buttons.indexOf(e.target);e.preventDefault();buttons[Math.max(0,Math.min(buttons.length-1,index+(e.key==='ArrowDown'?1:-1)))]?.focus();};filter.focus();return;
    }
    const hero=root.createDiv('study-home-hero');hero.createSpan({text:'STUDY STUDIO',cls:'study-home-eyebrow'});hero.createEl('h1',{text:'Courses'});hero.createEl('p',{text:'Select a course to access chapters, assessments and study records.'});
    const bar=root.createDiv('study-home-toolbar');const search=bar.createEl('input',{type:'search',attr:{placeholder:'Search courses…','aria-label':'Search courses'}});search.value=this.query;
    const sort=bar.createEl('select',{attr:{'aria-label':'Sort courses'}});sort.createEl('option',{value:'title',text:'Course name'});sort.createEl('option',{value:'recent',text:'Recently practiced'});sort.value=prefs.sort;
    const grid=root.createDiv('study-home-grid');
    const models=catalog.map(c=>({...c,m:courseMetrics(bank,history.rows,c.course.id)}));
    const render=()=>{grid.empty();const visible=models.filter(c=>c.course.title.toLocaleLowerCase().includes(this.query.toLocaleLowerCase())).sort((a,b)=>Number(prefs.pins.includes(b.course.id))-Number(prefs.pins.includes(a.course.id))||(prefs.sort==='recent'?(b.m.rows.at(-1)?.finished??'').localeCompare(a.m.rows.at(-1)?.finished??''):0)||a.course.title.localeCompare(b.course.title));
     if(!visible.length)grid.createEl('p',{text:catalog.length?'No matching courses. Try another search.':'Your study library is empty. Use Manage courses to create your first course.'});
     for(const {course,file,m}of visible){const card=grid.createEl('button',{cls:'study-home-card',attr:{'data-course':course.id}});const fm=this.app.metadataCache.getFileCache(file)?.frontmatter?.studyHome;
      const colors=['#9b6bb3','#ca7199','#5e9f98','#b79255','#668dbc','#b87867'];const index=[...course.id].reduce((n,c)=>n+c.charCodeAt(0),0)%colors.length;card.style.setProperty('--course-color',/^#[0-9a-f]{6}$/i.test(fm?.color)?fm.color:colors[index]);
      const art=card.createDiv('study-home-cover');art.createSpan({text:fm?.symbol??course.title.slice(0,2).toUpperCase()});
      if(typeof fm?.cover==='string'){const image=this.app.metadataCache.getFirstLinkpathDest(fm.cover,file.path);if(image&&['svg','png','jpg','jpeg','webp'].includes(image.extension))art.style.backgroundImage=`url("${this.app.vault.getResourcePath(image)}")`;}
      const info=card.createDiv('study-home-card-body');info.createEl('h2',{text:(prefs.pins.includes(course.id)?'★ ':'')+course.title});const tested=m.questions.filter(q=>q.graded.length).length;
      info.createEl('strong',{text:m.latest.possible?`${Math.round(100*m.latest.earned/m.latest.possible)}% recorded score`:'Not yet measured'});info.createEl('p',{text:`${tested} / ${m.questions.length} questions scored`});const progress=info.createEl('progress');progress.max=Math.max(1,m.questions.length);progress.value=tested;progress.setAttribute('aria-label','Scored question coverage');
      info.createEl('p',{text:`${m.pending} pending · ${m.rows.at(-1)?'Last '+new Date(m.rows.at(-1)!.finished).toLocaleDateString():'No practice yet'}`,cls:'study-muted'});
      card.onclick=()=>{this.scroll=root.scrollTop;this.focusId=course.id;void open(course.id);};
      const menu=(e:MouseEvent|KeyboardEvent)=>{e.preventDefault();e.stopPropagation();const menu=new Menu();menu.addItem(i=>i.setTitle(prefs.pins.includes(course.id)?'Unpin course':'Pin course').setIcon('pin').onClick(()=>{prefs.pins=prefs.pins.includes(course.id)?prefs.pins.filter(x=>x!==course.id):[...prefs.pins,course.id];save();render();grid.querySelector<HTMLButtonElement>(`[data-course="${course.id}"]`)?.focus();}));menu.addItem(i=>i.setTitle('Edit course note / appearance').setIcon('pencil').onClick(()=>openNote(file)));menu.addItem(i=>i.setTitle('Open course dashboard').setIcon('chart-no-axes-combined').onClick(()=>void dashboard(this.app,hooks.bank,course.id)));const r=card.getBoundingClientRect();menu.showAtPosition({x:'clientX'in e?e.clientX:r.left,y:'clientY'in e?e.clientY:r.bottom});};card.oncontextmenu=menu;
      card.onkeydown=e=>{if(e.ctrlKey&&e.code==='Space'){menu(e);return;}const all=Array.from(grid.querySelectorAll<HTMLButtonElement>('.study-home-card'));const at=all.indexOf(card);const columns=Math.max(1,Math.round(grid.clientWidth/card.getBoundingClientRect().width));const delta=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:e.key==='ArrowDown'?columns:e.key==='ArrowUp'?-columns:0;if(delta){e.preventDefault();all[Math.max(0,Math.min(all.length-1,at+delta))]?.focus();}};
     }
    };search.oninput=()=>{this.query=search.value;this.app.workspace.requestSaveLayout();render();};sort.onchange=()=>{prefs.sort=sort.value;save();render();};render();root.scrollTop=this.scroll;if(this.focusId)grid.querySelector<HTMLButtonElement>(`[data-course="${this.focusId}"]`)?.focus();else search.focus();
   }catch(e){if(rev!==this.revision)return;root.setText(`Could not load Study Home: ${e}`);root.createEl('button',{text:'Retry'}).onclick=()=>void this.draw();}
  }
 }
 class Sidebar extends ItemView {
  getViewType(){return SIDE;}getDisplayText(){return 'Study library';}getIcon(){return 'house';}
  async onOpen(){await this.draw();const header=(this.leaf as WorkspaceLeaf & {tabHeaderEl?:HTMLElement}).tabHeaderEl;if(header)this.registerDomEvent(header,'click',()=>window.setTimeout(()=>void open(),0));}
  async draw(){const root=this.contentEl;root.empty();root.addClass('study-library-nav');root.createEl('h3',{text:'Study library'});const home=root.createEl('button',{text:'All courses'});home.onclick=()=>void open();
   const catalog=await courses(this.app);const picker=root.createEl('select',{attr:{'aria-label':'Current course'}});picker.createEl('option',{value:'',text:'Choose a course…'});for(const {course}of catalog)picker.createEl('option',{value:course.id,text:course.title});picker.value=currentCourse;picker.onchange=()=>void open(picker.value);
   const selected=catalog.find(c=>c.course.id===currentCourse);if(!selected)return;root.createEl('h4',{text:selected.course.title});
   const action=(label:string,icon:string,fn:()=>void)=>{const button=root.createEl('button');setIcon(button.createSpan(),icon);button.createSpan({text:label});button.onclick=fn;};
   action('Course overview','book-open',()=>void open(currentCourse));action('Gradebook','chart-no-axes-combined',()=>void dashboard(this.app,hooks.bank,currentCourse));action('Practice','pencil-line',()=>void open(currentCourse,'practice'));action('Exams','file-check',()=>void open(currentCourse,'exams'));action('Quizzes','list-checks',()=>void open(currentCourse,'quizzes'));
   for(const [tab,label,icon]of [['review','Spaced review','repeat'],['calendar','Calendar','calendar'],['vocabulary','Vocabulary','languages']])action(label,icon,()=>void learningView(this.app,hooks.bank,currentCourse,hooks.practice,tab));
  }
 }
 plugin.registerView(HOME,leaf=>new Home(leaf));plugin.registerView(SIDE,leaf=>new Sidebar(leaf));
 plugin.addCommand({id:'open-study-home',name:'Open Study Home',callback:()=>void open()});

 plugin.app.workspace.onLayoutReady(()=>{if(!plugin.app.workspace.getLeavesOfType(SIDE).length){const leaf=plugin.app.workspace.getLeftLeaf(false);if(leaf)void leaf.setViewState({type:SIDE});}});
}
