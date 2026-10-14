import { App, Modal, TFile, prepareFuzzySearch } from "obsidian";
import { FolderBrowser } from "./folder-browser";
import { withinFolder } from "./folders";
import { foldersFor, imageFile } from "./embeds";
import { folderMatches, FolderKind } from "./files";
export type PickerOptions = {
  sourcePath?: string;
  currentPath?: string;
  title?: string;
};
import { FolderFavorites, FavoritesStore } from "./favorites";
import { FileOptions, FileChoice } from "./file-picker";
export interface GalleryAPI {
  library?: {isProtected(path:string):boolean;resolve(path:string):string;sourceFor(path:string):string|undefined;open(library?:string|null):Promise<void>};
  pickFolder(options?: {label?:string; start?:string; base?:string}): Promise<string|null>;
  pickFile(options?: FileOptions): Promise<FileChoice | null>;
  version: 1;
  pickImage(options?: PickerOptions): Promise<TFile | null>;
}
export class GalleryModal extends Modal {
  private query = "";
  private images:TFile[]=[];
  private recursive=true;
  private timer?:ReturnType<typeof setTimeout>;
  private folder = "";
  private category: FolderKind = "";
  private limit = 80;
  private favorites?: FolderFavorites;
  private resolved = false;
  private grid!: HTMLElement;
  private count!: HTMLElement;
  private more!: HTMLButtonElement;
  constructor(
    app: App,
    private configured: string,
    private options: PickerOptions,
    private done: (file: TFile | null) => void,
    private favoritesStore?: FavoritesStore,
  ) {
    super(app);
  }
  onOpen() {
    this.images=this.app.vault.getFiles().filter(f=>imageFile(f.path));
    this.modalEl.classList.add("ig-modal");
    this.titleEl.setText(this.options.title ?? "Choose an image");
    const controls = this.contentEl.createDiv({ cls: "ig-controls" });
    const search = controls.createEl("input", {
      type: "search",
      placeholder: "Search filenames or paths…",
    });
    search.setAttribute("aria-label", "Search images");
    search.addEventListener("input", () => {
      this.query = search.value.toLocaleLowerCase();
      this.limit = 80;
      this.schedule();
    });
    const select = controls.createEl("select");
    select.setAttribute("aria-label", "Image folder");
    const attachment =
      (
        this.app.vault as unknown as { getConfig: (key: string) => string }
      ).getConfig("attachmentFolderPath") ?? "";
    const current = this.options.currentPath?.split("/").slice(0, -1).join("/");
    const folders = [
      ...new Set(
        [
          current,
          ...foldersFor(
            this.options.sourcePath ?? "",
            attachment,
            this.configured,
          ),
        ].filter(Boolean),
      ),
    ] as string[];
    folders.forEach((p) => select.createEl("option", { value: p, text: p }));
    select.createEl("option", { value: "", text: "All vault images" });
    this.folder =
      current ??
      (this.configured &&
      this.app.vault
        .getFiles()
        .some(
          (f) => imageFile(f.path) && f.path.startsWith(this.configured + "/"),
        )
        ? this.configured
        : "");
    select.value = this.folder;
    select.addEventListener("change", () => {
      this.folder = select.value;
      root.value = this.folder;
      this.limit = 80;
      this.draw();
    });
    const category = controls.createEl("select");
    category.setAttribute("aria-label", "Image folder category");
    for (const [value, text] of [
      ["", "All image locations"],
      ["images", "Images folders"],
      ["assets", "Assets folders"],
      ["figures", "Figures folders"],
    ])
      category.createEl("option", { value, text });
    category.onchange = () => {
      this.category = category.value as FolderKind;
      this.limit = 80;
      this.draw();
    };
    const root = controls.createEl("input", {
      type: "text",
      placeholder: "Optional folder prefix (includes subfolders)",
    });
    root.setAttribute("aria-label", "Search under folder");
    root.value = this.folder;
    root.oninput = () => {
      this.folder = root.value.trim().replace(/\/$/, "");
      select.value = "";
      this.limit = 80;
      this.schedule();
    };
    controls.createEl("button",{text:"Browse folders…"}).onclick=()=>{
      new FolderBrowser(this.app,"This vault",this.folder,undefined,folder=>{
        this.folder=folder;root.value=folder;
        if(!Array.from(select.options).some(o=>o.value===folder))select.createEl("option",{value:folder,text:folder||"All vault images"});
        select.value=folder;this.query="";search.value="";this.limit=80;this.draw();
      }).open();
    };
    const recursion=controls.createEl("label",{cls:"ig-recursion"});
    const recursive=recursion.createEl("input",{type:"checkbox",attr:{"aria-label":"Include subfolders"}});
    recursive.checked=true;recursion.createSpan({text:"Include subfolders"});
    recursive.onchange=()=>{this.recursive=recursive.checked;this.limit=80;this.draw();};
    if (this.favoritesStore)
      this.favorites = new FolderFavorites(
        controls,
        this.favoritesStore,
        () => ({ root: "", folder: this.folder }),
        (favorite) => {
          this.query = "";
          search.value = "";
          this.category = "";
          category.value = "";
          this.folder = favorite.folder;
          root.value = this.folder;
          if (!Array.from(select.options).some((o) => o.value === this.folder))
            select.createEl("option", {
              value: this.folder,
              text: this.folder,
            });
          select.value = this.folder;
          this.limit = 80;
          this.draw();
        },
        false,
      );
    this.count = this.contentEl.createDiv({
      cls: "ig-count",
      attr: { "aria-live": "polite" },
    });
    this.grid = this.contentEl.createDiv({ cls: "ig-grid" });
    this.more = this.contentEl.createEl("button", { text: "Show more images" });
    this.more.onclick = () => {
      this.limit += 80;
      this.draw();
    };
    this.draw();
    search.focus();
  }
  private schedule(){clearTimeout(this.timer);this.timer=setTimeout(()=>this.draw(),250);}
  private draw() {
    clearTimeout(this.timer);
    this.favorites?.refresh();
    const fuzzy = this.query ? prepareFuzzySearch(this.query) : null;
    const files = this.images
      .filter(f=>folderMatches(f.path,this.folder,this.category)&&withinFolder(f.path,this.folder,this.recursive))
      .map(f=>({f,score:fuzzy ? fuzzy(f.path)?.score : 0}))
      .filter(x=>x.score!==undefined)
      .sort((a,b)=>b.score!-a.score!||a.f.path.localeCompare(b.f.path))
      .map(x=>x.f);
    this.count.setText(
      `${files.length} image${files.length === 1 ? "" : "s"}${files.length > this.limit ? ` · showing ${this.limit}` : ""}`,
    );
    this.grid.empty();
    if (!files.length)
      this.grid.createEl("p", {
        text: "No images here. Choose All vault images or change the search.",
      });
    for (const file of files.slice(0, this.limit)) {
      const b = this.grid.createEl("button", {
        cls: "ig-thumbnail",
        attr: { "aria-label": file.path, title: file.path },
      });
      if (file.path === this.options.currentPath) b.classList.add("is-current");
      const img = b.createEl("img", {
        attr: {
          src: this.app.vault.getResourcePath(file),
          alt: file.basename,
          loading: "lazy",
        },
      });
      img.onerror = () => {
        img.remove();
        b.createSpan({ text: "Preview unavailable", cls: "ig-unavailable" });
      };
      b.createSpan({ text: file.name, cls: "ig-name" });
      b.createSpan({ text: file.parent?.path ?? "/", cls: "ig-path" });
      b.onclick = () => {
        this.resolved = true;
        this.done(file);
        this.close();
      };
    }
    this.more.hidden = files.length <= this.limit;
  }
  onClose() {
    clearTimeout(this.timer);
    this.contentEl.empty();
    if (!this.resolved) this.done(null);
  }
}
