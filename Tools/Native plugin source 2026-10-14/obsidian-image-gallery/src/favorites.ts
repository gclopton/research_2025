import { Notice } from "obsidian";
export type FavoriteFolder = { root: string; folder: string };
export type FavoritesStore = {
  get: () => FavoriteFolder[];
  set: (value: FavoriteFolder[]) => Promise<void>;
};
const key = (f: FavoriteFolder) =>
  f.root + "\n" + f.folder.replace(/^\/+|\/+$/g, "");
export class FolderFavorites {
  private select: HTMLSelectElement;
  private star: HTMLButtonElement;
  constructor(
    parent: HTMLElement,
    private store: FavoritesStore,
    private current: () => FavoriteFolder,
    private apply: (folder: FavoriteFolder) => void,
    private allowExternal = true,
  ) {
    this.select = parent.createEl("select", {
      attr: { "aria-label": "Favorite folders" },
    });
    this.select.onchange = () => {
      const chosen = this.store.get().find((f) => key(f) === this.select.value);
      if (chosen) {
        this.apply(chosen);
        this.refresh();
      }
    };
    this.star = parent.createEl("button");
    this.star.onclick = () => void this.toggle();
    this.refresh();
  }
  refresh() {
    const current = this.current();
    this.select.empty();
    this.select.createEl("option", { value: "", text: "Favorite folders…" });
    for (const f of this.store
      .get()
      .filter((f) => this.allowExternal || !f.root)) {
      this.select.createEl("option", {
        value: key(f),
        text: (f.root ? f.root + ":" : "Vault: ") + (f.folder || "/"),
      });
    }
    this.select.value = "";
    const exists = this.store.get().some((f) => key(f) === key(current));
    this.star.setText(exists ? "★ Favorited" : "☆ Favorite folder");
    this.star.setAttribute(
      "aria-label",
      exists ? "Remove this folder from favorites" : "Favorite this folder",
    );
    this.star.setAttribute("aria-pressed", String(exists));
  }
  private async toggle() {
    const current = this.current();
    if (!current.root && !current.folder) {
      new Notice("Choose a folder or enter a folder prefix first.");
      return;
    }
    const before = this.store.get();
    const exists = before.some((f) => key(f) === key(current));
    try {
      await this.store.set(
        exists
          ? before.filter((f) => key(f) !== key(current))
          : [...before, { ...current }],
      );
      this.refresh();
    } catch (e) {
      new Notice("Could not save favorite: " + String(e));
    }
  }
}
