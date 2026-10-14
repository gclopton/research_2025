from pathlib import Path
import shutil

project = Path(__file__).resolve().parents[1]
lab = Path('/Users/gradyclopton/ObsidianVaults/math_studio_lab')
lab.mkdir(parents=True, exist_ok=True)
(lab / '.obsidian').mkdir(exist_ok=True)
for source in sorted((project / 'fixtures').glob('*.md')):
    destination = lab / source.name
    if destination.exists():
        print(f'Preserved existing: {destination.name}')
    else:
        shutil.copy2(source, destination)
        print(f'Created: {destination.name}')
