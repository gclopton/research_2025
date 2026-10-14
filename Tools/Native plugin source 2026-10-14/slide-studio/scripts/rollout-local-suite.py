"""Install the verified writing-vault builds in registered local vaults and ocreate's template.

Default is read-only. --apply backs up affected paths and writes a hash receipt.
Never copies personal data, changes notes, or deploys to another Mac.
"""
from pathlib import Path
import argparse, datetime, hashlib, json, re, shutil, subprocess

HOME = Path.home()
PROJECTS = HOME / 'Projects'
SOURCES = {p: PROJECTS / ('obsidian-' + p) for p in
           ('image-gallery', 'math-studio', 'ink-studio', 'study-studio', 'research-outline', 'research-colors')}
SOURCES.update({'slide-studio': Path(__file__).resolve().parents[1], 'code-links': PROJECTS / 'code-links/obsidian'})
FORKS = {'obsidian-quiet-outline': 'research-outline', 'colored-text': 'research-colors'}
REFERENCE = PROJECTS / 'calc-manager/docs/.obsidian'

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest() if p.is_file() else None

def read(p, default):
    return json.loads(p.read_text()) if p.exists() else default

def put(p, data):
    p.parent.mkdir(parents=True, exist_ok=True)
    tmp = p.with_name(p.name + '.rollout-tmp')
    tmp.write_text(json.dumps(data, indent=2) + '\n')
    tmp.replace(p)

def files(source, plugin):
    out = {n: source/n for n in ('main.js', 'styles.css', 'manifest.json')}
    if (source/'frame.js').exists(): out['frame.js'] = source/'frame.js'
    for p in (source/'vendor').rglob('*'):
        if p.is_file(): out[str(p.relative_to(source))] = p
    if plugin == 'study-studio': out['evidence-export.lua'] = source/'scripts/evidence-export.lua'
    if plugin in FORKS.values():
        for n in ('LICENSE', 'FORK.md'): out[n] = source/n
    return out

