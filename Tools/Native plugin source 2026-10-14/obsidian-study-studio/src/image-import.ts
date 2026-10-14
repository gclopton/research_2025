import type {App} from 'obsidian';
import {imageExtension} from './rich-blocks';
export async function imageFolder(app:App,sourcePath:string){
 const parent=sourcePath.includes('/')?sourcePath.slice(0,sourcePath.lastIndexOf('/')):'';let dir=parent;
 while(dir){if(app.vault.getAbstractFileByPath(dir+'/Chapter.md'))return dir+'/figures';dir=dir.includes('/')?dir.slice(0,dir.lastIndexOf('/')):'';}
 return (parent?parent+'/':'')+'assets';
}
export async function importPromptImage(app:App,sourcePath:string,file:File){
 const ext=imageExtension(file.type,file.name);if(!ext)throw Error('Use a PNG, JPEG, GIF, WebP, AVIF, BMP, or SVG image.');
 const folder=await imageFolder(app,sourcePath);if(!app.vault.getAbstractFileByPath(folder)){try{await app.vault.createFolder(folder);}catch(e){if(!app.vault.getAbstractFileByPath(folder))throw e;}}
 const name='image-'+crypto.randomUUID()+'.'+ext;
 const saved=await app.vault.createBinary(folder+'/'+name,await file.arrayBuffer());
 // Vault-relative wikilink remains unambiguous even when the question moves.
 return `![[${saved.path}]]`;
}
