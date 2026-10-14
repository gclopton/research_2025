import {linkedEvidence,sameKeys} from './evidence-records';
import {Plugin,editorInfoField,editorLivePreviewField,sanitizeHTMLToDom} from 'obsidian';
import {Prec} from 'obsidian-cm/state';
import {Decoration,DecorationSet,EditorView,ViewPlugin,ViewUpdate,WidgetType} from 'obsidian-cm/view';
import {syntaxTree} from 'obsidian-cm/language';
export function linkType(target:string){
 let path=target.trim();try{path=decodeURIComponent(path);}catch{}
 if(path.startsWith('obsidian://study-evidence'))return 'citation';
 path=path.split(/[?#|]/)[0].replace(/>$/,'').toLowerCase();
 if(/\.tsv$/.test(path))return 'tsv';
 if(/\.(py|pyw|js|mjs|cjs|ts|tsx|jsx|sh|bash|zsh|c|h|cpp|hpp|f90|f95|rs|go|jl|r|wls)$/.test(path))return 'code';
 if(/\.md$/.test(path)||!path.includes('://'))return 'md';
 return null;
}
export function registerEvidenceLinks(plugin:Plugin){
 const attach=(doc:Document)=>{let pending=false;const update=()=>{pending=false;for(const link of doc.querySelectorAll<HTMLAnchorElement>('a[href^="obsidian://study-evidence"]')){const block=link.closest('p,li');if(!block)continue;const nodes=Array.from(block.querySelectorAll<HTMLElement>('.pandoc-citation,a[href^="obsidian://study-evidence"]')),i=nodes.indexOf(link),cite=nodes[i-1];let matched=false;try{matched=!!cite?.matches('.pandoc-citation')&&!!cite.textContent?.trim()&&sameKeys((cite.dataset.citekey||'').split('|'),(new URL(link.href).searchParams.get('keys')||'').split('|'));}catch{}link.classList.toggle('evidence-linked-fallback',matched);if(matched){link.setAttribute('aria-hidden','true');link.tabIndex=-1;cite.setAttribute('role','button');cite.tabIndex=0;cite.setAttribute('aria-label',`Open supporting evidence for citation ${cite.textContent}`);}else{link.removeAttribute('aria-hidden');link.removeAttribute('tabindex');}}};const observer=new MutationObserver(()=>{if(!pending){pending=true;doc.defaultView?.requestAnimationFrame(update);}});observer.observe(doc.body,{childList:true,subtree:true});plugin.register(()=>observer.disconnect());update();plugin.registerDomEvent(doc,'keydown',e=>{const target=e.target as HTMLElement;if((e.key==='Enter'||e.key===' ')&&target.matches('.pandoc-citation[role=button]')){e.preventDefault();target.click();}});};attach(document);plugin.registerEvent(plugin.app.workspace.on('window-open',(_id,win)=>attach(win.document)));
 plugin.registerMarkdownPostProcessor(el=>{for(const a of el.querySelectorAll<HTMLAnchorElement>('a')){const type=linkType(a.dataset.href||a.getAttribute('href')||'');if(type)a.classList.add(`evidence-link-${type}`);}});
 class CitationWidget extends WidgetType{
  constructor(private html:string,private href:string){super();}eq(other:CitationWidget){return this.html===other.html&&this.href===other.href;}
  toDOM(view:EditorView){const span=view.dom.ownerDocument.createElement('span');span.className='evidence-citation';span.append(sanitizeHTMLToDom(this.html));span.setAttribute('role','button');span.tabIndex=0;span.setAttribute('aria-label',`Open supporting evidence for citation ${span.textContent}`);const open=(e:Event)=>{e.preventDefault();e.stopImmediatePropagation();window.open(this.href);};span.onclick=open;span.onkeydown=e=>{if(e.key==='Enter'||e.key===' ')open(e);};return span;}ignoreEvent(){return true;}
 }
 const decorate=(view:EditorView)=>{const ranges=[];const renderer=(plugin.app as any).plugins?.plugins?.['obsidian-pandoc-reference-list'],file=view.state.field(editorInfoField,false)?.file;const cache=file?renderer?.bibManager?.getCacheForPath(file.path):null;
  const from=view.state.doc.lineAt(view.viewport.from).from,to=view.state.doc.lineAt(view.viewport.to).to,text=view.state.doc.sliceString(from,to);
  const linked=renderer?.settings.renderCitations&&view.state.field(editorLivePreviewField,false)?linkedEvidence(text):[];const replaced:{from:number;to:number}[]=[];
  for(const f of linked){const start=from+f.citeFrom,end=from+f.to;let inCode=false;for(let n=syntaxTree(view.state).resolveInner(start,1);n;n=n.parent!){if(/CodeBlock|Fenced|InlineCode/i.test(n.name)){inCode=true;break;}}if(inCode)continue;if(view.state.selection.ranges.some(r=>r.from<=end&&r.to>=start))continue;
   const citation=cache?.citations?.find((c:any)=>c.from===from+f.citeFrom&&c.to===from+f.citeTo&&sameKeys(c.citations.map((p:any)=>p.id),f.keys));
   if(!citation?.val)continue;ranges.push(Decoration.replace({widget:new CitationWidget(citation.val,f.href)}).range(start,end));replaced.push({from:start,to:end});
  }
  for(const match of text.matchAll(/\[\[([^\]\n]+)\]\]|\[[^\]\n]*\]\((<?[^\n)]+>?)\)/g)){const start=from+match.index!;if(replaced.some(r=>start>=r.from&&start<r.to))continue;let code=false;for(let n=syntaxTree(view.state).resolveInner(start,1);n;n=n.parent!){if(/CodeBlock|FencedCode|InlineCode/.test(n.name)){code=true;break;}}if(code)continue;const type=linkType(match[1]||match[2]);if(type)ranges.push(Decoration.mark({class:`evidence-link-${type}`}).range(start,start+match[0].length));}
  return Decoration.set(ranges,true);
 };
 plugin.registerEditorExtension(Prec.highest(ViewPlugin.fromClass(class{decorations:DecorationSet;constructor(view:EditorView){this.decorations=decorate(view);}update(update:ViewUpdate){this.decorations=decorate(update.view);}},{decorations:v=>v.decorations})));
}
