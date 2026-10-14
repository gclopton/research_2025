/** Convert only the known generated Viscous Flow landing pages. Source notes stay untouched. */
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {parse,stringify} from 'yaml';
const lab='/Users/gradyclopton/ObsidianVaults/study_studio_lab';
const root=join(lab,'Courses/Viscous Fluid Flow');
const changes:{path:string;text:string}[]=[];
for(const entry of readdirSync(root,{withFileTypes:true}).filter(e=>e.isDirectory())){
 const path=join(root,entry.name,'Chapter.md');let raw:string;try{raw=readFileSync(path,'utf8');}catch{continue;}
 if(raw.includes('```study-chapter-home'))continue;
 const match=/^---\n([\s\S]*?)\n---\n/.exec(raw);if(!match)throw Error(path);
 const meta=parse(match[1]),c=meta.studyChapter;
 if(c?.courseId!=='viscous-fluid-flow')continue;
 const [intro,practice]=raw.slice(match[0].length).split('\n## Practice\n');
 if(!practice||!/^\s*Use the Practice page in the study library to work through sets, or open a set below\./.test(practice))throw Error('Unexpected note '+path);
 const tail=practice.replace(/^\s*Use the Practice page in the study library to work through sets, or open a set below\./,'').replace(/\n### [^\n]+\n\n```study-group\n[\s\S]*?```\n/g,'').trim();
 if(tail)throw Error('Preserve unrecognized content in '+path);
 const links=[...intro.matchAll(/\[\[([^|\]]+)\|([^\]]+)\]\]/g)].slice(1);
 if(!links.length)throw Error('No material '+path);
 if(links.length>1)c.parts=links.map((m,i)=>{const source=readFileSync(join(lab,m[1]+'.md'),'utf8');const headings=[...source.matchAll(/^#{1,2} (.+)$/gm)].map(h=>h[1].replace(/^\d+(?:\.\d+)*\.?\s*/,'' )).filter(h=>!/^Exercises|Notation|Symbols/i.test(h));return {number:i+1,title:headings[0]??m[2],path:m[1],description:headings.slice(1,3).join(' · ')};});
 else c.material=links[0][1];
 changes.push({path,text:`---\n${stringify(meta)}---\n\n# ${c.title}\n\n\`\`\`study-chapter-home\n\`\`\`\n`});
}
for(const c of changes)writeFileSync(c.path,c.text);
console.log(`Updated ${changes.length} chapter landing pages.`);
