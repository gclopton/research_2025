// Private user-image fixtures: consume a local JSON file, never commit the images.
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {serialize} from '../src/model';
const root='/Users/gradyclopton/ObsidianVaults/study_studio_lab/';
for(const d of JSON.parse(readFileSync(process.argv[2],'utf8'))){const path=root+'Study Studio/Questions/'+d.title+'.md';if(!existsSync(path))writeFileSync(path,serialize(d,d.type==='diagram'&&d.id.includes('fluid')?'Label the two face displacements and the added length. Use Math or Ctrl+M to enter an equation.':'Name the covered structures in the lateral view. Matching names in the frontal view are hidden too.','Use reveal to compare each answer directly on the diagram.'));}
const playground=root+'Diagram labeling playground.md';if(!existsSync(playground))writeFileSync(playground,'# Diagram labeling playground\n\nExpand either example. Edit question opens the layout editor. Tab moves between answer controls; Ctrl+M opens Math Studio in a field. Narrow views scroll horizontally to keep fields readable.\n\n```study\ndiagram-fluid-labels\n```\n\n```study\ndiagram-shapes\n```\n');
