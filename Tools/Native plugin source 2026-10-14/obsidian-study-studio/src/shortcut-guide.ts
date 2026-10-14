import {App,Modal,Plugin} from 'obsidian';
type Binding={modifiers:string[];key:string};
export function registerShortcutGuide(plugin:Plugin){plugin.addCommand({id:'shortcut-guide',name:'Open keyboard shortcut guide',hotkeys:[{modifiers:['Mod','Alt'],key:'/'}],callback:()=>new ShortcutGuide(plugin.app).open()});}
class ShortcutGuide extends Modal {
 onOpen(){this.titleEl.setText('Keyboard shortcuts');
 // Obsidian exposes no public registry API. Guard the read-only runtime adapter.
 const runtime=this.app as App&{commands?:{listCommands?:()=>{id:string;name:string;hotkeys?:Binding[]}[]};hotkeyManager?:{customKeys?:Record<string,Binding[]>}};
 const commands=runtime.commands?.listCommands?.()??[],overrides=runtime.hotkeyManager?.customKeys??{};
 const bar=this.contentEl.createDiv('study-actions');let tab='study',page=0;
 const search=bar.createEl('input',{type:'search',attr:{placeholder:'Search commands','aria-label':'Search keyboard shortcuts'}}),list=this.contentEl.createDiv(),nav=this.contentEl.createDiv('study-actions');
 const render=()=>{list.empty();nav.empty();const rows=commands.filter(c=>(tab==='all'||c.id.startsWith('study-studio:'))&&(c.name+' '+c.id).toLowerCase().includes(search.value.toLowerCase())).sort((a,b)=>a.name.localeCompare(b.name));const pages=Math.max(1,Math.ceil(rows.length/12));page=Math.min(page,pages-1);
 for(const c of rows.slice(page*12,page*12+12)){const bindings=Object.hasOwn(overrides,c.id)?overrides[c.id]:c.hotkeys??[];const row=list.createDiv('study-shortcut-row');row.createEl('span',{text:c.name});row.createEl('kbd',{text:bindings.length?bindings.map(h=>[...h.modifiers,h.key].join('+')).join(' / '):'Unassigned'});}
 nav.createEl('span',{text:`Page ${page+1} of ${pages} · ${rows.length} commands`});const prev=nav.createEl('button',{text:'Previous'}),next=nav.createEl('button',{text:'Next'});prev.disabled=page===0;next.disabled=page>=pages-1;prev.onclick=()=>{page--;render();};next.onclick=()=>{page++;render();};
 };for(const [id,label]of [['study','Study Studio'],['all','All Obsidian commands']])bar.createEl('button',{text:label}).onclick=()=>{tab=id;page=0;render();};search.oninput=()=>{page=0;render();};
 this.contentEl.createEl('p',{text:'Mod means Command on Mac and Control on Windows/Linux. Assign global shortcuts in Settings → Hotkeys. This guide uses active commands and vault overrides; unavailable registries show no commands.'});
 this.contentEl.createEl('p',{text:'Inside Study Studio: pickers use typing, ↑/↓, Enter and Escape. Question editor: Option/Alt+Enter adds a choice; Ctrl+Space opens choice actions; Ctrl+Enter saves; Ctrl+Shift+Enter saves and opens the note; Ctrl+M edits math; Ctrl+Shift+M inserts display math; Ctrl+Shift+B makes a blank. Table editor: Alt+Enter inserts a row; Alt+Shift+Enter inserts a column; Alt+Backspace deletes the focused row; Alt+Shift+Backspace deletes the focused column. Ctrl+Shift+B toggles Given / formatting; Alt+arrows move between cells. Practice card: Ctrl+Space opens numbered question actions. Remove multiple questions activates in-note checkboxes: arrows move, Space selects, Ctrl+Enter reviews, Escape cancels. Guide: Alt+←/→ changes page. Tab moves between controls.'});
 this.scope.register(['Alt'],'ArrowLeft',()=>{page=Math.max(0,page-1);render();return false;});this.scope.register(['Alt'],'ArrowRight',()=>{page++;render();return false;});render();search.focus();
 }
}
