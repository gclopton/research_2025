import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  newSlide,
  slidePageNumber,
  newDeck,
  serialize,
  deserialize,
  block,
  clampGeometry,
  moveEntry,
  resolveEntry,
  sectionAt,
  sectionStart,
  standaloneTheme,
  applyPresentationTheme,
  presentationThemeLabel,
  themeForSlide,
  wikiTargets,
  uniqueEntries,
} from '../src/model';
test('Markdown math, callouts, multiline and unicode survive disk roundtrip', () => {
  const s = newSlide(
    'Distortion',
    'content',
    '$$\nd=(1+\\delta)d_0\n$$\n\n> [!note]\n> Ce³⁺ and $q$',
  );
  s.blocks.push(block('## Another block\n\nA paragraph.'));
  assert.deepEqual(deserialize(serialize(s)), s);
});
test('deck roundtrip and slide numbers are independent from identity', () => {
  const a = newSlide('A'),
    b = newSlide('B');
  const d = newDeck(
    'Talk',
    [a, b].map((s) => ({ id: s.id, file: s.title + '.md', section: '' })),
  );
  assert.deepEqual(deserialize(serialize(d)), d);
  const swapped = moveEntry(d.slides, 0, 1);
  assert.equal(swapped[1].id, a.id);
  assert.equal(d.slides[0].id, a.id);
});
test('identity resolves after filename changes; duplicates fail loudly', () => {
  const e = { id: 'stable', file: 'old.md', section: '' };
  assert.equal(resolveEntry(e, [{ id: 'stable', path: 'new.md' }])?.path, 'new.md');
  assert.throws(() => resolveEntry(e, [{ id: 'stable' }, { id: 'stable' }]), /Duplicate/);
});
test('malformed and future documents are not silently overwritten', () => {
  const s = serialize(newSlide('A'));
  assert.throws(
    () => deserialize(s.replace('slide-studio-version: 1', 'slide-studio-version: 2')),
    /unsupported/,
  );
  assert.throws(() => deserialize(s.replace(/<!-- slide-block:[\w-]+ -->/, 'missing')), /missing/);
  assert.equal(deserialize('# ordinary note'), null);
});
test('geometry cannot leave page or invade footer', () => {
  const b = clampGeometry(block('', { x: 5000, y: -50, w: 1800, h: 2000, font: 300 }));
  assert.equal(b.x, 0);
  assert.equal(b.y, 0);
  assert.equal(b.w, 1600);
  assert.equal(b.h, 792);
  assert.equal(b.font, 160);
});
test('collect links in prose order, omit embeds and code, dedupe identities', () => {
  assert.deepEqual(
    wikiTargets('[[A|slide]]\n![[figure]]\n```md\n[[B]]\n```\n`[[C]]`\n[[D#heading]]'),
    ['A', 'D'],
  );
  assert.deepEqual(
    uniqueEntries([
      { id: 'a', file: 'A', section: '' },
      { id: 'a', file: 'B', section: '' },
    ]),
    [{ id: 'a', file: 'A', section: '' }],
  );
});
test('section introduction label persists until next explicit section', () => {
  const ss = [
    newSlide('Title', 'intro'),
    newSlide('Methods', 'section'),
    newSlide('Equation'),
    newSlide('Results', 'section'),
  ];
  const d = newDeck(
    'Talk',
    ss.map((s) => ({ id: s.id, file: s.title, section: '' })),
  );
  assert.equal(sectionAt(d, 2, ss), 'Methods');
  d.slides[2].section = 'Special';
  assert.equal(sectionAt(d, 2, ss), 'Special');
});
test('dark appearance roundtrips without changing branding', () => {
  const d = newDeck('Night');
  d.theme.mode = 'dark';
  const loaded = deserialize(serialize(d));
  assert.deepEqual(loaded, d);
  assert.equal(loaded?.kind === 'deck' && loaded.theme.accent, '#ff5f05');
  const s = newSlide('Dark');
  s.appearance = 'dark';
  assert.deepEqual(deserialize(serialize(s)), s);
});

