import {menuGroup} from './menu-groups';
import {registerMarginNotes} from './margin-view';
import {registerVaultWindowIdentity} from './vault-window-identity';
import {practiceLink,parsePracticeLink} from './practice-link';
import {PracticeSession,PRACTICE_SESSIONS,practiceSessionPath,freezePractice,parsePracticeSession} from './practice-session';
import {recordedResponse} from './recorded-response';
import {PracticeReviewState,nextReview} from './practice-review';
import {finalGrade} from './final-grade';
import {practiceCompletion} from './practice-completion';
import {chapterOrder,shuffledPractice} from './practice-order';
import {learningView} from './learning-ui';
import {registerPanelRestorer} from './workspace-panel';
import {registerStudyHome} from './study-home';
import {printableQuestion} from './exam-print';
import {ReviewStore} from './review';
import {registerAnnotations} from './annotations';
import {registerEvidence} from './evidence';
import {NoteGrouping} from './note-grouping-ui';
import {groupOccurrences} from './note-grouping';
import {equations} from './math-model';
import {RichMarkdown} from './rich-markdown';
import {GroupEditor,editGroup,GroupTools} from './group-editor';
import {NoteRemoval} from './note-removal';
import {DeleteQuestions} from './question-deletion';
import {embeds,embedSource,replaceEmbed,scopeQuestions} from "./note-authoring";
import {chapterDestination,manageNote,ScopedQuestionPicker} from "./note-authoring-ui";
import {registerShortcutGuide} from "./shortcut-guide";
import {organizeCourseLab} from "./lab-organizer";
import {moveCacheContext,moveNoteLocations,legacyNotePaths,within} from "./practice-location";
import {dashboard} from "./dashboard";
import {writtenInput,writtenPractice} from "./written-ui";
import {orderingField} from "./ordering";
import {renderDiagram} from "./diagram-render";
import {renderCode} from "./code-render";
import {codeFence} from "./code-model";
import {courses,manageCourses,assignCourses,chooseCourse,historyView} from "./course-ui";
import {CourseContext} from "./course-model";
import {StudioPanel,registerStudioWorkspace} from "./workspace-panel";
import {ExamEditor,ExamRunner,ExamResponseOptions,newExam} from "./exam-ui";
import {ExamDefinition,ExamSession,parseExam,serializeExam,replaceExam,createSession,parseSession} from "./exam-model";
import {QuestionIndex} from "./question-index";
import {practiceResetKeys, PracticeDraft, signature, draftKey, restoreDraft, parseGroup, noteQuestionIds} from "./practice-state";
import {stringify} from "yaml";
import { AnswerMathEditor } from "./response-math";
import { intakeDraft, selectedTable, cardInsertion, calloutSelection } from "./intake";
import { QuestionEditor } from "./authoring";
import {
  Plugin,
  Menu,
  MarkdownRenderChild,
  MarkdownRenderer,
  Modal,
  Notice,
  TFile,
  MarkdownView,
  Editor,
  Setting,
  FuzzySuggestModal,
  normalizePath,
} from "obsidian";
import {
  Question,
  Kind,
  Response,
  Attempt,
  parseQuestion,
  serialize,
  template,
  orderChoices,
  makeAttempt,
  selectVariants,
  answerLabel,
} from "./model";
const ROOT = "Study Studio",
  QUESTIONS = `${ROOT}/Questions`,
  ATTEMPTS = `${ROOT}/Attempts`;
const errorText = (e: unknown) => (e instanceof Error ? e.message : String(e));
class Card extends MarkdownRenderChild {
  ready?:Promise<void>;
  submitForSet?:()=>Promise<void>;
  hasUnanswered?:()=>boolean;
  private editing=0;
  private working=false;
  private rendering=false;
  private editorBusy(active:boolean){this.editing+=active?1:-1;this.exam?.busy(active);}

