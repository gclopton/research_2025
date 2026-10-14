/** Image Gallery owns the paper catalog. Absence or failure means "not protected". */
export function isProtectedPaper(app:unknown,path:string):boolean{
 try{return (app as any)?.plugins?.getPlugin?.('image-gallery')?.api?.library?.isProtected?.(path)===true;}catch{return false;}
}
