import {parser,Table} from '@lezer/markdown';
export interface Cell {from:number;to:number;text:string}
export interface RichTable {from:number;to:number;raw:string;rows:Cell[][];align:('left'|'center'|'right')[]}
const markdownParser=parser.configure([Table]);
export function tableCells(text:string,offset:number):Cell[]{
 const pipes:number[]=[];for(let i=0;i<text.length;i++)if(text[i]==='|'){let escapes=0;for(let p=i-1;p>=0&&text[p]==='\\';p--)escapes++;if(escapes%2===0)pipes.push(i);}
 const start=/^\s*\|/.test(text)?pipes.shift()!+1:0,end=/\|\s*$/.test(text)&&pipes.length?pipes.pop()!:text.length;
 const bounds=[start-1,...pipes,end];return bounds.slice(0,-1).map((p,i)=>{const raw=text.slice(p+1,bounds[i+1]),left=raw.length-raw.trimStart().length,right=raw.trimEnd().length;return {from:offset+p+1+left,to:offset+p+1+Math.max(left,right),text:raw.trim()};});
}
export function richTables(source:string):RichTable[]{
 const out:RichTable[]=[];const tree=markdownParser.parse(source);
 for(let node=tree.topNode.firstChild;node;node=node.nextSibling){if(node.name!=='Table')continue;
  const rows:Cell[][]=[];let align:RichTable['align']=[];
  for(let row=node.firstChild;row;row=row.nextSibling){const cells=tableCells(source.slice(row.from,row.to),row.from);if(row.name==='TableDelimiter')align=cells.map(c=>c.text.endsWith(':')?(c.text.startsWith(':')?'center':'right'):'left');else if(row.name==='TableHeader'||row.name==='TableRow')rows.push(cells);}
  // Keep unusual ragged tables editable as Markdown instead of silently dropping cells.
  if(rows.length&&rows.every(r=>r.length===rows[0].length))out.push({from:node.from,to:node.to,raw:source.slice(node.from,node.to),rows,align});
 }return out;
}
export function cellMarkdown(text:string){return text.replace(/\r?\n/g,'<br>').replace(/(?<!\\)(?:\\\\)*\|/g,match=>match.slice(0,-1)+'\\|');}
export function imageSpans(source:string){
 const out:{from:number;to:number;raw:string;block:boolean}[]=[],excluded:{from:number;to:number}[]=[];
 const tree=markdownParser.parse(source);tree.iterate({enter(n){if(['FencedCode','CodeBlock','InlineCode'].includes(n.name)){excluded.push({from:n.from,to:n.to});return false;}if(n.name==='Image'){out.push({from:n.from,to:n.to,raw:source.slice(n.from,n.to),block:false});return false;}}});
 for(const m of source.matchAll(/!\[\[[^\]\n]+\]\]/g)){const from=m.index!,to=from+m[0].length;if(!excluded.some(r=>from<r.to&&to>r.from)&&!out.some(r=>from<r.to&&to>r.from))out.push({from,to,raw:m[0],block:false});}
 return out.map(r=>{const before=/<div class="study-image-align-(?:left|center|right)">\n\n$/.exec(source.slice(0,r.from)),after=/^\n\n<\/div>/.exec(source.slice(r.to));if(before&&after){const from=r.from-before[0].length,to=r.to+after[0].length;return {...r,from,to,raw:source.slice(from,to),block:true};}return {...r,block:!source.slice(source.lastIndexOf('\n',r.from-1)+1,r.from).trim()&&!source.slice(r.to,source.indexOf('\n',r.to)<0?source.length:source.indexOf('\n',r.to)).trim()};}).sort((a,b)=>a.from-b.from);
}
export function imageExtension(type:string,name:string){const types:Record<string,string>={'image/png':'png','image/jpeg':'jpg','image/gif':'gif','image/webp':'webp','image/avif':'avif','image/bmp':'bmp','image/svg+xml':'svg'};return types[type]??(/\.(png|jpe?g|gif|webp|avif|bmp|svg)$/i.exec(name)?.[1].toLowerCase());}

export type ImageAlignment='left'|'center'|'right';
export function imageAlignment(raw:string):ImageAlignment{return /study-image-align-(left|center|right)/.exec(raw)?.[1] as ImageAlignment??'left';}
export function alignImage(raw:string,alignment:ImageAlignment){const image=raw.replace(/^<div class="study-image-align-(?:left|center|right)">\n\n/,'').replace(/\n\n<\/div>$/,'');return `<div class="study-image-align-${alignment}">\n\n${image}\n\n</div>`;}
