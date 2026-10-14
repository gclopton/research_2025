import type { Component, MarkdownRenderChild } from 'obsidian';
import type { Block } from './model';

export type ReplaceLink = (old: string, value: string) => Promise<void>;
export type ReplaceBlockLink = (block: Block, old: string, value: string) => Promise<void>;
export interface CodeLinksHost {
  plugins?: { getPlugin(id: string): unknown };
}
export interface CodeLinksBridge {
  renderInHost(el: HTMLElement, markdown: string, source: string,
    owner: { addChild(child: MarkdownRenderChild): void }, replace: ReplaceLink | null): void;
  replace(source: string, old: string, value: string): Promise<void>;
}
export function codeLinksBridge(app: CodeLinksHost): CodeLinksBridge | null {
  const plugin = app.plugins?.getPlugin('code-links') as Partial<CodeLinksBridge> | undefined;
  return plugin && typeof plugin.renderInHost === 'function' && typeof plugin.replace === 'function'
    ? plugin as CodeLinksBridge : null;
}
export function replaceBlockLinkText(text: string, old: string, value: string): string {
  if (!old || text.split(old).length !== 2)
    throw Error('The link changed or occurs more than once in this block. Edit it in the block editor.');
  return text.replace(old, () => value);
}
export const sourceInteraction = 'a,button,input,textarea,select,.code-links-panel,.ss-document-panel,.ss-scientific,.ss-inline-editor,[contenteditable=true]';
