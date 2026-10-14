import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {CATALOG_PATH,LEGACY_CATALOG_PATH,validateCatalog} from './library-model';

/** Keep the catalog outside movable paper folders. Only migrate an existing opted-in vault. */
export async function preparePaperCatalog(base:string):Promise<boolean>{
 const target=path.join(base,CATALOG_PATH),legacy=path.join(base,LEGACY_CATALOG_PATH);
 try{await fs.access(target);return true;}catch{}
 try{await fs.access(legacy);}catch{return false;}
 const lock=await fs.open(legacy+'.lock','wx');
 try{
  validateCatalog(JSON.parse(await fs.readFile(legacy,'utf8')));
  await fs.mkdir(path.dirname(target),{recursive:true});
  // Exclusive link creation prevents replacing another writer's catalog.
  await fs.link(legacy,target);await fs.unlink(legacy);
 }finally{await lock.close();await fs.unlink(legacy+'.lock');}
 return true;
}
