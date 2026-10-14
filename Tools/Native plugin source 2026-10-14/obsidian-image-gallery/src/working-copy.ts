/** Rebase a cached, local Obsidian link without changing its caption or title. */
export function rebasePaperLink(original:string,path:string,fragment=''){
 if(original.startsWith('[[')||original.startsWith('![['))return original.replace(/^(\!?\[\[)[^|\]]+/,(_m,prefix)=>prefix+path+fragment);
 const at=original.lastIndexOf('](');if(at<0)return original;
 const start=at+2;let end=start;
 if(original[start]==='<'){end=original.indexOf('>',start)+1;if(end===0)return original;}
 else {let depth=0;for(;end<original.length;end++){const ch=original[end];if(ch==='\\'){end++;continue;}if(ch==='(')depth++;else if(ch===')'){if(!depth)break;depth--;}else if(/\s/.test(ch)&&!depth)break;}}
 const dest=encodeURI(path).replace(/#/g,'%23').replace(/\?/g,'%3F').replace(/</g,'%3C').replace(/>/g,'%3E')+fragment;
 return original.slice(0,start)+'<'+dest+'>'+original.slice(end);
}

/** A protected source may ignore an automatic shortening of a link only when
 * every link still resolves to the same file and every other byte is unchanged.
 * Ambiguous or unsupported syntax deliberately fails closed. */
export function equivalentLocalLinks(before:string,after:string,resolve:(link:string)=>string|undefined){
 const normalize=(text:string)=>text.replace(/!?\[\[[^\]\n]+\]\]|!?\[(?:\\.|[^\]\\])*\]\((?:<[^>\n]+>|(?:\\.|[^()\s]|\([^()\n]*\))+)(?:\s+"[^"]*")?\)/g,original=>{
  const wiki=original.startsWith('[[')||original.startsWith('![[');
  let link:string;
  if(wiki)link=original.slice(original.startsWith('!')?3:2,-2).split('|')[0];
  else {const tail=original.slice(original.lastIndexOf('](')+2);link=tail[0]==='<'?tail.slice(1,tail.indexOf('>')):tail.replace(/(?:\s+"[^"]*")?\)$/,'');}
  if(!link||link.startsWith('#')||/^[a-z][a-z\d+.-]*:/i.test(link))return original;
  let decoded:string;try{decoded=decodeURI(link);}catch{return original;}
  const at=decoded.indexOf('#'),path=at<0?decoded:decoded.slice(0,at),fragment=at<0?'':decoded.slice(at),target=resolve(path);
  return target?rebasePaperLink(original,target,fragment):original;
 });
 return before!==after&&normalize(before)===normalize(after);
}
