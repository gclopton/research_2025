/** Portable set selection only: never include responses or local attempt contexts. */
export interface PracticeLink {title:string; ids:string[]; course?:string}
export function parsePracticeLink(params:Record<string,string>):PracticeLink {
 if(params.v!=='1')throw Error('Unsupported practice link version.');
 let ids:unknown;try {ids=JSON.parse(params.ids??'');}catch {throw Error('Invalid practice link questions.');}
 if(!Array.isArray(ids)||!ids.length||ids.length>1000||!ids.every(id=>typeof id==='string'&&/^[\w-]{1,200}$/.test(id))||new Set(ids).size!==ids.length)throw Error('Invalid practice link questions.');
 if(!params.title?.trim()||params.title.length>500)throw Error('Invalid practice link title.');
 if(params.course&&!/^[\w-]{1,100}$/.test(params.course))throw Error('Invalid practice link course.');
 return {title:params.title,ids,course:params.course||undefined};
}
export function practiceLink(vault:string,set:PracticeLink):string {
 const params={v:'1',title:set.title,ids:JSON.stringify(set.ids),...(set.course?{course:set.course}:{})};
 parsePracticeLink(params);
 return `obsidian://study-studio?${new URLSearchParams({vault,...params}).toString().replace(/\+/g,'%20')}`;
}
