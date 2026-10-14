import {test} from 'node:test';import assert from 'node:assert/strict';
import {makeCodeBlank,fillCode,codeMarkers,normalizeCodeAnswer} from '../src/code-model';
import {parseQuestion,template,serialize,grade,makeAttempt} from '../src/model';
import {intakeDraft} from '../src/intake';
test('arbitrary keyword, partial-line and multiline blanks round trip exactly',()=>{
 const original='for x in values:\n    if x > 0:\n        print(x)\n';let source=original;const answers:Record<string,string>={};
 for(const [id,selection]of [['a','for'],['b','x > 0'],['c','        print(x)\n']]){const from=source.indexOf(selection),r=makeCodeBlank(source,from,from+selection.length,id);source=r.source;answers[id]=r.answer;}
 assert.equal(fillCode(source,answers),original);assert.equal(codeMarkers(source).length,3);assert.throws(()=>makeCodeBlank(source,1,10,'d'));assert.throws(()=>makeCodeBlank(source,0,0,'d'));
});
test('code matching preserves indentation, newlines and case; trimming is explicit',()=>{
 const q=parseQuestion(template('code','code-test','Code'),'code.md');q.definition.answers![0].accepted=['    return x\n    # done'];
 const score=(v:string)=>grade(q,{choices:[],blanks:{a:v}}).earned;
 assert.equal(score('    return x\n    # done'),1);assert.equal(score('    return x\r\n    # done'),1);assert.equal(score('return x # done'),0);assert.equal(score('    Return x\n    # done'),0);assert.equal(score('\treturn x\n    # done'),0);
 q.definition.answers![0].whitespace='trim-outer';assert.equal(score('return x\n    # done\n'),1);assert.equal(score('return x\n# done'),0);
});
test('code schema validates placeholders and supports multiline alternatives independently',()=>{
 const q=parseQuestion(template('code','code-test','Code'),'code.md');q.definition.answers![0].accepted=['for x in xs:\n    print(x)','for item in xs:\n    print(item)'];q.definition.courseIds=['course-a'];
 const copy=parseQuestion(serialize(q.definition,q.prompt,q.explanation),'copy.md');assert.equal(copy.definition.answers![0].accepted.length,2);assert.equal(grade(copy,{choices:[],blanks:{a:q.definition.answers![0].accepted[1]}}).earned,1);
 copy.definition.code!.source='{{blank:unknown}}';assert.throws(()=>serialize(copy.definition,copy.prompt));copy.definition.code!.source='{{blank:a}} {{blank:a}}';assert.throws(()=>serialize(copy.definition,copy.prompt));
});
test('code intake preserves fenced or raw source and starts with no invented blanks',()=>{
 const raw='for x in xs:\n    print(x)';const q=intakeDraft('code','id','Loop','```python\n'+raw+'\n```','q.md');assert.equal(q.definition.code!.source,raw);assert.equal(q.definition.answers!.length,0);assert.equal(intakeDraft('code','id','Loop',raw,'q.md').definition.code!.source,raw);
 assert.equal(normalizeCodeAnswer(' a  b '),' a  b ');
});
test('code attempt preserves original multiline response and never executes it',()=>{
 const q=parseQuestion(template('code','code-test','Code'),'code.md');const response={choices:[],blanks:{a:'import os\nos.remove("not-executed")'}};const a=makeAttempt(q,response,[],'attempt','test',new Date().toISOString(),'attempt');assert.equal(a.grade!.earned,0);assert.deepEqual(a.response,response);
});
test('code questions work in frozen exams and unified course history',async()=>{
 const {createSession,submitSession,parseSession}=await import('../src/exam-model');const {normalizeHistory}=await import('../src/history-model');
 const q=parseQuestion(template('code','code-test','Code'),'code.md');const e={version:1 as const,id:'code-exam',title:'Code',mode:'all' as const,allowBack:true,shuffleSections:false,sections:[{id:'s',title:'S',shuffleGroups:false,groups:[{id:'g',title:'G',shuffleQuestions:false,questions:[{id:'slot',questionId:'code-test',variants:'exact' as const}]}]}]};
 const session=createSession(e,[q],'session',()=>0,{id:'course-code',title:'Code course'});session.entries[0].response.blanks.a='print';const finished=submitSession(session),parsed=parseSession(JSON.stringify(finished));assert.equal(parsed.entries[0].result!.earned,1);
 const history=normalizeHistory([{kind:'exam',path:'s.json',raw:JSON.stringify(parsed)}]);assert.equal(history.rows[0].earned,1);assert.equal(history.rows[0].course!.id,'course-code');
});
test('all language fixtures validate and every listed answer alternative earns credit',async()=>{
 const {readdirSync,readFileSync}=await import('node:fs');let count=0;
 for(const name of readdirSync('fixtures/Study Studio/Questions').filter(name=>name.endsWith('.md'))){const q=parseQuestion(readFileSync('fixtures/Study Studio/Questions/'+name,'utf8'),name);if(q.definition.type!=='code')continue;count++;const base=Object.fromEntries(q.definition.answers!.map(a=>[a.id,a.accepted[0]]));for(const answer of q.definition.answers!)for(const value of answer.accepted)assert.equal(grade(q,{choices:[],blanks:{...base,[answer.id]:value}}).earned,q.definition.answers!.length);}
 assert.equal(count,16);
});
