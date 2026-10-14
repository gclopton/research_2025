import {Component} from 'obsidian';
import village from '../assets/christmas-village.svg';
import nightVillage from '../assets/christmas-village-night.svg';
import stars from '../assets/christmas-stars.svg';

// Unequal, nonsequential periods/phases avoid a traveling wave or shared pulse.
// Fixed samples keep previews reproducible; CSS handles all per-frame animation.
const twinkles = [
 [9.73,6.21,0],[12.41,1.83,2],[7.19,4.56,1],[14.87,10.37,0],
 [10.61,2.94,1],[8.53,7.12,2],[13.37,5.47,1],[11.29,9.06,0],
 [7.97,1.19,2],[15.13,12.68,1],[9.31,3.72,0],[12.79,8.51,2],[10.07,7.43,1],
];

/** Original local artwork. Only the active playback stage receives animation. */
export function christmasBackdrop(stage:HTMLElement,owner:Component,night=false){
 const doc=stage.ownerDocument,scene=doc.createElement('div');scene.className='ss-christmas-scene';scene.setAttribute('aria-hidden','true');stage.prepend(scene);
 const playing=stage.parentElement?.classList.contains('ss-present-mount');
 scene.classList.toggle('is-playing',!!playing);
 if(night){const sky=doc.createElement('img');sky.src=stars;sky.alt='';sky.className='ss-christmas-stars';sky.draggable=false;scene.append(sky);}
 const lights=doc.createElement('div');lights.className='ss-christmas-lights';scene.append(lights);
 const colors=night?['#ff806d','#b4e885','#ffda83','#83dfff','#d2a6ff']:['#ed9b90','#f9daa0','#a8dac1'];
 for(let i=0;i<13;i++){
  const bulb=doc.createElement('i');bulb.style.left=`${3+i*7.8}%`;bulb.style.top=`${4+Math.sin(i/12*Math.PI)*13}px`;
  const [duration,phase,pattern]=twinkles[i];
  bulb.style.setProperty('--bulb',colors[i%colors.length]);bulb.style.setProperty('--twinkle-duration',`${duration}s`);bulb.style.setProperty('--twinkle-delay',`-${phase}s`);bulb.style.setProperty('--twinkle-pattern',`ss-christmas-twinkle-${pattern}`);lights.append(bulb);
 }
 const art=doc.createElement('img');art.src=night?nightVillage:village;art.alt='';art.className='ss-christmas-village';art.draggable=false;scene.append(art);
 if(playing){
  const snow=doc.createElement('div');snow.className='ss-christmas-snow';scene.append(snow);
  for(let i=0;i<28;i++){const flake=doc.createElement('i');flake.className='ss-snow-flake';const duration=19+i%7*3;flake.style.cssText=`left:${(i*137+29)%1600}px;width:${2+i%3}px;height:${2+i%3}px;animation-duration:${duration}s;animation-delay:-${(i*7)%duration}s;--drift:${(i%5-2)*28}px`;snow.append(flake);}
  const pause=()=>scene.classList.toggle('is-paused',doc.hidden);doc.addEventListener('visibilitychange',pause);owner.register(()=>doc.removeEventListener('visibilitychange',pause));pause();
 }
}
