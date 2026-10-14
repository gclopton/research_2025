import {blankSelection,answerText,blankTokens} from './blank-authoring';
import {courses} from "./course-ui";
import {drawingInput} from "./drawing-ui";
import {writtenEditor} from "./written-editor";
import {diagramImage} from "./diagram-render";
import {diagramAuthor} from "./diagram-author";
import {codeAuthor} from "./code-author";
import {StudioPanel} from "./workspace-panel";
import {
  App,
  Modal,
  Setting,
  TFile,
  Component,
  Notice,
  Menu,
} from "obsidian";
import { Question, Definition, validate } from "./model";
import {
  tableDraft,
  tableIssues,
  newAnswerCell,
  setTableCellText,
  TableDraft,
  DraftCell,
  toggleBlank,
  applyTable,
  alternatives,
  editedSource,
  checkedReplacement,
} from "./authoring-model";

export class QuestionEditor extends StudioPanel {
  private definition: Definition;
  private prompt: string;
  private promptInput!: HTMLTextAreaElement;
  private explanation: string;
  private grid?: TableDraft;
  private gridHost!: HTMLElement;
  private error!: HTMLElement;
  private saveButton!: HTMLButtonElement;
  private busy = false;
  private mathEditors = 0;
  private pausedControls: (HTMLButtonElement | HTMLInputElement | HTMLTextAreaElement)[] = [];
  private liveFields = new Map<HTMLTextAreaElement,ReturnType<typeof writtenEditor>>();
  private writtenFields = new Map<HTMLElement,Component>();
  private renderComponent = new Component();
  private closed = false;
  private titleInput!:HTMLInputElement;
  private validationAttempted=false;
  private invalidTargets:HTMLElement[]=[];
  private tableFields=new Map<string,HTMLElement>();
  constructor(
    app: App,
    private file: TFile | { path: string },
    private original: Question,
    private createPreview: (el: HTMLElement, q: Question) => Component,
    private createFile?: (raw: string) => Promise<TFile>,
    private deleteQuestion?: (done:()=>void)=>void,
  ) {
    super(app);
    this.definition = structuredClone(original.definition);
    this.prompt = original.prompt;
    this.explanation = original.explanation;
    if (this.definition.type === "table") this.grid = tableDraft(original);
    this.modalEl.addClass("study-author-modal");
  }
  onOpen() {
    this.renderComponent.load();
    this.titleEl.setText("Edit question");
    const root = this.contentEl;
    const showEditorActions=(event:MouseEvent|KeyboardEvent)=>{
      if(this.mathEditors||this.busy)return;event.preventDefault();event.stopPropagation();const menu=new Menu();
      menu.addItem(i=>i.setTitle('1 · Preview question').onClick(()=>void this.previewQuestion()));
      menu.addItem(i=>i.setTitle('2 · Save question').onClick(()=>void this.save(false)));
      menu.addItem(i=>i.setTitle('3 · Save and open note').onClick(()=>void this.save(true)));
      if(this.deleteQuestion)menu.addItem(i=>i.setTitle('4 · Delete question everywhere…').setIcon('trash').onClick(()=>this.deleteQuestion!(()=>this.close())));
      const rect=root.getBoundingClientRect();menu.showAtPosition({x:'clientX' in event?event.clientX:rect.left+20,y:'clientY' in event?event.clientY:Math.max(20,rect.top+20)});
    };
    this.registerDomEvent(this.modalEl,'contextmenu',event=>{if(!event.defaultPrevented&&!(event.target as HTMLElement).closest('input,textarea,.cm-editor,[contenteditable="true"]'))showEditorActions(event);});
    this.registerDomEvent(root,'keydown',event=>{if(!event.defaultPrevented&&event.ctrlKey&&!event.altKey&&!event.metaKey&&!event.shiftKey&&event.code==='Space')showEditorActions(event);});
    // Handle save before nested editors consume Enter. Math Studio owns iframe keys.
    this.registerDomEvent(root,'keydown',event=>{
      if(event.isComposing||event.key!=='Enter'||!event.ctrlKey||event.altKey||event.metaKey)return;
      event.preventDefault();event.stopImmediatePropagation();
      void this.save(event.shiftKey);
    },true);
    this.registerDomEvent(root,'keydown',event=>{
      if(this.grid&&event.altKey&&!event.ctrlKey&&!event.metaKey&&['Enter','Backspace'].includes(event.key)){
        event.preventDefault();event.stopImmediatePropagation();if(event.key==='Enter')this.insertTableDimension(event.shiftKey);else this.removeTableDimension(event.shiftKey);
      }
    },true);
    root.createEl("p", {
      text: "Ctrl+Enter: save · Ctrl+Shift+Enter: save and open note · Ctrl+M: edit math · Ctrl+Shift+M: display math. Drafts stay while this tab is open.",
      cls: "study-muted",
    });
    new Setting(root)
      .setName("Title")
      .addText((t) =>
        (this.titleInput=t.inputEl,t)
          .setValue(this.definition.title)
          .onChange((v) => (this.definition.title = v,this.validationAttempted&&this.validateFields(false))),
      );
    new Setting(root)
      .setName("Concepts")
      .setDesc("Separate concepts with commas.")
      .addText((t) =>
        t.setValue(this.definition.concepts.join(", ")).onChange(
          (v) =>
            (this.definition.concepts = v
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean)),
        ),
      );
    if(this.definition.courseIds?.length){
      const chapters=root.createEl('details');chapters.createEl('summary',{text:'Chapter assignments'});
      void courses(this.app).then(catalog=>{for(const id of this.definition.courseIds??[]){const title=catalog.find(c=>c.course.id===id)?.course.title??id;const existing=this.definition.chapters?.find(c=>c.courseId===id);const chapterId=existing?.chapterId??`chapter-${crypto.randomUUID().slice(0,8)}`;
        new Setting(chapters).setName(`Chapter · ${title}`).setDesc('Choose an existing chapter or type a new title. Clear to leave unassigned.').addText(text=>{
          const list=chapters.createEl('datalist');list.id=`chapters-${crypto.randomUUID()}`;const known=new Map<string,{chapterId:string;title:string}>();
          for(const f of this.app.vault.getMarkdownFiles())for(const c of this.app.metadataCache.getFileCache(f)?.frontmatter?.study?.chapters??[])if(c.courseId===id&&typeof c.title==='string'&&typeof c.chapterId==='string')known.set(c.title,c);
          for(const c of known.values())list.createEl('option',{value:c.title});text.inputEl.setAttribute('list',list.id);text.setValue(existing?.title??'').onChange(value=>{const others=(this.definition.chapters??[]).filter(c=>c.courseId!==id);const match=known.get(value.trim());this.definition.chapters=value.trim()?[...others,{courseId:id,chapterId:match?.chapterId??chapterId,title:value.trim()}]:others;});
        });
      }}).catch(e=>chapters.createEl('p',{text:String(e)}));
    }
    const prompt = this.area(
      root,
      "Prompt",
      this.prompt,
      (v) => {const old=blankTokens(this.prompt).map(t=>t.id).join();this.prompt=v;if(this.gridHost&&this.definition.type==='blank'&&old!==blankTokens(v).map(t=>t.id).join())this.renderRules();},
      5,
    );
    this.promptInput = prompt;
    if (this.definition.type === "blank") {
      const make = root.createEl("button", {
        text: "Make selection a blank · Ctrl+Shift+B",
      });
      const addBlank = () => {
        const id = `b${crypto.randomUUID().slice(0, 8)}`;
        let result;try{result=blankSelection(prompt.value,prompt.selectionStart,prompt.selectionEnd,id);}catch(e){this.error.setText(String(e));return;}
        this.definition.answers!.push(result.answer);this.prompt=result.prompt;prompt.value=this.prompt;
        this.liveFields.get(prompt)?.setValue(this.prompt,result.from,result.to);
        this.renderRules();
        this.liveFields.get(prompt)?.focus();
      };
      make.onclick = addBlank;
      (this.liveFields.get(prompt)?.dom??prompt).addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.code === "KeyB") {
          e.preventDefault();
          e.stopPropagation();
          addBlank();
        }
      });
      root.createEl("p", {
        text: "Select text and press Ctrl+Shift+B to make a blank. Restore answer replaces a blank with its first accepted answer.",
        cls: "study-muted",
      });
    }
    this.gridHost = root.createDiv("study-author-rules");
    this.renderRules();
    this.area(
      root,
      "Explanation (shown after answering)",
      this.explanation,
      (v) => (this.explanation = v),
      3,
    );
    this.error = root.createDiv("study-error");
    this.error.setAttribute("role", "alert");
    const actions = root.createDiv("study-author-actions");
    this.button(actions, "Preview question", () => this.previewQuestion());
    this.saveButton = actions.createEl("button", {
      text: "Save question · Ctrl+Enter",
      cls: "mod-cta",
    });
    this.saveButton.onclick = () => void this.save(false);
    const native = actions.createEl("button", {
      text: "Save and open note · Ctrl+Shift+Enter",
    });
    native.onclick = () => void this.save(true);
    const cancel = actions.createEl("button", { text: "Cancel" });
    cancel.onclick = () => this.close();
    this.scope.register(['Alt'],'Enter',()=>{
      if(this.definition.type!=='choice'||this.mathEditors)return true;
      const rows=Array.from(this.gridHost.querySelectorAll('.study-author-choice'));
      const at=rows.findIndex(row=>row.contains(this.contentEl.ownerDocument.activeElement));
      this.addChoice(at<0?this.definition.choices!.length:at+1);return false;
    });
    this.scope.register(["Ctrl", "Shift"], "Enter", () => { void this.save(true); return false; });
    this.scope.register(["Ctrl"], "Enter", () => {
      void this.save(false);
      return false;
    });
  }
  private area(
    parent: HTMLElement,
    label: string,
    value: string,
    change: (v: string) => void,
    rows = 2,
  ) {
    const owner=new Component();this.renderComponent.addChild(owner);
    const editor=writtenEditor(this.app,parent,this.file.path,value,owner,v=>{change(v);if(this.validationAttempted)this.validateFields(false);},active=>{
      this.mathEditors+=active?1:-1;
      if(active){this.pausedControls=Array.from(this.contentEl.querySelectorAll<HTMLButtonElement|HTMLInputElement|HTMLTextAreaElement>('button:not(:disabled),input:not(:disabled),textarea:not(:disabled)'));this.pausedControls.forEach(c=>c.disabled=true);}
      else{this.pausedControls.forEach(c=>c.disabled=false);this.pausedControls=[];}
    },label,{blanks:label==='Prompt'&&this.definition.type==='blank'?()=>this.definition.answers??[]:undefined,onBlank:id=>{const input=this.gridHost.querySelector<HTMLTextAreaElement>(`textarea[data-blank-answer="${id}"]`);if(input){this.liveFields.get(input)?.focus();input.parentElement?.scrollIntoView({block:'nearest'});}},toolbar:false,answers:/accepted answer|^Answer \d/.test(label),placeholder:label==='Prompt'?'Write the question…':label.startsWith('Choice ')?'Write an option…':label.startsWith('Explanation')?'Optional explanation…':''});
    editor.dom.style.setProperty('--study-editor-height',`${Math.max(36,rows*20)}px`);
    this.writtenFields.set(editor.source,owner);this.liveFields.set(editor.source,editor);
    return editor.source;
  }

  private checkbox(
    parent: HTMLElement,
    label: string,
    value: boolean,
    change: (v: boolean) => void,
  ) {
    const wrap = parent.createEl("label", { cls: "study-author-check" });
    const input = wrap.createEl("input", {
      type: "checkbox",
      attr: { "aria-label": label },
    });
    input.checked = value;
    wrap.createSpan({ text: label });
    input.onchange = () => change(input.checked);
    return input;
  }
  private button(parent: HTMLElement, label: string, click: () => void) {
    const b = parent.createEl("button", { text: label });
    b.onclick = click;
    return b;
  }
  private renderRules() {
    const root = this.gridHost;
    if (this.mathEditors) { new Notice("Finish the active math or drawing editor before changing question structure."); return; }
    for(const [input,owner] of this.writtenFields)if(root.contains(input)){this.renderComponent.removeChild(owner);this.writtenFields.delete(input);this.liveFields.delete(input as HTMLTextAreaElement);}
    this.clearValidation();root.empty();
    const d = this.definition;
    if((["short-answer","drawing"].includes(d.type))){
      if(d.type==='drawing'){
        root.createEl('h3',{text:'Reference drawing (hidden until submission)'});
        const referenceOwner=new Component();this.renderComponent.addChild(referenceOwner);
        const field=drawingInput(this.app,root,d.drawing?JSON.stringify(d.drawing):'',referenceOwner,value=>{d.drawing=value?JSON.parse(value):undefined;},active=>{this.mathEditors+=active?1:-1;
          if(active){this.pausedControls=Array.from(this.contentEl.querySelectorAll<HTMLButtonElement|HTMLInputElement|HTMLTextAreaElement>('button:not(:disabled),input:not(:disabled),textarea:not(:disabled)'));this.pausedControls.forEach(c=>c.disabled=true);}
          else{this.pausedControls.forEach(c=>c.disabled=false);this.pausedControls=[];}
        });
        this.writtenFields.set(field.dom,referenceOwner);
      }
      this.area(root,'Reference answer (hidden until submission)' ,d.written!.reference,v=>d.written!.reference=v,6);
      root.createEl('h3',{text:'Self-assessment rubric'});
      root.createEl('p',{text:'Each criterion is worth one point: not met (0), partly met (0.5), or met (1).'});
      d.written!.rubric.forEach((r,i)=>{const row=root.createDiv('study-author-answer');this.area(row,`Criterion ${i+1}`,r.text,v=>r.text=v);if(d.written!.rubric.length>1)this.button(row,'Remove criterion',()=>{d.written!.rubric.splice(i,1);this.renderRules();});});
      this.button(root,'Add criterion',()=>{d.written!.rubric.push({id:`criterion-${crypto.randomUUID()}`,text:''});this.renderRules();});return;
    }
    if(d.type==="ordering"){
      root.createEl('h3',{text:'Steps in the correct order'});
      root.createEl('p',{text:'Arrange the answer key here. Learners start with shuffled steps. The complete sequence earns one point; partial sequences receive no credit.'});
      const items=d.correct!.map(id=>d.choices!.find(c=>c.id===id)!);
      const sync=()=>{d.choices=items;d.correct=items.map(c=>c.id);this.renderRules();};
      items.forEach((c,i)=>{const row=root.createDiv('study-author-answer');this.area(row,`Step ${i+1}`,c.text,v=>c.text=v);
        if(i>0)this.button(row,`Move step ${i+1} up`,()=>{[items[i-1],items[i]]=[items[i],items[i-1]];sync();});
        if(i<items.length-1)this.button(row,`Move step ${i+1} down`,()=>{[items[i+1],items[i]]=[items[i],items[i+1]];sync();});
        if(items.length>2)this.button(row,`Remove step ${i+1}`,()=>{items.splice(i,1);sync();});
      });this.button(root,'Add step',()=>{items.push({id:`step-${crypto.randomUUID()}`,text:''});sync();});return;
    }
    if(d.type==="diagram"){diagramAuthor(this.app,root,d,this.file.path,this.area.bind(this),()=>this.renderRules());return;}
    if(d.type==="code"){codeAuthor(root,d,this.renderComponent);return;}
    if (d.type === "choice") {
      root.createEl("h3", { text: "Choices and correct answers" });
      root.createEl("p", {
        text: "Option/Alt+Enter adds a choice. Ctrl+Space opens numbered actions. Tab moves between fields; Space toggles a focused checkbox.",
      });
      this.checkbox(
        root,
        "Shuffle choices",
        !!d.shuffle,
        (v) => (d.shuffle = v),
      );
      d.choices!.forEach((c, index) => {
        const row = root.createDiv("study-author-choice");
        this.area(row, `Choice ${index + 1}`, c.text, (v) => (c.text = v));
        this.checkbox(
          row,
          `Correct choice ${index + 1}`,
          d.correct!.includes(c.id),
          (v) => {
            d.correct = v
              ? [...d.correct!.filter((id) => id !== c.id), c.id]
              : d.correct!.filter((id) => id !== c.id);
          },
        );
        row.title='Ctrl+Space: choice actions · Option/Alt+Enter: add choice';
        row.setAttribute('aria-keyshortcuts','Control+Space Alt+Enter Shift+F10');
        const menu=(event:MouseEvent|KeyboardEvent)=>{
          event.preventDefault();event.stopPropagation();if(this.mathEditors)return;const m=new Menu();
          m.addItem(item=>item.setTitle('1 · Add choice after this').onClick(()=>this.addChoice(index+1)));
          m.addItem(item=>item.setTitle('2 · Mark correct').setChecked(d.correct!.includes(c.id)).onClick(()=>{d.correct=d.correct!.includes(c.id)?d.correct!.filter(id=>id!==c.id):[...d.correct!,c.id];this.renderRules();this.focusChoice(index);}));
          for(const [label,delta] of [['3 · Move choice up',-1],['4 · Move choice down',1]] as const){const next=index+delta;m.addItem(item=>item.setTitle(label).setDisabled(next<0||next>=d.choices!.length).onClick(()=>{[d.choices![index],d.choices![next]]=[d.choices![next],d.choices![index]];this.renderRules();this.focusChoice(next);}));}
          m.addSeparator();m.addItem(item=>item.setTitle('5 · Remove choice').onClick(()=>{d.choices=d.choices!.filter(x=>x!==c);d.correct=d.correct!.filter(id=>id!==c.id);this.renderRules();this.focusChoice(Math.max(0,index-1));}));
          const rect=row.getBoundingClientRect();m.showAtPosition({x:event instanceof MouseEvent?event.clientX:rect.left+20,y:event instanceof MouseEvent?event.clientY:rect.top+20});
        };
        row.addEventListener('contextmenu',e=>{if(!(e.target as HTMLElement).closest('.cm-editor'))menu(e);});
        row.addEventListener('keydown',e=>{if(!e.defaultPrevented&&!this.mathEditors&&((e.ctrlKey&&!e.shiftKey&&!e.altKey&&!e.metaKey&&e.code==='Space')||(e.shiftKey&&e.key==='F10')))menu(e);});
      });
      this.button(root, 'Add choice · Option/Alt+Enter', () => this.addChoice(d.choices!.length));
    } else if (d.type === "blank") {
      root.createEl("h3", { text: "Accepted answers" });
      for (const [index, a] of this.activeBlankAnswers().entries()) {
        const row = root.createDiv("study-author-answer");
        const answerInput=this.area(
          row,
          `Blank ${index + 1} — one accepted answer per line`,
          a.accepted.join("\n"),
          (v) => {a.accepted=alternatives(v);this.liveFields.get(this.promptInput)?.refreshBlanks();},
        );
        answerInput.dataset.blankAnswer=a.id;
        this.checkbox(
          row,
          `Case sensitive: answer ${index + 1}`,
          !!a.caseSensitive,
          (v) => (a.caseSensitive = v),
        );
        this.button(row, `Restore answer ${index + 1} to prompt`, () => {
          this.prompt = this.prompt
            .split(`{{blank:${a.id}}}`)
            .join(answerText(a));
          this.promptInput.value = this.prompt;
          this.liveFields.get(this.promptInput)?.setValue(this.prompt);
          // Keep draft answer metadata so Undo can restore the highlighted blank.
          this.renderRules();
        });
      }
    } else this.renderTable();
  }
  private emptyCell(): DraftCell {return newAnswerCell();}
  private renderTable() {
    const root = this.gridHost,
      grid = this.grid!;
    this.tableFields.clear();
    root.createEl("h3", { text: "Table layout and blanks" });
    root.createEl("p", {
      text: "Cells are required answers by default. Check Given / formatting to show text or an empty cell. Alt+Enter: insert row; Alt+Shift+Enter: insert column. Alt+Backspace: delete row; Alt+Shift+Backspace: delete column. Ctrl+Shift+B toggles cell type. Alt+arrows move between cells.",
    });
    const tools = root.createDiv("study-actions");
    this.button(tools, "Add row · Alt+Enter", () => this.insertTableDimension(false));
    this.button(tools, "Add column · Alt+Shift+Enter", () => this.insertTableDimension(true));
    const wrap = root.createDiv("study-table-wrap"),
      table = wrap.createEl("table", { cls: "study-author-grid" });
    this.tableFields.set('blanks',table);
    const headers = table.createEl("thead").createEl("tr");
    grid.columns.forEach((value, col) => {
      const th = headers.createEl("th");th.dataset.tableColumn=String(col);
      const heading=this.area(
        th,
        `Column ${col + 1} heading (optional)`,
        value,
        (v) => (grid.columns[col] = v),
        1,
      );
      this.tableFields.set(`heading:${col}`,this.liveFields.get(heading)!.dom);
      if (grid.columns.length > 1)
        this.button(th, `Remove column ${col + 1}`, () => {
          grid.columns.splice(col, 1);
          grid.rows.forEach((row) => row.splice(col, 1));
          this.renderRules();
        });
    });
    headers.createEl("th", { text: "Rows" });
    const body = table.createEl("tbody");
    grid.rows.forEach((row, r) => {
      const tr = body.createEl("tr");
      row.forEach((cell, c) => {
        const td = tr.createEl("td", {
          cls: cell.blank ? "study-author-blank" : "",
        });
        td.dataset.tableRow=String(r);td.dataset.tableColumn=String(c);
        const name = `Row ${r + 1}, column ${c + 1}`;
        let answerSource:HTMLTextAreaElement|undefined;
        const input = this.area(
          td,
          `${name} ${cell.blank?"answer":"content"}`,
          cell.text,
          (v) => {setTableCellText(cell,v);if(answerSource)this.liveFields.get(answerSource)?.setValue(cell.accepted);},
        );
        input.dataset.cell = `${r}:${c}`;
        const toggle = () => {
          toggleBlank(cell);
          this.renderRules();
          if(this.validationAttempted)this.validateFields(false);
          this.focusCell(r, c);
        };
        const blank=this.checkbox(td, `Given / formatting cell: ${name}`, !cell.blank, toggle);blank.dataset.tableBlank='true';
        if (cell.blank) {
          const options=td.createEl("details");options.createEl("summary",{text:"Answer options"});
          const answer=this.area(
            options,
            `${name} accepted answers`,
            cell.accepted,
            (v) => (cell.accepted = v),
          );
          answerSource=answer;this.tableFields.set(`answer:${r}:${c}`,this.liveFields.get(input)!.dom);
          this.checkbox(
            options,
            `Case sensitive: ${name}`,
            cell.caseSensitive,
            (v) => (cell.caseSensitive = v),
          );
        }
        td.addEventListener("keydown", (e) => {
          if (e.ctrlKey && e.shiftKey && e.code === "KeyB") {
            e.preventDefault();
            e.stopPropagation();
            toggle();
          } else if (
            e.altKey &&
            ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
          ) {
            e.preventDefault();
            e.stopPropagation();
            const nextR = Math.max(
              0,
              Math.min(
                grid.rows.length - 1,
                r + (e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0),
              ),
            );
            const nextC = Math.max(
              0,
              Math.min(
                grid.columns.length - 1,
                c +
                  (e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0),
              ),
            );
            this.focusCell(nextR, nextC);
          }
        });
      });
      const actions = tr.createEl("td");
      if (grid.rows.length > 1)
        this.button(actions, `Remove row ${r + 1}`, () => {
          grid.rows.splice(r, 1);
          this.renderRules();
        });
    });
  }
  private insertTableDimension(column:boolean){
    if(!this.grid||this.mathEditors)return;
    const active=this.contentEl.ownerDocument.activeElement as HTMLElement|null,cell=active?.closest<HTMLElement>('[data-table-column]'),grid=this.grid;
    const row=cell?.dataset.tableRow===undefined?grid.rows.length-1:Number(cell.dataset.tableRow),col=cell?.dataset.tableColumn===undefined?grid.columns.length-1:Number(cell.dataset.tableColumn);
    if(column){grid.columns.splice(col+1,0,'');grid.rows.forEach(r=>r.splice(col+1,0,this.emptyCell()));}
    else grid.rows.splice(row+1,0,grid.columns.map(()=>this.emptyCell()));
    this.renderRules();if(this.validationAttempted)this.validateFields(false);
    if(column){const source=this.gridHost.querySelector<HTMLTextAreaElement>(`th[data-table-column="${col+1}"] textarea`);if(source)this.liveFields.get(source)?.focus();}
    else this.focusCell(row+1,Math.max(0,col));
  }
  private removeTableDimension(column:boolean){
    if(!this.grid||this.mathEditors)return;
    const active=this.contentEl.ownerDocument.activeElement as HTMLElement|null,cell=active?.closest<HTMLElement>('[data-table-column]');
    if(!cell||(!column&&cell.dataset.tableRow===undefined)){new Notice('Focus a cell in the row or column to delete.');return;}
    const grid=this.grid,r=Number(cell.dataset.tableRow??0),c=Number(cell.dataset.tableColumn);
    if((column?grid.columns.length:grid.rows.length)<=1){new Notice('Keep at least one row and one column.');return;}
    if(column){grid.columns.splice(c,1);grid.rows.forEach(row=>row.splice(c,1));}else grid.rows.splice(r,1);
    this.renderRules();if(this.validationAttempted)this.validateFields(false);this.focusCell(Math.min(r,grid.rows.length-1),Math.min(c,grid.columns.length-1));
  }
  private clearValidation(){
    for(const target of this.invalidTargets){target.removeClass('study-invalid-field');target.removeAttribute('aria-invalid');target.querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'));}
    this.invalidTargets=[];this.contentEl.querySelectorAll('.study-field-error').forEach(el=>el.remove());
  }
  private validateFields(focus=true){
    this.validationAttempted=true;this.clearValidation();const issues:{target:HTMLElement;message:string}[]=[];
    if(!this.definition.title.trim())issues.push({target:this.titleInput,message:'Enter a question title.'});
    if(!this.prompt.trim())issues.push({target:this.liveFields.get(this.promptInput)!.dom,message:'Enter a question prompt.'});
    if(this.grid)for(const issue of tableIssues(this.grid)){const target=this.tableFields.get(issue.field);if(target)issues.push({target,message:issue.message});}
    for(const {target,message}of issues){target.addClass('study-invalid-field');target.setAttribute('aria-invalid','true');target.querySelectorAll('.cm-content,input[data-table-blank]').forEach(el=>el.setAttribute('aria-invalid','true'));const hint=createDiv({cls:'study-field-error',text:message});hint.setAttribute('role','alert');target.after(hint);this.invalidTargets.push(target);}
    if(issues.length&&focus){const target=issues[0].target;target.scrollIntoView({block:'center'});(target.matches('input')?target:target.querySelector<HTMLElement>('.cm-content,input[data-table-blank]'))?.focus();}
    if(this.error)this.error.setText(issues.length?'Complete the highlighted fields.':'');return !issues.length;
  }
  private addChoice(index:number){
    if(this.mathEditors||this.definition.type!=='choice')return;
    this.definition.choices!.splice(index,0,{id:`c-${crypto.randomUUID()}`,text:''});
    this.renderRules();this.focusChoice(index);
  }
  private focusChoice(index:number){const source=this.gridHost.querySelectorAll<HTMLTextAreaElement>('.study-author-choice textarea').item(index);if(source)this.liveFields.get(source)?.focus();}
  private focusCell(r: number, c: number) {
    const input=this.gridHost.querySelector<HTMLTextAreaElement>(`[data-cell="${r}:${c}"]`);
    if(input)this.liveFields.get(input)?.focus();
  }
  private activeBlankAnswers(){return blankTokens(this.prompt).map(t=>this.definition.answers?.find(a=>a.id===t.id)).filter((a):a is NonNullable<typeof a>=>!!a);}
  private previewQuestion() {
    if (this.mathEditors) { new Notice("Finish the active math or drawing editor before previewing the question."); return; }
    if(!this.validateFields())return;
    try {
      const definition = this.grid ? applyTable(this.definition, this.grid) : structuredClone(this.definition);
      if(definition.type==='blank')definition.answers=this.activeBlankAnswers();
      validate(definition, this.prompt);
      if(definition.type==="diagram")diagramImage(this.app,definition.diagram!.image,this.file.path);
      const q: Question = { ...this.original, definition, prompt: this.prompt, explanation: this.explanation };
      const modal = new StudioPanel(this.app);
      modal.modalEl.addClass("study-preview-modal");
      modal.titleEl.setText("Question preview");
      modal.contentEl.createEl("p", { text: "Unsaved draft preview. Try an answer or reveal the solution; nothing is added to review history.", cls: "study-muted" });
      const back = modal.contentEl.createEl("button", {text: "Back to editing"});
      back.onclick = () => { modal.close(); this.reveal(); };
      const card = this.createPreview(modal.contentEl.createDiv(), q);
      modal.onOpen = () => card.load();
      modal.onClose = () => { card.unload(); modal.contentEl.empty(); };
      // A preview shortcut must never reach the underlying editor's Save command.
      modal.scope.register(["Ctrl"], "Enter", () => {
        modal.contentEl.querySelector<HTMLButtonElement>(".study-actions button:not(:disabled)")?.click();
        return false;
      });
      modal.open();
    } catch (error) {
      this.error.setText(`Cannot preview yet: ${error instanceof Error ? error.message : String(error)}`);
      this.error.scrollIntoView({block:"nearest"});
    }
  }
  private async save(openNote: boolean) {
    if (this.mathEditors) { new Notice("Finish the active math or drawing editor before saving the question."); return; }
    if (this.busy) return;
    if(!this.validateFields())return;
    this.busy = true;
    this.saveButton.disabled = true;
    this.error.empty();
    try {
      const definition = this.grid
        ? applyTable(this.definition, this.grid)
        : structuredClone(this.definition);
      if(definition.type==='blank')definition.answers=this.activeBlankAnswers();
      if(definition.type==="diagram")diagramImage(this.app,definition.diagram!.image,this.file.path);
      const next = editedSource(
        this.original,
        definition,
        this.prompt,
        this.explanation,
      );
      let savedFile: TFile;
      if (this.createFile) savedFile = await this.createFile(next);
      else {
        if (!(this.file instanceof TFile)) throw Error("Question file is unavailable.");
        savedFile = this.file;
        await this.app.vault.process(savedFile, current => checkedReplacement(current, this.original.raw, next));
      }
      this.close();
      new Notice(
        "Question saved. Reopen existing cards/reviews to load the changes.",
      );
      if (openNote) await this.app.workspace.getLeaf("tab").openFile(savedFile);
    } catch (e) {
      if (!this.closed) {
        this.error.setText(e instanceof Error ? e.message : String(e));
        this.error.tabIndex=-1;this.error.focus();this.error.scrollIntoView({block:'nearest'});
      }
    } finally {
      this.busy = false;
      this.saveButton.disabled = false;
    }
  }
  onClose() {
    this.closed = true;
    this.renderComponent.unload();
    this.contentEl.empty();
  }
}
