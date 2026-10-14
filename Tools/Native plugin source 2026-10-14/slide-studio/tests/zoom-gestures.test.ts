import {before,test} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
let ZoomViewport:any;
before(async()=>{
  const dir=mkdtempSync(join(tmpdir(),'slide-zoom-'));
  try {
    const result=await build({entryPoints:['src/zoom.ts'],bundle:true,write:false,platform:'node',format:'cjs',plugins:[{name:'obsidian-mock',setup(b){
      b.onResolve({filter:/^obsidian$/},()=>({path:'obsidian',namespace:'mock'}));
      b.onLoad({filter:/.*/,namespace:'mock'},()=>({contents:`export class Component {
        cleanups=[];load(){this.onload();}unload(){this.onunload();this.cleanups.forEach(f=>f());}
        register(f){this.cleanups.push(f);}registerDomEvent(el,type,fn,options){el.addEventListener(type,fn,options);this.register(()=>el.removeEventListener(type,fn,options));}
      }`}));
    }}]});
    const file=join(dir,'zoom.cjs');writeFileSync(file,result.outputFiles[0].text);({ZoomViewport}=createRequire(resolve('package.json'))(file));
  }finally{rmSync(dir,{recursive:true});}
  (globalThis as any).ResizeObserver=class{observe(){}disconnect(){}};
});
function event(type:string,props:Record<string,unknown>={}){const e=new Event(type,{cancelable:true});Object.assign(e,props);return e;}
class Mount extends EventTarget {
  style:any={};dataset:any={};reads=0;captured=new Set<number>();editable=false;
  classList={add(){},remove(){}};ownerDocument:any;
  closest(){return this.editable?this:null;}
  contains(el:any){return el===this;}
  getBoundingClientRect(){this.reads++;return {width:1000,height:700,left:0,top:0};}
  setPointerCapture(id:number){this.captured.add(id);}hasPointerCapture(id:number){return this.captured.has(id);}releasePointerCapture(id:number){this.captured.delete(id);}
}
function viewport(image=false){
  const mount=new Mount(),doc:any=new EventTarget();doc.defaultView=new EventTarget();doc.closest=()=>null;doc.activeElement=mount;mount.ownerDocument=doc;
  const surface:any={style:{}};const v=new ZoomViewport(mount,surface,()=>({width:1600,height:900}),{zoom:1,x:0,y:0},image);v.load();return {v,mount,doc,surface};
}
test('wheel zoom is pointer anchored; ordinary wheel pans only an enlarged slide',()=>{
  const {v,mount}=viewport();const plain=event('wheel',{deltaX:0,deltaY:40,deltaMode:0});mount.dispatchEvent(plain);assert.equal(plain.defaultPrevented,false);
  const zoom=event('wheel',{ctrlKey:true,deltaY:-40,deltaMode:0,clientX:650,clientY:350});mount.dispatchEvent(zoom);
  assert.equal(zoom.defaultPrevented,true);assert.ok(v.state.zoom>1);assert.ok(v.state.x<0);
  const x=v.state.x;mount.dispatchEvent(event('wheel',{deltaX:20,deltaY:0,deltaMode:0}));assert.equal(v.state.x,x-20);v.unload();
});
test('image drag captures and releases the pointer without reading layout during movement',()=>{
  const {v,mount}=viewport(true);v.zoom(2);const reads=mount.reads;
  mount.dispatchEvent(event('pointerdown',{button:0,pointerId:7,clientX:400,clientY:300}));
  mount.dispatchEvent(event('pointermove',{pointerId:7,clientX:500,clientY:340}));
  assert.equal(v.state.x,100);assert.equal(v.state.y,40);assert.equal(mount.reads,reads);assert.equal(mount.hasPointerCapture(7),true);
  mount.dispatchEvent(event('pointerup',{pointerId:7}));assert.equal(mount.hasPointerCapture(7),false);v.unload();
});
test('slide space-drag pans, while normal left drag stays available for editing',()=>{
  const {v,mount,doc}=viewport();v.zoom(2);
  const down=()=>event('pointerdown',{button:0,pointerId:3,clientX:400,clientY:300});
  const normal=down();mount.dispatchEvent(normal);assert.equal(normal.defaultPrevented,false);
  const space=event('keydown',{code:'Space'});doc.dispatchEvent(space);assert.equal(space.defaultPrevented,true);
  mount.dispatchEvent(down());mount.dispatchEvent(event('pointermove',{pointerId:3,clientX:450,clientY:300}));assert.equal(v.state.x,50);
  v.unload();assert.equal(mount.hasPointerCapture(3),false);
});
test('wheel over native text editing remains untouched',()=>{
  const {v,mount}=viewport();mount.editable=true;
  const wheel=event('wheel',{ctrlKey:true,deltaY:-50,deltaMode:0,clientX:500,clientY:350});mount.dispatchEvent(wheel);
  assert.equal(wheel.defaultPrevented,false);assert.equal(v.state.zoom,1);v.unload();
});
