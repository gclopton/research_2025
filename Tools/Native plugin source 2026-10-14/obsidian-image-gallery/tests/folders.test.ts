import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, symlink, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {childFolders, scanFolder, cleanFolder, withinFolder} from '../src/folders';

test('folder scope distinguishes direct children, descendants and similar names',()=>{
  assert.equal(withinFolder('snb:src/a.py','src',false),true);
  assert.equal(withinFolder('snb:src/nested/a.py','src',false),false);
  assert.equal(withinFolder('snb:src/nested/a.py','src',true),true);
  assert.equal(withinFolder('snb:src-other/a.py','src',true),false);
  assert.equal(withinFolder('a.py','',false),true);
  assert.equal(withinFolder('src/a.py','',false),false);
  assert.equal(cleanFolder(' /src/nested/ '),'src/nested');
  assert.throws(()=>cleanFolder('../outside'));
  assert.throws(()=>cleanFolder('src/../../outside'));
});

test('external navigation and scans stay in the selected folder and skip symlinks',async()=>{
  const base=await mkdtemp(join(tmpdir(),'gallery-folders-'));
  try{
    await mkdir(join(base,'root/src/nested'),{recursive:true});
    await mkdir(join(base,'root/other'),{recursive:true});
    await mkdir(join(base,'outside'),{recursive:true});
    await mkdir(join(base,'root/.hidden'),{recursive:true});
    await mkdir(join(base,'root/node_modules'),{recursive:true});
    await writeFile(join(base,'root/src/a.py'),'a');
    await writeFile(join(base,'root/src/nested/b.py'),'b');
    await writeFile(join(base,'root/other/unrelated.py'),'other');
    await symlink(join(base,'outside'),join(base,'root/escape'));
    assert.deepEqual(await childFolders(join(base,'root'),''),['other','src']);
    assert.deepEqual(await childFolders(join(base,'root'),'src'),['nested']);
    const direct=await scanFolder(join(base,'root'),'src',false,()=>true,()=>false);
    assert.deepEqual(direct.paths,['src/a.py']);
    const recursive=await scanFolder(join(base,'root'),'src',true,()=>true,()=>false);
    assert.deepEqual(recursive.paths.sort(),['src/a.py','src/nested/b.py']);
    await assert.rejects(()=>childFolders(join(base,'root'),'escape'),/outside/);
    const cancelled=await scanFolder(join(base,'root'),'src',true,()=>true,()=>true);
    assert.deepEqual(cancelled.paths,[]);
    const capped=await scanFolder(join(base,'root'),'src',true,()=>true,()=>false,1);
    assert.equal(capped.paths.length,1);assert.equal(capped.capped,true);
  }finally{await rm(base,{recursive:true,force:true});}
});
