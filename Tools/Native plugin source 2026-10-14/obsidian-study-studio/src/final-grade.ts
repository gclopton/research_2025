import {gradeTone} from './dashboard-widgets';
export function finalGrade(parent:HTMLElement,earned:number,possible:number){
 if(possible<=0)return;
 const percent=Math.round(100*earned/possible),root=parent.createDiv('study-final-grade '+gradeTone(earned,possible));
 root.setAttribute('role','status');root.setAttribute('aria-label',`Final score ${percent} percent, ${earned} of ${possible} points`);
 root.createDiv({cls:'study-final-grade-circle',text:`${percent}%`});
 const detail=root.createDiv();detail.createEl('strong',{text:'Final score'});detail.createEl('p',{text:`${earned} / ${possible} points`});
}
