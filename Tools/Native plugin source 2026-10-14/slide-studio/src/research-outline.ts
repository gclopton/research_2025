import {Deck, Slide, sectionAt, sectionStart, slideNumber} from './model';
import {outlineContext} from './outlines';

export type OutlineEntry = {heading: string; level: number; slideIndex: number; kind: 'deck'|'section'|'slide'};
/** A read-only projection in playback order, preserving repeated slide occurrences. */
export function researchOutline(deck: Deck, slides: (Slide|null)[]): OutlineEntry[] {
  const entries: OutlineEntry[] = [{heading: deck.title, level: 1, slideIndex: deck.slides.length ? 0 : -1, kind: 'deck'}];
  const sections = new Map((deck.sections ?? []).map(section => [section.id, section]));
  const chainFor = (id?: string) => {
    const chain: string[] = [], seen = new Set<string>();
    while (id && sections.has(id) && !seen.has(id)) {
      seen.add(id); chain.unshift(id); id = sections.get(id)!.parent;
    }
    return chain;
  };
  // Match the outline slides: title-only and empty branches do not take a section number.
  const occupied = deck.slides.filter((_, i) => slides[i]?.type !== 'intro').map(e => e.sectionId).filter((id): id is string => !!id);
  const numbers = occupied.length && sections.has(occupied[0]) ? outlineContext(deck, occupied[0], occupied).numbers : new Map<string,string>();
  let previous: string[] = [];
  deck.slides.forEach((entry, index) => {
    const chain = slides[index]?.type === 'intro' ? [] : chainFor(entry.sectionId);
    if (deck.sections) {
      let shared = 0;
      while (shared < chain.length && previous[shared] === chain[shared]) shared++;
      for (let depth = shared; depth < chain.length; depth++) {
        const section = sections.get(chain[depth])!;
        entries.push({heading: `${numbers.get(section.id) ?? ''} ${section.title}`, level: depth + 2, slideIndex: index, kind: 'section'});
      }
      previous = chain;
    } else if (sectionStart(deck, index, slides) === index) {
      const label = sectionAt(deck, index, slides);
      if (label) entries.push({heading: label, level: 2, slideIndex: index, kind: 'section'});
    }
    const page = slideNumber(deck.theme, slides, index);
    const title = slides[index]?.title ?? `Missing slide: ${entry.file}`;
    entries.push({heading: `${page === undefined ? '' : `${page} · `}${title}`,
      level: deck.sections ? chain.length + 2 : sectionAt(deck, index, slides) ? 3 : 2,
      slideIndex: index, kind: 'slide'});
  });
  return entries;
}
