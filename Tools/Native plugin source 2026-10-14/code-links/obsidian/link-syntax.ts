// Study Studio owns blank:. Directory and reference-group syntax is opt-in.
export const reservedTarget = (target: string) => /^\s*blank:/i.test(target);
export const codeLinkRegex = () => /!?\{\{(?!\s*blank:)[^\n{}]+\}\}(?:\{height=\d+\})?/gi;
export type LinkToken={raw:string,index:number};
export function linkTokens(text:string):LinkToken[]{
 const result:LinkToken[]=[];
 const start=/!?\{\{|(?<!`)``dir:/g;let m:RegExpExecArray|null;
 while((m=start.exec(text))){
  const at=m.index;
  if(m[0].startsWith('``')){const end=text.indexOf('``',at+2);if(end<0||text.slice(at,end).includes('\n'))continue;result.push({raw:text.slice(at,end+2),index:at});start.lastIndex=end+2;continue;}
  let pos=at+(m[0][0]==='!'?3:2),depth=1;
  while(pos<text.length&&text[pos]!=='\n'&&depth){if(text.slice(pos,pos+2)==='{{'){depth++;pos+=2;}else if(text.slice(pos,pos+2)==='}}'){depth--;pos+=2;}else pos++;}
  if(depth)continue;
  let raw=text.slice(at,pos);
  if(/^!?\{\{\s*blank:/i.test(raw)){start.lastIndex=pos;continue;}
  const height=text.slice(pos).match(/^\{height=\d+\}/);if(height){raw+=height[0];pos+=height[0].length;}
  if(!raw.startsWith('{{links:')&&raw.slice(m[0].length,-2).includes('{{'))continue;
  result.push({raw,index:at});start.lastIndex=pos;
 }
 return result;
}
export function canonical(raw:string){return raw.startsWith('``dir:')?'{{'+raw.slice(2,-2)+'}}':raw;}
export function groupItems(raw:string):{label:string,items:string[]}|null{
 if(!raw.startsWith('{{links:'))return null;
 const sep=raw.indexOf('|');if(sep<0)throw Error('Use {{links:Label|{{code.py}}; [[Note]]}}');
 const label=raw.slice(8,sep).trim();if(!label)throw Error('Reference group needs a label');
 const body=raw.slice(sep+1,-2);const items:string[]=[];let at=0;
 const pattern=/\s*(?:;\s*)?(\{\{[^\n{}]+\}\}|\[\[[^\n]+?\]\]|\[[^\]\n]+\]\(https?:\/\/[^\s)]+\)|https?:\/\/[^\s;]+)\s*/y;
 while(at<body.length){pattern.lastIndex=at;const m=pattern.exec(body);if(!m)throw Error('Separate code, note or web links with semicolons');items.push(m[1]);at=pattern.lastIndex;if(items.length>40)throw Error('Use at most 40 references per group');}
 if(!items.length)throw Error('Reference group is empty');return {label,items};
}
export function linkLabel(raw:string){
 if(raw.startsWith('{{links:'))return raw.slice(8,raw.indexOf('|'));
 raw=canonical(raw);return raw.match(/\|([^}]*)\}\}/)?.[1]||raw.replace(/^!?\{\{|\}\}.*$/g,'').replace(/^dir:/,'');
}
