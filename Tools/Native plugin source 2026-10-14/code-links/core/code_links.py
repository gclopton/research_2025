#!/usr/bin/env python3
"""Code Links desktop core. JSON in/out; sources run only through an explicit launch action."""
from pathlib import Path
from collections import deque
import importlib.util
import bisect, contextlib, fcntl, hashlib, json, os, re, shutil, subprocess, sys, tempfile, time, uuid

MAX_BYTES=2_000_000
MAX_LINE=1_000_000
MAX_LINES=20_000
SKIP={'.git','.obsidian','.code-links','node_modules','.venv','venv','__pycache__','dist','build','.cache'}
CODE={'.py','.lua','.js','.ts','.tsx','.jsx','.c','.cc','.cpp','.h','.hpp','.rs','.go','.sh','.bash','.zsh','.fish','.r','.jl','.m','.f','.f90','.wls','.wl','.tex','.json','.yaml','.yml','.toml','.ini','.cfg','.csv','.tsv','.log','.out','.txt','.sql','.ipynb'}
APPS={'.vesta':'VESTA','.blend':'Blender','.nb':'Wolfram'}
NAMES={'OUTCAR','INCAR','POSCAR','CONTCAR','OSZICAR','KPOINTS','DOSCAR','EIGENVAL','XDATCAR','Makefile','Dockerfile'}
LINK=re.compile(r'(?P<embed>!)?(?P<open>\[\[|\{\{)(?P<body>(?:(?!\{\{|\[\[)[^\n])*?)(?P<close>\]\]|\}\})(?:\{height=(?P<height>\d+)\})?')
CACHE=Path.home()/'.cache/code-links'

def digest(data): return hashlib.sha256(data).hexdigest()
def atomic(path,obj):
    path.parent.mkdir(parents=True,exist_ok=True)
    fd,tmp=tempfile.mkstemp(dir=path.parent,prefix='.tmp-')
    try:
        with os.fdopen(fd,'w') as f: json.dump(obj,f,ensure_ascii=False,indent=2);f.write('\n')
        os.replace(tmp,path)
    finally:
        if os.path.exists(tmp):os.unlink(tmp)

def project(p):
    p=Path(p).expanduser().resolve()
    p=p.parent if p.is_file() else p
    for d in [p,*p.parents]:
        if any((d/x).exists() for x in ('.code-links.json','.git','.obsidian')):return d
    return p

def config(root):
    p=root/'.code-links.json'
    return json.loads(p.read_text()) if p.exists() else {}

def nav_registry():
    # The same module used by nav.py owns reads, previews, locks and writes.
    path=Path(os.environ.get('CODE_LINKS_NAV_CORE',str(Path.home()/'utils/.nav/registry.py')))
    spec=importlib.util.spec_from_file_location('code_links_nav_registry',path)
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    return module

def roots(root,active=False):
    return {'':root.resolve(),**nav_registry().roots(root,active)}

def parse(raw):
    if raw.startswith('``dir:') and raw.endswith('``'):
        raw='{{'+raw[2:-2]+'}}'
    m=LINK.fullmatch(raw.strip())
    if not m or (m['open']=='[[')!=(m['close']==']]'):raise ValueError('Invalid link syntax')
    target,sep,label=m['body'].partition('|')
    target=target.strip();anchor=None;start=end=None;ranges=[]
    if '#' in target:
        target,fragment=target.rsplit('#',1)
        if re.fullmatch(r'\^[A-Za-z0-9_-]+',fragment):anchor=fragment[1:]
        else:
            for part in fragment.split(','):
                r=re.fullmatch(r'L([1-9]\d*)(?:-L?([1-9]\d*))?',part.strip())
                if not r:raise ValueError('Use #L20-L35,L80-L95 or #^anchor')
                lo=int(r[1]);hi=int(r[2] or r[1])
                if hi<lo or (ranges and lo<=ranges[-1][1]):raise ValueError('Ranges must be ascending and nonoverlapping')
                ranges.append([lo,hi])
            if len(ranges)>100 or sum(hi-lo+1 for lo,hi in ranges)>MAX_LINES:raise ValueError('Selection exceeds 100 fragments or 20,000 lines')
            start,end=ranges[0][0],ranges[-1][1]
    if not target or any(x in target for x in ('\x00','\n','|','{{','}}','[[',']]')):raise ValueError('Invalid target')
    return dict(target=target,label=label if sep else target,anchor=anchor,start=start,end=end,ranges=ranges,embed=bool(m['embed']),code=m['open']=='{{',height=max(3,min(40,int(m['height'] or 10))))

