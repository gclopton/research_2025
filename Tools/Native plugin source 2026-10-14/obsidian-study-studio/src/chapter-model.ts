export interface ChapterPlacement {courseId:string;chapterId:string;title:string}
export function validatePlacements(value:unknown,courses:string[]=[]):asserts value is ChapterPlacement[]|undefined {
 if(value===undefined)return;
 if(!Array.isArray(value)||!value.every(p=>p&&courses.includes(p.courseId)&&typeof p.chapterId==='string'&&/^[\w-]{1,100}$/.test(p.chapterId)&&typeof p.title==='string'&&p.title.trim())||new Set(value.map(p=>p.courseId)).size!==value.length)throw Error('Assign at most one named chapter per course, using a stable chapter ID.');
}
