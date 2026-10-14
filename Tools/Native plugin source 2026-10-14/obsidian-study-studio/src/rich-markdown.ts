import {App,Component,MarkdownRenderer,Keymap} from 'obsidian';
import {imageSpans,imageAlignment} from './rich-blocks';
/** Obsidian renders HTML blocks separately, so apply each saved image alignment
 * to the resolved image after its native Markdown render. */
export const RichMarkdown={async render(app:App,source:string,host:HTMLElement,path:string,owner:Component,options:{reuseLeaf?:boolean}={}){
 await MarkdownRenderer.render(app,source,host,path,owner);
 // Custom Study Studio views do not inherit MarkdownView's internal-link handler.
 // Keep the complete link text (including a heading or block fragment) and the
 // originating note path so Obsidian resolves the same destination as a note.
 for(const link of Array.from(host.querySelectorAll<HTMLAnchorElement>('a.internal-link'))){
  owner.registerDomEvent(link,'click',(event:MouseEvent)=>{
   if(event.button!==0)return;
   const target=link.getAttribute('data-href')??link.getAttribute('href');
   if(!target)return;
   event.preventDefault();event.stopPropagation();
   void app.workspace.openLinkText(target,path,options.reuseLeaf?Keymap.isModEvent(event):true);
  },{capture:true});
 }

 const images=Array.from(host.querySelectorAll('img'));
 imageSpans(source).forEach((span,index)=>{if(!span.raw.startsWith('<div class="study-image-align-'))return;const img=images[index];if(!img)return;const alignment=imageAlignment(span.raw),embed=img.closest<HTMLElement>('.internal-embed');
  if(embed){embed.style.display='block';embed.style.width='100%';}
  img.style.display='block';img.style.setProperty('margin-left',alignment==='left'?'0':'auto','important');img.style.setProperty('margin-right',alignment==='right'?'0':'auto','important');
 });
}};
