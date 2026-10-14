import {parseDocument,stringify} from 'yaml';
export type Kind='figure'|'table';
export interface Common {id:string;kind:Kind;numbered:boolean;title:string;caption:string;captionVisible:boolean;captionPosition:'above'|'below'|'left'|'right'}
export interface Panel {path:string;caption:string;crop?:[number,number,number,number]}
export interface Figure extends Common {kind:'figure';columns:number;panels:Panel[]}
export interface Cell {text:string;rowspan?:number;colspan?:number;align?:'left'|'center'|'right';background?:string;backgroundOpacity?:number}
export interface Table extends Common {kind:'table';rows:(Cell|null)[][];headerRows:number;rowHeaders:boolean;style:'scientific'|'grid'|'striped'}
export type Scientific=Figure|Table;
export function newScientific(kind:Kind):Scientific{
 const base={id:crypto.randomUUID(),numbered:true,title:'',caption:'',captionVisible:true,captionPosition:'below' as const};
 return kind==='figure'?{...base,kind,columns:2,panels:[]}:{...base,kind,rows:Array.from({length:3},()=>Array.from({length:3},()=>({text:''}))),headerRows:1,rowHeaders:false,style:'scientific'};
}
export function validateScientific(v:any):asserts v is Scientific{
 if(!v||!['figure','table'].includes(v.kind)||typeof v.id!=='string'||!/^[\w-]+$/.test(v.id))throw Error('Invalid figure/table identity.');
 if(typeof v.numbered!=='boolean'||typeof v.captionVisible!=='boolean'||typeof v.caption!=='string'||typeof v.title!=='string'||!['above','below','left','right'].includes(v.captionPosition))throw Error('Invalid caption settings.');
 if(v.kind==='figure'){
  if(!Number.isInteger(v.columns)||v.columns<1||v.columns>6||!Array.isArray(v.panels)||v.panels.length>26)throw Error('Use 1–6 columns and at most 26 panels.');
  for(const p of v.panels){if(typeof p.path!=='string'||!p.path||typeof p.caption!=='string')throw Error('Choose an image for every panel.');if(p.crop&&(!Array.isArray(p.crop)||p.crop.length!==4||p.crop.some((x:any)=>typeof x!=='number'||!Number.isFinite(x)||x<0||x>1)||p.crop[2]<=0||p.crop[3]<=0||p.crop[0]+p.crop[2]>1.00001||p.crop[1]+p.crop[3]>1.00001))throw Error('Crop must stay inside the image.');}
 }else{
  if(!Array.isArray(v.rows)||!v.rows.length||v.rows.length>100||!Array.isArray(v.rows[0])||!v.rows[0].length||v.rows[0].length>30||!Number.isInteger(v.headerRows)||v.headerRows<0||v.headerRows>v.rows.length||typeof v.rowHeaders!=='boolean'||!['scientific','grid','striped'].includes(v.style))throw Error('Invalid table dimensions or style.');
  const width=v.rows[0].length,occupied=new Set<string>();
  for(let r=0;r<v.rows.length;r++){
   if(!Array.isArray(v.rows[r])||v.rows[r].length!==width)throw Error('Table rows must have equal width.');
   for(let c=0;c<width;c++){
    const cell=v.rows[r][c],key=r+':'+c;if(occupied.has(key)){if(cell!==null)throw Error('Merged cells overlap.');continue;}if(!cell||typeof cell.text!=='string')throw Error('Missing table cell.');
    if(cell.background!==undefined&&(typeof cell.background!=='string'||!/^#[a-f0-9]{6}$/i.test(cell.background)))throw Error('Cell background must be a six-digit hex color.');if(cell.backgroundOpacity!==undefined&&(!Number.isFinite(cell.backgroundOpacity)||cell.backgroundOpacity<0||cell.backgroundOpacity>1))throw Error('Cell tint strength must be between zero and one.');
    if(cell.align&&!['left','center','right'].includes(cell.align))throw Error('Invalid cell alignment.');
    const h=cell.rowspan??1,w=cell.colspan??1;if(!Number.isInteger(h)||!Number.isInteger(w)||h<1||w<1||r+h>v.rows.length||c+w>width)throw Error('Merged cell exceeds table boundary.');
    if(r<v.headerRows&&r+h>v.headerRows)throw Error('A merge cannot cross the header/body boundary.');
    for(let y=r;y<r+h;y++)for(let x=c;x<c+w;x++){const k=y+':'+x;if(occupied.has(k))throw Error('Merged cells overlap.');occupied.add(k);}
   }
  }
 }
}
export function parseScientific(kind:Kind,raw:string):Scientific {const d=parseDocument(raw,{uniqueKeys:true});if(d.errors.length)throw Error(d.errors[0].message);const v={...d.toJS({maxAliasCount:0}),kind};validateScientific(v);return v;}
export function scientificSource(v:Scientific){validateScientific(v);const {kind,...data}=v;return '```scientific-'+kind+'\n'+stringify(data,{lineWidth:0})+'```';}
export interface ScientificOccurrence {from:number;to:number;line:number;value:Scientific}
export function scientificBlocks(raw:string,parse:typeof parseScientific=parseScientific):ScientificOccurrence[]{
 const lines=raw.split('\n'),found:ScientificOccurrence[]=[];let offset=0,start=0,lineNumber=0,startLine=0,fence='',kind:Kind|undefined,body:string[]=[];
 for(const line of lines){const mark=line.match(/^ {0,3}(`{3,}|~{3,})([^\r]*)\r?$/);
  if(!fence&&mark){fence=mark[1];start=offset;startLine=lineNumber;kind=/^scientific-(figure|table)\s*$/.exec(mark[2])?.[1] as Kind|undefined;body=[];}
  else if(fence&&mark&&mark[1][0]===fence[0]&&mark[1].length>=fence.length&&!mark[2].trim()){if(kind)try{found.push({from:start,to:offset+line.length,line:startLine,value:parse(kind,body.join('\n'))});}catch{}fence='';kind=undefined;}
  else if(fence)body.push(line.replace(/\r$/,''));offset+=line.length+1;lineNumber++;
 }return found;
}
export function scientificNumbers(values:Scientific[]):Map<string,string>{const out=new Map<string,string>(),counts={figure:0,table:0};for(const v of values)if(v.numbered&&!out.has(v.id))out.set(v.id,String(++counts[v.kind]));return out;}
export function splitCell(t:Table,r:number,c:number){const cell=t.rows[r]?.[c];if(!cell)return;for(let y=r;y<r+(cell.rowspan??1);y++)for(let x=c;x<c+(cell.colspan??1);x++)if(y!==r||x!==c)t.rows[y][x]={text:'',align:cell.align,background:cell.background,backgroundOpacity:cell.backgroundOpacity};delete cell.rowspan;delete cell.colspan;}
export function mergeCells(t:Table,r0:number,c0:number,r1:number,c1:number){
 const top=Math.min(r0,r1),left=Math.min(c0,c1),bottom=Math.max(r0,r1),right=Math.max(c0,c1);
 if(top<t.headerRows&&bottom>=t.headerRows)throw Error('Select only header cells or only body cells.');
 const cells:Cell[]=[];for(let r=top;r<=bottom;r++)for(let c=left;c<=right;c++){const v=t.rows[r]?.[c];if(!v||(v.rowspan??1)!==1||(v.colspan??1)!==1)throw Error('Split existing merged cells before merging this range.');cells.push(v);}
 const text=cells.map(c=>c.text).filter(Boolean).join('\n');for(let r=top;r<=bottom;r++)for(let c=left;c<=right;c++)t.rows[r][c]=null;
 t.rows[top][left]={...cells[0],text,rowspan:bottom-top+1,colspan:right-left+1};
}
export function resizeTable(t:Table,rows:number,cols:number){
 if(rows<t.rows.length||cols<t.rows[0].length)throw Error('Use explicit row/column removal to avoid losing content.');
 if(rows>100||cols>30)throw Error('Table limit is 100 rows and 30 columns.');
 for(const row of t.rows)while(row.length<cols)row.push({text:''});while(t.rows.length<rows)t.rows.push(Array.from({length:cols},()=>({text:''})));
}
export function pasteCells(t:Table,row:number,col:number,text:string){const values=text.replace(/\r/g,'').replace(/\n$/,'').split('\n').map(r=>r.split('\t'));const copy=JSON.parse(JSON.stringify(t)) as Table;resizeTable(copy,Math.max(copy.rows.length,row+values.length),Math.max(copy.rows[0].length,col+Math.max(...values.map(r=>r.length))));for(let r=0;r<values.length;r++)for(let c=0;c<values[r].length;c++){const cell=copy.rows[row+r][col+c];if(!cell||(cell.rowspan??1)>1||(cell.colspan??1)>1)throw Error('Paste into unmerged cells.');cell.text=values[r][c];}validateScientific(copy);t.rows=copy.rows;}

/** Include the owner of every merged cell that intersects the selected rectangle. */
export function cellsInRange(t:Table,r0:number,c0:number,r1:number,c1:number):Cell[]{const top=Math.min(r0,r1),bottom=Math.max(r0,r1),left=Math.min(c0,c1),right=Math.max(c0,c1);return t.rows.flatMap((row,r)=>row.filter((cell,c)=>cell&&r<=bottom&&r+(cell.rowspan??1)>top&&c<=right&&c+(cell.colspan??1)>left)) as Cell[];}
