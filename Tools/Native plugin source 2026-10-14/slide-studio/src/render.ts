import {christmasBackdrop} from './christmas';
import christmasStar from '../assets/christmas-star.svg';
import {scientificHost} from './scientific-view';
import {scientificBlocks,scientificSource} from './scientific-core';
import {prepareCitations, readBlockSource, CitationBlock, CitationContext, blockKey} from './citation-context';
import {citationMarkdown,renderInlineCitations,citationFooter} from './citation-render';
import { App, Component, MarkdownRenderer, TFile, resolveSubpath } from 'obsidian';
import illinoisLogo from '../assets/illinois-block-i.svg';
import illinoisLogoOnWhite from '../assets/illinois-block-i-on-white.svg';
import formalDark from '../assets/illinois-formal-dark.svg';
import formalLight from '../assets/illinois-formal-light.svg';
import { Slide, Block, Theme, DEFAULT_THEME } from './model';
import { codeLinksBridge, CodeLinksHost, ReplaceBlockLink } from './code-links';
export function element<K extends keyof HTMLElementTagNameMap>(
  parent: HTMLElement,
  tag: K,
  cls = '',
  text?: string,
): HTMLElementTagNameMap[K] {
  const el = parent.ownerDocument.createElement(tag);
  el.className = cls;
  if (text !== undefined) el.textContent = text;
  parent.append(el);
  return el;
}
export function button(
  parent: HTMLElement,
  text: string,
  fn: () => void,
  cls = '',
): HTMLButtonElement {
  const b = element(parent, 'button', cls, text);
  b.type = 'button';
  b.addEventListener('click', fn);
  return b;
}
export function input(
  parent: HTMLElement,
  label: string,
  value: string,
  change: (v: string) => void,
  type = 'text',
): HTMLInputElement {
  const l = element(parent, 'label', 'ss-field');
  element(l, 'span', '', label);
  const i = element(l, 'input');
  i.type = type;
  i.value = value;
  i.setAttribute('aria-label', label);
  i.addEventListener('change', () => change(i.value));
  return i;
}
export function select(
  parent: HTMLElement,
  label: string,
  value: string,
  options: string[],
  change: (v: string) => void,
) {
  const l = element(parent, 'label', 'ss-field');
  element(l, 'span', '', label);
  const s = element(l, 'select');
  s.setAttribute('aria-label', label);
  options.forEach((v) => {
    const o = element(s, 'option', '', v);
    o.value = v;
  });
  s.value = value;
  s.onchange = () => change(s.value);
  return s;
}
export function place(node: HTMLElement, b: Block) {
  node.style.setProperty('--ss-image-position', `${b.align} center`);
  for (let level = 1; level <= 6; level++) {
    if (b.color) node.style.setProperty(`--h${level}-color`, b.color);
    else node.style.removeProperty(`--h${level}-color`);
  }
  if (b.color) {
    node.style.setProperty('--ss-ink', b.color);
    node.style.color = b.color;
  } else {
    node.style.removeProperty('--ss-ink');
    node.style.removeProperty('color');
  }
  Object.assign(node.style, {
    left: `${b.x}px`,
    top: `${b.y}px`,
    width: `${b.w}px`,
    height: `${b.h}px`,
    fontSize: `${b.font}px`,
    textAlign: b.align,
  });
}
export function footer(
  app: App,
  stage: HTMLElement,
  theme: Theme,
  label: string,
  page: string,
  path: string,
  intro = false,
) {
  if (!theme.footer) return;
  const f = element(stage, 'footer', 'ss-footer');
  f.style.setProperty('--ss-navy', theme.navy);
  f.style.setProperty('--ss-accent', theme.accent);
  const file = theme.logo ? app.metadataCache.getFirstLinkpathDest(theme.logo, path) : null;
  if(theme.palette==='christmas'||theme.palette==='christmas-night'){
    f.classList.add('ss-christmas-footer');if(intro)f.classList.add('ss-christmas-title-footer');
    const mark=element(f,'div','ss-mark'),img=element(mark,'img');img.src=file?app.vault.getResourcePath(file):christmasStar;img.alt=file?'Presentation logo':'';
    element(f,'div','ss-section-tab',intro?'Merry & bright':label);
    if(theme.pagination&&(!intro||theme.titlePagination)&&page)element(f,'span','ss-page-number',page);
    return;
  }
  if (intro) {
    f.classList.add('ss-title-footer');
    if (file) {
      const img = element(f, 'img', 'ss-title-wordmark');
      img.src = app.vault.getResourcePath(file);
      img.alt = 'Presentation logo';
    } else {
      for (const [variant, src] of [
        ['light', formalLight],
        ['dark', formalDark],
      ]) {
        const img = element(f, 'img', `ss-title-wordmark ss-wordmark-${variant}`);
        img.src = src;
        img.alt = 'University of Illinois Urbana-Champaign';
      }
    }
    if (theme.pagination && theme.titlePagination && page) element(f, 'span', 'ss-page-number', page);
    return;
  }
  const banner =
    theme.style === 'uiuc' && theme.mode === 'dark'
      ? element(f, 'div', 'ss-dark-footer-banner')
      : f;
  const mark = element(banner, 'div', 'ss-mark');
  if (file) {
    const img = element(mark, 'img');
    img.src = app.vault.getResourcePath(file);
    img.alt = 'Presentation logo';
  } else {
    const img = element(mark, 'img');
    img.src = theme.style === 'uiuc' && theme.mode === 'dark' ? illinoisLogoOnWhite : illinoisLogo;
    img.alt = 'Illinois Block I';
  }
  element(banner, 'div', 'ss-section-tab', label);
  if (theme.pattern) element(f, 'div', 'ss-footer-pattern');
  if (theme.pagination && page) element(f, 'span', 'ss-page-number', page);
}
export async function renderBlock(
  app: App,
  b: Block,
  target: HTMLElement,
  path: string,
  owner: Component,
  replaceLink?: ReplaceBlockLink,
  citationData?: CitationBlock,
  citationContext?: CitationContext,
) {
  try {
    if (b.kind === 'image') {
      const file = app.metadataCache.getFirstLinkpathDest(b.text.trim(), path);
      if (!file) throw new Error(`Image not found: ${b.text}`);
      const img = element(target, 'img', 'ss-image');
      img.src = app.vault.getResourcePath(file);
      img.alt = file.basename;
      return;
    }
    const data = citationData || await readBlockSource(app,b,path);
    const {content,sourcePath} = data;
    const bridge = codeLinksBridge(app as unknown as CodeLinksHost);
    if (bridge) target.dataset.codeLinksHost = 'slide-studio';
    scientificHost(target,{numbers:citationContext?.scientific??new Map(),edit:replaceLink&&b.kind==='markdown'?async(old,next)=>{const candidates=scientificBlocks(b.text).filter(o=>scientificSource(o.value)===old);if(candidates.length!==1)throw Error('Figure/table changed or duplicated. Reopen the editor.');await replaceLink(b,b.text.slice(candidates[0].from,candidates[0].to),next);}:undefined});
    await MarkdownRenderer.render(app, citationData ? citationMarkdown(citationData) : content, target, sourcePath, owner);
    if(citationData && citationContext) renderInlineCitations(app,target,citationData,citationContext);
    bridge?.renderInHost(target, content, sourcePath, owner, replaceLink
      ? b.kind === 'note'
        ? (old, value) => bridge.replace(sourcePath, old, value)
        : (old, value) => replaceLink(b, old, value)
      : null);

    target.querySelectorAll<HTMLAnchorElement>('a.internal-link').forEach((link) =>
      link.addEventListener('click', (e) => {
        e.preventDefault();
        void app.workspace.openLinkText(
          link.getAttribute('data-href') || link.getAttribute('href') || '',
          sourcePath,
          e.metaKey || e.ctrlKey,
        );
      }),
    );
  } catch (e) {
    element(target, 'div', 'ss-render-error', String((e as Error).message));
  }
}
export async function renderSlide(
  app: App,
  stage: HTMLElement,
  slide: Slide,
  path: string,
  owner: Component,
  theme: Theme = DEFAULT_THEME,
  label = slide.section,
  page = '1',
  replaceLink?: ReplaceBlockLink,
  citationContext?: CitationContext,
  openReferences?:()=>void,
) {
  stage.className = `ss-stage ss-type-${slide.type} ss-mode-${theme.mode} ss-style-${theme.style}`;
  stage.classList.toggle('ss-palette-fluid', theme.palette === 'fluid-dynamics');
  const christmas=theme.palette==='christmas'||theme.palette==='christmas-night';
  stage.classList.toggle('ss-palette-christmas',christmas);
  stage.classList.toggle('ss-christmas-night',theme.palette==='christmas-night');
  if(christmas)christmasBackdrop(stage,owner,theme.palette==='christmas-night');
  stage.classList.toggle('ss-background-pattern', theme.backgroundPattern === true);
  stage.style.setProperty('--ss-navy', theme.navy);
  stage.style.setProperty('--ss-accent', theme.accent);
  const nodes = slide.blocks.map((b) => {
    const n = element(stage, 'div', 'ss-block');
    place(n, b);
    const content = element(n, 'div', 'ss-block-content markdown-rendered');
    const component = owner.addChild(new Component());
    return { b, n, content, component };
  });
  footer(app, stage, theme, label, page, path, slide.type === 'intro');
  const ctx=citationContext || await prepareCitations(app,[{file:{path},doc:slide}]);
  await Promise.all(
    nodes.map(({ b, content, component }) =>
      renderBlock(app, b, content, slide.source ? slide.source.split('#')[0] : path, component, replaceLink, ctx.blocks.get(blockKey(slide,b)),ctx),
    ),
  );
  citationFooter(app,stage,slide,ctx,theme,slide.type==='intro'&&!theme.titlePagination?'':page,openReferences);
  return nodes;
}

