import { parse, stringify } from 'yaml';
export const WIDTH = 1600,
  HEIGHT = 900,
  BOTTOM = 792;
export type PageType = 'intro' | 'section' | 'content';
export type Block = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  font: number;
  align: 'left' | 'center' | 'right';
  kind: 'markdown' | 'image' | 'note';
  text: string;
  color?: string;
};
export type Theme = {
  palette?: 'fluid-dynamics' | 'christmas' | 'christmas-night';
  useSlideThemes?: boolean;
  style: 'uiuc' | 'vault';
  pattern: boolean;
  backgroundPattern?: boolean;
  navy: string;
  accent: string;
  logo: string;
  footer: boolean;
  pagination: boolean;
  titlePagination: boolean;
  pageNumberFormat?: 'current' | 'current-total';
  mode: 'light' | 'dark';
};
export const DEFAULT_THEME: Theme = {
  style: 'uiuc',
  pattern: false,
  navy: '#13294b',
  accent: '#ff5f05',
  logo: '',
  footer: true,
  pagination: true,
  titlePagination: false,
  pageNumberFormat: 'current-total',
  mode: 'light',
};
export type Slide = {
  kind: 'slide';
  speakerNotes?: string;
  version: 1;
  bibliography?: string | string[];
  id: string;
  title: string;
  type: PageType;
  section: string;
  source: string;
  appearance: 'light' | 'dark';
  style: 'uiuc' | 'vault';
  pattern: boolean;
  backgroundPattern?: boolean;
  blocks: Block[];
};
export type Section = { id: string; title: string; parent?: string; footer?: string };
export type Entry = { id: string; file: string; section: string; sectionId?: string; canvas?: { x: number; y: number } };
export type Deck = {
  kind: 'deck';
  version: 1;
  bibliography?: string | string[];
  id: string;
  title: string;
  theme: Theme;
  slides: Entry[];
  sections?: Section[];
  showOutlines?: boolean;
  trash?: { entry: Entry; index: number; removedAt: string }[];
};
export type Doc = Slide | Deck;
export const uuid = () => globalThis.crypto.randomUUID();
export const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x));
export function clampGeometry(b: Block): Block {
  const w = Math.max(b.kind === 'image' ? 1 : 100, Math.min(WIDTH, b.w)),
    h = Math.max(b.kind === 'image' ? 1 : 50, Math.min(BOTTOM, b.h));
  return {
    ...b,
    w,
    h,
    x: Math.max(0, Math.min(WIDTH - w, b.x)),
    y: Math.max(0, Math.min(BOTTOM - h, b.y)),
    font: Math.max(12, Math.min(160, b.font)),
  };
}
export function block(text = '', extra: Partial<Block> = {}): Block {
  return clampGeometry({
    id: uuid(),
    kind: 'markdown',
    text,
    x: 80,
    y: 190,
    w: 1440,
    h: 500,
    font: 36,
    align: 'left',
    ...extra,
  });
}
export function newSlide(title: string, type: PageType = 'content', text = ''): Slide {
  return {
    kind: 'slide',
    version: 1,
    id: uuid(),
    title,
    type,
    section: '',
    source: '',
    appearance: 'light',
    style: 'uiuc',
    pattern: false,
    blocks: [
      block(`# ${title}`, {
        y: type === 'content' ? 55 : 210,
        h: type === 'content' ? 110 : 200,
        font: type === 'content' ? 44 : 60,
      }),
      block(
        text ||
          (type === 'intro'
            ? 'Author · Affiliation\n\nDate'
            : type === 'section'
              ? 'Section introduction'
              : 'Write Markdown and $\\LaTeX$ here.'),
        { y: type === 'content' ? 200 : 440, h: type === 'content' ? 520 : 240, font: 36 },
      ),
    ],
  };
}
export function newDeck(title: string, slides: Entry[] = []): Deck {
  return { kind: 'deck', version: 1, id: uuid(), title, theme: clone(DEFAULT_THEME), slides };
}
export function serialize(doc: Doc): string {
  const base = {
    'slide-studio': doc.kind,
    'slide-studio-version': 1,
    id: doc.id,
    title: doc.title,
    ...(doc.bibliography ? {bibliography:doc.bibliography}:{}),
  };
  if (doc.kind === 'deck')
    return `---\n${stringify({ ...base, theme: doc.theme, slides: doc.slides, ...(doc.showOutlines !== undefined ? { showOutlines: doc.showOutlines } : {}), ...(doc.sections ? { sections: doc.sections } : {}), ...(doc.trash ? { trash: doc.trash } : {}) })}---\n\n# ${doc.title}\n\n${doc.slides.map((e) => `[[${e.file.replace(/\.md$/, '')}]]`).join('\n\n')}\n`;
  return `---\n${stringify({ ...base, type: doc.type, appearance: doc.appearance, style: doc.style, pattern: doc.pattern, backgroundPattern: doc.backgroundPattern, section: doc.section, source: doc.source, ...(doc.speakerNotes !== undefined ? {speakerNotes: doc.speakerNotes} : {}), layout: doc.blocks.map(({ text, ...b }) => b) })}---\n\n${doc.blocks.map((b) => `<!-- slide-block:${b.id} -->\n${b.text}`).join('\n\n')}\n`;
}
function fail(s: string): never {
  throw new Error(`Invalid Slide Studio file: ${s}`);
}
function str(v: unknown, name: string): string {
  if (typeof v !== 'string') fail(`${name} must be text`);
  return v;
}
function num(v: unknown, name: string): number {
  if (typeof v !== 'number' || !Number.isFinite(v)) fail(`${name} must be finite`);
  return v;
}
export function deserialize(raw: string): Doc | null {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return null;
  const f = parse(match[1]);
  if (!f || !['slide', 'deck'].includes(f['slide-studio'])) return null;
  if (f['slide-studio-version'] !== 1) fail('unsupported schema version');
  const id = str(f.id, 'id'),
    title = str(f.title, 'title');
  if (!id) fail('empty id');
  if(f.bibliography!==undefined && !(typeof f.bibliography==='string'||Array.isArray(f.bibliography)&&f.bibliography.every((p:unknown)=>typeof p==='string')))fail('bibliography must be a path or list of paths');
  const bibliography=f.bibliography ? {bibliography:f.bibliography}:{};
  if (f['slide-studio'] === 'deck') {
    if (!Array.isArray(f.slides)) fail('slides must be a list');
    if (f.showOutlines !== undefined && typeof f.showOutlines !== 'boolean') fail('invalid outline setting');
    const theme = { ...DEFAULT_THEME, ...f.theme };
    for (const k of ['navy', 'accent'] as const)
      if (!/^#[0-9a-f]{6}$/i.test(theme[k])) fail('theme color must be #RRGGBB');
    if (!['light', 'dark'].includes(theme.mode)) fail('invalid appearance');
    if (theme.useSlideThemes !== undefined && typeof theme.useSlideThemes !== 'boolean')
      fail('invalid individual theme setting');
    if (theme.palette !== undefined && !['fluid-dynamics','christmas','christmas-night'].includes(theme.palette)) fail('invalid color palette');
    str(theme.logo, 'logo');
    if (!['uiuc', 'vault'].includes(theme.style) || typeof theme.pattern !== 'boolean')
      fail('invalid theme style');
    if (theme.pageNumberFormat !== undefined && !['current', 'current-total'].includes(theme.pageNumberFormat))
      fail('invalid page number format');
    if (typeof theme.footer !== 'boolean' || typeof theme.pagination !== 'boolean' ||
        typeof theme.titlePagination !== 'boolean')
      fail('invalid footer setting');
    return {
      kind: 'deck',
      ...bibliography,
      version: 1,
      id,
      title,
      theme,
      ...(f.showOutlines !== undefined ? {showOutlines:f.showOutlines} : {}),
      ...(f.sections !== undefined ? { sections: parseSections(f.sections, f.slides) } : {}),
      ...(f.trash !== undefined ? { trash: parseTrash(f.trash) } : {}),
      slides: f.slides.map((e: any) => ({
        id: str(e.id, 'slide id'),
        file: str(e.file, 'slide file'),
        section: str(e.section ?? '', 'section'),
        ...(e.sectionId !== undefined ? { sectionId: str(e.sectionId, 'section id') } : {}),
        ...parseCanvas(e.canvas),
      })),
    };
  }
  if (!['intro', 'section', 'content'].includes(f.type) || !Array.isArray(f.layout))
    fail('type or layout');
  const body = raw.slice(match[0].length),
    chunks = new Map<string, string>();
  const markers = [...body.matchAll(/^<!-- slide-block:([\w-]+) -->\r?$/gm)];
  markers.forEach((m, i) => {
    if (chunks.has(m[1])) fail('duplicate content block');
    chunks.set(
      m[1],
      body
        .slice(m.index! + m[0].length, markers[i + 1]?.index ?? body.length)
        .replace(/^\r?\n/, '')
        .replace(/\r?\n\r?\n$|\r?\n$/, ''),
    );
  });
  const ids = new Set<string>();
  const blocks = f.layout.map((b: any) => {
    str(b.id, 'block id');
    if (ids.has(b.id) || !chunks.has(b.id)) fail('duplicate or missing block');
    ids.add(b.id);
    if (
      !['markdown', 'image', 'note'].includes(b.kind) ||
      !['left', 'center', 'right'].includes(b.align)
    )
      fail('block type or alignment');
    for (const k of ['x', 'y', 'w', 'h', 'font']) num(b[k], k);
    if (b.color !== undefined && b.color !== '' && !/^#[0-9a-f]{6}$/i.test(b.color))
      fail('invalid text color');
    return clampGeometry({ ...b, text: chunks.get(b.id)! }) as Block;
  });
  if (chunks.size !== blocks.length) fail('content without layout');
  return {
    kind: 'slide',
    ...bibliography,
    version: 1,
    id,
    title,
    type: f.type,
    appearance: f.appearance === 'dark' ? 'dark' : 'light',
    style: f.style === 'vault' ? 'vault' : 'uiuc',
    pattern: f.pattern === true,
    ...(typeof f.backgroundPattern === 'boolean' ? { backgroundPattern: f.backgroundPattern } : {}),
    section: str(f.section ?? '', 'section'),
    source: str(f.source ?? '', 'source'),
    ...(f.speakerNotes !== undefined ? {speakerNotes: str(f.speakerNotes, 'speakerNotes')} : {}),
    blocks,
  };
}
export function moveEntry(entries: Entry[], from: number, to: number): Entry[] {
  const out = clone(entries);
  if (from < 0 || to < 0 || from >= out.length || to >= out.length) return out;
  const [e] = out.splice(from, 1);
  out.splice(to, 0, e);
  return out;
}
export function wikiTargets(text: string): string[] {
  // Ignore fenced code and inline code examples when gathering an outline.
  const prose = text
    .replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\s*$/gm, '')
    .replace(/`[^`\n]+`/g, '');
  return [...prose.matchAll(/(?<!!)\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g)].map(
    (m) => m[1].split('#')[0],
  );
}
export function uniqueEntries(entries: Entry[]): Entry[] {
  const seen = new Set<string>();
  return entries.filter((e) => !seen.has(e.id) && !!seen.add(e.id));
}
export function resolveEntry<T extends { id: string }>(entry: Entry, items: T[]): T | undefined {
  const matches = items.filter((x) => x.id === entry.id);
  if (matches.length > 1)
    throw new Error('Duplicate slide ID: duplicate slides with the Duplicate command.');
  return matches[0];
}
export function sectionAt(deck: Deck, index: number, slides: (Slide | null)[]): string {
  if (deck.sections) {
    let group = deck.sections.find(g => g.id === deck.slides[index]?.sectionId);
    const nearest = group;
    const seen = new Set<string>();
    while (group && !seen.has(group.id)) {
      seen.add(group.id);
      if (group.footer !== undefined) return group.footer;
      group = deck.sections.find(g => g.id === group!.parent);
    }
    return nearest?.title ?? deck.title;
  }
  for (let i = index; i >= 0; i--) {
    if (deck.slides[i]?.section) return deck.slides[i].section;
    const s = slides[i];
    if (s?.type === 'section') return s.section || s.title;
  }
  return slides[0]?.section || deck.title;
}

// Section names live at a boundary; renaming from any member updates that boundary.
export function sectionStart(deck: Deck, index: number, slides: (Slide | null)[]): number {
  if (deck.sections) {
    let start = index;
    while (start > 0 && deck.slides[start-1]?.sectionId === deck.slides[index]?.sectionId) start--;
    return start;
  }
  for (let i = index; i >= 0; i--) {
    if (deck.slides[i]?.section || slides[i]?.type === 'section') return i;
  }
  return 0;
}
export function standaloneTheme(slide: Slide): Theme {
  return {
    ...DEFAULT_THEME,
    mode: slide.appearance,
    style: slide.style,
    pattern: slide.pattern,
    backgroundPattern: slide.backgroundPattern,
  };
}

export const PRESENTATION_THEMES = [
  'UIUC light',
  'UIUC dark',
  'Fluid dynamics light',
  'Fluid dynamics dark',
  'Christmas Light',
  'Christmas Night',
  'Vault theme',
  'Use individual slide themes',
];
export function presentationThemeLabel(theme: Theme): string {
  return theme.useSlideThemes
    ? 'Use individual slide themes'
    : theme.palette === 'christmas-night'
      ? 'Christmas Night'
    : theme.palette === 'christmas'
      ? 'Christmas Light'
    : theme.palette === 'fluid-dynamics'
      ? theme.mode === 'dark' ? 'Fluid dynamics dark' : 'Fluid dynamics light'
    : theme.style === 'vault'
      ? 'Vault theme'
      : theme.mode === 'dark'
        ? 'UIUC dark'
        : 'UIUC light';
}
export function applyPresentationTheme(theme: Theme, choice: string): Theme {
  if (choice === 'Christmas Eve') choice = 'Christmas Light'; // Legacy preset name.
  if (!PRESENTATION_THEMES.includes(choice)) throw new Error('Unknown presentation theme');
  const fluid = choice.startsWith('Fluid dynamics'), night = choice === 'Christmas Night', christmas = night || choice === 'Christmas Light';
  const { palette, ...base } = theme;
  return {
    ...base,
    ...(christmas ? { palette: night ? 'christmas-night' as const : 'christmas' as const } : fluid ? { palette: 'fluid-dynamics' as const } : {}),
    ...(christmas ? {navy:night?'#08182e':'#12372f',accent:'#f4d493'} : fluid ? { navy: '#233c4c', accent: choice.endsWith('dark') ? '#e9ac7d' : '#bd692d' }
      : theme.palette ? { navy: DEFAULT_THEME.navy, accent: DEFAULT_THEME.accent } : {}),
    useSlideThemes: choice === 'Use individual slide themes',
    style: choice === 'Vault theme' ? 'vault' : (choice.startsWith('UIUC') || fluid || christmas) ? 'uiuc' : theme.style,
    mode: christmas ? 'dark' : choice.endsWith(' light') ? 'light' : choice.endsWith(' dark') ? 'dark' : theme.mode,
  };
}
export function themeForSlide(deck: Deck, slide: Slide): Theme {
  return deck.theme.useSlideThemes
    ? {
        ...deck.theme,
        style: slide.style,
        mode: slide.appearance,
        pattern: slide.pattern,
        backgroundPattern: slide.backgroundPattern,
      }
    : deck.theme;
}

/** Visible numbering excludes title slides unless the deck explicitly includes them.
 * Missing slides retain a position so later slides do not silently renumber. */
export function slideNumber(theme: Theme, slides: (Slide | null)[], index: number): number | undefined {
  if (!theme.pagination || index < 0 || index >= slides.length || (slides[index]?.type === 'intro' && !theme.titlePagination)) return undefined;
  return slides.slice(0, index + 1).filter(s => theme.titlePagination || s?.type !== 'intro').length;
}
export function slidePageNumber(theme: Theme, slides: (Slide | null)[], index: number): string {
  const current = slideNumber(theme, slides, index);
  if (current === undefined) return '';
  const total = slides.filter(s => theme.titlePagination || s?.type !== 'intro').length;
  return theme.pageNumberFormat === 'current' ? String(current) : `${current}/${total}`;
}

function parseCanvas(value: any): Pick<Entry, 'canvas'> {
  if (value === undefined) return {};
  if (!value || !Number.isFinite(value.x) || !Number.isFinite(value.y) || value.x < 0 || value.y < 0) fail('invalid canvas position');
  return {canvas: {x: value.x, y: value.y}};
}
function parseTrash(value: unknown): NonNullable<Deck['trash']> {
  if (!Array.isArray(value)) fail('trash must be a list');
  return value.map(t => {
    if (!t?.entry || !Number.isInteger(t.index) || t.index < 0) fail('invalid trashed slide');
    return { entry: { id: str(t.entry.id, 'slide id'), file: str(t.entry.file, 'slide file'),
      section: str(t.entry.section ?? '', 'section'), ...parseCanvas(t.entry.canvas),
      ...(t.entry.sectionId !== undefined ? {sectionId: str(t.entry.sectionId, 'section id')} : {}) }, index: t.index, removedAt: str(t.removedAt, 'removal date') };
  });
}
export function trashSlide(deck: Deck, index: number): void {
  if (!deck.slides[index]) return;
  const [entry] = deck.slides.splice(index, 1);
  (deck.trash ??= []).push({ entry, index, removedAt: new Date().toISOString() });
}
export function restoreSlide(deck: Deck, index: number): void {
  if (!deck.trash?.[index]) return;
  const [item] = deck.trash.splice(index, 1);
  deck.slides.splice(Math.min(item.index, deck.slides.length), 0, item.entry);
}

/** insertion is a gap in the original list, from 0 through entries.length. */
export function moveEntries(entries: Entry[], selected: number[], insertion: number): { entries: Entry[]; start: number } {
  const indices = [...new Set(selected)].filter(i => Number.isInteger(i) && i >= 0 && i < entries.length).sort((a,b) => a-b);
  const chosen = new Set(indices);
  const gap = Math.max(0, Math.min(entries.length, insertion));
  const start = gap - indices.filter(i => i < gap).length;
  const remaining = entries.filter((_,i) => !chosen.has(i));
  remaining.splice(start, 0, ...indices.map(i => entries[i]));
  return { entries: remaining, start };
}

function parseSections(value: unknown, entries: any[]): Section[] {
  if (!Array.isArray(value)) fail('sections must be a list');
  const sections: Section[] = value.map(g => ({ id: str(g.id, 'section id'), title: str(g.title, 'section title'),
    ...(g.parent !== undefined ? {parent:str(g.parent,'parent section')} : {}),
    ...(g.footer !== undefined ? {footer:str(g.footer,'footer')} : {}) }));
  const ids = new Set(sections.map(g => g.id));
  if (ids.size !== sections.length || ids.has('')) fail('duplicate or empty section id');
  for (const g of sections) {
    const seen = new Set([g.id]);
    let p = g.parent;
    while (p !== undefined) {
      if (!ids.has(p) || seen.has(p)) fail('missing or cyclic parent section');
      seen.add(p); p = sections.find(s => s.id === p)!.parent;
    }
  }
  for (const e of entries) if (!ids.has(e.sectionId)) fail('missing slide section');
  return sections;
}