def migrate_outline_views(value):
    if isinstance(value, list): return [migrate_outline_views(x) for x in value]
    if isinstance(value, dict):
        out = {k:migrate_outline_views(v) for k,v in value.items()}
        if out.get('type') == 'quiet-outline': out['type'] = 'research-outline'
        return out
    return value

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    registry = (HOME/'utils/.obsidian_vaults.zsh').read_text()
    targets = {name: Path(path)/'.obsidian' for name,path in re.findall(r'\[([^\]]+)\]=([^\s)]+)',registry)}
    targets['new-vault-template'] = HOME/'utils/ObsidianConfig'
    assert len(set(map(str, targets.values()))) == len(targets)
    releases = {}
    for plugin,source in SOURCES.items():
        manifest = read(source/'manifest.json', {})
        assert manifest['id'] == plugin
        release = files(source,plugin)
        for rel,p in release.items():
            assert p.is_file() and not p.is_symlink(), p
            if rel not in ('LICENSE','FORK.md'):
                assert sha(p) == sha(REFERENCE/'plugins'/plugin/rel), f'Unverified artifact {plugin}/{rel}'
        releases[plugin] = {'version':manifest['version'], 'source':str(source), 'files':{r:sha(p) for r,p in release.items()}}
    plans = {}
    skipped = {}
    for name,config in targets.items():
        if not config.is_dir():
            skipped[name] = "No existing .obsidian configuration"
            continue
        assert not config.is_symlink(), config
        enabled = read(config/'community-plugins.json', [])
        hotkeys = read(config/'hotkeys.json', {})
        assert isinstance(enabled,list) and isinstance(hotkeys,dict)
        after = enabled[:]
        migrations = {}
        for plugin in SOURCES:
            installed = (config/'plugins'/plugin/'manifest.json').exists()
            old_version = read(config/'plugins'/plugin/'manifest.json',{}).get('version')
            if old_version:
                assert tuple(map(int,old_version.split('.'))) <= tuple(map(int,releases[plugin]['version'].split('.'))), f'Newer release in {name}/{plugin}'
            if not installed and plugin not in FORKS.values() and plugin not in after: after.append(plugin)
        for old,new in FORKS.items():
            if old in after or (not (config/'plugins'/old).exists() and not (config/'plugins'/new).exists()):
                if new not in after: after.append(new)
            if new in after: after = [p for p in after if p != old]
            old_data=config/'plugins'/old/'data.json'; new_data=config/'plugins'/new/'data.json'
            if old_data.exists() and not new_data.exists(): migrations[str(new_data.relative_to(config))]=old_data
            for key in list(hotkeys):
                if key.startswith(old+':'):
                    new_key=new+key[len(old):]
                    if new_key in hotkeys: assert hotkeys[new_key]==hotkeys[key], f'Hotkey migration conflict in {name}: {key}'
                    hotkeys[new_key]=hotkeys.pop(key)
        writes={}
        for plugin,source in SOURCES.items():
            for rel,p in files(source,plugin).items():
                dest=config/'plugins'/plugin/rel
                assert not dest.is_symlink()
                if sha(dest)!=releases[plugin]['files'][rel]: writes[str(dest.relative_to(config))]=p
        writes.update(migrations)
        metadata={}
        for rel,value in [('community-plugins.json',after),('hotkeys.json',hotkeys)]:
            if read(config/rel,None)!=value: metadata[rel]=value
        if 'research-outline' in after:
            for rel in ('workspace.json','workspace-mobile.json'):
                before_view = read(config/rel, None)
                after_view = migrate_outline_views(before_view)
                if before_view != after_view: metadata[rel] = after_view
        protected = {str(p.relative_to(config)):sha(p) for p in (config/'plugins').glob('*/data.json')}
        for rel in ('appearance.json','workspace.json','workspace-mobile.json'):
            if (config/rel).exists() and rel not in metadata: protected[rel]=sha(config/rel)
        plans[name]={'config':str(config),'writes':writes,'metadata':metadata,'protected':protected,
                     'before':{rel:sha(config/rel) for rel in list(writes)+list(metadata)},
                     'enabled_after':after}
    summary={'targets':len(plans),'skipped':skipped,'releases':{k:v['version'] for k,v in releases.items()},
             'changes':{k:len(p['writes'])+len(p['metadata']) for k,p in plans.items()}}
    print(json.dumps(summary,indent=2))
    if not args.apply: return
    stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    backup=HOME/'Library/Application Support/SlideStudio/backups'/('suite-rollout-'+stamp)
    backup.mkdir(parents=True,exist_ok=False)
    receipt={'stamp':stamp,'releases':releases,'targets':{},'status':'backing_up'}
    for name,plan in plans.items():
        config=Path(plan['config'])
        receipt['targets'][name]={k:v for k,v in plan.items() if k not in ('writes','metadata')}
        receipt['targets'][name]['changed_paths']=list(plan['writes'])+list(plan['metadata'])
        for rel,expected in plan['before'].items():
            p=config/rel
            assert sha(p)==expected
            if p.exists():
                dest=backup/name/rel; dest.parent.mkdir(parents=True,exist_ok=True); shutil.copy2(p,dest)
    put(backup/'receipt.json',receipt)
    for name,plan in plans.items():
        config=Path(plan['config'])
        for rel,expected in plan['before'].items(): assert sha(config/rel)==expected, f'Concurrent change: {name}/{rel}'
        for rel,source in plan['writes'].items():
            dest=config/rel; dest.parent.mkdir(parents=True,exist_ok=True)
            shutil.copy2(source,dest)
            assert sha(dest)==sha(source)
        for rel,data in plan['metadata'].items():
            put(config/rel,data)
            assert read(config/rel,None)==data
        for rel,expected in plan['protected'].items(): assert sha(config/rel)==expected, f'Protected file changed: {name}/{rel}'
        for plugin,release in releases.items():
            for rel,expected in release['files'].items(): assert sha(config/'plugins'/plugin/rel)==expected
        receipt['targets'][name]['status']='installed_hash_verified_reload_on_next_open'
        put(backup/'receipt.json',receipt)
    receipt['status']='installed_hash_verified'
    put(backup/'receipt.json',receipt)
    print('RECEIPT',backup/'receipt.json')

if __name__=='__main__': main()
