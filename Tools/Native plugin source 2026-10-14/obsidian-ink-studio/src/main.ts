import {menuGroup} from './menu-groups';
import { capturePassage } from "./annotation";
import { sourceStatus } from "./source-status";
import { alignImage } from "./image-alignment";
import {
  Plugin,
  Notice,
  TFile,
  MarkdownView,
  Menu,
  editorInfoField,
} from "obsidian";
import {
  StateEffect,
  StateField,
  EditorSelection,
  Prec,
} from "@codemirror/state";
import {
  EditorView,
  WidgetType,
  Decoration,
  ViewPlugin,
} from "@codemirror/view";
import {
  blankScene,
  blankSVG,
  readScene,
  scenePath,
  assertUnchanged,
  SaveQueue,
  type InkScene,
} from "./model";
interface Session {
  id: string;
  preview: TFile;
  scene: TFile;
  expected: string;
  data: InkScene;
  from: number;
  pos: number;
  note: string;
}
const active = StateEffect.define<Session | null>();
let plugin: InkStudio;
class InkWidget extends WidgetType {
  constructor(readonly session: Session) {
    super();
  }
  eq(other: InkWidget) {
    return other.session.id === this.session.id;
  }
  toDOM(view: EditorView) {
    return plugin.mount(
      this.session,
      view.dom.ownerDocument,
      (returnFocus = true) => {
        const s = view.state.field(field, false);
        if (s?.id === this.session.id) {
          view.dispatch({
            effects: active.of(null),
            ...(returnFocus
              ? {
                  selection: EditorSelection.cursor(
                    Math.min(s.pos + 1, view.state.doc.length),
                  ),
                }
              : {}),
          });
          if (returnFocus) view.focus();
        }
      },
      () => view.requestMeasure(),
    );
  }
  ignoreEvent() {
    return true;
  }
  destroy(dom: HTMLElement) {
    (dom as any).inkDispose?.();
  }
}
const field = StateField.define<Session | null>({
  create: () => null,
  update(value, tr) {
    for (const e of tr.effects) if (e.is(active)) return e.value;
    if (value && tr.docChanged) {
      let removed = false;
      tr.changes.iterChangedRanges((from, to) => {
        if (from < value!.pos && to > value!.from) removed = true;
      });
      if (removed) return null;
    }
    return value
      ? {
          ...value,
          from: tr.changes.mapPos(value.from),
          pos: tr.changes.mapPos(value.pos),
        }
      : null;
  },
  provide: (f) =>
    EditorView.decorations.from(f, (value) =>
      value
        ? Decoration.set([
            Decoration.replace({
              widget: new InkWidget(value),
              block: true,
            }).range(value.from, value.pos),
          ])
        : Decoration.none,
    ),
});
export default class InkStudio extends Plugin {
  code = "";
  css = "";
  locks = new Set<string>();
  disposals = new Set<() => void>();
  async onload() {
    plugin = this;
    this.code = await this.app.vault.adapter.read(
      `${this.manifest.dir}/frame.js`,
    );
    this.css = await this.app.vault.adapter.read(
      `${this.manifest.dir}/vendor/excalidraw.css`,
    );
    this.registerEditorExtension([
      Prec.highest(field),
      ViewPlugin.fromClass(
        class {
          click = (e: MouseEvent) => {
            if (e.button !== 0) return;
            const image = (e.target as HTMLElement).closest?.("img");
            if (
              !image ||
              !this.view.dom.contains(image) ||
              !plugin.imageFile(image)
            )
              return;
            e.preventDefault();
            e.stopImmediatePropagation();
            if (e.type === "dblclick") {
              let pos = this.view.state.selection.main.head;
              try {
                pos = this.view.state.doc.lineAt(this.view.posAtDOM(image)).to;
              } catch {}
              void plugin.open(this.view, plugin.imageFile(image)!, pos);
            }
          };
          constructor(readonly view: EditorView) {
            for (const name of ["mousedown", "click", "dblclick"] as const)
              view.dom.ownerDocument.addEventListener(name, this.click, true);
          }
          destroy() {
            for (const name of ["mousedown", "click", "dblclick"] as const)
              this.view.dom.ownerDocument.removeEventListener(
                name,
                this.click,
                true,
              );
          }
        },
      ),
    ]);
    this.addCommand({
      id: "insert-drawing",
      name: "Insert drawing here",
      editorCallback: (editor, context) => {
        const cm = (editor as any).cm as EditorView;
        const file = context.file;
        if (cm && file) void this.insert(cm, file);
      },
    });
    this.addCommand({
      id: "edit-drawing",
      name: "Edit drawing on current line",
      editorCallback: (editor, context) => {
        const cm = (editor as any).cm as EditorView;
        if (!cm || !context.file) return;
        const line = cm.state.doc.lineAt(cm.state.selection.main.head);
        const match = line.text.match(
          /!\[\[([^\]|]+\.ink\.svg)(?:\|[^\]]*)?\]\]/,
        );
        const file = match
          ? this.app.metadataCache.getFirstLinkpathDest(
              match[1],
              context.file.path,
            )
          : null;
        if (file instanceof TFile) void this.open(cm, file, line.to);
        else
          new Notice(
            "Place the cursor on an Ink Studio image embed, or double-click its preview.",
          );
      },
    });
    this.registerEvent(
      this.app.workspace.on("editor-menu", (rootMenu, editor, context) => {
        const menu=menuGroup(rootMenu,"insert","Embed or link","plus");
        if (editor.getSelection().trim())
          menu.addItem((i) =>
            i
              .setTitle("Drawing on selection…")
              .setIcon("pen-tool")
              .onClick(() => {
                if (context.file)
                  void this.annotate((editor as any).cm, context.file);
              }),
          );
        menu.addItem((i) =>
          i
            .setTitle("Drawing…")
            .setIcon("pencil")
            .onClick(() => {
              const cm = (editor as any).cm;
              if (cm && context.file) void this.insert(cm, context.file);
            }),
        );
      }),
    );
    this.registerEvent(
      this.app.vault.on("modify", (file) => {
        if (file instanceof TFile && file.path.endsWith(".ink.svg")) {
          for (const doc of this.readingDocs) this.refreshPreviews(doc);
        }
      }),
    );
    this.addCommand({
      id: "annotate-selection",
      name: "Annotate selected passage",
      editorCallback: (editor, context) => {
        if (context.file) void this.annotate((editor as any).cm, context.file);
      },
    });
    this.app.workspace.onLayoutReady(() => this.bindReading());
    this.registerEvent(
      this.app.workspace.on("layout-change", () => this.bindReading()),
    );
  }
  onunload() {
    for (const dispose of [...this.disposals]) dispose();
  }
  readingDocs = new Set<Document>();
  refreshPreviews(doc: Document) {
    for (const image of Array.from(
      doc.querySelectorAll<HTMLImageElement>('img[src*=".ink.svg"]'),
    )) {
      const file = this.imageFile(image);
      if (!file) continue;
      const src =
        this.app.vault.getResourcePath(file).split("?")[0] +
        "?ink-studio=" +
        file.stat.mtime;
      if (image.getAttribute("src") !== src) image.setAttribute("src", src);
    }
  }
  bindReading() {
    this.app.workspace.iterateAllLeaves((leaf) => {
      const doc = leaf.view.containerEl.ownerDocument;
      if (this.readingDocs.has(doc)) return;
      this.readingDocs.add(doc);
      // Obsidian can reattach a cached embed when the replacement widget closes.
      const observer = new (doc.defaultView as any).MutationObserver(
        (records: MutationRecord[]) => {
          const hasPreview = records.some((record) =>
            Array.from(record.addedNodes).some((node) => {
              if (node.nodeType !== 1) return false;
              const element = node as Element;
              return (
                element.matches('img[src*=".ink.svg"]') ||
                !!element.querySelector('img[src*=".ink.svg"]')
              );
            }),
          );
          if (hasPreview) this.refreshPreviews(doc);
        },
      );
      observer.observe(doc.body, { childList: true, subtree: true });
      this.register(() => observer.disconnect());
      this.refreshPreviews(doc);
      this.registerDomEvent(doc, "contextmenu", (e) => this.imageMenu(e), true);
      const handler = (e: MouseEvent) => {
        if (e.button !== 0) return;
        const image = (e.target as HTMLElement).closest?.("img");
        if (!image?.closest(".markdown-preview-view")) return;
        const file = this.imageFile(image);
        if (!file) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        if (e.type === "dblclick") {
          const view = this.app.workspace.getActiveViewOfType(MarkdownView);
          if (!view?.file) return;
          const path = view.file.path;
          void view.leaf
            .setViewState({
              type: "markdown",
              state: { file: path, mode: "source" },
            })
            .then(() => {
              const cm = (view.editor as any).cm as EditorView;
              if (!cm) return;
              const text = cm.state.doc.toString();
              const at = text.indexOf(file.name);
              if (at >= 0) void this.open(cm, file, cm.state.doc.lineAt(at).to);
            });
        }
      };
      for (const name of ["mousedown", "click", "dblclick"] as const)
        this.registerDomEvent(doc, name, handler, true);
    });
  }
  imageMenu(event: MouseEvent) {
    const image = (event.target as HTMLElement).closest?.("img");
    if (!image || image.closest(".ink-studio-host,.markdown-embed")) return;
    let view: MarkdownView | undefined;
    this.app.workspace.iterateAllLeaves((leaf) => {
      if (
        leaf.view instanceof MarkdownView &&
        leaf.view.containerEl.contains(image)
      )
        view = leaf.view;
    });
    if (!view?.file) return;
    const owner = view;
    const file = view.file;
    const cm = (owner.editor as any).cm as EditorView | undefined;
    const editing = owner.getMode() === "source";
    const source = owner.editor.getValue();
    const cache = this.app.metadataCache.getFileCache(file);
    const embeds = (cache?.embeds ?? []).filter(
      (e) =>
        e.original.startsWith("!") &&
        source.slice(e.position.start.offset, e.position.end.offset) ===
          e.original,
    );
    const matches = embeds.filter((e) => {
      const target = this.app.metadataCache.getFirstLinkpathDest(
        e.link,
        file.path,
      );
      const src = image.getAttribute("src") ?? "";
      return target
        ? src.split("?")[0] ===
            this.app.vault.getResourcePath(target).split("?")[0]
        : src === e.link || src === encodeURI(e.link);
    });
    let chosen: (typeof matches)[number] | undefined;
    if (editing && cm) {
      try {
        const at = cm.posAtDOM(image);
        const line = cm.state.doc.lineAt(at);
        const local = matches.filter(
          (e) =>
            e.position.start.offset >= line.from &&
            e.position.start.offset <= line.to,
        );
        chosen =
          local.find(
            (e) => at >= e.position.start.offset && at <= e.position.end.offset,
          ) ?? (local.length === 1 ? local[0] : undefined);
      } catch {}
    } else {
      const images = Array.from(
        owner.containerEl.querySelectorAll<HTMLImageElement>(
          ".markdown-preview-view img",
        ),
      ).filter((x) => !x.closest(".markdown-embed") && x.src === image.src);
      if (images.length === matches.length)
        chosen = matches[images.indexOf(image)];
    }
    if (!chosen) return;
    const selected = chosen;
    try {
      alignImage(selected.original, "default");
    } catch {
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    const menu = new Menu();
    for (const [label, alignment, icon] of [
      ["Align image left", "left", "align-left"],
      ["Center image", "center", "align-center"],
      ["Align image right", "right", "align-right"],
      ["Use default (center)", "default", "rotate-ccw"],
    ] as const) {
      menu.addItem((item) =>
        item
          .setTitle(label)
          .setIcon(icon)
          .onClick(async () => {
            const replacement = alignImage(selected.original, alignment);
            try {
              if (editing) {
                if (
                  owner.file?.path !== file.path ||
                  owner.editor.getValue() !== source
                )
                  throw new Error(
                    "The note changed while the menu was open. Right-click the image again.",
                  );
                owner.editor.replaceRange(
                  replacement,
                  owner.editor.offsetToPos(selected.position.start.offset),
                  owner.editor.offsetToPos(selected.position.end.offset),
                );
              } else
                await this.app.vault.process(file, (current) => {
                  if (current !== source)
                    throw new Error(
                      "The note changed while the menu was open. Right-click again.",
                    );
                  return (
                    current.slice(0, selected.position.start.offset) +
                    replacement +
                    current.slice(selected.position.end.offset)
                  );
                });
            } catch (e) {
              new Notice(String(e));
            }
          }),
      );
    }
    menu.showAtMouseEvent(event);
  }
  imageFile(image: HTMLImageElement): TFile | null {
    const src = image.getAttribute("src") || "";
    if (!src.includes(".ink.svg")) return null;
    return (
      this.app.vault
        .getFiles()
        .find(
          (f) =>
            f.path.endsWith(".ink.svg") &&
            (src.split("?")[0] ===
              this.app.vault.getResourcePath(f).split("?")[0] ||
              decodeURI(src).includes("/" + f.path)),
        ) ?? null
    );
  }
  async annotate(view: EditorView, note: TFile) {
    if (view.state.field(field, false)) {
      new Notice("Finish the current drawing first.");
      return;
    }
    const original = view.state.doc.toString();
    const { from, to } = view.state.selection.main;
    const excerpt = original.slice(from, to);
    if (!excerpt.trim()) {
      new Notice("Select the passage to annotate first.");
      return;
    }
    new Notice("Capturing passage…");
    try {
      const captured = await capturePassage(
        this.app,
        view.dom.ownerDocument,
        note.path,
        excerpt,
      );
      if (view.state.doc.toString() !== original)
        throw new Error(
          "The note changed during capture. Please select the passage again.",
        );
      const id = crypto.randomUUID();
      const data = blankScene(id);
      const digest = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(excerpt),
      );
      const fingerprint = Array.from(new Uint8Array(digest))
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("");
      data.annotation = {
        fingerprint,
        path: note.path,
        excerpt,
        from,
        to,
        captured: new Date().toISOString(),
        ...captured,
      };
      data.appState = {
        ...data.appState,
        viewBackgroundColor: captured.background,
        currentItemStrokeColor: "#e03131",
      };
      const path = await this.app.fileManager.getAvailablePathForAttachment(
        `Annotation-${id}.ink.svg`,
        note.path,
      );
      const initial = `<svg xmlns="http://www.w3.org/2000/svg" width="${captured.width}" height="${captured.height}"><image width="100%" height="100%" href="${captured.dataURL}"/></svg>`;
      const preview = await this.app.vault.create(path, initial);
      await this.app.vault.create(scenePath(path), JSON.stringify(data));
      if (view.state.doc.toString() !== original)
        throw new Error(
          "The note changed. Captured files are retained in attachments.",
        );
      const link = this.app.fileManager.generateMarkdownLink(
        preview,
        note.path,
      );
      const source = this.app.fileManager.generateMarkdownLink(
        note,
        note.path,
        undefined,
        "Annotation source",
      );
      const text =
        "\n\n> [!note]+ Annotation — frozen passage\n> " +
        source +
        " · Double-click the image to edit ink\n> " +
        (link.startsWith("!") ? link : "!" + link) +
        "\n";
      const at = view.state.doc.lineAt(to).to;
      view.dispatch({
        changes: { from: at, insert: text },
        selection: EditorSelection.cursor(at + text.length),
      });
      await this.open(view, preview, at + text.length - 1);
    } catch (e) {
      new Notice(`Annotation capture failed: ${String(e)}`);
    }
  }
  async insert(view: EditorView, note: TFile) {
    if (view.state.field(field, false)) {
      new Notice("Finish the current drawing first.");
      return;
    }
    const original = view.state.doc.toString();
    const at = view.state.selection.main.head;
    try {
      const id = crypto.randomUUID();
      const path = await this.app.fileManager.getAvailablePathForAttachment(
        `Drawing-${id}.ink.svg`,
        note.path,
      );
      const preview = await this.app.vault.create(path, blankSVG);
      const data = blankScene(id);
      const scene = await this.app.vault.create(
        scenePath(path),
        JSON.stringify(data),
      );
      if (
        view.state.doc.toString() !== original ||
        view.state.field(editorInfoField, false)?.file?.path !== note.path
      ) {
        new Notice(
          "The note changed during creation. Drawing files are saved in the attachment folder; insert their link when ready.",
        );
        return;
      }
      const link = this.app.fileManager.generateMarkdownLink(
        preview,
        note.path,
      );
      const text = "\n" + (link.startsWith("!") ? link : "!" + link) + "\n";
      view.dispatch({
        changes: { from: at, insert: text },
        selection: EditorSelection.cursor(at + text.length),
      });
      await this.open(view, preview, at + text.length - 1);
    } catch (e) {
      new Notice(`Could not insert drawing: ${String(e)}`);
    }
  }
  async session(preview: TFile, pos: number, note: string): Promise<Session> {
    if (this.locks.has(preview.path))
      throw new Error(
        "This drawing is already being edited. Finish that editor first.",
      );
    const scene = this.app.vault.getAbstractFileByPath(scenePath(preview.path));
    if (!(scene instanceof TFile))
      throw new Error(
        "Editable .ink.json is missing. Keep it beside the .ink.svg preview; the preview is preserved.",
      );
    const expected = await this.app.vault.read(scene);
    return {
      id: crypto.randomUUID(),
      preview,
      scene,
      expected,
      data: readScene(expected),
      from: pos,
      pos,
      note,
    };
  }
  async open(view: EditorView, preview: TFile, pos: number) {
    if (view.state.field(field, false)) {
      new Notice("Finish the current drawing first.");
      return;
    }
    try {
      const note = view.state.field(editorInfoField, false)?.file?.path ?? "";
      // Callouts are single Live Preview widgets: replace the whole quote while editing.
      const document = view.state.doc;
      const candidates = Array.from({ length: document.lines }, (_, i) =>
        document.line(i + 1),
      ).filter((line) => line.text.includes(preview.name));
      const line = candidates.sort(
        (a, b) => Math.abs(a.from - pos) - Math.abs(b.from - pos),
      )[0];
      if (!line)
        throw new Error("The drawing embed could not be located in this note.");
      let first = line.number,
        last = line.number;
      if (/^\s*>/.test(line.text)) {
        while (first > 1 && /^\s*>/.test(document.line(first - 1).text))
          first--;
        while (
          last < document.lines &&
          /^\s*>/.test(document.line(last + 1).text)
        )
          last++;
      }
      const s = await this.session(preview, document.line(last).to, note);
      s.from = document.line(first).from;
      if (
        view.state.field(editorInfoField, false)?.file?.path !== note ||
        view.state.field(field, false)
      )
        return;
      view.dispatch({
        effects: active.of(s),
        selection: EditorSelection.cursor(s.from),
      });
    } catch (e) {
      new Notice(String(e));
    }
  }
  mount(
    s: Session,
    doc: Document,
    close: (returnFocus?: boolean) => void,
    measure: () => void = () => {},
  ) {
    const host = doc.createElement("div");
    host.className = "ink-studio-host";
    const iframe = doc.createElement("iframe");
    iframe.className = "ink-studio-frame";
    iframe.title = "Ink Studio drawing editor";
    iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
    if (s.data.annotation) {
      const banner = host.createDiv({ cls: "ink-annotation-source" });
      const link = banner.createEl("a", {
        text: "Open source passage",
        href: "#",
      });
      const state = banner.createSpan({ text: " · Checking source…" });
      const source = s.data.annotation;
      link.onclick = async (e) => {
        e.preventDefault();
        const file = this.app.vault.getAbstractFileByPath(source.path);
        if (!(file instanceof TFile)) {
          new Notice("Source note is missing.");
          return;
        }
        const leaf = this.app.workspace.getLeaf("tab");
        await leaf.openFile(file, { state: { mode: "source" } });
        if (leaf.view instanceof MarkdownView) {
          const editor = leaf.view.editor;
          const text = editor.getValue();
          const exact = text.slice(source.from, source.to) === source.excerpt;
          const first = text.indexOf(source.excerpt);
          const at = exact
            ? source.from
            : first >= 0 && text.indexOf(source.excerpt, first + 1) < 0
              ? first
              : -1;
          if (at >= 0) {
            editor.setSelection(
              editor.offsetToPos(at),
              editor.offsetToPos(at + source.excerpt.length),
            );
            editor.scrollIntoView(
              { from: editor.offsetToPos(at), to: editor.offsetToPos(at) },
              true,
            );
          } else
            new Notice(
              "The source changed; the frozen passage is retained in the annotation.",
            );
        }
      };
      const file = this.app.vault.getAbstractFileByPath(source.path);
      const read =
        file instanceof TFile
          ? this.app.vault.read(file)
          : Promise.resolve(null);
      void read.then((text) => {
        state.textContent =
          " · " +
          sourceStatus(text, source) +
          " · Frozen " +
          source.captured.slice(0, 10);
      });
    }
    host.append(iframe);
    this.locks.add(s.preview.path);
    const queue = new SaveQueue();
    let returnFocus = true;
    let warned = false;
    let disposed = false;
    let latest = s.data;
    let lastRevision = -1;
    const reply = (type: string, extra: Record<string, unknown> = {}) =>
      iframe.contentWindow?.postMessage(
        { inkStudio: s.id, type, ...extra },
        "*",
      );
    const persist = async (data: InkScene) => {
      readScene(JSON.stringify(data));
      if (data.id !== s.data.id) throw new Error("Drawing identity mismatch.");
      assertUnchanged(await this.app.vault.read(s.scene), s.expected);
      const value = JSON.stringify(data);
      await this.app.vault.modify(s.scene, value);
      s.expected = value;
    };
    const receive = (event: MessageEvent) => {
      if (
        event.source !== iframe.contentWindow ||
        event.data?.inkStudio !== s.id
      )
        return;
      const d = event.data;
      if (d.type === "ready") {
        measure();
        return;
      }
      if (d.type === "preview-error") {
        new Notice(
          "Drawing strokes are saved, but its image preview could not be updated.",
        );
        return;
      }
      if (d.type === "recover") {
        void this.app.fileManager
          .getAvailablePathForAttachment(
            `Recovered-${s.data.id}.ink.json`,
            s.note,
          )
          .then((p) => this.app.vault.create(p, JSON.stringify(d.scene)))
          .then(
            () =>
              new Notice("Draft recovered as a separate .ink.json attachment."),
          )
          .catch((e) => reply("error", { message: String(e) }));
        return;
      }
      if (d.type !== "draft" && d.type !== "preview") return;
      try {
        latest = readScene(JSON.stringify(d.scene));
      } catch (e) {
        reply("error", { message: String(e) });
        return;
      }
      if (typeof d.revision !== "number" || d.revision < lastRevision) return;
      lastRevision = d.revision;
      const data = latest;
      void queue
        .run(async () => {
          if (d.revision < lastRevision) return;
          await persist(data);
          if (d.type === "preview") {
            if (typeof d.svg !== "string" || !d.svg.startsWith("<svg"))
              throw new Error("Invalid drawing preview. Strokes remain saved.");
            await this.app.vault.modify(s.preview, d.svg);
            reply("saved", { revision: d.revision });
            if (d.finish && !disposed) close(returnFocus);
          }
        })
        .catch((e) => {
          reply("error", { message: String(e) });
          if (!warned) {
            warned = true;
            new Notice(`Ink Studio: ${String(e)}`);
          }
        });
    };
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (event.button !== 0 || host.contains(target)) return;
      // Finish within the same note without stealing its new caret position.
      const note = host.closest(".markdown-source-view");
      if (!note?.contains(target)) return;
      returnFocus = false;
      reply("finish");
    };
    doc.addEventListener("pointerdown", outside, true);
    doc.defaultView!.addEventListener("message", receive);
    const dispose = () => {
      if (disposed) return;
      disposed = true;
      doc.removeEventListener("pointerdown", outside, true);
      doc.defaultView?.removeEventListener("message", receive);
      void queue.run(async () => {
        this.locks.delete(s.preview.path);
      });
      this.disposals.delete(dispose);
    };
    (host as any).inkDispose = dispose;
    this.disposals.add(dispose);
    const config = {
      session: s.id,
      scene: s.data,
      dark: doc.body.classList.contains("theme-dark"),
    };
    const asset = this.app.vault.adapter
      .getResourcePath(`${this.manifest.dir}/vendor/`)
      .replace(/\?.*$/, "");
    iframe.srcdoc = `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'wasm-unsafe-eval'; style-src 'unsafe-inline'; font-src app: data: blob:; img-src app: data: blob:; connect-src app: data: blob:; worker-src blob:"><style>${this.css}</style><style>html,body{margin:0;height:100%;overflow:hidden}body{font:13px system-ui;background:${config.dark ? "#232329" : "#fff"};color:${config.dark ? "#eee" : "#222"}}header{height:42px;display:flex;align-items:center;gap:12px;padding:0 12px}button{font:inherit;padding:5px 10px;cursor:pointer;border:1px solid #7775;border-radius:5px;background:transparent;color:inherit}#done{background:#6960cb;color:white}#retry,#recover{display:none}#status{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#editor{height:calc(100% - 42px)}.excalidraw{--default-font:system-ui}</style></head><body><header><strong>Ink Studio</strong><label title="Width for new strokes; existing ink is unchanged">Pen width <input id="pen-slider" type="range" min="0.1" max="4" step="0.1" style="width:90px;vertical-align:middle" aria-label="Adjust pen width"><input id="pen-width" type="number" min="0.1" max="8" step="0.1" style="width:54px" aria-label="Pen width"></label><label>Preview <select id="preview-appearance" aria-label="Preview appearance"><option value="editor">Match editor</option><option value="light">Light</option></select></label><span id="status">Opening…</span><button id="retry">Retry save</button><button id="recover" title="Save a separate recovery copy">Recover draft</button><button id="done">Done · ⌘/Ctrl+Enter</button></header><div id="editor"></div><script>window.inkConfig=${JSON.stringify(config).replace(/</g, "\\u003c")};window.EXCALIDRAW_ASSET_PATH=${JSON.stringify(asset)};</script><script>${this.code.replace(/<\/script/gi, "<\\/script")}</script></body></html>`;
    return host;
  }
}
