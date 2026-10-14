import {test} from 'node:test';
import assert from 'node:assert/strict';
import {locateCitation} from '../src/citation-anchor';

const quotation='The efficient flow remains steady at 2.43 eV.';
const safeVariants=[
 quotation,
 'The efficient\nflow remains steady at 2.43 eV.',
 'The   efficient flow\tremains steady at 2.43 eV.',
 'The efﬁcient ﬂow remains steady at 2.43 eV.',
 'The ef\u00adficient flow remains steady at 2.43 eV.',
 'The effi\u200bcient flow remains steady at 2.43 eV.',
 'The efficient\u00a0flow remains steady at 2.43 eV.',
 'The efficient\r\nflow remains steady at 2.43 eV.',
];
for(const [i,variant] of safeVariants.entries())for(const reverse of [false,true])test(`cleanup simulation: formatting ${i+1}, ${reverse?'converted quotation to clean source':'clean quotation to converted source'}`,()=>{
 const source=reverse?quotation:variant,quote=reverse?variant:quotation;
 const found=locateCitation('New heading. '+source+' New commentary.',{quote});
 assert.ok(found);assert.equal(('New heading. '+source+' New commentary.').slice(found.from,found.to),source);
});
for(const [name,source] of Object.entries({
 number:quotation.replace('2.43','2.44'),
 sign:quotation.replace('2.43','−2.43'),
 negation:quotation.replace('remains steady','does not remain steady'),
 wording:quotation.replace('steady','stationary'),
 OCR:quotation.replace('flow','fiow'),
 dehyphenation:quotation.replace('efficient','effi-cient'),
 insertedPageNumber:quotation.replace('flow remains','flow 12 remains'),
 removedWord:quotation.replace('efficient ',''),
}))test(`cleanup simulation: ${name} requires review`,()=>assert.equal(locateCitation(source,{quote:quotation}),null));

test('cleanup simulation: moved intact paragraph retains quotation and flags changed surroundings',()=>{
 assert.equal(locateCitation('Discussion. '+quotation+' New paragraph.',{quote:quotation,before:'Methods.',after:'Original paragraph.'})?.status,'context-changed');
});
test('cleanup simulation: a duplicate introduced by conversion remains unresolved without context',()=>{
 assert.equal(locateCitation(quotation+' '+quotation,{quote:quotation}),null);
 assert.ok(locateCitation('First. '+quotation+' Second. '+quotation,{quote:quotation,before:'Second.'}));
});
test('cleanup simulation: short quotations cannot match inside changed words or values',()=>{
 for(const [quote,source] of [['stable','unstable'],['2.43','12.43'],['2.43','2.431'],['2.43','−2.43'],['flow','flows']])assert.equal(locateCitation(source,{quote}),null,`${quote} must not match ${source}`);
});

test('cleanup simulation: canonically equivalent accents preserve exact DOM offsets without flattening scientific notation',()=>{
 const raw='Intro. The cafe\u0301 sample is stable. End.';
 const found=locateCitation(raw,{quote:'The café sample is stable.'});
 assert.ok(found);assert.equal(raw.slice(found.from,found.to),'The cafe\u0301 sample is stable.');
 assert.equal(locateCitation('x² = 4',{quote:'x2 = 4'}),null);
 assert.equal(locateCitation('x̄ = 4',{quote:'x = 4'}),null);
 const emoji='🧪 The flow is steady. 🔬';const match=locateCitation(emoji,{quote:'The flow is steady.'});
 assert.equal(emoji.slice(match!.from,match!.to),'The flow is steady.');
});

test('cleanup simulation: fifty relocated quotations resolve without changing source or stored records',()=>{
 const saved=Array.from({length:50},(_,i)=>({quote:`Sample ${i+1} has an efficient flow at ${(i+.25).toFixed(2)} eV.`,comment:`Comment ${i+1}`}));
 const source=[...saved].reverse().map(s=>s.quote.replace('efficient flow','efﬁcient\nﬂow')).join('\n\n');
 const original=JSON.stringify(saved);
 for(const s of saved){const match=locateCitation(source,s);assert.ok(match);assert.ok(source.slice(match.from,match.to).startsWith(s.quote.split(' has')[0]));}
 assert.equal(JSON.stringify(saved),original);
});
