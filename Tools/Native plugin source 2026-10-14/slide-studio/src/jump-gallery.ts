import {Component,Menu,type Scope} from 'obsidian';
import {slideNumber,type Theme,type Slide} from './model';
import {DEFAULT_THUMBNAIL_SIZE,thumbnailSize,galleryColumns,galleryWheelSize} from './gallery-layout';
import {element,button} from './render';
export type JumpItem = {index:number; title:string; number?:number};
/** Search and captions use exactly the number printed by the slide renderer. */
export function jumpSlideNumber(theme:Theme,slides:(Slide|null)[],index:number):number|undefined {
  return slideNumber(theme,slides,index);
}
export function filterJumpItems(items:JumpItem[],query:string):JumpItem[] {
  const q=query.trim().toLowerCase();
  if(!q)return items;
  const exact=q.match(/^#\s*(\d+)$/);
  if(exact)return items.filter(i=>i.number===Number(exact[1]));
  const titleMatches=items.filter(i=>i.title.toLowerCase().includes(q));
  if(!/^\d+$/.test(q))return titleMatches;
  const number=Number(q);
  return [...items.filter(i=>i.number===number),...titleMatches.filter(i=>i.number!==number)];
}
/** Shared, lazy thumbnail picker for the editor and fullscreen playback. */
export function mountJumpGallery(parent:HTMLElement,items:JumpItem[],current:number,choose:(index:number)=>void,
  render:(item:JumpItem,stage:HTMLElement,owner:Component)=>Promise<unknown>,
  options:{shell:HTMLElement;scope:Scope}) {
  const owner=new Component();owner.load();
  parent.classList.add('ss-jump-gallery');
  const toolbar=element(parent,'div','ss-jump-tools');
  const search=element(toolbar,'input');search.type='search';search.placeholder='Title or number · #69 for exact slide number';search.setAttribute('aria-label','Find slide by number or title');
  element(parent,'p','ss-hint','Numbers match printed slide numbers first, then titles. Numbering follows the presentation convention. Use #69 for printed slide 69 only; unnumbered slides are searchable by title. Enter opens the first match. Drag the bottom-right corner to resize; pinch or Ctrl/⌘+scroll to zoom previews. Cmd/Ctrl+0 resets the gallery.');
  const count=element(parent,'div','ss-jump-count');count.setAttribute('aria-live','polite');
  const grid=element(parent,'div','ss-jump-grid');grid.setAttribute('role','list');
  let pageOwner:Component|undefined;let matches:JumpItem[]=[];let buttons:HTMLButtonElement[]=[];
  const shell=options.shell;
  let size=DEFAULT_THUMBNAIL_SIZE,columns=1,expanded=false,manualSize={width:'',height:''};
  const original={width:shell.style.width,height:shell.style.height};
  const layout=()=>{
    columns=galleryColumns(grid.clientWidth-8,size);
    grid.style.setProperty('--ss-gallery-columns',String(columns));
    grid.style.maxHeight=expanded||shell.style.height?'none':'';
  };
  const updateCount=()=>{count.textContent=`${matches.length} slide${matches.length===1?'':'s'}${size===100?'':` · ${size}%`}`;};
  const setSize=(value:number)=>{
    size=thumbnailSize(value);updateCount();
    layout();
  };
  function toggleExpanded(){
    if(!expanded){manualSize={width:shell.style.width,height:shell.style.height};shell.style.width='';shell.style.height='';}
    else {shell.style.width=manualSize.width;shell.style.height=manualSize.height;}
    expanded=!expanded;shell.classList.toggle('ss-gallery-expanded',expanded);
    layout();
  }
  const reset=()=>{
    expanded=false;shell.classList.remove('ss-gallery-expanded');shell.style.width=original.width;shell.style.height=original.height;
    setSize(DEFAULT_THUMBNAIL_SIZE);
  };
  let wheelSize=size,lastWheel=0;
  owner.registerDomEvent(parent,'wheel',event=>{
    if(!event.ctrlKey&&!event.metaKey)return;
    event.preventDefault();event.stopPropagation();
    const now=Date.now();if(now-lastWheel>250)wheelSize=size;lastWheel=now;
    wheelSize=galleryWheelSize(wheelSize,event.deltaY,event.deltaMode,parent.clientHeight);
    setSize(wheelSize);
  },{passive:false,capture:true});
  for(const [modifiers,key,action] of [
    [['Mod'],'=',()=>setSize(size+20)],[['Mod','Shift'],'=',()=>setSize(size+20)],
    [['Mod'],'-',()=>setSize(size-20)],[['Mod'],'0',reset],[['Mod','Shift'],'f',toggleExpanded],
  ] as const){
    const handler=options.scope.register([...modifiers],key,event=>{event.preventDefault();event.stopPropagation();action();return false;});
    owner.register(()=>options.scope.unregister(handler));
  }
  owner.registerDomEvent(parent,'contextmenu',event=>{
    if((event.target as HTMLElement).closest('input[type=search]'))return;
    event.preventDefault();event.stopPropagation();const menu=new Menu();
    menu.addItem(i=>i.setTitle('Larger thumbnails (Cmd/Ctrl +)').setDisabled(size===300).onClick(()=>setSize(size+20)));
    menu.addItem(i=>i.setTitle('Smaller thumbnails (Cmd/Ctrl −)').setDisabled(size===60).onClick(()=>setSize(size-20)));
    menu.addItem(i=>i.setTitle(expanded?'Restore gallery size':'Fill window').onClick(toggleExpanded));
    menu.addSeparator();menu.addItem(i=>i.setTitle('Reset gallery to default (Cmd/Ctrl 0)').onClick(reset));menu.showAtMouseEvent(event);
  });
  const resize=new ResizeObserver(layout);resize.observe(grid);resize.observe(shell);
  owner.register(()=>{resize.disconnect();shell.classList.remove('ss-gallery-expanded');shell.style.width=original.width;shell.style.height=original.height;parent.classList.remove('ss-jump-gallery');});
  setSize(size);
  const draw=()=>{
    if(pageOwner)owner.removeChild(pageOwner);pageOwner=new Component();owner.addChild(pageOwner);
    const batch=pageOwner;grid.replaceChildren();matches=filterJumpItems(items,search.value);buttons=[];
    updateCount();
    if(!matches.length){element(grid,'p','','No matching slides.');return;}
    for(const item of matches){
      const card=button(grid,'',()=>choose(item.index),'ss-jump-card');buttons.push(card);
      const title=`${item.number ? item.number+' · ':''}${item.title}`;card.setAttribute('aria-label',title);card.classList.toggle('is-current',item.index===current);
      const preview=element(card,'div','ss-jump-preview');preview.setAttribute('aria-hidden','true');preview.inert=true;
      element(card,'span','ss-jump-caption',title);
      const observer=new IntersectionObserver(entries=>{
        if(!entries.some(e=>e.isIntersecting))return;observer.disconnect();
        const stage=element(preview,'div','ss-stage');
        const fit=()=>{stage.style.transform=`scale(${preview.clientWidth/1600})`;};fit();
        const resize=new ResizeObserver(fit);resize.observe(preview);batch.register(()=>resize.disconnect());
        void render(item,stage,batch).then(fit).catch(()=>{preview.textContent='Preview unavailable';});
      },{root:grid,rootMargin:'100px'});
      observer.observe(preview);batch.register(()=>observer.disconnect());
      card.onkeydown=e=>{
        const i=buttons.indexOf(card),cols=columns;
        const offset=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:e.key==='ArrowDown'?cols:e.key==='ArrowUp'?-cols:0;
        if(offset){e.preventDefault();e.stopPropagation();buttons[Math.max(0,Math.min(buttons.length-1,i+offset))]?.focus();}
      };
    }
  };
  search.oninput=draw;
  search.onkeydown=e=>{if(e.key==='Enter'&&matches.length){e.preventDefault();e.stopPropagation();choose(matches[0].index);}else if(e.key==='ArrowDown'){e.preventDefault();buttons[0]?.focus();}};
  draw();search.focus();return owner;
}
