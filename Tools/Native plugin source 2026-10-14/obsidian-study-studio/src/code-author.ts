import {Component,Notice} from 'obsidian';
import {Definition} from './model';
import {codeLanguages,makeCodeBlank,fillCode,codeMarkers} from './code-model';
import {renderCode} from './code-render';
export function codeAuthor(root:HTMLElement,d:Definition,owner:Component){
 root.createEl('h3',{text:'Code and blanks'});root.createEl('p',{text:'Paste code, select a keyword, expression, lines or block, then Ctrl+Shift+B makes a blank. Each accepted alternative has its own multiline field. Tab moves between fields; use spaces for indentation. Source edits are checked when saving.'});
 const language=root.createEl('select',{attr:{'aria-label':'Code language'}});for(const [value,text]of Object.entries(codeLanguages))language.createEl('option',{value,text});language.value=d.code!.language;
 const source=root.createEl('textarea',{cls:'study-code-source',attr:{'aria-label':'Code source',spellcheck:'false'}});source.value=d.code!.source;source.rows=12;
 const make=root.createEl('button',{text:'Make selected code a blank · Ctrl+Shift+B'}),preview=root.createDiv(),rules=root.createDiv();let generation=0,timer:ReturnType<typeof setTimeout>|undefined,closed=false;
 owner.register(()=>{closed=true;generation++;if(timer)clearTimeout(timer);});
 const refresh=()=>{if(timer)clearTimeout(timer);timer=setTimeout(()=>{const gen=++generation;const staging=root.ownerDocument.createElement('div');void renderCode(staging,d.code!,(host,id)=>host.createSpan({text:`[${codeMarkers(d.code!.source).findIndex(m=>m.id===id)+1}]`,cls:'study-code-placeholder'})).then(()=>{if(!closed&&generation===gen){preview.empty();preview.append(staging);}},e=>{if(!closed&&generation===gen)preview.setText(String(e));});},100);};
 const field=(parent:HTMLElement,label:string,value:string,changed:(v:string)=>void)=>{parent.createEl('label',{text:label});const input=parent.createEl('textarea',{cls:'study-code-source',attr:{'aria-label':label,spellcheck:'false'}});input.value=value;input.rows=Math.max(2,Math.min(12,value.split('\n').length));input.oninput=()=>changed(input.value);return input;};
 const drawRules=()=>{rules.empty();for(const [index,a]of d.answers!.slice().sort((a,b)=>codeMarkers(d.code!.source).findIndex(m=>m.id===a.id)-codeMarkers(d.code!.source).findIndex(m=>m.id===b.id)).entries()){
  const box=rules.createDiv('study-author-answer');box.createEl('h4',{text:`Code blank ${index+1} (${a.id})`});
  const policy=box.createEl('select',{attr:{'aria-label':`Whitespace rule: blank ${index+1}`}});policy.createEl('option',{value:'exact',text:'Exact whitespace (line endings normalized)'});policy.createEl('option',{value:'trim-outer',text:'Ignore leading/trailing whitespace only'});policy.value=a.whitespace??'exact';policy.onchange=()=>a.whitespace=policy.value as 'exact'|'trim-outer';
  a.accepted.forEach((value,i)=>{field(box,`Blank ${index+1}, alternative ${i+1}`,value,v=>a.accepted[i]=v);if(a.accepted.length>1)box.createEl('button',{text:`Remove alternative ${i+1}`}).onclick=()=>{a.accepted.splice(i,1);drawRules();};});
  box.createEl('button',{text:'Add accepted alternative'}).onclick=()=>{a.accepted.push('');drawRules();};
  box.createEl('button',{text:`Restore blank ${index+1} to code`}).onclick=()=>{d.code!.source=fillCode(d.code!.source,{[a.id]:a.accepted[0]??''});source.value=d.code!.source;d.answers=d.answers!.filter(x=>x!==a);drawRules();refresh();};
 }};
 const add=()=>{try{const id=`code-${crypto.randomUUID().slice(0,8)}`,from=source.selectionStart,result=makeCodeBlank(source.value,from,source.selectionEnd,id);d.code!.source=result.source;source.value=result.source;d.answers!.push({id,accepted:[result.answer],whitespace:'exact',caseSensitive:true});drawRules();refresh();source.focus();source.setSelectionRange(from,from+`{{blank:${id}}}`.length);}catch(e){new Notice(String(e));}};
 source.oninput=()=>{d.code!.source=source.value;refresh();};source.onkeydown=e=>{if(e.ctrlKey&&e.shiftKey&&e.code==='KeyB'){e.preventDefault();e.stopPropagation();add();}};make.onclick=add;language.onchange=()=>{d.code!.language=language.value as keyof typeof codeLanguages;refresh();};drawRules();refresh();
}
