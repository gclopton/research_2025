import {before, test} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtempSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {createRequire} from 'node:module';
import {newSlide, newDeck, applyPresentationTheme} from '../src/model';

let StudioView: any, TFile: any, filterJumpItems: any, jumpSlideNumber: any, matchesHotkey: any, Presenter: any;
before(async () => {
  const temp = mkdtempSync(join(tmpdir(), 'slide-navigation-'));
  try {
    const result = await build({
      stdin: {contents: "export {Presenter} from './src/presenter'; export {StudioView} from './src/view'; export {TFile} from 'obsidian'; export {filterJumpItems,jumpSlideNumber} from './src/jump-gallery'; export {matchesHotkey} from './src/studio-commands';", resolveDir: process.cwd()},
      bundle: true, write: false, platform: 'node', format: 'cjs', loader: {'.svg': 'dataurl'},
      plugins: [{name: 'obsidian-test', setup(b) {
        b.onResolve({filter: /^obsidian$/}, () => ({path: 'obsidian', namespace: 'test'}));
        b.onLoad({filter: /.*/, namespace: 'test'}, () => ({contents: `
          export class ItemView { constructor(leaf) {this.leaf=leaf; this.app=leaf.app;} async setState() {} }
          export class TFile {} export class FileSystemAdapter {} export const loadPdfJs = async () => ({});
          export class Component {} export class Plugin {} export class MarkdownView {}
          export class Setting {} export class Modal {} export class FuzzySuggestModal {} export class Notice {}
          export class Menu {} export class MarkdownRenderChild {} export class Scope { register(mods, key, handler) {this.handler=handler;} }
          export const MarkdownRenderer = {}; export const normalizePath = p => p;
          export const resolveSubpath = () => null;
        `}));
      }}],
    });
    const path = join(temp, 'view.cjs'); writeFileSync(path, result.outputFiles[0].text);
    ({StudioView, TFile, filterJumpItems, jumpSlideNumber, matchesHotkey, Presenter} = createRequire(resolve('package.json'))(path));
  } finally {rmSync(temp, {recursive: true});}
});
function view() {
  return Object.assign(Object.create(StudioView.prototype), {
    changingEditView: false, locked: false, inline: null, railScroll: 0,
    rail: {scrollTop: 270}, organizing: false, selectedSlides: new Set(),
    stage: {focus() {}, tabIndex: 0}, finishInline() {},
  });
}
function file(path: string) {return Object.assign(new TFile(), {path});}

test('double-click waits for pending deck save and targets the requested block exactly once', async () => {
  const v = view(), edited = view(), target = file('Slides/Repeated.md');
  const slide = newSlide('Repeated');
  edited.doc = slide; edited.record = {file: target};
  let resolveSave!: () => void, opens = 0, context: any, selected = '', editing = '';
  v.doc = newDeck('Deck'); v.record = {file: file('Deck.md')}; v.index = 8;
  v.leaf = {view: edited};
  v.flush = () => new Promise<void>(resolve => {resolveSave = resolve;});
  v.plugin = {open: async (_file: any, _leaf: any, c: any) => {opens++; context = c;}};
  edited.selectBlock = (id: string) => {selected = id;};
  edited.editInline = (b: any) => {editing = b.id; edited.inline = {id: b.id};};
  const pending = v.openDeckSlide(target, 8, v.leaf, slide.blocks[0].id);
  await v.openDeckSlide(target, 8, v.leaf, slide.blocks[0].id);
  assert.equal(opens, 0); resolveSave(); await pending;
  assert.equal(opens, 1); assert.equal(selected, slide.blocks[0].id); assert.equal(editing, selected);
  assert.deepEqual(context, {file: 'Deck.md', index: 8, railScroll: 270, organizing: false});
});

test('Escape commits the last edit before restoring deck position and scroll', async () => {
  const v = view(), events: string[] = [], states: any[] = [];
  v.presentation = {file: 'Deck.md', index: 8, railScroll: 270, organizing: false};
  v.finishInline = () => {events.push('finish');};
  v.flush = async () => {events.push('save');};
  v.palette = {hide: () => {events.push('hide');}};
  v.leaf = {setViewState: async (s: any) => {events.push('return'); states.push(s);}};
  await v.finishEditing();
  assert.deepEqual(events, ['finish', 'save', 'hide', 'return']);
  assert.deepEqual(states[0].state, {file: 'Deck.md', index: 8, deckView: v.presentation});
});

