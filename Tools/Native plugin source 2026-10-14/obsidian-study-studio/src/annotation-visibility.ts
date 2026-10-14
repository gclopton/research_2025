import {Critique,annotationStyles,styleOf,typeKey} from './review-model';
/** Reading preferences are separate from saved annotation records. */
export interface AnnotationVisibility {version?:2;enabled:boolean;hiddenTypes:string[]}
export function readVisibility(raw:unknown):AnnotationVisibility {
 const value=raw as Partial<AnnotationVisibility>|null;
 const types=Array.isArray(value?.hiddenTypes)?value.hiddenTypes.filter((x):x is string=>typeof x==='string'):[];
 return {version:2,enabled:value?.enabled!==false,hiddenTypes:[...new Set(value?.version===2?types:types.flatMap(t=>{try{const parsed=JSON.parse(t);if(Array.isArray(parsed)&&parsed.length===2&&annotationStyles.includes(parsed[0])&&typeof parsed[1]==='string')return [t];}catch{}return annotationStyles.map(s=>typeKey(s,t));}))]};
}
export function annotationVisible(c:Pick<Critique,'intent'|'deletedAt'|'kind'|'markStyle'>,v:AnnotationVisibility){const value=v.version===2?v:readVisibility(v);return !c.deletedAt&&value.enabled&&!value.hiddenTypes.includes(typeKey(styleOf(c),c.intent));}
