import {prepareCitations,CitationContext} from './citation-context';
const thumbnailCitations=new WeakMap<object,Promise<CitationContext>>();
import { outlinePlan } from './outlines';
import { previewOutline } from './outline-render';
import { Component, Modal, Notice, Menu } from 'obsidian';
import type { StudioView } from './view';
import { Deck, Section, Slide, Entry, clone, uuid, sectionAt, themeForSlide, slidePageNumber, trashSlide } from './model';
import { ensureSections, createSection, descendants, moveSection, moveSlidesTo, setSectionFooter, orderSlides, fragment, positionSlides, positionSection } from './sections';
import { element, button, input, renderSlide } from './render';
import { RecordDoc } from './store';
import { gridSlot } from './organizer-layout';

export function thumbnail(view: StudioView, parent: HTMLElement, deck: Deck, records: (RecordDoc|null)[], index: number, owner: Component, root: HTMLElement) {
  const thumb = element(parent,'div','ss-thumbnail'); thumb.setAttribute('aria-hidden','true');
  const record = records[index];
  if (record?.doc.kind !== 'slide') { thumb.textContent = 'Missing slide'; return; }
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(e => e.isIntersecting)) return;
    observer.disconnect();
    const miniature = element(thumb,'div','ss-stage');
    const scale = () => miniature.style.transform = `scale(${thumb.clientWidth / 1600})`;
    const resize = new ResizeObserver(scale); resize.observe(thumb); owner.register(() => resize.disconnect());
    let ctx=thumbnailCitations.get(records);if(!ctx){ctx=prepareCitations(view.app,records,undefined,deck.bibliography);thumbnailCitations.set(records,ctx);}
    void ctx.then(citations=>renderSlide(view.app, miniature, record.doc as Slide, record.file.path, owner, themeForSlide(deck,record.doc as Slide),
      sectionAt(deck,index,records.map(r => r?.doc.kind === 'slide' ? r.doc : null)),
      slidePageNumber(deck.theme,records.map(r => r?.doc.kind === 'slide' ? r.doc : null),index),undefined,citations)).then(scale).catch(() => thumb.textContent='Preview unavailable');
  }, {root,rootMargin:'200px'});
  observer.observe(thumb); owner.register(() => observer.disconnect());
}
function prompt(view: StudioView, title: string, initial: string, done: (text:string)=>void) {
  const modal = new Modal(view.app); modal.titleEl.textContent=title;
  let value=initial;
  input(modal.contentEl,'Name',initial,v=>value=v);
  button(modal.contentEl,'Save',()=>{ if(value.trim()){done(value.trim());modal.close();} },'mod-cta'); modal.open();
}
export function newSectionDialog(view: StudioView, deck: Deck) { prompt(view,'New section','',name=>view.change(()=>createSection(deck,name))); }
export async function drawOrganizer(view: StudioView, deck: Deck, ticket: number) {
  const records = await view.plugin.store.resolveMany(deck.slides);
  if (ticket !== view.revision) return;
  view.outlineRecords = records;
  const plan=outlinePlan(deck,records.map(r=>r?.doc.kind==='slide'?r.doc:null));
  const host = view.body;
  host.classList.add('ss-organizer');host.replaceChildren();
  const tools=element(host,'div','ss-organizer-tools');
  button(tools,'+ Section',()=>prompt(view,'New section','',name=>view.change(()=>createSection(deck,name))));
  button(tools,'Group selected',()=>{
    if (!view.selectedSlides.size) return new Notice('Select slides first.');
    groupSlidesDialog(view,deck);
  });
  button(tools,'Move selected…',()=>{
    if (!view.selectedSlides.size) return new Notice('Select slides first.');
    moveSlidesDialog(view,deck);
  });
  button(tools,'Trash selected',()=>view.change(()=>{
    [...view.selectedSlides].sort((a,b)=>b-a).forEach(i=>trashSlide(deck,i));view.selectedSlides.clear();
  })).disabled=!view.selectedSlides.size;
  button(tools,'Collapse all',()=>{view.collapsedSections=new Set(deck.sections?.map(g=>g.id));void view.draw();});
  button(tools,'Expand all',()=>{view.collapsedSections.clear();void view.draw();});
  const zoom=element(tools,'input');zoom.type='range';zoom.min='100';zoom.max='240';zoom.value=String(view.organizerZoom);
  zoom.setAttribute('aria-label','Thumbnail size');
  zoom.oninput=()=>{view.organizerZoom=Number(zoom.value);host.style.setProperty('--ss-card-width',`${zoom.value}px`);};
  zoom.onchange=()=>void view.draw();
  host.style.setProperty('--ss-card-width',`${view.organizerZoom}px`);
  element(tools,'span','ss-hint',`${view.selectedSlides.size} selected · ⌘-click / Shift-click`);
  element(host,'div','ss-organizer-instructions','Drag to reorder · ⌘/Option-click to select · section numbers open precise move controls');
  const canvas=element(host,'div','ss-organizer-canvas');
  canvas.scrollTop=view.organizerScroll;
  canvas.addEventListener('scroll',()=>view.organizerScroll=canvas.scrollTop);
  const owner=view.renderOwner!;
  const change=(fn:()=>void)=>{view.change(fn);};
  const renderGroup=(g:Section,parent:HTMLElement,depth:number,number:string)=>{
    const group=element(parent,'section','ss-organizer-section');group.dataset.group=g.id;
    const head=element(group,'div','ss-organizer-section-head');head.dataset.group=g.id;
    const folded=view.collapsedSections.has(g.id);
    button(head,folded?'▸':'▾',()=>{folded?view.collapsedSections.delete(g.id):view.collapsedSections.add(g.id);void view.draw();}).setAttribute('aria-label',`${folded?'Expand':'Collapse'} ${g.title}`);
    const numberButton=button(head,number,()=>moveSectionDialog(view,deck,g),'ss-section-number');numberButton.setAttribute('aria-label',`Move section ${number}: ${g.title}`);
    const label=element(head,'span','ss-organizer-section-title',g.title);label.title='Drag to reorder sections';
    const all=descendants(deck,g.id), indices=deck.slides.map((_,i)=>i).filter(i=>all.has(deck.slides[i].sectionId!));
    const groupSelect=element(head,'input');groupSelect.type='checkbox';groupSelect.checked=indices.length>0&&indices.every(i=>view.selectedSlides.has(i));groupSelect.indeterminate=indices.some(i=>view.selectedSlides.has(i))&&!groupSelect.checked;groupSelect.setAttribute('aria-label',`Select slides in ${g.title}`);groupSelect.onchange=()=>{indices.forEach(i=>groupSelect.checked?view.selectedSlides.add(i):view.selectedSlides.delete(i));void view.draw();};
    element(head,'span','ss-hint',`${indices.length} slide${indices.length === 1 ? '' : 's'}`);
    const outline=plan.pages.find(p=>p.kind==='outline'&&p.sectionId===g.id);
    if(outline?.kind==='outline')button(head,'Outline',()=>{const rec=records[outline.beforeIndex];previewOutline(view.app,plan.deck,outline,view.record!.file.path,rec?.doc.kind==='slide'?themeForSlide(deck,rec.doc):deck.theme);}).setAttribute('aria-label',`Preview outline for ${g.title}`);
    button(head,'Footer…',()=>editSection(view,deck,g));
    const sectionMenu=(event?:MouseEvent)=>{
      const menu=new Menu();
      const action=(name:string,fn:()=>void)=>menu.addItem(i=>i.setTitle(name).onClick(fn));
      action('Edit section footer…',()=>editSection(view,deck,g));
      action(folded?'Expand section':'Collapse section',()=>{folded?view.collapsedSections.delete(g.id):view.collapsedSections.add(g.id);void view.draw();});
      action('Rename section',()=>prompt(view,'Rename section',g.title,name=>change(()=>g.title=name)));
      action('Add subsection',()=>prompt(view,'New subsection','',name=>change(()=>createSection(deck,name,[],g.id))));
      action('Select all slides in section',()=>{view.selectedSlides=new Set(indices);void view.draw();});
      action('Move to position…',()=>moveSectionDialog(view,deck,g));
      action('Move section into…',()=>chooseSection(view,deck,id=>change(()=>moveSection(deck,g.id,id,true)),all));
      action('Move to top level',()=>change(()=>moveSection(deck,g.id)));
      action('Bring slides into this section…',()=>void browsePresentations(view,g.id));
      action('Move section slides to trash',()=>change(()=>{indices.reverse().forEach(i=>trashSlide(deck,i));view.selectedSlides.clear();}));
      if(!indices.length) action('Remove empty section',()=>change(()=>{deck.sections=deck.sections!.filter(s=>!all.has(s.id));}));
      menu.addSeparator();view.addStudioMenuItems(menu);
      if(event)menu.showAtMouseEvent(event);else{const r=more.getBoundingClientRect();menu.showAtPosition({x:r.left,y:r.bottom});}
    };
    const more=button(head,'⋯',()=>sectionMenu());
    head.addEventListener('contextmenu',event=>{event.preventDefault();event.stopPropagation();sectionMenu(event);});
    attachDrag(view,head,canvas,ticket,{group:g.id},deck);
    if(folded)return;
    const grid=element(group,'div','ss-organizer-grid');grid.dataset.group=g.id;
    const direct=deck.slides.map((_,i)=>i).filter(i=>deck.slides[i].sectionId===g.id);
    if(!direct.length)element(grid,'p','ss-organizer-empty','Drop slides here');
    direct.forEach(i=>{
      const card=element(grid,'div','ss-organizer-card');card.dataset.slide=String(i);card.dataset.group=g.id;card.tabIndex=0;
      card.setAttribute('role','button');card.setAttribute('aria-label',`Slide ${i+1}: ${records[i]?.doc.title ?? 'Missing slide'}`);
      card.classList.toggle('is-selected',view.selectedSlides.has(i));card.setAttribute('aria-pressed',String(view.selectedSlides.has(i)));
      thumbnail(view,card,deck,records,i,owner,canvas);
      const caption=element(card,'div','ss-thumbnail-caption');
      const number=button(caption,String(i+1),()=>{if(!view.selectedSlides.has(i))view.selectedSlides=new Set([i]);moveSlidesDialog(view,deck);},'ss-slide-position');number.setAttribute('aria-label',`Move slide ${i+1} to position`);
      const title=element(caption,'span','ss-thumbnail-title',records[i]?.doc.title??'Missing slide');title.title=title.textContent!;
      let timer=0;
      card.onclick=e=>{
        if((e.target as HTMLElement).closest('button'))return;
        if(card.dataset.dragged==='true'){delete card.dataset.dragged;return;}
        timer=window.setTimeout(()=>{
          if(ticket!==view.revision)return;
          if(e.shiftKey){view.selectedSlides=new Set(Array.from({length:Math.abs(i-view.selectionAnchor)+1},(_,n)=>Math.min(i,view.selectionAnchor)+n));}
          else if(e.metaKey||e.ctrlKey||e.altKey){view.selectedSlides.has(i)?view.selectedSlides.delete(i):view.selectedSlides.add(i);view.selectionAnchor=i;}
          else{view.selectedSlides=new Set([i]);view.selectionAnchor=i;}
          view.index=i;void view.draw();
        },180);
      };
      card.addEventListener('mousedown',()=>clearTimeout(timer));
      owner.register(()=>clearTimeout(timer));
      card.ondblclick=e=>{if((e.target as HTMLElement).closest('button'))return;clearTimeout(timer);view.index=i;view.organizing=false;void view.draw();};
      card.onkeydown=e=>{
        if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='a'){e.preventDefault();view.selectedSlides=new Set(deck.slides.map((_,n)=>n));void view.draw();}
        if(e.shiftKey&&['ArrowLeft','ArrowRight'].includes(e.key)){
          e.preventDefault();const end=Math.max(0,Math.min(deck.slides.length-1,i+(e.key==='ArrowLeft'?-1:1)));
          view.selectedSlides=new Set(Array.from({length:Math.abs(end-view.selectionAnchor)+1},(_,n)=>Math.min(end,view.selectionAnchor)+n));view.index=end;void view.draw();
        }
        if(e.key==='Enter'){view.index=i;view.organizing=false;void view.draw();}
        if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();change(()=>{
          const indices=view.selectedSlides.has(i)?[...view.selectedSlides]:[i];indices.sort((a,b)=>b-a).forEach(n=>trashSlide(deck,n));view.selectedSlides.clear();
        });}
      };
      attachDrag(view,card,canvas,ticket,{slides:view.selectedSlides.has(i)?[...view.selectedSlides]:[i]},deck);
    });
    const children=element(group,'div','ss-organizer-children');
    deck.sections!.filter(s=>s.parent===g.id).forEach((s,i)=>renderGroup(s,children,depth+1,`${number}.${i+1}`));
  };
  deck.sections?.filter(g=>!g.parent).forEach((g,i)=>renderGroup(g,canvas,0,String(i+1)));
  if(!deck.sections?.length)element(canvas,'p','ss-hint','Create a section or bring in slides from another presentation.');
  canvas.scrollTop=view.organizerScroll;
  if(view.selectedSlides.size) canvas.querySelector<HTMLElement>(`[data-slide="${view.index}"]`)?.focus({preventScroll:true});
}
export function groupSlidesDialog(view:StudioView,deck:Deck){
  const entries=deck.slides.filter((_,i)=>view.selectedSlides.has(i));
  const modal=new Modal(view.app);modal.titleEl.textContent='Group selected slides';const revision=view.revision;
  let title='';input(modal.contentEl,'Section name','',v=>title=v);
  element(modal.contentEl,'p','ss-hint','Choose Top level for a new section, or an existing section to create a subsection.');
  const parent=sectionChoices(modal.contentEl,deck,new Set(),true);parent.value='';
  button(modal.contentEl,'Create group',()=>{
    if(!title.trim())return;
    if(view.revision!==revision||view.doc!==deck){new Notice('Presentation changed. Reopen Group selected.');modal.close();return;}
    view.change(()=>{createSection(deck,title,entries.map(e=>deck.slides.indexOf(e)),parent.value||undefined);view.selectedSlides=new Set(entries.map(e=>deck.slides.indexOf(e)));view.index=deck.slides.indexOf(entries[0]);});modal.close();
  },'mod-cta');modal.open();
}
function sectionChoices(parent:HTMLElement,deck:Deck,excluded=new Set<string>(),topLevel=false) {
  const select=element(parent,'select');select.setAttribute('aria-label',topLevel?'Parent section':'Destination section');
  if(topLevel){const o=element(select,'option','','Top level');o.value='';}
  const visit=(id:string|undefined,prefix:string)=>{
    (deck.sections??[]).filter(g=>g.parent===id).forEach((g,i)=>{
      const number=prefix?`${prefix}.${i+1}`:String(i+1);
      if(!excluded.has(g.id)){const o=element(select,'option','',`${number} · ${g.title}`);o.value=g.id;visit(g.id,number);}
    });
  };
  visit(undefined,'');return select;
}
export function moveSlidesDialog(view:StudioView,deck:Deck){
  const entries=deck.slides.filter((_,i)=>view.selectedSlides.has(i));if(!entries.length)return;
  const modal=new Modal(view.app);modal.titleEl.textContent=`Move ${entries.length===1?'slide':`${entries.length} slides`}`;
  const revision=view.revision;
  element(modal.contentEl,'p','','Choose a section and the first position for your selection. Other slides shift to make room.');
  const destination=sectionChoices(modal.contentEl,deck);destination.value=entries[0].sectionId!;
  const label=element(modal.contentEl,'label','ss-field');element(label,'span','','Position within section');
  const position=element(label,'input');position.type='number';position.min='1';position.step='1';position.setAttribute('aria-label','Position within section');
  const hint=element(modal.contentEl,'p','ss-hint');
  const update=()=>{const remaining=deck.slides.filter(e=>e.sectionId===destination.value&&!entries.includes(e));position.max=String(remaining.length+1);position.value='1';hint.textContent=`1–${remaining.length+1}. Selected slides stay together in their current order; subsections follow the section’s direct slides.`;};
  destination.onchange=update;update();
  button(modal.contentEl,'Move',()=>{
    if(view.revision!==revision||view.doc!==deck){new Notice('Presentation changed. Reopen Move.');modal.close();return;}
    const n=Number(position.value);if(!Number.isInteger(n)||n<1||n>Number(position.max)){new Notice(`Choose a position from 1 to ${position.max}.`);return;}
    view.change(()=>{positionSlides(deck,entries.map(e=>deck.slides.indexOf(e)),destination.value,n);view.selectedSlides=new Set(entries.map(e=>deck.slides.indexOf(e)));view.index=deck.slides.indexOf(entries[0]);});modal.close();
  },'mod-cta');modal.open();
}
function moveSectionDialog(view:StudioView,deck:Deck,g:Section){
  const modal=new Modal(view.app);modal.titleEl.textContent=`Move section · ${g.title}`;const revision=view.revision;
  element(modal.contentEl,'p','','Move the section with all its slides and subsections. Choose Top level to promote a subsection.');
  const parent=sectionChoices(modal.contentEl,deck,descendants(deck,g.id),true);parent.value=g.parent??'';
  const label=element(modal.contentEl,'label','ss-field');element(label,'span','','Section position');
  const position=element(label,'input');position.type='number';position.min='1';position.step='1';position.setAttribute('aria-label','Section position');
  const mode=element(modal.contentEl,'select');mode.setAttribute('aria-label','Move or swap');
  for(const [value,text] of [['move','Insert here — shift other sections'],['swap','Swap with the section at this position']]){const o=element(mode,'option','',text);o.value=value;}
  const hint=element(modal.contentEl,'p','ss-hint');
  const update=()=>{const same=(parent.value||undefined)===g.parent;mode.options[1].disabled=!same;if(!same)mode.value='move';const count=deck.sections!.filter(s=>s.parent===(parent.value||undefined)&&s.id!==g.id).length+1;position.max=String(count);position.value='1';hint.textContent=`Positions 1–${count} under the chosen parent. Swap is available between sections with the same parent.`;};
  parent.onchange=update;update();position.value=String(deck.sections!.filter(s=>s.parent===g.parent).indexOf(g)+1);
  button(modal.contentEl,'Apply',()=>{
    if(view.revision!==revision||view.doc!==deck){new Notice('Presentation changed. Reopen Move.');modal.close();return;}
    const n=Number(position.value);if(!Number.isInteger(n)||n<1||n>Number(position.max)){new Notice(`Choose a position from 1 to ${position.max}.`);return;}
    const selected=[...view.selectedSlides].map(i=>deck.slides[i]),current=deck.slides[view.index];
    view.change(()=>{positionSection(deck,g.id,parent.value||undefined,n,mode.value==='swap');view.selectedSlides=new Set(selected.map(e=>deck.slides.indexOf(e)));view.index=Math.max(0,deck.slides.indexOf(current));});modal.close();
  },'mod-cta');modal.open();
}
function chooseSection(view: StudioView, deck: Deck, done:(id:string)=>void, excluded=new Set<string>()) {
  const modal=new Modal(view.app);modal.titleEl.textContent='Choose section';
  for(const g of deck.sections??[])if(!excluded.has(g.id)){
    let label=g.title, p=g.parent;
    while(p){const parent=deck.sections!.find(s=>s.id===p)!;label=parent.title+' / '+label;p=parent.parent;}
    button(modal.contentEl,label,()=>{modal.close();done(g.id);});
  }
  modal.open();
}
function editSection(view:StudioView,deck:Deck,g:Section){
  const modal=new Modal(view.app);modal.titleEl.textContent=`Section · ${g.title}`;
  let title=g.title, footer=g.footer??'', inherit=g.footer===undefined, throughout=false;
  input(modal.contentEl,'Section name',title,v=>title=v);
  input(modal.contentEl,'Footer text',footer,v=>{footer=v;inherit=false;const check=modal.contentEl.querySelector<HTMLInputElement>('input[type=checkbox]');if(check)check.checked=false;});
  const check=(label:string,value:boolean,set:(v:boolean)=>void)=>{const row=element(modal.contentEl,'label','ss-field');const c=element(row,'input');c.type='checkbox';c.checked=value;c.onchange=()=>set(c.checked);element(row,'span','',label);};
  check('Inherit footer from parent section',inherit,v=>inherit=v);
  check('Apply throughout this section, including subsections',false,v=>throughout=v);
  button(modal.contentEl,'Save',()=>{view.change(()=>{g.title=title.trim()||g.title;setSectionFooter(deck,g.id,footer,throughout);if(inherit)delete g.footer;});modal.close();},'mod-cta');modal.open();
}
/** Custom drag avoids native HTML drag interception by rendered slide content. */
function attachDrag(view:StudioView,handle:HTMLElement,canvas:HTMLElement,ticket:number,payload:{group?:string;slides?:number[]},deck:Deck){
  handle.draggable=false;handle.ondragstart=e=>e.preventDefault();
  handle.onmousedown=down=>{
    if(down.button!==0||(down.target as HTMLElement).closest('button,input,select'))return;
    down.preventDefault();
    const doc=handle.ownerDocument;
    let scrollFrame=0,lastMouse:MouseEvent|undefined;
    let moved=false, targetGroup:string|undefined, before:Entry|undefined, inside=false, after=false;
    let ghost:HTMLElement|undefined, marker:HTMLElement|undefined;
    const sourceRect=handle.getBoundingClientRect();
    const moving=(payload.slides??[]).slice().sort((a,b)=>a-b).map(i=>deck.slides[i]);
    const sourceCards=(payload.slides??[]).slice().sort((a,b)=>a-b).map(i=>canvas.querySelector<HTMLElement>(`[data-slide="${i}"]`)!);
    const clear=()=>{canvas.querySelectorAll('.ss-drop').forEach(el=>el.classList.remove('ss-drop'));if(marker)marker.style.display='none';};
    const line=(x:number,y:number,w:number,h:number)=>{
      if(!marker)marker=element(doc.body,'div','ss-drag-marker');
      Object.assign(marker.style,{display:'block',left:`${x}px`,top:`${y}px`,width:`${w}px`,height:`${h}px`});
    };
    const move=(e:MouseEvent)=>{
      lastMouse=e;
      if(!moved&&Math.hypot(e.clientX-down.clientX,e.clientY-down.clientY)<6)return;
      if(!moved){
        moved=true;handle.dataset.dragged='true';scrollFrame=doc.defaultView!.requestAnimationFrame(scrollTick);
        ghost=element(doc.body,'div','ss-drag-ghost');
        if(payload.group)ghost.textContent=deck.sections?.find(s=>s.id===payload.group)?.title??'Section';
        else ghost.textContent=`${moving.length} slide${moving.length===1?'':'s'}`;
        sourceCards.forEach(card=>card?.classList.add('ss-dragging'));handle.classList.add('ss-dragging');
        ghost.style.width=`${Math.min(240,sourceRect.width)}px`;
      }
      e.preventDefault();clear();targetGroup=undefined;before=undefined;
      Object.assign(ghost!.style,{left:`${e.clientX+16}px`,top:`${e.clientY+16}px`});
      const el=doc.elementFromPoint(e.clientX,e.clientY) as HTMLElement|null;
      if(!el||!canvas.contains(el))return;
      const group=el.closest<HTMLElement>('.ss-organizer-section')??Array.from(canvas.querySelectorAll<HTMLElement>(':scope > .ss-organizer-section')).sort((a,b)=>{const distance=(node:HTMLElement)=>{const r=node.getBoundingClientRect();return Math.max(r.top-e.clientY,e.clientY-r.bottom,0);};return distance(a)-distance(b);})[0];
      inside=e.altKey;after=false;
      if(payload.group){
        if(group){
          targetGroup=group.dataset.group;
          if(descendants(deck,payload.group).has(targetGroup!)){targetGroup=undefined;return;}
          const head=group.querySelector<HTMLElement>('.ss-organizer-section-head')!, r=head.getBoundingClientRect();
          after=e.clientY>r.top+r.height/2;
          ghost!.textContent=`${inside?'Nest inside':after?'After':'Before'} ${deck.sections?.find(s=>s.id===targetGroup)?.title}`;
          if(inside)head.classList.add('ss-drop');else line(r.left,after?group.getBoundingClientRect().bottom:r.top,r.width,4);
        }else {const r=canvas.getBoundingClientRect();line(r.left+16,Math.min(e.clientY,r.bottom-4),r.width-32,4);targetGroup='';}
      }else {
        // Blank space at the bottom belongs to the final section.
        const destination=group??Array.from(canvas.querySelectorAll<HTMLElement>('.ss-organizer-section')).at(-1);
        if(!destination)return;
        targetGroup=destination.dataset.group;
        const grid=destination.querySelector<HTMLElement>(':scope > .ss-organizer-grid');
        if(!grid){destination.querySelector('.ss-organizer-section-head')?.classList.add('ss-drop');return;}
        const r=grid.getBoundingClientRect();
        if(el.closest('.ss-organizer-section-head')){destination.querySelector('.ss-organizer-section-head')?.classList.add('ss-drop');ghost!.textContent=`Move ${moving.length} to ${deck.sections?.find(s=>s.id===targetGroup)?.title}`;} else {
          const cards=Array.from(grid.querySelectorAll<HTMLElement>(':scope > .ss-organizer-card'));
          const rects=cards.map(c=>c.getBoundingClientRect());
          const slot=gridSlot(rects,e.clientX,e.clientY);
          before=cards[slot]?deck.slides[Number(cards[slot].dataset.slide)]:undefined;
          // Dropping immediately beside a selected card still resolves against the non-moving entries.
          if(before&&moving.includes(before)){
            before=cards.slice(slot).map(c=>deck.slides[Number(c.dataset.slide)]).find(entry=>!moving.includes(entry));
          }
          const ref=rects[Math.min(slot,rects.length-1)];
          if(ref)line(slot===rects.length?ref.right+5:ref.left-7,ref.top,4,ref.bottom-ref.top);
          else line(r.left+16,r.top+12,4,Math.max(36,r.height-24));
        }
      }

    };
    const scrollTick=()=>{
      if(lastMouse){const r=canvas.getBoundingClientRect(),y=lastMouse.clientY,x=lastMouse.clientX;
        if(x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom){const delta=y<r.top+45?-10:y>r.bottom-45?10:0;const previous=canvas.scrollTop;canvas.scrollTop+=delta;if(canvas.scrollTop!==previous)move(lastMouse);}
      }
      scrollFrame=doc.defaultView!.requestAnimationFrame(scrollTick);
    };
    const cleanup=()=>{doc.defaultView?.cancelAnimationFrame(scrollFrame);doc.removeEventListener('mousemove',move,true);doc.removeEventListener('mouseup',end,true);doc.removeEventListener('keydown',key,true);doc.defaultView?.removeEventListener('blur',cleanup);clear();ghost?.remove();marker?.remove();sourceCards.forEach(card=>card?.classList.remove('ss-dragging'));handle.classList.remove('ss-dragging');};
    const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();cleanup();}};
    const end=()=>{
      cleanup();if(!moved||targetGroup===undefined||ticket!==view.revision)return;
      try{
        view.change(()=>{
          if(payload.group){
            const selected=[...view.selectedSlides].map(i=>deck.slides[i]), current=deck.slides[view.index];
            if(!targetGroup)moveSection(deck,payload.group);
            else if(inside)moveSection(deck,payload.group,targetGroup,true);
            else {
              moveSection(deck,payload.group,targetGroup);
              if(after){const g=deck.sections!.find(s=>s.id===payload.group)!;deck.sections=deck.sections!.filter(s=>s!==g);deck.sections.splice(deck.sections.findIndex(s=>s.id===targetGroup)+1,0,g);orderSlides(deck);}
            }
            view.selectedSlides=new Set(selected.map(entry=>deck.slides.indexOf(entry)));view.index=Math.max(0,deck.slides.indexOf(current));
          }else{
            moveSlidesTo(deck,payload.slides!,targetGroup!,before);
            view.selectedSlides=new Set(moving.map(entry=>deck.slides.indexOf(entry)));view.index=deck.slides.indexOf(moving[0]);
          }
        });
      }catch(error){new Notice(String(error));}
    };
    doc.addEventListener('mousemove',move,true);doc.addEventListener('mouseup',end,true);doc.addEventListener('keydown',key,true);doc.defaultView?.addEventListener('blur',cleanup);view.renderOwner!.register(cleanup);
  };
}