test('save conflicts prevent entering or leaving the editor; a failed save permits retry', async () => {
  const v = view(); let navigations = 0;
  v.presentation = {file: 'Deck.md', index: 2};
  v.doc = newDeck('Deck'); v.record = {file: file('Deck.md')};
  v.plugin = {open: async () => {navigations++;}};
  v.leaf = {setViewState: async () => {navigations++;}};
  v.flush = async () => {v.locked = true;};
  await v.openDeckSlide(file('Slide.md')); await v.finishEditing();
  assert.equal(navigations, 0);
  v.locked = false; v.flush = async () => {throw Error('disk full');};
  await assert.rejects(v.finishEditing(), /disk full/);
  v.flush = async () => {};
  await v.finishEditing(); assert.equal(navigations, 1);
});

test('standalone slide Escape exits text editing without changing views', async () => {
  const v = view(); let finished = false;
  v.finishInline = () => {finished = true;};
  v.flush = () => assert.fail('standalone exit should retain normal autosave');
  await v.finishEditing(); assert.ok(finished);
});

test('repeated slides retain their chosen occurrence and presentation theme when entering editing', async () => {
  const v = view(), slide = newSlide('Repeated'), slideFile = file('Slide.md'), deckFile = file('Deck.md');
  const deck = newDeck('Deck', [0, 1, 2].map(() => ({id: slide.id, file: slideFile.path, section: ''})));
  deck.theme = applyPresentationTheme(deck.theme, 'Fluid dynamics dark');
  const record = {file: slideFile, doc: slide}, deckRecord = {file: deckFile, doc: deck};
  v.doc = slide; v.record = record;
  v.app = {vault: {getAbstractFileByPath: () => deckFile}};
  v.plugin = {store: {read: async () => deckRecord, resolveMany: async () => [record, record, record]}};
  v.draw = async () => {};
  await v.setState({file: slideFile.path, presentation: {file: deckFile.path, index: 2}}, {});
  assert.equal(v.presentation.index, 2); assert.equal(v.presentationRecord.doc, deck);
  assert.deepEqual(v.editingTheme(slide), deck.theme);
});


test('view Escape scope consumes image-layout exit before global shortcuts without stealing text/modal keys', async () => {
  const v = new StudioView({app: {scope: {}}}, {});
  v.presentation = {file: 'Deck.md', index: 1};
  let finished = 0;
  v.finishEditing = async () => {finished++;};
  assert.equal(v.scope.handler({target: {closest: () => null}}), false);
  await Promise.resolve(); assert.equal(finished, 1);
  assert.equal(v.scope.handler({target: {closest: (s: string) => s.includes('input') ? {} : null}}), false);
  await Promise.resolve(); assert.equal(finished, 1);
});


test('Escape stays contained after returning to a deck and on standalone slides', async () => {
  const v = new StudioView({app: {scope: {}}}, {});
  let finishes = 0;
  v.finishEditing = async () => {finishes++;};
  for (const doc of [newDeck('Deck'), newSlide('Standalone')]) {
    v.doc = doc;
    for (const repeat of [false, true, false]) {
      assert.equal(v.scope.handler({repeat, target: {closest: () => null}}), false);
    }
  }
  await Promise.resolve(); assert.equal(finishes, 0);
  v.presentation = {file: 'Deck.md', index: 2};
  assert.equal(v.scope.handler({repeat: true, target: {closest: () => null}}), false);
  await Promise.resolve(); assert.equal(finishes, 0);
});

test('returning to a deck focuses its stage instead of the previous note', async () => {
  const v = view(), deckView = view(); let focused = false;
  v.presentation = {file: 'Deck.md', index: 4};
  v.flush = async () => {};
  deckView.record = {file: file('Deck.md')};
  deckView.stage.focus = () => {focused = true;};
  v.leaf = {view: deckView, setViewState: async () => {}};
  await v.finishEditing(); assert.ok(focused);
});

test('presentation actions do not proceed when returning from editing hits a save conflict', async () => {
  const v=view(); v.doc=newSlide('Draft'); v.presentation={file:'Deck.md',index:1};
  v.record={file:file('Slide.md')};
  v.finishEditing=async()=>{v.locked=true;};
  v.plugin={createSlideInPresentation:()=>assert.fail('must not create after failed save')};
  await v.runStudioAction('create-deck-slide');
  assert.ok(v.locked);
});

test('trash-selected action respects selection even if current slide is outside it', async () => {
  const v=view();
  const deck=newDeck('Deck',[0,1,2,3].map(i=>({id:String(i),file:`${i}.md`,section:''})));
  v.doc=deck;v.record={file:file('Deck.md')};v.index=0;v.selectedSlides=new Set([1,3]);
  v.change=(fn:()=>void)=>fn();
  await v.runStudioAction('trash-selected-slides');
  assert.deepEqual(deck.slides.map(e=>e.id),['0','2']);
  assert.deepEqual(deck.trash?.map(t=>t.entry.id),['3','1']);
});


