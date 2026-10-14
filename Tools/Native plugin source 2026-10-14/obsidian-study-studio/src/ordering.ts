import {RichMarkdown} from './rich-markdown';
import {App,Component,MarkdownRenderer} from 'obsidian';
import {Question} from './model';
export async function orderingField(app:App,parent:HTMLElement,q:Question,initial:string[],owner:Component,changed:(ids:string[])=>void){
 let ids=[...initial],locked=false;let confirm:HTMLButtonElement|undefined;const blocked=()=>locked||!confirm||confirm.disabled;
 const root=parent.createDiv('study-ordering');root.createEl('p',{text:'Arrange the steps. Use Alt+↑ / Alt+↓ on a step, the arrow buttons, or drag its handle. Confirm order also accepts an unchanged sequence.'});
 const list=root.createEl('ol'),status=root.createDiv({attr:{'aria-live':'polite'}}),rows=new Map<string,HTMLLIElement>(),buttons:HTMLButtonElement[]=[];let dragged:string|undefined;
 const arrange=()=>{ids.forEach((id,i)=>{const row=rows.get(id)!;list.append(row);row.setAttribute('aria-label',`Step ${i+1} of ${ids.length}`);row.querySelector('.study-order-position')!.textContent=String(i+1);const [up,down]=Array.from(row.querySelectorAll<HTMLButtonElement>('button'));up.disabled=locked||i===0;down.disabled=locked||i===ids.length-1;});};
 const move=(id:string,to:number)=>{if(blocked())return;const from=ids.indexOf(id);to=Math.max(0,Math.min(ids.length-1,to));if(from===to)return;ids.splice(from,1);ids.splice(to,0,id);arrange();rows.get(id)!.focus();changed([...ids]);status.setText(`Moved to position ${to+1}.`);};
 for(const id of ids){const row=list.createEl('li',{cls:'study-order-step',attr:{tabindex:'0'}});rows.set(id,row);row.createSpan({cls:'study-order-position'});const handle=row.createSpan({text:'⠿',cls:'study-order-handle',attr:{title:'Drag to reorder'}});
 handle.onpointerdown=e=>{if(blocked()||e.button!==0)return;e.preventDefault();e.stopPropagation();handle.setPointerCapture(e.pointerId);dragged=id;
 const clear=()=>{rows.forEach(r=>r.removeClass('study-order-drop'));handle.onpointermove=null;handle.onpointerup=null;handle.onpointercancel=null;dragged=undefined;};
 const target=(ev:PointerEvent)=>{const hit=root.ownerDocument.elementFromPoint(ev.clientX,ev.clientY)?.closest('li');return [...rows].find(([,r])=>r===hit)?.[0];};
 handle.onpointermove=ev=>{rows.forEach(r=>r.removeClass('study-order-drop'));const to=target(ev);if(to)rows.get(to)!.addClass('study-order-drop');};
 handle.onpointerup=ev=>{const to=target(ev);if(to)move(id,ids.indexOf(to));clear();};handle.onpointercancel=clear;
 };

 const body=row.createDiv('markdown-rendered');await RichMarkdown.render(app,q.definition.choices!.find(c=>c.id===id)!.text,body,q.path,owner);
 const up=row.createEl('button',{text:'↑',attr:{'aria-label':'Move step up'}}),down=row.createEl('button',{text:'↓',attr:{'aria-label':'Move step down'}});buttons.push(up,down);up.onclick=()=>move(id,ids.indexOf(id)-1);down.onclick=()=>move(id,ids.indexOf(id)+1);
 row.onkeydown=e=>{if(e.altKey&&['ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();e.stopPropagation();move(id,ids.indexOf(id)+(e.key==='ArrowUp'?-1:1));}};
 }
 confirm=root.createEl('button',{text:'Confirm order'});confirm.onclick=()=>{changed([...ids]);status.setText('Order recorded. You can still rearrange it before submitting.');};arrange();
 return {buttons:[...buttons,confirm],solution:(expected:string[])=>{locked=true;ids=[...expected];arrange();confirm!.disabled=true;status.setText('Correct sequence shown.');}};
}
