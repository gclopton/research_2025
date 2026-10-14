import { opendir, realpath } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';

export function cleanFolder(folder: string): string {
  const parts = folder.trim().replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  if (parts.some(p => p === '..' || p === '.' || /[\0\r\n]/.test(p)))
    throw Error('Choose a folder within the selected source.');
  return parts.join('/');
}

export function withinFolder(path: string, folder: string, recursive: boolean): boolean {
  const local = path.replace(/^[^:]+:/, '');
  const prefix = folder ? folder + '/' : '';
  return local.startsWith(prefix) && (recursive || !local.slice(prefix.length).includes('/'));
}

export async function folderPath(base: string, folder: string): Promise<string> {
  const root = await realpath(base);
  const dest = await realpath(resolve(root, cleanFolder(folder)));
  const rel = relative(root, dest);
  if (rel === '..' || rel.startsWith('../') || isAbsolute(rel))
    throw Error('Folder is outside the selected source.');
  return dest;
}

const visible = (name: string) => !name.startsWith('.') && !['node_modules','__pycache__','venv'].includes(name);

// Only enumerate the selected directory, never its descendants, for navigation.
export async function childFolders(base: string, folder: string): Promise<string[]> {
  const path = await folderPath(base, folder);
  const children: string[] = [];
  for await (const entry of await opendir(path)) {
    if (entry.isDirectory() && visible(entry.name)) children.push(entry.name);
  }
  return children.sort((a,b) => a.localeCompare(b));
}

export async function scanFolder(base: string, folder: string, recursive: boolean,
  keep: (path: string) => boolean, cancelled: () => boolean, limit = 50000) {
  folder = cleanFolder(folder);
  const start = await folderPath(base, folder);
  const paths: string[] = [];
  let capped = false;
  let visited = 0;
  const walk = async (dir: string, prefix: string) => {
    for await (const entry of await opendir(dir)) {
      if (cancelled() || capped) return;
      if (!visible(entry.name)) continue;
      const name = prefix ? prefix + '/' + entry.name : entry.name;
      if (entry.isDirectory() && recursive) await walk(resolve(dir, entry.name), name);
      else if (entry.isFile() && keep(name)) {
        paths.push(name);
        if (paths.length >= limit) capped = true;
      }
      if (++visited % 200 === 0) await new Promise<void>(done => setTimeout(done, 0));
    }
  };
  await walk(start, folder);
  return { paths, capped };
}
