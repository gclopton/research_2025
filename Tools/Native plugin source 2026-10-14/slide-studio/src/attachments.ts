/** Attachment naming and geometry shared by file-picker and drag imports. */
export function isImageFile(file: { name: string; type: string }): boolean {
  return (
    /\.(png|jpe?g|gif|webp|avif|svg|bmp)$/i.test(file.name) ||
    /^image\/(png|jpeg|gif|webp|avif|svg\+xml|bmp)$/.test(file.type)
  );
}
export function imageName(file: { name: string; type: string }): string {
  const name = file.name.replace(/[\\/:*?"<>|#\[\]]/g, '-').trim();
  if (/\.(png|jpe?g|gif|webp|avif|svg|bmp)$/i.test(name)) return name;
  const extension =
    ({ 'image/jpeg': 'jpg', 'image/svg+xml': 'svg' } as Record<string, string>)[file.type] ??
    file.type.split('/')[1] ??
    'png';
  return `${name || 'Screenshot'}.${extension}`;
}
export function localImageFolder(sourcePath: string): string {
  const slash = sourcePath.lastIndexOf('/');
  return `${slash < 0 ? '' : sourcePath.slice(0, slash + 1)}images`;
}
export function imageGeometry(width: number, height: number, x: number, y: number) {
  const scale = Math.min(1, 720 / width, 480 / height);
  const w = Math.max(40, Math.round(width * scale));
  const h = Math.max(40, Math.round(height * scale));
  return {
    w,
    h,
    x: Math.max(0, Math.min(1600 - w, Math.round(x))),
    y: Math.max(0, Math.min(792 - h, Math.round(y))),
  };
}