test('rename a section from a member updates the entire group and preserves the next group', () => {
  const slides = [
    newSlide('Intro'),
    newSlide('Methods', 'section'),
    newSlide('A'),
    newSlide('B'),
    newSlide('Results', 'section'),
    newSlide('C'),
  ];
  const deck = newDeck(
    'Talk',
    slides.map((s) => ({ id: s.id, file: s.title + '.md', section: '' })),
  );
  const start = sectionStart(deck, 3, slides);
  assert.equal(start, 1);
  deck.slides[start].section = 'A longer section footer';
  assert.equal(sectionAt(deck, 1, slides), 'A longer section footer');
  assert.equal(sectionAt(deck, 3, slides), 'A longer section footer');
  assert.equal(sectionAt(deck, 4, slides), 'Results');
  deck.slides[3].section = 'New section';
  assert.equal(sectionStart(deck, 3, slides), 3);
  assert.equal(sectionAt(deck, 2, slides), 'A longer section footer');
});
test('older files gain UIUC styling and an optional disabled pattern without losing contents', () => {
  const slide = newSlide('Title');
  const legacy = serialize(slide).replace('style: uiuc\n', '').replace('pattern: false\n', '');
  assert.deepEqual(deserialize(legacy), slide);
  slide.style = 'vault';
  slide.pattern = true;
  slide.blocks[0].color = '#ff5f05';
  assert.deepEqual(deserialize(serialize(slide)), slide);
  assert.equal(standaloneTheme(slide).style, 'vault');
  const deck = newDeck('Talk');
  deck.theme.style = 'vault';
  deck.theme.pattern = true;
  assert.deepEqual(deserialize(serialize(deck)), deck);
});

test('presentation theme overrides every slide without losing individual appearances', () => {
  const a = newSlide('A'),
    b = newSlide('B'),
    deck = newDeck('Talk');
  a.appearance = 'dark';
  b.style = 'vault';
  const before = serialize(a) + serialize(b);
  for (const choice of ['UIUC light', 'UIUC dark', 'Vault theme']) {
    deck.theme = applyPresentationTheme(deck.theme, choice);
    assert.deepEqual(themeForSlide(deck, a), themeForSlide(deck, b));
    assert.equal(themeForSlide(deck, a).style, choice === 'Vault theme' ? 'vault' : 'uiuc');
    if (choice !== 'Vault theme')
      assert.equal(themeForSlide(deck, a).mode, choice === 'UIUC dark' ? 'dark' : 'light');
  }
  deck.theme = applyPresentationTheme(deck.theme, 'Use individual slide themes');
  assert.equal(themeForSlide(deck, a).mode, 'dark');
  assert.equal(themeForSlide(deck, b).style, 'vault');
  assert.equal(serialize(a) + serialize(b), before);
  assert.deepEqual(deserialize(serialize(deck)), deck);
});

test('dark backdrop pattern defaults off and persists independently of footer pattern', () => {
  const slide = newSlide('Dark title');
  slide.appearance = 'dark';
  assert.equal(standaloneTheme(slide).backgroundPattern === true, false);
  slide.backgroundPattern = true;
  assert.deepEqual(deserialize(serialize(slide)), slide);
  assert.equal(standaloneTheme(slide).pattern, false);
  const deck = newDeck('Talk');
  assert.equal(themeForSlide(deck, slide).backgroundPattern === true, false);
  deck.theme.backgroundPattern = true;
  assert.deepEqual(deserialize(serialize(deck)), deck);
  deck.theme = applyPresentationTheme(deck.theme, 'Use individual slide themes');
  slide.backgroundPattern = false;
  assert.equal(themeForSlide(deck, slide).backgroundPattern, false);
});

test('title slides are unnumbered and the next slide starts at one, including legacy decks', () => {
  const deck = newDeck('Talk');
  deck.theme.pageNumberFormat='current';
  const slides = [newSlide('Title', 'intro'), newSlide('First'), newSlide('Section', 'section'), newSlide('Another title', 'intro'), newSlide('Last')];
  assert.deepEqual(slides.map((_, i) => slidePageNumber(deck.theme, slides, i)), ['', '1', '2', '', '3']);
  const old = deserialize(serialize(deck).replace('  titlePagination: false\n', ''));
  assert.deepEqual(old, deck);
  assert.equal(slidePageNumber(deck.theme, [newSlide('No title')], 0), '1');
  assert.equal(slidePageNumber(deck.theme, [slides[0], null, slides[1]], 2), '2');
  deck.theme.titlePagination = true;
  assert.deepEqual(deserialize(serialize(deck)), deck);
  assert.deepEqual(slides.map((_, i) => slidePageNumber(deck.theme, slides, i)), ['1', '2', '3', '4', '5']);
  deck.theme.pagination = false;
  assert.equal(slidePageNumber(deck.theme, slides, 0), '');
  assert.equal(slidePageNumber(deck.theme, slides, 1), '');
});

