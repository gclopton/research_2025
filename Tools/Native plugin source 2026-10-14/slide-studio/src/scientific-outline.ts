import {Plugin,TFile} from 'obsidian';
import {scientificIndex} from './scientific-index';
/** Optional adapter; the installed Callout Outline source and settings are never changed. */
export function registerScientificOutline(plugin:Plugin){
 let restore:(()=>void)|undefined;
 const attach=()=>{if(restore)return;const outline=(plugin.app as any).plugins?.getPlugin('callout-outline');if(!outline||typeof outline.getActiveMarkdownState!=='function')return;
  const original=outline.getActiveMarkdownState;
  const wrapped=async function(this:any){const state=await original.call(this);if(!(state.file instanceof TFile))return state;const view=this.getActiveMarkdownView?.();const raw=view?.file?.path===state.file.path&&view.editor?view.editor.getValue():await plugin.app.vault.cachedRead(state.file);const {blocks:objects,numbers}=scientificIndex(plugin.app).get(state.file.path,raw);const entries=objects.map(b=>{const v=b.value,type=v.kind,displayType=type==='figure'?'Figure':'Table',number=numbers.get(v.id),title=v.title||v.caption;return {scientific:true,type,rawType:type,displayType,title,line:b.line,depth:1,nesting:0,collapsed:false,number:number?Number(number):null,label:displayType+(number?' '+number:'')+(title?': '+title:''),titleMismatch:false,rawTitle:title,isManual:true,isManualByDefault:true};});return {...state,callouts:[...state.callouts,...entries].sort((a:any,b:any)=>a.line-b.line)};};
  const originalDecorate=outline.decorateRenderedCallouts;const decorate=function(this:any){if(this.currentState?.callouts?.length&&this.currentState.callouts.every((c:any)=>c.scientific)){this.clearDecorateRetry?.();return;}return originalDecorate?.call(this);};outline.decorateRenderedCallouts=decorate;outline.getActiveMarkdownState=wrapped;restore=()=>{if(outline.decorateRenderedCallouts===decorate)outline.decorateRenderedCallouts=originalDecorate;if(outline.getActiveMarkdownState===wrapped)outline.getActiveMarkdownState=original;void outline.refreshView?.();};void outline.refreshView?.();
 };
 plugin.app.workspace.onLayoutReady(attach);plugin.registerEvent(plugin.app.workspace.on('layout-change',attach));plugin.register(()=>restore?.());
}
