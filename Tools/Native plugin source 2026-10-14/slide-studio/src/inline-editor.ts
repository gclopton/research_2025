import { App, Scope, TFile } from 'obsidian';

// Native editor discovery adapted from Matthew Meyers and Fevol (MIT).
// See THIRD_PARTY_NOTICES.md. Keep undocumented Obsidian APIs isolated here.
export function mountNativeEditor(
  app: App,
  container: HTMLElement,
  file: TFile,
  value: string,
  onChange: (text: string) => void,
  onDone: () => void,
  parentScope?: Scope,
): { destroy(): void; focus(): void } {
  const internal = app as any;
  const widget = internal.embedRegistry.embedByExtension.md(
    { app, containerEl: container.ownerDocument.createElement('div') },
    null,
    '',
  );
  let Base: any;
  try {
    widget.editable = true;
    widget.showEditor();
    Base = Object.getPrototypeOf(Object.getPrototypeOf(widget.editMode)).constructor;
  } finally {
    widget.unload();
  }
  let ready = false;
  let destroyed = false;
  const owner: any = {
    app,
    file,
    onMarkdownScroll: () => {},
    getMode: () => 'source',
    getViewType: () => 'markdown',
  };
  class SlideEditor extends Base {
    constructor(...args: any[]) {
      super(...args);
    }
    onUpdate(update: any, changed: boolean) {
      super.onUpdate(update, changed);
      if (ready && changed && !destroyed) onChange(this.editor.getValue());
    }
  }
  const editor = new SlideEditor(app, container, owner);
  owner.editMode = editor;
  owner.editor = editor.editor;
  const scope = new Scope(parentScope ?? internal.scope);
  scope.register([], 'Escape', () => {
    queueMicrotask(onDone);
    return false;
  });
  let scoped = false;
  const previous = internal.workspace.activeEditor;
  const focus = () => {
    if (!scoped) {
      internal.keymap.pushScope(scope);
      scoped = true;
    }
    internal.workspace.activeEditor = owner;
  };
  const blur = () => {
    if (scoped) {
      internal.keymap.popScope(scope);
      scoped = false;
    }
  };
  editor.load();
  editor.set(value);
  const content = editor.editor.cm.contentDOM as HTMLElement;
  content.setAttribute('aria-label', 'Edit slide Markdown');
  content.addEventListener('focusin', focus);
  content.addEventListener('blur', blur);
  ready = true;
  return {
    focus() {
      editor.editor.focus();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      owner.file = null;
      blur();
      content.removeEventListener('focusin', focus);
      content.removeEventListener('blur', blur);
      if (internal.workspace.activeEditor === owner) internal.workspace.activeEditor = previous;
      editor.unload();
      editor.destroy();
      container.replaceChildren();
    },
  };
}
