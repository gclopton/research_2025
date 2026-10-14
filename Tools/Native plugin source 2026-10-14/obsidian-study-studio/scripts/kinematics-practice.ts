/** Original practice questions; no imported chapter text or images are distributed. */
import {mkdirSync,existsSync,writeFileSync,readFileSync,readdirSync} from 'node:fs';
import {dirname} from 'node:path';
import {Definition,serialize,parseQuestion} from '../src/model';
import {embedSource,embeds} from '../src/note-authoring';
import {stringify} from 'yaml';
export const chapterRoot='Courses/Fluid Dynamics/Chapter 02 - Fluid Kinematics';
export const placement={courseId:'lab-fluid-dynamics',chapterId:'02-kinematics',title:'02 · Fluid Kinematics'};
export const questions:{section:string;definition:Definition;prompt:string;explanation:string}[]=JSON.parse(readFileSync(new URL('./kinematics-questions.json',import.meta.url),'utf8'));
export function writeFixtures(){for(const q of questions){const path=`fixtures/${chapterRoot}/Questions/${q.definition.id}.md`;const raw=serialize(q.definition,q.prompt,q.explanation).trimEnd()+String.fromCharCode(10);parseQuestion(raw,path);mkdirSync(dirname(path),{recursive:true});if(!existsSync(path))writeFileSync(path,raw);}
 // Place a chapter descriptor beside each existing chapter, based on stable assignments.
 function scan(path:string):string[]{return readdirSync(path,{withFileTypes:true}).flatMap(e=>e.isDirectory()?scan(path+'/'+e.name):[path+'/'+e.name]);}
 for(const path of scan('fixtures/Courses').filter(p=>p.includes('/Questions/')&&p.endsWith('.md'))){const q=parseQuestion(readFileSync(path,'utf8'),path),p=q.definition.chapters?.[0];if(!p)continue;const root=path.split('/Questions/')[0],target=root+'/Chapter.md';if(!existsSync(target))writeFileSync(target,`---\n${stringify({studyChapter:p})}---\n\n# ${p.title}\n\nQuestions created from notes in this chapter inherit its course and chapter.\n\n\`\`\`study-dashboard\n${p.courseId}\n\`\`\`\n`);}
 const groups=new Map<string,string[]>();for(const q of questions)groups.set(q.section,[...(groups.get(q.section)??[]),q.definition.id]);
 const review='# Kinematics practice: Sections 1–4\n\nOriginal practice questions for the lab. Automatic blanks match listed answers; explanations and drawings use self-assessment rubrics. This page is a compact test surface; the lab chapter also embeds these questions beside the relevant sections.\n\n'+[...groups].map(([s,ids])=>`## Section ${s}\n\n`+embedSource(ids,ids.length>1?'Section '+s+' review':undefined)).join('\n\n')+'\n';
 const target=`fixtures/${chapterRoot}/Sections 1–4 practice.md`;if(!existsSync(target))writeFileSync(target,review);
 console.log(`${questions.length} questions across ${groups.size} sections`);
}
if(process.argv.includes('--write'))writeFixtures();
if(process.argv.includes('--embed-lab')){
 const lab='/Users/gradyclopton/ObsidianVaults/study_studio_lab/',path=lab+chapterRoot+'/002 1h Fluid Kinematics - Lecture 2 - final draft.md';let raw=readFileSync(path,'utf8');const before=raw;const sections=[...new Set(questions.map(q=>q.section))];
 // Question IDs remain discoverable after temporary generation comments are cleaned up.
 const presentIds=new Set(embeds(raw).flatMap(block=>block.ids));
 const completedSections=new Set(sections.filter(section=>questions.filter(q=>q.section===section).some(q=>presentIds.has(q.definition.id))));
 const additions:{at:number;text:string}[]=[];
 for(const section of sections){const marker=`<!-- study-studio:kinematics:${section} -->`;if(raw.includes(marker)||completedSections.has(section))continue;const headings=[...raw.matchAll(/^#{1,3} ([0-9]+(?:\.[0-9]+)*)\.? .+$/gm)];const index=headings.findIndex(m=>m[1]===section);if(index<0)throw Error('Missing section '+section);const at=headings[index+1]?.index??raw.length;const ids=questions.filter(q=>q.section===section).map(q=>q.definition.id);for(const id of ids)if(!existsSync(lab+chapterRoot+'/Questions/'+id+'.md'))throw Error('Install fixtures first: '+id);additions.push({at,text:'\n'+marker+'\n'+embedSource(ids,ids.length>1?'Section '+section+' review':undefined)+'\n<!-- /study-studio:kinematics -->\n\n'});}
 for(const a of additions.sort((a,b)=>b.at-a.at))raw=raw.slice(0,a.at)+a.text+raw.slice(a.at);
 if(raw.replace(/\n<!-- study-studio:kinematics:[\d.]+ -->\n[\s\S]*?<!-- \/study-studio:kinematics -->\n\n/g,'')!==before.replace(/\n<!-- study-studio:kinematics:[\d.]+ -->\n[\s\S]*?<!-- \/study-studio:kinematics -->\n\n/g,''))throw Error('Source-preservation check failed.');
 if(raw!==before)writeFileSync(path,raw);console.log('Inserted '+additions.length+' practice blocks; original chapter content preserved.');
}
