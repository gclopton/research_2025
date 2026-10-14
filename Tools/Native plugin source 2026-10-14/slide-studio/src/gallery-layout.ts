export const DEFAULT_THUMBNAIL_SIZE = 100;
export function thumbnailSize(value:number):number {
  return Number.isFinite(value)?Math.max(60,Math.min(300,Math.round(value/10)*10)):DEFAULT_THUMBNAIL_SIZE;
}
/** The original 230px minimum is the default. Columns adapt to available space. */
export function galleryColumns(width:number,size:number,gap=14):number {
  return Math.max(1,Math.floor((Math.max(0,width)+gap)/(230*thumbnailSize(size)/100+gap)));
}
/** Keep fractional pinch movement between events; round only for the slider. */
export function galleryWheelSize(size:number,delta:number,mode:number,height:number):number {
  const pixels=delta*(mode===1?16:mode===2?height:1);
  return Math.max(60,Math.min(300,size*Math.exp(-Math.max(-100,Math.min(100,pixels))*.005)));
}
