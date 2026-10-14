import {Attempt} from './model';
import {CourseContext} from './course-model';
import {PracticeReviewState} from './practice-review';
export const PRACTICE_SESSIONS='Study Studio/Practice sessions';
export const practiceSessionPath=(context:string)=>`${PRACTICE_SESSIONS}/${encodeURIComponent(context)}.json`;
export interface PracticeSession {version:1;kind:'practice-session';context:string;title:string;course?:CourseContext;finished:string;review:PracticeReviewState;attempts:Attempt[]}
export function freezePractice(context:string,title:string,course:CourseContext|undefined,review:PracticeReviewState,attempts:Attempt[],finished=new Date().toISOString()):PracticeSession {
 if(!attempts.length||new Set(attempts.map(a=>a.questionId)).size!==attempts.length||attempts.some(a=>a.context!==context||a.mode!=='attempt'||!a.grade||a.grade.pending))throw Error('Every question must be checked and graded before freezing this session.');
 return structuredClone({version:1,kind:'practice-session',context,title,course,finished,review,attempts});
}
export function parsePracticeSession(raw:string):PracticeSession {
 const s=JSON.parse(raw) as PracticeSession;
 if(s?.version!==1||s.kind!=='practice-session'||typeof s.context!=='string'||!Array.isArray(s.attempts)||!s.review)throw Error('Invalid practice session.');
 return freezePractice(s.context,s.title,s.course,s.review,s.attempts,s.finished);
}
