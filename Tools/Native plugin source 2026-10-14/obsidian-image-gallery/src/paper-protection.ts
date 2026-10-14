import {Plugin,MarkdownView,Notice,TFile,editorInfoField} from 'obsidian';
import {EditorState,Compartment,Transaction} from '@codemirror/state';
import {EditorView,showPanel} from '@codemirror/view';
import {PaperProtectionIndex,sameContent} from './paper-protection-model';
import {createHash} from 'node:crypto';
import type {LibraryCatalog} from './library-model';
import {equivalentLocalLinks} from './working-copy';

interface Owner {catalog:LibraryCatalog;subscribe(f:()=>void):()=>void;issues:Map<string,string>;reportProtectionIssue(path:string,message:string):void;createWorkingCopy(path?:string):void;}
/** Narrow, unload-safe adapter guards cover both normal saves and plugin writes. */
export function installPaperProtection(plugin:Plugin,owner:Owner){
 const app=plugin.app,adapter=app.vault.adapter;let index=new PaperProtectionIndex(owner.catalog),lastNotice=0,active=true;
 const moved=new Map<string,string>(),relocated=new Map<string,number>();const readonlySlot=new Compartment();
 const readonlyExtension=()=>EditorState.readOnly.compute([editorInfoField],state=>editorLocked(state.field(editorInfoField,false)?.file?.path??''));
 const locked=(path:string)=>index.isProtected(path)||moved.has(path);
 const editorLocked=(path:string)=>locked(path)||/\.md$/i.test(path)&&index.canonicalPaths.has(path);
 const harmlessRelocation=(path:string,before:string,after:string)=>(relocated.get(path)??0)>Date.now()&&equivalentLocalLinks(before,after,link=>app.metadataCache.getFirstLinkpathDest(link,path)?.path);
 const notify=(error:unknown)=>{if(Date.now()-lastNotice>2000){lastNotice=Date.now();new Notice(String(error).replace(/^Error: /,''),6500);}};
 const refusal=()=>Error('Cleaned paper text is protected. Annotations are available; use “Create working copy” to edit the text.');
 const resetEditor=(path:string)=>{for(const leaf of app.workspace.getLeavesOfType('markdown')){const view=leaf.view;if(view instanceof MarkdownView&&view.file?.path===path)void app.vault.read(view.file).then(raw=>{if(active&&view.file?.path===path&&view.editor.getValue()!==raw)view.editor.setValue(raw);});}};
 const contentChecks=new Map<string,number>();let inspections=Promise.resolve();
 const inspect=async(path:string)=>{const id=index.protectedPaths.get(path);if(!id)return;const source=owner.catalog.sources[id];const expected=path===source.pdf.path?source.cleanup?.pdfSha256:source.cleanup?.markdownSha256;if(!expected)return;try{const data=await adapter.readBinary(path);if(createHash('sha256').update(new Uint8Array(data)).digest('hex')!==expected)owner.reportProtectionIssue(path,'Protected paper changed outside the editor; reviewed source needs attention.');}catch{owner.reportProtectionIssue(path,'Protected paper is missing or unreadable.');}};
 const schedule=(path:string)=>{if(!locked(path))return;window.clearTimeout(contentChecks.get(path));contentChecks.set(path,window.setTimeout(()=>{contentChecks.delete(path);inspections=inspections.then(()=>inspect(path)).catch(()=>{});},500));};
 const refresh=()=>{for(const leaf of app.workspace.getLeavesOfType('markdown')){const view=leaf.view;if(view instanceof MarkdownView){const cm=(view.editor as any)?.cm as EditorView|undefined;cm?.dispatch({effects:readonlySlot.reconfigure(readonlyExtension())});}}};
 plugin.register(owner.subscribe(()=>{index=new PaperProtectionIndex(owner.catalog);for(const p of moved.keys())if(index.isProtected(p))moved.delete(p);refresh();}));
 plugin.registerEvent(app.workspace.on('file-open',f=>{refresh();if(f?.extension==='md')schedule(f.path);}));
 plugin.registerEvent(app.workspace.on('active-leaf-change',()=>refresh()));
 plugin.registerEvent(app.vault.on('rename',f=>{if(f instanceof TFile&&!moved.has(f.path)&&!index.canonicalPaths.has(f.path)&&index.ownerForName(f.path))owner.reportProtectionIssue(f.path,'This file uses a reserved paper title. Rename it with a descriptive suffix.');}));
 plugin.registerEvent(app.vault.on('modify',f=>schedule(f.path)));
 plugin.registerEvent(app.vault.on('delete',f=>{for(const p of index.protectedPaths.keys())if(p===f.path||p.startsWith(f.path+'/'))owner.reportProtectionIssue(p,'Protected paper was removed outside the editor.');}));
 app.workspace.onLayoutReady(()=>{
  const current=app.workspace.getActiveFile();if(current?.extension==='md')schedule(current.path);
  plugin.registerEvent(app.vault.on('create',f=>{if(f instanceof TFile&&!moved.has(f.path)&&!index.canonicalPaths.has(f.path)&&index.ownerForName(f.path))owner.reportProtectionIssue(f.path,'This file uses a reserved paper title. Rename it with a descriptive suffix.');}));
 });
 plugin.registerEditorExtension(readonlySlot.of(readonlyExtension()));
 // The panel exists only in the editor; Reading view remains uncluttered.
 plugin.registerEditorExtension(showPanel.compute([editorInfoField],state=>{
  const path=state.field(editorInfoField,false)?.file?.path;
  if(!path||!editorLocked(path))return null;
  return view=>{
   const dom=view.dom.ownerDocument.createElement('div');dom.className='image-gallery-source-warning';dom.setAttribute('role','note');
   const message=dom.createEl('span',{text:'Naughty boy — this is an original source. Duplicate it before making edits. Annotations are still available.'});
   const copy=dom.createEl('button',{text:'Duplicate before editing'});copy.onclick=()=>owner.createWorkingCopy(path);
   return {dom,top:true};
  };
 }));
 // Typing/paste/drop are rejected; system document loads and annotation-only transactions remain valid.
 plugin.registerEditorExtension(EditorState.transactionFilter.of(tr=>{
  const path=tr.startState.field(editorInfoField,false)?.file?.path;
  if(path&&editorLocked(path)&&tr.docChanged&&!!tr.annotation(Transaction.userEvent)){notify(refusal());return [];}
  return tr;
 }));
 const patch=(name:string,wrap:(original:(...args:any[])=>any)=>(...args:any[])=>any)=>{
  const object=adapter as any,original=object[name];if(typeof original!=='function')return;
  const guarded=wrap((...args)=>original.apply(adapter,args));object[name]=guarded;
  plugin.register(()=>{if(object[name]===guarded)object[name]=original;});
 };
 const checkName=async(path:string)=>{if(index.ownerForName(path)&&!await adapter.exists(path))index.assertDestination(path);};
 for(const method of ['write','writeBinary'])patch(method,original=>async(path:string,data:any,...rest:any[])=>{
  if(!active)return original(path,data,...rest);
  try{if(locked(path)){
   const before=method==='write'?await adapter.read(path):await adapter.readBinary(path);
   if(sameContent(before,data)||typeof before==='string'&&typeof data==='string'&&harmlessRelocation(path,before,data))return;
   throw refusal();
  }await checkName(path);return await original(path,data,...rest);}catch(e){notify(e);if(locked(path))resetEditor(path);throw e;}
 });
 for(const method of ['append','appendBinary'])patch(method,original=>async(path:string,data:string|ArrayBuffer,...rest:any[])=>{if(!active)return original(path,data,...rest);try{if(locked(path)&&(typeof data==='string'?data.length:data.byteLength))throw refusal();await checkName(path);return await original(path,data,...rest);}catch(e){notify(e);throw e;}});
 patch('process',original=>async(path:string,fn:(data:string)=>string,...rest:any[])=>{
  if(!active)return original(path,fn,...rest);
  try{
   if(locked(path)){
    const before=await adapter.read(path),after=fn(before);
    if(after===before||harmlessRelocation(path,before,after))return before;
    throw refusal();
   }
   await checkName(path);return await original(path,fn,...rest);
  }catch(e){notify(e);if(locked(path))resetEditor(path);throw e;}
 });
 for(const method of ['copy','rename'])patch(method,original=>async(from:string,to:string,...rest:any[])=>{
  if(!active)return original(from,to,...rest);
  try{
   if(locked(to))throw refusal();
   const files=app.vault.getFiles().filter(f=>f.path===from||f.path.startsWith(from+'/'));
   // Include direct adapter files not yet in Obsidian's file cache.
   const paths=files.length?files.map(f=>f.path):[from];
   for(const p of paths){const dest=to+p.slice(from.length);if(method!=='rename'||p.split('/').at(-1)!==dest.split('/').at(-1))index.assertDestination(dest,method==='rename'?p:undefined);if(method==='rename'&&locked(p)&&(p===from&&/\.md$/i.test(p)||index.isAsset(from)))throw Error('Move the paper’s whole conversion folder to keep its images and links together. Use a working copy to change its title.');}
   const pending=method==='rename'?paths.filter(locked).map(p=>to+p.slice(from.length)):[];
   for(const [p,until]of relocated)if(until<Date.now())relocated.delete(p);
   for(const p of pending){moved.set(p,from);if(/\.md$/i.test(p))relocated.set(p,Date.now()+15000);}
   try{return await original(from,to,...rest);}catch(e){for(const p of pending){moved.delete(p);relocated.delete(p);}throw e;}
  }catch(e){notify(e);throw e;}
 });
 for(const method of ['remove','trashLocal','trashSystem','rmdir'])patch(method,original=>async(path:string,...rest:any[])=>{
  if(active&&(index.isAsset(path)||[...index.protectedPaths.keys(),...index.assetRoots,...moved.keys()].some(p=>p===path||p.startsWith(path+'/')))){const e=Error('This contains a protected paper. Keep the canonical source and edit a working copy.');notify(e);throw e;}return original(path,...rest);
 });
 const menus=(menu:import('obsidian').Menu,path?:string)=>{if(!path||!locked(path))return;menu.addItem(i=>i.setTitle('Cleaned paper · annotations available').setIcon('lock').setDisabled(true));menu.addItem(i=>i.setTitle('Create working copy…').setIcon('copy').onClick(()=>owner.createWorkingCopy(path)));};
 plugin.registerEvent(app.workspace.on('file-menu',(menu,file)=>menus(menu,file.path)));
 plugin.registerEvent(app.workspace.on('editor-menu',(menu,_editor,info)=>menus(menu,info.file?.path)));
 plugin.addCommand({id:'create-paper-working-copy',name:'Create working copy of paper…',checkCallback:checking=>{const path=app.workspace.getActiveFile()?.path;if(!path||!index.canonicalPaths.has(path))return false;if(!checking)owner.createWorkingCopy(path);return true;}});
 plugin.register(()=>{active=false;relocated.clear();for(const t of contentChecks.values())window.clearTimeout(t);});
 return {isProtected:locked};
}
