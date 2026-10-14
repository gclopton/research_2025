/** The stable ID survives deck moves; the path keeps the source readable. */
export interface EmbedTarget { id?: string; path: string }
export function embedSource(id: string, path: string): string {
  return '```slide-studio\n' + JSON.stringify({ id, path }) + '\n```';
}
export function parseEmbed(source: string): EmbedTarget {
  const text = source.trim();
  if (text.startsWith('{')) {
    const value = JSON.parse(text);
    if (!value || typeof value.path !== 'string' || (value.id !== undefined && typeof value.id !== 'string'))
      throw Error('Choose a presentation with “Insert presentation…” in the note menu.');
    return { id: value.id || undefined, path: value.path };
  }
  const path = text.replace(/^!?\[\[/, '').replace(/\]\]$/, '').split('|')[0].trim();
  if (!path || /\n/.test(path)) throw Error('Enter one presentation path or [[presentation link]].');
  return { path };
}
export function embedPage(index: number, count: number): number {
  return Math.max(0, Math.min(Math.max(0, count - 1), index));
}
