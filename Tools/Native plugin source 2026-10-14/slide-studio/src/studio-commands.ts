import {Modal, type App, type Command, type Hotkey} from 'obsidian';
import {element} from './render';

export const STUDIO_ACTIONS = [
  {id:'speaking-notes', name:'Toggle speaking notes', key:'s', deck:false},
  {id:'zoom-in', name:'Zoom in', key:'=', deck:false},
  {id:'zoom-out', name:'Zoom out', key:'-', deck:false},
  {id:'zoom-fit', name:'Fit slide to view', key:'0', deck:false},
  {id:'create-deck-slide', name:'Add new slide to presentation', key:'n', deck:true},
  {id:'copy-deck-slide', name:'Copy an existing slide into presentation', deck:true},
  {id:'share-deck-slide', name:'Share an existing slide across presentations', deck:true},
  {id:'bring-in-slides', name:'Bring in slides, sections, or a presentation', key:'i', deck:true},
  {id:'browse-slide-trash', name:'Browse presentation trash', key:'t', deck:true},
  {id:'go-to-slide', name:'Go to slide number or title', key:'g', deck:true},
  {id:'organize-presentation', name:'Toggle presentation organizer', key:'o', deck:true},
  {id:'edit-current-slide', name:'Edit current presentation slide', key:'e', deck:true},
  {id:'new-section', name:'Create a section', deck:true},
  {id:'group-slides', name:'Group selected slides into a section', deck:true},
  {id:'move-slides', name:'Move selected slides to section or position', deck:true},
  {id:'trash-selected-slides', name:'Move selected slides to trash', deck:true},
  {id:'collapse-sections', name:'Collapse all sections', deck:true},
  {id:'expand-sections', name:'Expand all sections', deck:true},
  {id:'studio-actions', name:'Open Slide Studio context menu', key:'m', deck:false},
  {id:'shortcut-guide', name:'Keyboard shortcut guide', key:'k', deck:false},
] as const;
export type StudioAction = typeof STUDIO_ACTIONS[number]['id'];
export function actionHotkeys(action: typeof STUDIO_ACTIONS[number]): Hotkey[] {
  if (action.id === 'zoom-in') return [{modifiers:['Mod'],key:'='},{modifiers:['Mod','Shift'],key:'='}];
  if (action.id === 'zoom-out') return [{modifiers:['Mod'],key:'-'}];
  if (action.id === 'zoom-fit') return [{modifiers:['Mod'],key:'0'}];
  return 'key' in action ? [{modifiers:['Mod','Alt'], key:action.key}] : [];
}
export function shortcutLabel(keys: Hotkey[], mac: boolean): string {
  return keys.map(h => [...h.modifiers.map(m => m === 'Mod' ? (mac ? '⌘' : 'Ctrl') : m === 'Alt' ? (mac ? '⌥' : 'Alt') : m === 'Shift' ? 'Shift' : m),h.key.toUpperCase()].join('+')).join(' / ') || 'Unassigned — available in the command palette';
}
export async function shortcutGuide(app: App, id: string, commands: Command[]) {
  let custom: Record<string,Hotkey[]> = {};
  const path = `${app.vault.configDir}/hotkeys.json`;
  if (await app.vault.adapter.exists(path)) custom = JSON.parse(await app.vault.adapter.read(path));
  const modal = new Modal(app); modal.titleEl.textContent='Slide Studio · Keyboard shortcuts';
  modal.modalEl.classList.add('ss-shortcut-guide');
  element(modal.contentEl,'p','','Right-click the slide list or workspace for presentation actions. Assign or change any command in Obsidian Settings → Hotkeys → Slide Studio.');
  const search=element(modal.contentEl,'input'); search.type='search'; search.placeholder='Search commands…'; search.setAttribute('aria-label','Search Slide Studio shortcuts');
  const list=element(modal.contentEl,'div','ss-shortcut-list');
  const mac=/Mac/.test(navigator.platform);
  const draw=()=>{
    list.replaceChildren();
    for(const c of commands.filter(c=>c.name.toLowerCase().includes(search.value.toLowerCase()))) {
      const row=element(list,'div','ss-shortcut-row');element(row,'strong','',c.name);
      const full=`${id}:${c.id}`;
      element(row,'span','',shortcutLabel(Object.prototype.hasOwnProperty.call(custom,full)?custom[full]:c.hotkeys??[],mac));
    }
  };
  search.oninput=draw;draw();
  element(modal.contentEl,'h3','','Editing and selection');
  element(modal.contentEl,'p','','Double-click: edit a preview block. Escape: finish editing and stay in Slide Studio. Cmd/Ctrl+Z: undo; add Shift to redo. In the slide list: Cmd/Ctrl-click toggles selection; Shift-click selects a range; Cmd/Ctrl+A selects all; Delete/Backspace moves selected slides to trash; Option/Alt+Up/Down moves a slide. Right-click has the same presentation actions even after scrolling.');
  element(modal.contentEl,'h3','','Scientific figures and tables');
  element(modal.contentEl,'p','','In figure/table text fields, right-click → Edit text and math, or Ctrl+M for inline equations; Ctrl+Shift+M inserts display math. Click a rendered equation in the field preview to edit it. Finish math, apply the text, then save the object. Title, caption, panel captions and table cells support Markdown and LaTeX.');
  element(modal.contentEl,'h3','','Zoom and image detail');
  element(modal.contentEl,'p','','Cmd/Ctrl+= or +/−: zoom the slide; Cmd/Ctrl+0: fit. Pinch or Cmd/Ctrl+scroll zooms around the pointer. When enlarged, scroll to pan, or hold Space and drag (outside text editing); middle-button drag also pans. Zoom changes only the view, never the slide layout. During playback, click a figure (or Tab to it and press Enter) to maximize it. In image detail: scroll/pinch or +/− to zoom; drag or arrow keys to pan; 0 or double-click to fit; Escape returns to the same slide. Right-click offers these controls too.');
  element(modal.contentEl,'h3','','During playback');
  element(modal.contentEl,'p','','N: show/hide speaking notes alongside playback. Arrows, Page Up/Down, Space: navigate. Home/End: first/last page. G: find a slide. In the gallery, drag its bottom-right corner to resize, pinch or Ctrl/Cmd+scroll to zoom previews; Cmd/Ctrl +/− changes thumbnail size, Cmd/Ctrl+0 resets the original compact view, and Cmd/Ctrl+Shift+F fills the window. Type a number then Enter: jump. Escape: close search or leave playback. Go to slide uses the printed footer number under the selected convention. Numeric titles also match; #69 means printed slide 69 only. Unnumbered titles, outlines, and references can be found by title.');
  modal.open(); search.focus();
}


export function matchesHotkey(event: Pick<KeyboardEvent,'metaKey'|'ctrlKey'|'altKey'|'shiftKey'|'key'|'code'>, hotkey: Hotkey, mac: boolean, virtualKey?: string): boolean {
  const mods = hotkey.modifiers.map(m=>m==='Mod'?(mac?'Meta':'Ctrl'):m);
  if(event.metaKey!==mods.includes('Meta') || event.ctrlKey!==mods.includes('Ctrl') || event.altKey!==mods.includes('Alt') || event.shiftKey!==mods.includes('Shift'))return false;
  const key=hotkey.key.toLowerCase();
  return [virtualKey,event.key,event.code === 'Equal' ? '=' : event.code === 'Minus' ? '-' : event.code?.replace(/^(Key|Digit)/,'')].some(k=>k?.toLowerCase()===key);
}
