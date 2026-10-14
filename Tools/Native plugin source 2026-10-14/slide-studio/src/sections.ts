import { Deck, Slide, Section, Entry, uuid, sectionAt, sectionStart, clone } from './model';

/** Upgrade only when the organizer is first used. Preserve legacy footer boundaries. */
export function ensureSections(deck: Deck, slides: (Slide | null)[] = []): void {
  if (deck.sections) return;
  const groups: Section[] = [];
  let current = '';
  deck.slides.forEach((entry, i) => {
    if (!i || sectionStart(deck, i, slides) === i) {
      const title = sectionAt(deck, i, slides);
      const group = { id: uuid(), title, footer: title };
      groups.push(group); current = group.id;
    }
    entry.sectionId = current;
  });
  deck.sections = groups;
}
export function descendants(deck: Deck, id: string): Set<string> {
  const result = new Set([id]);
  for (let changed = true; changed;) {
    changed = false;
    for (const g of deck.sections ?? []) if (g.parent && result.has(g.parent) && !result.has(g.id)) {
      result.add(g.id); changed = true;
    }
  }
  return result;
}
export function sectionOrder(deck: Deck): Section[] {
  const out: Section[] = [];
  const visit = (parent?: string) => {
    for (const g of deck.sections ?? []) if (g.parent === parent) { out.push(g); visit(g.id); }
  };
  visit(); return out;
}
/** Direct slides precede subsections, matching the visible organizer layout. */
export function orderSlides(deck: Deck): void {
  if (!deck.sections) return;
  const known = new Set(deck.sections.map(s => s.id));
  if (deck.slides.some(e => !e.sectionId || !known.has(e.sectionId))) {
    let fallback = deck.sections.find(s => s.title === 'Ungrouped' && !s.parent);
    if (!fallback) { fallback = { id: uuid(), title: 'Ungrouped' }; deck.sections.push(fallback); }
    deck.slides.forEach(e => { if (!e.sectionId || !known.has(e.sectionId)) e.sectionId = fallback!.id; });
  }
  const rank = new Map(sectionOrder(deck).map((g,i) => [g.id,i]));
  deck.slides.sort((a,b) => rank.get(a.sectionId!)! - rank.get(b.sectionId!)!);
}
export function createSection(deck: Deck, title: string, indices: number[] = [], parent?: string): Section {
  ensureSections(deck);
  if (parent && !deck.sections!.some(g => g.id === parent)) throw Error('Parent section not found.');
  const group: Section = { id: uuid(), title: title.trim() || 'New section', ...(parent ? {parent} : {}) };
  // A sibling made from a selection belongs immediately after its originating section.
  const origin = deck.slides[Math.min(...indices)]?.sectionId;
  const sibling = deck.sections!.find(g => g.id === origin && g.parent === parent);
  const at = sibling ? deck.sections!.indexOf(sibling) + 1 : deck.sections!.length;
  deck.sections!.splice(at, 0, group);
  indices.forEach(i => { if (deck.slides[i]) deck.slides[i].sectionId = group.id; });
  orderSlides(deck); return group;
}
export function moveSlidesTo(deck: Deck, indices: number[], sectionId: string, before?: Entry): void {
  if (!deck.sections?.some(g => g.id === sectionId)) throw Error('Destination section not found.');
  const chosen = new Set(indices);
  const moving = deck.slides.filter((_,i) => chosen.has(i));
  if (before && moving.includes(before)) return;
  deck.slides = deck.slides.filter((_,i) => !chosen.has(i));
  moving.forEach(e => { if (e.sectionId !== sectionId) delete e.canvas; e.sectionId = sectionId; });
  const at = before ? deck.slides.indexOf(before) : -1;
  deck.slides.splice(at < 0 ? deck.slides.length : at, 0, ...moving);
  orderSlides(deck);
}
export function moveSection(deck: Deck, id: string, target?: string, inside = false): void {
  const g = deck.sections?.find(s => s.id === id);
  if (!g) throw Error('Section not found.');
  if (target && descendants(deck,id).has(target)) throw Error('A section cannot be moved inside itself.');
  const destination = deck.sections!.find(s => s.id === target);
  if (target && !destination) throw Error('Destination not found.');
  g.parent = inside ? destination?.id : destination?.parent;
  deck.sections = deck.sections!.filter(s => s !== g);
  deck.sections.splice(destination ? deck.sections.indexOf(destination) + Number(inside) : deck.sections.length, 0, g);
  orderSlides(deck);
}
export function setSectionFooter(deck: Deck, id: string, text: string, throughout = false): void {
  const section = deck.sections?.find(g => g.id === id);
  if (!section) return;
  section.footer = text;
  if (throughout) for (const g of deck.sections!) if (g.id !== id && descendants(deck,id).has(g.id)) delete g.footer;
}
/** A reusable fragment keeps its selected ancestors, their labels and footer inheritance. */
export function fragment(deck: Deck, indices: number[]): Deck {
  const out = clone(deck);
  delete out.trash;
  out.slides = out.slides.filter((_,i) => indices.includes(i));
  const needed = new Set(out.slides.map(e => e.sectionId));
  for (let changed = true; changed;) {
    changed = false;
    for (const g of out.sections ?? []) if (needed.has(g.id) && g.parent && !needed.has(g.parent)) { needed.add(g.parent); changed = true; }
  }
  out.sections = out.sections?.filter(g => needed.has(g.id));
  return out;
}

/** Position is one-based among the destination's direct slides, after removal. */
export function positionSlides(deck:Deck, indices:number[], sectionId:string, position:number):void {
  if(!deck.sections?.some(g=>g.id===sectionId))throw Error('Destination section not found.');
  const chosen=new Set(indices), remaining=deck.slides.filter((e,i)=>e.sectionId===sectionId&&!chosen.has(i));
  if(!Number.isInteger(position)||position<1||position>remaining.length+1)throw Error('Position is outside the destination section.');
  moveSlidesTo(deck,indices,sectionId,remaining[position-1]);
}
/** Move a whole section/subtree; swapping is limited to siblings so parentage stays explicit. */
export function positionSection(deck:Deck,id:string,parent:string|undefined,position:number,swap=false):void {
  const g=deck.sections?.find(s=>s.id===id);
  if(!g)throw Error('Section not found.');
  if(parent&&(!deck.sections!.some(s=>s.id===parent)||descendants(deck,id).has(parent)))throw Error('Invalid parent section.');
  const siblings=deck.sections!.filter(s=>s.parent===parent&&s.id!==id);
  if(swap){
    if(g.parent!==parent)throw Error('Swap requires sections with the same parent.');
    const all=deck.sections!.filter(s=>s.parent===parent),target=all[position-1];
    if(!Number.isInteger(position)||!target)throw Error('Invalid section position.');
    const a=deck.sections!.indexOf(g),b=deck.sections!.indexOf(target);
    [deck.sections![a],deck.sections![b]]=[deck.sections![b],deck.sections![a]];
  }else{
    if(!Number.isInteger(position)||position<1||position>siblings.length+1)throw Error('Invalid section position.');
    if(parent)g.parent=parent;else delete g.parent;deck.sections=deck.sections!.filter(s=>s!==g);
    const before=siblings[position-1];
    deck.sections.splice(before?deck.sections.indexOf(before):deck.sections.length,0,g);
  }
  orderSlides(deck);
}
