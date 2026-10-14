/** Extract inclusive source lines without allocating every line of a large note. */
export function sectionLines(source:string,first:number,last:number):string {
 let from=0;
 for(let line=0;line<first;line++){const end=source.indexOf('\n',from);if(end<0)return '';from=end+1;}
 let to=from;
 for(let line=first;line<=last;line++){const end=source.indexOf('\n',to);if(end<0)return source.slice(from);if(line===last)return source.slice(from,end);to=end+1;}
 return '';
}