test('group moves preserve selected order and leave unselected slides in order', async () => {
  const { moveEntries } = await import('../src/model');
  const entries = ['A','B','C','D','E'].map(id => ({id,file:id+'.md',section:id}));
  const moved = moveEntries(entries,[3,1],5);
  assert.deepEqual(moved.entries.map(e=>e.id),['A','C','E','B','D']);
  assert.equal(moved.start,3);
  assert.deepEqual(moveEntries(entries,[2,3],0).entries.map(e=>e.id),['C','D','A','B','E']);
  assert.deepEqual(moveEntries(entries,[1,2],2).entries,entries);
  assert.deepEqual(entries.map(e=>e.id),['A','B','C','D','E']);
});
test('slide trash persists across reopen and restores the original entry and position', async () => {
  const {trashSlide,restoreSlide} = await import('../src/model');
  const deck=newDeck('Talk',['A','B','C'].map(id=>({id,file:id+'.md',section:id})));
  trashSlide(deck,1);
  assert.deepEqual(deck.slides.map(e=>e.id),['A','C']);
  const reopened=deserialize(serialize(deck));
  assert.ok(reopened?.kind==='deck');
  assert.equal(reopened.trash?.[0].entry.id,'B');
  restoreSlide(reopened,0);
  assert.deepEqual(reopened.slides.map(e=>e.id),['A','B','C']);
  assert.equal(reopened.slides[1].section,'B');
  assert.equal(reopened.trash?.length,0);
});

test('fluid dynamics presets persist and switch back without leaking palette colors', () => {
  const deck = newDeck('Fluid dynamics');
  for (const mode of ['light', 'dark']) {
    const name = 'Fluid dynamics ' + mode;
    deck.theme = applyPresentationTheme(deck.theme, name);
    assert.equal(deck.theme.palette, 'fluid-dynamics');
    assert.equal(deck.theme.navy, '#233c4c');
    assert.equal(deck.theme.mode, mode);
    const loaded = deserialize(serialize(deck));
    assert.equal(loaded?.kind === 'deck' && loaded.theme.palette, 'fluid-dynamics');
  }
  deck.theme = applyPresentationTheme(deck.theme, 'UIUC light');
  assert.equal(deck.theme.palette, undefined);
  assert.equal(deck.theme.navy, '#13294b');
  assert.equal(deck.theme.accent, '#ff5f05');
  deck.theme = applyPresentationTheme(deck.theme, 'Fluid dynamics light');
  deck.theme = applyPresentationTheme(deck.theme, 'Use individual slide themes');
  assert.equal(deck.theme.palette, undefined);
});


test('current/total uses the same convention for numerator and denominator and survives saving', () => {
  const deck = newDeck('Lunch countdown');
  const slides = [newSlide('Title','intro'),newSlide('First'),newSlide('Part two','intro'),newSlide('Last')];
  deck.theme.pageNumberFormat='current-total';
  assert.deepEqual(slides.map((_,i)=>slidePageNumber(deck.theme,slides,i)),['','1/2','','2/2']);
  assert.deepEqual(deserialize(serialize(deck)),deck);
  deck.theme.titlePagination=true;
  assert.deepEqual(slides.map((_,i)=>slidePageNumber(deck.theme,slides,i)),['1/4','2/4','3/4','4/4']);
  deck.theme.pagination=false;
  assert.equal(slidePageNumber(deck.theme,slides,3),'');
});
test('totals recalculate from saved occurrences including missing slides, excluding unnumbered titles', () => {
  const deck=newDeck('Talk');deck.theme.pageNumberFormat='current-total';
  const title=newSlide('Title','intro'),slide=newSlide('Repeated');
  assert.equal(slidePageNumber(deck.theme,[title,slide,slide,null],2),'2/3');
  assert.equal(slidePageNumber(deck.theme,[title,slide],1),'1/1');
  assert.equal(slidePageNumber(deck.theme,[],0),'');
  assert.equal(slidePageNumber(deck.theme,[title],0),'');
  assert.equal(slidePageNumber(deck.theme,[slide],-1),'');
  assert.throws(()=>deserialize(serialize(deck).replace('current-total','bogus')),/page number format/);
});


