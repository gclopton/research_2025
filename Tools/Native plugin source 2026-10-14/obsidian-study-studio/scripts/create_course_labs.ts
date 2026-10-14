import {mkdirSync,existsSync,writeFileSync,readFileSync} from 'node:fs';import {dirname} from 'node:path';
import {Definition,serialize} from '../src/model';import {courseSource} from '../src/course-model';import {serializeExam} from '../src/exam-model';
const save=(path:string,text:string)=>{const p='fixtures/'+path;mkdirSync(dirname(p),{recursive:true});if(!existsSync(p))writeFileSync(p,text);};
const groups:Record<string,string[]>={};
function question(course:string,id:string,title:string,type:Definition['type'],concepts:string[],prompt:string,extra:Partial<Definition>,explanation=''){
 const [chapterId,chapterTitle]=course==='Calculus'?(['calc-definite','calc-order','calc-draw'].includes(id)?['02-definite','02 · Definite integrals']:['01-antiderivatives','01 · Antiderivatives']):course==='French'?(id==='french-greeting'||id==='french-intro'?['01-introductions','01 · Greetings and introductions']:['02-sentences','02 · Simple sentences']):course==='Python'?(id==='python-tests'?['02-testing','02 · Testing']:['01-iteration','01 · Iteration and comprehensions']):['02-kinematics','02 · Fluid Kinematics'];
 extra.chapters=[{courseId:'lab-'+course.toLowerCase().replaceAll(' ','-'),chapterId,title:chapterTitle}];
 (groups[course]??=[]).push(id);save(`Courses/${course}/Chapter ${chapterTitle.replace(' · ',' - ')}/Questions/${title}.md`,serialize({version:1,id,title,type,concepts,courseIds:['lab-'+course.toLowerCase().replaceAll(' ','-')],...extra},prompt,explanation));
}
question('Calculus','calc-antiderivative','Recognize an antiderivative','choice',['Antiderivatives'],'Which function has derivative $2x$ for every real $x$?',{choices:[{id:'a',text:'$x^2+7$'},{id:'b',text:'$2x^2$'},{id:'c',text:'$2$'}],correct:['a'],shuffle:true},'Differentiating $x^2+7$ gives $2x$. The constant has derivative zero.');
question('Calculus','calc-power','Power rule exponent','blank',['Antiderivatives','Power rule'],'For $n\\ne -1$, $\\int x^n\\,dx$ has a power of $x$ equal to {{blank:power}} and an arbitrary constant denoted {{blank:constant}}.',{answers:[{id:'power',accepted:['n+1','n + 1']},{id:'constant',accepted:['C','c']}]},'The antiderivative is $x^{n+1}/(n+1)+C$.');
question('Calculus','calc-table','Basic integral table','table',['Antiderivatives','Power rule'], 'Complete each antiderivative. Include $+C$. Use Math Studio if useful.',{table:{columns:['Integrand','Antiderivative'],rows:[[{text:'$1$'},{text:'$x+C$'}],[{text:'$2x$'},{blank:'a'}],[{text:'$\\cos x$'},{blank:'b'}]]},answers:[{id:'a',accepted:['x^2+C','x^{2}+C','x^2 + C']},{id:'b',accepted:['\\sin x+C','\\sin(x)+C','sin x + C']}]},'Differentiate each answer to check it. Automatic matching uses listed alternatives, so an equivalent form may need manual review.');
question('Calculus','calc-definite','Evaluate a definite integral','blank',['Definite integrals','Fundamental theorem'],'Evaluate $\\int_0^2 2x\\,dx$: {{blank:value}}.',{answers:[{id:'value',accepted:['4']}]},'$[x^2]_0^2=4-0=4$.');
question('Calculus','calc-order','Steps for a definite integral','ordering',['Fundamental theorem'],'Arrange the steps for evaluating $\\int_a^b f(x)\\,dx$ when $f$ is continuous.',{choices:[{id:'a',text:'Find $F$ with $F\\prime=f$.'},{id:'b',text:'Evaluate $F(b)$ and $F(a)$.'},{id:'c',text:'Subtract $F(b)-F(a)$.'}],correct:['a','b','c'],shuffle:true});
question('Calculus','calc-explain','Why include the constant','short-answer',['Antiderivatives'],'Explain why an indefinite integral includes an arbitrary constant, and why adding a constant to an antiderivative does not change a definite integral.',{written:{reference:'Functions differing by a constant have the same derivative. The indefinite integral describes this family. In a definite integral, $(F(b)+C)-(F(a)+C)=F(b)-F(a)$.',rubric:[{id:'derivative',text:'Explains that the derivative of a constant is zero.'},{id:'family',text:'Identifies a family of antiderivatives.'},{id:'cancel',text:'Shows or explains cancellation at the endpoints.'}]}});
question('Calculus','calc-draw','Sketch a signed area','drawing',['Definite integrals','Signed area'],'Sketch $y=x$ from $x=-1$ to $x=1$. Shade the two regions and explain on the drawing why the definite integral is zero.',{written:{reference:'A straight line through the origin forms equal triangular regions below and above the x-axis. The negative contribution cancels the positive contribution.',rubric:[{id:'axes',text:'Labels the axes and endpoints -1 and 1.'},{id:'line',text:'Draws y=x through the origin with both regions shaded.'},{id:'sign',text:'Indicates equal areas with opposite signs and total zero.'}]}});
question('French','french-greeting','Choose a greeting','choice',['Greetings'],'Which greeting is appropriate during the day?',{choices:[{id:'a',text:'Bonjour'},{id:'b',text:'Au revoir'},{id:'c',text:'Merci'}],correct:['a'],shuffle:true},'Bonjour is a daytime greeting; au revoir is goodbye and merci is thank you.');
question('French','french-etre','Complete être','blank',['Present tense','Être'],'Je {{blank:a}} étudiant. Nous {{blank:b}} à Paris.',{answers:[{id:'a',accepted:['suis']},{id:'b',accepted:['sommes']}]},'Je suis; nous sommes.');
question('French','french-order','Order a simple sentence','ordering',['Word order'],'Arrange the words to say “I speak French.”',{choices:[{id:'a',text:'Je'},{id:'b',text:'parle'},{id:'c',text:'français.'}],correct:['a','b','c'],shuffle:true});
question('French','french-intro','Introduce yourself','short-answer',['Greetings','Present tense'],'Write two French sentences introducing yourself and naming a language you speak. Invent a name if you like.',{written:{reference:'Bonjour, je m’appelle Camille. Je parle français. Many other introductions are valid.',rubric:[{id:'intro',text:'Gives an understandable introduction using correct first-person grammar.'},{id:'language',text:'Names a language with a correct form of parler.'}]}});
question('Python','python-range','Read range bounds','choice',['Iteration','Range'],'What does list(range(3)) produce?',{choices:[{id:'a',text:'`[0, 1, 2]`'},{id:'b',text:'`[1, 2, 3]`'},{id:'c',text:'`[0, 1, 2, 3]`'}],correct:['a'],shuffle:true},'The start defaults to zero and the stop is excluded.');
question('Python','python-comprehension','Complete a list comprehension','code',['Comprehensions','Filtering'],'Build the squares of even integers from 0 through 5.',{code:{language:'python',source:'squares = [n**2 {{blank:loop}} n in range(6) {{blank:condition}} n % 2 == 0]'},answers:[{id:'loop',accepted:['for'],whitespace:'exact'},{id:'condition',accepted:['if'],whitespace:'exact'}]},'The result is [0, 4, 16].');
question('Python','python-loop','Complete a loop body','code',['Iteration','Accumulation'],'Complete the body to sum the values in numbers.',{code:{language:'python',source:'total = 0\nfor value in numbers:\n{{blank:body}}\nprint(total)'},answers:[{id:'body',accepted:['    total += value','    total = total + value'],whitespace:'exact'}]},'Indent the loop body by four spaces. Both listed accumulation forms are accepted.');
question('Python','python-order','Order the accumulator steps','ordering',['Accumulation'],'Put the steps in order to compute a total.',{choices:[{id:'a',text:'Initialize the total to zero.'},{id:'b',text:'Visit each value and add it to the total.'},{id:'c',text:'Return the total after the loop.'}],correct:['a','b','c'],shuffle:true});
question('Python','python-tests','Explain boundary tests','short-answer',['Testing'],'Describe tests for a function that returns the mean of a list. Explain what you would do about an empty list.',{written:{reference:'Use known results, a one-element list, mixed signs, and an explicit empty-input contract. An empty mean is undefined; the implementation may raise a documented exception. Test that contract.',rubric:[{id:'ordinary',text:'Includes ordinary cases with known expected values.'},{id:'boundary',text:'Includes a one-element case and specifies empty-list behavior.'},{id:'check',text:'Explains how the tests check the documented contract.'}]}});
question('Fluid Dynamics','fluid-pathline','Identify a pathline','choice',['Particle paths'],'Which description defines a pathline?',{choices:[{id:'a',text:'The trajectory of one identified fluid particle over time.'},{id:'b',text:'A curve tangent to the velocity field at one instant.'},{id:'c',text:'All particles that have passed through a fixed release point.'}],correct:['a'],shuffle:true},'The other descriptions refer to streamlines and streaklines.');
question('Fluid Dynamics','fluid-strain','Uniform translation and strain','short-answer',['Linear strain','Velocity gradients'],'Two faces of a small element have velocities $u(x)$ and $u(x+\\Delta x)$. Explain why uniform translation causes no stretching and derive the local linear strain rate.',{written:{reference:'The length changes at rate $u(x+\\Delta x)-u(x)$. Divide by $\\Delta x$ and take the local limit to obtain $\\partial u/\\partial x$. Uniform translation has equal face velocities, so the difference and strain rate are zero.',rubric:[{id:'difference',text:'Uses the difference of face velocities as the length-change rate.'},{id:'normalize',text:'Divides by the element length and takes the local limit.'},{id:'uniform',text:'Explains why equal velocities give zero stretching.'}]}});
const lessons:Record<string,string>={
 Calculus:String.raw`# Introduction to integrals

An antiderivative reverses differentiation: $F'(x)=f(x)$. Since constants differentiate to zero, an indefinite integral describes a family, $\int f(x)\,dx=F(x)+C$.

For example, $\int 2x\,dx=x^2+C$. More generally, $\int x^n\,dx=x^{n+1}/(n+1)+C$ for $n\ne -1$ on an interval where the functions are defined. The case $n=-1$ gives $\ln|x|+C$ on an interval excluding zero.

## Check the idea

\`\`\`study
calc-antiderivative
\`\`\`

## Definite integrals

For a continuous function, the definite integral measures signed accumulation. The fundamental theorem gives

$$\int_a^b f(x)\,dx=F(b)-F(a).$$

Thus $\int_0^2 2x\,dx=2^2-0^2=4$. Contributions below the x-axis count negatively. In particular, $\int_{-1}^1x\,dx=0$, although the total geometric area is positive.

## Review together

\`\`\`study-group
title: Integral practice
questions:
  - calc-power
  - calc-table
  - calc-definite
  - calc-order
  - calc-explain
  - calc-draw
\`\`\`
`,
 French:'# Greetings and simple sentences\n\nBonjour is a daytime greeting. To introduce yourself, use “Je m’appelle…”; to name a language, use “Je parle français.” The present tense of être includes “je suis” and “nous sommes”. Accents are part of spelling.\n',
 Python:'# Iteration and comprehensions\n\nPython uses indentation to group a loop body. The stop in range is excluded.\n\n```python\ntotal = 0\nfor value in [1, 2, 3]:\n    total += value\n\nsquares = [n**2 for n in range(6) if n % 2 == 0]\n```\n\nThe total is 6; squares is [0, 4, 16]. A comprehension combines an expression, an iteration clause, and an optional filter.\n',
 'Fluid Dynamics':'# Fluid kinematics review\n\nThe imported chapter is a separate local copy with its own figures. Use it to test selecting definitions, creating questions, and keeping a review group alongside a long mathematical chapter.\n\n[[Courses/Fluid Dynamics/Chapter 02 - Fluid Kinematics/002 1h Fluid Kinematics - Lecture 2 - final draft|Open the copied chapter]]\n'};
