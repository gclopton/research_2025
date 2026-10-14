import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readVisibility,annotationVisible} from '../src/annotation-visibility';
import {commentSegments,markAttributes} from '../src/comment-marks';
import type {Critique} from '../src/review-model';
const c=(id:string,intent:string,style:'highlight'|'underline',color:string):Critique=>({id,intent,markStyle:style,color,path:'test.md',quote:'test',before:'',after:'',comment:'',updated:'',resolved:false});
test('visibility is by meaning, independent of style and color',()=>{
 const v={enabled:true,hiddenTypes:['Definitions']};
 assert.equal(annotationVisible(c('a','Definitions','highlight','#ffff00'),v),false);
 assert.equal(annotationVisible(c('b','Definitions','underline','#ff0000'),v),false);
 assert.equal(annotationVisible(c('c','Main takeaway','highlight','#ffff00'),v),true);
 assert.equal(annotationVisible({...c('d','Other','underline','#000000'),deletedAt:'today'},v),false);
});
test('all off preserves individual type choices',()=>{
 const v={enabled:false,hiddenTypes:['Definitions']};
 assert.equal(annotationVisible(c('a','Main takeaway','underline','#ff0000'),v),false);
 assert.equal(readVisibility(v).enabled,false);assert.equal(readVisibility(v).hiddenTypes.length,4);
 assert.deepEqual(readVisibility(null),{version:2,enabled:true,hiddenTypes:[]});
 assert.equal(readVisibility({hiddenTypes:['a',3,'a']}).hiddenTypes.length,4);
});
test('hiding an overlapping highlight retains the other underline only',()=>{
 const v={enabled:true,hiddenTypes:['Definitions']};const comments=[c('a','Definitions','highlight','#ffff00'),c('b','Main takeaway','underline','#ff0000')];
 const ranges=comments.filter(c=>annotationVisible(c,v)).map(comment=>({from:0,to:4,comment}));
 const segments=commentSegments(ranges),attrs=markAttributes(segments[0].comments);
 assert.equal(attrs['data-study-comment-ids'],'b');assert.ok(attrs.style.includes('--critique-overlap:none'));assert.ok(attrs.style.includes('#ff0000'));
});