def codefile(p):return p.suffix.lower() in CODE or p.name in NAMES or p.suffix.lower() in APPS

def resolve(root,target,code=False):
    base=root.resolve()
    if ':' in target:
        alias,target=target.split(':',1)
        if alias not in roots(root):raise ValueError('Unknown configured root: '+alias)
        base=roots(root)[alias]
    if Path(target).is_absolute():raise ValueError('Use a project-relative path or configured root')
    p=(base/target).resolve()
    if not p.exists() and ':' not in target and base==root.resolve() and '/' not in target:
        p=(base/'scripts'/target).resolve()
    if not p.is_relative_to(base):raise ValueError('Link escapes its configured root')
    if not p.is_file():raise ValueError('File not found: '+target)
    if code and not codefile(p):raise ValueError('Mustache links target code or scientific text, not Markdown/binary files')
    return p

def target_path(root,target,directory=False):
    base=root.resolve();aliased=':' in target
    if aliased:
        alias,target=target.split(':',1)
        if alias not in roots(root):raise ValueError('Unknown configured root: '+alias)
        base=roots(root)[alias].resolve()
    if not target or Path(target).is_absolute() or any(x in target for x in ('\x00','\n','|','#','{','}','`')):raise ValueError('Use a relative path or configured alias')
    if '..' in Path(target).parts:raise ValueError('Parent traversal is not allowed')
    p=(base/target).resolve()
    if not p.is_relative_to(base):raise ValueError('Link escapes its configured root')
    if not directory and not aliased and '/' not in target and not p.exists():p=(base/'scripts'/target).resolve()
    if not p.is_relative_to(base):raise ValueError('Scripts folder escapes its configured root')
    return p

def inspect_link(root,raw):
    link=parse(raw);directory=link['target'].startswith('dir:')
    target=link['target'][4:] if directory else link['target']
    p=target_path(root,target,directory)
    exists=p.is_dir() if directory else p.is_file()
    if not directory and not codefile(p):raise ValueError('Unsupported code file type')
    # Missing excerpts must never become empty files.
    creatable=not directory and not link['ranges'] and not link['anchor'] and not link['embed'] and (p.suffix.lower() not in APPS or p.suffix.lower()=='.nb')
    return dict(path=str(p),exists=exists,directory=directory,creatable=creatable)

def create_file(root,raw):
    info=inspect_link(root,raw);p=Path(info['path'])
    if info['exists']:return {**info,'created':False}
    if not info['creatable']:raise ValueError('This link cannot create an empty source file')
    p.parent.mkdir(parents=True,exist_ok=True)
    # Exclusive creation preserves an existing file, including a concurrent writer.
    try:
        with p.open('x') as f:
            if p.suffix.lower()=='.nb':f.write('Notebook[{Cell[BoxData[""], "Input"]}]\n')
    except FileExistsError:pass
    return {**info,'exists':True,'created':True}

def signature(p):
    s=p.stat();return [s.st_dev,s.st_ino,s.st_size,s.st_mtime_ns,s.st_ctime_ns]

