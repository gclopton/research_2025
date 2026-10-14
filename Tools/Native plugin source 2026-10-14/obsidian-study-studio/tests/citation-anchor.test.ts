import {test} from 'node:test';import assert from 'node:assert/strict';
import {locateCitation} from '../src/citation-anchor';
test('layout changes and ligatures preserve the original rendered range',()=>{
 const raw='Intro. The efﬁcient\n  method is stable. End.';
 const at=locateCitation(raw,{quote:'The efficient method is stable.'});assert.equal(at?.status,'formatting');assert.equal(raw.slice(at!.from,at!.to),'The efﬁcient\n  method is stable.');
});
test('comments and style metadata cannot change a citation anchor',()=>{
 const s={quote:'The result is 2.43 eV.',comment:'new note',color:'#abcdef'};
 assert.equal(locateCitation('The result is 2.43 eV.',s)?.status,'exact');
});
test('unique unchanged quotation survives edits to context but reports them',()=>{
 assert.equal(locateCitation('New introduction. The result is stable. Added note.',{quote:'The result is stable.',before:'Old introduction.'})?.status,'context-changed');
});
test('repeated passages require their saved context and scientific edits never auto-match',()=>{
 assert.equal(locateCitation('A quote. B quote.',{quote:'quote.'}),null);
 assert.equal(locateCitation('A quote. B quote.',{quote:'quote.',before:'B'})?.from,11);
 assert.equal(locateCitation('A quote. B quote.',{quote:'quote.',before:'C'}),null);
 for(const quote of ['The result is 2.43 eV.','The result is not stable.','The result is −2 eV.'])assert.equal(locateCitation('The result is 2 eV.',{quote}),null);
});
test('typographic quotes and soft hyphens are formatting; real hyphens and superscripts are not',()=>{
 assert.ok(locateCitation('The “ef\u00adfect” remains.',{quote:'The "effect" remains.'}));
 assert.equal(locateCitation('non-local',{quote:'nonlocal'}),null);assert.equal(locateCitation('x²',{quote:'x2'}),null);
});
