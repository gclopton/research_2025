const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function fixture() {
  const store={headers:[],refreshTree(){this.refreshed=(this.refreshed||0)+1;}};
  const exports={};
  const src=ts.transpileModule(fs.readFileSync('src/plugin.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  vm.runInNewContext(src,{exports,console,Promise,require(name){
    if(name==='obsidian')return {Plugin:class{},Notice:class{}};
    if(name==='./store')return {store};
    if(name==='./view')return {VIEW_TYPE:'research-outline'};
    return {};
  }});
  const plugin=new exports.QuietOutline();
  let view;
  plugin.app={workspace:{getMostRecentLeaf:()=>({view})},metadataCache:{getFileCache:()=>({headings:[{heading:'Note',level:1}]})}};
  return {plugin,store,setView(v){view=v;}};
}
test('presentation wins over stale Markdown metadata, jumps through provider, preserves tree on selection',async()=>{
  const f=fixture(), jumps=[];let active=0;
  f.setView({getViewType:()=> 'slide-studio-view',getResearchOutline:()=>({version:1,key:'deck:a',entries:[{heading:'Talk',level:1},{heading:'Slide',level:2}],active,jump:i=>jumps.push(i)})});
  f.plugin.refreshOutline();assert.equal(f.store.external,true);assert.equal(f.store.headers[0].heading,'Talk');
  const headers=f.store.headers;active=1;f.plugin.refreshOutline();assert.equal(f.store.headers,headers);assert.equal(f.store.externalActive,1);assert.equal(f.store.refreshed,1);
  f.store.jumpBy(f.plugin,1);await Promise.resolve();assert.deepEqual(jumps,[1]);
});
test('returning to notes restores note headers and clears external selection',()=>{
 const f=fixture();f.setView({getViewType:()=> 'slide-studio-view',getResearchOutline:()=>({version:1,key:'a',entries:[],active:-1,jump(){}})});f.plugin.refreshOutline();
 const note={getViewType:()=> 'markdown',file:{path:'note.md'}};f.setView(note);f.plugin.refreshOutline();assert.equal(f.store.external,false);assert.equal(f.store.externalActive,-1);assert.equal(f.store.headers[0].heading,'Note');assert.equal(f.plugin.current_note,note);
});
test('sidebar focus preserves provider; unsupported non-file main view clears stale outline',()=>{
 const f=fixture();f.setView({getViewType:()=> 'markdown',file:{path:'note.md'}});f.plugin.refreshOutline();
 f.setView({getViewType:()=> 'research-outline'});f.plugin.refreshOutline();assert.equal(f.store.headers[0].heading,'Note');
 f.setView({getViewType:()=> 'empty'});f.plugin.refreshOutline();assert.equal(f.store.headers.length,0);assert.equal(f.plugin.current_note,null);
});
