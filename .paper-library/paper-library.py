#!/usr/bin/env python3
"""Local paper intake: one PDF and one reading conversion per source, many libraries."""
import argparse, contextlib, hashlib, json, os, re, shutil, sys, tempfile, unicodedata, uuid, subprocess
from pathlib import Path
from datetime import datetime, timezone

CATALOG = Path('.paper-library/catalog.json')
def catalog_path(v):
    current=v/CATALOG
    return current if current.is_file() else v/'Papers/.library/catalog.json'
def digest(p):
    h=hashlib.sha256()
    with p.open('rb') as f:
        for b in iter(lambda:f.read(1024*1024),b''): h.update(b)
    return h.hexdigest()
def key(s): return re.sub('[^a-z0-9]','',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower())
def doi_key(s): return re.sub(r'^https?://(?:dx\.)?doi\.org/','',s.strip().lower())
def within(v,p):
    out=(v/p).resolve()
    if not out.is_relative_to(v): raise ValueError('Path must stay inside this vault')
    return out

def matches(c,sha='',title='',doi=''):
    exact=[i for i,s in c['sources'].items() if sha and sha in [s['pdf']['sha256']]+[e['sha256'] for e in s.get('equivalentPdfs',[])]]
    if exact:return 'exact',exact
    candidates=[i for i,s in c['sources'].items() if (title and key(title) in [key(s['title']),key(f"{s.get('authors','')} {s.get('year','')} - {s['title']}")]) or (doi and doi_key(doi)==doi_key(s.get('doi','')))]
    return 'candidate' if candidates else 'new',candidates

@contextlib.contextmanager
def transaction(v):
    path=catalog_path(v);lock=path.with_suffix('.json.lock');fd=os.open(lock,os.O_CREAT|os.O_EXCL|os.O_WRONLY);tmp=None
    try:
        raw=path.read_bytes();c=json.loads(raw);yield c
        if path.read_bytes()!=raw:raise RuntimeError('Catalog changed during update; retry')
        c['revision']+=1
        fd2,tmp=tempfile.mkstemp(prefix='catalog-',suffix='.tmp',dir=path.parent)
        with os.fdopen(fd2,'w') as f:json.dump(c,f,indent=2,ensure_ascii=False);f.write('\n');f.flush();os.fsync(f.fileno())
        os.replace(tmp,path);tmp=None
    finally:
        if tmp:os.unlink(tmp)
        os.close(fd);lock.unlink()

def membership(c,source,library):
    if source not in c['sources'] or library not in c['libraries']:raise ValueError('Unknown source or library')
    item={'source':source,'library':library}
    if item not in c['memberships']:c['memberships'].append(item)