def index(root):
    items=[]
    for alias,base in roots(root,active=True).items():
        if not base.is_dir():continue
        args=['/opt/homebrew/bin/rg','--files','--hidden','-0']
        for d in SKIP:args+=['-g','!'+d+'/**']
        if Path(args[0]).exists():
            result=subprocess.run(args,cwd=base,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=30)
            if result.returncode not in (0,1):raise ValueError('File indexing failed')
            names=result.stdout.decode().split('\0')
        else:
            names=[]
            for d,dirs,files in os.walk(base):
                dirs[:]=[x for x in dirs if x not in SKIP and not x.startswith('.')]
                names += [str((Path(d)/x).relative_to(base)) for x in files if not x.startswith('.')]
        for n in names:
            if not n or any(x in n for x in ('\n','|','{{','}}','[[',']]','#')):continue
            p=base/n
            if not p.resolve().is_relative_to(base) or not p.is_file():continue
            target=(alias+':' if alias else '')+n
            items.append({'target':target,'label':p.name,'code':codefile(p)})
            if len(items)>=50000:return {'items':items,'truncated':True}
    return {'items':sorted(items,key=lambda x:x['target'].lower()),'truncated':False}

def read_range(p,start,end):
    if start<1 or end<start or end-start+1>MAX_LINES:raise ValueError('Invalid or oversized range')
    sig=signature(p); cache=CACHE/'offsets'/(digest(str(p).encode())+'.json')
    checkpoints=[[1,0]]
    try:
        c=json.loads(cache.read_text())
        if c['signature']==sig:checkpoints=c['checkpoints']
    except (OSError,ValueError,KeyError):pass
    i=bisect.bisect_right([x[0] for x in checkpoints],start)-1
    lineno,offset=checkpoints[max(i,0)];found=[];total=0
    with p.open('rb') as f:
        f.seek(offset)
        while lineno<=end:
            pos=f.tell();line=f.readline(MAX_LINE+1)
            if not line:break
            if len(line)>MAX_LINE:raise ValueError('Line exceeds safe preview size')
            if b'\0' in line:raise ValueError('Binary data cannot be excerpted')
            if (lineno-1)%1024==0 and lineno>checkpoints[-1][0]:checkpoints.append([lineno,pos])
            if lineno>=start:
                total+=len(line)
                if total>MAX_BYTES:raise ValueError('Excerpt exceeds 2 MB; choose a smaller range')
                found.append(line.decode('utf-8').rstrip('\r\n'))
            lineno+=1
    if signature(p)!=sig:raise ValueError('Source changed during read; retry after it settles')
    if len(found)!=end-start+1:raise ValueError('Requested range extends beyond end of file')
    atomic(cache,{'signature':sig,'checkpoints':checkpoints})
    return found,sig

def payload_hash(lines):return digest('\n'.join(lines).encode())
def anchor_dir(root):return root/'.code-links/anchors'
def make_anchor(root,raw):
    link=parse(raw);p=resolve(root,link['target'],link['code'])
    if not link['start']:raise ValueError('Select a line range first')
    result=excerpt(root,raw);aid=uuid.uuid4().hex[:16];parts=[]
    for part in result['fragments']:
        lines,_=read_range(p,part['start'],part['end'])
        parts.append({'target':link['target'],'start':part['start'],'end':part['end'],'signature':result['signature'],'sha256':payload_hash(lines),'first':digest(lines[0].encode())})
    rec=parts[0] if len(parts)==1 else {'target':link['target'],'kind':'fragments','parts':parts}
    rec.update(id=aid,created=time.time())
    atomic(anchor_dir(root)/(aid+'.json'),rec)
    return {'link':selection_link(link,aid),'record':rec}

def selection_link(link,aid):
    op='{{' if link['code'] else '[[';cl='}}' if link['code'] else ']]'
    return ('!' if link['embed'] else '')+op+link['target']+'#^'+aid+'|'+link['label']+cl+'{height='+str(link['height'])+'}'

