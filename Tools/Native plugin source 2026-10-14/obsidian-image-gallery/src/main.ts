import {menuGroup} from './menu-groups';
import {PaperLibraries} from './paper-library';
import { FileFinder } from './file-finder';
import { FolderBrowser } from './folder-browser';
import {
  Plugin,
  Editor,
  MarkdownFileInfo,
  PluginSettingTab,
  Setting,
  App,
  TFile,
  MarkdownView,
  MarkdownPostProcessorContext,
  MarkdownRenderChild,
  Menu,
  Modal,
  Notice,
  editorInfoField,
} from "obsidian";
import { EditorView } from "@codemirror/view";
import {
  scanEmbeds,
  changedEmbed,
  replaceExact,
  layout,
  Embed,
  Alignment,
  embedAtCursor,
} from "./embeds";
import { GalleryAPI, GalleryModal } from "./picker";

import { FavoriteFolder, FavoritesStore } from "./favorites";
import { FileGalleryModal } from "./file-picker";
import { linkAt, pickedLink } from "./files";

type Target = {
  file: TFile;
  snapshot: string;
  embed: Embed;
  editor?: EditorView;
};
class ImageOptions extends Modal {
  constructor(
    app: App,
    private target: Target,
    private done: (change: {
      align?: Alignment;
      width?: number | null;
    }) => void,
  ) {
    super(app);
  }
  onOpen() {
    this.titleEl.setText("Image layout");
    const l = layout(this.target.embed.label);
    let align = l.align ?? "left";
    let width: number | null | undefined = undefined;
    const row = new Setting(this.contentEl).setName("Alignment");
    row.addDropdown((d) =>
      d
        .addOptions({ left: "Left", center: "Center", right: "Right" })
        .setValue(align)
        .onChange((v) => (align = v as Alignment)),
    );
    let field!: HTMLInputElement;
    new Setting(this.contentEl)
      .setName("Width (pixels)")
      .setDesc(
        "Leave blank for natural size. Height follows the image aspect ratio.",
      )
      .addText((t) => {
        field = t.inputEl;
        t.inputEl.type = "number";
        t.inputEl.min = "1";
        t.inputEl.max = "10000";
        t.setValue(l.width ? String(l.width) : "");
      });
    new Setting(this.contentEl)
      .addButton((b) =>
        b.setButtonText("Reset to natural size").onClick(() => {
          field.value = "";
          width = null;
        }),
      )
      .addButton((b) =>
        b
          .setButtonText("Apply")
          .setCta()
          .onClick(() => {
            width = field.value.trim() ? Number(field.value) : null;
            if (
              width !== null &&
              (!Number.isInteger(width) || width < 1 || width > 10000)
            ) {
              new Notice("Enter a whole-number width from 1 to 10000.");
              return;
            }
            this.done({ align, width });
            this.close();
          }),
      )
      .addButton((b) => b.setButtonText("Cancel").onClick(() => this.close()));
  }
  onClose() {
    this.contentEl.empty();
  }
}
export default class ImageGallery extends Plugin {
  settings = { finderSize: 100, finderWidth: 0, finderHeight: 0, folder: "", favorites: [] as FavoriteFolder[] };
  favoritesStore: FavoritesStore = {
    get: () => this.settings.favorites,
    set: async (value) => {
      this.settings.favorites = value;
      await this.saveData(this.settings);
    },
  };
  api!: GalleryAPI;
  paperLibrary?: PaperLibraries;
  private activeMenu?: Menu;
  private finder?: FileFinder;
  private targets = new WeakMap<HTMLImageElement, Target>();
  async onload() {
    this.settings = { ...this.settings, ...(await this.loadData()) };
    const libraries=new PaperLibraries(this);
    try{if(await libraries.start())this.paperLibrary=libraries;}catch(e){new Notice('Paper library: '+String(e),10000);}
    this.api = {
      library:this.paperLibrary,
      version: 1,
      pickFolder: (options={}) => new Promise(resolve=>new FolderBrowser(this.app,options.label??"This vault",options.start??"",options.base,resolve,()=>resolve(null)).open()),
      pickFile: (options) =>
        new Promise((resolve) =>
          new FileGalleryModal(
            this.app,
            options ?? {},
            resolve,
            this.favoritesStore,
          ).open(),
        ),
      pickImage: (options) =>
        new Promise((resolve) =>
          new GalleryModal(
            this.app,
            this.settings.folder,
            options ?? {},
            resolve,
            this.favoritesStore,
          ).open(),
        ),
    };
    this.register(() => this.activeMenu?.hide());
    this.register(() => this.finder?.close());
    this.addSettingTab(new GallerySettings(this.app, this));
    this.addCommand({id: "open-file-gallery", name: "Open file gallery", callback: () => { if(this.finder?.modalEl.isConnected){this.finder.focusSearch();return;} this.finder = new FileFinder(this.app, this.settings.finderSize, size => { this.settings.finderSize = size; void this.saveData(this.settings); }, {width:this.settings.finderWidth||undefined,height:this.settings.finderHeight||undefined}, dimensions => {this.settings.finderWidth=dimensions.width??0;this.settings.finderHeight=dimensions.height??0;void this.saveData(this.settings);}); this.finder.open(); }});
    this.addCommand({
      id: "insert-image",
      name: "Insert image from gallery",
      editorCallback: (editor, view) => void this.insertImage(editor, view),
    });
    this.addCommand({
      id: "browse-files",
      name: "Browse files to link",
      editorCallback: (editor, view) => void this.insertFile(editor, view),
    });
    this.addCommand({
      id: "browse-code",
      name: "Browse code to link",
      editorCallback: (editor, view) =>
        void this.insertFile(editor, view, true),
    });
    this.registerEvent(
      this.app.workspace.on("editor-menu", (rootMenu, editor, view) => {
        const menu=menuGroup(rootMenu,"insert","Embed or link","plus");
        menu.addItem((i) =>
          i
            .setTitle("Insert image from gallery…")
            .setIcon("images")
            .onClick(() => void this.insertImage(editor, view)),
        );
        const slot = linkAt(
          editor.getValue(),
          editor.posToOffset(editor.getCursor()),
        );
        menu.addItem((i) =>
          i
            .setTitle(
              slot ? "Browse this link in gallery…" : "Browse files to link…",
            )
            .setIcon("gallery-horizontal")
            .onClick(() => void this.insertFile(editor, view)),
        );
        menu.addItem((i) =>
          i
            .setTitle("Browse code to link…")
            .setIcon("code")
            .onClick(() => void this.insertFile(editor, view, true)),
        );
      }),
    );
    this.addCommand({
      id: "image-controls-at-cursor",
      name: "Open image controls at cursor",
      editorCallback: (editor, view) => {
        if (!view.file) return;
        const snapshot = editor.getValue();
        const embed = embedAtCursor(
          snapshot,
          editor.posToOffset(editor.getCursor()),
        );
        if (!embed) {
          new Notice(
            "Place the cursor inside an image link, or on a line with one image.",
          );
          return;
        }
        this.menu(undefined, { file: view.file, snapshot, embed });
      },
    });
    this.registerMarkdownPostProcessor(
      (el, ctx) => this.bindReading(el, ctx),
      1000,
    );
    const listen = (doc: Document) => {
      let pressed:
        | { img: HTMLImageElement; x: number; y: number; time: number }
        | undefined;
      const imageAt = (target: HTMLElement) =>
        (target.closest("img") ??
          target
            .closest(".image-embed")
            ?.querySelector("img")) as HTMLImageElement | null;
      this.registerDomEvent(
        doc,
        "mousedown",
        (event: MouseEvent) => {
          const img = imageAt(event.target as HTMLElement);
          pressed =
            event.button === 2 && img
              ? { img, x: event.clientX, y: event.clientY, time: Date.now() }
              : undefined;
        },
        true,
      );
      this.registerDomEvent(
        doc,
        "contextmenu",
        (event: MouseEvent) => {
          const target = event.target as HTMLElement;
          if (target.closest(".ss-stage, .ig-modal")) return;
          // Some themes move an image on :active; retain the exact pointer-down target.
          const held = pressed;
          pressed = undefined;
          const img =
            imageAt(target) ??
            (held &&
            Date.now() - held.time < 1500 &&
            Math.abs(held.x - event.clientX) < 3 &&
            Math.abs(held.y - event.clientY) < 3
              ? held.img
              : null);
          if (!img || !img.isConnected) return;
          let found = this.targets.get(img);
          const cm = img.closest(".cm-editor");
          if (cm) {
            const view = EditorView.findFromDOM(cm as HTMLElement);
            if (!view) return;
            const file = view.state.field(editorInfoField, false)?.file;
            if (!file) return;
            const snapshot = view.state.doc.toString();
            const widget = img.closest(".cm-embed-block") ?? img;
            let pos: number;
            try {
              pos = view.posAtDOM(widget);
            } catch {
              return;
            }
            const line = view.state.doc.lineAt(Math.min(pos, snapshot.length));
            let end = line.to;
            if (/^\s*>/.test(line.text)) {
              for (let n = line.number + 1; n <= view.state.doc.lines; n++) {
                const next = view.state.doc.line(n);
                if (!/^\s*>/.test(next.text)) break;
                end = next.to;
              }
            }
            const embeds = scanEmbeds(snapshot).filter(
              (e) => e.start >= line.from && e.end <= end,
            );
            const imgs =
              widget === img
                ? [img]
                : Array.from(widget.querySelectorAll<HTMLImageElement>("img"));
            const index = imgs.indexOf(img);
            if (
              index >= 0 &&
              embeds.length === imgs.length &&
              embeds.every((e, i) => this.matches(imgs[i], e, file.path))
            )
              found = { file, snapshot, embed: embeds[index], editor: view };
            else {
              event.preventDefault();
              event.stopImmediatePropagation();
              new Notice(
                "This image cannot be mapped safely in Live Preview. Use Reading view.",
              );
              return;
            }
          }
          if (found) {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.menu(event, found);
          }
        },
        true,
      );
    };
    listen(this.app.workspace.containerEl.ownerDocument);
    this.registerEvent(
      this.app.workspace.on("window-open", (_leaf, win) =>
        listen(win.document),
      ),
    );
  }
  private insertImage(editor: Editor, view: MarkdownFileInfo) {
    if (!view.file) return;
    const file = view.file;
    const snapshot = editor.getValue();
    const pos = editor.getCursor();
    void this.api
      .pickImage({ sourcePath: file.path, title: "Insert image" })
      .then((f) => {
        if (!f) return;
        if (editor.getValue() !== snapshot || view.file !== file) {
          new Notice(
            "Note changed. Run Insert image again at the desired position.",
          );
          return;
        }
        const link = this.app.fileManager.generateMarkdownLink(f, file.path);
        const made = scanEmbeds("!" + link)[0];
        if (!made) {
          new Notice("Cannot create an image link for this filename.");
          return;
        }
        editor.replaceRange(
          changedEmbed(made, { align: "center", width: 600 }),
          pos,
        );
      })
      .catch((e) => this.error(e));
  }
  private async insertFile(
    editor: Editor,
    view: MarkdownFileInfo,
    code = false,
  ) {
    if (!view.file) return;
    const file = view.file,
      snapshot = editor.getValue(),
      cursor = editor.getCursor();
    const slot = linkAt(snapshot, editor.posToOffset(cursor));
    const from = slot
      ? editor.offsetToPos(slot.start)
      : editor.getCursor("from");
    const to = slot ? editor.offsetToPos(slot.end) : editor.getCursor("to");
    try {
      const choice = await this.api.pickFile({
        sourcePath: file.path,
        query: slot?.query,
        kind: code || slot?.syntax === "code" ? "code" : "all",
      });
      if (!choice) return;
      if (editor.getValue() !== snapshot || view.file !== file) {
        new Notice(
          "The text changed. Reopen the gallery at the intended link.",
        );
        return;
      }
      editor.replaceRange(pickedLink(choice.path, choice.code, slot), from, to);
      editor.focus();
    } catch (e) {
      this.error(e);
    }
  }
  private source(e: Embed, path: string) {
    let dest = e.destination.split("#")[0];
    try {
      if (e.kind === "markdown") dest = decodeURIComponent(dest);
    } catch {
      /* literal percent */
    }
    dest = dest.replace(/\\([\\()[\] ])/g, "$1");
    return this.app.metadataCache.getFirstLinkpathDest(dest, path);
  }
  private matches(img: HTMLImageElement, e: Embed, path: string) {
    const file = this.source(e, path);
    if (file) {
      const expected = this.app.vault.getResourcePath(file).split("?")[0];
      return img.src.split("?")[0] === expected;
    }
    try {
      return new URL(e.destination, img.ownerDocument.baseURI).href === img.src;
    } catch {
      return false;
    }
  }
  private async bindReading(
    el: HTMLElement,
    ctx: MarkdownPostProcessorContext,
  ) {
    // Slide Studio renders isolated fragments with different source offsets; let its block menu own them.
    if (el.closest(".ss-stage, .ig-modal")) return;
    const file = this.app.vault.getAbstractFileByPath(ctx.sourcePath);
    if (!(file instanceof TFile) || file.extension !== "md") return;
    const section = ctx.getSectionInfo(el);
    if (!section) return;
    const snapshot = await this.app.vault.cachedRead(file);
    const offsets = [0];
    for (let i = 0; i < snapshot.length; i++)
      if (snapshot[i] === "\n") offsets.push(i + 1);
    const start = offsets[section.lineStart];
    const end = offsets[section.lineEnd + 1] ?? snapshot.length;
    if (start === undefined) return;
    const embeds = scanEmbeds(snapshot).filter(
      (e) => e.start >= start && e.end <= end,
    );
    const imgs = Array.from(
      el.querySelectorAll<HTMLImageElement>("img"),
    ).filter((i) => !i.closest(".callout-title"));
    // Exact ordered pairing avoids editing a different occurrence of a reused attachment.
    if (
      embeds.length !== imgs.length ||
      !embeds.every((e, i) => this.matches(imgs[i], e, file.path))
    )
      return;
    const cleanup: (() => void)[] = [];
    for (let i = 0; i < imgs.length; i++) {
      const img = imgs[i],
        embed = embeds[i],
        l = layout(embed.label);
      this.style(img, l.align, l.width, l.height);
      this.targets.set(img, { file, snapshot, embed });
      cleanup.push(() => {
        this.targets.delete(img);
        img.removeAttribute("data-ig-align");
        img.classList.remove("ig-sized");
        img.style.removeProperty("--ig-width");
      });
    }
    const child = new MarkdownRenderChild(el);
    child.register(() => cleanup.forEach((f) => f()));
    ctx.addChild(child);
  }
  private style(
    img: HTMLImageElement,
    align?: Alignment,
    width?: number,
    height?: number,
  ) {
    if (align) img.dataset.igAlign = align;
    if (width && !height) {
      img.style.setProperty("--ig-width", `${width}px`);
      img.classList.add("ig-sized");
    }
  }
  private menu(event: MouseEvent | undefined, target: Target) {
    this.activeMenu?.hide();
    const menu = new Menu().setUseNativeMenu(false);
    this.activeMenu = menu;
    const actions: [string, string, () => void][] = [
      [
        "Replace image from gallery…",
        "images",
        () => void this.replace(target),
      ],
      [
        "Image alignment and width…",
        "scaling",
        () =>
          new ImageOptions(
            this.app,
            target,
            (c) => void this.apply(target, c),
          ).open(),
      ],
      ...(["left", "center", "right"] as const).map(
        (align) =>
          [
            `Align image ${align}`,
            `align-${align}`,
            () => void this.apply(target, { align }),
          ] as [string, string, () => void],
      ),
      [
        "Reset image to natural size",
        "maximize",
        () => void this.apply(target, { width: null }),
      ],
    ];
    actions.forEach(([title, icon, run], n) =>
      menu.addItem((i) =>
        i
          .setTitle(`${n + 1}. ${title}`)
          .setIcon(icon)
          .onClick(run),
      ),
    );
    const doc = event
      ? (event.target as HTMLElement).ownerDocument
      : this.app.workspace.containerEl.ownerDocument;
    const key = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey || e.repeat) return;
      const n = Number(e.key) - 1;
      if (!/^[1-6]$/.test(e.key)) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      menu.hide();
      actions[n][2]();
    };
    doc.addEventListener("keydown", key, true);
    menu.onHide(() => doc.removeEventListener("keydown", key, true));

    if (event) menu.showAtMouseEvent(event);
    else {
      const box = this.app.workspace.containerEl.getBoundingClientRect();
      menu.showAtPosition({ x: box.x + box.width / 2, y: box.y + 160 }, doc);
    }
  }
  private async replace(target: Target) {
    try {
      const f = await this.api.pickImage({
        sourcePath: target.file.path,
        currentPath: this.source(target.embed, target.file.path)?.path,
        title: "Replace selected image",
      });
      if (!f) return;
      // Generate an unambiguous relative Markdown path, independent of duplicate basenames and wiki preferences.
      const parts = target.file.path.split("/");
      parts.pop();
      const to = f.path.split("/");
      while (parts.length && to.length && parts[0] === to[0]) {
        parts.shift();
        to.shift();
      }
      const destination =
        target.embed.kind === "wiki"
          ? f.path
          : [...parts.map(() => ".."), ...to].join("/");
      await this.apply(target, { destination });
    } catch (e) {
      this.error(e);
    }
  }
  private async apply(
    target: Target,
    change: Parameters<typeof changedEmbed>[1],
  ) {
    try {
      const replacement = changedEmbed(target.embed, change);
      if (target.editor) {
        const view = target.editor;
        replaceExact(
          view.state.doc.toString(),
          target.snapshot,
          target.embed,
          replacement,
        );
        view.dispatch({
          changes: {
            from: target.embed.start,
            to: target.embed.end,
            insert: replacement,
          },
        });
        return;
      }
      // Respect an open editor's unsaved buffer; never race it with a file-system write.
      const views = this.app.workspace
        .getLeavesOfType("markdown")
        .map((l) => l.view)
        .filter(
          (v) => v instanceof MarkdownView && v.file?.path === target.file.path,
        ) as MarkdownView[];
      if (views.some((v) => v.getMode() === "source")) {
        const v = views.find((v) => v.getMode() === "source")!;
        const current = v.editor.getValue();
        replaceExact(current, target.snapshot, target.embed, replacement);
        v.editor.replaceRange(
          replacement,
          v.editor.offsetToPos(target.embed.start),
          v.editor.offsetToPos(target.embed.end),
        );
      } else
        await this.app.vault.process(target.file, (current) =>
          replaceExact(current, target.snapshot, target.embed, replacement),
        );
    } catch (e) {
      this.error(e);
    }
  }
  error(e: unknown) {
    new Notice((e as Error).message ?? String(e), 8000);
  }
}
class GallerySettings extends PluginSettingTab {
  constructor(
    app: App,
    private plugin: ImageGallery,
  ) {
    super(app, plugin);
  }
  display() {
    this.containerEl.empty();
    new Setting(this.containerEl)
      .setName("Images folder")
      .setDesc(
        "Optional vault-relative folder. The picker also offers the note attachment folder and all vault images.",
      )
      .addText((t) =>
        t
          .setPlaceholder("Attachments")
          .setValue(this.plugin.settings.folder)
          .onChange(async (v) => {
            this.plugin.settings.folder = v;
            await this.plugin.saveData(this.plugin.settings);
          }),
      );
  }
}