def check(v,c):
    errors=[];seen={};registered={};reserved=set()
    for i,s in c['sources'].items():
        reserved.update(key(t) for t in [s['title'],Path(s['pdf']['path']).stem,Path(s.get('conversion',{}).get('path','')).stem]+[Path(a['path']).stem for a in s.get('aliases',[])])
        cleanup=s.get('cleanup');conversion=s.get('conversion')
        if cleanup and conversion:
            md=within(v,conversion['path'])
            if md.is_file() and digest(md)!=cleanup['markdownSha256']:errors.append('Changed cleaned reading copy '+conversion['path'])
        for field in ['pdf','conversion']:
            if field in s:
                p=within(v,s[field]['path']);registered[str(p)]=i
                if not p.is_file():errors.append('Missing '+s[field]['path'])
        p=within(v,s['pdf']['path'])
        if p.is_file() and digest(p)!=s['pdf']['sha256']:errors.append('Changed PDF '+s['pdf']['path'])
    for p in within(v,c.get('sourceRoot','Papers')).rglob('*.pdf'):
        sha=digest(p)
        if sha in seen:errors.append(f'Duplicate PDF: {p.relative_to(v)} = {seen[sha]}')
        else:seen[sha]=str(p.relative_to(v))
        kind,ids=matches(c,sha,p.stem)
        if str(p.resolve()) not in registered and ids:errors.append('Unregistered matching PDF '+str(p.relative_to(v)))
    for p in within(v,c.get('sourceRoot','Papers')).rglob('*.md'):
        if 'markdown_originals' not in p.parts or str(p.resolve()) in registered:continue
        kind,ids=matches(c,title=p.stem)
        if ids:errors.append('Unregistered matching conversion '+str(p.relative_to(v)))
    reserved.discard('')
    for root,dirs,files in os.walk(v):
        dirs[:]=[d for d in dirs if not d.startswith('.')]
        for name in files:
            p=Path(root)/name
            if p.suffix.lower() not in ['.md','.pdf'] or str(p.resolve()) in registered:continue
            name=p.stem
            for _ in range(4):
                if key(name) in reserved:
                    errors.append('Reserved paper title: '+str(p.relative_to(v)));break
                stripped=re.sub(r'(?:[\s_-]+(?:copy|backup|old version|\d+)|\s*\((?:copy|backup|old version|\d+)\))$','',name,flags=re.I).strip()
                if stripped==name:break
                name=stripped
    return errors

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--vault',type=Path,required=True)
    sub=parser.add_subparsers(dest='command',required=True)
    find=sub.add_parser('find');find.add_argument('--pdf',type=Path);find.add_argument('--title',default='');find.add_argument('--doi',default='')
    sub.add_parser('check');sub.add_parser('libraries')
    conv=sub.add_parser('convert');conv.add_argument('source');conv.add_argument('--converter',type=Path,default=Path.home()/'ObsidianVaults/me_510/tools/mathpix_chapters_to_obsidian.py')
    imp=sub.add_parser('import');imp.add_argument('pdf',type=Path);imp.add_argument('--library',required=True);imp.add_argument('--title');imp.add_argument('--doi',default='');imp.add_argument('--use-existing',help='Source ID after reviewing candidate matches')
    reg=sub.add_parser('register-conversion');reg.add_argument('source');reg.add_argument('markdown',help='Vault-relative path to the completed Mathpix reading copy')
    clean=sub.add_parser('mark-cleaned',help='Record completed PDF/OCR/evidence review, not conversion alone');clean.add_argument('source')
    pre=sub.add_parser('conversion-input');pre.add_argument('source',help='Print existing conversion or canonical PDF before running Mathpix')
    add=sub.add_parser('add');add.add_argument('source');add.add_argument('library')
    args=parser.parse_args();v=args.vault.expanduser().resolve();c=json.loads(catalog_path(v).read_text())
    if args.command=='libraries':print(json.dumps(c['libraries'],indent=2));return
    if args.command=='find':
        sha=digest(args.pdf) if args.pdf else '';kind,ids=matches(c,sha,args.title or (args.pdf.stem if args.pdf else ''),args.doi)
        print(json.dumps({'match':kind,'sources':{i:c['sources'][i] for i in ids}},indent=2));return
    if args.command=='check':
        errors=check(v,c);print(json.dumps({'sources':len(c['sources']),'issues':errors},indent=2));sys.exit(bool(errors))
    if args.command=='conversion-input':
        s=c['sources'][args.source];ref=s.get('conversion') or s['pdf'];p=within(v,ref['path'])
        if not p.is_file():raise ValueError('Registered input is missing')
        print(json.dumps({'status':'already-converted' if 'conversion' in s else 'needs-conversion','path':str(p)},indent=2));return
    if args.command=='convert':
        source=c['sources'][args.source]
        if source.get('conversion'):
            print(json.dumps({'status':'already-converted','path':source['conversion']['path']}));return
        pdf=within(v,source['pdf']['path'])
        if digest(pdf)!=source['pdf']['sha256']:raise ValueError('PDF identity changed; review before conversion')
        if not args.converter.is_file():raise ValueError('Specify the installed Mathpix chapter converter with --converter')
        output=within(v,c.get('sourceRoot','Papers'))/'Sources'/args.source/'markdown_originals'
        # One source lock prevents simultaneous paid conversion jobs for the same paper.
        source_lock=catalog_path(v).parent/('convert-'+args.source+'.lock')
        fd=os.open(source_lock,os.O_CREAT|os.O_EXCL|os.O_WRONLY)
        try:
            with tempfile.TemporaryDirectory(prefix='paper-conversion-') as temp:
                shutil.copy2(pdf,Path(temp)/pdf.name)
                subprocess.run([sys.executable,str(args.converter),'--src-dir',temp,'--out-dir',str(output)],check=True)
            converted=list(output.rglob('*.md'))
            if len(converted)!=1:raise ValueError('Inspect conversion output: expected one reading copy')
            with transaction(v) as latest:
                if latest['sources'][args.source].get('conversion'):raise ValueError('Another reading copy was registered; review the output')
                latest['sources'][args.source]['conversion']={'path':str(converted[0].relative_to(v))}
            print(json.dumps({'status':'converted','path':str(converted[0].relative_to(v))}))
        finally:os.close(fd);source_lock.unlink()
        return
    with transaction(v) as c:
        if args.command=='add':membership(c,args.source,args.library)
        elif args.command=='mark-cleaned':
            s=c['sources'][args.source]
            if not s.get('conversion'):raise ValueError('A Markdown reading copy is required before cleanup review')
            pdf=within(v,s['pdf']['path']);md=within(v,s['conversion']['path'])
            pdf_hash=digest(pdf)
            if pdf_hash!=s['pdf']['sha256']:raise ValueError('PDF identity changed; review before recording cleanup')
            s['cleanup']={'markdownPath':s['conversion']['path'],'verifiedAt':datetime.now(timezone.utc).isoformat(),'pdfSha256':pdf_hash,'markdownSha256':digest(md)}
            print(json.dumps({'source':args.source,'cleanup':s['cleanup']}))
        elif args.command=='register-conversion':
            s=c['sources'][args.source];p=within(v,args.markdown)
            if not p.is_file() or p.suffix.lower()!='.md':raise ValueError('Choose an existing Markdown conversion')
            rel=str(p.relative_to(v))
            if s.get('conversion',{}).get('path') not in [None,rel]:raise ValueError('This paper already has a reading copy: '+s['conversion']['path'])
            if any(x.get('conversion',{}).get('path')==rel for i,x in c['sources'].items() if i!=args.source):raise ValueError('Conversion already belongs to another source')
            s['conversion']={'path':rel}
        elif args.command=='import':
            if args.library not in c['libraries']:raise ValueError('Unknown library')
            data=args.pdf.read_bytes()
            if not data.startswith(b'%PDF-'):raise ValueError('Input is not a PDF')
            sha=hashlib.sha256(data).hexdigest();title=args.title or args.pdf.stem;kind,ids=matches(c,sha,title,args.doi)
            if args.use_existing:
                if args.use_existing not in c['sources']:raise ValueError('Unknown source')
                source=args.use_existing
            elif kind=='exact':source=ids[0]
            elif ids:raise ValueError('Possible existing paper. Review with find, then import --use-existing SOURCE: '+', '.join(ids))
            else:
                source='src_'+uuid.uuid4().hex[:14];folder=within(v,c.get('sourceRoot','Papers'))/'Sources'/source;folder.mkdir(parents=True)
                dest=folder/args.pdf.name
                with dest.open('xb') as f:f.write(data)
                c['sources'][source]={'title':title,'pdf':{'path':str(dest.relative_to(v)),'sha256':sha,'bytes':len(data)}}
                if args.doi:c['sources'][source]['doi']=doi_key(args.doi)
            membership(c,source,args.library);print(json.dumps({'source':source,'match':kind}))
if __name__=='__main__':
    try:main()
    except (ValueError,KeyError,FileExistsError,RuntimeError) as e:sys.exit(str(e))