export async function browsePresentations(view: StudioView, destination?: string) {
  const target=view.doc, targetRecord=view.record;
  if(target?.kind!=='deck'||!targetRecord)return;
  const decks=await view.plugin.store.list('deck');
  const modal=new Modal(view.app);modal.titleEl.textContent='Bring in slides';modal.modalEl.classList.add('ss-import-modal');
  let owner=new Component(), revision=0, closed=false, busy=false;
  modal.onClose=()=>{closed=true;owner.unload();};
  const controls=element(modal.contentEl,'div','ss-import-controls');
  const search=element(controls,'input');search.placeholder='Find a presentation…';search.setAttribute('aria-label','Find a presentation');
  const list=element(controls,'select');list.setAttribute('aria-label','Source presentation');
  const choices=decks.filter(r=>r.doc.id!==target.id);
  const fill=()=>{list.replaceChildren();for(const r of choices.filter(r=>r.doc.title.toLowerCase().includes(search.value.toLowerCase()))) {const o=element(list,'option','',r.doc.title);o.value=r.file.path;}};
  fill();
  const mode=element(controls,'select');mode.setAttribute('aria-label','Import mode');
  for(const [value,text] of [['copy','Independent copies'],['share','Shared slides — edits affect every presentation']]){const o=element(mode,'option','',text);o.value=value;}
  const placement=element(controls,'select');placement.setAttribute('aria-label','Import destination');
  const rootOption=element(placement,'option','','New top-level section');rootOption.value='';
  for(const g of target.sections??[]){let label=g.title,p=g.parent;while(p){const parent=target.sections!.find(s=>s.id===p)!;label=parent.title+' / '+label;p=parent.parent;}const o=element(placement,'option','',label);o.value=g.id;}
  placement.value=destination??'';
  const grouping=element(controls,'select');grouping.setAttribute('aria-label','Imported organization');
  for(const [value,text] of [['keep','Keep source sections'],['flat','Slides only']]){const o=element(grouping,'option','',text);o.value=value;}
  const preview=element(modal.contentEl,'div','ss-import-preview');
  const footer=element(modal.contentEl,'div','ss-import-actions');
  let chosen=new Set<number>(), source:Deck|null=null;
  const status=element(footer,'span','ss-hint');
  const importButton=button(footer,'Import selected',()=>void run(), 'mod-cta');
  const update=()=>{status.textContent=`${chosen.size} slide${chosen.size===1?'':'s'} selected`;importButton.disabled=!chosen.size||busy;};
  const load=async()=>{
    const n=++revision;owner.unload();owner=new Component();owner.load();preview.replaceChildren();chosen.clear();source=null;update();
    const record=choices.find(r=>r.file.path===list.value);if(!record)return;
    const d=clone(record.doc as Deck),records=await view.plugin.store.resolveMany(d.slides);
    if(closed||n!==revision)return;
    ensureSections(d,records.map(r=>r?.doc.kind==='slide'?r.doc:null));source=d;
    const all=button(preview,'Select whole presentation',()=>{chosen=new Set(d.slides.map((_,i)=>i));refreshChecks();});
    const checks=new Map<number,HTMLInputElement>();
    const groupChecks:{input:HTMLInputElement;indices:number[]}[]=[];
    const refreshChecks=()=>{checks.forEach((c,i)=>c.checked=chosen.has(i));groupChecks.forEach(({input,indices})=>{input.checked=indices.length>0&&indices.every(i=>chosen.has(i));input.indeterminate=indices.some(i=>chosen.has(i))&&!input.checked;});update();};
    const group=(g:Section,parent:HTMLElement)=>{
      const box=element(parent,'details','ss-import-section');box.open=true;
      const summary=element(box,'summary');const c=element(summary,'input');c.type='checkbox';c.setAttribute('aria-label',`Select section ${g.title}`);
      const ids=descendants(d,g.id),indices=d.slides.map((_,i)=>i).filter(i=>ids.has(d.slides[i].sectionId!));
      groupChecks.push({input:c,indices});c.onclick=e=>e.stopPropagation();c.onchange=()=>{indices.forEach(i=>c.checked?chosen.add(i):chosen.delete(i));refreshChecks();};
      element(summary,'span','',`${g.title} · ${indices.length} slides`);
      const grid=element(box,'div','ss-organizer-grid');
      d.slides.forEach((e,i)=>{if(e.sectionId!==g.id)return;
        const card=element(grid,'label','ss-import-card');thumbnail(view,card,d,records,i,owner,preview);
        const check=element(card,'input');check.type='checkbox';check.setAttribute('aria-label',`Select slide ${i+1}: ${records[i]?.doc.title??'Missing'}`);checks.set(i,check);
        element(card,'span','',`${i+1}. ${records[i]?.doc.title??'Missing'}`);check.onchange=()=>{check.checked?chosen.add(i):chosen.delete(i);refreshChecks();};
      });
      d.sections!.filter(s=>s.parent===g.id).forEach(s=>group(s,box));
    };
    d.sections!.filter(g=>!g.parent).forEach(g=>group(g,preview));
  };
  const run=async()=>{
    if(!source||!chosen.size||busy)return;
    busy=true;update();list.disabled=mode.disabled=search.disabled=placement.disabled=grouping.disabled=true;
    try {
      const snapshot=fragment(source,[...chosen]);const targetRevision=view.revision;
      const targetRecords=await view.plugin.store.resolveMany(target.slides);
      const prepared=await view.plugin.store.prepareImport(snapshot,targetRecord,mode.value==='share');
      if(closed||view.doc!==target||view.closed||view.locked||targetRevision!==view.revision){
        for(const r of prepared.created)await view.app.vault.trash(r.file,false);
        throw Error('Destination changed during import. Reopen Bring in and try again.');
      }
      view.change(()=>{
        ensureSections(target,targetRecords.map(r=>r?.doc.kind==='slide'?r.doc:null));
        const parent=placement.value || undefined;
        if (parent && !target.sections!.some(g=>g.id===parent)) throw Error('Destination section no longer exists.');
        if(grouping.value==='flat') {
          const group=parent??createSection(target,source!.title).id;
          prepared.deck.slides.forEach(e=>e.sectionId=group);
        } else {
          const roots=prepared.deck.sections!.filter(g=>!g.parent);
          // The legacy default group already represents the whole deck; do not wrap it twice.
          if(roots.length===1 && roots[0].title===source!.title) {
            if(parent) roots[0].parent=parent;
          } else {
            const wrapper={id:uuid(),title:source!.title,footer:source!.title,...(parent?{parent}:{})};
            target.sections!.push(wrapper);
            roots.forEach(g=>g.parent=wrapper.id);
          }
          target.sections!.push(...prepared.deck.sections!);
        }
        target.slides.push(...prepared.deck.slides);orderSlides(target);view.selectedSlides.clear();
      });
      await view.flush();
      if(view.locked)throw Error('Import is retained in the recovery draft because the destination changed on disk.');
      modal.close();new Notice(`Imported ${snapshot.slides.length} slide${snapshot.slides.length===1?'':'s'} ${mode.value==='share'?'as shared slides':'as independent copies'}.`);
    }catch(error){view.plugin.error(error);}
    finally{busy=false;list.disabled=mode.disabled=search.disabled=placement.disabled=grouping.disabled=false;update();}
  };
  list.onchange=()=>void load().catch(e=>view.plugin.error(e));search.oninput=()=>{fill();void load().catch(e=>view.plugin.error(e));};
  modal.open();await load();
}
