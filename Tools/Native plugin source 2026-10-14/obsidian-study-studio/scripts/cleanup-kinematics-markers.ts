/** Remove temporary generation comments, never the embedded questions. */
import {readFileSync, writeFileSync, realpathSync} from 'node:fs';
import {resolve} from 'node:path';

const lab = '/Users/gradyclopton/ObsidianVaults/study_studio_lab';
const args = process.argv.slice(2);
const files = args.filter(arg => arg !== '--write');
if (!files.length) throw Error('Usage: npx tsx scripts/cleanup-kinematics-markers.ts [--write] <note.md> ...');
for (const file of files) {
  const path = realpathSync(resolve(file));
  if (!path.startsWith(lab + '/') || !path.endsWith('.md')) throw Error('Only Markdown notes in study_studio_lab are supported.');
  const before = readFileSync(path, 'utf8');
  let count = 0;
  // Leave line endings, spacing, and all non-marker text exactly as found.
  const after = before.replace(/^<!-- (?:study-studio:kinematics:[0-9]+(?:\.[0-9]+)*|\/study-studio:kinematics) -->(?=\r?$)/gm, () => { count++; return ''; });
  if (args.includes('--write') && after !== before) writeFileSync(path, after);
  console.log(`${args.includes('--write') ? 'Removed' : 'Would remove'} ${count} marker comments: ${path}`);
}
