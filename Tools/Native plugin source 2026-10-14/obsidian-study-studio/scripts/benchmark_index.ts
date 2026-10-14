import {QuestionIndex} from '../src/question-index';
import {template} from '../src/model';
import assert from 'node:assert/strict';
const results=[];
for(const count of [1000,10000]){
 const files=new Map(Array.from({length:count},(_,i)=>[`${i}.md`,template('table',`q${i}`,`Question ${i}`)]));
 let reads=0;const index=new QuestionIndex({paths:()=>[...files.keys()],read:async p=>{reads++;return files.get(p);}});
 let start=performance.now();assert.equal((await index.all()).length,count);const coldMs=performance.now()-start;
 const before=reads;start=performance.now();for(let i=0;i<1000;i++)await index.find(`q${i%count}`);const lookupMs=performance.now()-start;assert.equal(reads,before);
 files.set('0.md',template('table','q0','Edited question'));index.invalidate('0.md');start=performance.now();assert.equal((await index.find('q0')).definition.title,'Edited question');const editMs=performance.now()-start;assert.equal(reads,before+1);
 results.push({questions:count,coldMs:Math.round(coldMs),warm1000LookupsMs:Math.round(lookupMs*100)/100,warmReads:0,oneEditMs:Math.round(editMs*100)/100,oneEditReads:1});
 index.dispose();
}
console.log(JSON.stringify({environment:'Node.js synthetic in-memory source; includes YAML parsing, excludes vault I/O and Obsidian rendering',results},null,2));
