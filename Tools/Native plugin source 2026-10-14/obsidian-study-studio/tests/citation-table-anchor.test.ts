import {test} from 'node:test';import assert from 'node:assert/strict';
import {canonicalTable,locateTable,TableFingerprintCell} from '../src/citation-table-anchor';
const cell=(text:string,header=false):TableFingerprintCell=>({text,header,rowspan:1,colspan:1});
test('table fingerprints ignore formatting but preserve scientific text, spans and headers',()=>{
 const a=[[cell('Result',true),cell('Error',true)],[cell('efﬁcient\nflow'),cell('2.43')]];
 const b=structuredClone(a);b[1][0].text='efficient flow';assert.equal(canonicalTable(a),canonicalTable(b));
 for(const mutate of [(r:typeof b)=>r[1][1].text='2.44',(r:typeof b)=>r[1][1].text='−2.43',(r:typeof b)=>r[0][0].colspan=2,(r:typeof b)=>r[0][0].header=false]){const changed=structuredClone(b);mutate(changed);assert.notEqual(canonicalTable(a),canonicalTable(changed));}
});
test('table anchors relocate uniquely and refuse ambiguous or changed contents',()=>{
 const sha='a'.repeat(64),fp='b'.repeat(64),other='c'.repeat(64);
 assert.equal(locateTable([other,sha],[other,fp],{sha256:sha}),1);
 assert.equal(locateTable([other,other],[other,fp],{sha256:sha,tableFingerprint:fp}),1);
 assert.equal(locateTable([other,other],[fp,fp],{sha256:sha,tableFingerprint:fp}),null);
 assert.equal(locateTable([sha,sha],[fp,fp],{sha256:sha,tableFingerprint:fp}),null);
 assert.equal(locateTable([other],[other],{sha256:sha,tableFingerprint:fp}),null);
 assert.equal(locateTable([other],[fp],{sha256:sha}),null);
});
