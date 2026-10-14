import {paperSourcePath} from './paper-source-path';
import {registerEvidenceWorkflow} from './evidence-workflow';
import {MarkdownView,Menu,Modal,Notice,Plugin,Setting,TFile,WorkspaceLeaf} from 'obsidian';
import {EvidenceArea,EvidenceTarget,evidenceURI,parseEvidence,uniquePassage} from './evidence-model';
import {resizeCommentWindow} from './comment-window';
/** Session-only decorations, scoped to the leaf opened by an evidence link. */
export function registerEvidence(plugin:Plugin){
 const modern=registerEvidenceWorkflow(plugin);
 const active=new Map<WorkspaceLeaf,EvidenceTarget>();
 const clear=(leaf:WorkspaceLeaf)=>{const root=leaf.view.containerEl;root.querySelectorAll('.study-evidence-highlight').forEach(el=>el.replaceWith(...el.childNodes));root.querySelectorAll('.study-evidence-area-wrap').forEach(el=>{el.querySelectorAll('.study-evidence-area').forEach(a=>a.remove());el.replaceWith(...el.childNodes);});root.normalize();active.delete(leaf);};
 const render=(leaf:WorkspaceLeaf,target:EvidenceTarget)=>{
  const view=leaf.view;if(!(view instanceof MarkdownView)||view.file?.path!==target.path){clear(leaf);return;}
  clear(leaf);active.set(leaf,target);
  const root=view.previewMode.containerEl;
  let missed=0;
  for(const passage of target.passages){
   const walker=root.ownerDocument.createTreeWalker(root,4),nodes:Text[]=[];let node:Node|null;
   while((node=walker.nextNode()))if(!node.parentElement?.closest('button,script,style,.study-evidence-highlight'))nodes.push(node as Text);
   const text=nodes.map(n=>n.data).join(''),at=uniquePassage(text,passage.quote);if(!at){missed++;continue;}
   let offset=0;
   for(const n of nodes){const end=offset+n.length;if(end>at.from&&offset<at.to){const start=Math.max(0,at.from-offset),count=Math.min(end,at.to)-offset-start;const piece=n.splitText(start);piece.splitText(count);const mark=root.ownerDocument.createElement('span');mark.className='study-critique study-evidence-highlight';mark.title=passage.comment||'Supporting passage';mark.tabIndex=0;mark.setAttribute('role','button');mark.setAttribute('aria-label','Read evidence comment');piece.replaceWith(mark);mark.append(piece);
    const show=()=>{const modal=new Modal(plugin.app);modal.titleEl.setText('Supporting passage');modal.contentEl.createEl('blockquote',{text:passage.quote});modal.contentEl.createEl('p',{text:passage.comment||'No comment attached.'});modal.contentEl.createEl('p',{text:'Temporary highlight. The source document has not been changed.',cls:'setting-item-description'});resizeCommentWindow(modal);modal.open();};mark.onclick=show;mark.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();show();}};
   }offset=end;}
  }
  for(const area of target.areas||[]){
   const candidates=Array.from(root.querySelectorAll<HTMLElement>(area.kind==='image'?'img':'table')).filter(el=>area.kind==='image'?imageTarget(el as HTMLImageElement)===area.target:el.textContent===area.target);
   if(candidates.length!==1){missed++;continue;}const el=candidates[0];let wrap=el.parentElement!;
   if(!wrap.classList.contains('study-evidence-area-wrap')){wrap=root.ownerDocument.createElement('div');wrap.className='study-evidence-area-wrap';if(area.kind==='table')wrap.classList.add('study-evidence-table-wrap');el.replaceWith(wrap);wrap.append(el);}
   const mark=wrap.createEl('button',{cls:'study-evidence-area',attr:{'aria-label':'Read area evidence comment'}});const [x,y,w,h]=area.rect;Object.assign(mark.style,{left:`${x*100}%`,top:`${y*100}%`,width:`${w*100}%`,height:`${h*100}%`});mark.title=area.comment||'Supporting area';mark.onclick=()=>{const modal=new Modal(plugin.app);modal.titleEl.setText('Supporting area');modal.contentEl.createEl('p',{text:area.comment||'No comment attached.'});resizeCommentWindow(modal);modal.open();};
  }
  root.querySelector('.study-evidence-highlight,.study-evidence-area')?.scrollIntoView({block:'center'});
  if(missed)new Notice(`${missed} supporting passage(s) could not be uniquely located. No approximate match was highlighted.`);
 };
 const imageTarget=(image:HTMLImageElement)=>image.closest('.internal-embed')?.getAttribute('src')||image.getAttribute('src')||'';
 plugin.registerObsidianProtocolHandler('study-evidence',async params=>{
  if(params.file){await modern(params);return;}
  try {const target=parseEvidence(params.target||'');target.path=paperSourcePath(plugin.app,target.path);const file=plugin.app.vault.getAbstractFileByPath(target.path);if(!(file instanceof TFile))throw Error('Source paper is not present in this vault');
   const leaf=plugin.app.workspace.getLeaf(target.window?'window':'tab');await leaf.openFile(file,{state:{mode:'preview'}});await plugin.app.workspace.revealLeaf(leaf);
   // Wait for reading mode rendering, which can continue after openFile resolves.
   const root=leaf.view.containerEl;let timer:number;const win=root.ownerDocument.defaultView!;
   const settle=()=>{win.clearTimeout(timer);timer=win.setTimeout(()=>{observer.disconnect();render(leaf,target);},350);};
   const observer=new MutationObserver(settle);observer.observe(root,{childList:true,subtree:true});settle();plugin.register(()=>{observer.disconnect();win.clearTimeout(timer);});
  }catch(e){new Notice(e instanceof Error?e.message:'Invalid evidence link');}
 });
 plugin.addCommand({id:'clear-evidence-highlights',name:'Clear temporary evidence highlights',callback:()=>{for(const leaf of [...active.keys()])clear(leaf);for(const leaf of plugin.app.workspace.getLeavesOfType('study-evidence-reader'))void (leaf.view as any).clear();}});
 plugin.registerEvent(plugin.app.workspace.on('layout-change',()=>{for(const [leaf,target] of active)if(!(leaf.view instanceof MarkdownView)||leaf.view.file?.path!==target.path)clear(leaf);}));
 plugin.register(()=>{for(const leaf of [...active.keys()])clear(leaf);});
 plugin.addCommand({id:'copy-evidence-link',name:'Copy evidence link to selected passage',editorCheckCallback:(checking,editor,info)=>{
  if(!info.file||!editor.getSelection().trim())return false;if(checking)return true;
  const path=info.file.path,quote=editor.getSelection(),modal=new Modal(plugin.app);let comment='',popout=true;
  modal.titleEl.setText('Copy evidence link');modal.contentEl.createEl('p',{text:'Select plain rendered text. The link carries the passage and optional comment; nothing is added to the paper.'});
  new Setting(modal.contentEl).setName('Comment').addTextArea(t=>t.onChange(v=>comment=v));
  new Setting(modal.contentEl).setName('Open in separate window').addToggle(t=>t.setValue(true).onChange(v=>popout=v));
  new Setting(modal.contentEl).addButton(b=>b.setButtonText('Copy link').setCta().onClick(async()=>{await navigator.clipboard.writeText(`[Supporting passage](${evidenceURI(plugin.app.vault.getName(),{path,passages:[{quote,comment}],window:popout})})`);modal.close();new Notice('Evidence link copied');}));modal.open();return true;
 }});
}
