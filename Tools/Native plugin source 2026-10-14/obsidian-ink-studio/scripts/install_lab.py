"""Install only into the isolated Ink Studio lab; never replace note content."""
from pathlib import Path
import shutil,json
repo=Path(__file__).resolve().parents[1]
lab=Path('/Users/gradyclopton/ObsidianVaults/ink_studio_lab')
assert (lab/'Start here.md').exists(), 'Lab must already exist'
target=lab/'.obsidian/plugins/ink-studio'
target.mkdir(parents=True,exist_ok=True)
for file in ['main.js','frame.js','manifest.json','styles.css']:
 shutil.copy2(repo/file,target/file)
shutil.copytree(repo/'vendor',target/'vendor',dirs_exist_ok=True)
p=lab/'.obsidian/community-plugins.json'
plugins=json.loads(p.read_text())
if 'ink-studio' not in plugins:plugins.append('ink-studio')
p.write_text(json.dumps(plugins,indent=2)+'\n')
print(target)
