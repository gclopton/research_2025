import {App} from 'obsidian';
/** Feature-detected lookup preserves stored evidence paths while a library tracks renames. */
export function paperSourcePath(app:App,path:string):string {
 if(app.vault.getAbstractFileByPath(path))return path;
 return (app as any).plugins?.plugins?.['image-gallery']?.api?.library?.resolve(path)??path;
}
