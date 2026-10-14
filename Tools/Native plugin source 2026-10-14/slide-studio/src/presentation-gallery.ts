import { Component, Modal } from 'obsidian';
import type SlideStudio from './main';
import { RecordDoc } from './store';
import { element, button } from './render';
import { NoteEmbed } from './note-embed';
import { embedSource } from './embed-core';

export class PresentationGallery extends Modal {
  private owner?: Component;
  private timer: ReturnType<typeof setTimeout> | undefined;
  constructor(private plugin: SlideStudio, private records: RecordDoc[], private insert: (text: string) => void) { super(plugin.app); }
  onOpen() {
    this.titleEl.textContent = 'Insert presentation';
    this.modalEl.classList.add('ss-presentation-gallery');
    const tools = element(this.contentEl, 'div', 'ss-gallery-tools');
    const search = element(tools, 'input'); search.type = 'search'; search.placeholder = 'Search presentations or folders…';
    search.setAttribute('aria-label', 'Search presentations');
    const folder = element(tools, 'select'); folder.setAttribute('aria-label', 'Presentation folder');
    const all = element(folder, 'option', '', 'All folders'); all.value = '';
    for (const path of [...new Set(this.records.map(r => r.file.parent?.path || '/'))].sort()) {
      const option = element(folder, 'option', '', path); option.value = path;
    }
    const status = element(this.contentEl, 'div', 'ss-gallery-status');
    const grid = element(this.contentEl, 'div', 'ss-presentation-grid');
    const draw = () => {
      this.owner?.unload(); this.owner = new Component(); this.owner.load(); grid.replaceChildren();
      const terms = search.value.toLocaleLowerCase().trim().split(/\s+/);
      const matches = this.records.filter(r => (!folder.value || (r.file.parent?.path || '/') === folder.value) && terms.every(t => (r.doc.title + ' ' + r.file.path).toLocaleLowerCase().includes(t)));
      status.textContent = `${matches.length} presentation${matches.length === 1 ? '' : 's'}`;
      grid.scrollTop = 0;
      // Cards are cheap; each interactive deck resolves slides/citations only
      // when it approaches the viewport. Retain loaded previews so scrolling
      // back preserves the slide the user was browsing.
      const batch = this.owner;
      const mounts = new Map<Element, () => void>();
      const observer = new IntersectionObserver(entries => {
        for (const entry of entries) if (entry.isIntersecting) mounts.get(entry.target)?.();
      }, { root: grid, rootMargin: '200px' });
      batch.register(() => { observer.disconnect(); mounts.clear(); });
      if (!matches.length) element(grid, 'p', '', 'No matching presentations.');
      for (const record of matches) {
        const card = element(grid, 'div', 'ss-presentation-card');
        const source = embedSource(record.doc.id, record.file.path);
        const choose = () => { this.close(); this.insert(source); };
        const preview = element(card, 'div');
        const placeholder = element(preview, 'div', 'ss-note-embed');
        element(placeholder, 'div', 'ss-embed-toolbar', record.doc.title);
        element(placeholder, 'div', 'ss-embed-mount');
        element(placeholder, 'div', 'ss-embed-controls ss-gallery-status', 'Preview loads as you scroll');
        const mount = () => {
          if (!mounts.delete(card)) return;
          observer.unobserve(card);
          batch.addChild(new NoteEmbed(this.plugin, preview, JSON.stringify({ id: record.doc.id, path: record.file.path }), '', choose));
        };
        mounts.set(card, mount); observer.observe(card);
        batch.registerDomEvent(card, 'focusin', mount);
        element(card, 'div', 'ss-gallery-path', record.file.path);
        button(card, 'Insert presentation', choose, 'mod-cta');
      }
    };
    search.oninput = () => { clearTimeout(this.timer); this.timer = setTimeout(() => { draw(); }, 150); };
    folder.onchange = () => { clearTimeout(this.timer); draw(); };
    draw(); search.focus();
  }
  onClose() { clearTimeout(this.timer); this.owner?.unload(); }
}
