import {App, Component, TFile} from 'obsidian';
/** Native PDF embed adapter. Obsidian's registry is internal; keep it isolated and
 * validate it so a host update fails visibly rather than leaving a blank window. */
export async function mountPDF(app:App,containerEl:HTMLElement,file:TFile,page:number,height:number,owner:Component){
 const factory=(app as any).embedRegistry?.embedByExtension?.pdf;
 if(typeof factory!=='function')throw Error('This Obsidian version does not expose its PDF viewer. Open the source PDF instead.');
 const embed=factory({app,containerEl,sourcePath:file.path,linktext:file.path},file,`#page=${page}&height=${height}`);
 if(!embed||typeof embed.loadFile!=='function')throw Error('The PDF viewer API has changed. Open the source PDF instead.');
 owner.addChild(embed);
 await embed.loadFile();
 // The host wrapper converts page links to fit-width destinations. Apply the
 // native viewer hash after loading so the whole page fits our compact window.
 embed.viewer?.then((child:any)=>{
  child.pdfViewer?.applySubpath(`page=${page}&zoom=page-fit`);
 });
}
