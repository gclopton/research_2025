import { App, Component, MarkdownRenderer, Notice } from 'obsidian';
import { equationAt, equations, Equation, splitTag, unsupported, compose, safeReplacement, Tag, fieldEquations, replaceFieldMath } from './scientific-math-model';

/** Math Studio's installed frame is reused; its code and fonts stay owned by that plugin. */
interface MathRuntime { frameCode: string; mathCSS: string; fontCSS: string; manifest: { dir: string }; }

export class MathField extends Component {
  private preview: HTMLElement;
  private frameHost: HTMLElement;
  private rendering?: Component;
  private generation = 0;
  private timer?: ReturnType<typeof setTimeout>;
  private disposeFrame?: () => void;
  private inputWasDisabled = false;
  constructor(private app: App, private input: HTMLTextAreaElement, private path: string,
    private answers: boolean, private changed: () => void, private busy: (active: boolean) => void, private showPreview = true) {
    super();
    const wrap = input.parentElement!;
    this.preview = wrap.createDiv('ss-field-preview markdown-rendered');
    this.preview.hidden=!showPreview;
    this.preview.setAttribute('aria-label', `Rendered preview: ${input.getAttribute('aria-label')}`);
    this.frameHost = wrap.createDiv('ss-field-math');
    this.registerDomEvent(input, 'input', () => this.refresh());
    this.registerDomEvent(input, 'keydown', e => {
      if (e.ctrlKey && e.code === 'KeyM') { e.preventDefault(); e.stopPropagation(); void this.openAtCursor(e.shiftKey && !this.answers); }
    });
    this.refresh();
  }
  refresh() {
    if(!this.showPreview)return;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => { this.timer = undefined; void this.render(); }, 120);
  }
  private async render() {
    const generation = ++this.generation;
    this.rendering?.unload(); const component = new Component(); component.load(); this.rendering = component;
    const source = this.input.value, qs = fieldEquations(source, this.answers);
    const doc = this.preview.ownerDocument, stage = doc.createElement('div');
    if (this.answers) {
      for (const q of qs) {
        const row = stage.createDiv('ss-answer-preview');
        await MarkdownRenderer.render(this.app, q.bodyFrom === q.from ? `$${q.body}$` : q.raw, row, this.path, component);
        row.setAttribute('role','button'); row.tabIndex = 0; row.title = 'Edit this answer with Math Studio';
        row.onclick = () => void this.open(q);
        row.onkeydown = e => { if(e.key === 'Enter') {e.preventDefault(); void this.open(q);} };
      }
    } else {
      await MarkdownRenderer.render(this.app, source || '*Preview appears here.*', stage, this.path, component);
      const nodes = Array.from(stage.querySelectorAll<HTMLElement>('.math'));
      // Refuse ambiguous mappings (e.g. embedded notes containing additional math).
      if (nodes.length === qs.length) nodes.forEach((node, i) => {
        node.tabIndex = 0; node.setAttribute('role','button'); node.setAttribute('aria-label',`Edit equation ${i+1}`);
        node.title = 'Edit with Math Studio'; node.onclick = e => {e.preventDefault(); e.stopPropagation(); void this.open(qs[i]);};
        node.onkeydown = e => {if(e.key === 'Enter') {e.preventDefault(); void this.open(qs[i]);}};
      });
    }
    if (generation !== this.generation || !this.input.isConnected) { component.unload(); return; }
    this.preview.replaceChildren(stage);
  }
  async openAtCursor(display = false) {
    if(this.input.disabled)return;
    const at = this.input.selectionStart;
    const q = this.answers ? fieldEquations(this.input.value, true).find(q => at >= q.from && at <= q.to) : equationAt(this.input.value,at);
    if (q) return this.open(q);
    const from = this.input.selectionStart, to = this.input.selectionEnd;
    const selected = this.input.value.slice(from,to);
    return this.open({from,to,bodyFrom: this.answers ? from : from+1,bodyTo:to,raw:selected,body:selected,display}, true);
  }
  private async open(q: Equation, inserting = false) {
    if (this.input.disabled || this.disposeFrame || this.input.closest(".ss-scientific-text-editor")?.querySelector(".ss-field-math iframe")) return;
    const runtime = (this.app as any).plugins?.getPlugin('math-studio') as MathRuntime | undefined;
    if (!runtime?.frameCode || !runtime.fontCSS || !runtime.mathCSS) {new Notice('Enable Math Studio to edit equations visually. Markdown editing remains available.'); return;}
    const original = this.input.value;
    if (!inserting && original.slice(q.from,q.to) !== q.raw) {this.refresh(); new Notice('The field changed. Select the equation again.'); return;}
    const doc = this.input.ownerDocument, win = doc.defaultView!, id = crypto.randomUUID();
    const iframe = doc.createElement('iframe'); iframe.className = 'math-studio-frame'; iframe.title = 'Math Studio scientific text equation editor';
    iframe.setAttribute('sandbox','allow-scripts allow-same-origin');
    const colors: Record<string,string> = {}, computed = win.getComputedStyle(this.input);
    for (const key of ['--text-normal','--text-muted','--text-error','--background-primary','--background-secondary','--background-modifier-border','--background-modifier-hover','--interactive-accent','--text-on-accent']) colors[key]=computed.getPropertyValue(key).trim();
    const config = {id,...splitTag(q.body),display:q.display,fontCSS:runtime.fontCSS,mathCSS:runtime.mathCSS,fonts:this.app.vault.adapter.getResourcePath(`${runtime.manifest.dir}/vendor/fonts`),dark:doc.body.classList.contains('theme-dark'),colors,blocked:unsupported(q.body)};
    iframe.srcdoc = `<!doctype html><html><head><meta charset="UTF-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; font-src app: data:; img-src data:; connect-src 'none'"></head><body><script>window.mathStudioConfig=${JSON.stringify(config).replace(/</g,'\\u003c')};</script><script>${runtime.frameCode.replace(/<\/script/gi,'<\\/script')}</script></body></html>`;
    this.inputWasDisabled = this.input.disabled; this.input.disabled = true; this.busy(true);
    const finish = () => {this.disposeFrame?.(); this.input.focus();};
    const receive = (event: MessageEvent) => {
      if(event.source !== iframe.contentWindow || event.data?.mathStudio !== id) return;
      const data = event.data;
      if(data.type === 'resize') iframe.style.height = `${Math.max(280,Math.min(780,Number(data.height)||300))}px`;
      if(data.type === 'cancel' || data.type === 'native') finish();
      if(data.type === 'copy') void win.navigator.clipboard.writeText(String(data.latex));
      if(data.type === 'save') {
        try {
          if(this.input.value !== original) throw Error('The field changed. Your equation draft remains open.');
          if(typeof data.latex !== 'string' || !['none','auto','manual'].includes(data.tag?.kind)) throw Error('Invalid equation draft.');
          this.input.value = !inserting && !data.changed ? original : replaceFieldMath(original,q,data.latex,data.tag);
          this.changed(); this.refresh(); finish();
        } catch(error) {iframe.contentWindow?.postMessage({mathStudio:id,type:'error',message:(error as Error).message},'*');}
      }
    };
    win.addEventListener('message',receive);
    this.disposeFrame = () => {win.removeEventListener('message',receive); iframe.remove(); this.input.disabled=this.inputWasDisabled; this.disposeFrame=undefined; this.busy(false);};
    this.frameHost.append(iframe); iframe.scrollIntoView({block:'nearest'});
  }
  onunload() {this.generation++; if(this.timer) clearTimeout(this.timer); this.disposeFrame?.(); this.rendering?.unload(); this.preview.remove(); this.frameHost.remove();}
}
