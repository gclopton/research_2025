import { App, TFile, normalizePath } from 'obsidian';
import {
  Doc,
  Deck,
  clone,
  uuid,
  Slide,
  Entry,
  deserialize,
  serialize,
  resolveEntry,
  wikiTargets,
  uniqueEntries,
  newDeck,
} from './model';
import { PresentationDetails, titleSlide } from './presentation';
import { checkedReplacement } from './persistence';
import { imageName, localImageFolder } from './attachments';
export type RecordDoc = { file: TFile; doc: Doc; raw: string };
export class Store {
  constructor(public app: App) {}
  async read(file: TFile): Promise<RecordDoc> {
    const raw = await this.app.vault.read(file);
    const doc = deserialize(raw);
    if (!doc) throw new Error('This note is not a Slide Studio slide or presentation.');
    return { file, doc, raw };
  }
  async folder(path: string) {
    if (!this.app.vault.getAbstractFileByPath(path)) await this.app.vault.createFolder(path);
  }
  private allocating: Promise<unknown> = Promise.resolve();
  private safeName(title: string): string {
    return title.replace(/[\\/:*?"<>|#\[\]]/g, ' ').trim().slice(0, 110).replace(/^\.+$/, '') || 'Untitled';
  }
  /** Reserve names serially, including simultaneous creation from separate windows. */
  create(doc: Doc, directory?: string): Promise<RecordDoc> {
    const operation = this.allocating.then(async () => {
      const name = this.safeName(doc.title);
      let folder = directory;
      if (!folder && doc.kind === 'deck') {
        await this.folder('Presentations');
        folder = `Presentations/${name}`;
        let n = 2;
        while (this.app.vault.getAbstractFileByPath(folder)) folder = `Presentations/${name} ${n++}`;
        await this.folder(folder);
      }
      folder ??= 'Slides/Library';
      await this.folder(folder);
      let path = `${folder}/${name}.md`, n = 2;
      while (this.app.vault.getAbstractFileByPath(path)) path = `${folder}/${name} ${n++}.md`;
      const raw = serialize(doc);
      return { file: await this.app.vault.create(path, raw), doc, raw };
    });
    this.allocating = operation.catch(() => undefined);
    return operation;
  }
  slideFolder(deck: RecordDoc): string {
    return `${deck.file.parent?.path || 'Presentations'}/Slides`;
  }
  async copySlide(record: RecordDoc, directory: string, title = record.doc.title): Promise<RecordDoc> {
    if (record.doc.kind !== 'slide') throw new Error('Choose a slide to copy.');
    const slide = clone(record.doc);
    slide.id = uuid();
    slide.title = title;
    slide.blocks.forEach(b => b.id = uuid());
    // Preserve resolution of relative images, Markdown links, and scientific sources.
    slide.source ||= record.file.path;
    return this.create(slide, directory);
  }
  /** Deep-copy slide documents; intentionally retain references to scientific sources. */
  async copyPresentation(record: RecordDoc, title: string, shared = false): Promise<RecordDoc> {
    if (record.doc.kind !== 'deck') throw new Error('Choose a presentation.');
    const deck = clone(record.doc);
    deck.id = uuid();
    deck.title = title;
    delete deck.trash; // A new version starts with an empty trash bin.
    const originals = shared ? [] : await Promise.all(deck.slides.map(e => this.resolve(e)));
    if (!shared && originals.some(r => !r || r.doc.kind !== 'slide'))
      throw new Error('A slide is missing. Restore it or remove its entry before copying this presentation.');
    const created = await this.create({ ...deck, slides: [] });
    const copies: RecordDoc[] = [];
    try {
      const byId = new Map<string, RecordDoc>();
      if (!shared) {
        for (let i = 0; i < deck.slides.length; i++) {
          const original = originals[i]!;
          let copy = byId.get(original.doc.id);
          if (!copy) {
            copy = await this.copySlide(original, this.slideFolder(created));
            copies.push(copy);
            byId.set(original.doc.id, copy);
          }
          deck.slides[i] = { ...deck.slides[i], id: copy.doc.id, file: copy.file.path };
        }
      }
      created.raw = await this.save(created, deck);
      created.doc = deck;
      return created;
    } catch (error) {
      for (const r of [...copies, created].reverse()) await this.app.vault.trash(r.file, false);
      throw error;
    }
  }
  /** Move a legacy flat deck; only move slides that are exclusive to this deck. */
  async organizePresentation(record: RecordDoc): Promise<RecordDoc> {
    if (record.doc.kind !== 'deck') throw new Error('Choose a presentation.');
    if (record.file.parent?.path !== 'Presentations') return record;
    const decks = await this.list('deck');
    const others = new Set(decks.filter(r => r.doc.id !== record.doc.id)
      .flatMap(r => r.doc.kind === 'deck' ? r.doc.slides.map(e => e.id) : []));
    const slides = await Promise.all(record.doc.slides.map(e => this.resolve(e)));
    let folder = `Presentations/${this.safeName(record.doc.title)}`, n = 2;
    while (this.app.vault.getAbstractFileByPath(folder)) folder = `Presentations/${this.safeName(record.doc.title)} ${n++}`;
    await this.folder(folder);
    await this.app.fileManager.renameFile(record.file, `${folder}/${record.file.name}`);
    await this.folder(`${folder}/Slides`);
    const moved = new Set<string>();
    for (const r of slides) {
      if (!r || r.doc.kind !== 'slide' || others.has(r.doc.id) || moved.has(r.doc.id) || r.file.parent?.path !== 'Slides') continue;
      const doc = clone(r.doc);
      doc.source ||= r.file.path;
      await this.save(r, doc);
      await this.app.fileManager.renameFile(r.file, `${folder}/Slides/${r.file.name}`);
      moved.add(r.doc.id);
    }
    const fresh = await this.read(record.file);
    if (fresh.doc.kind !== 'deck') throw new Error('Presentation changed during organization.');
    fresh.doc.slides = fresh.doc.slides.map((e, i) => ({ ...e, file: slides[i]?.file.path ?? e.file }));
    fresh.raw = await this.save(fresh, fresh.doc);
    return fresh;
  }
  async emptyPresentationTrash(record: RecordDoc): Promise<{ record: RecordDoc; deleted: number; kept: number }> {
    if (record.doc.kind !== 'deck') throw new Error('Choose a presentation.');
    const deck = clone(record.doc), items = deck.trash ?? [];
    const docs = await this.list('deck');
    const referenced = new Set<string>();
    for (const r of docs) if (r.doc.kind === 'deck') {
      for (const e of r.doc.slides) referenced.add(e.id);
      if (r.doc.id !== deck.id) for (const t of r.doc.trash ?? []) referenced.add(t.entry.id);
    }
    const candidates: RecordDoc[] = [];
    let kept = 0;
    const seen = new Set<string>();
    for (const item of items) {
      if (seen.has(item.entry.id)) continue;
      seen.add(item.entry.id);
      const slide = await this.resolve(item.entry);
      if (!slide) continue;
      const linked = this.app.vault.getMarkdownFiles().some(f => {
        if (f.path === record.file.path || f.path === slide.file.path) return false;
        const cache = this.app.metadataCache.getFileCache(f);
        return [...(cache?.links ?? []), ...(cache?.embeds ?? [])].some(link =>
          link.link.includes(slide.doc.id) ||
          this.app.metadataCache.getFirstLinkpathDest(link.link.split('#')[0], f.path)?.path === slide.file.path);
      });
      if (referenced.has(slide.doc.id) || linked || !slide.file.path.startsWith(this.slideFolder(record) + '/')) kept++;
      else candidates.push(slide);
    }
    deck.trash = [];
    const updated = { file: record.file, doc: deck, raw: await this.save(record, deck) };
    let deleted = 0;
    for (const slide of candidates) {
      try { await this.app.vault.trash(slide.file, false); deleted++; }
      catch {
        // Keep failed deletions available in this bin for a later retry.
        deck.trash.push(...items.filter(t => t.entry.id === slide.doc.id));
      }
    }
    if (deck.trash.length) updated.raw = await this.save(updated, deck);
    return { record: updated, deleted, kept };
  }
  async save(record: RecordDoc, doc: Doc): Promise<string> {
    const expected = record.raw,
      next = serialize(doc);
    await this.app.vault.process(record.file, (current) =>
      checkedReplacement(current, expected, next),
    );
    return next;
  }
  async createPresentation(details: PresentationDetails, source = ''): Promise<RecordDoc> {
    const deck = await this.create(newDeck(details.title.trim()));
    let slide: RecordDoc | undefined;
    try {
      slide = await this.create(titleSlide(details, source), this.slideFolder(deck));
      const doc = deck.doc as Deck;
      doc.slides = [{ id: slide.doc.id, file: slide.file.path, section: '' }];
      deck.raw = await this.save(deck, doc);
      return deck;
    } catch (error) {
      if (slide) await this.app.vault.trash(slide.file, false);
      await this.app.vault.trash(deck.file, false);
      throw error;
    }
  }
  // Serialize attachment allocation across views to prevent simultaneous filename collisions.
  private importing: Promise<unknown> = Promise.resolve();
  importImage(file: File, sourcePath: string): Promise<TFile> {
    const operation = this.importing.then(async () => {
      const data = await file.arrayBuffer();
      const name = imageName(file);
      const config = (this.app.vault as unknown as { getConfig(key: string): unknown }).getConfig(
        'attachmentFolderPath',
      );
      let path: string;
      if (!config || config === '/') {
        const folder = localImageFolder(sourcePath);
        await this.folder(folder);
        path = `${folder}/${name}`;
        const dot = name.lastIndexOf('.');
        let n = 2;
        while (this.app.vault.getAbstractFileByPath(path))
          path = `${folder}/${name.slice(0, dot)} ${n++}${name.slice(dot)}`;
      } else {
        path = await this.app.fileManager.getAvailablePathForAttachment(name, sourcePath);
      }
      return this.app.vault.createBinary(path, data);
    });
    this.importing = operation.catch(() => undefined);
    return operation;
  }
  async list(kind?: 'slide' | 'deck'): Promise<RecordDoc[]> {
    const files = this.app.vault.getMarkdownFiles().filter((f) => {
      const fm = this.app.metadataCache.getFileCache(f)?.frontmatter;
      return fm?.['slide-studio'] && (!kind || fm['slide-studio'] === kind);
    });
    const records = await Promise.all(files.map((f) => this.read(f).catch(() => null)));
    return records.filter((r): r is RecordDoc => r !== null);
  }
  async resolve(entry: Entry): Promise<RecordDoc | null> {
    const records = await this.list('slide');
    let match = resolveEntry(
      entry,
      records.map((r) => ({ id: r.doc.id, record: r })),
    )?.record;
    if (!match) {
      const f = this.app.vault.getAbstractFileByPath(normalizePath(entry.file));
      if (f instanceof TFile) {
        const r = await this.read(f);
        if (r.doc.kind === 'slide' && r.doc.id === entry.id) match = r;
      }
    }
    return match ?? null;
  }
  async resolveMany(entries: Entry[]): Promise<(RecordDoc | null)[]> {
    const records = await this.list('slide');
    return Promise.all(entries.map(async entry => {
      const matches = records.filter(r => r.doc.id === entry.id);
      if (matches.length > 1) throw Error('Duplicate slide ID. Use Duplicate slide to make independent copies.');
      if (matches.length) return matches[0];
      const file = this.app.vault.getAbstractFileByPath(normalizePath(entry.file));
      if (!(file instanceof TFile)) return null;
      const record = await this.read(file);
      return record.doc.kind === 'slide' && record.doc.id === entry.id ? record : null;
    }));
  }
  /** Prepare a fragment without writing the destination. Caller saves it as one undoable edit. */
  async prepareImport(source: Deck, destination: RecordDoc, shared = false): Promise<{ deck: Deck; created: RecordDoc[] }> {
    const records = await this.resolveMany(source.slides);
    if (records.some(r => !r || r.doc.kind !== 'slide')) throw Error('An imported slide is missing. Nothing was imported.');
    const deck = clone(source), created: RecordDoc[] = [];
    delete deck.trash;
    const ids = new Map((deck.sections ?? []).map(g => [g.id, uuid()]));
    deck.sections?.forEach(g => { g.id = ids.get(g.id)!; if (g.parent) g.parent = ids.get(g.parent)!; });
    try {
      const copies = new Map<string, RecordDoc>();
      for (let i = 0; i < deck.slides.length; i++) {
        const entry = deck.slides[i];
        if (entry.sectionId) entry.sectionId = ids.get(entry.sectionId);
        if (!shared) {
          let copy = copies.get(entry.id);
          if (!copy) {
            copy = await this.copySlide(records[i]!, this.slideFolder(destination));
            created.push(copy); copies.set(entry.id, copy);
          }
          entry.id = copy.doc.id; entry.file = copy.file.path;
        }
      }
      return { deck, created };
    } catch (error) {
      for (const r of created) await this.app.vault.trash(r.file, false);
      throw error;
    }
  }
  async collect(file: TFile): Promise<Entry[]> {
    const raw = await this.app.vault.read(file),
      out: Entry[] = [];
    for (const target of wikiTargets(raw)) {
      const f = this.app.metadataCache.getFirstLinkpathDest(target, file.path);
      if (!f) continue;
      try {
        const { doc } = await this.read(f);
        if (doc.kind === 'slide') out.push({ id: doc.id, file: f.path, section: '' });
      } catch {}
    }
    return uniqueEntries(out);
  }
}
