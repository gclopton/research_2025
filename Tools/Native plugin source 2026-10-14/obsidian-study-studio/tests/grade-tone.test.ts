import {test} from 'node:test';
import assert from 'node:assert/strict';
import {gradeTone} from '../src/dashboard-widgets';
test('grade colors agree with displayed whole percentages at both boundaries',()=>{
 for(const [earned,expected] of [[90,'green'],[89.5,'green'],[89.49,'yellow'],[85,'yellow'],[84.5,'yellow'],[84.49,'red'],[0,'red']] as const)assert.equal(gradeTone(earned,100),'study-grade-'+expected);
 assert.equal(gradeTone(0,0),'');assert.equal(gradeTone(NaN,100),'');
});
