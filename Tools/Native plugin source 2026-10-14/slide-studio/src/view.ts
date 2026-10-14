import {ScientificEditor} from './scientific-editor';
import {newScientific,scientificSource,Kind} from './scientific-core';
import {chooseDocument} from './document-view';
import {researchOutline} from './research-outline';
import {ZoomViewport} from './zoom';
import {fitZoom, type ZoomState} from './zoom-core';
import {mountJumpGallery,jumpSlideNumber} from './jump-gallery';
import {STUDIO_ACTIONS, matchesHotkey, type StudioAction} from './studio-commands';
import { embedSource } from './embed-core';
import {prepareCitations,blockKey} from './citation-context';
import {referencePages} from './citations-core';
import {previewReferences} from './references-render';
import {citationFooter} from './citation-render';
import {footer} from './render';
import { outlinePlan } from './outlines';
import { previewOutline } from './outline-render';
import { drawOrganizer, browsePresentations, newSectionDialog, groupSlidesDialog, moveSlidesDialog } from './organizer';
import { ensureSections, orderSlides, moveSlidesTo, createSection, setSectionFooter } from './sections';
import { ItemView, WorkspaceLeaf, ViewStateResult, TFile, Component, Notice, Menu, Modal, Scope } from 'obsidian';
import { SettingsPalette } from './settings-palette';
import type SlideStudio from './main';
import { ChooseFile } from './main';
import {
  Doc,
  Slide,
  Deck,
  Block,
  Theme,
  clone,
  block,
  clampGeometry,
  moveEntry,
  DEFAULT_THEME,
  sectionAt,
  sectionStart,
  standaloneTheme,
  PRESENTATION_THEMES,
  presentationThemeLabel,
  applyPresentationTheme,
  themeForSlide,
  slidePageNumber,
  trashSlide,
  restoreSlide,
  moveEntries,
} from './model';
import { RecordDoc } from './store';
import {
  element,
  button,
  input,
  select,
  renderSlide,
  place,
  renderBlock,
  editableFooter,
  cancelFooterEdit,
} from './render';
import { mountNativeEditor } from './inline-editor';
import { replaceBlockLinkText, sourceInteraction } from './code-links';
import { isImageFile, imageGeometry } from './attachments';
import { chooseFile, chooseImage, GalleryHost, naturalImageGeometry } from './gallery';
export const VIEW = 'slide-studio-view';
export type PresentationContext = {file: string; index: number; railScroll?: number; organizing?: boolean; viewport?: ZoomState};
export class StudioView extends ItemView {
  outlineRecords: (RecordDoc | null)[] = [];
  revealOutlineSelection = false;
  getResearchOutline() {
    const deck = this.doc?.kind === 'deck' ? this.doc : this.presentationRecord?.doc.kind === 'deck' ? this.presentationRecord.doc : null;
    const records = this.doc?.kind === 'deck' ? this.outlineRecords : this.presentationRecords;
    const index = this.doc?.kind === 'deck' ? this.index : this.presentation?.index ?? 0;
    const entries = deck ? researchOutline(deck, records.map(r => r?.doc.kind === 'slide' ? r.doc : null))
      : this.doc ? [{heading: this.doc.title, level: 1, slideIndex: 0, kind: 'slide' as const}] : [];
    return {version: 1 as const, key: `slide-studio:${deck?.id ?? this.doc?.id ?? ''}`,
      entries, active: entries.findIndex(e => e.kind === 'slide' && e.slideIndex === index),
      jump: async (entry: number) => {
        const target = entries[entry]?.slideIndex;
        if (target === undefined || target < 0 || this.closed || this.locked) return;
        if (this.presentation) await this.finishEditing();
        const view = this.leaf.view;
        if (!(view instanceof StudioView) || view.locked || view.closed) return;
        if (deck && view.doc?.id !== deck.id) return;
        view.index = target;
        view.revealOutlineSelection = true;
        view.selectedSlides = new Set([target]);
        view.organizing = false;
        await view.draw();
        this.app.workspace.setActiveLeaf(this.leaf, {focus: true});
      }};
  }
  presentation?: PresentationContext;
  zoomState = fitZoom();
  viewport?: ZoomViewport;
  private changingEditView = false;
  presentationRecord: RecordDoc | null = null;
  presentationRecords: (RecordDoc | null)[] = [];
  editingTheme(s: Slide): Theme {
    return this.presentationRecord?.doc.kind === 'deck' ? themeForSlide(this.presentationRecord.doc, s) : standaloneTheme(s);
  }
  editingLabel(s: Slide): string {
    return this.presentationRecord?.doc.kind === 'deck'
      ? sectionAt(this.presentationRecord.doc, this.presentation!.index, this.presentationRecords.map(r => r?.doc.kind === 'slide' ? r.doc : null)) : s.section;
  }
  editingPage(s: Slide): string {
    return this.presentationRecord?.doc.kind === 'deck'
      ? slidePageNumber(this.presentationRecord.doc.theme, this.presentationRecords.map(r => r?.doc.kind === 'slide' ? r.doc : null), this.presentation!.index)
      : s.type === 'intro' ? '' : '1';
  }
  editingCitationRecords(s: Slide) {
    return this.presentationRecord ? this.presentationRecords.map(r => r?.doc.id === s.id ? {file: this.record!.file, doc: s} : r) : [{file: this.record!.file, doc: s}];
  }
  async openDeckSlide(file: TFile, index = this.index, leaf = this.leaf, blockId?: string) {
    if (this.doc?.kind !== 'deck' || !this.record || this.changingEditView) return;
    const presentation = {file: this.record.file.path, index,
      railScroll: this.rail?.scrollTop ?? this.railScroll, organizing: this.organizing, ...(this.zoomState ? {viewport: {...this.zoomState}} : {})};
    this.changingEditView = true;
    try {
      await this.flush();
      if (this.locked) return;
      await this.plugin.open(file, leaf, presentation);
      const view = leaf.view;
      if (view instanceof StudioView && view.doc?.kind === 'slide' && view.record?.file.path === file.path) {
        const b = view.doc.blocks.find(b => b.id === blockId);
        if (b) { view.selectBlock(b.id); view.editInline(b); }
        // Images have resize/drag handles; no native text editor to take focus.
        if (!view.inline) { view.stage.tabIndex = -1; view.stage.focus({preventScroll: true}); }
      }
    } finally { this.changingEditView = false; }
  }
  async finishEditing() {
    if (this.changingEditView) return;
    this.finishInline();
    const context = this.presentation;
    if (!context) return;
    if (this.zoomState) context.viewport = {...this.zoomState};
    this.changingEditView = true;
    try {
      await this.flush();
      if (this.locked) return;
      this.palette?.hide();
      await this.leaf.setViewState({type: VIEW, active: true,
        state: {file: context.file, index: context.index, deckView: context}});
      const view = this.leaf.view;
      if (view instanceof StudioView && view.record?.file.path === context.file) {
        view.stage.tabIndex = -1;
        view.stage.focus({preventScroll: true});
      }
    } finally { this.changingEditView = false; }
  }
  organizing = false;
  organizerZoom = 150;
  organizerScroll = 0;
  collapsedSections = new Set<string>();
  palette: SettingsPalette | null = null;
  railScroll = 0;
  selectedSlides = new Set<number>();
  selectionAnchor = 0;
  focusRail = false;
  inline: { id: string; destroy(): void } | null = null;
  record: RecordDoc | null = null;
  doc: Doc | null = null;
  selected = '';
  preserveImageRatio = true;
  index = 0;
  dirty = false;
  locked = false;
  closed = false;
  saveTimer = 0;
  writing: Promise<void> | null = null;
  status!: HTMLElement;
  body!: HTMLElement;
  rail!: HTMLElement;
  inspector!: HTMLElement;
  stage!: HTMLElement;
  mount!: HTMLElement;
  renderOwner: Component | null = null;
  history: Doc[] = [];
  future: Doc[] = [];
  revision = 0;
  blockNodes = new Map<string, { node: HTMLElement; content: HTMLElement }>();
  constructor(
    leaf: WorkspaceLeaf,
    public plugin: SlideStudio,
  ) {
    super(leaf);
    this.scope = new Scope(this.app.scope);
    this.scope.register(null, null, (event, ctx) => {
      if (this.plugin.presenter) return;
      const custom=(this.app as any).hotkeyManager?.customKeys ?? {};
      const mac=/Mac/.test(navigator.platform);
      for (const command of this.plugin.commandCatalog) {
        const id=`${this.plugin.manifest.id}:${command.id}`;
        const keys=Object.prototype.hasOwnProperty.call(custom,id)?custom[id]:command.hotkeys??[];
        if(!keys.some((key: import('obsidian').Hotkey)=>matchesHotkey(event,key,mac,ctx.vkey || ctx.key || undefined)))continue;
        if(command.checkCallback && !command.checkCallback(true))continue;
        if(!command.checkCallback && !command.callback)continue;
        if(!event.repeat) {if(command.checkCallback)command.checkCallback(false);else command.callback!();}
        return false;
      }
    });
    this.scope.register([], 'Escape', (event) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('.ss-settings-window')) {
        this.palette?.hide(); return false;
      }
      // Nested dialogs own their Escape scope. Local fields keep their DOM
      // handlers, but must not fall through to the vault's global navigation.
      if (target?.closest('.modal-container')) return;
      if (cancelFooterEdit(target)) return false;
      if (!event.repeat && (this.presentation || this.inline) &&
          !target?.closest('input,textarea,[contenteditable=true]')) {
        queueMicrotask(() => void this.finishEditing().catch(error => this.plugin.error(error)));
      }
      // Escape is contained even after returning to the deck (or on a
      // standalone slide), including a held key's repeat events.
      return false;
    });
  }
  getViewType() {
    return VIEW;
  }
  getDisplayText() {
    return this.doc?.title ?? 'Slide Studio';
  }
  getIcon() {
    return 'presentation';
  }
  getState() {
    return { file: this.record?.file.path, index: this.index, presentation: this.presentation };
  }
  async setState(state: any, result: ViewStateResult) {
    if (this.record?.file.path !== state.file) {
      await this.flush();
      if (this.locked) {
        new Notice('Save a recovery copy before leaving this draft.');
        return;
      }
      const file = this.app.vault.getAbstractFileByPath(state.file);
      if (!(file instanceof TFile)) throw new Error('Slide file not found.');
      this.record = await this.plugin.store.read(file);
      this.doc = clone(this.record.doc);
      this.history = [];
      this.future = [];
      this.selected = '';
      this.selectedSlides.clear();
      this.dirty = false;
      this.locked = false;
    }
    this.presentation = this.doc?.kind === 'slide' ? state.presentation : undefined;
    this.presentationRecord = null; this.presentationRecords = [];
    if (this.presentation) {
      const file = this.app.vault.getAbstractFileByPath(this.presentation.file);
      if (file instanceof TFile) {
        const record = await this.plugin.store.read(file);
        if (record.doc.kind === 'deck') {
          const requested = this.presentation.index;
          const index = record.doc.slides[requested]?.id === this.doc?.id
            ? requested : record.doc.slides.findIndex(e => e.id === this.doc?.id);
          if (index >= 0) {
            this.presentation.index = index; this.presentationRecord = record;
            this.presentationRecords = await this.plugin.store.resolveMany(record.doc.slides);
          }
        }
      }
      if (!this.presentationRecord) this.presentation = undefined;
    }
    const viewport = state.deckView?.viewport ?? state.presentation?.viewport;
    if (viewport && [viewport.zoom, viewport.x, viewport.y].every(Number.isFinite) && viewport.zoom >= .5 && viewport.zoom <= 8) this.zoomState = {...viewport};
    this.index = state.index ?? 0;
    if (this.doc?.kind === 'deck' && state.deckView) this.organizing = state.deckView.organizing === true;
    await this.draw();
    if (this.doc?.kind === 'deck' && Number.isFinite(state.deckView?.railScroll)) {
      this.railScroll = state.deckView.railScroll;
      this.rail.scrollTop = this.railScroll;
    if (this.revealOutlineSelection) {
      this.revealOutlineSelection = false;
      this.rail.querySelector<HTMLElement>(`.ss-slide-card[data-slide-index="${this.index}"]`)
        ?.scrollIntoView({block: 'nearest', inline: 'nearest'});
      this.railScroll = this.rail.scrollTop;
    }
    }
    await super.setState(state, result);
  }
  showDocumentMenu() {
    if(!this.doc || !this.record)return;
      const menu = new Menu();
      const item = (title: string, action: () => unknown) =>
        menu.addItem((i) =>
          i.setTitle(title).onClick(() => {
            void action();
          }),
        );
      item('New slide', () => {
        if (this.doc?.kind === 'deck') {
          const id = this.doc.id;
          this.plugin.createSlideInPresentation(this.record!, r => this.appendSlide(r, id));
        } else this.plugin.create('slide');
      });
      item('New deck', () => this.plugin.create('deck'));
      item('Open in new window', () =>
        this.flush().then(() => this.plugin.openWindow(this.record!.file)),
      );
      menu.addSeparator();
      if (this.doc!.kind === 'deck') item('Copy embed', () =>
        navigator.clipboard.writeText(embedSource(this.doc!.id, this.record!.file.path))
          .then(() => new Notice('Presentation embed copied. Paste it into any note in this vault.')));
      item('Copy note link', () =>
        navigator.clipboard
          .writeText(`[[${this.record!.file.path.replace(/\.md$/, '')}|${this.doc!.title}]]`)
          .then(() => new Notice('Note link copied.')),
      );
      item('Copy presentation link', () =>
        navigator.clipboard
          .writeText(`[${this.doc!.title}](${this.plugin.link(this.record!, 'present')})`)
          .then(() => new Notice('Presentation link copied.')),
      );
      item('Open Markdown', () => this.flush().then(() => this.plugin.markdown(this.record!)));
      item(this.doc!.kind === 'deck' ? 'Duplicate presentation — independent slides' : 'Duplicate slide', () =>
        this.flush().then(() => this.plugin.duplicate({ ...this.record!, doc: this.doc! })),
      );
      if (this.doc!.kind === 'deck') {
        item('Duplicate presentation — share existing slides', () =>
          this.flush().then(() => this.plugin.duplicate({ ...this.record!, doc: this.doc! }, true)));
        if (this.record!.file.parent?.path === 'Presentations')
          item('Organize into presentation folder', () => this.flush().then(async () => {
            try {
              const r = await this.plugin.store.organizePresentation(this.record!);
              await this.plugin.open(r.file, this.leaf);
            } catch (e) { this.plugin.error(e); }
          }));
      }
    const r=this.stage.getBoundingClientRect();menu.showAtPosition({x:r.left+40,y:r.top+40});
  }
  showSectionActions() {
    const menu=new Menu();
    for(const action of STUDIO_ACTIONS.filter(a=>['new-section','group-slides','move-slides','trash-selected-slides','collapse-sections','expand-sections'].includes(a.id))) {
      menu.addItem(i=>i.setTitle(action.name+'…').setDisabled(this.locked).onClick(()=>void this.runStudioAction(action.id).catch(e=>this.plugin.error(e))));
    }
    const r=this.stage.getBoundingClientRect();menu.showAtPosition({x:r.left+40,y:r.top+40});
  }
  addStudioMenuItems(menu: Menu) {
    const hasDeck = this.doc?.kind === 'deck' || !!this.presentation;
    for (const action of STUDIO_ACTIONS) {
      if (action.id === 'studio-actions' || (action.deck && !hasDeck)) continue;
      if (['new-section','group-slides','move-slides','trash-selected-slides','collapse-sections','expand-sections'].includes(action.id)) continue;
      menu.addItem(i => i.setTitle(action.name + '…')
        .setDisabled(this.locked).onClick(() => void this.runStudioAction(action.id).catch(e => this.plugin.error(e))));
    }
    if(hasDeck) {
      menu.addSeparator();
      menu.addItem(i=>i.setTitle('Section and selection actions…').onClick(()=>this.showSectionActions()));
    }
    menu.addSeparator();
    menu.addItem(i=>i.setTitle('More document actions…').onClick(()=>this.showDocumentMenu()));
    menu.addItem(i => i.setTitle('Settings…').setIcon('settings').onClick(() => this.openSettings()));
    menu.addItem(i => i.setTitle('Toggle speaking notes').setIcon('notebook-pen').onClick(() => void this.plugin.toggleSpeakingNotes()));
    menu.addItem(i => i.setTitle('Present').setIcon('play').onClick(() => void this.present()));
    menu.addItem(i => i.setTitle('Slide library…').setIcon('library').onClick(() => void this.plugin.library()));
    menu.addItem(i => i.setTitle('Undo').setIcon('undo').setDisabled(!this.history.length).onClick(() => this.undo()));
    menu.addItem(i => i.setTitle('Redo').setIcon('redo').setDisabled(!this.future.length).onClick(() => this.redo()));
  }
  showStudioMenu(event?: MouseEvent) {
    const menu = new Menu(); this.addStudioMenuItems(menu);
    if (event) menu.showAtMouseEvent(event);
    else {const r=this.stage.getBoundingClientRect();menu.showAtPosition({x:r.left+40,y:r.top+40});}
  }
  async runStudioAction(action: StudioAction) {
    if (action === 'speaking-notes') { await this.plugin.toggleSpeakingNotes(); return; }
    if (action === 'zoom-in' || action === 'zoom-out' || action === 'zoom-fit') {
      if (this.organizing) { new Notice('Open a slide to zoom its preview.'); return; }
      if (action === 'zoom-fit') this.viewport?.reset();
      else this.viewport?.zoom(action === 'zoom-in' ? 1.25 : .8);
      return;
    }
    if (action === 'shortcut-guide') { await this.plugin.showShortcuts(); return; }
    if (action === 'studio-actions') { this.showStudioMenu(); return; }
    if (this.locked) return;
    if (this.doc?.kind === 'slide' && this.presentation) await this.finishEditing();
    if (this.doc?.kind !== 'deck' || !this.record || this.locked) return;
    const deck=this.doc;
    if (action === 'create-deck-slide') this.plugin.createSlideInPresentation(this.record, r => this.appendSlide(r,deck.id));
    else if (action === 'copy-deck-slide') await this.addSlide(false);
    else if (action === 'share-deck-slide') await this.addSlide(true);
    else if (action === 'bring-in-slides') await browsePresentations(this);
    else if (action === 'browse-slide-trash') this.openTrash(deck);
    else if (action === 'new-section') newSectionDialog(this,deck);
    else if (action === 'group-slides' || action === 'move-slides' || action === 'trash-selected-slides') {
      if(!this.selectedSlides.size){new Notice('Select slides first.');return;}
      if(action==='group-slides')groupSlidesDialog(this,deck);
      else if(action==='move-slides')moveSlidesDialog(this,deck);
      else this.change(()=>{[...this.selectedSlides].sort((a,b)=>b-a).forEach(i=>trashSlide(deck,i));this.selectedSlides.clear();});
    } else if (action === 'collapse-sections' || action === 'expand-sections') {
      this.collapsedSections=action==='collapse-sections'?new Set(deck.sections?.map(s=>s.id)):new Set();
      this.organizing=true;await this.draw();
    }
    else if (action === 'organize-presentation') {
      if (!deck.sections) {
        const records=await this.plugin.store.resolveMany(deck.slides);
        if(this.doc!==deck)return;
        this.change(() => {ensureSections(deck,records.map(r=>r?.doc.kind==='slide'?r.doc:null));this.organizing=!this.organizing;});
      } else {this.organizing=!this.organizing;await this.draw();}
    } else if (action === 'edit-current-slide') {
      const entry=deck.slides[this.index]; if(!entry)return;
      const record=await this.plugin.store.resolve(entry);
      if(record && this.doc===deck) await this.openDeckSlide(record.file);
    } else if (action === 'go-to-slide') {
      const records=await this.plugin.store.resolveMany(deck.slides);
      if(this.doc!==deck)return;
      if(!deck.slides.length){new Notice('This presentation has no slides yet.');return;}
      const slides=records.map(r=>r?.doc.kind==='slide'?r.doc:null);
      const citations=await prepareCitations(this.app,records,this.record.file.path);
      if(this.doc!==deck)return;
      const modal=new Modal(this.app);modal.titleEl.textContent='Go to slide';modal.modalEl.classList.add('ss-jump-modal');modal.open();
      const owner=mountJumpGallery(modal.contentEl,deck.slides.map((_,index)=>({index,number:jumpSlideNumber(deck.theme,slides,index),title:records[index]?.doc.title??'Missing slide'})),this.index,index=>{
        if(this.doc!==deck)return;
        modal.close();this.index=index;this.selectionAnchor=index;this.selectedSlides=new Set([index]);
        this.organizing=false;this.focusRail=true;void this.draw();
      },async(item,stage,component)=>{
        const record=records[item.index];if(record?.doc.kind!=='slide')return;
        await renderSlide(this.app,stage,record.doc,record.file.path,component,themeForSlide(deck,record.doc),sectionAt(deck,item.index,slides),slidePageNumber(deck.theme,slides,item.index),undefined,citations);
      },{shell:modal.modalEl,scope:modal.scope});
      modal.onClose=()=>owner.unload();
    }
  }
  openSettings() { this.palette?.show(); }
  async onOpen() {
    this.contentEl.classList.add('ss-view');
    this.registerDomEvent(this.contentEl, 'contextmenu', event => {
      if ((event.target as HTMLElement).closest('a,input,textarea,[contenteditable=true],.ss-inline-editor,.code-links-panel')) return;
      event.preventDefault(); event.stopPropagation(); this.showStudioMenu(event);
    });
    this.registerDomEvent(this.contentEl.ownerDocument.defaultView!, 'keydown', (e) => {
      if (this.app.workspace.activeLeaf !== this.leaf) return;
      const target = e.target as HTMLElement;
      if (target.closest(sourceInteraction) || target.closest('.modal-container'))
        return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        e.stopImmediatePropagation();
        e.shiftKey ? this.redo() : this.undo();
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && this.selected) {
        e.preventDefault();
        this.deleteBlock();
      }
    });
    this.registerEvent(this.app.workspace.on('active-leaf-change', leaf => {
      if (leaf !== this.leaf) this.palette?.hide();
    }));
    const resize = new ResizeObserver(() => this.fit());
    resize.observe(this.contentEl);
    this.register(() => resize.disconnect());
    this.registerEvent(
      this.app.vault.on('modify', (f) => {
        if (this.doc && !this.dirty && !this.writing && f.path !== this.record?.file.path) {
          const sourcePath = this.record?.file.path ?? '';
          const linked =
            this.doc.kind === 'slide' &&
            this.doc.blocks.some(
              (b) =>
                b.kind === 'note' &&
                this.app.metadataCache.getFirstLinkpathDest(
                  b.text
                    .replace(/^!?\[\[/, '')
                    .replace(/\]\]$/, '')
                    .split('#')[0]
                    .split('|')[0],
                  sourcePath,
                )?.path === f.path,
            );
          const deckSlide =
            this.doc.kind === 'deck' &&
            this.doc.slides.some(
              (e) => e.id === this.app.metadataCache.getFileCache(f as TFile)?.frontmatter?.id,
            );
          if (linked || deckSlide) void this.draw();
        }
        if (f.path !== this.record?.file.path || this.writing || this.dirty) return;
        void this.plugin.store
          .read(f as TFile)
          .then((r) => {
            if (
              this.record?.file.path === r.file.path &&
              r.raw !== this.record.raw &&
              !this.dirty &&
              !this.writing
            ) {
              this.record = r;
              this.doc = clone(r.doc);
              this.history = [];
              this.future = [];
              void this.draw();
            }
          })
          .catch((e) => this.plugin.error(e));
      }),
    );
  }
  async onClose() {
    this.viewport?.unload();
    this.finishInline(false);
    this.closed = true;
    clearTimeout(this.saveTimer);
    await this.flush();
    if (this.locked && this.doc) {
      await this.recover(false);
    }
    this.renderOwner?.unload();
    this.palette?.destroy();
    this.palette = null;
  }
  checkpoint() {
    if (!this.doc) return;
    this.history.push(clone(this.doc));
    if (this.history.length > 80) this.history.shift();
    this.future = [];
  }
  change(fn: () => void, draw = true) {
    if (this.locked) return;
    this.checkpoint();
    fn();
    if (this.doc?.kind === 'deck') orderSlides(this.doc);
    this.changed();
    if (draw) void this.draw();
  }
  changed() {
    this.contentEl
      .querySelector<HTMLButtonElement>('.ss-undo')
      ?.toggleAttribute('disabled', !this.history.length);
    this.contentEl
      .querySelector<HTMLButtonElement>('.ss-redo')
      ?.toggleAttribute('disabled', !this.future.length);
    this.dirty = true;
    this.setStatus('Saving…');
    clearTimeout(this.saveTimer);
    this.saveTimer = window.setTimeout(() => void this.flush(), this.inline ? 650 : 220);
  }
  setStatus(text: string) {
    if (this.status) this.status.textContent = text;
  }
  async flush(): Promise<void> {
    clearTimeout(this.saveTimer);
    if (this.writing) {
      await this.writing;
      if (this.dirty && !this.locked) await this.flush();
      return;
    }
    if (!this.dirty || !this.doc || !this.record || this.locked) return;
    const record = this.record,
      snapshot = clone(this.doc);
    this.dirty = false;
    this.writing = (async () => {
      try {
        const raw = await this.plugin.store.save(record, snapshot);
        record.raw = raw;
        record.doc = snapshot;
        this.setStatus(this.dirty ? 'Saving…' : 'Saved');
      } catch (e) {
        this.dirty = true;
        this.locked = true;
        this.setStatus('Conflict — save recovery copy');
        this.plugin.error(e);
        if (!this.closed) this.recoveryUI();
      }
    })();
    await this.writing;
    this.writing = null;
    if (this.dirty && !this.locked) await this.flush();
  }
  recoveryUI() {
    if (!this.inspector) return;
    button(this.inspector, 'Save recovery copy', () => void this.recover(), 'mod-warning');
  }
  async recover(open = true) {
    if (!this.doc) return;
    const d = clone(this.doc);
    d.id = crypto.randomUUID();
    d.title += ' — recovered draft';
    const r = await this.plugin.store.create(d);
    this.locked = false;
    this.dirty = false;
    new Notice('Draft preserved in ' + r.file.path);
    if (open) await this.plugin.open(r.file, this.leaf);
  }
  undo() {
    if (!this.history.length || !this.doc || this.locked) return;
    this.future.push(clone(this.doc));
    this.doc = this.history.pop()!;
    this.selectedSlides.clear();
    this.changed();
    void this.draw();
  }
  redo() {
    if (!this.future.length || !this.doc || this.locked) return;
    this.history.push(clone(this.doc));
    this.doc = this.future.pop()!;
    this.selectedSlides.clear();
    this.changed();
    void this.draw();
  }
  async present() {
    this.palette?.hide();
    await this.flush();
    if (this.locked || !this.record) return;
    await this.plugin.present(
      this.presentationRecord ?? { ...this.record, doc: clone(this.doc!) },
      this.presentationRecord && this.doc?.kind === 'slide' ? this.doc.id : undefined,
      this.contentEl.ownerDocument,
    );
  }
  async draw() {
    this.finishInline(false);
    this.railScroll = this.rail?.scrollTop ?? this.railScroll;
    const ticket = ++this.revision;
    if (this.doc?.kind === 'deck' && !this.doc.sections) this.organizing = false;
    if (!this.doc || !this.record) return;
    this.renderOwner?.unload();
    this.renderOwner = new Component();
    this.renderOwner.load();
    this.viewport?.unload(); this.viewport = undefined;
    this.contentEl.replaceChildren();
    this.blockNodes.clear();
    this.blockOwners.clear();
    const top = element(this.contentEl, 'div', 'ss-topbar');
    element(top, 'span', 'ss-brand', 'SLIDE STUDIO');
    this.status = element(
      top,
      'span',
      'ss-save',
      this.locked ? 'Conflict' : this.dirty ? 'Saving…' : 'Saved',
    );
    const title = element(top, 'span', 'ss-document-title', this.doc.title);
    title.title = this.record.file.path;
    button(top, 'Library', () => void this.plugin.library());
    if (this.doc.kind === 'deck') button(top, this.organizing ? 'Edit slides' : 'Organize', () => void this.runStudioAction('organize-presentation').catch(e=>this.plugin.error(e)));
    button(top, 'Present', () => void this.present(), 'mod-cta');
    const actions = element(this.contentEl, 'div', 'ss-actionbar');
    button(actions, 'Undo', () => this.undo(), 'ss-undo').disabled = !this.history.length;
    button(actions, 'Redo', () => this.redo(), 'ss-redo').disabled = !this.future.length;
    button(actions, 'Speaking notes', () => void this.plugin.toggleSpeakingNotes());
    button(actions, 'More actions…', () => this.showDocumentMenu());
    if (this.presentation) button(actions, 'Back to presentation', () =>
      void this.finishEditing().catch(error => this.plugin.error(error)));
    button(actions, 'Settings', () => this.palette?.toggle()).title = 'Slide settings (⌘⇧, / Ctrl+Shift+,)';
    this.body = element(this.contentEl, 'div', 'ss-body');
    this.rail = element(this.body, 'aside', 'ss-rail');
    const middle = element(this.body, 'main', 'ss-middle');
    this.mount = element(middle, 'div', 'ss-editor-mount');
    this.stage = element(this.mount, 'div', 'ss-stage');
    this.mount.tabIndex = -1;
    this.mount.addEventListener('pointerdown', e => {
      if (!(e.target as HTMLElement).closest('input,textarea,[contenteditable=true],.cm-editor')) this.mount.focus({preventScroll:true});
    });
    if (!this.organizing || this.doc.kind === 'slide') {
      this.viewport = new ZoomViewport(this.mount, this.stage, () => ({width:1600,height:900}), this.zoomState, false, state => {this.zoomState=state;});
      this.viewport.load();
    }
    this.palette ??= new SettingsPalette(this.contentEl.ownerDocument);
    this.inspector = this.palette.content;
    this.inspector.replaceChildren();
    if (this.doc.kind === 'slide') await this.drawSlide(this.doc, ticket);
    else if (this.organizing) {
    element(this.inspector, 'h3', '', 'Presentation');
      const deck = this.doc;
      input(this.inspector, 'Presentation title', deck.title, v => this.change(() => deck.title = v));
      this.deckThemeSettings(deck);
      await drawOrganizer(this, deck, ticket);
    }
    else await this.drawDeck(this.doc, ticket);
    if (ticket !== this.revision) return;
    this.palette.refresh(this.doc.title);
    this.rail.scrollTop = this.railScroll;
    if (this.revealOutlineSelection) {
      this.revealOutlineSelection = false;
      this.rail.querySelector<HTMLElement>(`.ss-slide-card[data-slide-index="${this.index}"]`)
        ?.scrollIntoView({block: 'nearest', inline: 'nearest'});
      this.railScroll = this.rail.scrollTop;
    }
    if (this.focusRail) {
      this.focusRail = false;
      this.rail.querySelector<HTMLElement>(`.ss-slide-card[data-slide-index="${this.index}"]`)?.focus({ preventScroll: true });
    }
    this.fit();
    this.app.workspace.trigger('research-outline:changed');
    if (this.locked) { this.recoveryUI(); this.palette.refresh(this.doc.title); this.palette.show(); }
  }
  fit() {
    if (!this.stage || !this.mount) return;
    this.viewport?.fit();
  }
  async drawSlide(s: Slide, ticket: number) {
    this.plugin.updateSpeakingNotes(this.record ? {...this.record, doc: s} : null);
    element(this.rail, 'h3', '', 'Blocks');
    button(this.rail, '+ Text / math', () => this.addBlock('markdown'));
    button(this.rail, '+ Image from vault', () => this.addImage());
    button(this.rail, '+ Import image', () => this.pickImages());
    button(this.rail, '+ Linked note', () => this.addNote());
    const list = element(this.rail, 'div', 'ss-block-list');
    s.blocks.forEach((b, i) => {
      const label =
        b.kind === 'markdown'
          ? b.text
              .replace(/[#*$>]/g, '')
              .trim()
              .slice(0, 32) || 'Empty text'
          : b.text.split('/').pop() || b.kind;
      const bt = button(
        list,
        `${i + 1}  ${label}`,
        () => this.selectBlock(b.id),
        'ss-block-list-item',
      );
      bt.classList.toggle('is-active', b.id === this.selected);
    });
    element(
      this.rail,
      'p',
      'ss-hint',
      'Drop image files onto the slide to import them. Select a block to edit it. Drag its top handle; resize from the lower-right corner.',
    );
    const nodes = await renderSlide(
      this.app,
      this.stage,
      s,
      this.record!.file.path,
      this.renderOwner!,
      this.editingTheme(s),
      this.editingLabel(s) || 'Section',
      this.editingPage(s),
      (b, old, value) => this.replaceCodeLink(s, b, old, value),
      await prepareCitations(this.app, this.editingCitationRecords(s), this.presentationRecord?.file.path || this.record!.file.path),
    );
    if (ticket !== this.revision) return;
    this.stage.addEventListener(
      'dragover',
      (event) => {
        if (!event.dataTransfer?.types.includes('Files')) return;
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = 'copy';
        this.stage.classList.add('ss-image-drop');
      },
      true,
    );
    this.stage.addEventListener('dragleave', (event) => {
      if (!this.stage.contains(event.relatedTarget as Node))
        this.stage.classList.remove('ss-image-drop');
    });
    this.stage.addEventListener(
      'drop',
      (event) => {
        if (!event.dataTransfer?.files.length) return;
        event.preventDefault();
        event.stopPropagation();
        this.stage.classList.remove('ss-image-drop');
        const rect = this.stage.getBoundingClientRect();
        void this.importImages(
          Array.from(event.dataTransfer.files),
          ((event.clientX - rect.left) * 1600) / rect.width,
          ((event.clientY - rect.top) * 900) / rect.height,
        );
      },
      true,
    );
    this.stage.addEventListener('contextmenu', (event) => this.contextMenu(event));
    for (const { b, n, content, component } of nodes) {
      this.blockOwners.set(b.id, component);
      this.blockNodes.set(b.id, { node: n, content });
      n.classList.add('ss-editable');
      n.dataset.id = b.id;
      n.classList.toggle('ss-selected', b.id === this.selected);
      n.addEventListener('click', (e) => {
        if (!(e.target as HTMLElement).closest(sourceInteraction)) this.selectBlock(b.id);
      });
      n.addEventListener('dblclick', (e) => {
        if ((e.target as HTMLElement).closest(sourceInteraction)) return;
        this.selectBlock(b.id);
        this.editInline(b);
      });
      const handle = element(n, 'div', 'ss-drag-handle', '⋮⋮');
      handle.title = 'Move block';
      handle.setAttribute('aria-label', 'Move block');
      const resize = element(n, 'div', 'ss-resize-handle');
      resize.title = 'Resize block';
      resize.setAttribute('aria-label', 'Resize block');
      this.drag(handle, b, n, false);
      this.drag(resize, b, n, true);
      const ob = new ResizeObserver(() => this.overflow(n, content));
      ob.observe(content);
      const mutations = new MutationObserver(() => this.overflow(n, content));
      mutations.observe(content, { childList: true, subtree: true, characterData: true });
      this.renderOwner!.register(() => {
        ob.disconnect();
        mutations.disconnect();
      });
      this.overflow(n, content);
    }
    this.stage.addEventListener('click', (e) => {
      if (e.target === this.stage) {
        this.selected = '';
        this.showInspector();
        this.highlight();
      }
    });
    this.showInspector();
    editableFooter(
      this.stage,
      () => {
        if (this.locked) return false;
        this.checkpoint();
        return true;
      },
      (text) => {
        s.section = text;
        this.changed();
        const field = this.inspector.querySelector<HTMLInputElement>(
          'input[aria-label="Footer / default section name"]',
        );
        if (field) field.value = text;
      },
    );
  }
  overflow(n: HTMLElement, c: HTMLElement) {
    // CodeMirror owns measurement while editing; reading layout on every DOM
    // mutation interrupts its own write/measure cycle. Check the preview on exit.
    if (n.classList.contains('ss-is-editing')) return;
    const overflow = c.scrollHeight > c.clientHeight + 3 || c.scrollWidth > c.clientWidth + 3;
    n.classList.toggle('ss-overflow', overflow);
    n.title = overflow ? 'Content overflows this block. Enlarge it or adjust the font size.' : '';
  }
  highlight() {
    this.blockNodes.forEach(({ node }, id) =>
      node.classList.toggle('ss-selected', id === this.selected),
    );
  }
  selectBlock(id: string) {
    if (this.selected === id) return;
    this.finishInline();
    this.selected = id;
    this.highlight();
    this.showInspector();
  }
  finishInline(refresh = true) {
    const current = this.inline;
    if (!current) return;
    this.inline = null;
    current.destroy();
    const b = this.doc?.kind === 'slide' ? this.doc.blocks.find((x) => x.id === current.id) : null;
    const nodes = this.blockNodes.get(current.id);
    nodes?.node.classList.remove('ss-is-editing');
    nodes?.node.querySelector('.ss-inline-done')?.remove();
    if (refresh && b) void this.refreshBlock(b);
    this.stage.tabIndex = -1; this.stage.focus({preventScroll: true});
  }
  editInline(b: Block) {
    if (this.locked || b.kind !== 'markdown' || this.inline?.id === b.id) return;
    this.finishInline();
    const nodes = this.blockNodes.get(b.id);
    if (!nodes || !this.record) return;
    this.checkpoint();
    nodes.node.classList.remove('ss-overflow');
    nodes.node.classList.add('ss-is-editing');
    nodes.content.replaceChildren();
    const host = element(nodes.content, 'div', 'ss-inline-editor');
    host.style.setProperty('--ss-editor-font', b.font + 'px');
    host.style.textAlign = b.align;
    try {
      const native = mountNativeEditor(
        this.app,
        host,
        this.record.file,
        b.text,
        (text) => {
          b.text = text;
          this.changed();
          const area = this.inspector.querySelector('textarea');
          if (area) area.value = text;
        },
        () => { void this.finishEditing().catch(error => this.plugin.error(error)); },
        this.scope ?? undefined,
      );
      this.inline = { id: b.id, destroy: () => native.destroy() };
      nodes.node.classList.add('ss-is-editing');
      button(nodes.node, 'Done · Esc', () => void this.finishEditing().catch(error => this.plugin.error(error)), 'ss-inline-done');
      native.focus();
    } catch (error) {
      nodes.node.classList.remove('ss-is-editing');
      host.remove();
      void this.refreshBlock(b);
      this.plugin.error(error);
      new Notice('The native editor could not open. Markdown remains available in the inspector.');
    }
  }
  showInspector() {
    this.buildInspector();
    this.palette?.refresh(this.doc?.title || 'Slide');
  }
  private buildInspector() {
    if (this.doc?.kind !== 'slide') return;
    this.inspector.replaceChildren();
    const s = this.doc,
      b = s.blocks.find((x) => x.id === this.selected);
    if (!b) {
      element(this.inspector, 'h3', '', 'Slide');
      input(this.inspector, 'Slide title', s.title, (v) => this.change(() => (s.title = v)));
      select(this.inspector, 'Page type', s.type, ['content', 'intro', 'section'], (v) =>
        this.change(() => (s.type = v as Slide['type'])),
      );
      input(this.inspector, 'Footer / default section name', s.section, (v) =>
        this.change(() => (s.section = v)),
      );
      element(this.inspector, 'h3', '', 'Theme');
      select(this.inspector, 'Page appearance', s.appearance, ['light', 'dark'],
        v => this.change(() => (s.appearance = v as 'light' | 'dark')));
      select(
        this.inspector,
        'Text styling',
        s.style === 'vault' ? 'Vault theme' : 'UIUC',
        ['UIUC', 'Vault theme'],
        (v) => this.change(() => (s.style = v === 'Vault theme' ? 'vault' : 'uiuc')),
      );
      select(
        this.inspector,
        'Dark background pattern',
        s.backgroundPattern ? 'Show' : 'Hide',
        ['Hide', 'Show'],
        (v) => this.change(() => (s.backgroundPattern = v === 'Show')),
      );
      select(this.inspector, 'Footer pattern', s.pattern ? 'Show' : 'Hide', ['Hide', 'Show'], (v) =>
        this.change(() => (s.pattern = v === 'Show')),
      );
      if (s.source)
        button(
          this.inspector,
          'Open source note',
          () => void this.app.workspace.openLinkText(s.source, this.record!.file.path, 'tab'),
        );
      element(
        this.inspector,
        'p',
        'ss-hint',
        'Click a block to edit its content and placement. Page type sets the template when a slide is created; changing it preserves your existing layout.',
      );
      return;
    }
    element(
      this.inspector,
      'h3',
      '',
      b.kind === 'markdown' ? 'Text / mathematics' : b.kind === 'image' ? 'Image' : 'Linked note',
    );
    button(this.inspector, 'Slide properties', () => {
      this.selected = '';
      this.highlight();
      this.showInspector();
    });
    if (b.kind === 'markdown') button(this.inspector, 'Edit on slide', () => this.editInline(b));
    if (b.kind === 'image') {
      button(this.inspector, 'Replace image…', () => this.replaceImage(b));
      button(this.inspector, 'Natural size (fit to slide)', () => void this.sizeImage(b));
      const toggle = element(this.inspector, 'label', 'ss-field');
      const check = element(toggle, 'input');
      check.type = 'checkbox';
      check.checked = this.preserveImageRatio;
      check.onchange = () => (this.preserveImageRatio = check.checked);
      element(toggle, 'span', '', 'Keep image aspect ratio');
    }
    const label = element(this.inspector, 'label', 'ss-field');
    element(
      label,
      'span',
      '',
      b.kind === 'markdown'
        ? 'Markdown'
        : b.kind === 'image'
          ? 'Image path'
          : 'Note, heading or block link',
    );
    const area = element(label, 'textarea', 'ss-content-input');
    area.value = b.text;
    area.setAttribute('aria-label', 'Block content');
    let editStart = true;
    area.onfocus = () => {
      this.finishInline();
      editStart = true;
    };
    area.oninput = () => {
      if (this.locked) return;
      if (editStart) {
        this.checkpoint();
        editStart = false;
      }
      b.text = area.value;
      this.changed();
      void this.refreshBlock(b);
    };
    if (b.kind !== 'image') {
      input(
        this.inspector,
        'Font size',
        String(b.font),
        (v) => {
          const n = Number(v);
          if (Number.isFinite(n))
            this.change(() => {
              b.font = Math.max(12, Math.min(160, n));
            });
        },
        'number',
      );
      input(this.inspector, 'Text color (#RRGGBB or blank for theme)', b.color || '', (v) => {
        if (v && !/^#[0-9a-f]{6}$/i.test(v)) {
          new Notice('Use a six-digit hex color, such as #ff5f05, or leave blank.');
          return;
        }
        this.change(() => {
          if (v) b.color = v;
          else delete b.color;
        });
      });
    }
    select(
      this.inspector,
      b.kind === 'image' ? 'Image alignment within frame' : 'Alignment',
      b.align,
      ['left', 'center', 'right'],
      (v) => this.change(() => (b.align = v as Block['align'])),
    );
    const geometry = element(this.inspector, 'div', 'ss-geometry');
    for (const [key, label] of [
      ['x', 'X'],
      ['y', 'Y'],
      ['w', 'Width'],
      ['h', 'Height'],
    ] as const)
      input(
        geometry,
        label,
        String(Math.round(b[key])),
        (v) => {
          if (!Number.isFinite(Number(v))) return;
          if (b.kind === 'image' && this.preserveImageRatio && (key === 'w' || key === 'h')) {
            void this.sizeImage(b, key, Number(v));
            return;
          }
          this.change(() => Object.assign(b, clampGeometry({ ...b, [key]: Number(v) })));
        },
        'number',
      );
    const acts = element(this.inspector, 'div', 'ss-block-actions');
    const more = button(acts, 'More block actions…', () => {
      const r = more.getBoundingClientRect();
      this.contextMenu(new MouseEvent('contextmenu', { clientX: r.left, clientY: r.bottom }), b);
    });
    more.setAttribute('aria-label', 'More block actions: duplicate, stacking order, delete');
  }
  async replaceCodeLink(slide: Slide, b: Block, old: string, value: string) {
    if (this.doc !== slide || !slide.blocks.includes(b) || this.locked || this.closed)
      throw Error('This slide changed or closed. Reopen the link menu.');
    const text = replaceBlockLinkText(b.text, old, value);
    this.change(() => { b.text = text; });
    await this.flush();
    if (this.locked) throw Error('The slide could not be saved; keep the recovery draft.');
  }
  blockVersions = new Map<string, number>();
  blockOwners = new Map<string, Component>();
  async refreshBlock(b: Block) {
    const pair = this.blockNodes.get(b.id);
    if (!pair) return;
    const version = (this.blockVersions.get(b.id) ?? 0) + 1;
    this.blockVersions.set(b.id, version);
    const temp = element(
      this.contentEl.ownerDocument.createElement('div'),
      'div',
      'ss-block-content markdown-rendered',
    );
    const prior = this.blockOwners.get(b.id);
    if (prior) this.renderOwner?.removeChild(prior);
    const component = new Component();
    this.renderOwner?.addChild(component);
    this.blockOwners.set(b.id, component);
    const slide=this.doc?.kind==='slide'?this.doc:null;
    const citations=slide?await prepareCitations(this.app,this.editingCitationRecords(slide),this.presentationRecord?.file.path || this.record!.file.path):undefined;
    await renderBlock(
      this.app,
      b,
      temp,
      this.doc?.kind === 'slide' && this.doc.source
        ? this.doc.source.split('#')[0]
        : this.record!.file.path,
      component,
      this.doc?.kind === 'slide' ? ((slide: Slide) => (block: Block, old: string, value: string) => this.replaceCodeLink(slide, block, old, value))(this.doc) : undefined,
      slide?citations?.blocks.get(blockKey(slide,b)):undefined,citations,
    );
    if (this.blockVersions.get(b.id) !== version || this.blockNodes.get(b.id) !== pair) {
      component.unload();
      return;
    }
    if(slide&&citations){
      this.stage.querySelector('.ss-citation-footer')?.remove();
      if(!this.stage.querySelector('.ss-footer'))footer(this.app,this.stage,this.editingTheme(slide),this.editingLabel(slide),this.editingPage(slide),this.record!.file.path,slide.type==='intro');
      citationFooter(this.app,this.stage,slide,citations,this.editingTheme(slide),this.editingPage(slide));
      for(const other of slide.blocks){if(other.id===b.id)continue;const data=citations.blocks.get(blockKey(slide,other));const node=this.blockNodes.get(other.id);if(data?.occurrences.length&&node){const target=node.content;target.replaceChildren();await renderBlock(this.app,other,target,data.sourcePath,this.renderOwner!,undefined,data,citations);}}
    }
    pair.content.replaceChildren(...Array.from(temp.childNodes));
    this.overflow(pair.node, pair.content);
  }
  contextMenu(event: MouseEvent, selectedBlock?: Block) {
    const target = (event.target as HTMLElement | null) ?? this.stage;
    // Keep Obsidian's normal editing menu for text selections and the footer editor.
    if (!selectedBlock && target.closest(sourceInteraction)) return;
    if (this.doc?.kind !== 'slide' || this.locked) return;
    event.preventDefault();
    event.stopPropagation();
    const slide = this.doc;
    const id = target.closest<HTMLElement>('.ss-editable')?.dataset.id;
    const b = selectedBlock ?? slide.blocks.find((block) => block.id === id);
    this.selectBlock(b?.id ?? '');
    const rect = this.stage.getBoundingClientRect();
    const position = {
      x: ((event.clientX - rect.left) * 1600) / rect.width,
      y: ((event.clientY - rect.top) * 900) / rect.height,
    };
    const menu = new Menu();
    const action = (title: string, icon: string, run: () => void, disabled = false) => {
      menu.addItem((item) =>
        item
          .setTitle(title)
          .setIcon(icon)
          .setDisabled(disabled)
          .onClick(() => {
            if (this.doc === slide && !this.closed && !this.locked) run();
          }),
      );
    };
    if (b) {
      if (b.kind === 'image') {
        action('Replace image…', 'images', () => this.replaceImage(b));
        action('Natural size (fit to slide)', 'maximize', () => void this.sizeImage(b));
      }
      if (b.kind === 'markdown') action('Edit on slide', 'pencil', () => this.editInline(b));
      else
        action(
          b.kind === 'image' ? 'Open image' : 'Open linked note',
          'external-link',
          () => void this.app.workspace.openLinkText(b.text, this.record!.file.path, 'tab'),
        );
      action('Duplicate block', 'copy', () => this.duplicateBlock(b));
      const index = slide.blocks.indexOf(b);
      action(
        'Bring forward',
        'arrow-up',
        () => this.reorderBlock(b, 'forward'),
        index === slide.blocks.length - 1,
      );
      action('Send backward', 'arrow-down', () => this.reorderBlock(b, 'backward'), index === 0);
      action(
        'Bring to front',
        'chevrons-up',
        () => this.reorderBlock(b, 'front'),
        index === slide.blocks.length - 1,
      );
      action('Send to back', 'chevrons-down', () => this.reorderBlock(b, 'back'), index === 0);
      menu.addSeparator();
      action('Delete block', 'trash-2', () => {
        this.selected = b.id;
        this.deleteBlock();
      });
      menu.addSeparator();
    }
    action('Add text / math', 'type', () => this.addBlock('markdown', '', position));
    action('Add image from vault', 'image', () => this.addImage(position));
    action('Import image…', 'image-plus', () => this.pickImages(position));
    action('Add file link from gallery…', 'gallery-horizontal', () => void this.addFileLink(position));
    action('Add code link from gallery…', 'code', () => void this.addFileLink(position,'code'));
    action('Add linked note', 'file-text', () => this.addNote(position));
    action('Insert figure…','image',()=>this.addScientific('figure',position));
    action('Insert table…','table',()=>this.addScientific('table',position));
    action('Insert note window…', 'file-text',()=>this.addDocument('md',position));
    action('Insert PDF window…', 'file',()=>this.addDocument('pdf',position));
    menu.addSeparator();
    action('Undo', 'undo', () => this.undo(), !this.history.length);
    action('Redo', 'redo', () => this.redo(), !this.future.length);
    menu.addSeparator();
    menu.addItem(i => i.setTitle('Slide Studio actions…').setIcon('presentation').onClick(() => this.showStudioMenu()));
    menu.showAtMouseEvent(event);
  }
  duplicateBlock(b: Block) {
    if (this.doc?.kind !== 'slide') return;
    this.change(() => {
      const copy = clone(b);
      copy.id = crypto.randomUUID();
      Object.assign(copy, clampGeometry({ ...copy, x: copy.x + 30, y: copy.y + 30 }));
      (this.doc as Slide).blocks.push(copy);
      this.selected = copy.id;
    });
  }
  reorderBlock(b: Block, direction: 'forward' | 'backward' | 'front' | 'back') {
    if (this.doc?.kind !== 'slide') return;
    const blocks = this.doc.blocks;
    const index = blocks.indexOf(b);
    if (index < 0) return;
    const next =
      direction === 'front'
        ? blocks.length - 1
        : direction === 'back'
          ? 0
          : Math.max(0, Math.min(blocks.length - 1, index + (direction === 'forward' ? 1 : -1)));
    if (index === next) return;
    this.change(() => {
      blocks.splice(index, 1);
      blocks.splice(next, 0, b);
    });
  }
  addBlock(kind: Block['kind'], text = '', position = { x: 100, y: 220 }) {
    if (this.doc?.kind !== 'slide') return;
    this.change(() => {
      const b = block(text || 'New text', { kind, ...position, w: 650, h: 300 });
      Object.assign(b, clampGeometry(b));
      (this.doc as Slide).blocks.push(b);
      this.selected = b.id;
    });
  }
  pickImages(position = { x: 100, y: 220 }) {
    const slide = this.doc;
    const picker = this.contentEl.ownerDocument.createElement('input');
    picker.type = 'file';
    picker.accept = 'image/png,image/jpeg,image/gif,image/webp,image/avif,image/svg+xml,image/bmp';
    picker.multiple = true;
    picker.addEventListener('change', () => {
      if (this.doc === slide)
        void this.importImages(Array.from(picker.files ?? []), position.x, position.y);
    });
    picker.click();
  }
  async importImages(files: File[], x = 100, y = 220) {
    const slide = this.doc,
      record = this.record;
    if (slide?.kind !== 'slide' || !record || this.locked) return;
    const images = files.filter(isImageFile);
    if (!images.length) {
      new Notice('Drop a PNG, JPEG, GIF, WebP, AVIF, SVG, or BMP image.');
      return;
    }
    for (const [i, file] of images.entries()) {
      let url = '';
      try {
        if (this.closed || this.doc !== slide || this.locked) return;
        url = URL.createObjectURL(file);
        const img = this.contentEl.ownerDocument.createElement('img');
        img.src = url;
        await img.decode();
        if (this.closed || this.doc !== slide || this.locked) return;
        const saved = await this.plugin.store.importImage(file, record.file.path);
        if (this.closed || this.doc !== slide || this.locked) {
          new Notice(
            `Image saved at ${saved.path}. Reopen the slide and use Image from vault to add it.`,
          );
          return;
        }
        this.change(() => {
          const b = block(saved.path, {
            kind: 'image',
            ...imageGeometry(
              img.naturalWidth || 640,
              img.naturalHeight || 480,
              x + i * 24,
              y + i * 24,
            ),
          });
          slide.blocks.push(b);
          this.selected = b.id;
        });
        await this.flush();
      } catch (error) {
        this.plugin.error(error);
      } finally {
        if (url) URL.revokeObjectURL(url);
      }
    }
  }
  async selectImage(currentPath?: string) {
    return chooseImage<TFile>(
      this.app as unknown as GalleryHost,
      {
        sourcePath: this.record!.file.path,
        currentPath,
        title: currentPath ? 'Replace slide image' : 'Add slide image',
      },
      () =>
        new Promise((resolve) => {
          const modal = new ChooseFile(
            this.plugin,
            this.app.vault
              .getFiles()
              .filter((f) => /^(png|jpe?g|svg|gif|webp|avif|bmp)$/i.test(f.extension)),
            (f) => resolve(f),
            'Choose an image by filename',
          );
          const close = modal.onClose.bind(modal);
          modal.onClose = () => {
            close();
            queueMicrotask(() => resolve(null));
          };
          modal.open();
        }),
    );
  }
  addImage(position = { x: 100, y: 220 }) {
    const slide = this.doc;
    void this.selectImage()
      .then((f) => {
        if (f && this.doc === slide && !this.closed && !this.locked)
          this.addBlock('image', f.path, position);
      })
      .catch((e) => this.plugin.error(e));
  }
  replaceImage(b: Block) {
    const slide = this.doc;
    void this.selectImage(b.text)
      .then((f) => {
        if (
          f &&
          this.doc === slide &&
          !this.closed &&
          !this.locked &&
          slide?.kind === 'slide' &&
          slide.blocks.includes(b)
        )
          this.change(() => {
            b.text = f.path;
          });
      })
      .catch((e) => this.plugin.error(e));
  }
  async sizeImage(b: Block, dimension?: 'w' | 'h', value?: number) {
    const slide = this.doc,
      original = JSON.stringify(b);
    try {
      const file = this.app.metadataCache.getFirstLinkpathDest(b.text, this.record!.file.path);
      if (!file) throw Error('Image not found.');
      const img = this.contentEl.ownerDocument.createElement('img');
      img.src = this.app.vault.getResourcePath(file);
      await img.decode();
      if (
        this.doc !== slide ||
        this.closed ||
        this.locked ||
        JSON.stringify(b) !== original ||
        slide?.kind !== 'slide' ||
        !slide.blocks.includes(b)
      )
        return;
      let w = img.naturalWidth,
        h = img.naturalHeight;
      if (dimension && value !== undefined) {
        if (!Number.isFinite(value) || value <= 0) throw Error('Enter a positive image size.');
        if (dimension === 'w') {
          h *= value / w;
          w = value;
        } else {
          w *= value / h;
          h = value;
        }
      }
      this.change(() => Object.assign(b, naturalImageGeometry(w, h, b.x, b.y)));
    } catch (e) {
      this.plugin.error(e);
    }
  }
  async addFileLink(position={x:100,y:220},kind='all') {
    const slide=this.doc;
    try {
      const chosen=await chooseFile(this.app as unknown as GalleryHost,{sourcePath:this.record!.file.path,kind});
      if(chosen&&this.doc===slide&&!this.closed&&!this.locked)this.addBlock('markdown',chosen.link,position);
    }catch(e){this.plugin.error(e);}
  }
  addScientific(kind:Kind,position={x:100,y:120}) {
    const slide=this.doc;if(slide?.kind!=='slide'){new Notice('Open a slide for editing first.');return;}new ScientificEditor(this.app,newScientific(kind),v=>{if(this.doc!==slide||this.closed||this.locked)throw Error('The slide changed. Reopen its figure/table editor.');this.change(()=>{const b=block(scientificSource(v),{kind:'markdown',...position,w:1200,h:600});Object.assign(b,clampGeometry(b));slide.blocks.push(b);this.selected=b.id;});},this.record!.file.path).open();
  }
  addDocument(kind:'md'|'pdf',position={x:100,y:220}) {
    const slide=this.doc;
    chooseDocument(this.app,kind,text=>{
      if(this.doc===slide&&!this.closed&&!this.locked)this.addBlock('markdown',text,position);
    });
  }
  async addNote(position = { x: 100, y: 220 }) {
    const slide=this.doc;
    const gallery=(this.app as any).plugins?.getPlugin('image-gallery')?.api;
    if(!gallery?.pickFile){
      new ChooseFile(this.plugin,this.app.vault.getMarkdownFiles(),f=>{if(this.doc===slide&&!this.closed&&!this.locked)this.addBlock('note',f.path,position);},'Choose a note').open();
      return;
    }
    try {
      const chosen=await chooseFile(this.app as unknown as GalleryHost,{sourcePath:this.record!.file.path,kind:'notes',title:'Choose a note to embed'});
      if(chosen&&this.doc===slide&&!this.closed&&!this.locked){
        const file=this.app.vault.getAbstractFileByPath(chosen.path);
        if(chosen.code||!(file instanceof TFile)||file.extension!=='md')throw Error('Choose a Markdown note to embed. Use Add file link for other files.');
        this.addBlock('note',chosen.path,position);
      }
    }catch(e){this.plugin.error(e);}
  }
  deleteBlock() {
    if (this.doc?.kind !== 'slide') return;
    this.change(() => {
      const s = this.doc as Slide;
      s.blocks = s.blocks.filter((b) => b.id !== this.selected);
      this.selected = '';
    });
  }
  drag(handle: HTMLElement, b: Block, node: HTMLElement, resize: boolean) {
    handle.addEventListener('mousedown', (e) => {
      if (e.button !== 0 || this.locked) return;
      e.preventDefault();
      e.stopPropagation();
      this.selectBlock(b.id);
      const start = clone(b),
        x = e.clientX,
        y = e.clientY,
        scale = this.stage.getBoundingClientRect().width / 1600;
      const doc = handle.ownerDocument;
      let moved = false;
      const move = (ev: MouseEvent) => {
        ev.preventDefault();
        if (!moved) {
          this.checkpoint();
          moved = true;
        }
        const dx = (ev.clientX - x) / scale,
          dy = (ev.clientY - y) / scale;
        const snap = (n: number) => (ev.altKey ? n : Math.round(n / 8) * 8);
        const image = node.querySelector<HTMLImageElement>('.ss-image');
        if (
          resize &&
          b.kind === 'image' &&
          this.preserveImageRatio &&
          image?.naturalWidth &&
          image.naturalHeight
        ) {
          const ratio = image.naturalWidth / image.naturalHeight;
          let w =
            Math.abs(dx / start.w) >= Math.abs(dy / start.h)
              ? Math.max(1, snap(start.w + dx))
              : Math.max(1, snap(start.h + dy)) * ratio;
          w = Math.min(w, 1600 - start.x, (792 - start.y) * ratio);
          Object.assign(b, { w, h: w / ratio });
        } else
          Object.assign(
            b,
            clampGeometry(
              resize
                ? { ...b, w: snap(start.w + dx), h: snap(start.h + dy) }
                : { ...b, x: snap(start.x + dx), y: snap(start.y + dy) },
            ),
          );
        place(node, b);
        this.overflow(node, this.blockNodes.get(b.id)!.content);
      };
      let ended = false;
      const end = () => {
        if (ended) return;
        ended = true;
        doc.removeEventListener('mousemove', move, true);
        doc.removeEventListener('mouseup', end, true);
        doc.defaultView?.removeEventListener('blur', end);
        if (moved) {
          this.changed();
          this.showInspector();
        }
      };
      doc.addEventListener('mousemove', move, true);
      doc.addEventListener('mouseup', end, true);
      doc.defaultView?.addEventListener('blur', end, { once: true });
      this.renderOwner?.register(end);
    });
  }
  async drawDeck(d: Deck, ticket: number) {
    element(this.rail, 'h3', '', `Slides · ${d.slides.length}`);
    const records = await this.plugin.store.resolveMany(d.slides);
    const citations=await prepareCitations(this.app,records,this.record!.file.path);
    const references=referencePages([...citations.refs.values()]);
    const openReferences=(index=0)=>previewReferences(this.app,references,this.record!.file.path,d.theme,index);
    if (ticket !== this.revision) return;
    this.index = Math.max(0, Math.min(this.index, d.slides.length - 1));
    this.selectedSlides = new Set([...this.selectedSlides].filter(i => i < d.slides.length));
    if (!this.selectedSlides.size && d.slides.length) this.selectedSlides.add(this.index);
    const list = element(this.rail, 'div', 'ss-deck-list');
    element(this.rail, 'p', 'ss-hint', '⌘-click to select · Shift-click for a range · drag to move');
    this.outlineRecords = records;
    const slideDocs = records.map((r) => (r?.doc.kind === 'slide' ? r.doc : null));
    const outlines=outlinePlan(d,slideDocs);
    records.forEach((r, i) => {
      for(const page of outlines.pages)if(page.kind==='outline'&&page.beforeIndex===i){
        const g=outlines.deck.sections!.find(s=>s.id===page.sectionId)!;
        button(list,`Outline · ${g.title}`,()=>previewOutline(this.app,outlines.deck,page,this.record!.file.path,r?.doc.kind==='slide'?themeForSlide(d,r.doc):d.theme),'ss-outline-rail');
      }
      if (i === sectionStart(d, i, slideDocs)) {
        const heading = button(
          list,
          sectionAt(d, i, slideDocs),
          () => {
            this.index = i;
            void this.draw();
          },
          'ss-section-heading',
        );
        heading.title = 'Select this section to rename its footer';
      }
      const row = element(list, 'div', 'ss-deck-row ss-slide-card');
      row.tabIndex = 0;
      row.draggable = false;
      row.dataset.slideIndex = String(i);
      let dragged = false;
      row.setAttribute('role', 'button');
      row.setAttribute('aria-label', `Slide ${i + 1}: ${r?.doc.title ?? 'Missing slide'}`);
      row.setAttribute('aria-current', i === this.index ? 'true' : 'false');
      row.title = 'Click to select · double-click to edit · drag to reorder · right-click for actions';
      row.classList.toggle('is-active', this.selectedSlides.has(i));
      row.setAttribute('aria-pressed', String(this.selectedSlides.has(i)));
      const thumb = element(row, 'div', 'ss-thumbnail');
      thumb.setAttribute('aria-hidden', 'true');
      const caption = element(row, 'div', 'ss-thumbnail-caption');
      element(caption, 'span', 'ss-thumbnail-number', String(i + 1));
      element(caption, 'span', 'ss-thumbnail-title', r?.doc.title ?? 'Missing slide');
      const selectRow = (event?: MouseEvent) => {
        if (event?.shiftKey) {
          const start = Math.min(this.selectionAnchor, i), end = Math.max(this.selectionAnchor, i);
          if (!event.metaKey && !event.ctrlKey) this.selectedSlides.clear();
          for (let n = start; n <= end; n++) this.selectedSlides.add(n);
        } else if (event?.metaKey || event?.ctrlKey) {
          this.selectedSlides.has(i) ? this.selectedSlides.delete(i) : this.selectedSlides.add(i);
          this.selectionAnchor = i;
        } else { this.selectedSlides = new Set([i]); this.selectionAnchor = i; }
        this.index = i; this.focusRail = true; void this.draw();
      };
      let selectionTimer = 0;
      row.addEventListener('click', event => {
        if (dragged) { dragged = false; return; }
        clearTimeout(selectionTimer);
        selectionTimer = window.setTimeout(() => { if (ticket === this.revision) selectRow(event); }, 200);
      });
      this.renderOwner!.register(() => clearTimeout(selectionTimer));
      row.addEventListener('dblclick', () => {
        clearTimeout(selectionTimer);
        if (r) void this.openDeckSlide(r.file, i);
      });
      row.addEventListener('contextmenu', e => {
        e.preventDefault(); e.stopPropagation();
        const menu = new Menu();
        if (r) {
          menu.addItem(item => item.setTitle('Edit slide').setIcon('pencil').onClick(() => void this.openDeckSlide(r.file, i)));
          menu.addItem(item => item.setTitle('Duplicate slide here').setIcon('copy').onClick(() => void this.duplicateDeckSlide(d, i, r)));
        }
        menu.addItem(item => item.setTitle('Move up').setIcon('arrow-up').setDisabled(i === 0).onClick(() => this.reorderSlide(d, i, i - 1)));
        menu.addItem(item => item.setTitle('Move down').setIcon('arrow-down').setDisabled(i === d.slides.length - 1).onClick(() => this.reorderSlide(d, i, i + 1)));
        menu.addSeparator();
        menu.addItem(item => item.setTitle(this.selectedSlides.has(i) && this.selectedSlides.size > 1 ? `Move ${this.selectedSlides.size} slides to trash` : 'Move to trash').setIcon('trash-2').onClick(() => this.removeDeckSlide(d, i)));
        menu.addSeparator(); this.addStudioMenuItems(menu);
        menu.showAtMouseEvent(e);
      });
      row.addEventListener('keydown', e => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') {
          e.preventDefault(); e.stopPropagation(); this.selectedSlides = new Set(d.slides.map((_,n) => n)); this.focusRail = true; void this.draw();
        } else if (e.shiftKey && ['ArrowUp','ArrowDown'].includes(e.key)) {
          e.preventDefault();
          const next = Math.max(0, Math.min(d.slides.length - 1, i + (e.key === 'ArrowUp' ? -1 : 1)));
          this.selectedSlides = new Set(Array.from({length:Math.abs(next-this.selectionAnchor)+1},(_,n)=>Math.min(next,this.selectionAnchor)+n));
          this.index = next; this.focusRail = true; void this.draw();
        } else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); this.removeDeckSlide(d, i); }
        else if (e.altKey && ['ArrowUp','ArrowDown'].includes(e.key)) {
          e.preventDefault(); this.reorderSlide(d, i, i + (e.key === 'ArrowUp' ? -1 : 1));
        } else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectRow(); }
      });
      row.addEventListener('mousedown', down => {
        if (down.button !== 0) return;
        const doc = row.ownerDocument;
        const dragIndices = this.selectedSlides.has(i) ? [...this.selectedSlides] : [i];
        let target = i;
        let valid = false;
        dragged = false;
        const clear = () => list.querySelectorAll('.drop-before,.drop-after').forEach(el => el.classList.remove('drop-before','drop-after'));
        const move = (e: MouseEvent) => {
          if (!dragged && Math.hypot(e.clientX - down.clientX, e.clientY - down.clientY) < 5) return;
          dragged = true;
          clearTimeout(selectionTimer);
          e.preventDefault();
          row.classList.add('is-dragging');
          clear();
          const hit = doc.elementFromPoint(e.clientX,e.clientY)?.closest<HTMLElement>('.ss-slide-card');
          valid = !!hit && list.contains(hit);
          if (valid && hit) {
            const after = e.clientY >= hit.getBoundingClientRect().top + hit.offsetHeight / 2;
            hit.classList.add(after ? 'drop-after' : 'drop-before');
            const insertion = Number(hit.dataset.slideIndex) + Number(after);
            target = insertion;
          }
          const bounds = this.rail.getBoundingClientRect();
          if (e.clientY < bounds.top + 45) this.rail.scrollTop -= 18;
          else if (e.clientY > bounds.bottom - 45) this.rail.scrollTop += 18;
        };
        const cleanup = () => {
          doc.removeEventListener('mousemove', move, true);
          doc.removeEventListener('mouseup', end, true);
          doc.defaultView?.removeEventListener('blur', cleanup);
          row.classList.remove('is-dragging'); clear();
        };
        const end = () => {
          cleanup();
          if (dragged && valid && ticket === this.revision) this.moveDeckSelection(d, dragIndices, target);
        };
        doc.addEventListener('mousemove', move, true);
        doc.addEventListener('mouseup', end, true);
        doc.defaultView?.addEventListener('blur', cleanup);
        this.renderOwner!.register(cleanup);
      });
      if (r?.doc.kind === 'slide') {
        const observer = new IntersectionObserver(entries => {
          if (!entries.some(e => e.isIntersecting)) return;
          observer.disconnect();
          if (ticket !== this.revision) return;
          const miniature = element(thumb, 'div', 'ss-stage');
          const scale = () => { miniature.style.transform = `scale(${thumb.clientWidth / 1600})`; };
          const resize = new ResizeObserver(scale); resize.observe(thumb);
          this.renderOwner!.register(() => resize.disconnect());
          void renderSlide(this.app, miniature, r.doc as Slide, r.file.path, this.renderOwner!,
            themeForSlide(d, r.doc as Slide), sectionAt(d, i, slideDocs), slidePageNumber(d.theme, slideDocs, i),undefined,citations)
            .then(scale).catch(() => { thumb.textContent = 'Preview unavailable'; });
        }, { root: this.rail, rootMargin: '160px' });
        observer.observe(thumb);
        this.renderOwner!.register(() => observer.disconnect());
      } else thumb.textContent = 'Missing slide';
    });
    references.forEach((_,i)=>button(this.rail,`References${references.length>1?' '+(i+1):''}`,()=>openReferences(i),'ss-derived-references'));
    if(citations.issues.length)element(this.rail,'p','ss-render-error',citations.issues.join('\n'));
    element(this.inspector, 'h3', '', 'Presentation');
    input(this.inspector, 'Presentation title', d.title, (v) => this.change(() => (d.title = v)));
    const current = records[this.index];
    this.plugin.updateSpeakingNotes(current ?? null);
    if (current?.doc.kind === 'slide') {
      button(this.contentEl.querySelector('.ss-actionbar') as HTMLElement, 'Edit slide',
        () => void this.openDeckSlide(current.file));

      const nodes = await renderSlide(
        this.app,
        this.stage,
        current.doc,
        current.file.path,
        this.renderOwner!,
        themeForSlide(d, current.doc),
        sectionAt(
          d,
          this.index,
          records.map((r) => (r?.doc.kind === 'slide' ? r.doc : null)),
        ),
        slidePageNumber(d.theme, records.map(r => r?.doc.kind === 'slide' ? r.doc : null), this.index),
        undefined,citations,()=>openReferences(),
      );
      if (ticket !== this.revision) return;
      for (const {b, n} of nodes) {
        n.title = b.kind === 'markdown' ? 'Double-click to edit text' : 'Double-click to edit this block';
        n.addEventListener('dblclick', event => {
          if ((event.target as HTMLElement).closest(sourceInteraction)) return;
          event.preventDefault(); event.stopPropagation();
          void this.openDeckSlide(current.file, this.index, this.leaf, b.id)
            .catch(error => this.plugin.error(error));
        });
      }
      button(
        this.inspector,
        'Edit this slide',
        () => void this.openDeckSlide(current.file),
      );
      button(
        this.inspector,
        'Open slide in new window',
        () => void this.openDeckSlide(current.file, this.index, this.app.workspace.openPopoutLeaf({size: {width:1280,height:850}})),
      );
      button(
        this.inspector,
        'Copy link to this slide in presentation',
        () =>
          void navigator.clipboard
            .writeText(
              `[${current.doc.title}](${this.plugin.link(this.record!, 'present', current.doc.id)})`,
            )
            .then(() => new Notice('Slide-in-presentation link copied.')),
      );
    } else
      element(
        this.stage,
        'div',
        'ss-missing',
        records.length
          ? 'This slide is missing. Remove it or restore its note.'
          : 'Add slides to assemble your presentation.',
      );
    if (d.slides[this.index]) {
      const start = sectionStart(d, this.index, slideDocs);
      const end = d.slides.findIndex((_, i) => i > start && sectionStart(d, i, slideDocs) === i);
      element(this.inspector, 'h3', '', 'Section footer');
      element(
        this.inspector,
        'p',
        'ss-hint',
        `Applies to slides ${start + 1}–${end < 0 ? d.slides.length : end}.`,
      );
      input(
        this.inspector,
        'Section name / footer text',
        sectionAt(d, this.index, slideDocs),
        (v) =>
          this.change(() => {
            if (d.sections) setSectionFooter(d, d.slides[this.index].sectionId!, v);
            else d.slides[start].section = v.trim() || 'Untitled section';
          }),
      );
      button(this.inspector, 'Start new section at this slide', () =>
        this.change(() => {
          if (d.sections) {
            const group = d.sections.find(g => g.id === d.slides[this.index].sectionId);
            const indices = d.slides.map((_, i) => i).filter(i => i >= this.index && d.slides[i].sectionId === group?.id);
            createSection(d, 'New section', indices, group?.parent);
          } else d.slides[this.index].section = 'New section';
        }),
      ).disabled = this.index === start;
      editableFooter(
        this.stage,
        () => {
          if (this.locked) return false;
          this.checkpoint();
          return true;
        },
        (text) => {
          if (d.sections) setSectionFooter(d, d.slides[this.index].sectionId!, text);
          else d.slides[start].section = text;
          this.changed();
          const field = this.inspector.querySelector<HTMLInputElement>(
            'input[aria-label="Section name / footer text"]',
          );
          if (field) field.value = text;
          const headers = this.rail.querySelectorAll<HTMLElement>('.ss-section-heading');
          const starts = d.slides
            .map((_, i) => i)
            .filter((i) => sectionStart(d, i, slideDocs) === i);
          const header = headers[starts.indexOf(start)];
          if (header) header.textContent = text;
        },
      );
      button(this.inspector, 'Move slide to trash', () =>
        this.removeDeckSlide(d, this.index),
      );
    }
    this.deckThemeSettings(d);
  }
  deckThemeSettings(d: Deck) {
    element(this.inspector,'h3','','Outlines');
    select(this.inspector,'Show outlines',d.showOutlines?'On':'Off',['Off','On'],v=>this.change(()=>d.showOutlines=v==='On'));
    element(this.inspector,'p','ss-hint','Automatic, unnumbered outlines before sections and subsections. Title slides stay first; empty or title-only sections are skipped. Add sections in Organize if the presentation has none.');
    element(this.inspector, 'h3', '', 'Theme');
    select(this.inspector, 'Theme for all slides', presentationThemeLabel(d.theme), PRESENTATION_THEMES,
      choice => this.change(() => { d.theme = applyPresentationTheme(d.theme, choice); }));
    element(
      this.inspector,
      'p',
      'ss-hint',
      'Theme for all slides applies throughout this presentation. Individual slide settings are preserved; choose Use individual slide themes to restore them. Christmas Light keeps the evergreen village; Christmas Night adds a starry blue sky and gently twinkling colored lights. Snow and twinkling run during playback only and respect reduced motion.',
    );
    select(
      this.inspector,
      'Dark background pattern',
      d.theme.backgroundPattern ? 'Show' : 'Hide',
      ['Hide', 'Show'],
      (v) => this.change(() => (d.theme.backgroundPattern = v === 'Show')),
    );
    select(
      this.inspector,
      'Footer pattern',
      d.theme.pattern ? 'Show' : 'Hide',
      ['Hide', 'Show'],
      (v) => this.change(() => (d.theme.pattern = v === 'Show')),
    );
    if (d.theme.style === 'vault')
      element(
        this.inspector,
        'p',
        'ss-hint',
        'Uses the active vault’s colors, fonts, headings and CSS snippets. Light/dark page controls apply to UIUC styling.',
      );
    input(
      this.inspector,
      'Base color',
      d.theme.navy,
      (v) => this.change(() => (d.theme.navy = v)),
      'color',
    );
    input(
      this.inspector,
      'Accent',
      d.theme.accent,
      (v) => this.change(() => (d.theme.accent = v)),
      'color',
    );
    input(this.inspector, 'Logo image path', d.theme.logo, (v) =>
      this.change(() => (d.theme.logo = v)),
    );
    select(this.inspector, 'Footer', d.theme.footer ? 'Show' : 'Hide', ['Show', 'Hide'], (v) =>
      this.change(() => (d.theme.footer = v === 'Show')),
    );
    select(
      this.inspector,
      'Pagination',
      d.theme.pagination ? 'Show' : 'Hide',
      ['Show', 'Hide'],
      (v) => this.change(() => (d.theme.pagination = v === 'Show')),
    );
    select(
      this.inspector,
      'Slide numbering',
      d.theme.titlePagination ? 'Wrong Convention' : 'Grady Convention',
      ['Grady Convention', 'Wrong Convention'],
      (v) => this.change(() => (d.theme.titlePagination = v === 'Wrong Convention')),
    );
    select(this.inspector, 'Number display', d.theme.pageNumberFormat === 'current' ? 'Current' : 'Current/total',
      ['Current', 'Current/total'], v => this.change(() => {d.theme.pageNumberFormat = v === 'Current/total' ? 'current-total' : 'current';}));
    element(this.inspector, 'p', 'ss-hint', 'Grady Convention: title slides are unnumbered; the first following slide is 1. Wrong Convention: title slides are numbered and counted.');
  }
  openTrash(deck: Deck) {
    const modal = new Modal(this.app);
    modal.titleEl.textContent = 'Presentation trash';
    modal.modalEl.classList.add('ss-trash-modal');
    let previewOwner = new Component();
    let previewRevision = 0;
    let closed = false;
    modal.onClose = () => { closed = true; previewRevision++; previewOwner.unload(); };
    const draw = () => {
      previewOwner.unload(); previewOwner = new Component(); previewOwner.load();
      const ticket = ++previewRevision;
      modal.contentEl.replaceChildren();
      const items = deck.trash ?? [];
      element(modal.contentEl, 'p', 'ss-hint', items.length ? 'Restore a slide to its previous position, or empty this presentation’s trash.' : 'No slides in the trash.');
      const grid = element(modal.contentEl, 'div', 'ss-trash-gallery');
      items.forEach((item, i) => {
        const card = element(grid, 'div', 'ss-trash-card');
        const thumb = element(card, 'div', 'ss-thumbnail');
        thumb.setAttribute('aria-hidden', 'true');
        const title = element(card, 'div', 'ss-trash-title', item.entry.file.split('/').pop()?.replace(/\.md$/, '') || 'Slide');
        title.title = item.entry.file;
        element(card, 'div', 'ss-hint', `Previously slide ${item.index + 1}`);
        button(card, 'Restore', () => {
          if (this.doc !== deck) { modal.close(); return; }
          this.change(() => restoreSlide(deck, i)); draw();
        });
        const observer = new IntersectionObserver(entries => {
          if (!entries.some(e => e.isIntersecting)) return;
          observer.disconnect();
          void this.plugin.store.resolve(item.entry).then(record => {
            if (closed || ticket !== previewRevision) return;
            if (record?.doc.kind !== 'slide') { thumb.textContent = 'Slide file missing'; return; }
            title.textContent = record.doc.title;
            const miniature = element(thumb, 'div', 'ss-stage');
            const scale = () => { miniature.style.transform = `scale(${thumb.clientWidth / 1600})`; };
            const resize = new ResizeObserver(scale); resize.observe(thumb);
            previewOwner.register(() => resize.disconnect());
            return renderSlide(this.app, miniature, record.doc, record.file.path, previewOwner,
              themeForSlide(deck, record.doc), item.entry.section || deck.title, '')
              .then(scale);
          }).catch(() => { if (!closed && ticket === previewRevision) thumb.textContent = 'Preview unavailable'; });
        }, { root: modal.contentEl, rootMargin: '160px' });
        observer.observe(thumb); previewOwner.register(() => observer.disconnect());
      });
      if (items.length > 1) button(modal.contentEl, 'Restore all', () => {
        if (this.doc !== deck) { modal.close(); return; }
        this.change(() => {
          for (const item of [...items].sort((a,b) => a.index-b.index))
            deck.slides.splice(Math.min(item.index,deck.slides.length),0,item.entry);
          deck.trash = [];
        }); draw();
      });
      if (items.length) button(modal.contentEl, 'Empty Trash…', () => {
        modal.close();
        const confirm = new Modal(this.app);
        confirm.titleEl.textContent = 'Empty presentation trash?';
        element(confirm.contentEl, 'p', '', 'Unused slide files owned by this presentation will move to Obsidian’s vault trash. Slides used by another presentation or linked from a note are kept. This clears this editor’s Undo history; use the vault trash to recover deleted files.');
        button(confirm.contentEl, 'Cancel', () => confirm.close());
        const empty = button(confirm.contentEl, 'Empty Trash', () => {
          empty.disabled = true;
          void (async () => {
            try {
              if (this.doc !== deck) throw Error('Presentation changed. Reopen its trash bin.');
              await this.flush();
              if (this.locked) throw Error('Resolve the saved-file conflict before emptying trash.');
              const result = await this.plugin.store.emptyPresentationTrash(this.record!);
              this.record = result.record; this.doc = clone(result.record.doc);
              this.history = []; this.future = [];
              confirm.close(); await this.draw();
              const remaining = this.doc.kind === 'deck' ? this.doc.trash?.length ?? 0 : 0;
              new Notice(`${result.deleted} slide files moved to vault trash. ${result.kept} shared or linked files kept.${remaining ? ` ${remaining} could not be moved and remain in the bin.` : ''}`);
            } catch (e) { empty.disabled = false; this.plugin.error(e); }
          })();
        }, 'mod-warning');
        confirm.open();
      }, 'mod-warning');
    };
    draw(); modal.open();
  }
  private moveDeckSelection(deck: Deck, indices: number[], insertion: number) {
    if (this.doc !== deck) return;
    if (deck.sections) {
      const destination = deck.slides[Math.min(insertion, deck.slides.length - 1)]?.sectionId;
      if (!destination) return;
      this.change(() => { moveSlidesTo(deck, indices, destination, deck.slides[insertion]); this.selectedSlides.clear(); });
      return;
    }
    const result = moveEntries(deck.slides, indices, insertion);
    if (result.entries.every((e,i) => e === deck.slides[i])) return;
    this.change(() => {
      deck.slides = result.entries;
      this.index = result.start;
      this.selectedSlides = new Set(indices.map((_,i) => result.start + i));
      this.selectionAnchor = result.start;
    });
  }
  private reorderSlide(deck: Deck, from: number, to: number) {
    if (this.doc !== deck || from === to || to < 0 || to >= deck.slides.length) return;
    const indices = this.selectedSlides.has(from) ? [...this.selectedSlides] : [from];
    const gap = to < from ? Math.min(...indices) - 1 : Math.max(...indices) + 2;
    this.moveDeckSelection(deck, indices, gap);
  }
  private removeDeckSlide(deck: Deck, index: number) {
    if (this.doc !== deck || !deck.slides[index]) return;
    const indices = this.selectedSlides.has(index) ? [...this.selectedSlides] : [index];
    this.change(() => {
      for (const i of indices.sort((a,b) => b-a)) trashSlide(deck, i);
      this.index = Math.max(0, Math.min(Math.min(...indices), deck.slides.length - 1));
      this.selectedSlides = new Set(deck.slides.length ? [this.index] : []);
    });
    new Notice(`${indices.length} slide${indices.length === 1 ? '' : 's'} moved to presentation trash. Restore from Trash or use Undo.`);
  }
  private async duplicateDeckSlide(deck: Deck, index: number, record: RecordDoc) {
    const entry = deck.slides[index];
    try {
      const copy = await this.plugin.store.copySlide(record, this.plugin.store.slideFolder(this.record!), record.doc.title + ' — copy');
      if (this.doc !== deck || deck.slides[index] !== entry || this.closed) {
        new Notice('Copy saved in the presentation folder. Add it using + Add slide.'); return;
      }
      this.change(() => { deck.slides.splice(index + 1, 0, { ...entry, id: copy.doc.id, file: copy.file.path }); this.index = index + 1; this.selectedSlides = new Set([this.index]); this.selectionAnchor = this.index; });
    } catch (e) { this.plugin.error(e); }
  }
  private appendSlide(r: RecordDoc, deckId: string) {
    if (this.doc?.kind !== 'deck' || this.doc.id !== deckId || this.closed) {
      new Notice('Slide saved in its presentation folder. Reopen that presentation to add it.');
      return;
    }
    this.change(() => {
      const deck = this.doc as Deck;
      const sectionId = deck.slides[this.index]?.sectionId ?? deck.sections?.[0]?.id;
      deck.slides.push({ id: r.doc.id, file: r.file.path, section: '', ...(sectionId ? {sectionId} : {}) });
      orderSlides(deck);
      this.index = (this.doc as Deck).slides.length - 1;
      this.selectedSlides = new Set([this.index]);
      this.selectionAnchor = this.index;
    });
  }
  async addSlide(shared = false) {
    if (this.doc?.kind !== 'deck') return;
    const deckId = this.doc.id, deckRecord = this.record!;
    const records = await this.plugin.store.list('slide');
    new ChooseFile(
      this.plugin,
      records.map(r => r.file),
      f => {
        const r = records.find(r => r.file === f)!;
        if (shared) this.appendSlide(r, deckId);
        else void this.plugin.store.copySlide(r, this.plugin.store.slideFolder(deckRecord))
          .then(copy => this.appendSlide(copy, deckId)).catch(e => this.plugin.error(e));
      },
      shared ? 'Share a slide — editing it changes every presentation using it' : 'Copy a slide into this presentation — edit independently',
    ).open();
  }
}
