// Editable scene and a frozen image travel together in drafts and attempt snapshots.
export function validateDrawingResponse(value:string){
 if(!value)return;
 const d=JSON.parse(value),s=JSON.parse(d.scene);
 if(typeof d.svg!=='string'||!d.svg.startsWith('<svg')||s.format!=='ink-studio'||s.version!==1||typeof s.id!=='string'||!Array.isArray(s.elements)||!s.elements.some((e:any)=>e&&!e.isDeleted)||!s.appState||typeof s.appState!=='object'||!s.files||typeof s.files!=='object')throw Error('Invalid drawing response.');
}
