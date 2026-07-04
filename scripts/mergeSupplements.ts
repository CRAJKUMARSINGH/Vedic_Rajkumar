// scripts/mergeSupplements.ts
import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SUPPLEMENT_ROOT = path.join(PROJECT_ROOT, 'SUPPLEMENTS');
const DEST_ROOT = path.join(PROJECT_ROOT, 'src', 'supplements');

function copyRecursive(src: string, dest: string) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else if (stats.isFile()) {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

console.log('🚀 Merging SUPPLEMENTS into src/supplements');
copyRecursive(SUPPLEMENT_ROOT, DEST_ROOT);
console.log('✅ Merge completed');