test('gallery search prioritizes exact printed slide numbers and includes derived pages by title', () => {
  const items=[{index:0,number:1,title:'Title'},{index:1,title:'Outline · Motion'},{index:2,number:3,title:'Motion'},{index:3,number:13,title:'Motion again'}];
  assert.deepEqual(filterJumpItems(items,' 3 '),[items[2]]);
  assert.deepEqual(filterJumpItems(items,'motion'),items.slice(1));
  assert.deepEqual(filterJumpItems(items,'0'),[]);
});

test('scoped shortcuts distinguish modifiers and tolerate macOS Option-produced characters', () => {
  const key={modifiers:['Mod','Alt'],key:'g'};
  const event={metaKey:true,ctrlKey:false,altKey:true,shiftKey:false,key:'©',code:'KeyG'};
  assert.equal(matchesHotkey(event,key,true),true);
  assert.equal(matchesHotkey({...event,shiftKey:true},key,true),false);
  assert.equal(matchesHotkey({...event,metaKey:false,ctrlKey:true},key,false),true);
});


test('zoom commands do not finish text editing, change slide data, or save', async()=>{
  const v=view();v.doc=newSlide('Zoom');v.presentation={file:'deck.md',index:3};
  let factor=0, reset=0;v.viewport={zoom(n:number){factor=n;},reset(){reset++;}};
  v.finishEditing=()=>{throw Error('Zoom must not navigate');};v.flush=()=>{throw Error('Zoom must not save');};
  const before=JSON.stringify(v.doc);
  await v.runStudioAction('zoom-in');assert.equal(factor,1.25);
  await v.runStudioAction('zoom-out');assert.equal(factor,.8);
  await v.runStudioAction('zoom-fit');assert.equal(reset,1);assert.equal(JSON.stringify(v.doc),before);
});
test('conventional zoom shortcuts match physical keys without taking unrelated keys',()=>{
  const e={key:'=',code:'Equal',metaKey:true,ctrlKey:false,altKey:false,shiftKey:false};
  assert.equal(matchesHotkey(e,{key:'=',modifiers:['Mod']},true),true);
  assert.equal(matchesHotkey({...e,key:'+',shiftKey:true},{key:'=',modifiers:['Mod','Shift']},true),true);
  assert.equal(matchesHotkey({...e,altKey:true},{key:'=',modifiers:['Mod']},true),false);
  assert.equal(matchesHotkey({...e,key:'0',code:'Digit0'},{key:'0',modifiers:['Mod']},true),true);
});
test('image inspection owns playback keys so arrows cannot advance the slide',()=>{
  const p=Object.create(Presenter.prototype);p.imageViewer={};p.index=7;p.go=()=>{throw Error('Must not navigate');};
  p.key({key:'ArrowRight'});p.key({key:'Escape'});assert.equal(p.index,7);
});
test('closing image detail unloads only the image layer and preserves the slide',()=>{
  const p=Object.create(Presenter.prototype);const viewer={};p.imageViewer=viewer;p.index=7;
  let removed:any;p.removeChild=(v:any)=>removed=v;
  p.closeImage();assert.equal(removed,viewer);assert.equal(p.imageViewer,undefined);assert.equal(p.index,7);
  assert.ok(p.imageExitUntil>=Date.now());
});

test('numeric search includes numbered titles after the exact printed number without duplicates',()=>{
  const items=[{index:0,number:1,title:'69 observations'},{index:1,number:69,title:'Result 69'},{index:2,title:'Outline · 69 examples'},{index:3,number:169,title:'Unrelated'}];
  assert.deepEqual(filterJumpItems(items,'69'),[items[1],items[0],items[2]]);
  assert.deepEqual(filterJumpItems(items,'#69'),[items[1]]);
  assert.deepEqual(filterJumpItems(items,' # 069 '),[items[1]]);
  assert.deepEqual(filterJumpItems(items,'#169'),[items[3]]);
});
test('a numbered title remains discoverable when that printed number does not exist',()=>{
  const items=[{index:0,number:1,title:'1969: a result'},{index:1,number:2,title:'69'}];
  assert.deepEqual(filterJumpItems(items,'69'),items);
  assert.deepEqual(filterJumpItems(items,'#69'),[]);
  assert.deepEqual(filterJumpItems(items,'RESULT'),[items[0]]);
});


test('gallery numbers follow Grady and Wrong Convention including later title slides',()=>{
  const slides=[newSlide('Title','intro'),newSlide('69 reasons'),newSlide('Part two','intro'),newSlide('Motion')];
  const theme=newDeck('Deck').theme;
  const items=()=>slides.map((s,index)=>({index,title:s.title,number:jumpSlideNumber(theme,slides,index)}));
  assert.deepEqual(items().map(i=>i.number),[undefined,1,undefined,2]);
  assert.equal(filterJumpItems(items(),'#1')[0].index,1);
  assert.equal(filterJumpItems(items(),'69')[0].index,1);
  theme.titlePagination=true;
  assert.deepEqual(items().map(i=>i.number),[1,2,3,4]);
  assert.equal(filterJumpItems(items(),'#1')[0].index,0);
  assert.equal(filterJumpItems(items(),'#2')[0].index,1);
  theme.pagination=false;
  assert.deepEqual(items().map(i=>i.number),[undefined,undefined,undefined,undefined]);
  assert.deepEqual(filterJumpItems(items(),'#1'),[]);
  assert.equal(filterJumpItems(items(),'69')[0].index,1);
});


