import {
  App,
  Component,
  FileSystemAdapter,
  Modal,
  TFile,
  MarkdownRenderer,
  prepareFuzzySearch,
  loadPdfJs,
} from "obsidian";
import {
  codePath,
  folderMatches,
  FolderKind,
  FileKind,
  kindMatches,
  usefulFile,
  imagePath,
  pickedLink,
} from "./files";
import { FolderBrowser } from "./folder-browser";
import { cleanFolder, withinFolder, scanFolder } from "./folders";
import { FolderFavorites, FavoritesStore } from "./favorites";
import { languageFor, highlightedCode } from "./languages";
export type FileOptions = {
  sourcePath?: string;
  query?: string;
  kind?: FileKind;
  title?: string;
};
export type FileChoice = { path: string; link: string; code: boolean };
type Entry = { path: string; file?: TFile; external?: boolean };
export class FileGalleryModal extends Modal {
  private favorites?: FolderFavorites;
  private query = "";
  private folder = "";
  private category: FolderKind = "";
  private kind: FileKind = "all";
  private page = 0;
  private recursive = true;
  private refreshTimer?: ReturnType<typeof setTimeout>;
  private matchCache?: {key:string; entries:Entry[]; result:Entry[]};
  private scopeNote = "";
  private pendingScan=false;
  private entries: Entry[] = [];
  private grid!: HTMLElement;
  private count!: HTMLElement;
  private generation = 0;
  private cleanup: (() => void)[] = [];
  private resolved = false;
  private selectedRoot = "";
  private roots: { name: string; path: string; retired?: boolean; redirect?: string }[] = [];
  private rootSelect!: HTMLSelectElement;
  private scan = 0;
  private indexedRoot = "";
  constructor(
    app: App,
    private options: FileOptions,
    private done: (value: FileChoice | null) => void,
    private favoritesStore?: FavoritesStore,
  ) {
    super(app);
  }
  private bridge(): any {
    return (this.app as any).plugins?.getPlugin("code-links");
  }
  onOpen() {
    this.modalEl.classList.add("ig-modal", "ig-file-modal");
    this.titleEl.setText(this.options.title ?? "Browse files to link");
    this.query = this.options.query ?? "";
    this.kind = this.options.kind ?? "all";
    this.entries = this.app.vault
      .getFiles()
      .filter((f) => usefulFile(f.path))
      .map((file) => ({ path: file.path, file }));
    const controls = this.contentEl.createDiv({ cls: "ig-controls" });
    this.rootSelect = controls.createEl("select", {
      attr: { "aria-label": "Source folder" },
    });
    this.rootSelect.createEl("option", { value: "", text: "This vault" });
    this.rootSelect.disabled = this.kind !== "code";
    this.rootSelect.onchange = () => {
      this.selectedRoot = this.rootSelect.value;
      this.folder = "";
      // Browsing a new external root starts with its immediate files.
      this.recursive = !this.selectedRoot;
      const recursive = this.contentEl.querySelector<HTMLInputElement>('[aria-label="Include subfolders"]');
      if(recursive) recursive.checked=this.recursive;
      const field = this.contentEl.querySelector<HTMLInputElement>(
        '[aria-label="File folder prefix"]',
      );
      if (field) field.value = "";
      this.page = 0;
      void this.loadExternal();
    };
    void this.loadRoots();
    const search = controls.createEl("input", {
      type: "search",
      placeholder: "Search filenames or paths…",
      attr: { "aria-label": "Search files" },
    });
    search.value = this.query;
    search.oninput = () => {
      this.query = search.value;
      this.page = 0;
      this.queueRefresh(false);
    };
    const kind = controls.createEl("select", {
      attr: { "aria-label": "File type" },
    });
    for (const [value, text] of [
      ["all", "All files"],
      ["notes", "Notes"],
      ["pdf", "PDFs"],
      ["images", "Images"],
      ["code", "Code and data"],
    ])
      kind.createEl("option", { value, text });
    kind.value = this.kind;
    kind.onchange = () => {
      this.kind = kind.value as FileKind;
      this.rootSelect.disabled = this.kind !== "code";
      if (this.kind !== "code") {
        this.selectedRoot = "";
        this.rootSelect.value = "";
      }
      this.page = 0;
      void this.loadExternal();
    };
    const category = controls.createEl("select", {
      attr: { "aria-label": "Folder category" },
    });
    for (const [value, text] of [
      ["", "All folders"],
      ["scripts", "Scripts folders"],
      ["images", "Images folders"],
      ["assets", "Assets folders"],
      ["figures", "Figures folders"],
    ])
      category.createEl("option", { value, text });
    category.onchange = () => {
      this.category = category.value as FolderKind;
      this.page = 0;
      void this.draw();
    };
    const folder = controls.createEl("input", {
      placeholder: "Folder prefix, including subfolders",
      attr: { "aria-label": "File folder prefix" },
    });
    folder.oninput = () => {
      this.folder = folder.value;
      this.page = 0;
      this.queueRefresh(true);
    };
    controls.createEl("button", {text:"Browse folders…"}).onclick = () => {
      const external=this.roots.find(r=>r.name===this.selectedRoot);
      new FolderBrowser(this.app, external ? external.name+":" : "This vault", this.folder, external?.path, selected=>{
        this.folder=selected;folder.value=selected;this.page=0;
        // Folder navigation should show its contents; old filename searches can obscure them.
        this.query="";search.value="";
        this.queueRefresh(true,0);
      }).open();
    };
    const recursion=controls.createEl("label",{cls:"ig-recursion"});
    const recursive=recursion.createEl("input",{type:"checkbox",attr:{"aria-label":"Include subfolders"}});
    recursive.checked=this.recursive;recursion.createSpan({text:"Include subfolders"});
    recursive.onchange=()=>{this.recursive=recursive.checked;this.page=0;this.queueRefresh(true,0);};
    if (this.favoritesStore)
      this.favorites = new FolderFavorites(
        controls,
        this.favoritesStore,
        () => ({ root: this.selectedRoot, folder: this.folder }),
        (favorite) => {
          this.query = "";
          search.value = "";
          this.category = "";
          category.value = "";
          this.selectedRoot = favorite.root;
          this.selectRoot(favorite.root);
          this.folder = favorite.folder;
          folder.value = this.folder;
          if (favorite.root) {
            this.kind = "code";
            kind.value = "code";
            this.rootSelect.disabled = false;
          }
          this.page = 0;
          this.queueRefresh(true,0);
        },
      );
    this.count = this.contentEl.createDiv({
      cls: "ig-count",
      attr: { "aria-live": "polite" },
    });
    this.grid = this.contentEl.createDiv({ cls: "ig-file-grid" });
    const nav = this.contentEl.createDiv({ cls: "ig-controls" });
    nav.createEl("button", { text: "Previous page" }).onclick = () => {
      if (this.page) {
        this.page--;
        void this.draw();
      }
    };
    nav.createEl("button", { text: "Next page" }).onclick = () => {
      if ((this.page + 1) * 6 < this.matches().length) {
        this.page++;
        void this.draw();
      }
    };
    void this.loadExternal();
    search.focus();
  }
  private async loadRoots() {
    const bridge = this.bridge();
    if (!bridge?.call) return;
    try {
      this.roots = (await bridge.call("roots")).items.filter(
        (r: any) => r.exists,
      );
      if (!this.contentEl.isConnected) return;
      for (const root of this.roots.filter(r => !r.retired && !r.redirect))
        this.rootSelect.createEl("option", {
          value: root.name,
          text: root.name + ": — " + root.path,
        });
      if (this.selectedRoot) {
        this.selectRoot(this.selectedRoot);
        await this.loadExternal();
      }
      const prefix = this.query.match(/^([A-Za-z][\w-]*):/)?.[1];
      if (prefix && this.roots.some((r) => r.name === prefix)) {
        this.selectedRoot = prefix;
        this.selectRoot(prefix);
        this.kind = "code";
        this.rootSelect.disabled=false;
        const type=this.contentEl.querySelector<HTMLSelectElement>('[aria-label="File type"]');if(type)type.value="code";
        const target=this.query.slice(prefix.length+1);
        this.folder=target.includes("/") ? target.slice(0,target.lastIndexOf("/")) : "";
        const field=this.contentEl.querySelector<HTMLInputElement>('[aria-label="File folder prefix"]');if(field)field.value=this.folder;
        this.recursive=false;
        const check=this.contentEl.querySelector<HTMLInputElement>('[aria-label="Include subfolders"]');if(check)check.checked=false;
        await this.loadExternal();
      }
    } catch {
      /* Vault browsing remains available when Code Links is disabled. */
    }
  }
  private selectRoot(name: string) {
    const root = this.roots.find(r => r.name === name);
    if (root && !Array.from(this.rootSelect.options).some(o => o.value === name))
      this.rootSelect.createEl("option", {value: name, text: name + ": — " + root.path + " (saved link)"});
    this.rootSelect.value = name;
  }
  private queueRefresh(scan: boolean, delay=250) {
    clearTimeout(this.refreshTimer);
    ++this.generation; // stale reads must not paint while the user is still typing
    if(scan)++this.scan;
    this.pendingScan ||= scan;
    this.refreshTimer=setTimeout(()=>{
      if(!this.contentEl.isConnected)return;
      const scan=this.pendingScan;this.pendingScan=false;
      if(scan)void this.loadExternal();else void this.draw();
    },delay);
  }
  private async loadExternal() {
    const root = this.roots.find((r) => r.name === this.selectedRoot);
    const ticket = ++this.scan;
    if (!root) {
      this.entries = this.entries.filter((e) => !e.external);
      this.indexedRoot = "";this.scopeNote="";
      void this.draw();return;
    }
    let folder: string;
    try{folder=cleanFolder(this.folder);}catch(e){this.count.setText(String(e));return;}
    const key=JSON.stringify([root.name,folder,this.recursive]);
    if(this.indexedRoot===key){void this.draw();return;}
    this.entries=this.entries.filter(e=>!e.external);
    ++this.generation;this.previewCleanup();this.grid.empty();
    this.count.setText("Reading " + root.name + ":" + folder + " …");
    try {
      const result=await scanFolder(root.path,folder,this.recursive,
        name=>usefulFile(name)&&!/[\n\r|#{}\[\]]/.test(name),
        ()=>ticket!==this.scan||!this.contentEl.isConnected);
      if(ticket!==this.scan||!this.contentEl.isConnected)return;
      this.entries=this.entries.filter(e=>!e.external).concat(result.paths.map(path=>({path:root.name+":"+path,external:true})));
      this.indexedRoot=key;
      this.scopeNote=result.capped ? " · first 50,000 files; choose a subfolder to narrow the scan" : "";
      void this.draw();
    }catch(e){if(ticket===this.scan&&this.contentEl.isConnected)this.count.setText("Cannot read this folder: "+String(e));}
  }
  private matches() {
    const key=JSON.stringify([this.query,this.folder,this.category,this.kind,this.selectedRoot,this.recursive]);
    if(this.matchCache?.key===key&&this.matchCache.entries===this.entries)return this.matchCache.result;
    const fuzzy = this.query.trim()
      ? prepareFuzzySearch(this.query.trim())
      : null;
    const result=this.entries
      .filter(
        (e) =>
          (this.selectedRoot
            ? e.external && e.path.startsWith(this.selectedRoot + ":")
            : !e.external) &&
          kindMatches(e.path, this.kind) &&
          folderMatches(e.path, this.folder, this.category) &&
          withinFolder(e.path,this.folder.trim().replace(/^\/+|\/+$/g,""),this.recursive),
      )
      .map((e) => ({ e, score: fuzzy ? fuzzy(e.path)?.score : 0 }))
      .filter((x) => x.score !== undefined)
      .sort((a, b) => b.score! - a.score! || a.e.path.localeCompare(b.e.path))
      .map((x) => x.e);
    this.matchCache={key,entries:this.entries,result};return result;
  }
  private async draw() {
    this.favorites?.refresh();
    const gen = ++this.generation;
    this.previewCleanup();
    this.grid.empty();
    const matches = this.matches();
    this.page = Math.min(
      this.page,
      Math.max(0, Math.ceil(matches.length / 6) - 1),
    );
    this.count.setText(
      `${matches.length} file${matches.length === 1 ? "" : "s"} · page ${this.page + 1} of ${Math.max(1, Math.ceil(matches.length / 6))}${this.scopeNote}`,
    );
    if (!matches.length)
      this.grid.createEl("p", {
        text: "No matching files. Try another type, folder or search.",
      });
    for (const e of matches.slice(this.page * 6, this.page * 6 + 6)) {
      const card = this.grid.createDiv({ cls: "ig-file-card" });
      card.createDiv({ cls: "ig-file-title", text: e.path.split("/").pop()! });
      card.createDiv({ cls: "ig-path", text: e.path, attr: { title: e.path } });
      card.createSpan({
        cls: "ig-language",
        text: imagePath(e.path) ? "Image" : languageFor(e.path).label,
      });
      const body = card.createDiv({
        cls: "ig-file-preview",
        attr: { tabindex: "0", "aria-label": `Preview ${e.path}` },
      });
      body.setText("Loading preview…");
      card.createEl("button", { text: "Insert link" }).onclick = () => {
        try {
          const code = e.external || this.kind === "code" || codePath(e.path);
          const path = e.path;
          const link = pickedLink(path, !!code);
          this.resolved = true;
          this.done({ path, link, code: !!code });
          this.close();
        } catch (error) {
          body.setText(String(error));
        }
      };
      void this.preview(e, body, gen).catch((error) => {
        if (gen === this.generation)
          body.setText(`Preview unavailable: ${String(error)}`);
      });
    }
  }
  private previewDisposers: (() => void)[] = [];
  private previewCleanup() {
    for (const fn of this.previewDisposers.splice(0)) fn();
  }
  private async preview(e: Entry, body: HTMLElement, gen: number) {
    const alive = () => gen === this.generation && body.isConnected;
    await new Promise<void>(done=>setTimeout(done,100));
    if(!alive())return;
    if (e.file && imagePath(e.path)) {
      body.empty();
      body.createEl("img", {
        attr: {
          src: this.app.vault.getResourcePath(e.file),
          alt: e.file.basename,
        },
      });
      return;
    }
    if (e.file && e.file.extension === "pdf") {
      if (e.file.stat.size > 60 * 1024 * 1024) {
        body.setText(
          "PDF exceeds the 60 MB preview limit. Open the original file to inspect it.",
        );
        return;
      }
      const lib = await loadPdfJs();
      if (!alive()) return;
      const bytes = await this.app.vault.readBinary(e.file);
      if (!alive()) return;
      const task = lib.getDocument({ data: new Uint8Array(bytes) });
      this.previewDisposers.push(() => void task.destroy());
      const pdf = await task.promise;
      if (!alive()) return;
      body.empty();
      let page = 1,
        busy = false;
      const next = body.createEl("button", {
        text: `Load page 1 of ${pdf.numPages}`,
      });
      const load = async () => {
        if (busy || page > pdf.numPages || !alive()) return;
        busy = true;
        try {
          const p = await pdf.getPage(page);
          if (!alive()) return;
          const viewport = p.getViewport({ scale: 1 });
          const scaled = p.getViewport({
            scale: Math.min(1.5, 650 / viewport.width),
          });
          const canvas = body.ownerDocument.createElement("canvas");
          canvas.width = scaled.width;
          canvas.height = scaled.height;
          body.insertBefore(canvas, next);
          const render = p.render({
            canvasContext: canvas.getContext("2d"),
            viewport: scaled,
          });
          await render.promise;
          page++;
          next.setText(`Load page ${page} of ${pdf.numPages}`);
          next.hidden = page > pdf.numPages;
        } finally {
          busy = false;
        }
      };
      next.onclick = () =>
        void load().catch(() => {
          next.setText("Cannot render this page");
        });
      await load();
      return;
    }
    let text: string;
    if (e.external) {
      const bridge = this.bridge();
      const result = await bridge.call("read", { raw: "{{" + e.path + "}}" });
      if (!alive()) return;
      if (typeof result.text === "string") text = result.text;
      else {
        const fs = require("fs/promises");
        const handle = await fs.open(result.path, "r");
        try {
          const data = Buffer.alloc(256 * 1024);
          const read = await handle.read(data, 0, data.length, 0);
          text = data.subarray(0, read.bytesRead).toString("utf8");
        } finally {
          await handle.close();
        }
      }
    } else if (
      e.file &&
      (e.file.extension === "md" || codePath(e.path)) &&
      !/\.(blend)$/i.test(e.path)
    ) {
      if (
        e.file.stat.size > 2 * 1024 * 1024 &&
        this.app.vault.adapter instanceof FileSystemAdapter
      ) {
        const fs = require("fs/promises");
        const handle = await fs.open(
          this.app.vault.adapter.getFullPath(e.path),
          "r",
        );
        try {
          const data = Buffer.alloc(256 * 1024);
          const read = await handle.read(data, 0, data.length, 0);
          text = data.subarray(0, read.bytesRead).toString("utf8");
        } finally {
          await handle.close();
        }
      } else text = await this.app.vault.cachedRead(e.file);
    } else {
      body.setText(
        "No inline preview for this file type. You can still insert its link.",
      );
      return;
    }
    if (!alive()) return;
    body.empty();
    if (text.includes("\0")) {
      body.setText("Binary file; no text preview.");
      return;
    }
    if (e.file?.extension === "md") {
      const component = new Component();
      component.load();
      this.previewDisposers.push(() => component.unload());
      const bridge = this.bridge();
      if (bridge?.renderInHost) body.dataset.codeLinksHost = "gallery";
      body.classList.add("markdown-rendered");
      const excerpt = text.slice(0, 40000);
      await MarkdownRenderer.render(
        this.app,
        excerpt,
        body,
        e.file.path,
        component,
      );
      if (!alive()) return;
      if (bridge?.renderInHost)
        await bridge.renderInHost(body, excerpt, e.file.path, component, null);
      if (text.length > excerpt.length)
        body.createEl("p", {
          text: "Preview shows the first 40,000 characters.",
        });
    } else {
      const pre = body.createEl("pre", { cls: "ig-code" });
      const code = pre.createEl("code");
      code.className = "language-" + (languageFor(e.path).id || "text");
      let shown=0;
      const append=()=>{
        if(!alive())return;
        const end=Math.min(shown+24*1024,text.length,256*1024);
        const fragment=body.ownerDocument.createElement("span");
        fragment.innerHTML=highlightedCode(text.slice(shown,end),e.path);
        code.append(fragment);shown=end;
      };
      append();
      if(shown<Math.min(text.length,256*1024)){
        const more=body.createEl("button",{text:"Load more code"});
        more.onclick=()=>{append();more.hidden=shown>=Math.min(text.length,256*1024);};
      }
      if (text.length >= 256 * 1024)
        body.createEl("p", { text: "Preview limited to the first 256 KB." });
    }
  }
  onClose() {
    clearTimeout(this.refreshTimer);
    ++this.generation;
    ++this.scan;
    this.previewCleanup();
    this.cleanup.forEach((fn) => fn());
    this.contentEl.empty();
    if (!this.resolved) this.done(null);
  }
}