def locate(root,link,p,rec=None):
    if rec is None:rec=json.loads((anchor_dir(root)/(link['anchor']+'.json')).read_text())
    # Anchor target is authoritative after a managed rename; do not trust unrelated caller paths.
    p=resolve(root,rec['target'],link['code']);sig=signature(p)
    if sig==rec['signature']:return p,rec['start'],rec['end'],'verified'
    count=rec['end']-rec['start']+1;window=deque();bytes_in=0;matches=[]
    with p.open('rb') as f:
        lineno=0
        while True:
            raw=f.readline(MAX_LINE+1)
            if not raw:break
            lineno+=1
            if len(raw)>MAX_LINE:raise ValueError('Source line too large for anchor relocation')
            line=raw.decode('utf-8').rstrip('\r\n');window.append(line);bytes_in+=len(line.encode())+1
            while len(window)>count or bytes_in>MAX_BYTES+MAX_LINE:
                bytes_in-=len(window.popleft().encode())+1
            if len(window)==count and digest(window[0].encode())==rec['first']:
                if bytes_in>MAX_BYTES*2:continue
                if payload_hash(window)==rec['sha256']:matches.append(lineno-count+1)
                if len(matches)>1:raise ValueError('Ambiguous excerpt: multiple identical passages; source not substituted')
    if signature(p)!=sig:raise ValueError('Source changed during anchor verification')
    if len(matches)!=1:raise ValueError('Tracked passage changed or disappeared; review the source')
    start=matches[0]
    return p,start,start+count-1,'verified-relocated' if start!=rec['start'] else 'verified'

def regex_ranges(p,spec):
    pattern=spec.get('pattern','')
    if not isinstance(pattern,str) or not 1<=len(pattern)<=2000:raise ValueError('Pattern must contain 1–2000 characters')
    before=spec.get('before',0);after=spec.get('after',0);which=spec.get('occurrence','all')
    if any(type(x)!=int or not 0<=x<=30 for x in (before,after)) or which not in ('first','last','all'):raise ValueError('Invalid context or occurrence')
    try:rx=re.compile(pattern)
    except re.error as e:raise ValueError('Invalid regex: '+str(e))
    hits=[];size=0;n=0
    with p.open('rb') as f:
        while True:
            line=f.readline(MAX_LINE+1)
            if not line:break
            n+=1;size+=len(line)
            if len(line)>MAX_LINE or size>512_000_000:raise ValueError('Search limit exceeded (1 MB per line, 512 MB per file)')
            if b'\0' in line:raise ValueError('Binary files cannot be searched')
            if rx.search(line.decode('utf-8').rstrip('\r\n')):
                if which=='last':hits=[n]
                elif which=='all' or not hits:hits.append(n)
                if len(hits)>200:raise ValueError('More than 200 matches; narrow the pattern')
    if not hits:raise ValueError('No matching lines')
    ranges=[]
    for hit in hits:
        lo,hi=max(1,hit-before),min(n,hit+after)
        if ranges and lo<=ranges[-1][1]+1:ranges[-1][1]=max(hi,ranges[-1][1])
        else:ranges.append([lo,hi])
    return ranges

def bounded_regex(p,spec):
    try:
        run=subprocess.run([sys.executable,str(Path(__file__).resolve())],input=json.dumps({'cmd':'regex-worker','root':str(p.parent),'path':str(p),'spec':spec}),text=True,capture_output=True,timeout=8)
    except subprocess.TimeoutExpired:raise ValueError('Regex search exceeded 8 seconds; narrow the expression')
    result=json.loads(run.stdout)
    if not result['ok']:raise ValueError(result['error'])
    return result['result']

def selection(root,raw,spec=None,save=False):
    link=parse(raw)
    if spec is None:
        if not link['anchor']:return {'spec':{'pattern':'','before':0,'after':0,'occurrence':'all'}}
        rec=json.loads((anchor_dir(root)/(link['anchor']+'.json')).read_text())
        return {'spec':rec.get('spec',{'pattern':'','before':0,'after':0,'occurrence':'all'})}
    p=resolve(root,link['target'],link['code']);sig=signature(p)
    if p.suffix.lower() in APPS:raise ValueError('Scenes cannot be searched as text')
    ranges=bounded_regex(p,spec)
    result=assemble(p,link,ranges,'regex selection',sig)
    if save:
        aid=uuid.uuid4().hex[:16]
        atomic(anchor_dir(root)/(aid+'.json'),{'id':aid,'target':link['target'],'kind':'regex','spec':spec,'created':time.time()})
        result['new_link']=selection_link(link,aid)
    return result

