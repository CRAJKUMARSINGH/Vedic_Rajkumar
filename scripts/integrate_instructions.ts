// scripts/integrate_instructions.ts
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const outputPublic = path.join(repoRoot, 'public', 'instructions');
const backupDir = path.join(repoRoot, 'backup_deleted');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

ensureDir(outputPublic);
ensureDir(backupDir);

function processFile(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext !== '.md' && ext !== '.txt') return;
  const rel = path.relative(repoRoot, filePath);
  const id = rel.replace(/[\\/]/g, '_').replace(/\.(md|txt)$/, '');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  const outPath = path.join(outputPublic, `${id}.md`);
  fs.writeFileSync(outPath, content);
  // backup original – copy then delete to avoid EPERM on rename
  const backupPath = path.join(backupDir, path.basename(filePath));
  try {
    fs.copyFileSync(filePath, backupPath);
    fs.unlinkSync(filePath);
  } catch (e) {
    console.warn('Failed to backup/delete', filePath, e);
  }
}

function walk(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // skip node_modules, .git, public, backup_deleted, dist, out
      if (['node_modules', '.git', 'public', 'backup_deleted', 'dist', 'out'].includes(entry.name)) continue;
      walk(full);
    } else {
      processFile(full);
    }
  }
}

walk(repoRoot);

console.log('Integration of txt/md files completed.');
