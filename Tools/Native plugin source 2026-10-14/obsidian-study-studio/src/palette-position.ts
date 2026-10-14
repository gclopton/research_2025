/** Keep the handle below native window controls, including in popout windows. */
export function palettePosition(x:number,y:number,width:number,height:number,viewportWidth:number,viewportHeight:number,headerBottom=40){
 const right=Math.max(8,viewportWidth-width-8),bottom=Math.max(8,viewportHeight-height-8),top=Math.min(bottom,Math.max(40,Math.min(80,headerBottom))+8);
 return {x:Math.max(8,Math.min(x,right)),y:Math.max(top,Math.min(y,bottom))};
}