def assemble(p,link,ranges,status,sig):
    lines=[];numbers=[];fragments=[];total=0
    for lo,hi in ranges:
        chunk,actual=read_range(p,lo,hi)
        if actual!=sig:raise ValueError('Source changed during selection; refresh')
        total+=sum(len(x.encode())+1 for x in chunk)
        if total>MAX_BYTES or len(lines)+len(chunk)>MAX_LINES:raise ValueError('Combined selection too large')
        if lines:lines.append('⋯ omitted lines ⋯');numbers.append(None)
        fragments.append({'start':lo,'end':hi,'display_start':len(lines)+1})
        lines.extend(chunk);numbers.extend(range(lo,hi+1))
    if signature(p)!=sig:raise ValueError('Source changed during selection; refresh')
    return {'path':str(p),'link':link,'full':False,'start':ranges[0][0],'end':ranges[-1][1],'lines':lines,'line_numbers':numbers,'fragments':fragments,'status':status,'signature':sig}

def excerpt(root,raw):
    link=parse(raw);status='untracked line range'
    if link['target'].startswith('dir:'):
        if link['ranges'] or link['anchor'] or link['embed']:raise ValueError('Directory links have no excerpts')
        p=target_path(root,link['target'][4:],True)
        if not p.is_dir():raise ValueError('Directory not found: '+str(p))
        return {'path':str(p),'link':link,'full':True,'directory':True}
    if link['anchor']:
        rec=json.loads((anchor_dir(root)/(link['anchor']+'.json')).read_text())
        if rec.get('kind')=='regex':
            link['target']=rec['target']
            p=resolve(root,rec['target'],link['code']);sig=signature(p)
            return assemble(p,link,bounded_regex(p,rec['spec']),'regex: '+rec['spec']['pattern'],sig)
        parts=rec.get('parts',[rec]);ranges=[];p=resolve(root,rec['target'],link['code']);sig=signature(p)
        for part in parts:
            # The outer target remains authoritative after managed rename.
            part={**part,'target':rec['target']}
            _,lo,hi,status=locate(root,link,p,part)
            chunk,_=read_range(p,lo,hi)
            if payload_hash(chunk)!=part['sha256']:raise ValueError('Source changed after anchor location')
            ranges.append([lo,hi])
    else:
        p=resolve(root,link['target'],link['code']);sig=signature(p);ranges=link['ranges']
    if p.suffix.lower() in APPS:
        if ranges or link['embed']:raise ValueError('Scene files open in their application; they cannot be excerpted')
        return {'path':str(p),'link':link,'full':True,'application':APPS[p.suffix.lower()]}
    if not ranges:return {'path':str(p),'link':link,'full':True}
    return assemble(p,link,ranges,status,sig)

def text_files(root):
    for item in index(root)['items']:
        if ':' in item['target']:continue  # external roots are read-only for refactoring
        p=resolve(root,item['target'])
        if (item['code'] or p.suffix in ('.md','.markdown')) and p.stat().st_size<=MAX_BYTES:
            try:
                text=p.read_text()
                if '\0' not in text:yield p,text
            except (UnicodeError,OSError):continue

