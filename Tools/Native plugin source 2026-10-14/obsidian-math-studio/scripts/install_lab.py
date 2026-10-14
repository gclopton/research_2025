from pathlib import Path
import shutil,json
project=Path(__file__).resolve().parents[1]
lab=Path('/Users/gradyclopton/ObsidianVaults/math_studio_lab')
target=lab/'.obsidian/plugins/math-studio'
target.mkdir(parents=True,exist_ok=True)
for name in ['main.js','frame.js','manifest.json','styles.css']:
    shutil.copy2(project/name,target/name)
shutil.copytree(project/'vendor',target/'vendor',dirs_exist_ok=True)
plugins=lab/'.obsidian/community-plugins.json'
items=json.loads(plugins.read_text()) if plugins.exists() else []
if 'math-studio' not in items: items.append('math-studio')
plugins.write_text(json.dumps(items,indent=2)+'\n')
print(target)
