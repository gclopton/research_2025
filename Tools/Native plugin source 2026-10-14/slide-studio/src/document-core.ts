import {parse, stringify} from 'yaml';
export interface DocumentTarget {path:string; height:number; vault?:string; vaultId?:string}
export function parseDocument(source:string):DocumentTarget {
  const value=parse(source);
  const path=typeof value==='string'?value:value?.path;
  if(typeof path!=='string'||!path.trim()||/[\r\n]/.test(path))throw Error('Choose a note or PDF in this vault.');
  const height=typeof value==='object'?value?.height:undefined;
  if(height!==undefined&&(!Number.isFinite(height)||height<180||height>1200))throw Error('Panel height must be between 180 and 1200.');
  const vault=typeof value==='object'?value?.vault:undefined,vaultId=typeof value==='object'?value?.vaultId:undefined;
  if(vault!==undefined&&(typeof vault!=='string'||!vault.trim()||/[\r\n]/.test(vault)))throw Error('Invalid source vault.');
  if(vaultId!==undefined&&typeof vaultId!=='string')throw Error('Invalid source vault ID.');
  return {...(vault?{vault,vaultId}:{}),path:path.trim().replace(/^!?\[\[/,'').replace(/\]\]$/,'').split('|')[0],height:height??560};
}
export function documentSource(path:string,height=560,vault?:string,vaultId?:string){return '```document-view\n'+stringify({path,height,...(vault?{vault,vaultId}:{})})+'```';}
/** Render progressively at paragraph boundaries, never through fenced code or display math. */
export function documentChunks(source:string,limit=6000):string[] {
 const chunks:string[]=[];let lines:string[]=[],size=0,fence='',math=false;
 for(const line of source.split('\n')){
  const mark=line.match(/^\s{0,3}(`{3,}|~{3,})/);
  if(mark){if(!fence)fence=mark[1];else if(mark[1][0]===fence[0]&&mark[1].length>=fence.length)fence='';}
  if(!fence&&!mark&&(line.match(/(?<!\\)\$\$/g)?.length??0)%2)math=!math;
  lines.push(line);size+=line.length+1;
  if(size>=limit&&!line.trim()&&!fence&&!math){chunks.push(lines.join('\n'));lines=[];size=0;}
 }
 if(lines.length)chunks.push(lines.join('\n'));
 return chunks;
}

/** Only intercept an empty embed at the caret, outside literal code/frontmatter. */
export function emptyDocumentEmbed(text:string,offset:number):{start:number;end:number}|undefined {
 if(text.slice(offset-3,offset)!=='![['||text[offset-4]==='\\')return;
 const before=text.slice(0,offset-3),line=before.slice(before.lastIndexOf('\n')+1);
 if(/^ {4}|^\t/.test(line))return;
 let fence='';
 for(const row of before.split('\n')){const m=row.match(/^\s{0,3}(`{3,}|~{3,})/);if(m){if(!fence)fence=m[1];else if(m[1][0]===fence[0]&&m[1].length>=fence.length)fence='';}}
 if(fence||(line.match(/`/g)?.length??0)%2)return;
 if(/^---\r?\n/.test(before)&&!/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/.test(before))return;
 return {start:offset-3,end:offset+(text.slice(offset,offset+2)===']]'?2:0)};
}
