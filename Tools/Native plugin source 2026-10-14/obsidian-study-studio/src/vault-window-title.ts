/** Preserve the view name while putting vault identity before macOS truncation. */
export function vaultWindowTitle(vault: string, title: string): string {
  vault = vault.normalize('NFC');
  title = title.normalize('NFC');
  const appSuffix = / - Obsidian(?: [\w.+-]+)?$/;
  if (appSuffix.test(title)) {
    const base = title.replace(appSuffix, '');
    if (base === vault) return vault;
    const suffix = ` - ${vault}`;
    if (base.endsWith(suffix)) return `${vault} — ${base.slice(0, -suffix.length)}`;
  }
  if (!title || title === vault || title.startsWith(`${vault} — `)) return title || vault;
  return `${vault} — ${title}`;
}
