import {menuGroup} from './menu-groups';
import {SpeakingNotesView, SPEAKING_NOTES_VIEW} from './speaking-notes';
import {registerScientificOutline} from './scientific-outline';
import {registerScientific} from './scientific-view';
import {ScientificEditor} from './scientific-editor';
import {newScientific,scientificSource} from './scientific-core';
import {STUDIO_ACTIONS, actionHotkeys, shortcutGuide} from './studio-commands';
import {
  Plugin,
  type Command,
  TFile,
  MarkdownView,
  Modal,
  FuzzySuggestModal,
  WorkspaceLeaf,
  Notice,
  Menu,
  MarkdownRenderChild,
} from 'obsidian';
import {DocumentPanel, chooseDocument, openDocument} from './document-view';
import {documentSource, emptyDocumentEmbed} from './document-core';
import { PresentationGallery } from './presentation-gallery';
import { NoteEmbed } from './note-embed';
import { PresentationDetails } from './presentation';
import { newSlide, newDeck, Doc, PageType, deserialize } from './model';
import { Store, RecordDoc } from './store';
import { StudioView, VIEW, type PresentationContext } from './view';
import { Presenter } from './presenter';
import { element, button, input, select } from './render';
export class ChooseFile extends FuzzySuggestModal<TFile> {
  constructor(
    private plugin: SlideStudio,
    private files: TFile[],
    private chosen: (f: TFile) => void,
    placeholder = 'Choose a file',
  ) {
    super(plugin.app);
    this.setPlaceholder(placeholder);
  }
  getItems() {
    return this.files;
  }
  getItemText(f: TFile) {
    return f.basename + ' — ' + f.parent?.path;
  }
  onChooseItem(f: TFile) {
    this.chosen(f);
  }
}
class CreateModal extends Modal {
  constructor(
    private plugin: SlideStudio,
    private kind: 'slide' | 'deck',
    private done: (title: string, type: PageType) => void,
  ) {
    super(plugin.app);
  }
  onOpen() {
    this.titleEl.textContent = this.kind === 'slide' ? 'Create a slide' : 'Create a presentation';
    let title = '',
      type: PageType = 'content';
    const i = input(this.contentEl, 'Title', '', (v) => (title = v));
    i.oninput = () => (title = i.value);
    if (this.kind === 'slide')
      select(
        this.contentEl,
        'Page type',
        type,
        ['content', 'intro', 'section'],
        (v) => (type = v as PageType),
      );
    const save = () => {
      if (!title.trim()) {
        i.focus();
        return;
      }
      this.close();
      this.done(title.trim(), type);
    };
    button(this.contentEl, 'Create', save, 'mod-cta');
    i.onkeydown = (e) => {
      if (e.key === 'Enter') save();
    };
    i.focus();
  }
}
class PresentationModal extends Modal {
  constructor(private plugin: SlideStudio, private source?: TFile) {
    super(plugin.app);
  }
  onOpen() {
    this.titleEl.textContent = 'Create a presentation';
    const cache = this.source && this.app.metadataCache.getFileCache(this.source);
    const heading = cache?.headings?.find((h) => h.level === 1)?.heading;
    const details: PresentationDetails = {
      title: heading || this.source?.basename || '',
      date: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
    };
    const title = input(this.contentEl, 'Title', details.title, (v) => details.title = v);
    title.oninput = () => details.title = title.value;
    title.placeholder = 'Presentation title';
    for (const [key, label, placeholder] of [
      ['author', 'Author', 'Author name'],
      ['affiliation', 'Affiliation', 'Department · Institution'],
      ['date', 'Date', 'Date'],
      ['event', 'Meeting or event (optional)', 'Group meeting, seminar, conference…'],
    ] as const) {
      const field = input(this.contentEl, label, details[key] || '', (v) => details[key] = v);
      field.placeholder = placeholder;
      field.oninput = () => details[key] = field.value;
    }
    element(this.contentEl, 'p', '', 'Creates a separate presentation folder with one editable title slide.');
    let submitted = false;
    const save = () => {
      if (submitted) return;
      if (!details.title.trim()) { title.focus(); return; }
      submitted = true;
      this.close();
      void this.plugin.store.createPresentation(details, this.source?.path)
        .then((r) => this.plugin.open(r.file, this.app.workspace.getLeaf('tab')))
        .catch((e) => this.plugin.error(e));
    };
    button(this.contentEl, 'Create presentation', save, 'mod-cta');
    title.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); save(); } };
    title.focus();
    title.select();
  }
}
export default class SlideStudio extends Plugin {
  notesRecord: RecordDoc | null = null;
  updateSpeakingNotes(record: RecordDoc | null) {
    this.notesRecord = record;
    for (const leaf of this.app.workspace.getLeavesOfType(SPEAKING_NOTES_VIEW))
      if (leaf.view instanceof SpeakingNotesView) void leaf.view.show(record);
  }
  async toggleSpeakingNotes() {
    const existing = this.app.workspace.getLeavesOfType(SPEAKING_NOTES_VIEW);
    if (existing.length) { existing.forEach(leaf => leaf.detach()); return; }
    const leaf = this.app.workspace.getRightLeaf(false);
    if (!leaf) return;
    await leaf.setViewState({type: SPEAKING_NOTES_VIEW, active: true});
    this.app.workspace.revealLeaf(leaf);
  }
  store!: Store;
  skip = new Set<string>();
  presenter: Presenter | null = null;
  commandCatalog: Command[] = [];
  registerStudioCommand(command: Command) { this.commandCatalog.push({...command}); this.addCommand(command); }
  showShortcuts() { return shortcutGuide(this.app, this.manifest.id, this.commandCatalog); }
  async onload() {
    this.store = new Store(this.app);
    this.registerView(SPEAKING_NOTES_VIEW, leaf => new SpeakingNotesView(leaf, this));
    this.registerEvent(this.app.vault.on('modify', file => {
      if(file.path === this.notesRecord?.file.path && file instanceof TFile)
        void this.store.read(file).then(record => {
          if(record.file.path === this.notesRecord?.file.path) this.updateSpeakingNotes(record);
        }).catch(error => this.error(error));
    }));
    for (const action of STUDIO_ACTIONS) this.registerStudioCommand({
      id: action.id, name: action.name, hotkeys: actionHotkeys(action),
      checkCallback: checking => {
        const view = this.app.workspace.getActiveViewOfType(StudioView);
        if (!view || this.presenter || !view.doc || view.locked ||
            (action.deck && view.doc.kind !== 'deck' && !view.presentation)) return false;
        if (!checking) void view.runStudioAction(action.id).catch(e => this.error(e));
        return true;
      },
    });
    this.registerMarkdownCodeBlockProcessor('slide-studio', (source, el, ctx) => {
      ctx.addChild(new NoteEmbed(this, el, source, ctx.sourcePath));
    });
    this.registerStudioCommand({
      id: 'embed-presentation', name: 'Insert presentation',
      editorCallback: (editor) => {
        const cursor = editor.getCursor();
        void this.chooseEmbed(text => editor.replaceRange('\n\n' + text + '\n\n', cursor));
      },
    });
    registerScientific(this);registerScientificOutline(this);
    for(const kind of ['figure','table'] as const)this.registerStudioCommand({id:'insert-scientific-'+kind,name:'Insert '+kind,callback:()=>{const studio=this.app.workspace.getActiveViewOfType(StudioView);if(studio){studio.addScientific(kind);return;}const view=this.app.workspace.getActiveViewOfType(MarkdownView);if(!view?.file){new Notice('Open a note or slide to insert a '+kind+'.');return;}const editor=view.editor,raw=editor.getValue(),cursor=editor.getCursor();new ScientificEditor(this.app,newScientific(kind),v=>{if(editor.getValue()!==raw)throw Error('The note changed while editing. Keep this draft open and copy any needed changes before reopening.');editor.replaceRange('\n\n'+scientificSource(v)+'\n\n',cursor);},view.file.path).open();}});
    let documentGalleryOpen=false;
    let lastDocumentTrigger='';
    this.registerEvent(this.app.workspace.on('editor-change',(editor,info)=>{
      if(documentGalleryOpen||!(info instanceof MarkdownView)||!info.file)return;
      const snapshot=editor.getValue(),offset=editor.posToOffset(editor.getCursor()),slot=emptyDocumentEmbed(snapshot,offset);
      if(!slot){lastDocumentTrigger='';return;}
      const trigger=info.file.path+':'+offset+':'+snapshot;
      if(trigger===lastDocumentTrigger)return;lastDocumentTrigger=trigger;documentGalleryOpen=true;
      // Let Obsidian finish inserting its automatic closing brackets before opening.
      window.setTimeout(()=>{
        documentGalleryOpen=false;
        if(this.app.workspace.getActiveViewOfType(MarkdownView)!==info)return;
        const snapshot=editor.getValue(),slot=emptyDocumentEmbed(snapshot,editor.posToOffset(editor.getCursor()));if(!slot)return;
        lastDocumentTrigger=info.file?.path+':'+editor.posToOffset(editor.getCursor())+':'+snapshot;
        chooseDocument(this.app,'all',source=>{
          if(editor.getValue()!==snapshot){new Notice('The note changed while browsing. Insert again at your current cursor.');return;}
          editor.replaceRange(source.startsWith('```')?'\n\n'+source+'\n\n':source,editor.offsetToPos(slot.start),editor.offsetToPos(slot.end));
        });
      },0);
    }));
    this.registerMarkdownCodeBlockProcessor('document-view', (source, el, ctx) => {
      ctx.addChild(new DocumentPanel(this.app, el, source, ctx.sourcePath));
    });
    for (const [kind, name] of [['md','note'],['pdf','PDF']] as const) {
      this.registerStudioCommand({id:'insert-document-'+kind,name:'Insert '+name,
        editorCallback:editor=>{const cursor=editor.getCursor();chooseDocument(this.app,kind,text=>editor.replaceRange('\n\n'+text+'\n\n',cursor));}});
      this.registerStudioCommand({id:'view-document-'+kind,name:'Open '+name+' in document viewer',
        callback:()=>chooseDocument(this.app,kind,text=>openDocument(this.app,text.split('\n').slice(1,-1).join('\n'),this.app.workspace.getActiveFile()?.path||''),true)});
    }
    this.registerView(VIEW, (leaf) => new StudioView(leaf, this));
    this.addRibbonIcon('presentation', 'Slide Studio', () => void this.library());
    this.registerStudioCommand({
      id: 'open-slide-settings', name: 'Open slide settings',
      hotkeys: [{ modifiers: ['Mod', 'Shift'], key: ',' }],
      checkCallback: checking => {
        const view = this.app.workspace.getActiveViewOfType(StudioView);
        if (!view) return false;
        if (!checking) view.openSettings();
        return true;
      },
    });
    this.registerStudioCommand({
      id: 'open-library',
      name: 'Open slide library',
      callback: () => void this.library(),
    });
    this.registerStudioCommand({
      id: 'new-slide',
      name: 'Create slide',
      callback: () => this.create('slide'),
    });
    this.registerStudioCommand({
      id: 'new-deck',
      name: 'Create presentation',
      callback: () => this.create('deck'),
    });
    this.registerStudioCommand({
      id: 'new-deck-from-note',
      name: 'Create presentation from this note',
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveViewOfType(MarkdownView)?.file;
        if (!file || this.app.metadataCache.getFileCache(file)?.frontmatter?.['slide-studio']) return false;
        if (!checking) new PresentationModal(this, file).open();
        return true;
      },
    });
    const addCreateItem = (menu: Menu, file: TFile) => menu.addItem((item) =>
      item.setTitle('Create presentation from this note…').setIcon('presentation')
        .onClick(() => new PresentationModal(this, file).open()));
    this.registerEvent(this.app.workspace.on('editor-menu', (rootMenu, _editor, view) => {
      const studio = this.app.workspace.getActiveViewOfType(StudioView);
      if (studio) {
        rootMenu.addItem(i => i.setTitle('Slide Studio actions…').setIcon('presentation').onClick(() => studio.showStudioMenu()));
        return;
      }
      if (view.file) {
        const menu=menuGroup(rootMenu,'insert','Embed or link','plus');
        const cursor = _editor.getCursor();
        for(const [kind,name] of [['md','note'],['pdf','PDF']] as const)
          menu.addItem(i=>i.setTitle(name+'…').onClick(()=>chooseDocument(this.app,kind,text=>_editor.replaceRange('\n\n'+text+'\n\n',cursor))));
        const line=_editor.getLine(cursor.line),match=[...line.matchAll(/!?\[\[([^\]]+)\]\]/g)].find(m=>cursor.ch>=m.index!&&cursor.ch<=m.index!+m[0].length);
        if(match)menu.addItem(i=>i.setTitle('Open in document viewer').onClick(()=>openDocument(this.app,documentSource(match[1]).split('\n').slice(1,-1).join('\n'),view.file!.path)));

        menu.addItem(item => item.setTitle('Presentation…').setIcon('presentation').onClick(() =>
          void this.chooseEmbed(text => _editor.replaceRange('\n\n' + text + '\n\n', cursor))));
      }

    }));
    this.registerEvent(this.app.workspace.on('file-menu',(menu,file)=>{
      if(file instanceof TFile&&file.extension==='md'&&!this.app.metadataCache.getFileCache(file)?.frontmatter?.['slide-studio'])addCreateItem(menu,file);
      if(file instanceof TFile && ['md','pdf'].includes(file.extension))
        menu.addItem(i=>i.setTitle('Open in document viewer').setIcon('scan-eye').onClick(()=>
          openDocument(this.app,documentSource(file.path).split('\n').slice(1,-1).join('\n'),file.path)));
    }));
    const readingMenuChildren = new Set<MarkdownRenderChild>();
    this.register(() => { for (const child of [...readingMenuChildren]) child.unload(); readingMenuChildren.clear(); });
    this.registerMarkdownPostProcessor((el, ctx) => {
      // Reading view has no editor-menu event. Leave link/image/code menus intact.
      const owner = new MarkdownRenderChild(el);
      readingMenuChildren.add(owner);
      owner.register(() => readingMenuChildren.delete(owner));
      ctx.addChild(owner);
      owner.registerDomEvent(el, 'contextmenu', (event) => {
        const target = event.target as HTMLElement;
        if (!target.closest('.markdown-reading-view') || target.closest('a,img,code,.ss-document-panel,.ss-scientific')) return;
        const file = this.app.vault.getAbstractFileByPath(ctx.sourcePath);
        if (!(file instanceof TFile) || this.app.metadataCache.getFileCache(file)?.frontmatter?.['slide-studio']) return;
        const shared = event as MouseEvent & {slideStudioMenu?: boolean};
        if (shared.slideStudioMenu) return;
        shared.slideStudioMenu = true;
        event.preventDefault();
        const menu = Menu.forEvent(event);
        const selectedText = el.ownerDocument.getSelection()?.toString() || '';
        if (selectedText) menu.addItem((item) =>
          item.setSection('slide-studio').setTitle('Copy').setIcon('copy').onClick(() =>
            void navigator.clipboard.writeText(selectedText)));
        const insertMenu=menuGroup(menu,'insert','Embed or link','plus');
        for(const kind of ['figure','table'] as const)insertMenu.addItem(i=>i.setSection('slide-studio').setTitle(kind+' at end…').onClick(()=>new ScientificEditor(this.app,newScientific(kind),v=>this.app.vault.process(file,raw=>raw.trimEnd()+'\n\n'+scientificSource(v)+'\n').then(()=>{}),file.path).open()));
        for(const [kind,name] of [['md','note'],['pdf','PDF']] as const)
          insertMenu.addItem(i=>i.setSection('slide-studio').setTitle(name+' at end…').onClick(()=>chooseDocument(this.app,kind,text=>{void this.app.vault.process(file,raw=>raw.trimEnd()+'\n\n'+text+'\n').catch(e=>this.error(e));})));

        insertMenu.addItem(item => item.setSection('slide-studio').setTitle('Presentation at end…').setIcon('presentation').onClick(() =>
          void this.chooseEmbed(text => {
            void this.app.vault.process(file, raw => raw.trimEnd() + '\n\n' + text + '\n')
              .catch(e => this.error(e));
          })));
      });
    });
    this.registerStudioCommand({
      id: 'from-selection',
      name: 'Create slide from selection and insert link',
      editorCheckCallback: (checking, editor, view) => {
        if (!view.file || !editor.getSelection()) return false;
        if (checking) return true;
        const text = editor.getSelection(),
          source = view.file.path;
        const endLine = editor.getCursor('to').line;
        let line = endLine;
        while (line < editor.lastLine() && editor.getLine(line + 1).trim()) line++;
        const pos = { line, ch: editor.getLine(line).length };
        const heading = this.app.metadataCache
          .getFileCache(view.file)
          ?.headings?.filter((h) => h.position.start.line <= endLine)
          .pop()?.heading;
        new CreateModal(
          this,
          'slide',
          (title, type) =>
            void (async () => {
              try {
                const s = newSlide(title, type, text);
                s.source = heading ? `${source}#${heading}` : source;
                const r = await this.store.create(s);
                editor.replaceRange(`\n\n[[${r.file.path.replace(/\.md$/, '')}|${title}]]\n`, pos);
                await this.open(r.file);
              } catch (e) {
                this.error(e);
              }
            })(),
        ).open();
        return true;
      },
    });
    this.registerStudioCommand({
      id: 'gather-outline',
      name: 'Build presentation from slide links in current note',
      callback: () => void this.gather(),
    });
    this.registerStudioCommand({
      id: 'present',
      hotkeys: [{modifiers:['Mod','Alt'], key:'p'}],
      name: 'Present current slide or deck',
      callback: () => {
        const v = this.app.workspace.getActiveViewOfType(StudioView);
        if (v) void v.present();
        else {
          const f = this.app.workspace.getActiveFile();
          if (f)
            void this.store
              .read(f)
              .then((r) => this.present(r))
              .catch((e) => this.error(e));
        }
      },
    });
    const slideCommand = (
      id: string,
      name: string,
      run: (view: StudioView) => void,
      selected = false,
    ) => {
      this.registerStudioCommand({
        id,
        name,
        checkCallback: (checking) => {
          const view = this.app.workspace.getActiveViewOfType(StudioView);
          if (!view || view.doc?.kind !== 'slide' || view.locked || this.presenter) return false;
          if (selected && !view.doc.blocks.some((b) => b.id === view.selected)) return false;
          if (!checking) run(view);
          return true;
        },
      });
    };
    slideCommand('add-text-block', 'Add text or math block', (v) => v.addBlock('markdown'));
    slideCommand('add-image-block', 'Add image from vault', (v) => v.addImage());
    slideCommand('import-image', 'Import image', (v) => v.pickImages());
    slideCommand('add-note-block', 'Add linked note block', (v) => v.addNote());
    slideCommand('insert-note-window', 'Insert note window on slide', v=>v.addDocument('md'));
    slideCommand('insert-pdf-window', 'Insert PDF window on slide', v=>v.addDocument('pdf'));
    slideCommand('delete-block', 'Delete selected block', (v) => v.deleteBlock(), true);
    slideCommand(
      'duplicate-block',
      'Duplicate selected block',
      (v) => {
        if (v.doc?.kind === 'slide')
          v.duplicateBlock(v.doc.blocks.find((b) => b.id === v.selected)!);
      },
      true,
    );
    slideCommand(
      'edit-block',
      'Edit selected text block on slide',
      (v) => {
        if (v.doc?.kind === 'slide') v.editInline(v.doc.blocks.find((b) => b.id === v.selected)!);
      },
      true,
    );
    for (const [direction, name] of [
      ['forward', 'Bring selected block forward'],
      ['backward', 'Send selected block backward'],
      ['front', 'Bring selected block to front'],
      ['back', 'Send selected block to back'],
    ] as const) {
      slideCommand(
        `block-${direction}`,
        name,
        (v) => {
          if (v.doc?.kind === 'slide')
            v.reorderBlock(
              v.doc.blocks.find((b) => b.id === v.selected)!,
              direction,
            );
        },
        true,
      );
    }
    this.registerStudioCommand({
      id: 'open-current-new-window',
      name: 'Open current slide or presentation in new window',
      checkCallback: (checking) => {
        const view = this.app.workspace.getActiveViewOfType(StudioView);
        if (!view?.record || this.presenter) return false;
        if (!checking) void view.flush().then(() => this.openWindow(view.record!.file));
        return true;
      },
    });
    this.registerEvent(
      this.app.workspace.on('file-open', (file) => {
        if (!file) return;
        if (this.skip.delete(file.path)) return;
        const leaf = this.app.workspace.getMostRecentLeaf();
        if (!leaf || !(leaf.view instanceof MarkdownView)) return;
        void this.app.vault.cachedRead(file).then((raw) => {
          if (
            /^slide-studio: (slide|deck)\s*$/m.test(raw) &&
            leaf.view instanceof MarkdownView &&
            leaf.view.file?.path === file.path
          )
            void this.open(file, leaf);
        });
      }),
    );
    this.registerEvent(
      this.app.workspace.on('file-menu', (menu, file) => {
        if (file instanceof TFile && file.extension === 'md') {
          if (!this.app.metadataCache.getFileCache(file)?.frontmatter?.['slide-studio']) {
            const insertMenu=menuGroup(menu,'insert','Embed or link','plus');
        for(const kind of ['figure','table'] as const)insertMenu.addItem(i=>i.setTitle(kind+' at end…').onClick(()=>new ScientificEditor(this.app,newScientific(kind),v=>this.app.vault.process(file,raw=>raw.trimEnd()+'\n\n'+scientificSource(v)+'\n').then(()=>{}),file.path).open()));
        for(const [kind,name] of [['md','note'],['pdf','PDF']] as const)
          insertMenu.addItem(i=>i.setTitle(name+' at end…').onClick(()=>chooseDocument(this.app,kind,text=>{void this.app.vault.process(file,raw=>raw.trimEnd()+'\n\n'+text+'\n').catch(e=>this.error(e));})));

            return;
          }
          menu.addItem((i) =>
            i
              .setTitle('Open in Slide Studio')
              .setIcon('presentation')
              .onClick(() => void this.open(file)),
          );
        }
      }),
    );
    this.registerObsidianProtocolHandler('slide-studio', (p) => {
      if (p.vault && p.vault !== this.app.vault.getName()) return;
      void (async () => {
        const records = await this.store.list();
        const matches = records.filter((r) => r.doc.id === p.id);
        if (matches.length !== 1)
          throw new Error('Slide or presentation is missing, or its ID is duplicated.');
        if (p.mode === 'present') await this.present(matches[0], p.slide);
        else await this.open(matches[0].file);
      })().catch((e) => this.error(e));
    });
  }
  async chooseEmbed(insert: (source: string) => void) {
    try {
      const records = await this.store.list('deck');
      if (!records.length) { new Notice('Create a presentation first.'); return; }
      new PresentationGallery(this, records, insert).open();
    } catch (e) { this.error(e); }
  }
  error(e: unknown) {
    console.error('Slide Studio:', e);
    new Notice((e as Error).message || String(e), 9000);
  }
  async open(file: TFile, leaf?: WorkspaceLeaf, presentation?: PresentationContext) {
    try {
      await this.store.read(file);
      const target =
        leaf ?? this.app.workspace.getLeavesOfType(VIEW)[0] ?? this.app.workspace.getLeaf('tab');
      await target.setViewState({ type: VIEW, active: true, state: { file: file.path, presentation } });
      this.app.workspace.revealLeaf(target);
    } catch (e) {
      this.error(e);
    }
  }
  async openWindow(file: TFile) {
    const leaf = this.app.workspace.openPopoutLeaf({ size: { width: 1280, height: 850 } });
    await this.open(file, leaf);
  }
  async library() {
    const records = await this.store.list();
    if (!records.length) {
      this.create('slide');
      return;
    }
    new ChooseFile(
      this,
      records.map((r) => r.file),
      (f) => void this.open(f),
      'Open a slide or presentation',
    ).open();
  }
  create(kind: 'slide' | 'deck') {
    if (kind === 'deck') { new PresentationModal(this).open(); return; }
    new CreateModal(
      this,
      kind,
      (title, type) =>
        void this.store
          .create(kind === 'slide' ? newSlide(title, type) : newDeck(title))
          .then((r) => this.open(r.file))
          .catch((e) => this.error(e)),
    ).open();
  }
  async gather() {
    const f = this.app.workspace.getActiveFile();
    if (!f) {
      new Notice('Open the outline note first.');
      return;
    }
    const entries = await this.store.collect(f);
    if (!entries.length) {
      new Notice('No linked Slide Studio slides found in this note.');
      return;
    }
    new CreateModal(
      this,
      'deck',
      (title) =>
        void this.store
          .copyPresentation({ file: f, doc: newDeck(title, entries), raw: '' }, title)
          .then((r) => this.open(r.file))
          .catch((e) => this.error(e)),
    ).open();
  }
  async present(r: RecordDoc, startId?: string, doc: Document = activeDocument) {
    this.presenter?.close();
    this.presenter = new Presenter(this.app, this.store, r, () => (this.presenter = null), doc);
    try {
      await this.presenter.start(startId);
    } catch (e) {
      this.presenter?.close();
      this.error(e);
    }
  }
  async duplicate(r: RecordDoc, shared = false) {
    try {
      const created = r.doc.kind === 'deck'
        ? await this.store.copyPresentation(r, r.doc.title + ' — copy', shared)
        : await this.store.copySlide(r, r.file.parent?.path || 'Slides/Library', r.doc.title + ' — copy');
      await this.open(created.file);
    } catch (e) { this.error(e); }
  }
  createSlideInPresentation(deck: RecordDoc, done: (r: RecordDoc) => void) {
    new CreateModal(this, 'slide', (title, type) => {
      void this.store.create(newSlide(title, type), this.store.slideFolder(deck))
        .then(done).catch(e => this.error(e));
    }).open();
  }
  async markdown(r: RecordDoc) {
    this.skip.add(r.file.path);
    const leaf = this.app.workspace.getLeaf('tab');
    await leaf.openFile(r.file);
  }
  link(r: RecordDoc, mode = 'edit', slide?: string) {
    return `obsidian://slide-studio?vault=${encodeURIComponent(this.app.vault.getName())}&id=${encodeURIComponent(r.doc.id)}&mode=${mode}${slide ? '&slide=' + encodeURIComponent(slide) : ''}`;
  }
  onunload() {
    this.presenter?.close();
  }
}
