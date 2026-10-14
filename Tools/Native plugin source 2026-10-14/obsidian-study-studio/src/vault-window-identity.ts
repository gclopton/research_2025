import {Platform, Plugin} from 'obsidian';
import {vaultWindowTitle} from './vault-window-title';

/** Observe only window titles; never scan notes or the workspace DOM. */
export function registerVaultWindowIdentity(plugin: Plugin): void {
  if (!Platform.isDesktopApp) return;
  const identity=plugin.addStatusBarItem();
  identity.addClass('study-vault-identity');
  identity.setText(plugin.app.vault.getName());
  identity.setAttribute('aria-label','Vault: '+plugin.app.vault.getName());
  identity.style.fontWeight='600';
  identity.style.color='var(--text-accent)';
  const attached = new Map<Window, () => void>();
  let alive = true;
  const attach = (win: Window) => {
    if (!alive || attached.has(win)) return;
    const doc = win.document;
    const title = doc.querySelector('title');
    if (!title) return;
    let original = doc.title;
    let rendered: string | undefined;
    const update = () => {
      if (doc.title === rendered) return;
      original = doc.title;
      rendered = vaultWindowTitle(plugin.app.vault.getName(), original);
      if (doc.title !== rendered) doc.title = rendered;
    };
    const observer = new MutationObserver(update);
    observer.observe(title, {childList: true, characterData: true, subtree: true});
    attached.set(win, () => {
      observer.disconnect();
      if (!win.closed && doc.title === rendered) doc.title = original;
    });
    update();
  };
  plugin.registerEvent(plugin.app.workspace.on('window-open', (_container, win) => attach(win)));
  plugin.registerEvent(plugin.app.workspace.on('window-close', (_container, win) => {
    attached.get(win)?.();
    attached.delete(win);
  }));
  plugin.app.workspace.onLayoutReady(() => {
    attach(window);
    plugin.app.workspace.iterateAllLeaves(leaf => {
      const win = leaf.view.containerEl.ownerDocument.defaultView;
      if (win) attach(win);
    });
  });
  plugin.register(() => {
    alive = false;
    for (const cleanup of attached.values()) cleanup();
    attached.clear();
  });
}