const footerEdits = new WeakMap<HTMLElement, () => void>();
export function cancelFooterEdit(target: HTMLElement | null): boolean {
  const label = target?.closest<HTMLElement>('.ss-footer-editing');
  const cancel = label && footerEdits.get(label);
  if (!cancel) return false;
  cancel(); return true;
}

export function editableFooter(
  stage: HTMLElement,
  begin: () => boolean,
  update: (text: string) => void,
) {
  const label = stage.querySelector<HTMLElement>('.ss-section-tab');
  if (!label) return;
  label.title = 'Double-click to edit the section footer';
  label.setAttribute('aria-label', 'Section footer — double-click to edit');
  label.addEventListener('dblclick', (event) => {
    event.stopPropagation();
    if (label.isContentEditable || !begin()) return;
    const original = label.textContent || '';
    label.contentEditable = 'plaintext-only';
    label.classList.add('ss-footer-editing');
    label.setAttribute('role', 'textbox');
    label.focus();
    const selection = label.ownerDocument.getSelection();
    const range = label.ownerDocument.createRange();
    range.selectNodeContents(label);
    selection?.removeAllRanges();
    selection?.addRange(range);
    const changed = () => update(label.textContent || '');
    const finish = () => {
      footerEdits.delete(label);
      label.removeEventListener('input', changed);
      label.removeEventListener('keydown', key);
      label.removeEventListener('blur', finish);
      label.contentEditable = 'false';
      label.classList.remove('ss-footer-editing');
      label.removeAttribute('role');
      if (!label.textContent?.trim()) {
        label.textContent = original;
        update(original);
      }
    };
    const cancel = () => { label.textContent = original; update(original); label.blur(); };
    footerEdits.set(label, cancel);
    const key = (e: KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        e.preventDefault();
        label.blur();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        cancel();
      }
    };
    label.addEventListener('input', changed);
    label.addEventListener('keydown', key);
    label.addEventListener('blur', finish);
  });
}