def link_matches(path,text):
    """Restrict managed edits to prose and genuine known-language comments."""
    ext=path.suffix.lower();ranges=[]
    if ext in ('.md','.markdown','.txt','.log','.out') or path.name in NAMES:
        # Markdown code fences and inline code are literal examples, not live links.
        excluded=[]
        if ext in ('.md','.markdown'):
            excluded=[(m.start(),m.end()) for m in re.finditer(r'```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]*`',text)]
        return [m for m in LINK.finditer(text) if not any(a<=m.start()<b for a,b in excluded)]
    if ext=='.py':
        import io,tokenize
        starts=[0]
        for line in text.splitlines(keepends=True):starts.append(starts[-1]+len(line))
        try:
            for tok in tokenize.generate_tokens(io.StringIO(text).readline):
                if tok.type==tokenize.COMMENT:ranges.append((starts[tok.start[0]-1]+tok.start[1],starts[tok.end[0]-1]+tok.end[1]))
        except (tokenize.TokenError,IndentationError):return []
    elif ext in ('.js','.ts','.jsx','.tsx','.c','.cpp','.cc','.h','.hpp','.java','.rs','.go','.css'):
        # Strings are consumed before comment tokens. Templates remain literal.
        pattern=r"\"(?:\\.|[^\"\\])*\"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|//[^\n]*|/\*[\s\S]*?\*/"
        for m in re.finditer(pattern,text):
            if m[0].startswith(('//','/*')):ranges.append((m.start(),m.end()))
    else:
        prefix='--' if ext in ('.lua','.sql') else ('%' if ext in ('.m','.tex') else '#')
        for m in re.finditer(r'(?m)^\s*'+re.escape(prefix)+r'[^\n]*',text):ranges.append((m.start(),m.end()))
    return [m for m in LINK.finditer(text) if any(a<=m.start()<b for a,b in ranges)]

def backlinks(root,target):
    cache=CACHE/'references'/(digest(str(root).encode())+'.json')
    try:old=json.loads(cache.read_text())
    except (OSError,ValueError):old={}
    current={};out=[]
    for item in index(root)['items']:
        if ':' in item['target']:continue
        p=resolve(root,item['target']);sig=signature(p)
        if not (item['code'] or p.suffix in ('.md','.markdown')) or sig[2]>MAX_BYTES:continue
        key=str(p);entry=old.get(key)
        if not entry or entry['signature']!=sig:
            try:text=p.read_text()
            except (OSError,UnicodeError):continue
            if '\0' in text:continue
            refs=[]
            for m in link_matches(p,text):
                try:l=parse(m[0])
                except ValueError:continue
                refs.append({'target':l['target'],'path':key,'line':text.count('\n',0,m.start())+1,'text':m[0]})
            if signature(p)!=sig:raise ValueError('Source changed while indexing backlinks')
            entry={'signature':sig,'references':refs}
        current[key]=entry;out += [r for r in entry['references'] if r['target']==target]
    atomic(cache,current);return out

def rename(root,old,new,apply=False,moved=False):
    if ':' in old or ':' in new:raise ValueError('Rename is limited to this project')
    root=root.resolve()
    source=(root/old).resolve() if moved else resolve(root,old);dest=(root/new).resolve()
    if not source.is_relative_to(root) or not dest.is_relative_to(root) or (dest.exists() and not moved) or not dest.parent.is_dir() or (moved and not dest.is_file()):raise ValueError('Unsafe or existing rename destination')
    if any(x in new for x in '#|{}[]\n'):raise ValueError('Destination has reserved link characters')
    edits=[]
    for p,text in text_files(root):
        def replace(m):
            try:l=parse(m[0])
            except ValueError:return m[0]
            if l['target']==old:return m[0].replace(old,new,1)
            if '/' not in l['target'] and ':' not in l['target'] and old=='scripts/'+l['target'] and not (root/l['target']).exists():return m[0].replace(l['target'],new,1)
            return m[0]
        matches=link_matches(p,text);changed=text
        for m in reversed(matches):changed=changed[:m.start()]+replace(m)+changed[m.end():]
        if changed!=text:edits.append((p,text,changed))
    records=[]
    for p in anchor_dir(root).glob('*.json'):
        rec=json.loads(p.read_text())
        if rec['target']==old:records.append((p,rec))
    report={'old':old,'new':new,'references':[str(p.relative_to(root)) for p,_,_ in edits],'anchors':len(records),'applied':False}
    if not apply:return report
    # Controlled operation: clients reject unsaved buffers; retain exact recovery copies.
    lock=root/'.code-links/rename.lock';lock.parent.mkdir(exist_ok=True)
    with lock.open('a') as f:
        fcntl.flock(f,fcntl.LOCK_EX|fcntl.LOCK_NB)
        txn=root/'.code-links/rename-recovery'/uuid.uuid4().hex;txn.mkdir(parents=True)
        for i,(p,before,after) in enumerate(edits):
            if p.read_text()!=before:raise ValueError('A referencing file changed; rename cancelled')
            shutil.copy2(p,txn/str(i))
        atomic(txn/'receipt.json',report)
        if not moved:source.rename(dest)
        try:
            for p,before,after in edits:
                q=dest if p==source else p
                if q.read_text()!=before:raise ValueError('Concurrent edit during rename')
                q.write_text(after)
            for p,rec in records:rec['target']=new;atomic(p,rec)
        except Exception:
            # Preserve evidence, do not overwrite a possible competing writer.
            raise ValueError('Rename interrupted; recovery copies in '+str(txn))
        report['applied']=True;report['recovery']=str(txn);atomic(txn/'receipt.json',report)
    return report

