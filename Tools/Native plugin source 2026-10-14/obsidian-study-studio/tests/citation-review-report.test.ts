import {test} from 'node:test';import assert from 'node:assert/strict';
import {citationCandidates,reportIssues,reviewMarkdown,sourceTableLocations} from '../src/citation-review-report';
test('citation report points AI to original source lines without accepting its suggestions',()=>{
 const source='# Results\n\nThe value is 2.44 eV.\n\nThe value is 2.44 eV.\n';
 const result=reportIssues(source,[{quote:'The value is 2.43 eV.',comment:'Keep this comment'}],['Selection 1: Saved quotation is missing or ambiguous.']);
 assert.deepEqual(result[0].candidatePassages.map(c=>c.fromLine),[3,5]);assert.equal(result[0].candidatePassages[0].verified,false);assert.equal(result[0].savedSelection?.comment,'Keep this comment');
 const md=reviewMarkdown({generatedAt:'test',identity:{recordPath:'Evidence/a.yaml',claimId:'c',citekey:'paper',sourcePath:'Source.md'},recordSha256:'abc',sourceSha256:'def',recordChangedSinceOpen:true,issues:result},'report.json');
 assert.match(md,/source lines 3–3/);assert.match(md,/changed since the viewer opened/);assert.match(md,/unverified/);
});
test('report suggestions exclude fenced code and include figure reference locations',()=>{
 assert.equal(citationCandidates('```\nThe result is stable.\n```','The result is stable.').length,0);
 const report=reportIssues('Title\n\n![[images/plot.png]]',[{image:'images/plot.png'}],['Selection 1: Figure changed.']);assert.equal(report[0].sourceMentions[0].line,3);
});

test('identical table occurrences keep distinct source line locations',()=>{
 const raw='| A |\n| - |\n| 1 |';assert.deepEqual(sourceTableLocations(raw+'\n\n'+raw,[raw,raw]).map(t=>t.fromLine),[1,5]);
});
