import {test} from 'node:test';
import assert from 'node:assert/strict';
import {practiceLink,parsePracticeLink} from '../src/practice-link';
test('practice link round trips Unicode and reserved characters without attempt data',()=>{
 const selection={title:'3 · Theory & results #1',ids:['q-2','q-1'],course:'course-1'};
 const url=new URL(practiceLink('My vault & notes',selection));
 assert.equal(url.searchParams.get('vault'),'My vault & notes');
 assert.ok(!url.href.includes('+'),'Obsidian protocol does not decode form-style spaces');
 assert.deepEqual(parsePracticeLink(Object.fromEntries(url.searchParams)),selection);
 assert.deepEqual([...url.searchParams.keys()].sort(),['course','ids','title','v','vault']);
});
test('practice links reject malformed, empty and duplicated selections',()=>{
 for(const ids of ['{','[]','["a","a"]','["../secret"]','[1]'])assert.throws(()=>parsePracticeLink({v:'1',title:'Practice',ids}));
 assert.throws(()=>parsePracticeLink({v:'2',title:'Practice',ids:'["a"]'}));
});
