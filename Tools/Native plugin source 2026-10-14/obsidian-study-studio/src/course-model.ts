import {parse, parseDocument, stringify} from 'yaml';
export interface Course {version:1;id:string;title:string}
export type CourseContext = {id:string;title:string} | null;
const id=(v:unknown):v is string=>typeof v==='string'&&/^[\w-]{1,100}$/.test(v)&&!['all','unassigned'].includes(v);
export function validateCourseContext(v:unknown):asserts v is CourseContext {
 if(v===null)return;
 const c=v as Course;
 if(!c||!id(c.id)||typeof c.title!=='string'||!c.title.trim())throw Error('Invalid course context.');
}
export function validateMembership(v:unknown):asserts v is string[]|undefined {
 if(v!==undefined&&(!Array.isArray(v)||!v.every(id)||new Set(v).size!==v.length))throw Error('courseIds must be a list of unique stable course IDs.');
}
export function parseCourse(raw:string):Course {
 const m=/^---\r?\n([\s\S]*?)\r?\n---/.exec(raw),c=m?parse(m[1])?.studyCourse:undefined;
 if(!c||c.version!==1)throw Error('Expected studyCourse version 1.');validateCourseContext(c);return c as Course;
}
export function courseSource(course:Course){validateCourseContext(course);return `---\n${stringify({studyCourse:course})}---\n\n# ${course.title}\n`;}
export function replaceProperty(raw:string,key:string,value:unknown){
 const m=/^---\r?\n([\s\S]*?)\r?\n---/.exec(raw);if(!m)throw Error('Missing frontmatter.');const doc=parseDocument(m[1]);if(doc.errors.length)throw Error('Invalid frontmatter.');doc.set(key,value);return '---\n'+doc.toString()+'---'+raw.slice(m[0].length);
}
