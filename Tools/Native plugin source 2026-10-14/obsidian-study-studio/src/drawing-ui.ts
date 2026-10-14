import {App,Component} from 'obsidian';
import {validateDrawingResponse} from './drawing-model';
export function drawingPreview(host:HTMLElement,value:string){
 if(!value){host.createEl('p',{text:'No drawing yet.'});return;}
 try{validateDrawingResponse(value);const image=host.createEl('img',{attr:{alt:'Drawing response',src:`data:image/svg+xml;charset=utf-8,${encodeURIComponent(JSON.parse(value).svg)}`}});image.style.maxWidth='100%';image.style.maxHeight='560px';}catch{host.createEl('p',{text:'Drawing could not be displayed. Its saved data is retained.'});}
}
export function drawingInput(app:App,host:HTMLElement,initial:string,owner:Component,change:(value:string)=>void,busy:(active:boolean)=>void){
 const dom=host.createDiv('study-drawing-input'),preview=dom.createDiv(),button=dom.createEl('button',{text:initial?'Edit drawing':'Draw response'}),status=dom.createEl('p',{attr:{'aria-live':'polite'}});
 let value=initial,disabled=false,active=false,disposed=false,cleanup=()=>{};
 drawingPreview(preview,value);
 button.onclick=async()=>{
  if(disabled||active)return;active=true;busy(true);button.disabled=true;
  try{
   const ink=(app as any).plugins?.getPlugin('ink-studio');
   if(!ink?.code||!ink?.css)throw Error('Enable Ink Studio to draw. Existing responses remain available.');
   const doc=dom.ownerDocument,iframe=dom.createEl('iframe',{attr:{title:'Draw response with Ink Studio',sandbox:'allow-scripts allow-same-origin'}});iframe.style.width='100%';iframe.style.height='600px';
   preview.hide();const session=crypto.randomUUID();
   const saved=value?JSON.parse(value):null;
   const scene=saved?JSON.parse(saved.scene):{format:'ink-studio',version:1,id:crypto.randomUUID(),elements:[],appState:{viewBackgroundColor:'#ffffff',currentItemStrokeWidth:0.5},files:{},updated:new Date().toISOString()};
   const config={session,scene,dark:doc.body.classList.contains('theme-dark')};
   const asset=app.vault.adapter.getResourcePath(`${ink.manifest.dir}/vendor/`).replace(/\?.*$/,'');
   let revision=-1;
   const reply=(type:string,extra:object={})=>iframe.contentWindow?.postMessage({inkStudio:session,type,...extra},'*');
   const close=()=>{cleanup();iframe.remove();active=false;busy(false);button.disabled=disabled;button.setText(value?'Edit drawing':'Draw response');preview.empty();drawingPreview(preview,value);preview.show();button.focus();};
   const receive=(event:MessageEvent)=>{
    if(disposed||event.source!==iframe.contentWindow||event.data?.inkStudio!==session)return;
    const d=event.data;
    if(d.type==='preview-error'){status.setText('Preview failed. Retry Done before submitting.');return;}
    if(!['draft','preview'].includes(d.type)||typeof d.revision!=='number'||d.revision<revision)return;
    try{
     revision=d.revision;
     const populated=d.scene?.elements?.some((e:any)=>e&&!e.isDeleted);
     const next=populated?JSON.stringify({scene:JSON.stringify(d.scene),svg:d.type==='preview'?d.svg:(value?JSON.parse(value).svg:'<svg xmlns="http://www.w3.org/2000/svg"/>')}):'';
     validateDrawingResponse(next);value=next;change(value);
     if(d.type==='preview'){reply('saved',{revision:d.revision});status.setText('Drawing draft updated.');if(d.finish)close();}
    }catch(e){reply('error',{message:String(e)});status.setText(String(e));}
   };
   doc.defaultView!.addEventListener('message',receive);cleanup=()=>doc.defaultView?.removeEventListener('message',receive);
   iframe.srcdoc=frameDocument(config,asset,ink.css,ink.code);
  }catch(e){status.setText(String(e));active=false;busy(false);button.disabled=disabled;}
 };
 owner.register(()=>{disposed=true;cleanup();if(active)busy(false);});
 return {dom,get value(){return value;},get disabled(){return disabled;},set disabled(v:boolean){disabled=v;button.disabled=v||active;}};
}

function frameDocument(config:any,asset:string,css:string,code:string){return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'wasm-unsafe-eval'; style-src 'unsafe-inline'; font-src app: data: blob:; img-src app: data: blob:; connect-src app: data: blob:; worker-src blob:"><style>${css}</style><style>html,body{margin:0;height:100%;overflow:hidden}body{font:13px system-ui;background:${config.dark ? "#232329" : "#fff"};color:${config.dark ? "#eee" : "#222"}}header{height:42px;display:flex;align-items:center;gap:12px;padding:0 12px}button{font:inherit;padding:5px 10px;cursor:pointer;border:1px solid #7775;border-radius:5px;background:transparent;color:inherit}#done{background:#6960cb;color:white}#retry,#recover{display:none}#status{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#editor{height:calc(100% - 42px)}.excalidraw{--default-font:system-ui}</style></head><body><header><strong>Ink Studio</strong><label title="Width for new strokes; existing ink is unchanged">Pen width <input id="pen-slider" type="range" min="0.1" max="4" step="0.1" style="width:90px;vertical-align:middle" aria-label="Adjust pen width"><input id="pen-width" type="number" min="0.1" max="8" step="0.1" style="width:54px" aria-label="Pen width"></label><label>Preview <select id="preview-appearance" aria-label="Preview appearance"><option value="editor">Match editor</option><option value="light">Light</option></select></label><span id="status">Opening…</span><button id="retry">Retry save</button><button id="recover" title="Save a separate recovery copy">Recover draft</button><button id="done">Done · ⌘/Ctrl+Enter</button></header><div id="editor"></div><script>window.inkConfig=${JSON.stringify(config).replace(/</g, "\\u003c")};window.EXCALIDRAW_ASSET_PATH=${JSON.stringify(asset)};</script><script>${code.replace(/<\/script/gi, "<\\/script")}</script></body></html>`;}