for(const course of Object.keys(groups)){
 const courseId='lab-'+course.toLowerCase().replaceAll(' ','-'),ids=groups[course],contentRoot=course==='Fluid Dynamics'?`Courses/${course}/Chapter 02 - Fluid Kinematics`:`Courses/${course}`;
 save(`Courses/${course}/Course.md`,courseSource({version:1,id:courseId,title:course+' lab'})+`\n[[${contentRoot}/Lesson|Lesson and practice]]\n\n[[${contentRoot}/Exams/Checkpoint|Checkpoint exam — feedback at the end]]\n\n[[${contentRoot}/Exams/Immediate practice exam|Immediate-feedback exam]]\n\nUse **Study Studio: Open study dashboard** for scores and concept evidence. These are synthetic course materials for testing.\n`);
 const lesson=lessons[course].replaceAll('\\`','`')+(course==='Calculus'?'':'\n## Review\n\n```study-group\ntitle: '+course+' review\nquestions:\n'+ids.map(id=>'  - '+id).join('\n')+'\n```\n');save(`${contentRoot}/Lesson.md`,lesson);
 for(const immediate of [false,true])save(`${contentRoot}/Exams/${immediate?'Immediate practice exam':'Checkpoint'}.md`,serializeExam({version:1,id:courseId+(immediate?'-immediate':'-checkpoint'),title:course+(immediate?' — immediate practice':' — checkpoint'),courseIds:[courseId],grading:immediate?'immediate':'on-submit',mode:'sections',allowBack:true,shuffleSections:false,sections:[{id:'basics',title:'Foundations',shuffleGroups:false,groups:[{id:'basic-group',title:'Recall and apply',shuffleQuestions:false,questions:ids.slice(0,2).map((id,i)=>({id:'basic-'+i,questionId:id,variants:'exact'}))}]},{id:'reasoning',title:'Understanding',shuffleGroups:false,groups:[{id:'reasoning-group',title:'Connect the ideas',shuffleQuestions:false,questions:ids.slice(2).length?ids.slice(2).map((id,i)=>({id:'reason-'+i,questionId:id,variants:'exact'})):[{id:'reason-fluid',questionId:'fluid-strain',variants:'exact'}]}]}].filter((s,i)=>course!=='Fluid Dynamics'||i===0)}));
}
save('Course lab home.md','# Course labs\n\n[[Courses/Calculus/Course|Calculus]] · [[Courses/French/Course|French]] · [[Courses/Python/Course|Python]] · [[Courses/Fluid Dynamics/Course|Fluid Dynamics]]\n\nStart with Calculus → Lesson. Practice questions share IDs with the exams. Reset a single question with its Reset question button, right-click a group heading to reset its group, or use **Study Studio: Reset all practice questions in this note**. Reset preserves recorded attempts.\n\nCheckpoint exams reveal feedback after the entire exam is submitted. Immediate practice exams lock and grade each submitted question. Essays and drawings await rubric assessment. Use **Study Studio: Open study dashboard** to compare first attempts, retries, latest scores, and concept evidence.\n');

// Dashboard launchers are part of the synthetic course fixtures.
for(const [path,id] of [['Course lab home.md','all'],...Object.keys(groups).map(course=>[`Courses/${course}/Course.md`,'lab-'+course.toLowerCase().replaceAll(' ','-')])]){
 const file='fixtures/'+path,raw=readFileSync(file,'utf8');if(!raw.includes('```study-dashboard'))writeFileSync(file,raw+'\n```study-dashboard\n'+id+'\n```\n');
}
