import { Component, MarkdownRenderChild, TFile } from 'obsidian';
import type SlideStudio from './main';
import { RecordDoc } from './store';
import { Deck, sectionAt, slidePageNumber, themeForSlide } from './model';
import { element, button, renderSlide } from './render';
import { outlinePlan, PresentationPage } from './outlines';
import { renderOutline } from './outline-render';
import { prepareCitations, CitationContext } from './citation-context';
import { referencePages, Reference } from './citations-core';
import { renderReferences } from './references-render';
import { parseEmbed, embedPage } from './embed-core';

/** One component per occurrence: navigation and cleanup never leak to another embed. */
export class NoteEmbed extends MarkdownRenderChild {
  private index = 0;
  private alive = false;
  private loading = 0;
  private painting = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private pageOwner?: Component;
  private record?: RecordDoc;
  private deck?: Deck;
  private records: (RecordDoc | null)[] = [];
  private pages: (PresentationPage | { kind: 'references'; index: number })[] = [];
  private refs: Reference[][] = [];
  private citations!: CitationContext;
  private root!: HTMLElement;
  private mount!: HTMLElement;
  private label!: HTMLElement;
  private title!: HTMLButtonElement;
  private previous!: HTMLButtonElement;
  private next!: HTMLButtonElement;
  private dependencies = new Set<string>();
  constructor(private plugin: SlideStudio, el: HTMLElement, private source: string, private sourcePath: string, private select?: () => void) { super(el); }
  onload() {
    this.alive = true;
    this.containerEl.replaceChildren();
    this.root = element(this.containerEl, 'div', 'ss-note-embed');
    this.root.setAttribute('role', 'region');
    this.root.setAttribute('aria-label', 'Embedded presentation');
    const top = element(this.root, 'div', 'ss-embed-toolbar');
    this.title = button(top, 'Loading presentation…', () => this.open(), 'ss-embed-title');
    this.title.title = this.select ? 'Insert this presentation' : 'Open presentation in Slide Studio';
    button(top, 'Refresh', () => void this.reload());
    this.mount = element(this.root, 'div', 'ss-embed-mount');
    const controls = element(this.root, 'div', 'ss-embed-controls');
    this.previous = button(controls, '←', () => this.go(this.index - 1));
    this.previous.setAttribute('aria-label', 'Previous slide');
    this.label = element(controls, 'span', 'ss-embed-position');
    this.label.setAttribute('aria-live', 'polite');
    this.next = button(controls, '→', () => this.go(this.index + 1));
    this.next.setAttribute('aria-label', 'Next slide');
    this.registerDomEvent(this.root, 'keydown', event => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault(); event.stopPropagation();
      this.go(event.key === 'Home' ? 0 : event.key === 'End' ? this.pages.length - 1 : this.index + (event.key === 'ArrowLeft' ? -1 : 1));
    });
    const observer = new ResizeObserver(() => this.fit());
    observer.observe(this.mount); this.register(() => observer.disconnect());
    const refresh = (file: { path: string }, old?: string) => {
      if (!this.dependencies.has(file.path) && (!old || !this.dependencies.has(old))) return;
      clearTimeout(this.timer); this.timer = setTimeout(() => void this.reload(), 350);
    };
    this.registerEvent(this.plugin.app.vault.on('modify', refresh));
    this.registerEvent(this.plugin.app.vault.on('rename', refresh));
    this.registerEvent(this.plugin.app.vault.on('delete', refresh));
    // Block recursive deck -> note -> same deck embedding.
    if (this.containerEl.closest('.ss-stage')) { this.title.textContent = 'Open embedded presentation from its note'; return; }
    void this.reload();
  }
  private async reload() {
    const revision = ++this.loading;
    try {
      const target = parseEmbed(this.source), app = this.plugin.app;
      const file = app.metadataCache.getFirstLinkpathDest(target.path, this.sourcePath);
      let record = file instanceof TFile ? await this.plugin.store.read(file).catch(() => null) : null;
      if (target.id && record?.doc.id !== target.id) {
        const matches = (await this.plugin.store.list('deck')).filter(r => r.doc.id === target.id);
        if (matches.length > 1) throw Error('Duplicate presentation ID. Use Duplicate presentation to make a copy.');
        record = matches[0] ?? null;
      }
      if (!record || record.doc.kind !== 'deck') throw Error('Presentation not found. Choose an existing presentation in this vault.');
      const records = await this.plugin.store.resolveMany(record.doc.slides);
      const plan = outlinePlan(record.doc, records.map(r => r?.doc.kind === 'slide' ? r.doc : null));
      const citations = await prepareCitations(app, records, record.file.path);
      if (!this.alive || revision !== this.loading) return;
      this.record = record; this.records = records; this.deck = plan.deck; this.citations = citations;
      this.refs = referencePages([...citations.refs.values()]);
      this.pages = [...plan.pages, ...this.refs.map((_, index) => ({ kind: 'references' as const, index }))];
      this.dependencies = new Set([record.file.path, ...records.flatMap(r => r ? [r.file.path] : []), ...[...citations.blocks.values()].map(b => b.sourcePath)]);
      this.title.textContent = record.doc.title;
      this.root.setAttribute('aria-label', `Embedded presentation: ${record.doc.title}`);
      this.go(this.index);
    } catch (error) {
      if (!this.alive || revision !== this.loading) return;
      this.painting++; this.pageOwner?.unload(); this.record = undefined; this.pages = [];
      this.mount.replaceChildren(); element(this.mount, 'p', 'ss-embed-message', (error as Error).message);
      this.title.textContent = 'Presentation unavailable'; this.label.textContent = '';
      this.previous.disabled = this.next.disabled = true;
    }
  }
  private open() { if (this.select) { this.select(); return; } if (this.record) void this.plugin.open(this.record.file); }
  private fit() {
    const stage = this.mount.querySelector<HTMLElement>('.ss-stage');
    if (stage) stage.style.transform = `scale(${this.mount.clientWidth / 1600})`;
  }
  private go(index: number) {
    this.index = embedPage(index, this.pages.length);
    void this.draw().catch(e => this.plugin.error(e));
  }
  private async draw() {
    const revision = ++this.painting;
    this.pageOwner?.unload();
    const owner = this.pageOwner = new Component(); owner.load();
    this.mount.replaceChildren();
    const page = this.pages[this.index];
    this.previous.disabled = this.index === 0;
    this.next.disabled = this.index >= this.pages.length - 1;
    if (!page || !this.record || !this.deck) {
      element(this.mount, 'p', 'ss-embed-message', 'This presentation has no slides yet.');
      this.label.textContent = 'No slides'; return;
    }
    const index = page.kind === 'slide' ? page.index : page.kind === 'outline' ? page.beforeIndex : this.records.length - 1;
    const rec = this.records[index], deck = this.deck;
    const stage = element(this.mount, 'div', 'ss-stage');
    stage.setAttribute('aria-hidden', 'true'); stage.inert = true;
    const open = button(this.mount, '', () => this.open(), 'ss-embed-open');
    open.setAttribute('aria-label', `${this.select ? 'Insert' : 'Open'} presentation: ${deck.title}`);
    open.title = this.select ? 'Insert presentation' : 'Open presentation';
    this.fit();
    this.label.textContent = `${this.index + 1} / ${this.pages.length} · ${page.kind === 'references' ? 'References' : page.kind === 'outline' ? 'Outline' : rec?.doc.title ?? 'Missing slide'}`;
    try {
      if (page.kind === 'references') await renderReferences(this.plugin.app, stage, this.refs[page.index], page.index, this.refs.length, this.record.file.path, owner, deck.theme);
      else if (page.kind === 'outline') await renderOutline(this.plugin.app, stage, deck, page, this.record.file.path, owner, rec?.doc.kind === 'slide' ? themeForSlide(deck, rec.doc) : deck.theme);
      else if (rec?.doc.kind === 'slide') {
        const slides = this.records.map(r => r?.doc.kind === 'slide' ? r.doc : null);
        await renderSlide(this.plugin.app, stage, rec.doc, rec.file.path, owner, themeForSlide(deck, rec.doc), sectionAt(deck, index, slides), slidePageNumber(deck.theme, slides, index), undefined, this.citations);
      } else element(stage, 'div', 'ss-missing', 'This slide is missing. Open the presentation to repair it.');
    } finally {
      if (!this.alive || revision !== this.painting) owner.unload();
      else this.fit();
    }
  }
  onunload() {
    this.alive = false; this.loading++; this.painting++;
    clearTimeout(this.timer); this.pageOwner?.unload();
  }
}