def launch(root,raw,source_line=None,destination="current",action="auto",expected_signature=None):
    result=excerpt(root,raw)
    if expected_signature is not None and signature(Path(result['path']))!=expected_signature:raise ValueError('Source changed since preview; refresh before navigating')
    if destination not in ('current','split','tab','window'):raise ValueError('Invalid destination')
    if action not in ('auto','source','folder','finder','vesta','blender','wolfram','run'):raise ValueError('Invalid action')
    if action=='auto' and source_line is None and Path(result['path']).suffix.lower() in ('.csv','.tsv') and not result['link']['ranges'] and not result['link']['anchor']:
        subprocess.run(['/usr/bin/open',result['path']],check=True,capture_output=True)
        return {'opened':'default application','path':result['path']}
    if action=='finder':
        p=Path(result['path']);folder=p if result.get('directory') else p.parent
        subprocess.run(['/usr/bin/open',str(folder)],check=True,capture_output=True)
        return {'opened':'Finder','path':str(folder)}
    if action=='run':
        p=Path(result['path'])
        if p.suffix.lower() not in ('.wl','.wls','.m'):raise ValueError('Run script requires .wl, .wls or .m')
        import shlex
        CACHE.mkdir(parents=True,exist_ok=True)
        script=CACHE/('wolfram-'+uuid.uuid4().hex+'.command')
        script.write_text('#!/bin/sh\ncd '+shlex.quote(str(p.parent))+' || exit 1\n'+shlex.quote('/Applications/Wolfram.app/Contents/MacOS/wolframscript')+' -file '+shlex.quote(str(p))+'\nstatus=$?\nprintf "\\nExit status: %s\\nPress Return to close. " "$status"\nread answer\nexit "$status"\n');script.chmod(0o700)
        subprocess.run(['/usr/bin/open','-a','Terminal',str(script)],check=True)
        return {'opened':'Wolfram script in Terminal','path':str(p)}
    app=(result.get('application') or ('Wolfram' if Path(result['path']).suffix.lower() in ('.wl','.wls') else None)) if action=='auto' else {'vesta':'VESTA','blender':'Blender','wolfram':'Wolfram'}.get(action)
    if app:
        candidates={'VESTA':[Path.home()/'Desktop/VESTA.app',Path('/Applications/VESTA.app')], 'Blender':[Path('/Applications/Blender.app')], 'Wolfram':[Path('/Applications/Wolfram.app')]}
        target=next((str(p) for p in candidates[app] if p.exists()),app)
        subprocess.run(['/usr/bin/open','-a',target,result['path']],check=True,capture_output=True)
        return {'opened':app,'path':result['path']}
    if result.get('application') and action!='folder' and Path(result['path']).suffix.lower()!='.nb':raise ValueError('Use the scene application to edit this file')
    if action=='source' and source_line is None:source_line=result.get('start',1)
    CACHE.mkdir(parents=True,exist_ok=True)
    req=CACHE/('open-'+uuid.uuid4().hex+'.json')
    atomic(req,{'root':str(root),'raw':raw,'source_line':source_line,'destination':destination,'action':action,'expected_signature':expected_signature})
    nvim=shutil.which('nvim') or '/opt/homebrew/bin/nvim'
    registry=CACHE/'nvim.json'
    try:
        if destination=='window':raise ValueError('New window requested')
        info=json.loads(registry.read_text());os.kill(info['pid'],0)
        expr="luaeval(\"require('code_links').receive(_A)\", '"+str(req).replace("'","''")+"')"
        if result.get('directory'):
            # Existing Neovim sessions may have loaded an older Lua module.
            lua="(function(p) vim.schedule(function() if _G.Snacks and Snacks.explorer then Snacks.explorer({cwd=p}) else vim.cmd('tabnew'); vim.cmd('edit '..vim.fn.fnameescape(p)) end end); return true end)(_A)"
            expr="luaeval("+json.dumps(lua)+", '"+result['path'].replace("'","''")+"')"
        r=subprocess.run([nvim,'--server',info['socket'],'--remote-expr',expr],capture_output=True,timeout=4)
        if r.returncode==0:
            subprocess.run(['/usr/bin/open','-a',info.get('terminal','Terminal')],check=False,capture_output=True)
            return {'opened':'existing Neovim','path':result['path']}
    except (OSError,ValueError,KeyError,subprocess.TimeoutExpired):pass
    import shlex
    script=CACHE/('launch-'+uuid.uuid4().hex+'.command')
    # All dynamic shell arguments quoted. Never interpret source/link text as commands.
    plugin=Path(__file__).resolve().parents[1]/'nvim'
    lua="vim.opt.rtp:prepend("+json.dumps(str(plugin))+"); require('code_links').setup(); require('code_links').receive("+json.dumps(str(req))+")"
    # Give startup/dashboard plugins a real file argument before the link request arrives.
    script.write_text('#!/bin/sh\nexec '+shlex.quote(nvim)+' -c '+shlex.quote('lua '+lua)+' -- '+shlex.quote(result['path'])+'\n');script.chmod(0o700)
    subprocess.run(['/usr/bin/open']+(['-n'] if destination=='window' else [])+['-a','Terminal',str(script)],check=True)
    return {'opened':'new Neovim terminal','path':result['path']}

