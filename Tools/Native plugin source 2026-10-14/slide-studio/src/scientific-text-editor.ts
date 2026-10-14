import {App,Menu,Modal,Notice} from 'obsidian';
import {MathField} from './scientific-math-field';

/** One on-demand preview/editor, rather than a renderer for every table cell. */
export class ScientificTextEditor extends Modal {
 private math?:MathField;private busy=false;
 constructor(app:App,private input:HTMLTextAreaElement,private path:string,private launchMath=false,private display=false){super(app);}
 onOpen(){
  this.modalEl.addClass('ss-scientific-text-editor');this.titleEl.setText('Text and math');
  const original=this.input.value,from=this.input.selectionStart??original.length,to=this.input.selectionEnd??from;
  this.contentEl.createEl('p',{cls:'ss-hint',text:'Markdown and LaTeX. Click a preview equation or press Ctrl+M to edit or insert inline math; Ctrl+Shift+M inserts display math. Finish the equation, then apply this text. Esc cancels.'});
  const text=this.contentEl.createEl('textarea',{attr:{'aria-label':'Scientific text and math',rows:'6'}});text.value=original;
  this.math=new MathField(this.app,text,this.path,false,()=>{},active=>this.busy=active);this.math.load();
  const save=()=>{if(this.busy){new Notice('Finish or cancel the equation before applying this text.');return;}if(!this.input.isConnected||this.input.value!==original){new Notice('The original field changed. Copy this draft before closing and reopening it.');return;}
   this.input.value=text.value;this.input.dispatchEvent(new this.input.ownerDocument.defaultView!.Event('input',{bubbles:true}));this.close();};
  const footer=this.contentEl.createDiv({cls:'ss-scientific-save'});footer.createEl('button',{text:'Cancel'}).onclick=()=>this.close();footer.createEl('button',{text:'Apply',cls:'mod-cta'}).onclick=save;
  this.scope.register(['Mod'],'Enter',()=>{save();return false;});
  text.focus();text.setSelectionRange(from,to);if(this.launchMath)void this.math.openAtCursor(this.display);
 }
 onClose(){this.math?.unload();this.input.focus();}
}

export function scientificMathMenu(menu:Menu,app:App,input:HTMLTextAreaElement,path:string){
 menu.addItem(i=>i.setTitle('Edit text and math…').setIcon('sigma').onClick(()=>new ScientificTextEditor(app,input,path).open()));
}
export function scientificMathInput(app:App,input:HTMLTextAreaElement,path:string,ownMenu=true){
 input.addEventListener('keydown',e=>{if(e.ctrlKey&&e.code==='KeyM'){e.preventDefault();e.stopPropagation();new ScientificTextEditor(app,input,path,true,e.shiftKey).open();}});
 if(ownMenu){const show=(e:MouseEvent|KeyboardEvent)=>{e.preventDefault();e.stopPropagation();const menu=new Menu();scientificMathMenu(menu,app,input,path);const rect=input.getBoundingClientRect();menu.showAtPosition({x:rect.left+20,y:rect.top+20});};input.addEventListener('contextmenu',show);input.addEventListener('keydown',e=>{if(e.shiftKey&&e.key==='F10')show(e);});}
}
