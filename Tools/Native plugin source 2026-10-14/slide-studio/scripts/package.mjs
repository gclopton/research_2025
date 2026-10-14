import { mkdir, copyFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
await mkdir('dist/slide-studio', { recursive: true });
for (const file of [
  'main.js',
  'manifest.json',
  'styles.css',
  'README.md',
  'THIRD_PARTY_NOTICES.md',
]) {
  await copyFile(file, `dist/slide-studio/${file}`);
}
execFileSync('zip', ['-qr', 'slide-studio-0.2.0.zip', 'slide-studio'], { cwd: 'dist' });
console.log('Packaged dist/slide-studio-0.2.0.zip');
