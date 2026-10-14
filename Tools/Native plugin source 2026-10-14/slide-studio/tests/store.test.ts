import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { newDeck, newSlide, deserialize, serialize, type Deck } from '../src/model';

let Store: any, TFile: any;
before(async () => {
const temp = mkdtempSync(join(tmpdir(), 'slide-store-test-'));
const bundled = await build({
  stdin: { contents: "export { Store } from './src/store'; export { TFile } from 'obsidian';", resolveDir: process.cwd() },
  bundle: true, write: false, platform: 'node', format: 'cjs',
  plugins: [{ name: 'obsidian-test', setup(b) {
    b.onResolve({ filter: /^obsidian$/ }, () => ({ path: 'obsidian', namespace: 'test' }));
    b.onLoad({ filter: /.*/, namespace: 'test' }, () => ({ contents: 'export class TFile {} export const normalizePath = p => p;' }));
  } }],
});
const modulePath = join(temp, 'store.cjs');
writeFileSync(modulePath, bundled.outputFiles[0].text);
({ Store, TFile } = createRequire(resolve('package.json'))(modulePath));
rmSync(temp, { recursive: true });
});

function setup() {
  const files = new Map<string, any>(), raw = new Map<any, string>();
  const update = (f: any, path: string) => {
    f.path = path; f.name = path.split('/').pop(); f.basename = f.name.replace(/\.md$/, '');
    f.parent = { path: path.split('/').slice(0, -1).join('/') };
  };
  let failCopy = false;
  const app = {
    vault: {
      getAbstractFileByPath: (p: string) => files.get(p),
      createFolder: async (p: string) => { if(files.has(p)) throw Error('exists'); files.set(p, {path:p}); },
      create: async (p: string, text: string) => {
        if(files.has(p)) throw Error('exists');
        if (failCopy && p.includes('Slides/')) throw Error('disk full');
        const f = new TFile(); update(f, p); files.set(p, f); raw.set(f, text); return f;
      },
      read: async (f: any) => raw.get(f),
      process: async (f: any, cb: (s:string)=>string) => raw.set(f, cb(raw.get(f)!)),
      getMarkdownFiles: () => [...raw.keys()],
      trash: async (f: any) => { files.delete(f.path); raw.delete(f); },
    },
    metadataCache: { getFileCache: (f:any) => {
      const d = deserialize(raw.get(f)!); return {frontmatter: {'slide-studio': d?.kind}};
    } },
    fileManager: { renameFile: async (f:any, p:string) => {
      assert.ok(!files.has(p)); files.delete(f.path); update(f,p); files.set(p,f);
    } },
  };
  return { store: new Store(app), app, raw, files, fail: () => failCopy = true };
}

test('same-note presentations and concurrent names each get their own folder and title slide', async () => {
  const {store} = setup();
  const [a,b] = await Promise.all([store.createPresentation({title:'Talk'}, 'Course.md'), store.createPresentation({title:'Talk'}, 'Course.md')]);
  assert.equal(a.file.path, 'Presentations/Talk/Talk.md');
  assert.equal(b.file.path, 'Presentations/Talk 2/Talk.md');
  assert.equal(a.doc.slides[0].file, 'Presentations/Talk/Slides/Talk.md');
  assert.equal(b.doc.slides[0].file, 'Presentations/Talk 2/Slides/Talk.md');
  assert.notEqual(a.doc.slides[0].id, b.doc.slides[0].id);
});

test('independent deck copies preserve order, sections, theme and references but not slide/block IDs', async () => {
  const {store} = setup();
  const a = await store.createPresentation({title:'Talk'}, 'Course.md');
  const slide = await store.create(newSlide('Evidence', 'content', '![[images/figure.png]]'), store.slideFolder(a));
  a.doc.theme.titlePagination = true;
  a.doc.slides.push({id:slide.doc.id, file:slide.file.path, section:'Results'}, {id:slide.doc.id,file:slide.file.path,section:'Repeat'});
  a.raw = await store.save(a,a.doc);
  const b = await store.copyPresentation(a, 'Seminar');
  assert.equal(b.doc.slides.length,3);
  assert.deepEqual(b.doc.theme,a.doc.theme);
  assert.deepEqual(b.doc.slides.map((e:any)=>e.section),['','Results','Repeat']);
  assert.equal(b.doc.slides[1].id,b.doc.slides[2].id);
  const copy = await store.resolve(b.doc.slides[1]);
  assert.notEqual(copy.doc.id,slide.doc.id);
  assert.notEqual(copy.doc.blocks[0].id,slide.doc.blocks[0].id);
  assert.equal(copy.doc.source,slide.file.path);
  assert.equal(copy.doc.blocks[1].text,slide.doc.blocks[1].text);
  copy.doc.blocks[1].text='Changed in seminar'; await store.save(copy,copy.doc);
  assert.equal((await store.read(slide.file)).doc.blocks[1].text,'![[images/figure.png]]');
  const shared=await store.copyPresentation(a,'Shared',true);
  assert.deepEqual(shared.doc.slides,a.doc.slides);
});

