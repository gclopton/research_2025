/** Screen-space slot selection, including gutters and wrapped rows. */
export type CardRect = {left:number;top:number;right:number;bottom:number};
export function gridSlot(rects: CardRect[], x:number, y:number): number {
  if (!rects.length) return 0;
  // Pick the nearest row by its vertical center; gutters belong to a real slot.
  const rows: {start:number;end:number;top:number;bottom:number}[]=[];
  rects.forEach((r,i)=>{
    const row=rows[rows.length-1];
    if(row && Math.abs(row.top-r.top)<3){row.end=i;row.bottom=Math.max(row.bottom,r.bottom);}
    else rows.push({start:i,end:i,top:r.top,bottom:r.bottom});
  });
  if(y<rows[0].top)return 0;
  if(y>rows[rows.length-1].bottom)return rects.length;
  const row=rows.reduce((best,r)=>Math.abs(y-(r.top+r.bottom)/2)<Math.abs(y-(best.top+best.bottom)/2)?r:best);
  for(let i=row.start;i<=row.end;i++)if(x<(rects[i].left+rects[i].right)/2)return i;
  return row.end+1;
}
/** Clamp the group as a whole, preserving its internal arrangement. */
export function translatePositions(points:{x:number;y:number}[], dx:number, dy:number) {
  dx=Math.max(dx, -Math.min(...points.map(p=>p.x)));
  dy=Math.max(dy, -Math.min(...points.map(p=>p.y)));
  return points.map(p=>({x:Math.round(p.x+dx),y:Math.round(p.y+dy)}));
}
