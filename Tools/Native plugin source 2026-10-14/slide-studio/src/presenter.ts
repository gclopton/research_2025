import {ImageViewer} from './image-viewer';
import {mountJumpGallery,jumpSlideNumber} from './jump-gallery';
import {prepareCitations,CitationContext} from './citation-context';
import {referencePages,Reference} from './citations-core';
import {renderReferences} from './references-render';
import { outlinePlan, PresentationPage } from './outlines';
import { renderOutline } from './outline-render';
import { sourceInteraction } from './code-links';
import { App, Component, Notice, Menu, Scope, MarkdownRenderer } from 'obsidian';
import { Deck, Slide, DEFAULT_THEME, sectionAt, standaloneTheme, themeForSlide, slidePageNumber } from './model';
import { RecordDoc, Store } from './store';
import { element, button, renderSlide } from './render';
export class Presenter extends Component {
  notesVisible = false;
  notes!: HTMLElement;
  notesOwner?: Component;
  notesRevision = 0;
  toggleNotes() {
    this.notesVisible = !this.notesVisible;
    this.root.classList.toggle('ss-with-notes',this.notesVisible);
    this.notes.hidden = !this.notesVisible;
    void this.showNotes(); this.fit();
  }
  async showNotes() {
    const ticket=++this.notesRevision;
    this.notesOwner?.unload();this.notesOwner=undefined;
    this.notes.replaceChildren();
    if(!this.notesVisible)return;
    this.notesOwner=new Component();this.notesOwner.load();
    const bar=element(this.notes,'div','ss-notes-toolbar');
    element(bar,'strong','','Speaking notes');
    button(bar,'Hide (N)',()=>this.toggleNotes());
    const page=this.pages[this.index];
    const record=page?.kind==='slide'?this.records[page.index]:null;
    if(!record || record.doc.kind!=='slide') {
      element(this.notes,'p','',page?.kind==='outline'?'Section outline':'References');return;
    }
    element(this.notes,'h3','',record.doc.title);
    const body=element(this.notes,'div','ss-notes-prose markdown-rendered');
    await MarkdownRenderer.render(this.app,record.doc.speakerNotes || '*No speaking notes for this slide.*',body,record.file.path,this.notesOwner);
    if(ticket!==this.notesRevision)body.remove();
  }
  root!: HTMLElement;
  stage!: HTMLElement;
  mount!: HTMLElement;
  controls!: HTMLElement;
  label!: HTMLElement;
  search!: HTMLElement;
  searchOwner?: Component;
  playbackScope!: Scope;
  imageViewer?: ImageViewer;
  private imageExitUntil = 0;
  index = 0;
  records: (RecordDoc | null)[] = [];
  pages: (PresentationPage|{kind:'references';index:number})[]=[];
  citations!:CitationContext;
  references:Reference[][]=[];
  outlineDeck: Deck|null=null;
  pageOwner: Component | null = null;
  digits = '';
  digitTimer = 0;
  closed = false;
  revision = 0;
  constructor(
    private app: App,
    private store: Store,
    private record: RecordDoc,
    private done: () => void,
    private document: Document,
  ) {
    super();
  }
  async start(startId?: string) {
    const doc = this.record.doc;
    this.records =
      doc.kind === 'slide'
        ? [this.record]
        : await this.store.resolveMany(doc.slides);
    if(doc.kind==='deck'){const plan=outlinePlan(doc,this.records.map(r=>r?.doc.kind==='slide'?r.doc:null));this.pages=plan.pages;this.outlineDeck=plan.deck;}
    else this.pages=[{kind:'slide',index:0}];
    if (!this.records.length) {
      new Notice('Add at least one slide before presenting.');
      return;
    }
    this.citations=await prepareCitations(this.app,this.records,this.record.file.path);
    this.references=referencePages([...this.citations.refs.values()]);
    this.pages.push(...this.references.map((_,index)=>({kind:'references' as const,index})));
    if (startId) {
      const n = this.records.findIndex((r) => r?.doc.id === startId);
      if (n >= 0) this.index = this.pages.findIndex(p=>p.kind==='slide'&&p.index===n);
    }
    this.load();
    this.root = element(this.document.body, 'div', 'ss-present');
    this.root.tabIndex = -1;
    this.registerDomEvent(this.root, 'ss-document-open' as any, (event:Event) => {this.documentViewer=(event as CustomEvent<()=>void>).detail;});
    this.registerDomEvent(this.root, 'ss-document-close' as any, () => {this.documentViewer=undefined;this.documentExitUntil=Date.now()+350;this.root.focus();});
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-label', doc.title + ' presentation');
    this.mount = element(this.root, 'div', 'ss-present-mount');
    this.notes = element(this.root,'aside','ss-present-notes');
    this.notes.hidden=true;
    this.notes.setAttribute('aria-label','Speaking notes');
    this.register(()=>{this.notesRevision++;this.notesOwner?.unload();});
    this.controls = element(this.root, 'div', 'ss-present-controls');
    button(this.controls, '←', () => this.go(this.index - 1));
    this.label = element(this.controls, 'span');
    button(this.controls, '→', () => this.go(this.index + 1));
    button(this.controls, 'Go to slide (G)', () => this.find());
    button(this.controls, 'Speaking notes (N)', () => this.toggleNotes());
    button(this.controls, 'Exit (Esc)', () => this.close());
    this.search = element(this.root, 'div', 'ss-search');
    this.search.hidden = true;
    const scope=this.playbackScope=new Scope(this.app.scope);
    scope.register([], 'Escape', event=>{
      event.preventDefault();event.stopPropagation();
      if(event.repeat)return false;
      if(this.imageViewer)this.closeImage();
      else this.key(event);
      return false;
    });
    this.app.keymap.pushScope(scope);
    this.register(()=>this.app.keymap.popScope(scope));
    this.registerDomEvent(this.root, 'keydown', (e) => this.key(e));
    this.registerDomEvent(this.mount,'click',event=>{
      const image=this.figure(event.target);
      if(image){event.preventDefault();event.stopPropagation();this.inspectImage(image);}
    });
    this.registerDomEvent(this.root, 'contextmenu', event => {
      if((event.target as HTMLElement).closest(sourceInteraction))return;
      event.preventDefault();event.stopPropagation();
      const menu=new Menu();
      const image=this.figure(event.target);
      if(image){menu.addItem(i=>i.setTitle('Inspect image…').onClick(()=>this.inspectImage(image)));menu.addSeparator();}
      menu.addItem(i=>i.setTitle('Previous slide').setDisabled(this.index===0).onClick(()=>this.go(this.index-1)));
      menu.addItem(i=>i.setTitle('Next slide').setDisabled(this.index===this.pages.length-1).onClick(()=>this.go(this.index+1)));
      menu.addItem(i=>i.setTitle('Go to slide number or title… (G)').onClick(()=>this.find()));
      menu.addItem(i=>i.setTitle('First page').onClick(()=>this.go(0)));
      menu.addItem(i=>i.setTitle('Last page').onClick(()=>this.go(this.pages.length-1)));
      menu.addSeparator();
      menu.addItem(i=>i.setTitle('Toggle speaking notes (N)').onClick(()=>this.toggleNotes()));
      menu.addItem(i=>i.setTitle('Playback shortcuts (?)').onClick(()=>this.help()));
      menu.addItem(i=>i.setTitle('Exit presentation (Esc)').onClick(()=>this.close()));
      menu.showAtMouseEvent(event);
    });
    // Reveal controls only when deliberately moving toward their upper-right area.
    this.registerDomEvent(this.root, 'mousemove', (e) => {
      const rect = this.root.getBoundingClientRect();
      if (e.clientY - rect.top < 100 && e.clientX - rect.left > Math.max(0, rect.width - 680))
        this.revealControls();
    });
    const resize = new ResizeObserver(() => this.fit());
    resize.observe(this.mount);
    this.register(() => resize.disconnect());
    this.registerDomEvent(this.root.ownerDocument, 'fullscreenchange', () => {
      if (!this.root.ownerDocument.fullscreenElement && this.wasFullscreen) {
        // Chromium may leave native fullscreen before delivering Escape. The
        // image layer still owns this exit; retain the slide and playback.
        if(this.imageViewer || this.documentViewer || Date.now()<this.imageExitUntil || Date.now()<this.documentExitUntil) {
          this.documentViewer?.(); this.closeImage(); this.wasFullscreen=false; this.root.focus();
          // Obsidian permits re-entering fullscreen here; if the host declines,
          // playback remains maximized in the window rather than closing.
          void this.root.requestFullscreen?.().then(()=>{if(!this.closed)this.wasFullscreen=true;}).catch(()=>{});
        } else this.close();
      }
    });
    await this.show();
    this.root.focus();
    this.root
      .requestFullscreen?.()
      .then(() => {
        this.wasFullscreen = true;
        this.root.focus();
      })
      .catch(() => {});
  }
  figure(target: EventTarget | null): HTMLImageElement | null {
    const el=target as HTMLElement|null;
    if(!el || el.closest('a,.code-links-panel'))return null;
    return el.closest<HTMLImageElement>('.ss-block-content img');
  }
  inspectImage(image: HTMLImageElement) {
    if(this.imageViewer)return;
    clearTimeout(this.digitTimer);this.digits='';
    this.imageViewer=this.addChild(new ImageViewer(this.root,image,()=>this.closeImage()));
  }
  closeImage() {
    this.imageExitUntil=Date.now()+500;
    const viewer=this.imageViewer;this.imageViewer=undefined;
    if(viewer)this.removeChild(viewer);
  }
  wasFullscreen = false;
  documentViewer?:()=>void;
  documentExitUntil=0;
  hideTimer = 0;
  revealControls() {
    this.root.classList.add('ss-controls-visible');
    clearTimeout(this.hideTimer);
    this.hideTimer = window.setTimeout(
      () => this.root.classList.remove('ss-controls-visible'),
      1800,
    );
  }
  fit() {
    if (!this.stage) return;
    const r = this.mount.getBoundingClientRect();
    const scale = Math.min(r.width / 1600, r.height / 900);
    this.stage.style.transform = `translate(-50%,-50%) scale(${scale})`;
  }
  async show() {
    const ticket = ++this.revision;
    void this.showNotes();
    this.pageOwner?.unload();
    this.pageOwner = new Component();
    this.pageOwner.load();
    this.mount.replaceChildren();
    this.stage = element(this.mount, 'div', 'ss-stage');
    this.stage.style.visibility = 'hidden';
    this.fit();
    const page=this.pages[this.index];
    const contentIndex=page.kind==='slide'?page.index:page.kind==='outline'?page.beforeIndex:Math.max(0,this.records.length-1);
    const rec = this.records[contentIndex], doc = this.record.doc;
    if(page.kind==='references'){
      await renderReferences(this.app,this.stage,this.references[page.index],page.index,this.references.length,this.record.file.path,this.pageOwner,doc.kind==='deck'?doc.theme:standaloneTheme(doc));
    }else if(page.kind==='outline'&&this.outlineDeck){
      await renderOutline(this.app,this.stage,this.outlineDeck,page,this.record.file.path,this.pageOwner,rec?.doc.kind==='slide'?themeForSlide(this.outlineDeck,rec.doc):this.outlineDeck.theme);
    }else if (rec?.doc.kind === 'slide')
      await renderSlide(
        this.app,
        this.stage,
        rec.doc,
        rec.file.path,
        this.pageOwner,
        doc.kind === 'deck' ? themeForSlide(doc, rec.doc) : standaloneTheme(rec.doc),
        doc.kind === 'deck'
          ? sectionAt(
              doc,
              contentIndex,
              this.records.map((r) => (r?.doc.kind === 'slide' ? r.doc : null)),
            )
          : rec.doc.section,
        slidePageNumber(doc.kind === 'deck' ? doc.theme : standaloneTheme(rec.doc),
          this.records.map(r => r?.doc.kind === 'slide' ? r.doc : null), contentIndex),
        undefined,this.citations,()=>this.go(this.pages.findIndex(p=>p.kind==='references')),
      );
    else {
      this.stage.className = 'ss-stage';
      element(
        this.stage,
        'div',
        'ss-missing',
        `Slide ${contentIndex + 1} is missing. Exit to repair the presentation.`,
      );
    }
    if (ticket !== this.revision) return;
    this.label.textContent = page.kind==='references'?`References · ${page.index+1} / ${this.references.length}`:page.kind==='outline'?`Outline · ${this.outlineDeck?.sections?.find(s=>s.id===page.sectionId)?.title}`:`${contentIndex+1} / ${this.records.length} · ${rec?.doc.title??'Missing slide'}`;
    this.fit();
    for(const image of Array.from(this.stage.querySelectorAll<HTMLImageElement>('.ss-block-content img'))) {
      if(!this.figure(image))continue;
      image.tabIndex=0;image.setAttribute('role','button');
      image.setAttribute('aria-label',`Inspect image: ${image.alt||'Slide image'}`);
      image.classList.add('ss-inspectable-image');
    }
    this.stage.style.visibility = '';
  }
  go(index: number) {
    this.root.classList.remove('ss-controls-visible');
    clearTimeout(this.hideTimer);
    this.root.focus();
    this.index = Math.max(0, Math.min(this.pages.length - 1, index));
    void this.show();
  }
  key(e: KeyboardEvent) {
    if(this.documentViewer){if(e.key==='Escape'){e.preventDefault();e.stopPropagation();this.documentViewer();}return;}
    if(this.imageViewer)return;
    const image=this.figure(e.target);
    if(image && (e.key==='Enter'||e.key===' ')) {e.preventDefault();e.stopPropagation();this.inspectImage(image);return;}
    if (e.key !== 'Escape' && (e.target as HTMLElement | null)?.closest(sourceInteraction)) return;
    if (!this.search.hidden) {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        this.search.hidden = true;
        this.searchOwner?.unload();this.searchOwner=undefined;
        this.root.focus();
      }
      return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if(e.key.toLowerCase()==='n'){e.preventDefault();this.toggleNotes();return;}
    if((e.target as HTMLElement|null)?.closest('.ss-present-notes'))return;
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(e.key)) {
      e.preventDefault();
      this.go(this.index + 1);
    } else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) {
      e.preventDefault();
      this.go(this.index - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      this.go(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      this.go(this.pages.length - 1);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      this.close();
    } else if (e.key === '?') {
      e.preventDefault(); this.help();
    } else if (e.key.toLowerCase() === 'g') {
      e.preventDefault();
      this.find();
    } else if (/^\d$/.test(e.key)) {
      e.preventDefault();
      this.digits += e.key;
      this.label.textContent = `Go to ${this.digits} — Enter`;
      this.revealControls();
      clearTimeout(this.digitTimer);
      this.digitTimer = window.setTimeout(() => {
        this.digits = '';
        void this.show();
      }, 3000);
    } else if (e.key === 'Enter' && this.digits) {
      e.preventDefault();
      const n = Number(this.digits);
      this.digits = '';
      clearTimeout(this.digitTimer);
      const target=this.pages.findIndex(p=>p.kind==='slide'&&this.slideNumber(p.index)===n);
      if(target>=0)this.go(target);
      else new Notice('No slide has that printed number. Search by title for unnumbered slides.');
    }
  }
  help() {
    this.searchOwner?.unload();this.searchOwner=undefined;this.search.classList.remove('ss-jump-gallery');
    this.search.replaceChildren(); this.search.hidden=false;
    element(this.search,'h2','','Playback shortcuts');
    element(this.search,'p','','Click a figure (or Tab to it and press Enter) to inspect it fullscreen. Scroll/pinch or +/− zooms; drag or arrows pan; 0 or double-click fits; Escape returns to the same slide. Right-click the image for these controls.');
    element(this.search,'p','','Arrows, Page Up/Down, Space: previous/next. Home/End: first/last page.');
    element(this.search,'p','','G: go to slide number or title. In the gallery: drag the bottom-right corner to resize, pinch or Ctrl/Cmd+scroll to zoom previews; Cmd/Ctrl +/− changes thumbnail size, Cmd/Ctrl+0 resets, Cmd/Ctrl+Shift+F fills the window. Type the number printed on a slide then Enter to jump; # limits search to printed numbers. Titles also match. ?: show this guide.');
    element(this.search,'p','','Escape closes this guide or search first; otherwise it exits playback. Right-click the presentation for navigation. Editing commands are unavailable during playback.');
    this.root.focus();
  }
  private slideNumber(index:number) {
    const doc=this.record.doc;
    return jumpSlideNumber(doc.kind==='deck'?doc.theme:standaloneTheme(doc),this.records.map(r=>r?.doc.kind==='slide'?r.doc:null),index);
  }
  find() {
    this.searchOwner?.unload();this.search.replaceChildren();this.search.hidden=false;
    this.searchOwner=mountJumpGallery(this.search,this.pages.map((page,index)=>({index,
      number:page.kind==='slide'?this.slideNumber(page.index):undefined,
      title:page.kind==='slide'?this.records[page.index]?.doc.title??'Missing slide':page.kind==='outline'?`Outline · ${this.outlineDeck?.sections?.find(s=>s.id===page.sectionId)?.title}`:`References ${page.index+1}`,
    })),this.index,index=>{this.search.hidden=true;this.searchOwner?.unload();this.searchOwner=undefined;this.go(index);},async(item,stage,owner)=>{
      const page=this.pages[item.index],doc=this.record.doc;
      const index=page.kind==='slide'?page.index:page.kind==='outline'?page.beforeIndex:Math.max(0,this.records.length-1);
      const record=this.records[index];
      if(page.kind==='references')await renderReferences(this.app,stage,this.references[page.index],page.index,this.references.length,this.record.file.path,owner,doc.kind==='deck'?doc.theme:standaloneTheme(doc));
      else if(page.kind==='outline'&&this.outlineDeck)await renderOutline(this.app,stage,this.outlineDeck,page,this.record.file.path,owner,record?.doc.kind==='slide'?themeForSlide(this.outlineDeck,record.doc):this.outlineDeck.theme);
      else if(record?.doc.kind==='slide'){
        const slides=this.records.map(r=>r?.doc.kind==='slide'?r.doc:null);
        await renderSlide(this.app,stage,record.doc,record.file.path,owner,doc.kind==='deck'?themeForSlide(doc,record.doc):standaloneTheme(record.doc),doc.kind==='deck'?sectionAt(doc,index,slides):record.doc.section,slidePageNumber(doc.kind==='deck'?doc.theme:standaloneTheme(record.doc),slides,index),undefined,this.citations);
      }
    },{shell:this.search,scope:this.playbackScope});
  }
  close() {
    if (this.closed) return;
    this.closed = true;
    this.documentViewer?.();
    if (this.root?.ownerDocument.fullscreenElement === this.root)
      void this.root.ownerDocument.exitFullscreen();
    this.unload();
    this.done();
  }
  onunload() {
    this.revision++;
    clearTimeout(this.hideTimer);
    clearTimeout(this.digitTimer);
    this.pageOwner?.unload();
    this.searchOwner?.unload();
    this.root?.remove();
  }
}
