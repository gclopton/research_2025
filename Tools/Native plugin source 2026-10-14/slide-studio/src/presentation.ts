import { block, newSlide } from './model';

export type PresentationDetails = {
  title: string;
  author?: string;
  affiliation?: string;
  date?: string;
  event?: string;
};

export function titleSlide(details: PresentationDetails, source = '') {
  const title = details.title.trim() || 'Presentation title';
  const slide = newSlide(title, 'intro');
  slide.source = source;
  slide.blocks = [
    block(`# ${title}`, { x: 120, y: 170, w: 1360, h: 210, font: 60 }),
    block(details.author?.trim() || 'Author name', { x: 120, y: 410, w: 1360, h: 64, font: 34 }),
    block(details.affiliation?.trim() || 'Department · Institution', { x: 120, y: 490, w: 1360, h: 56, font: 28 }),
    block(details.date?.trim() || 'Date', { x: 120, y: 560, w: 1360, h: 56, font: 28 }),
  ];
  if (details.event?.trim())
    slide.blocks.push(block(details.event.trim(), { x: 120, y: 630, w: 1360, h: 56, font: 26 }));
  return slide;
}
