"""Install only into the existing isolated lab, never overwrite notes."""
from pathlib import Path
import shutil,json,hashlib,sys
repo=Path(__file__).resolve().parents[1]
lab=Path('/Users/gradyclopton/ObsidianVaults/study_studio_lab')
assert (lab/'Start here.md').exists()
p=lab/'.obsidian/community-plugins.json';plugins=json.loads(p.read_text())
for plugin in ['study-studio','ink-studio','math-studio','slide-studio']:
 source=repo if plugin=='study-studio' else Path('/Users/gradyclopton/Projects')/('obsidian-'+plugin)
 target=lab/'.obsidian/plugins'/plugin;target.mkdir(parents=True,exist_ok=True)
 for name in ['main.js','manifest.json','styles.css','frame.js']:
  if (source/name).exists():shutil.copy2(source/name,target/name)
 if (source/'vendor').exists():shutil.copytree(source/'vendor',target/'vendor',dirs_exist_ok=True)
 if plugin not in plugins:plugins.append(plugin)
 print(plugin,hashlib.sha256((target/'main.js').read_bytes()).hexdigest())
p.write_text(json.dumps(plugins,indent=2)+'\n')
if '--plugin-only' in sys.argv:sys.exit(0)
# An existing lab must move through Obsidian so links and practice identities follow.
manifest=(repo/'src/lab-chapter-moves.ts').read_text()
moves=json.loads(manifest.split('export const labChapterMoves = ',1)[1].rsplit(' as const;',1)[0])
if any((lab/move['from']).exists() for move in moves):
 print('Plugins updated. Reload Obsidian and run Study Studio: Organize course lab into chapter folders before installing fixtures.')
 sys.exit(0)
for f in (repo/'fixtures').rglob('*'):
 if not f.is_file() or f.suffix not in ['.md','.svg']:continue
 if f.name=='Compatibility playground.md':continue
 dest=lab/f.relative_to(repo/'fixtures');dest.parent.mkdir(parents=True,exist_ok=True)
 if not dest.exists():shutil.copy2(f,dest)
