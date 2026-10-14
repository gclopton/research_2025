export interface Rect {x:number;y:number;width:number;height:number}
export interface DiagramLabel extends Rect {id:string; math?:boolean; target?:{x:number;y:number}}
export interface DiagramDefinition {image:string;alt:string;minWidth?:number;covers:(Rect & {color:string})[];labels:DiagramLabel[]}
export function validateDiagram(d:any):string[]{
 const check=(ok:unknown,message:string)=>{if(!ok)throw Error(message);};
 const unit=(v:any)=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=1;
 const rect=(r:any)=>{check(r&&unit(r.x)&&unit(r.y)&&unit(r.width)&&unit(r.height)&&r.width>0&&r.height>0&&r.x+r.width<=1.000001&&r.y+r.height<=1.000001,'Diagram rectangles must fit inside the image (coordinates 0–1).');};
 check(d&&typeof d.image==='string'&&d.image.trim()&&!/^(?:[a-z]+:|\/)|(?:^|\/)\.\.(?:\/|$)/i.test(d.image),'Choose an image inside the vault.');
 check(d.minWidth===undefined||(Number.isFinite(d.minWidth)&&d.minWidth>=760&&d.minWidth<=2400),'Diagram minimum width must be between 760 and 2400 pixels.');
 check(typeof d.alt==='string'&&d.alt.trim(),'Provide an image description.');
 check(Array.isArray(d.covers)&&Array.isArray(d.labels)&&d.labels.length>0,'Add at least one diagram label.');
 d.covers.forEach((r:any)=>{rect(r);check(/^#[0-9a-f]{6}$/i.test(r.color),'Covers require an opaque six-digit hex color.');});
 return d.labels.map((r:any)=>{rect(r);check(typeof r.id==='string'&&/^[\w-]{1,100}$/.test(r.id),'Invalid diagram label ID.');check(r.math===undefined||typeof r.math==='boolean','Invalid label math mode.');check(r.target===undefined||(r.target&&unit(r.target.x)&&unit(r.target.y)),'Leader endpoints must be inside the image.');return r.id;});
}
export function moveRect(r:Rect,x:number,y:number){r.x=Math.max(0,Math.min(1-r.width,x));r.y=Math.max(0,Math.min(1-r.height,y));}