  constructor(
    el: HTMLElement,
    private plugin: StudyStudio,
    private q: Question,
    private context: string,
    private done?: () => void,
    private preview = false,
    private exam?:ExamResponseOptions,
    private retryCourse?:CourseContext,
  ) {
    super(el);
    if(!preview&&!exam)this.context=plugin.practiceContext(context);
  }
  onload() {
    const refreshReview=()=>this.plugin.reviews.decorate(this.containerEl,this.q.definition.id);
    this.plugin.reviews.listeners.add(refreshReview);this.register(()=>this.plugin.reviews.listeners.delete(refreshReview));
    this.rendering=true;
    if(!this.preview&&!this.exam){const key=draftKey(this.context,this.q.definition.id);const entry={key,questionId:this.q.definition.id,element:this.containerEl,busy:()=>this.editing>0||this.working||this.rendering,reload:()=>{const focused=this.containerEl.contains(this.containerEl.ownerDocument.activeElement);this.unload();this.load();if(focused)void this.ready?.then(()=>this.containerEl.focus());}};this.plugin.practiceCards.add(entry);this.register(()=>this.plugin.practiceCards.delete(entry));}
    this.ready=this.render().then(()=>this.plugin.reviews.decorate(this.containerEl,this.q.definition.id)).finally(()=>this.rendering=false);
    void this.ready.catch((e) =>
      this.containerEl.createEl("p", {
        text: errorText(e),
        cls: "study-error",
      }),
    );
  }
  private reviewsMenu(menu:Menu,q:Question,el:HTMLElement){this.plugin.reviews.questionMenu(menu,q,el,this.context);}
  async render() {
    const el = this.containerEl;
    el.empty();
    el.addClass("study-card");
    if(!this.exam)el.addClass('study-practice-card');
    const q = this.q,
      d = q.definition;
    if(!this.preview&&!this.exam){el.dataset.studyQuestionId=d.id;el.dataset.studyQuestionTitle=d.title;}
    const key = draftKey(this.context,d.id);
    const markOutcome=(outcome:string)=>{el.dataset.outcome=outcome;const section=el.closest<HTMLElement>('.study-practice-question');if(section)section.dataset.outcome=outcome;const navButton=el.closest('.study-practice-workspace')?.querySelector<HTMLElement>(`.study-practice-question-nav button[data-question-id="${d.id}"]`);if(navButton)navButton.dataset.outcome=outcome;};
    markOutcome('unanswered');

    const savedCompletion = this.preview ? undefined : this.plugin.completions[key];
    const completed = savedCompletion?.question && signature(savedCompletion.question)===signature(q) ? savedCompletion : undefined;
    const restored = this.preview ? undefined : restoreDraft(this.plugin.drafts[key],q);
    const started = restored?.started ?? new Date().toISOString(),
      order = this.exam?.order ?? completed?.choiceOrder ?? restored?.order ?? orderChoices(q),
      response: Response = structuredClone(this.exam?.response ?? completed?.response ?? restored?.response ?? { choices: [], blanks: {} });
    const mathIds = new Set(this.exam?.mathIds ?? restored?.mathIds ?? []);
    this.hasUnanswered=()=>{if(completed?.mode==='attempt')return false;if(d.type==='choice'||d.type==='ordering')return response.choices.length===0;if(d.type==='short-answer'||d.type==='drawing')return !response.blanks.response?.trim();return (d.answers??[]).some(a=>!response.blanks[a.id]?.trim());};

    let course:CourseContext = completed ? completed.course??null : restored ? restored.course??null : this.retryCourse??null;
    let courseInput:HTMLSelectElement|undefined;
    let draftRevision = 0;
    const persist = () => {
      if(this.exam){this.exam.changed(response,[...mathIds]);return;}
      if(this.preview) return;
      const revision = ++draftRevision;
      draftStatus.setText("Saving draft…");
      const draft:PracticeDraft = {course,version:1,signature:signature(q),started,order,response:structuredClone(response),mathIds:[...mathIds]};
      void this.plugin.putDraft(key,draft).then(() => {if(revision===draftRevision) draftStatus.setText("Draft saved locally");}, () => {if(revision===draftRevision) draftStatus.setText("Draft could not be saved. Keep this question open and try editing again.");});
    };
    const head = el.createDiv("study-card-heading");
    if(this.plugin.reviews.data.questions.some(r=>r.questionId===d.id&&r.context===this.context&&r.remove))head.createSpan({cls:'study-review-status',text:'Marked for removal'});
    const singleEmbed=el.parentElement?.matches('details.study-embed:not(.study-group)')?el.parentElement:undefined;
    if(!singleEmbed&&this.preview&&!this.exam)head.createEl("h3", { text: d.title });
    el.tabIndex=0;el.setAttribute('aria-label',this.preview&&!this.exam?d.title:'Question');el.setAttribute('aria-keyshortcuts','Control+Space Shift+F10');
    el.title='Right-click or Ctrl+Space for question actions';
    const draftStatus = head.createSpan({cls:"study-muted study-draft-status",text:restored ? "Draft restored" : ""});
    if(!this.preview && this.plugin.drafts[key] && !restored) draftStatus.setText("Question changed; previous draft was not applied.");
    const showMenu=(event:MouseEvent|KeyboardEvent)=>{
      event.preventDefault();event.stopPropagation();const menu=new Menu();
      const blocked=this.editing>0||this.working||this.rendering;
      const reveal=Array.from(el.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent==='Reveal without scoring');
      if(reveal)menu.addItem(item=>item.setTitle('1 · Reveal without scoring').setDisabled(blocked||reveal.disabled).onClick(()=>reveal.click()));
      if(!this.preview||this.exam)this.reviewsMenu(menu,q,el);
      if(!this.preview&&!this.exam){
        menu.addItem(item=>item.setTitle('2 · Reset question').setDisabled(blocked).onClick(()=>void this.plugin.resetPractice(this.context,[d.id]).catch(e=>new Notice(errorText(e)))));
        menu.addItem(item=>item.setTitle('3 · Edit question').setDisabled(blocked).onClick(()=>void this.plugin.openQuestion(d.id)));
        const sourcePath=this.plugin.practiceSource(this.context);
        if(sourcePath)menu.addItem(item=>item.setTitle('4 · Group or remove from note…').setDisabled(blocked).onClick(()=>void this.plugin.bank().then(bank=>manageNote(this.plugin.app,bank,id=>void this.plugin.openQuestion(id),d.id,sourcePath)).catch(e=>new Notice(errorText(e)))));
        if(courseInput)menu.addItem(item=>item.setTitle(`5 · Course: ${course?.title??'Unassigned'}…`).setDisabled(blocked||courseInput!.disabled).onClick(()=>{
          const choices=new Menu();for(const [index,option] of Array.from(courseInput!.options).entries())choices.addItem(item=>item.setTitle(`${index+1} · ${option.text}`).setChecked(option.value===courseInput!.value).onClick(()=>{courseInput!.value=option.value;courseInput!.dispatchEvent(new Event('change'));}));
          const rect=el.getBoundingClientRect();choices.showAtPosition({x:rect.left+20,y:Math.max(20,rect.top+20)});
        }));
      }
      menu.addSeparator();menu.addItem(item=>item.setTitle('6 · Question information').onClick(()=>{
        const modal=new Modal(this.plugin.app);modal.titleEl.setText(d.title);
        if(d.concepts.length)modal.contentEl.createEl('p',{text:'Concepts: '+d.concepts.join(' · ')});
        modal.contentEl.createEl('p',{text:'Course: '+(course?.title??'Unassigned')});
        modal.contentEl.createEl('p',{text:d.type==='choice'?'Scoring: exact selection; no partial credit.':d.type==='ordering'?'The complete correct sequence earns one point. Confirm or move a step before submitting.':d.type==='short-answer'||d.type==='drawing'?'Responses use rubric-based self-assessment.':d.type==='code'?'Code is case-sensitive and is not executed. Each blank is one point; whitespace follows the authored answer rules.':'Each blank has equal weight. Accepted alternatives are matched as text, not by symbolic equivalence.'});modal.open();
      }));
      if(!this.preview&&!this.exam){
        menu.addSeparator();menu.addItem(item=>item.setTitle('9 · Delete question everywhere…').setIcon('trash').setDisabled(blocked).onClick(()=>void this.plugin.deleteQuestions([d.id])));
        const path=this.plugin.practiceSource(this.context);
        if(path){menu.addItem(item=>item.setTitle('0 · Group questions on this note…').onClick(()=>void this.plugin.groupNoteQuestions(path)));menu.addItem(item=>item.setTitle('7 · Remove from this note…').setDisabled(blocked).onClick(()=>void this.plugin.removeNoteQuestions(path,[d.id])));menu.addItem(item=>item.setTitle('8 · Remove multiple questions from this note…').setDisabled(blocked).onClick(()=>void this.plugin.removeNoteQuestions(path)));}
      }
      const rect=el.getBoundingClientRect();menu.showAtPosition({x:'clientX' in event?event.clientX:rect.left+20,y:'clientY' in event?event.clientY:Math.max(20,rect.top+20)});
    };
    const menuKey=(event:KeyboardEvent)=>{if(!event.defaultPrevented&&!this.editing&&((event.ctrlKey&&!event.metaKey&&!event.altKey&&!event.shiftKey&&event.code==='Space')||(event.shiftKey&&event.key==='F10')))showMenu(event);};
    if(!this.preview||this.exam){
      this.registerDomEvent(el,'contextmenu',event=>{const field=(event.target as HTMLElement).closest('input,textarea,[contenteditable="true"],iframe');if(!field||!el.contains(field))showMenu(event);});
      this.registerDomEvent(el,'keydown',menuKey);
      const summary=singleEmbed?.querySelector('summary');if(summary){this.registerDomEvent(summary,'contextmenu',showMenu);this.registerDomEvent(summary,'keydown',menuKey);}
    }
    if(!this.preview){
      const label=el.createEl("label",{text:"Course for this attempt ",cls:"study-course-context"});
      label.hidden=true;
      courseInput=label.createEl("select",{attr:{"aria-label":"Course for this attempt"}});courseInput.createEl("option",{value:"",text:"Unassigned"});
      const catalog=await courses(this.plugin.app),options=catalog.filter(c=>(d.courseIds??[]).includes(c.course.id)).map(c=>({id:c.course.id,title:c.course.title}));
      if(course&&!options.some(c=>c.id===course!.id))options.push(course);
      if(!course&&!completed&&!restored&&options.length===1)course=options[0];
      for(const c of options)courseInput.createEl("option",{value:c.id,text:c.title});courseInput.value=course?.id??"";
      courseInput.onchange=()=>{course=options.find(c=>c.id===courseInput!.value)??null;persist();};
      if((d.courseIds??[]).some(id=>!catalog.some(c=>c.course.id===id)))el.createEl("p",{text:"Some assigned courses are missing; repair memberships to select them.",cls:"study-error"});
    }
    const prompt = el.createDiv("markdown-rendered");
    await RichMarkdown.render(
      this.plugin.app,
      q.prompt,
      prompt,
      q.path,
      this,
    );
    if((["short-answer","drawing"].includes(d.type))) {
      if(this.exam){writtenInput(this.plugin.app,el,q,response,this,persist,active=>this.editorBusy(active));return;}
      this.submitForSet=async()=>{if(completed?.mode==='attempt')return;if(this.editing||this.working)throw Error('Finish the open editor first.');response.reviewed=true;const record=makeAttempt(q,response,order,'attempt',this.context,started,crypto.randomUUID(),course);await this.plugin.saveAttempt(record);this.plugin.completions[key]=record;await this.plugin.putDraft(key,undefined);this.unload();this.load();await this.ready;};
      await writtenPractice(this.plugin.app,el,q,response,this,completed,this.preview,persist,async mode=>{
        const record=makeAttempt(q,response,order,mode,this.context,started,crypto.randomUUID(),course);
        if(!this.preview){await this.plugin.saveAttempt(record);this.plugin.completions[key]=record;++draftRevision;await this.plugin.putDraft(key,undefined).catch(()=>new Notice("Attempt saved; draft cleanup could not be saved."));}
        if(courseInput)courseInput.disabled=true;return record;
      },()=>{if(!this.preview)void this.plugin.resetPractice(this.context,[d.id]).catch(e=>new Notice(errorText(e)));else {this.unload();this.load();}},this.done,active=>this.editorBusy(active),markOutcome);
      if(completed&&courseInput)courseInput.disabled=true;return;
    }
    const controls: (HTMLInputElement | HTMLButtonElement | HTMLTextAreaElement)[] = [];
    const showAnswers = new Map<string, (answer: string, correct: boolean | undefined) => Promise<void>>();
    let sequence:Awaited<ReturnType<typeof orderingField>>|undefined;
    const choiceInputs = new Map<string, HTMLInputElement>();
    const addInput = (parent: HTMLElement, id: string, label: string, authoredMath = false) => {
      const wrap = parent.createSpan({ cls: "study-response-field" });
      const input = wrap.createEl("input", {
        type: "text",
        cls: "study-answer",
        attr: { "aria-label": label, autocomplete: "off" },
      });
      const preview = wrap.createEl("button", {cls:"study-response-preview study-answer markdown-rendered", attr:{type:"button", "aria-label":`Edit response: ${label}`}});
      preview.hidden = true;
      input.value = response.blanks[id] ?? "";
      const measure=wrap.createSpan({cls:'study-answer-measure',attr:{'aria-hidden':'true'}});
      const resize=()=>{measure.textContent=input.value||' ';const width=measure.getBoundingClientRect().width;input.style.width=`${Math.max(156,Math.ceil(width)+28)}px`;};
      this.register(()=>measure.remove());
      requestAnimationFrame(resize);
      let revision = 0, mathMode = mathIds.has(id);
      const update = (save = true) => {
        resize();
        response.blanks[id] = input.value;
        if(mathMode) mathIds.add(id);
        if(save) persist();
        const current = ++revision;
        preview.empty();
        const typed = equations(input.value.trim()).find(e=>e.from===0 && e.to===input.value.trim().length && !!e.body.trim());
        const rendered = (mathMode || !!typed) && !!input.value.trim() && input.ownerDocument.activeElement !== input;
        input.hidden = rendered;
        preview.hidden = !rendered;
        if (!rendered) return;
        preview.setText(input.value);
        const stage = preview.ownerDocument.createElement("span");
        void RichMarkdown.render(this.plugin.app, typed ? typed.raw : `$${input.value}$`, stage, q.path, this).then(() => {
          if (current === revision && preview.isConnected) {
            // A response is one equation, not a Markdown paragraph. Keep native
            // math but omit paragraph wrappers and their inherited line spacing.
            preview.replaceChildren(stage.querySelector('.math') ?? stage);
          }
        });
      };
      const openMath = () => {
        if(input.disabled) return;
        let mathActive = true;
        const editor = new AnswerMathEditor(this.plugin.app, equations(input.value.trim()).find(e=>e.from===0 && e.to===input.value.trim().length)?.body ?? input.value, q.path, value => {
          if (!input.isConnected || input.disabled) return;
          input.value = value; mathMode = true; update();
        }, () => {if(mathActive){mathActive=false;this.editorBusy(false);}queueMicrotask(() => (preview.hidden ? input : preview).focus());});
        this.editorBusy(true);
        editor.open();
        this.register(() => editor.close());
      };
      preview.onclick = () => {
        if(input.disabled || preview.disabled)return;
        if(mathMode && !equations(input.value.trim()).some(e=>e.from===0 && e.to===input.value.trim().length))input.value=`$${input.value}$`;
        mathMode=false;mathIds.delete(id);
        ++revision;preview.hidden=true;input.hidden=false;input.focus();
        input.setSelectionRange(input.value.length,input.value.length);update();
      };
      input.oninput = () => update();
      input.onblur = () => update(false);
      input.onkeydown = event => {
        if(event.ctrlKey && event.code === "KeyM") { event.preventDefault(); event.stopPropagation(); openMath(); }
      };
      preview.onkeydown = input.onkeydown;
      showAnswers.set(id, async (answer, correct) => {
        ++revision; // Invalidate any pending draft preview without altering the response.
        input.hidden = true;
        preview.hidden = false;
        preview.disabled = true;
        preview.setAttribute("aria-label", `Correct answer: ${label}`);
        preview.empty();
        wrap.addClass(correct === undefined ? "study-answer-revealed" : correct ? "study-answer-correct" : "study-answer-incorrect");
        const wrapped = answer.trim().startsWith("$");
        const isMath = authoredMath || mathMode || /[\\^_]/.test(answer);
        await RichMarkdown.render(this.plugin.app, wrapped || !isMath ? answer : `$${answer}$`, preview, q.path, this);
        wrap.createSpan({cls:"study-answer-result", text:correct === undefined ? "Answer" : correct ? "✓ Correct" : "✗ Corrected"});
      });
      controls.push(input, preview);
      update(false);
      return input;
    };
    if (d.type === "blank") {
      const doc = el.ownerDocument,
        walker = doc.createTreeWalker(prompt, 4);
      const nodes: Text[] = [];
      let node: Node | null;
      while ((node = walker.nextNode()))
        if (node.textContent?.includes("{{blank:")) nodes.push(node as Text);
      let count = 0;
      for (const node of nodes) {
        if (node.parentElement?.closest("code,pre,mjx-container")) continue;
        const value = node.textContent!;
        const frag = doc.createElement("span");
        let last = 0;
        for (const m of value.matchAll(/\{\{blank:([\w-]+)\}\}/g)) {
          frag.appendText(value.slice(last, m.index));
          addInput(frag, m[1], `Blank ${++count}`,!!d.answers?.find(a=>a.id===m[1])?.math);
          last = m.index! + m[0].length;
        }
        frag.appendText(value.slice(last));
        node.replaceWith(frag);
      }
      if (count !== d.answers!.length)
        throw new Error(
          "Place blank markers in ordinary prose, outside math and code.",
        );
    }
    if(d.type === "ordering"){
      sequence=await orderingField(this.plugin.app,el,q,response.choices.length?response.choices:order,this,ids=>{response.choices=ids;persist();});controls.push(...sequence.buttons);
    }
    if (d.type === "choice") {
      const group = el.createEl("fieldset", { cls: "study-options" }),
        groupName = `choice-${crypto.randomUUID()}`;
      group.setAttribute('aria-label',d.correct!.length>1?'Select all correct answers':'Choose one answer');
      for (const id of order) {
        const option = d.choices!.find((c) => c.id === id)!;
        const label = group.createEl("label", { cls: "study-option" });
        const input = label.createEl("input", {
          type: d.correct!.length > 1 ? "checkbox" : "radio",
          attr: { name: groupName },
        });
        input.checked = response.choices.includes(id);
        choiceInputs.set(id, input);
        input.onchange = () => {
          if (d.correct!.length === 1) {
            for (const c of controls)
              if (
                c instanceof el.ownerDocument.defaultView!.HTMLInputElement &&
                c !== input
              )
                c.checked = false;
            response.choices = input.checked ? [id] : [];
          } else
            response.choices = input.checked
              ? [...response.choices.filter((x) => x !== id), id]
              : response.choices.filter((x) => x !== id);
          persist();
        };
        controls.push(input);
        const text = label.createDiv("markdown-rendered");
        await RichMarkdown.render(
          this.plugin.app,
          option.text,
          text,
          q.path,
          this,
        );
      }
    }
    if(d.type==="diagram") renderDiagram(this.plugin.app,el,d.diagram!,q.path,(host,id,i)=>addInput(host,id,`Label ${i+1}`,!!d.diagram!.labels[i].math));
    if(d.type==="code"){
      await renderCode(el,d.code!,(host,id)=>{
        const answer=d.answers!.find(a=>a.id===id)!,input=host.createEl('textarea',{cls:'study-code-answer',attr:{'aria-label':answerLabel(q,id),spellcheck:'false'}});
        input.rows=Math.max(1,Math.min(16,answer.accepted[0].split('\n').length));input.cols=Math.max(10,Math.min(70,Math.max(...answer.accepted[0].split('\n').map(l=>l.length))));input.value=response.blanks[id]??'';
        input.oninput=()=>{response.blanks[id]=input.value;persist();};
        input.onkeydown=e=>{if(e.key==='Enter'&&!e.ctrlKey&&!e.metaKey)e.stopPropagation();};
        controls.push(input);showAnswers.set(id,async(value,correct)=>{input.value=value;input.rows=Math.max(1,value.split('\n').length);host.addClass(correct===undefined?'study-code-revealed':correct?'study-answer-correct':'study-answer-incorrect');host.createSpan({cls:'study-answer-result',text:correct===undefined?'Answer':correct?'✓ Correct':'✗ Corrected'});});
      });
    }
    if (d.type === "table") {
      const wrap = el.createDiv("study-table-wrap"),
        table = wrap.createEl("table");
      const head = table.createEl("thead").createEl("tr");
      for (const h of d.table!.columns)
        await RichMarkdown.render(
          this.plugin.app,
          h,
          head.createEl("th", { attr: { scope: "col" } }),
          q.path,
          this,
        );
      const body = table.createEl("tbody");
      let r = 0;
      for (const row of d.table!.rows) {
        const tr = body.createEl("tr");
        r++;
        for (let c = 0; c < row.length; c++) {
          const cell = row[c],
            td = tr.createEl("td");
          if (cell.blank)
            addInput(td, cell.blank, `Row ${r}, ${d.table!.columns[c]}`, !!cell.sourceText?.includes("$"));
          else
            await RichMarkdown.render(
              this.plugin.app,
              cell.text ?? "",
              td,
              q.path,
              this,
            );
        }
      }
    }
    if(this.exam) return;
    const hint = el.createEl("p", {
      cls: "study-muted",
      text:
        d.type === "ordering" ? "Scoring: the complete correct sequence earns one point. Confirm or move a step before submitting; an untouched sequence is unanswered." : d.type === "choice"
          ? "Scoring: exact selection; no partial credit."
          : d.type==="code" ? "Code is case-sensitive and is not executed. Each blank is one point. Exact whitespace unless its answer rule explicitly allows trimming outer whitespace." : "Scoring: equal weight per blank; accepted text alternatives, not symbolic equivalence.",
    });
    hint.hidden=true;
    const actions = el.createDiv("study-actions"),
      submit = actions.createEl("button", {
        text: "Check answer · Ctrl+Enter",
        cls: "mod-cta",
      }),
      reveal = actions.createEl("button", { text: "Reveal without scoring" });
    reveal.hidden=true;
    const feedback = el.createDiv("study-feedback");
    feedback.setAttribute("aria-live", "polite");
    let busy = false,
      finished = false;
    const finish = async (mode: Attempt["mode"], prior?: Attempt) => {
      if (busy || finished) return;
      busy = true;this.working=true;
      submit.disabled = reveal.disabled = true;
      controls.forEach((c) => (c.disabled = true));
      if(courseInput)courseInput.disabled=true;
      feedback.setText(this.preview ? "Checking preview…" : "Saving locally…");
      try {
        const record = prior ?? makeAttempt(
          q,
          response,
          order,
          mode,
          this.context,
          started,
          crypto.randomUUID(),
          course,
        );
        if (!this.preview && !prior) {
          await this.plugin.saveAttempt(record);
          this.plugin.completions[key] = record;
          ++draftRevision;
          void this.plugin.putDraft(key,undefined).catch(() => new Notice("Attempt saved, but the old draft could not be cleared."));
        }
        draftStatus.empty();
        finished = true;
        feedback.empty();
        const outcome=!record.grade||record.grade.pending?'unanswered':record.grade.earned===record.grade.possible?'correct':record.grade.earned>0?'partial':'incorrect';
        markOutcome(outcome);
        hint.remove();
        feedback.createEl("strong", {
          text: record.grade
            ? `${record.grade.earned} / ${record.grade.possible} correct`
            : "Answer revealed — not scored",
        });
        const original = feedback.createDiv("study-original-response");
        original.createEl("div", {text:"Your answer", cls:"study-original-response-label"});
        const renderOriginal = async (value:string, label?:string) => {
          const row=original.createDiv("study-original-response-row");
          if(label)row.createEl("span",{text:label,cls:"study-original-response-label"});
          if(!value.trim())row.createEl("span",{text:"No answer given",cls:"study-muted"});
          else await RichMarkdown.render(this.plugin.app,value,row.createDiv("markdown-rendered"),q.path,this);
        };
        if(d.type==='choice'||d.type==='ordering') {
          const selected=record.response.choices.map(id=>d.choices?.find(c=>c.id===id)?.text??id);
          if(!selected.length)await renderOriginal('');
          else for(const [index,value] of selected.entries())await renderOriginal(value,d.type==='ordering'?`${index+1}.`:undefined);
        } else {
          for(const a of d.answers??[]) {
            const value=record.response.blanks[a.id]??'';
            const rendered=d.type==='code'&&value.trim()?codeFence(value,d.code!.language):a.math&&value.trim()&&!value.startsWith('$')?`$${value}$`:value;
            await renderOriginal(rendered,(d.answers?.length??0)>1?answerLabel(q,a.id):undefined);
          }
        }
        const expected = feedback.createDiv("study-corrections");
        if(d.type === "ordering"){sequence!.solution(d.correct!);}
        else if (d.type === "choice") {
          for (const [id, input] of choiceInputs) input.checked = d.correct!.includes(id);
          for (const id of d.correct!) {
            const part = expected.createDiv("markdown-rendered");
            await RichMarkdown.render(
              this.plugin.app,
              `✓ ${d.choices!.find((c) => c.id === id)!.text}`,
              part,
              q.path,
              this,
            );
          }
        } else
          for (const a of d.answers!) {
            const correct = record.grade?.details.find(
              (x) => x.id === a.id,
            )?.correct;
            const displayed = d.type==="code"?a.accepted[0]:a.accepted.find(value => /[\\$]/.test(value)) ?? a.accepted[0];
            await showAnswers.get(a.id)?.(displayed, correct);
            const part = expected.createDiv("markdown-rendered");
            await RichMarkdown.render(
              this.plugin.app,
              d.type==="code" ? `**${answerLabel(q,a.id)} — accepted alternatives**\n\n`+a.accepted.map(v=>codeFence(v,d.code!.language)).join("\n\n") : `${correct ? "✓" : "→"} **${answerLabel(q, a.id)}:** ${a.accepted.map(v=>d.type==="diagram"&&d.diagram!.labels.find(l=>l.id===a.id)?.math&&!v.startsWith("$")?`$${v}$`:v).join(" / ")}`,
              part,
              q.path,
              this,
            );
          }
        if (q.explanation) {
          feedback.createEl("h4", { text: "Explanation" });
          await RichMarkdown.render(
            this.plugin.app,
            q.explanation,
            feedback.createDiv("markdown-rendered"),
            q.path,
            this,
          );
        }
        feedback.createEl("p", {
          text: (d.type === "ordering" ? "The correct sequence is now shown. " : d.type === "choice" ? "Correct choices are now selected. " : "Correct answers are now shown in the fields. ") + (this.preview ? "Preview only — no attempt saved." : "Your original responses were saved to local review history."),
          cls: "study-muted",
        });
        if (this.done) {
          const next = feedback.createEl("button", {
            text: "Next question",
            cls: "mod-cta",
          });
          next.onclick = this.done;
          if(!prior)next.focus();
        } else {
          const again = feedback.createEl("button", { text: "Try again" });
          if(!prior)again.focus();
          again.onclick = () => {
            if(!this.preview)void this.plugin.resetPractice(this.context,[d.id]).catch(e=>new Notice(errorText(e)));
            else {this.unload();this.load();}
          };
        }
      } catch (e) {
        feedback.setText(
          `Could not finish: ${errorText(e)}. Your answers are still here.`,
        );
        controls.forEach((c) => (c.disabled = false));
        if(courseInput)courseInput.disabled=false;
        submit.disabled = reveal.disabled = false;
      } finally {
        busy = false;this.working=false;
      }
    };
    this.submitForSet=async()=>{if(this.editing||this.working)throw Error("Finish the open editor first.");await finish("attempt");};
    if(completed) await finish(completed.mode,completed);
    submit.onclick = () => void finish("attempt");
    reveal.onclick = () => void finish("reveal");
    this.registerDomEvent(
      el.ownerDocument,
      "keydown",
      (e: KeyboardEvent) => {
        if (
          el.contains(e.target as Node) && !el.closest('.study-removal-mode') &&
          (e.metaKey || e.ctrlKey) &&
          e.key === "Enter"
        ) {
          e.preventDefault();
          e.stopPropagation();
          void finish("attempt");
        }
      },
      true,
    );
  }
}
class PickQuestion extends FuzzySuggestModal<Question> {
  constructor(
    private plugin: StudyStudio,
    private questions: Question[],
    private choose: (q: Question) => void,
  ) {
    super(plugin.app);
    this.setPlaceholder("Find a question by title or concept…");
  }
  getItems() {
    return this.questions;
  }
  getItemText(q: Question) {
    return `${q.definition.title} · ${q.definition.concepts.join(", ")} · ${q.definition.type}`;
  }
  onChooseItem(q: Question) {
    this.choose(q);
  }
}
class CreateQuestion extends Modal {
  private sourceText?:string;
  private selectionFrom=0;
  private selectionTo=0;
  constructor(
    private plugin: StudyStudio,
    private editor?: Editor,
    private source?: TFile,
  ) {
    super(plugin.app);
    // Capture before the modal takes focus away from the Markdown editor.
    this.sourceText=editor?.getValue();
    if(editor){this.selectionFrom=editor.posToOffset(editor.getCursor('from'));this.selectionTo=editor.posToOffset(editor.getCursor('to'));}
  }
  onOpen() {
    this.modalEl.addClass("study-create-question");
    this.titleEl.setText("New question");
    const sourceText=this.sourceText;
    const from=this.selectionFrom,to=this.selectionTo;
    const intake = calloutSelection(sourceText ?? "", from, to);
    const selected = intake.text;
    const selectionEnd = intake.insertionEnd;
    let detectedTable = false;
    try { detectedTable = !!selectedTable(selected); } catch {}
    let title = "", kind: Kind = detectedTable ? "table" : "choice";
    const existingGroups=embeds(sourceText??"").filter(e=>e.group);let targetGroup=-1;
    let titleInput:HTMLInputElement|undefined;
    new Setting(this.contentEl).setName("Title").addText(t=>{titleInput=t.inputEl;t.setPlaceholder("e.g. Velocity gradient").onChange(v=>title=v);});
    const placement=this.contentEl.createEl("details");placement.hidden=!existingGroups.length;placement.createEl("summary",{text:"Add to an existing group (optional)"});
    if(existingGroups.length)new Setting(placement).setName("Place question").addDropdown(d=>{d.addOption("-1","Individual card after selection");existingGroups.forEach((g,i)=>d.addOption(String(i),g.title));d.onChange(v=>targetGroup=Number(v));});

    const types: [Kind,string][]=[['choice','Multiple choice'],['blank','Fill in the blank'],['table','Complete the table'],['code','Complete the code'],['diagram','Label the diagram'],['ordering','Put steps in order'],['short-answer','Short answer / essay'],['drawing','Drawing response']];
    let typeSelect:HTMLSelectElement;
    new Setting(this.contentEl).setName('Question type').setDesc('Tab here, then press 1–8 to choose.').addDropdown(d=>{
      typeSelect=d.selectEl;types.forEach(([id,label],i)=>d.addOption(id,`${i+1} · ${label}`));d.setValue(kind).onChange(v=>kind=v as Kind);
      d.selectEl.addEventListener('keydown',e=>{const index=Number(e.key)-1;if(!e.ctrlKey&&!e.metaKey&&!e.altKey&&/^[1-8]$/.test(e.key)){e.preventDefault();kind=types[index][0];d.setValue(kind);}});
    });
    types.forEach(([id],i)=>this.scope.register([],String(i+1),()=>{
      const active=this.contentEl.ownerDocument.activeElement as HTMLElement|null;
      if(active?.matches('input,textarea')||active?.isContentEditable)return true;
      kind=id;typeSelect.value=id;return false;
    }));
    this.contentEl.createEl("p", {
      text: "Ctrl+Enter continues. Your selection stays in the note; saving adds a question after it.",
    });
    new Setting(this.contentEl).addButton((b) =>
      b
        .setButtonText("Continue to question editor")
        .setCta()
        .onClick(async () => {
          if (!title.trim()) {
            new Notice("Enter a question title.");
            return;
          }
          b.setDisabled(true);
          try {
            const destination=await chapterDestination(this.app,this.source);
            const id = crypto.randomUUID();
            const path = `${destination.folder}/${
              title
                .replace(/[\\/:*?"<>|#[\]]/g, "-")
                .trim()
                .slice(0, 80) || "Question"
            }-${id.slice(0, 8)}.md`;
            const draft = intakeDraft(kind, id, title.trim(), selected, path);
            if(destination.scope)draft.definition.courseIds=[destination.scope.courseId];
            if(destination.placement)draft.definition.chapters=[destination.placement];
            this.close();
            new QuestionEditor(
              this.app, {path}, draft,
              (el, q) => new Card(el, this.plugin, q, "author-preview", undefined, true),
              async raw => {
                // Obsidian may detach/reuse an editor when its note loses the active tab.
                // Resolve the source by file at save time instead of retaining that editor handle.
                const sourceView=this.source?this.app.workspace.getLeavesOfType('markdown').map(leaf=>leaf.view).find((view):view is MarkdownView=>view instanceof MarkdownView&&view.file?.path===this.source!.path):undefined;
                const sourceEditor=sourceView?.getMode()==='source'?sourceView.editor:undefined;
                const currentSource=this.source?(sourceEditor?.getValue()??await this.app.vault.read(this.source)):undefined;
                const canInsert=sourceText!==undefined&&currentSource===sourceText;
                await this.plugin.ensureFolder(destination.folder);
                const f = await this.app.vault.create(path, raw);
                await this.plugin.indexCreatedQuestion(f);
                if(this.source&&sourceText!==undefined&&canInsert){
                  const insertion=targetGroup<0?cardInsertion(sourceText,selectionEnd,id):{at:existingGroups[targetGroup].start,text:embedSource([...existingGroups[targetGroup].ids,id],existingGroups[targetGroup].title,existingGroups[targetGroup].prompt)};
                  try{
                    if(sourceEditor){
                      if(sourceEditor.getValue()!==sourceText)throw Error('Source changed during save');
                      sourceEditor.replaceRange(insertion.text,sourceEditor.offsetToPos(insertion.at),targetGroup<0?undefined:sourceEditor.offsetToPos(existingGroups[targetGroup].end));
                    }else await this.app.vault.process(this.source,current=>{
                      if(current!==sourceText)throw Error('Source changed during save');
                      const end=targetGroup<0?insertion.at:existingGroups[targetGroup].end;
                      return current.slice(0,insertion.at)+insertion.text+current.slice(end);
                    });
                  }catch{new Notice('Question saved. The source note changed; use Insert question card to link it.',10000);}
                }
                if(this.source&&!canInsert)new Notice('Question saved. The note changed while you were editing; use Insert question card to choose its placement.',10000);
                return f;
              },
            ).open();
          } catch (e) {
            new Notice(errorText(e));
            b.setDisabled(false);
          }
        }),
    );
    this.scope.register(["Ctrl"], "Enter", () => {
      this.contentEl.querySelector<HTMLButtonElement>("button.mod-cta:not(:disabled)")?.click();
      return false;
    });
    titleInput?.focus();
  }
  onClose() {
    this.contentEl.empty();
  }
}
class ReviewSetup extends Modal {
  constructor(
    private plugin: StudyStudio,
    private questions: Question[],
    private context: string,
  ) {
    super(plugin.app);
  }
  onOpen() {
    this.titleEl.setText("Start review");
    let count = 1;
    const families = new Set(
      this.questions.map((q) => q.definition.familyId ?? q.definition.id),
    );
    this.contentEl.createEl("p", {
      text: `${this.questions.length} variants across ${families.size} question families. Choose how many variants from each family to include. Selection is random, without repeats.`,
    });
    new Setting(this.contentEl)
      .setName("Variants per family")
      .addDropdown((d) =>
        d
          .addOptions({
            "1": "One",
            "2": "Up to two",
            "3": "Up to three",
            "999999": "All",
          })
          .onChange((v) => (count = Number(v))),
      );
    new Setting(this.contentEl).addButton((b) =>
      b
        .setButtonText("Start review")
        .setCta()
        .onClick(() => {
          const selected = selectVariants(this.questions, count);
          this.close();
          new Review(this.plugin, selected, this.context).open();
        }),
    );
  }
  onClose() {
    this.contentEl.empty();
  }
}
class Review extends Modal {
  private index = 0;
  private card?: Card;
  constructor(
    private plugin: StudyStudio,
    private questions: Question[],
    private context: string,
  ) {
    super(plugin.app);
    this.modalEl.addClass("study-review-modal");
  }
  onOpen() {
    this.show();
  }
  show() {
    this.card?.unload();
    this.contentEl.empty();
    if (this.index >= this.questions.length) {
      this.titleEl.setText("Review complete");
      this.contentEl.createEl("p", {
        text: `You reviewed ${this.questions.length} questions. Scored attempts and unscored reveals are saved separately in local history.`,
      });
      return;
    }
    this.titleEl.setText(`Review ${this.index + 1} / ${this.questions.length}`);
    const host = this.contentEl.createDiv();
    this.card = new Card(
      host,
      this.plugin,
      this.questions[this.index],
      this.context,
      () => {
        this.index++;
        this.show();
      },
    );
    this.card.load();
    const skip = this.contentEl.createEl("button", {
      text: "Skip question",
      cls: "study-skip",
    });
    skip.onclick = () => {
      this.index++;
      this.show();
    };
  }
  onClose() {
    this.card?.unload();
    this.contentEl.empty();
  }
}
export default class StudyStudio extends Plugin {
  private configurePractice(questions:Question[],title='Practice',course?:CourseContext){
    const setup=new Modal(this.app);setup.titleEl.setText('Practice settings');
    setup.contentEl.createEl('p',{text:`${title} · ${questions.length} questions`});
    let randomize=false;let required:1|2=1;
    new Setting(setup.contentEl).setName('Question order').addDropdown(select=>select.addOption('chapter','Chapter order').addOption('random','Random order').setValue('chapter').onChange(value=>randomize=value==='random'));
    new Setting(setup.contentEl).setName('Clear missed questions after').addDropdown(select=>select.addOption('1','One correct answer').addOption('2','Two consecutive correct answers').setValue('1').onChange(value=>required=value==='2'?2:1));
    new Setting(setup.contentEl).addButton(button=>button.setButtonText('Cancel').onClick(()=>setup.close())).addButton(button=>button.setButtonText('Start practice').setCta().setDisabled(!questions.length).onClick(()=>{setup.close();const ordered=chapterOrder(questions);const context=`practice-set:${course?.id??'unassigned'}:${crypto.randomUUID()}`;this.openPracticePage(randomize?shuffledPractice(ordered):ordered,title,course,undefined,questions.length,context,undefined,{fullIds:ordered.map(q=>q.definition.id),rootContext:context,required,randomize,round:0,streaks:{}});}));
    setup.open();
  }
  private async openPracticePage(questions:Question[],title='Practice',course?:CourseContext,provided?:StudioPanel,expected=questions.length,savedContext?:string,submittedStamp?:string,reviewState?:PracticeReviewState){
    const context=savedContext??`practice-set:${course?.id??'unassigned'}:${crypto.randomUUID()}`;
    const frozenFile=this.app.vault.getAbstractFileByPath(practiceSessionPath(context));
    if(frozenFile instanceof TFile){await this.showFrozenPractice(parsePracticeSession(await this.app.vault.read(frozenFile)),provided);return;}
    const review=reviewState??{fullIds:questions.map(q=>q.definition.id),rootContext:context,required:1 as const,randomize:false,round:0,streaks:{}};
    const panel=provided??new StudioPanel(this.app);panel.restoration={review,kind:'practice-set',title,course:course??null,context,submittedStamp,questionIds:questions.map(q=>q.definition.id)};
    panel.titleEl.setText(title);panel.modalEl.addClass('study-practice-page');const root=panel.contentEl;root.empty();
    const gradeHost=root.createDiv();const top=root.createDiv('study-practice-page-header');top.createEl('p',{text:`${course?.title?course.title+' · ':''}${questions.length} questions · Practice`,cls:'study-muted'});
    top.createEl('p',{text:'Check answers individually, or submit the whole set at the bottom. Practice does not contribute to assessment grades.',cls:'study-muted'});
    if(questions.some(q=>q.definition.type==='short-answer'))top.createEl('p',{text:'Ctrl/Cmd+Enter submits a response for self-assessment. Ctrl+M edits math. Responses are saved locally as drafts.',cls:'study-muted'});
    if(questions.some(q=>q.definition.type==='drawing'))top.createEl('p',{text:'For drawings, use Done (Ctrl/Cmd+Enter) before submitting for self-assessment. Strokes are saved locally as drafts.',cls:'study-muted'});
    if(expected!==questions.length)top.createEl('p',{text:`${expected-questions.length} questions are no longer available.`,cls:'study-error'});
    top.createEl('button',{text:'New set attempt'}).onclick=()=>{void this.bank().then(bank=>{const full=review.fullIds.flatMap(id=>{const q=bank.find(q=>q.definition.id===id);return q?[q]:[];});this.configurePractice(full,title,course);});};
    panel.copyLink=()=>{void navigator.clipboard.writeText(practiceLink(this.app.vault.getName(),{title,ids:review.fullIds,course:course?.id})).then(()=>new Notice('Practice set link copied. Opens the set without sharing your answers.'),()=>new Notice('Could not copy the practice link.'));};
    if(review.round)top.createEl('p',{text:`Review round ${review.round} · Clear each question after ${review.required===1?'one correct answer':'two consecutive correct answers'}. The original set score is unchanged.`,cls:'study-muted'});
    const layout=root.createDiv('study-practice-workspace'),nav=layout.createEl('nav',{cls:'study-practice-question-nav',attr:{'aria-label':'Practice questions'}}),body=layout.createDiv('study-practice-question-list');
    const items=questions.map(q=>{const section=body.createEl('section',{cls:'study-practice-question'}),number=section.createDiv('study-practice-question-number'),host=section.createDiv();const card=new Card(host,this,q,context,undefined,false,undefined,course);panel.addChild(card);return {q,section,number,host,card};});
    const arrange=(ordered:Question[])=>{questions=ordered;nav.empty();ordered.forEach((q,i)=>{const item=items.find(x=>x.q.definition.id===q.definition.id)!;body.appendChild(item.section);item.number.setText(`Question ${i+1}`);nav.createEl('button',{text:String(i+1),attr:{'aria-label':`Question ${i+1}`,'data-question-id':q.definition.id}}).onclick=()=>{item.section.scrollIntoView({behavior:'smooth',block:'start'});item.host.focus({preventScroll:true});};});panel.restoration={review,kind:'practice-set',title,course:course??null,context,submittedStamp,questionIds:ordered.map(q=>q.definition.id)};this.app.workspace.requestSaveLayout();};
    arrange(questions);
    const finish=root.createDiv('study-practice-finish');const completion=finish.createEl('p');const submitSet=finish.createEl('button',{text:'Submit practice',cls:'mod-cta'});
    const reviewActions=finish.createDiv('study-review-actions');
    const summary=()=>practiceCompletion(questions.map(q=>{const record=this.completions[draftKey(context,q.definition.id)];return record&&signature(record.question)===signature(q)?record:undefined;}));
    let submitting=false;
    const update=()=>{const result=summary();const ready=result.ready&&questions.length===expected;submitSet.disabled=submitting||questions.length!==expected||!questions.length;completion.setText(`${result.completed} / ${expected} questions checked and graded`);gradeHost.empty();if(ready&&(submittedStamp==='submitted'||submittedStamp===result.stamp)){finalGrade(gradeHost,result.earned,result.possible);submitSet.disabled=true;submitSet.setText('Practice submitted');}else submitSet.setText('Submit practice');
      reviewActions.empty();
      if(ready&&submittedStamp){
        const next=nextReview(questions.map(q=>q.definition.id),questions.map(q=>this.completions[draftKey(context,q.definition.id)]),review);
        if(next.remaining.length){
          reviewActions.createEl('p',{text:`${next.remaining.length} questions remaining to review.`});
          const button=reviewActions.createEl('button',{text:review.round?'Continue review':'Practice missed questions',cls:'mod-cta'});
          button.onclick=()=>{button.disabled=true;const selected=chapterOrder(questions.filter(q=>next.remaining.includes(q.definition.id)));this.openPracticePage(review.randomize?shuffledPractice(selected):selected,title,course,undefined,selected.length,`practice-review:${review.rootContext}:${crypto.randomUUID()}`,undefined,next.state);};
        }else reviewActions.createEl('p',{text:review.round?'Review complete. Start a new set attempt to test the full chapter again.':'All questions correct. No missed questions to review.'});
      }
    };
    const submitAll=async()=>{if(submitting)return;submitting=true;update();try{for(const item of items){await item.card.ready;await item.card.submitForSet?.();const record=this.completions[draftKey(context,item.q.definition.id)];if(!record||record.mode!=='attempt')throw Error('A response could not be saved. Retry submission.');}if(!summary().ready){new Notice('Complete the rubric assessment for written responses, then submit the set.');return;}
      const frozen=freezePractice(context,title,course,review,questions.map(q=>this.completions[draftKey(context,q.definition.id)]));
      await this.ensureFolder(PRACTICE_SESSIONS);
      const path=practiceSessionPath(context);
      if(!this.app.vault.getAbstractFileByPath(path))await this.app.vault.create(path,JSON.stringify(frozen,null,2)+'\n');
      items.forEach(item=>panel.removeChild(item.card));
      this.practiceResultListeners.delete(update);
      await this.showFrozenPractice(frozen,panel);
      panel.titleEl.scrollIntoView({block:'start'});
      submittedStamp='submitted';panel.restoration={kind:'practice-frozen',context};this.app.workspace.requestSaveLayout();gradeHost.scrollIntoView({behavior:'smooth',block:'start'});}catch(e){new Notice(errorText(e));}finally{submitting=false;update();if(!summary().ready&&submittedStamp)completion.setText('Submitted. Written responses awaiting rubric assessment.');}};
    submitSet.onclick=()=>{void (async()=>{await Promise.all(items.map(item=>item.card.ready));const missing=items.flatMap((item,i)=>item.card.hasUnanswered?.()?[i+1]:[]);if(!missing.length){await submitAll();return;}const warning=new Modal(this.app);warning.titleEl.setText('Unanswered questions');warning.contentEl.createEl('p',{text:`Questions ${missing.join(', ')} have unanswered fields. These will receive zero credit; completed fields still earn their normal credit.`});new Setting(warning.contentEl).addButton(b=>b.setButtonText('Return to questions').onClick(()=>warning.close())).addButton(b=>b.setButtonText('Submit anyway').setCta().onClick(()=>{warning.close();void submitAll();}));warning.open();})().catch(e=>new Notice(errorText(e)));};
    this.practiceResultListeners.add(update);panel.register(()=>this.practiceResultListeners.delete(update));update();
    if(!provided)panel.open();this.app.workspace.requestSaveLayout();
  }
  private async showFrozenPractice(session:PracticeSession,provided?:StudioPanel){
    const panel=provided??new StudioPanel(this.app);panel.restoration={kind:'practice-frozen',context:session.context};if(!provided)panel.open();
    await recordedResponse(this.app,{kind:'practice',path:practiceSessionPath(session.context),raw:''},undefined,session,panel);
    const actions=panel.contentEl.createDiv('study-review-actions');
    actions.createEl('button',{text:'New set attempt'}).onclick=()=>{void this.bank().then(bank=>this.configurePractice(session.review.fullIds.flatMap(id=>{const q=bank.find(q=>q.definition.id===id);return q?[q]:[];}),session.title,session.course));};
    const next=nextReview(session.attempts.map(a=>a.questionId),session.attempts,session.review);
    if(next.remaining.length){actions.createEl('p',{text:`${next.remaining.length} questions remaining to review.`});actions.createEl('button',{text:session.review.round?'Continue review':'Practice missed questions',cls:'mod-cta'}).onclick=()=>{const selected=chapterOrder(session.attempts.filter(a=>next.remaining.includes(a.questionId)).map(a=>a.question));void this.openPracticePage(session.review.randomize?shuffledPractice(selected):selected,session.title,session.course,undefined,selected.length,`practice-review:${session.review.rootContext}:${crypto.randomUUID()}`,undefined,next.state);};}
    else actions.createEl('p',{text:session.review.round?'Review complete.':'All questions correct.'});
    if(!provided)panel.open();this.app.workspace.requestSaveLayout();
  }
  private questionIndex!: QuestionIndex;
  private authoredPaths=new Set<string>();
  async indexCreatedQuestion(file:TFile){this.authoredPaths.add(file.path);this.questionIndex.invalidate(file.path);await this.questionIndex.ready();}
  private examWindows=new Set<string>();
  private async examFiles(){return this.app.vault.getMarkdownFiles().filter(f=>(f.path.startsWith(`${ROOT}/Exams/`)||!!this.app.metadataCache.getFileCache(f)?.frontmatter?.studyExam));}
  private async launchExam(exam:ExamDefinition){
    const course=await chooseCourse(this.app,exam.courseIds);if(course===undefined)return;
    const session=createSession(exam,await this.bank(),crypto.randomUUID(),Math.random,course);
    await this.writeExamSession(session);this.showExam(session);
  }
  private async writeExamSession(session:ExamSession){
    const folder=`${ROOT}/Exam sessions`;await this.ensureFolder(folder);
    const path=`${folder}/${session.id}.json`,file=this.app.vault.getAbstractFileByPath(path),raw=JSON.stringify(session,null,2)+"\n";
    if(file instanceof TFile)await this.app.vault.modify(file,raw);else await this.app.vault.create(path,raw);
  }
  private showExam(session:ExamSession){
    if(this.examWindows.has(session.id)){new Notice("That exam session is already open.");return;}
    this.examWindows.add(session.id);
    new ExamRunner(this.app,session,s=>this.writeExamSession(s),(el,q,options)=>new Card(el,this,q,`exam:${session.id}`,undefined,true,options),()=>this.examWindows.delete(session.id),this.reviews).open();
  }
  private async editExam(file?:TFile){
    const original=file?await this.app.vault.read(file):undefined,exam=original?parseExam(original):newExam();
    new ExamEditor(this.app,exam,await this.bank(),async edited=>{
      createSession(edited,await this.bank(),"validation");
      const raw=original?replaceExam(original,edited):serializeExam(edited);
      if(file)await this.app.vault.process(file,current=>{if(current!==original)throw Error("Exam changed outside this editor. Reopen it before saving.");return raw;});
      else {await this.ensureFolder(`${ROOT}/Exams`);const created=await this.app.vault.create(`${ROOT}/Exams/${edited.title.replace(/[\\/:*?"<>|]/g,"-")}-${edited.id}.md`,raw);await this.app.workspace.getLeaf("tab").openFile(created);}
    }).open();
  }
  drafts: Record<string, PracticeDraft> = {};
  completions: Record<string, Attempt> = {};
  private noteLocations:Record<string,string>={};
  practiceSource(context:string){return Object.entries(this.noteLocations).find(([,id])=>id===context)?.[0];}
  practiceContext(path:string):string {
    if(!path.endsWith('.md'))return path;
    if(!this.noteLocations[path]){
      const id='practice-note:'+crypto.randomUUID();
      const drafts=structuredClone(this.drafts),completions=structuredClone(this.completions);
      moveCacheContext(drafts,path,id);moveCacheContext(completions,path,id);
      this.drafts=drafts;this.completions=completions;this.noteLocations[path]=id;
      void this.persistPractice().catch(e=>new Notice('Could not save practice location: '+errorText(e)));
    }
    return this.noteLocations[path];
  }
  private renamePractice(oldPath:string,newPath:string){
    for(const path of legacyNotePaths(this.drafts,this.completions))if(within(path,oldPath))this.practiceContext(path);
    this.noteLocations=moveNoteLocations(this.noteLocations,oldPath,newPath);
    for(const [path,open]of [...this.expandedNotes])if(within(path,oldPath)){this.expandedNotes.delete(path);this.expandedNotes.set(newPath+path.slice(oldPath.length),open);}
    void this.persistPractice().catch(e=>new Notice('Could not save moved practice state: '+errorText(e)));
  }
  private savedData: Record<string,unknown> = {};
  private draftWrites: Promise<void> = Promise.resolve();
  practiceCards=new Set<{key:string;questionId:string;element:HTMLElement;busy:()=>boolean;reload:()=>void}>();
  private resetting=false;
  async resetPractice(context:string,ids:string[]){
    context=this.practiceContext(context);
    if(this.app.vault.getAbstractFileByPath(practiceSessionPath(context)))throw Error('This session is submitted and read only. Start a new attempt.');
    if(this.resetting)throw Error('A reset is already saving.');
    const target=new Set(ids.map(id=>draftKey(context,id))),cards=[...this.practiceCards].filter(c=>target.has(c.key));
    if(cards.some(c=>c.busy()))throw Error('Finish the active editor or submission before resetting.');
    const focusedCard=cards.find(c=>c.element.contains(c.element.ownerDocument.activeElement));
    this.resetting=true;cards.forEach(c=>c.element.inert=true);
    const priorDrafts=structuredClone(this.drafts),priorCompletions=structuredClone(this.completions);
    try{for(const key of practiceResetKeys(context,ids,this.drafts,this.completions)){delete this.drafts[key];delete this.completions[key];}
      await this.persistPractice();
      cards.forEach(c=>c.reload());new Notice('Practice reset. Recorded history is preserved.');
    }catch(e){for(const key of target){if(priorDrafts[key])this.drafts[key]=priorDrafts[key];if(priorCompletions[key])this.completions[key]=priorCompletions[key];}throw e;}
    finally{cards.forEach(c=>c.element.inert=false);this.resetting=false;focusedCard?.element.focus();}
  }
  private expandedNotes = new Map<string,boolean>();
  putDraft(key:string, draft:PracticeDraft|undefined):Promise<void> {
    if(draft) this.drafts[key]=structuredClone(draft); else delete this.drafts[key];
    return this.persistPractice();
  }
  private practiceResultListeners=new Set<()=>void>();
  private persistPractice(){
    const snapshot = {...this.savedData, practiceNoteLocations:{...this.noteLocations}, practiceDrafts:structuredClone(this.drafts), practiceCompletions:structuredClone(this.completions)};
    const write = this.draftWrites.catch(() => {}).then(() => this.saveData(snapshot));
    this.draftWrites = write;
    void write.then(()=>this.practiceResultListeners.forEach(update=>update()),()=>{});
    return write;
  }
  private expandNote(path:string, open:boolean) {
    this.expandedNotes.set(path,open);
    this.app.workspace.getLeavesOfType("markdown").forEach(leaf => {
      const view=leaf.view;
      if(view instanceof MarkdownView && view.file?.path===path)
        view.containerEl.querySelectorAll<HTMLDetailsElement>("details.study-embed").forEach(el => {el.open=open;});
    });
  }
  reviews!:ReviewStore;
  async onload() {
    registerVaultWindowIdentity(this);
    this.reviews=new ReviewStore(this.app);this.register(()=>this.reviews.closeHoverPreviews());
    await this.reviews.load();
    await registerMarginNotes(this,this.reviews);
    registerAnnotations(this,this.reviews);
    registerEvidence(this);
    registerStudioWorkspace(this);
    registerPanelRestorer(this.app,'practice-frozen',(panel,state)=>{void (async()=>{const file=this.app.vault.getAbstractFileByPath(practiceSessionPath(String(state.context)));if(!(file instanceof TFile))throw Error('Saved practice session not found.');await this.showFrozenPractice(parsePracticeSession(await this.app.vault.read(file)),panel);})().catch(e=>panel.contentEl.setText(errorText(e)));});
    registerPanelRestorer(this.app,'practice-set',(panel,state)=>{void this.bank().then(bank=>{const ids=Array.isArray(state.questionIds)?state.questionIds.filter((x):x is string=>typeof x==='string'):[];const questions=ids.flatMap(id=>{const q=bank.find(q=>q.definition.id===id);return q?[q]:[];});return this.openPracticePage(questions,String(state.title??'Practice'),state.course as CourseContext,panel,ids.length,typeof state.context==='string'?state.context:undefined,typeof state.submittedStamp==='string'?state.submittedStamp:undefined,state.review as PracticeReviewState|undefined);}).catch(e=>panel.contentEl.setText(errorText(e)));});
    registerPanelRestorer(this.app,'dashboard',(panel,s)=>void dashboard(this.app,()=>this.bank(),typeof s.courseId==='string'?s.courseId:'all',typeof s.chapterId==='string'?s.chapterId:undefined,panel));
    registerPanelRestorer(this.app,'learning',(panel,s)=>void learningView(this.app,()=>this.bank(),String(s.courseId),questions=>new Review(this,questions,'Scheduled practice').open(),typeof s.tab==='string'?s.tab:'review',panel));
    registerStudyHome(this,{bank:()=>this.bank(),start:e=>this.launchExam(e),resume:s=>this.showExam(s),practice:(questions,title,course)=>this.configurePractice(questions,title,course),frozen:session=>void this.showFrozenPractice(session)});
    this.registerObsidianProtocolHandler('study-studio',params=>{this.app.workspace.onLayoutReady(()=>{void (async()=>{
      const selection=parsePracticeLink(params);
      const bank=await this.bank();const byId=new Map(bank.map(q=>[q.definition.id,q]));
      const missing=selection.ids.filter(id=>!byId.has(id));
      if(missing.length)throw Error(`This practice link needs ${missing.length} question(s) not found in this vault. Sync the question files first.`);
      const course=selection.course?(await courses(this.app)).find(c=>c.course.id===selection.course)?.course:undefined;
      if(selection.course&&!course)throw Error('This practice link needs a course not found in this vault. Sync the course files first.');
      this.configurePractice(selection.ids.map(id=>byId.get(id)!),selection.title,course);
    })().catch(e=>new Notice(errorText(e),10000));});});
    registerShortcutGuide(this);
    this.addCommand({id:'group-note-questions',name:'Group questions on this note…',checkCallback:checking=>{const view=this.app.workspace.getActiveViewOfType(MarkdownView);if(!view?.file)return false;if(!checking)void this.groupNoteQuestions(view.file.path);return true;}});
    this.addCommand({id:'remove-note-questions',name:'Remove questions from this note…',checkCallback:checking=>{const view=this.app.workspace.getActiveViewOfType(MarkdownView);if(!view?.file)return false;if(!checking)void this.removeNoteQuestions(view.file.path);return true;}});
    this.addCommand({id:"manage-note-questions",name:"Manage questions in this note",hotkeys:[{modifiers:["Mod","Alt"],key:"G"}],callback:()=>void this.bank().then(bank=>manageNote(this.app,bank,id=>void this.openQuestion(id))).catch(e=>new Notice(errorText(e)))});
    if(this.app.vault.getName()==='study_studio_lab')this.addCommand({id:'organize-course-lab',name:'Organize course lab into chapter folders',callback:()=>void organizeCourseLab(this.app).then(n=>new Notice(`Moved ${n} lab notes into chapter folders.`,8000)).catch(e=>new Notice(errorText(e),12000))});
    this.registerMarkdownCodeBlockProcessor('study-dashboard',(source,el)=>{const id=source.trim()||'all';if(!/^[\w-]+$/.test(id)){el.setText('Specify a course ID or all.');return;}el.createEl('button',{text:id==='all'?'Open all-course dashboard':'Open course dashboard',cls:'mod-cta'}).onclick=()=>void dashboard(this.app,()=>this.bank(),id);});
    this.addCommand({id:'study-dashboard',name:'Open study dashboard',callback:()=>void dashboard(this.app,()=>this.bank()).catch(e=>new Notice(errorText(e)))});
    this.addCommand({id:'reset-note-practice',name:'Reset all practice questions in this note',checkCallback:checking=>{const view=this.app.workspace.getActiveViewOfType(MarkdownView);if(!view?.file)return false;if(!checking){const path=view.file.path;const source=view.getMode()==='source'?view.editor.getValue():undefined;void (source===undefined?this.app.vault.read(view.file):Promise.resolve(source)).then(raw=>this.resetPractice(path,noteQuestionIds(raw))).catch(e=>new Notice(errorText(e)));}return true;}});
    this.addCommand({id:"manage-courses",name:"Manage courses",callback:()=>void manageCourses(this.app).catch(e=>new Notice(errorText(e)))});
    this.addCommand({id:"assign-courses",name:"Assign current note to courses",callback:()=>{const file=this.app.workspace.getActiveFile();if(file)void assignCourses(this.app,file).catch(e=>new Notice(errorText(e)));else new Notice("Open a question or exam source note first.");}});
    const candidate=(file:TFile)=>file.extension==="md" && (this.authoredPaths.has(file.path) || file.path.startsWith(QUESTIONS+"/") || !!this.app.metadataCache.getFileCache(file)?.frontmatter?.study);
    this.questionIndex=new QuestionIndex({
      paths:()=>this.app.vault.getMarkdownFiles().filter(candidate).map(f=>f.path),
      read:async path=>{const file=this.app.vault.getAbstractFileByPath(path);return file instanceof TFile && candidate(file) ? this.app.vault.read(file) : undefined;}
    });
    this.register(()=>this.questionIndex.dispose());
    const changed=(file:import("obsidian").TAbstractFile)=>{if(file instanceof TFile && (candidate(file)||this.questionIndex.has(file.path)))this.questionIndex.invalidate(file.path);};
    this.registerEvent(this.app.vault.on("create",changed));
    this.registerEvent(this.app.vault.on("modify",changed));
    this.registerEvent(this.app.vault.on("delete",file=>{changed(file);for(const path of this.authoredPaths)if(within(path,file.path))this.authoredPaths.delete(path);for(const path of Object.keys(this.noteLocations))if(within(path,file.path))delete this.noteLocations[path];void this.persistPractice().catch(e=>new Notice(errorText(e)));}));
    this.registerEvent(this.app.vault.on("rename",(file,oldPath)=>{for(const path of [...this.authoredPaths])if(within(path,oldPath)){this.authoredPaths.delete(path);this.authoredPaths.add(file.path+path.slice(oldPath.length));}try{this.renamePractice(oldPath,file.path);}catch(e){new Notice(errorText(e));}this.questionIndex.invalidate(oldPath);if(file instanceof TFile)this.questionIndex.invalidate(file.path);else {this.questionIndex.invalidatePrefix(oldPath);this.questionIndex.discover();}}));
    this.registerEvent(this.app.metadataCache.on("changed",changed));
    this.app.workspace.onLayoutReady(()=>this.questionIndex.discover());
    let startupResolved=false;
    this.registerEvent(this.app.metadataCache.on("resolved",()=>{if(!startupResolved){startupResolved=true;this.questionIndex.discover();}}));
    this.addCommand({id:"question-index-status",name:"Show question index status",callback:()=>{void this.questionIndex.ready().then(()=>new Notice(JSON.stringify(this.questionIndex.stats()),10000)).catch(e=>new Notice(errorText(e)));}});
    this.addCommand({id:"create-exam",name:"Create exam",callback:()=>{void this.editExam().catch(e=>new Notice(errorText(e)));}});
    this.addCommand({id:"edit-exam",name:"Edit current exam",editorCallback:(_editor,view)=>{if(view.file)void this.editExam(view.file).catch(e=>new Notice(errorText(e)));}});
    this.addCommand({id:"start-exam",name:"Start current exam",editorCallback:(_editor,view)=>{if(view.file)void this.app.vault.read(view.file).then(raw=>this.launchExam(parseExam(raw))).catch(e=>new Notice(errorText(e)));}});
    this.addCommand({id:"resume-exam",name:"Resume exam or view exam results",callback:()=>{void (async()=>{
      const files=this.app.vault.getFiles().filter(f=>f.path.startsWith(`${ROOT}/Exam sessions/`)&&f.extension==='json').sort((a,b)=>b.stat.mtime-a.stat.mtime);
      const modal=new Modal(this.app);modal.titleEl.setText("Exam sessions");if(!files.length)modal.contentEl.createEl("p",{text:"No exams started yet."});
      for(const file of files){try{const session=parseSession(await this.app.vault.read(file));modal.contentEl.createEl("button",{text:`${session.exam.title} · ${session.state} · ${new Date(session.started).toLocaleString()}`}).onclick=()=>{modal.close();this.showExam(session);};}catch{modal.contentEl.createEl("p",{text:`Could not read ${file.name}`,cls:"study-error"});}}
      modal.open();
    })().catch(e=>new Notice(errorText(e)));}});
    this.registerMarkdownCodeBlockProcessor("study-exam",async(source,el,ctx)=>{try{
      const id=source.trim(),matches: {file:TFile;exam:ExamDefinition}[]=[];
      for(const file of await this.examFiles()){const exam=parseExam(await this.app.vault.read(file));if(exam.id===id)matches.push({file,exam});}
      if(matches.length!==1)throw Error("Exam ID is missing or duplicated.");const {file,exam}=matches[0];
      el.addClass('study-exam-launcher');
      const sheet=el.createDiv('study-print-sheet study-print-only');
      const owner=new MarkdownRenderChild(sheet);ctx.addChild(owner);
      const printSession=createSession(exam,await this.bank(),'print-preview',()=>0);
      let section='';
      for(const [i,entry] of printSession.entries.entries()){
        if(section!==entry.sectionId){sheet.createEl('h2',{text:entry.sectionTitle});section=entry.sectionId;}
        const item=sheet.createDiv('study-print-question');
        await RichMarkdown.render(this.app,printableQuestion(entry.question,i+1),item,entry.question.path,owner);
        if(entry.question.definition.type==='diagram')renderDiagram(this.app,item,entry.question.definition.diagram!,entry.question.path,(host,_id,n)=>host.createSpan({text:`${n+1}. __________`}));
      }
      el.createEl("p",{text:`${exam.title} · ${exam.sections.length} sections`});
      const printMenu=(event:MouseEvent)=>{event.preventDefault();event.stopPropagation();new Menu().addItem(x=>x.setTitle('Show printable question sheet').onClick(()=>{sheet.toggleClass('study-print-only',false);sheet.scrollIntoView({block:'start'});})).showAtPosition({x:event.clientX,y:event.clientY});};
      el.addEventListener('contextmenu',printMenu);

      el.createEl("button",{text:"Start new exam",cls:"mod-cta"}).onclick=()=>void this.app.vault.read(file).then(raw=>this.launchExam(parseExam(raw))).catch(e=>new Notice(errorText(e)));
      el.createEl("button",{text:"Edit exam"}).onclick=()=>void this.editExam(file).catch(e=>new Notice(errorText(e)));
    }catch(e){el.createEl("p",{text:errorText(e),cls:"study-error"});}});
    const data=await this.loadData();
    this.savedData=data && typeof data==='object' ? data : {};
    const locations=this.savedData.practiceNoteLocations;this.noteLocations=locations&&typeof locations==='object'&&!Array.isArray(locations)?Object.fromEntries(Object.entries(locations).filter(([p,id])=>p.endsWith('.md')&&typeof id==='string'&&id.startsWith('practice-note:'))):{};
    this.drafts=this.savedData.practiceDrafts && typeof this.savedData.practiceDrafts==='object' && !Array.isArray(this.savedData.practiceDrafts) ? this.savedData.practiceDrafts as Record<string,PracticeDraft> : {};
    this.completions=this.savedData.practiceCompletions && typeof this.savedData.practiceCompletions==='object' && !Array.isArray(this.savedData.practiceCompletions) ? this.savedData.practiceCompletions as Record<string,Attempt> : {};
    for(const open of [true,false]) this.addCommand({id:open?"expand-all-questions":"collapse-all-questions",name:open?"Expand all questions in this note":"Collapse all questions in this note",checkCallback:checking=>{
      const view=this.app.workspace.getActiveViewOfType(MarkdownView); if(!view?.file)return false;
      if(!checking)this.expandNote(view.file.path,open);return true;
    }});
    this.registerMarkdownCodeBlockProcessor("study-group",async(source,el,ctx)=>{
      try {
        el.addClass('study-note-practice');
        const group=parseGroup(source),practiceContext=this.practiceContext(ctx.sourcePath);
        const questions=await Promise.all(group.questions.map(id=>this.find(id)));
        const details=el.createEl("details",{cls:"study-embed study-group"});
        const summary=details.createEl("summary",{text:`${group.title} · ${questions.length} question${questions.length===1?"":"s"}`});
        const groupMenu=(event:MouseEvent|KeyboardEvent)=>{event.preventDefault();event.stopPropagation();const menu=new Menu().addItem(item=>item.setTitle('1 · Reset group practice').setIcon('rotate-ccw').onClick(()=>void this.resetPractice(practiceContext,group.questions).catch(e=>new Notice(errorText(e))))).addItem(item=>item.setTitle('2 · Remove multiple questions from this note…').setIcon('trash').onClick(()=>void this.removeNoteQuestions(ctx.sourcePath))).addItem(item=>item.setTitle('3 · Edit group and parent prompt…').setIcon('pencil').onClick(()=>void this.bank().then(bank=>editGroup(this.app,ctx.sourcePath,bank,ctx.getSectionInfo(el)?.lineStart,group.title,this.groupTools(ctx.sourcePath))).catch(e=>new Notice(errorText(e)))));const rect=summary.getBoundingClientRect();menu.showAtPosition({x:'clientX' in event?event.clientX:rect.left,y:'clientY' in event?event.clientY:rect.bottom});};
        summary.addEventListener('contextmenu',groupMenu);summary.addEventListener('keydown',event=>{if(event.ctrlKey&&event.code==='Space'&&!event.altKey&&!event.metaKey&&!event.shiftKey)groupMenu(event);});
        const host=details.createDiv();
        if(group.prompt){const parent=host.createDiv('study-group-prompt'),owner=new MarkdownRenderChild(parent);ctx.addChild(owner);await RichMarkdown.render(this.app,group.prompt,parent,ctx.sourcePath,owner);}
        let loaded=false;
        const load=()=>{if(details.open&&!loaded){loaded=true;for(const q of questions)ctx.addChild(new Card(host.createDiv(),this,q,practiceContext));}};
        details.addEventListener("toggle",load);
        details.open=this.expandedNotes.get(ctx.sourcePath)??false;load();
      }catch(e){el.createEl("p",{text:`Study Studio: ${errorText(e)}`,cls:"study-error"});}
    });
    this.addCommand({id:"insert-question-group",name:"Insert question group",editorCallback:(editor,view)=>{
      const raw=editor.getValue(),from=editor.getCursor('from'),to=editor.getCursor('to'),path=view.file?.path??'';
      void Promise.all([this.bank(),chapterDestination(this.app,view.file??undefined)]).then(([bank,destination])=>{
        new GroupEditor(this.app,path,bank,{title:'',questions:[]},async group=>{
          if(view.file?.path!==path||editor.getValue()!==raw)throw Error('Note changed. Reopen Insert question group.');
          editor.replaceRange('\n'+embedSource(group.questions,group.title,group.prompt)+'\n',from,to);
          if(view instanceof MarkdownView)await this.app.workspace.revealLeaf(view.leaf);
        },destination.scope,this.groupTools(path)).open();
      }).catch(e=>new Notice(errorText(e)));
    }});
    this.registerMarkdownCodeBlockProcessor(
      "study",
      async (source, el, ctx) => {
        try {
          el.addClass('study-note-practice');
          const id = source.trim();
          if (!/^[\w-]+$/.test(id))
            throw new Error(
              "Put one question ID in this study block. Use Insert question card to choose one.",
            );
          const q = await this.find(id);
          const practiceContext=this.practiceContext(ctx.sourcePath);
            const details = el.createEl("details", { cls: "study-embed" });
          details.createEl("summary", {
            text: `Practice · ${q.definition.title}`,
          });
          const host = details.createDiv();
          let loaded = false;
          const load = () => {
            if (details.open && !loaded) {
              loaded = true;
              ctx.addChild(new Card(host, this, q, practiceContext));
            }
          };
          const summary=details.querySelector('summary')!;const sourceLine=ctx.getSectionInfo(el)?.lineStart;if(sourceLine!==undefined)summary.dataset.studySourceLine=String(sourceLine);summary.dataset.studyQuestionId=id;summary.dataset.studyQuestionTitle=q.definition.title;
          const collapsedMenu=(event:MouseEvent|KeyboardEvent)=>{if(loaded)return;event.preventDefault();event.stopPropagation();const menu=new Menu();
            menu.addItem(i=>i.setTitle('3 · Edit question').onClick(()=>void this.openQuestion(id)));
            menu.addItem(i=>i.setTitle('7 · Remove from this note…').onClick(()=>void this.removeNoteQuestions(ctx.sourcePath,[id])));
            menu.addItem(i=>i.setTitle('9 · Delete question everywhere…').setIcon('trash').onClick(()=>void this.deleteQuestions([id])));
            menu.addItem(i=>i.setTitle('8 · Remove multiple questions from this note…').onClick(()=>void this.removeNoteQuestions(ctx.sourcePath)));menu.addItem(i=>i.setTitle('0 · Group questions on this note…').onClick(()=>void this.groupNoteQuestions(ctx.sourcePath)));
            const rect=summary.getBoundingClientRect();menu.showAtPosition({x:'clientX' in event?event.clientX:rect.left,y:'clientY' in event?event.clientY:rect.bottom});};
          summary.addEventListener('contextmenu',collapsedMenu);summary.addEventListener('keydown',event=>{if(event.ctrlKey&&event.code==='Space'&&!event.altKey&&!event.metaKey&&!event.shiftKey)collapsedMenu(event);});
          details.addEventListener("toggle",load);
          details.open=this.expandedNotes.get(ctx.sourcePath)??false;load();
        } catch (e) {
          el.createEl("p", {
            text: `Study Studio: ${errorText(e)}`,
            cls: "study-error",
          });
        }
      },
    );
    this.addCommand({
      id: "edit-question",
      name: "Edit current question",
      editorCallback: (editor, view) => {
        try {
          if (!view.file) throw new Error("Open a question note first.");
          new QuestionEditor(
            this.app,
            view.file,
            parseQuestion(editor.getValue(), view.file.path),
            (el, q) => new Card(el, this, q, "author-preview", undefined, true),
          ).open();
        } catch (e) {
          new Notice(errorText(e));
        }
      },
    });
    this.registerEvent(this.app.workspace.on("editor-menu", (rootMenu, editor, view) => {
      const menu=menuGroup(rootMenu,"study","Study","graduation-cap");
      if(view.file)menu.addItem(item=>item.setTitle('Group questions on this note…').onClick(()=>void this.groupNoteQuestions(view.file!.path)));
      if(view.file)menu.addItem(item=>item.setTitle('Remove study questions from this note…').setIcon('trash').onClick(()=>void this.removeNoteQuestions(view.file!.path)));
      if (!editor.getSelection().trim()) return;
      menu.addItem(item => item.setTitle("Create study question from selection").setIcon("graduation-cap")
        .onClick(() => new CreateQuestion(this, editor, view.file ?? undefined).open()));
    }));
    this.addCommand({
      id: "create-question",
      name: "Create question from selection",
      hotkeys:[{modifiers:["Ctrl"],key:"N"}],
      editorCallback: (editor, view) =>
        new CreateQuestion(this, editor, view.file ?? undefined).open(),
    });
    this.addCommand({
      id: "insert-question",
      name: "Insert question card",
      editorCallback: (editor,view) => {
        const source=editor.getValue(),from=editor.getCursor("from"),to=editor.getCursor("to");
        void Promise.all([this.bank(),chapterDestination(this.app,view.file??undefined)]).then(([bank,destination])=>new ScopedQuestionPicker(this.app,bank,destination.scope,q=>{if(this.app.workspace.getActiveViewOfType(MarkdownView)!==view||editor.getValue()!==source){new Notice("Note changed. Reopen Insert question card.");return;}editor.replaceRange("\n"+embedSource([q.definition.id])+"\n",from,to);},"Insert question card").open()).catch(e=>new Notice(errorText(e)));
      },
    });

    this.addCommand({
      id: "selection-to-blank",
      name: "Turn selected answer into a blank",
      editorCallback: (editor, view) => {
        try {
          if (!view.file) throw new Error("Open a question note.");
          const answer = editor.getSelection();
          if (!answer.trim())
            throw new Error(
              "Select the answer text in the question prompt first.",
            );
          const raw = editor.getValue(),
            q = parseQuestion(raw, view.file.path);
          if (q.definition.type !== "blank")
            throw new Error("This command is for fill-in-the-blank questions.");
          const from = editor.posToOffset(editor.getCursor("from")),
            to = editor.posToOffset(editor.getCursor("to"));
          const promptStart = raw.indexOf(
            q.prompt,
            raw.indexOf("\n---", 4) + 4,
          );
          if (from < promptStart || to > promptStart + q.prompt.length)
            throw new Error("Select text inside the Prompt section.");
          const id = `b${crypto.randomUUID().slice(0, 8)}`;
          q.definition.answers!.push({ id, accepted: [answer] });
          const prompt =
            q.prompt.slice(0, from - promptStart) +
            `{{blank:${id}}}` +
            q.prompt.slice(to - promptStart);
          const next = serialize(q.definition, prompt, q.explanation);
          editor.replaceRange(
            next,
            { line: 0, ch: 0 },
            editor.offsetToPos(raw.length),
          );
          new Notice(
            "Selection is now a blank; its answer was saved in properties.",
          );
        } catch (e) {
          new Notice(errorText(e));
        }
      },
    });
    this.addCommand({
      id: "practice-question",
      name: "Practice current question",
      editorCallback: (editor, view) => {
        try {
          new Review(
            this,
            [parseQuestion(editor.getValue(), view.file?.path ?? "")],
            view.file?.path ?? "",
          ).open();
        } catch (e) {
          new Notice(errorText(e));
        }
      },
    });
    this.addCommand({
      id: "create-variant",
      name: "Create variant of current question",
      editorCallback: (editor, view) => {
        void (async () => {
          const q = parseQuestion(editor.getValue(), view.file?.path ?? "");
          const d = structuredClone(q.definition);
          d.familyId = d.familyId ?? d.id;
          d.id = crypto.randomUUID();
          d.title += " — variant";
          await this.ensureFolder(QUESTIONS);
          const file = await this.app.vault.create(
            `${QUESTIONS}/Variant-${d.id}.md`,
            serialize(d, q.prompt, q.explanation),
          );
          await this.app.workspace.getLeaf("tab").openFile(file);
          new Notice(
            "Variant created. Edit its prompt, blanks and answers; family ID stays shared.",
          );
        })().catch((e) => new Notice(errorText(e)));
      },
    });
    this.addCommand({
      id: "review-note",
      name: "Review questions in this note",
      editorCallback: (editor, view) => {
        void (async () => {
          const ids = noteQuestionIds(editor.getValue());
          if (!ids.length)
            throw new Error("Insert a question card in this note first.");
          const bank = await this.bank();
          const referenced = await Promise.all(ids.map((id) => this.find(id)));
          const families = new Set(
            referenced.map((q) => q.definition.familyId ?? q.definition.id),
          );
          new ReviewSetup(
            this,
            bank.filter((q) =>
              families.has(q.definition.familyId ?? q.definition.id),
            ),
            view.file?.path ?? "",
          ).open();
        })().catch((e) => new Notice(errorText(e)));
      },
    });
    this.addCommand({
      id: "review-bank",
      name: "Choose a question to practice",
      callback: () => {
        void this.bank()
          .then((bank) => {
            if (!bank.length) {
              new Notice("Create a question first.");
              return;
            }
            new PickQuestion(this, bank, (q) =>
              new Review(this, [q], "question-bank").open(),
            ).open();
          })
          .catch((e) => new Notice(errorText(e)));
      },
    });
    this.addCommand({
      id: "history",
      name: "Show review history",
      callback: () =>
        void this.history().catch((e) => new Notice(errorText(e))),
    });
    this.addRibbonIcon(
      "graduation-cap",
      "Study Studio: choose a question",
      () => {
        void this.bank()
          .then((bank) =>
            new PickQuestion(this, bank, (q) =>
              new Review(this, [q], "question-bank").open(),
            ).open(),
          )
          .catch((e) => new Notice(errorText(e)));
      },
    );
  }
  async ensureFolder(path: string) {
    let parent = "";
    for (const part of normalizePath(path).split("/")) {
      parent = parent ? `${parent}/${part}` : part;
      if (!this.app.vault.getAbstractFileByPath(parent)) {
        try {
          await this.app.vault.createFolder(parent);
        } catch (e) {
          if (!this.app.vault.getAbstractFileByPath(parent)) throw e;
        }
      }
    }
  }
  async bank(): Promise<Question[]> {return this.questionIndex.all();}
  async find(id:string) {return this.questionIndex.find(id);}
  deletionBusy(ids:string[]){return [...this.practiceCards].some(c=>ids.includes(c.questionId)&&c.busy());}
  async deleteQuestions(ids:string[],done:()=>void=()=>{}){
    try{const bank=await this.bank(),questions=bank.filter(q=>ids.includes(q.definition.id));if(!questions.length){new Notice('No saved questions to delete.');return;}new DeleteQuestions(this,questions,done).open();}catch(e){new Notice(errorText(e));}
  }
  private groupingMode?:NoteGrouping;
  async groupNoteQuestions(path:string){
    try{const view=this.app.workspace.getLeavesOfType('markdown').map(l=>l.view).find((v):v is MarkdownView=>v instanceof MarkdownView&&v.file?.path===path);if(!view?.file)return;const file=view.file;
      this.groupingMode?.unload();const snapshot=await this.app.vault.read(file);
      const mode=new NoteGrouping(this,view,path,()=>{this.removeChild(mode);if(this.groupingMode===mode)this.groupingMode=undefined;},async lines=>{
        const bank=await this.bank(),destination=await chapterDestination(this.app,file),blocks=embeds(snapshot).filter(b=>!b.group&&lines.includes(snapshot.slice(0,b.start).split('\n').length-1));
        groupOccurrences(snapshot,lines,'New group');
        new GroupEditor(this.app,path,bank,{title:'',questions:blocks.flatMap(b=>b.ids)},async group=>{await this.app.vault.process(file,current=>{if(current!==snapshot)throw Error('Note changed. Cancel and select its questions again.');const grouped=groupOccurrences(current,lines,group.title,group.prompt),target=embeds(grouped).find(b=>b.group&&b.title===group.title&&b.start===blocks[0].start);if(!target)throw Error('Group position changed.');return replaceEmbed(grouped,target,embedSource(group.questions,group.title,group.prompt));});await this.app.workspace.revealLeaf(view.leaf);},destination.scope,this.groupTools(path)).open();
      });this.groupingMode=mode;this.addChild(mode);
    }catch(e){new Notice(errorText(e));}
  }
  groupTools(path:string):GroupTools {
    return {preview:(host,q)=>new Card(host,this,q,'group-preview',undefined,true),create:(kind,accept)=>{
      void (async()=>{const source=this.app.vault.getAbstractFileByPath(path),destination=await chapterDestination(this.app,source instanceof TFile?source:undefined),id=crypto.randomUUID(),questionPath=`${destination.folder}/Question-${id}.md`,draft=intakeDraft(kind,id,'New question','',questionPath);draft.definition.title='';
      if(destination.scope)draft.definition.courseIds=[destination.scope.courseId];if(destination.placement)draft.definition.chapters=[destination.placement];
      new QuestionEditor(this.app,{path:questionPath},draft,(host,q)=>new Card(host,this,q,'group-preview',undefined,true),async raw=>{await this.ensureFolder(destination.folder);const file=await this.app.vault.create(questionPath,raw);await this.indexCreatedQuestion(file);accept(parseQuestion(raw,questionPath));return file;}).open();})().catch(e=>new Notice(errorText(e)));
    }};
  }
  private removalMode?:NoteRemoval;
  async removeNoteQuestions(path:string,selected?:string[]){
    try{const file=this.app.vault.getAbstractFileByPath(path);if(!(file instanceof TFile))return;
      const view=this.app.workspace.getLeavesOfType('markdown').map(l=>l.view).find((v):v is MarkdownView=>v instanceof MarkdownView&&v.file?.path===path);
      if(!selected){if(!view){new Notice('Open this note to select its questions.');return;}this.removalMode?.unload();const mode=new NoteRemoval(this,view,path,()=>{this.removeChild(mode);if(this.removalMode===mode)this.removalMode=undefined;});this.removalMode=mode;this.addChild(mode);return;}
      const ids=selected??embeds(view?.editor.getValue()??await this.app.vault.read(file)).flatMap(b=>b.ids);const bank=await this.bank(),questions=bank.filter(q=>ids.includes(q.definition.id));if(!questions.length){new Notice('No question cards in this note.');return;}new DeleteQuestions(this,questions,()=>{},path).open();
    }catch(e){new Notice(errorText(e));}
  }
  async openQuestion(id: string) {
    const origin=this.app.workspace.getActiveViewOfType(MarkdownView)?.leaf;
    try {
      const q = await this.find(id);
      const file = this.app.vault.getAbstractFileByPath(q.path);
      if (file instanceof TFile) new QuestionEditor(this.app, file, q, (el, draft) => new Card(el, this, draft, "author-preview", undefined, true),undefined,done=>void this.deleteQuestions([id],()=>{done();if(origin)void this.app.workspace.revealLeaf(origin);})).open();
    } catch (e) {
      new Notice(errorText(e));
    }
  }
  async saveAttempt(attempt: Attempt) {
    if(this.app.vault.getAbstractFileByPath(practiceSessionPath(attempt.context)))throw Error("This session is submitted and read only. Start a new attempt.");
    await this.ensureFolder(ATTEMPTS);
    await this.app.vault.create(
      `${ATTEMPTS}/${attempt.finished.replace(/[:.]/g, "-")}-${attempt.id}.json`,
      JSON.stringify(attempt, null, 2) + "\n",
    );
  }
  async history() { await historyView(this.app); }
}