test('playback direct number entry follows printed numbers across generated pages and conventions',()=>{
  const p=Object.create(Presenter.prototype),deck=newDeck('Deck');
  p.record={doc:deck};p.records=[newSlide('Title','intro'),newSlide('Motion'),newSlide('69 reasons')].map(doc=>({doc}));
  p.pages=[{kind:'slide',index:0},{kind:'outline',beforeIndex:1},{kind:'slide',index:1},{kind:'slide',index:2},{kind:'references',index:0},{kind:'references',index:1}];
  p.search={hidden:true};p.index=0;p.go=(i:number)=>{p.index=i;};p.digits='1';
  p.key({key:'Enter',preventDefault(){}});assert.equal(p.index,2);
  deck.theme.titlePagination=true;p.digits='1';
  p.key({key:'Enter',preventDefault(){}});assert.equal(p.index,0);
});


test('gallery and playback search use current numbers when footer displays current/total',()=>{
  const p=Object.create(Presenter.prototype),deck=newDeck('Talk');
  deck.theme.pageNumberFormat='current-total';
  const slides=[newSlide('Title','intro'),newSlide('First'),newSlide('Last')];
  const items=slides.map((s,index)=>({index,title:s.title,number:jumpSlideNumber(deck.theme,slides,index)}));
  assert.deepEqual(items.map(i=>i.number),[undefined,1,2]);
  assert.equal(filterJumpItems(items,'#2')[0].index,2);
  p.record={doc:deck};p.records=slides.map(doc=>({doc}));
  p.pages=[{kind:'slide',index:0},{kind:'outline',beforeIndex:1},{kind:'slide',index:1},{kind:'slide',index:2},{kind:'references',index:0},{kind:'references',index:1}];
  p.search={hidden:true};p.go=(i:number)=>{p.index=i;};p.digits='2';
  p.key({key:'Enter',preventDefault(){}});assert.equal(p.index,3);
});

test('outline jump returns from editing before selecting and revealing the requested occurrence', async () => {
  const editor=view(), overview=view(), slide=newSlide('Repeated'), deck=newDeck('Deck');
  deck.slides=[0,1,2].map(()=>({id:slide.id,file:'Slide.md',section:''}));
  const records=deck.slides.map(()=>({doc:slide}));
  editor.doc=slide;editor.presentation={file:'Deck.md',index:0};editor.presentationRecord={doc:deck};editor.presentationRecords=records;
  overview.doc=deck;overview.outlineRecords=records;overview.index=0;
  const events:string[]=[];
  const leaf:any={view:editor};editor.leaf=leaf;overview.leaf=leaf;
  editor.app=overview.app={workspace:{setActiveLeaf(){events.push('focus');}}};
  editor.finishEditing=async()=>{events.push('save-and-return');leaf.view=overview;};
  overview.draw=async()=>{assert.equal(overview.revealOutlineSelection,true);events.push('draw');};
  const outline=editor.getResearchOutline();const target=outline.entries.findIndex((e:any)=>e.kind==='slide'&&e.slideIndex===2);
  await outline.jump(target);
  assert.deepEqual(events,['save-and-return','draw','focus']);assert.equal(overview.index,2);assert.deepEqual([...overview.selectedSlides],[2]);
});
test('outline jump cannot discard a conflicted slide draft', async()=>{
  const v=view(), slide=newSlide('Draft'),deck=newDeck('Deck');deck.slides=[{id:slide.id,file:'Draft.md',section:''}];
  v.doc=slide;v.presentation={file:'Deck.md',index:0};v.presentationRecord={doc:deck};v.presentationRecords=[{doc:slide}];v.leaf={view:v};
  v.finishEditing=async()=>{v.locked=true;};v.draw=()=>{throw Error('must not navigate');};
  await v.getResearchOutline().jump(1);assert.equal(v.doc,slide);
});

test('enlarged documents own playback keys and Escape preserves the slide',()=>{
 const p=Object.create(Presenter.prototype);p.index=7;
 let closed=0;p.documentViewer=()=>{closed++;p.documentViewer=undefined;};
 p.go=()=>{throw Error('Must not navigate');};
 p.close=()=>{throw Error('Must not close playback');};
 p.key({key:'ArrowRight'});assert.equal(closed,0);
 p.key({key:'Escape',preventDefault(){},stopPropagation(){}});
 assert.equal(closed,1);assert.equal(p.index,7);
});
