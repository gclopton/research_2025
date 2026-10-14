import {Plugin, TFile, Modal, Setting, Notice, editorInfoField} from 'obsidian';
import {EditorView} from 'obsidian-cm/view';
import {Annotation, EditorState} from 'obsidian-cm/state';
import {anchorRanges} from './review-model';
import {anchorRemovalChanges, changedAnchorIds, removalPhrase} from './anchor-protection-model';

const approvedRemoval=Annotation.define<boolean>();
type Incoming={path:string;line:number;id:string};

function incoming(plugin:Plugin, target:TFile, ids:readonly string[]):Incoming[] {
  const wanted=new Set(ids), found:Incoming[]=[];
  for(const file of plugin.app.vault.getMarkdownFiles()){
    const cache=plugin.app.metadataCache.getFileCache(file);
    for(const ref of [...(cache?.links??[]),...(cache?.embeds??[])]){
      const at=ref.link.indexOf('#^');if(at<0)continue;
      const id=ref.link.slice(at+1);if(!wanted.has(id))continue;
      const path=ref.link.slice(0,at);
      const resolved=path?plugin.app.metadataCache.getFirstLinkpathDest(path,file.path):file;
      if(resolved?.path===target.path)found.push({path:file.path,line:ref.position.start.line+1,id});
    }
  }
  return found.sort((a,b)=>a.path.localeCompare(b.path)||a.line-b.line||a.id.localeCompare(b.id));
}

class RemoveAnchorsModal extends Modal {
  constructor(private plugin:Plugin,private view:EditorView,private file:TFile,private ids:string[],private all:boolean){super(plugin.app);}
  onOpen(){
    const before=this.view.state.doc.toString();
    const refs=incoming(this.plugin,this.file,this.ids), signature=JSON.stringify(refs);
    const phrase=removalPhrase(this.ids,this.all);
    this.titleEl.textContent=this.all?'Remove all block anchors from this note?':`Remove block anchor ${this.ids[0]}?`;
    this.contentEl.createEl('p',{text:`Note: ${this.file.path}`});
    this.contentEl.createEl('p',{text:`This removes ${this.ids.length} anchor${this.ids.length===1?'':'s'} and keeps the passage text. Links to the removed anchors will no longer reach their passages.`});
    this.contentEl.createEl('h3',{text:`Indexed incoming references in this vault: ${refs.length}`});
    const list=this.contentEl.createDiv();list.style.maxHeight='220px';list.style.overflowY='auto';
    for(const ref of refs)list.createEl('p',{text:`${ref.path} · line ${ref.line} → ${ref.id}`});
    if(!refs.length)list.createEl('p',{text:'No indexed references found. Links from other vaults, external files, or unindexed content are not included.'});
    else this.contentEl.createEl('p',{text:'References outside this vault or in unindexed content are not included.'});
    this.contentEl.createEl('p',{text:`To confirm, type exactly: ${phrase}`});
    let typed='';
    const row=new Setting(this.contentEl).setName('Confirmation');
    let remove:HTMLButtonElement;
    row.addText(t=>{t.inputEl.setAttribute('aria-label','Anchor removal confirmation');t.onChange(value=>{typed=value;if(remove)remove.disabled=typed!==phrase;});});
    new Setting(this.contentEl).addButton(b=>b.setButtonText('Cancel').onClick(()=>this.close())).addButton(b=>{
      b.setButtonText('Remove anchors').setWarning();remove=b.buttonEl;remove.disabled=true;
      b.onClick(()=>{
        if(typed!==phrase)return;
        const info=this.view.state.field(editorInfoField,false);
        if(info?.file?.path!==this.file.path||this.view.state.doc.toString()!==before||JSON.stringify(incoming(this.plugin,this.file,this.ids))!==signature){
          new Notice('The note or its references changed. Reopen the removal dialog to review them.');this.close();return;
        }
        this.view.dispatch({changes:anchorRemovalChanges(before,this.ids),annotations:approvedRemoval.of(true),userEvent:'input.anchor-removal'});
        this.close();new Notice('Anchors removed. Undo restores them.');
      });
    });
  }
}

export function requestAnchorRemoval(plugin:Plugin, view:EditorView, ids:string[], all=false){
  const file=view.state.field(editorInfoField,false)?.file;
  if(!file||!ids.length)return;
  new RemoveAnchorsModal(plugin,view,file,ids,all).open();
}

export function registerAnchorProtection(plugin:Plugin){
  let lastNotice=0;
  plugin.registerEditorExtension(EditorState.transactionFilter.of(tr=>{
    if(!tr.docChanged||tr.annotation(approvedRemoval))return tr;
    const beforeFile=tr.startState.field(editorInfoField,false)?.file;
    const afterFile=tr.state.field(editorInfoField,false)?.file;
    if(!beforeFile||beforeFile.path!==afterFile?.path)return tr;
    if(!changedAnchorIds(tr).length)return tr;
    if(Date.now()-lastNotice>2500){lastNotice=Date.now();new Notice('Block anchors are protected. Right-click the anchor to remove it, or use “Remove all block anchors from current note”.');}
    return [];
  }));
  plugin.registerEvent(plugin.app.workspace.on('editor-menu',(menu,editor,info)=>{
    const view=(editor as unknown as {cm?:EditorView}).cm;if(!view||!info.file)return;
    const from=editor.posToOffset(editor.getCursor('from')),to=editor.posToOffset(editor.getCursor('to'));
    const candidates=anchorRanges(editor.getValue()).filter(a=>a.from<=to&&a.to>=from);
    for(const a of candidates)menu.addItem(i=>i.setTitle(`Remove block anchor ${a.id}…`).setIcon('unlink').onClick(()=>requestAnchorRemoval(plugin,view,[a.id])));
  }));
  plugin.addCommand({id:'remove-all-block-anchors',name:'Remove all block anchors from current note…',editorCheckCallback:(checking,editor,info)=>{
    if(!info.file)return false;
    const view=(editor as unknown as {cm?:EditorView}).cm;
    const ids=anchorRanges(editor.getValue()).map(a=>a.id);
    if(!view||!ids.length)return false;
    if(!checking)requestAnchorRemoval(plugin,view,ids,true);
    return true;
  }});
}
