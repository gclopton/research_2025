import {Deck,Slide,Section,clone} from './model';
import {ensureSections} from './sections';
export type OutlinePage={kind:'outline';sectionId:string;beforeIndex:number;sectionIds?:string[]};
export type PresentationPage=OutlinePage|{kind:'slide';index:number};
/** Derived pages never enter the saved slide list or its page-number calculation. */
export function outlinePlan(deck:Deck,slides:(Slide|null)[]):{deck:Deck;pages:PresentationPage[]} {
  const d=clone(deck);
  const hasStructure=!!d.sections?.length||d.slides.some(e=>!!e.section.trim())||slides.some(s=>s?.type==='section');
  if(!d.showOutlines||!hasStructure)return {deck:d,pages:d.slides.map((_,index)=>({kind:'slide' as const,index}))};
  ensureSections(d,slides);
  const pages:PresentationPage[]=[],seen=new Set<string>();
  d.slides.forEach((entry,index)=>{
    if(d.showOutlines && slides[index]?.type!=='intro'){
      const chain:Section[]=[];let g=d.sections?.find(s=>s.id===entry.sectionId);
      while(g){chain.unshift(g);g=d.sections?.find(s=>s.id===g!.parent);}
      // One transition per content slide: enter all new ancestors together,
      // highlighting the deepest section that is actually about to begin.
      const entering=chain.filter(g=>!seen.has(g.id));
      for(const g of entering)seen.add(g.id);
      const deepest=entering[entering.length-1];
      if(deepest)pages.push({kind:'outline',sectionId:deepest.id,beforeIndex:index});
    }
    pages.push({kind:'slide',index});
  });
  const sectionIds=[...seen];for(const page of pages)if(page.kind==='outline')page.sectionIds=sectionIds;
  return {deck:d,pages};
}
/** Keep the active item and its neighbors readable even in very long talks. */
export function outlineWindow<T>(items:T[],active:number,limit=7){
  const start=Math.max(0,Math.min(active-Math.floor(limit/2),items.length-limit));
  return {items:items.slice(start,start+limit),start,earlier:start,later:Math.max(0,items.length-start-limit)};
}
export function outlineContext(deck:Deck,id:string,sectionIds?:string[]){
  const sections=deck.sections??[],active=sections.find(s=>s.id===id)!;
  const chain:Section[]=[active];while(chain[0]?.parent)chain.unshift(sections.find(s=>s.id===chain[0].parent)!);
  const occupied=new Set(sectionIds??deck.slides.map(e=>e.sectionId));
  // Include ancestors with content in descendants, but do not advertise empty branches.
  for(let changed=true;changed;){changed=false;for(const g of sections)if(occupied.has(g.id)&&g.parent&&!occupied.has(g.parent)){occupied.add(g.parent);changed=true;}}
  const roots=sections.filter(g=>!g.parent&&occupied.has(g.id));
  const parent=chain.length>1?chain[chain.length-2]:active;
  const children=sections.filter(g=>g.parent===parent.id&&occupied.has(g.id));
  const numbers=new Map<string,string>();
  const numberChildren=(parentId:string|undefined,prefix='')=>{
    sections.filter(g=>g.parent===parentId&&occupied.has(g.id)).forEach((g,i)=>{
      const label=prefix?`${prefix}.${i+1}`:String(i+1);numbers.set(g.id,label);numberChildren(g.id,label);
    });
  };
  numberChildren(undefined);
  return {active,chain,roots,parent,children,numbers,rootIndex:roots.findIndex(g=>g.id===chain[0]?.id)};
}