test('new and legacy presentations default to current/total while explicit Current is preserved',()=>{
  const deck=newDeck('Talk'),slides=[newSlide('Title','intro'),newSlide('First')];
  assert.equal(slidePageNumber(deck.theme,slides,1),'1/1');
  const legacy=deserialize(serialize(deck).replace('  pageNumberFormat: current-total\n',''));
  assert.ok(legacy?.kind==='deck');
  assert.equal(slidePageNumber(legacy.theme,slides,1),'1/1');
  deck.theme.pageNumberFormat='current';
  const saved=deserialize(serialize(deck));assert.ok(saved?.kind==='deck');
  assert.equal(slidePageNumber(saved.theme,slides,1),'1');
});

test('Christmas Eve is a reversible deck preset and preserves slide content and numbering',()=>{
 const deck=newDeck('Winter'),slide=newSlide('Integral','content','$\\int_0^1 x\\,dx$');const before=serialize(slide);
 deck.theme=applyPresentationTheme(deck.theme,'Christmas Eve');
 assert.equal(deck.theme.palette,'christmas');assert.equal(deck.theme.mode,'dark');assert.equal(deck.theme.style,'uiuc');
 assert.equal(themeForSlide(deck,slide).palette,'christmas');assert.equal(serialize(slide),before);
 const loaded=deserialize(serialize(deck));assert.equal(loaded?.kind==='deck'&&loaded.theme.palette,'christmas');
 assert.equal(slidePageNumber(deck.theme,[slide],0),'1/1');
 const restored=applyPresentationTheme(deck.theme,'UIUC light');assert.equal(restored.palette,undefined);assert.equal(restored.navy,'#13294b');assert.equal(restored.accent,'#ff5f05');
 assert.equal(applyPresentationTheme(deck.theme,'Use individual slide themes').palette,undefined);
 assert.equal(applyPresentationTheme(deck.theme,'Fluid dynamics dark').palette,'fluid-dynamics');
});


test('Christmas Light preserves legacy Eve decks and Night is independently reversible',()=>{
 const deck=newDeck('Snowy night'),slide=newSlide('Math','content','$x^2$');const before=serialize(slide);
 const legacy=applyPresentationTheme(deck.theme,'Christmas Eve');
 const light=applyPresentationTheme(deck.theme,'Christmas Light');
 assert.deepEqual(light,legacy);assert.equal(presentationThemeLabel(legacy),'Christmas Light');
 deck.theme=applyPresentationTheme({...light,logo:'Our lab.svg'},'Christmas Night');
 assert.equal(deck.theme.palette,'christmas-night');assert.equal(deck.theme.logo,'Our lab.svg');
 assert.equal(presentationThemeLabel(deck.theme),'Christmas Night');
 const loaded=deserialize(serialize(deck));assert.ok(loaded?.kind==='deck');assert.deepEqual(loaded.theme,deck.theme);
 assert.equal(themeForSlide(loaded,slide).palette,'christmas-night');assert.equal(serialize(slide),before);
 assert.equal(slidePageNumber(loaded.theme,[slide],0),'1/1');
 assert.deepEqual(applyPresentationTheme(loaded.theme,'Christmas Light'),{...light,logo:'Our lab.svg'});
 assert.equal(applyPresentationTheme(loaded.theme,'UIUC dark').palette,undefined);
 assert.equal(applyPresentationTheme(loaded.theme,'Use individual slide themes').palette,undefined);
});


test('speaking notes preserve math, paragraphs, slide identity and block content across saves', () => {
  const slide = newSlide('Notes');
  slide.speakerNotes = 'A value $N_s=1$.\n\n$$\\Delta F=F-F_0$$\n\n<!-- slide-block:example -->';
  const loaded = deserialize(serialize(slide));
  assert.deepEqual(loaded, slide);
  assert.equal(loaded?.id, slide.id);
  assert.deepEqual(loaded?.kind === 'slide' && loaded.blocks, slide.blocks);
});
test('legacy slides need no notes field; clearing notes remains explicit', () => {
  const slide = newSlide('Legacy');
  assert.deepEqual(deserialize(serialize(slide)),slide);
  slide.speakerNotes='';
  assert.deepEqual(deserialize(serialize(slide)),slide);
});
