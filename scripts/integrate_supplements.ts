/**
 * Integrate SUPPLEMENTS into public/supplements.
 * Copies markdown/text guide content and writes a manifest consumed by the app.
 */
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SOURCE_DIR = path.join(PROJECT_ROOT, 'SUPPLEMENTS');
const DEST_DIR = path.join(PROJECT_ROOT, 'public', 'supplements');

interface ManifestEntry {
  title: string;
  path: string;
  source: string;
}

const manifest: ManifestEntry[] = [];

const SUPPLEMENT_FOLDERS = [
  'Ashtakvarg-Guide',
  'Ashtakvarg-Guide (1)',
  'Ashtakvarg-Guide(1)',
  'Bug-Free-Guide',
  'Flow-Antigravity',
  'Marriage-Timing-Spouse',
  'Vedic-Forecasting',
  'Vedic-Rajkumar',
] as const;

const SKIP_DIR_NAMES = new Set([
  'node_modules',
  '.git',
  '.local',
  '.agents',
  'artifacts',
  'attached_assets',
  'lib',
  'scripts',
  'dist',
  'build',
  '.cache',
  '.next',
  'coverage',
]);

const CONTENT_DIR_NAMES = new Set(['guides', 'deliverables', 'docs']);
const SKIP_FILE_NAMES = new Set(['robots.txt', 'sso id.txt', 'sso id.md']);
const SENSITIVE_CONTENT_PATTERNS = [
  /\bsso\s+id\b/i,
  /rajasthan\.gov\.in/i,
  /rajkosh\.rajasthan\.gov\.in/i,
];

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

function toPublicSlug(targetPath: string): string {
  return path
    .relative(DEST_DIR, targetPath)
    .replace(/\\/g, '/')
    .replace(/\.md$/i, '');
}

function toTitle(fileName: string): string {
  return fileName
    .replace(/\.(md|txt)$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function addManifestEntry(sourcePath: string, targetPath: string): void {
  manifest.push({
    title: toTitle(path.basename(targetPath)),
    path: toPublicSlug(targetPath),
    source: path.relative(SOURCE_DIR, sourcePath).replace(/\\/g, '/'),
  });
}

async function processFile(sourcePath: string, targetDir: string): Promise<boolean> {
  const fileName = path.basename(sourcePath);
  if (SKIP_FILE_NAMES.has(fileName.toLowerCase())) return false;

  const ext = path.extname(sourcePath).toLowerCase();
  const baseName = path.basename(sourcePath, ext);

  if (ext === '.txt') {
    const content = await fs.readFile(sourcePath, 'utf-8');
    if (SENSITIVE_CONTENT_PATTERNS.some(pattern => pattern.test(content))) {
      console.warn(`  skipped sensitive file: ${path.relative(SOURCE_DIR, sourcePath)}`);
      return false;
    }
    const targetFilePath = path.join(targetDir, `${baseName}.md`);
    await fs.writeFile(targetFilePath, content, 'utf-8');
    addManifestEntry(sourcePath, targetFilePath);
    console.log(`  converted: ${path.relative(SOURCE_DIR, sourcePath)}`);
    return true;
  }

  if (ext === '.md') {
    const content = await fs.readFile(sourcePath, 'utf-8');
    if (SENSITIVE_CONTENT_PATTERNS.some(pattern => pattern.test(content))) {
      console.warn(`  skipped sensitive file: ${path.relative(SOURCE_DIR, sourcePath)}`);
      return false;
    }
    const targetFilePath = path.join(targetDir, fileName);
    await fs.copyFile(sourcePath, targetFilePath);
    addManifestEntry(sourcePath, targetFilePath);
    console.log(`  copied:    ${path.relative(SOURCE_DIR, sourcePath)}`);
    return true;
  }

  return false;
}

async function walkFolder(sourceDir: string, targetDir: string): Promise<number> {
  await ensureDir(targetDir);

  let entries: fs.Dirent[];
  try {
    entries = await fs.readdir(sourceDir, { withFileTypes: true });
  } catch (err) {
    console.error(`  failed to read: ${sourceDir}`, err);
    return 0;
  }

  let count = 0;

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      if (SKIP_DIR_NAMES.has(entry.name)) continue;
      count += await walkFolder(sourcePath, targetPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (ext === '.md' || ext === '.txt') {
        if (await processFile(sourcePath, targetDir)) count += 1;
      }
    }
  }

  return count;
}

async function walkSupplementRoot(sourceRoot: string, destRoot: string): Promise<number> {
  let entries: fs.Dirent[];

  try {
    entries = await fs.readdir(sourceRoot, { withFileTypes: true });
  } catch {
    return 0;
  }

  await ensureDir(destRoot);

  let count = 0;
  const contentDirs = entries.filter(e => e.isDirectory() && CONTENT_DIR_NAMES.has(e.name));
  const otherEntries = entries.filter(e => !e.isDirectory() || !CONTENT_DIR_NAMES.has(e.name));

  for (const entry of contentDirs) {
    count += await walkFolder(path.join(sourceRoot, entry.name), path.join(destRoot, entry.name));
  }

  for (const entry of otherEntries) {
    const sourcePath = path.join(sourceRoot, entry.name);
    const targetPath = path.join(destRoot, entry.name);

    if (entry.isDirectory()) {
      if (SKIP_DIR_NAMES.has(entry.name)) continue;
      count += await walkFolder(sourcePath, targetPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (ext === '.md' || ext === '.txt') {
        if (await processFile(sourcePath, destRoot)) count += 1;
      }
    }
  }

  return count;
}

async function processRootFiles(): Promise<number> {
  let entries: fs.Dirent[];
  try {
    entries = await fs.readdir(SOURCE_DIR, { withFileTypes: true });
  } catch (err) {
    console.error(`Source not found: ${SOURCE_DIR}`, err);
    process.exit(1);
  }

  let count = 0;
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (ext !== '.md' && ext !== '.txt') continue;
    if (await processFile(path.join(SOURCE_DIR, entry.name), DEST_DIR)) count += 1;
  }
  return count;
}

async function integrateFolder(folderName: string): Promise<number> {
  const sourcePath = path.join(SOURCE_DIR, folderName);
  const destPath = path.join(DEST_DIR, folderName);

  try {
    const stat = await fs.stat(sourcePath);
    if (!stat.isDirectory()) {
      console.warn(`  skipped (not a directory): ${folderName}`);
      return 0;
    }
  } catch {
    console.warn(`  skipped (missing): ${folderName}`);
    return 0;
  }

  console.log(`\nFolder: ${folderName}`);
  const count = await walkSupplementRoot(sourcePath, destPath);

  if (count === 0) {
    console.log('  no markdown/text guide files found');
  } else {
    console.log(`  integrated ${count} file(s)`);
  }

  return count;
}

async function main(): Promise<void> {
  console.log('Starting supplement integration...');
  console.log(`  source: ${SOURCE_DIR}`);
  console.log(`  dest:   ${DEST_DIR}`);

  await fs.rm(DEST_DIR, { recursive: true, force: true });
  await ensureDir(DEST_DIR);

  let total = await processRootFiles();

  for (const folder of SUPPLEMENT_FOLDERS) {
    total += await integrateFolder(folder);
  }

  manifest.sort((a, b) => a.title.localeCompare(b.title));
  await fs.writeFile(
    path.join(DEST_DIR, 'manifest.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), total, entries: manifest }, null, 2),
    'utf-8',
  );

  console.log(`\nSupplement integration complete. Total files: ${total}`);
}

main().catch(err => {
  console.error('Integration failed:', err);
  process.exit(1);
});
