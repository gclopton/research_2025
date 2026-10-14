/** Formatting-only normalization with offsets into the rendered source. Never changes words or numbers. */
export function citationText(raw:string){
 const text:string[]=[],starts:number[]=[],ends:number[]=[];
 const ligatures:Record<string,string>={'ﬀ':'ff','ﬁ':'fi','ﬂ':'fl','ﬃ':'ffi','ﬄ':'ffl','‘':"'",'’':"'",'“':'"','”':'"'};
 for(const part of raw.matchAll(/\P{M}\p{M}*|\p{M}+/gu)){
  const i=part.index!,end=i+part[0].length,character=part[0].normalize('NFC');
  if(character==='\u00ad'||character==='\u200b')continue;
  const value=/^\s+$/.test(character)?' ':ligatures[character]||character;
  if(value===' '&&text.at(-1)===' '){ends[ends.length-1]=end;continue;}
  // Offsets use UTF-16, like String.indexOf and DOM Text offsets.
  for(let j=0;j<value.length;j++){text.push(value[j]);starts.push(i);ends.push(end);}
 }
 return {text:text.join(''),starts,ends};
}
export type CitationMatch={from:number;to:number;status:'exact'|'formatting'|'context-changed'};
export function locateCitation(raw:string,s:{quote?:string;before?:string;after?:string}):CitationMatch|null{
 const source=citationText(raw),quote=citationText(s.quote||'').text.trim();if(!quote)return null;
 const before=citationText(s.before||'').text.trim(),after=citationText(s.after||'').text.trim();
 const word=(c:string)=>/[\p{L}\p{N}\p{M}_]/u.test(c);
 const all:number[]=[],context:number[]=[];let at=-1;
 while((at=source.text.indexOf(quote,at+1))>=0){
  // A saved fragment must not attach inside a different word or numeric value.
  const previous=source.text[at-1]||'',next=source.text[at+quote.length]||'';
  if(word(quote[0])&&word(previous)||word(quote.at(-1)!)&&word(next))continue;
  if(/^\d/.test(quote)&&/[+−-]/.test(previous))continue;
  if(/^\d/.test(quote)&&previous==='.'&&/\d/.test(source.text[at-2]||''))continue;
  if(/\d$/.test(quote)&&next==='.'&&/\d/.test(source.text[at+quote.length+1]||''))continue;
  all.push(at);
  if(before&&!source.text.slice(0,at).trimEnd().endsWith(before))continue;
  if(after&&!source.text.slice(at+quote.length).trimStart().startsWith(after))continue;
  context.push(at);
 }
 const found=context.length===1?context[0]:all.length===1?all[0]:undefined;if(found===undefined)return null;
 const from=source.starts[found],to=source.ends[found+quote.length-1];
 return {from,to,status:context.length!==1?'context-changed':raw.slice(from,to)===(s.quote||'').trim()?'exact':'formatting'};
}
