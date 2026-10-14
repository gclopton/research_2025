/** Optional cross-plugin contract. No dependency on Image Gallery's implementation. */
export type ImageChoice = { path: string };
export type GalleryHost = { plugins?: { getPlugin(id: string): unknown } };
export async function chooseImage<T extends ImageChoice>(
  host: GalleryHost,
  options: { sourcePath: string; currentPath?: string; title: string },
  fallback: () => Promise<T | null>,
): Promise<T | null> {
  const plugin = host.plugins?.getPlugin('image-gallery') as
    { api?: { version: number; pickImage: (options: unknown) => Promise<T | null> } } | undefined;
  if (plugin?.api?.version === 1 && typeof plugin.api.pickImage === 'function')
    return plugin.api.pickImage(options);
  return fallback();
}
export function naturalImageGeometry(width: number, height: number, x: number, y: number) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0)
    throw Error('Image dimensions are unavailable.');
  const scale = Math.min(1, 1600 / width, 792 / height);
  const w = Math.max(1, Math.round(width * scale)),
    h = Math.max(1, Math.round(height * scale));
  return { w, h, x: Math.max(0, Math.min(1600 - w, x)), y: Math.max(0, Math.min(792 - h, y)) };
}
export type FileChoice = { path: string; link: string; code: boolean };
export async function chooseFile(host:GalleryHost,options:{sourcePath:string;kind?:string;query?:string;title?:string}):Promise<FileChoice|null>{
  const plugin=host.plugins?.getPlugin('image-gallery') as {api?:{pickFile?:(options:unknown)=>Promise<FileChoice|null>}}|undefined;
  if(!plugin?.api?.pickFile)throw Error('Update and enable Image Gallery to browse file previews.');
  return plugin.api.pickFile(options);
}