def root_manager(root,**args):
    return nav_registry().manager(root,**args)

def main(a):
    root=project(a.get('root') or os.getcwd());cmd=a['cmd']
    if cmd=='roots':return root_manager(root,**{k:v for k,v in a.items() if k not in ('cmd','root')})
    if cmd=='index':return {'root':str(root),**index(root)}
    if cmd=='parse':return parse(a['raw'])
    if cmd=='inspect':return inspect_link(root,a['raw'])
    if cmd=='inspect-many':
        result={}
        for raw in a['raws'][:500]:
            try:result[raw]=inspect_link(root,raw)
            except Exception as e:result[raw]={'error':str(e)}
        return result
    if cmd=='create':return create_file(root,a['raw'])
    if cmd=='regex-worker':return regex_ranges(Path(a['path']),a['spec'])
    if cmd=='selection':return selection(root,a['raw'],a.get('spec'),a.get('save',False))
    if cmd=='read':return excerpt(root,a['raw'])
    if cmd=='anchor':return make_anchor(root,a['raw'])
    if cmd=='backlinks':return backlinks(root,a['target'])
    if cmd=='rename':return rename(root,a['old'],a['new'],a.get('apply',False),a.get('moved',False))
    if cmd=='launch':return launch(root,a['raw'],a.get('source_line'),a.get('destination','current'),a.get('action','auto'),a.get('expected_signature'))
    raise ValueError('Unknown command')
if __name__=='__main__':
    try:print(json.dumps({'ok':True,'result':main(json.load(sys.stdin))},ensure_ascii=False))
    except Exception as e:print(json.dumps({'ok':False,'error':str(e)}));sys.exit(1)
