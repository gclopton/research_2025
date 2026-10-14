import {embeds,embedSource,replaceEmbed} from './note-authoring';
/** Move only explicitly selected standalone occurrences. Surrounding prose is untouched. */
export function groupOccurrences(source:string,lines:number[],title:string,prompt=''){
 const chosen=embeds(source).filter(b=>!b.group&&lines.includes(source.slice(0,b.start).split('\n').length-1));
 if(chosen.length!==new Set(lines).size||!chosen.length)throw Error('Selected cards changed. Select the questions again.');
 const ids=chosen.flatMap(b=>b.ids);if(new Set(ids).size!==ids.length)throw Error('Select only one occurrence of each question for this group.');
 for(const block of [...chosen].reverse())source=replaceEmbed(source,block,block===chosen[0]?embedSource(ids,title,prompt):'');
 return source;
}
