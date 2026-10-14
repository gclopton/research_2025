import { element, button } from './render';

/** Modeless, view-owned palette: it never steals space from the slide canvas. */
export class SettingsPalette {
  root: HTMLElement;
  content: HTMLElement;
  private tabs: HTMLElement;
  private caption: HTMLElement;
  private active = '';
  private win: Window;
  private resize: () => void;
  private endDrag: () => void;
  constructor(doc: Document) {
    this.win = doc.defaultView!;
    this.root = element(doc.body, 'section', 'ss-settings-window');
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-label', 'Slide Studio settings');
    this.root.setAttribute('aria-modal', 'false');
    const header = element(this.root, 'div', 'ss-settings-titlebar');
    this.caption = element(header, 'span', '', 'Settings');
    const close = button(header, '×', () => this.hide());
    close.setAttribute('aria-label', 'Close settings');
    close.title = 'Close settings';
    this.tabs = element(this.root, 'div', 'ss-settings-tabs');
    this.tabs.setAttribute('role', 'tablist');
    this.content = element(this.root, 'div', 'ss-inspector ss-settings-content');
    this.content.setAttribute('role', 'tabpanel');
    this.root.style.left = `${Math.max(12, this.win.innerWidth - 390)}px`;
    this.root.style.top = '110px';
    let drag: { x: number; y: number; left: number; top: number } | null = null;
    const move = (e: MouseEvent) => {
      if (!drag) return;
      this.root.style.left = `${drag.left + e.clientX - drag.x}px`;
      this.root.style.top = `${drag.top + e.clientY - drag.y}px`;
      this.clamp();
    };
    const end = () => {
      drag = null;
      doc.removeEventListener('mousemove', move, true);
      doc.removeEventListener('mouseup', end, true);
    };
    this.endDrag = end;
    header.addEventListener('mousedown', e => {
      if (e.button !== 0 || (e.target as HTMLElement).closest('button')) return;
      const rect = this.root.getBoundingClientRect();
      drag = { x:e.clientX, y:e.clientY, left:rect.left, top:rect.top };
      doc.addEventListener('mousemove', move, true);
      doc.addEventListener('mouseup', end, true);
      e.preventDefault();
    });
    this.root.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.stopPropagation(); this.hide(); }
    });
    this.resize = () => this.clamp();
    this.win.addEventListener('resize', this.resize);
  }
  refresh(title: string) {
    this.caption.textContent = `Settings · ${title}`;
    let group = 'Slide';
    const groups = new Set<string>();
    for (const node of Array.from(this.content.children) as HTMLElement[]) {
      if (node.tagName === 'H3') {
        const name = node.textContent;
        group = name === 'Outlines' ? 'Outlines' : name === 'Theme' ? 'Style' : name === 'Section footer' ? 'Section'
          : name === 'Presentation' ? 'Presentation' : name === 'Slide' ? 'Slide' : 'Selection';
      }
      node.dataset.settingsTab = group;
      groups.add(group);
    }
    if (!groups.has(this.active)) this.active = [...groups][0] || 'Slide';
    this.tabs.replaceChildren();
    for (const group of groups) {
      const tab = button(this.tabs, group, () => { this.active = group; this.apply(); });
      tab.dataset.tab = group;
      tab.setAttribute('role', 'tab');
    }
    this.apply();
  }
  private apply() {
    for (const child of Array.from(this.content.children) as HTMLElement[]) child.hidden = child.dataset.settingsTab !== this.active;
    for (const tab of Array.from(this.tabs.children) as HTMLElement[]) {
      tab.setAttribute('aria-selected', String(tab.dataset.tab === this.active));
      tab.classList.toggle('is-active', tab.dataset.tab === this.active);
    }
    this.content.setAttribute('aria-label', this.active);
  }
  show(tab?: string) {
    if (tab && Array.from(this.tabs.children).some(el => (el as HTMLElement).dataset.tab === tab)) this.active = tab;
    this.apply(); this.root.hidden = false; this.clamp();
  }
  hide() { this.root.hidden = true; }
  toggle() { this.root.hidden ? this.show() : this.hide(); }
  private clamp() {
    const r = this.root.getBoundingClientRect();
    if (!r.width) return;
    this.root.style.left = `${Math.max(0, Math.min(r.left, this.win.innerWidth - r.width))}px`;
    this.root.style.top = `${Math.max(0, Math.min(r.top, this.win.innerHeight - Math.min(r.height, 120)))}px`;
  }
  destroy() { this.endDrag(); this.win.removeEventListener('resize', this.resize); this.root.remove(); }
}