test('missing slides and failed writes do not create a misleading partial deck', async () => {
  const {store,raw,fail} = setup();
  const a=await store.createPresentation({title:'Talk'});
  a.doc.slides.push({id:'missing',file:'missing.md',section:''});
  await assert.rejects(store.copyPresentation(a,'Broken'),/missing/);
  assert.equal(raw.size,2);
  a.doc.slides.pop(); fail();
  await assert.rejects(store.copyPresentation(a,'Disk failure'),/disk full/);
  assert.equal(raw.size,2);
});

test('legacy organization retains IDs and shared slides while moving exclusive slides', async () => {
  const {store,app} = setup();
  const slide=await store.create(newSlide('Only here'),'Slides');
  const shared=await store.create(newSlide('Shared'),'Slides');
  const entries=[slide,shared].map(r=>({id:r.doc.id,file:r.file.path,section:''}));
  const deck=newDeck('Legacy',entries);
  const file=await app.vault.create('Presentations/Legacy.md',serialize(deck));
  await store.create(newDeck('Other',[entries[1]]));
  const result=await store.organizePresentation(await store.read(file));
  assert.equal(result.file.path,'Presentations/Legacy/Legacy.md');
  assert.equal(result.doc.id,deck.id);
  assert.equal(slide.file.path,'Presentations/Legacy/Slides/Only here.md');
  assert.equal(shared.file.path,'Slides/Shared.md');
  assert.equal(result.doc.slides[0].file,slide.file.path);
  assert.equal((await store.read(slide.file)).doc.source,'Slides/Only here.md');
});

test('empty bin deletes only unused owned slides and keeps shared and note-linked slides', async () => {
  const {store,app,files} = setup();
  const a=await store.createPresentation({title:'Trash trial'});
  const used=await store.create(newSlide('Shared'),store.slideFolder(a));
  const linked=await store.create(newSlide('Linked'),store.slideFolder(a));
  await store.create(newDeck('Other',[{id:used.doc.id,file:used.file.path,section:''}]));
  const note=await app.vault.create('Citation.md','note');
  const get=app.metadataCache.getFileCache;
  (app.metadataCache as any).getFileCache=(f:any)=>f===note ? {links:[{link:linked.file.path}]} : get(f);
  (app.metadataCache as any).getFirstLinkpathDest=(path:string)=>files.get(path);
  const original=a.doc.slides[0].file;
  a.doc.trash=[...a.doc.slides,{id:used.doc.id,file:used.file.path,section:''},{id:linked.doc.id,file:linked.file.path,section:''}].map((entry:any,index:number)=>({entry,index,removedAt:'now'}));
  a.doc.slides=[];a.raw=await store.save(a,a.doc);
  const result=await store.emptyPresentationTrash(a);
  assert.equal(result.deleted,1);assert.equal(result.kept,2);
  assert.ok(!files.has(original));assert.ok(files.has(used.file.path));assert.ok(files.has(linked.file.path));
  assert.equal(result.record.doc.trash.length,0);
});

test('fragment imports remap groups and copy files independently while preserving sources', async () => {
  const {store,raw}=setup();
  const source=await store.createPresentation({title:'Source'},'Evidence.md');
  source.doc.sections=[{id:'parent',title:'Parent',footer:'Evidence'},{id:'child',title:'Child',parent:'parent'}];
  source.doc.slides[0].sectionId='child';source.raw=await store.save(source,source.doc);
  const target=await store.createPresentation({title:'Target'});
  const before=target.raw;
  const imported=await store.prepareImport(source.doc,target);
  assert.equal(imported.created.length,1);
  assert.notEqual(imported.deck.slides[0].id,source.doc.slides[0].id);
  assert.notEqual(imported.deck.sections[0].id,'parent');
  assert.equal(imported.deck.sections[1].parent,imported.deck.sections[0].id);
  assert.equal(imported.deck.slides[0].sectionId,imported.deck.sections[1].id);
  assert.equal(imported.created[0].doc.source,'Evidence.md');
  assert.equal(raw.get(target.file),before);
  const shared=await store.prepareImport(source.doc,target,true);
  assert.equal(shared.created.length,0);assert.equal(shared.deck.slides[0].id,source.doc.slides[0].id);
  const missing=structuredClone(source.doc);missing.slides.push({id:'absent',file:'absent.md',section:'',sectionId:'child'});
  const count=raw.size;await assert.rejects(store.prepareImport(missing,target),/missing/);assert.equal(raw.size,count);
});
