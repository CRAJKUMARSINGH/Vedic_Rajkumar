import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '..');

const OUTPUT_DIR = 'output';

function formatDate(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function sanitizeFolderName(name) {
  return name
    .trim()
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/[^\w\u00C0-\u024F\u1E00-\u1EFF\s-]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 100) || 'Unnamed';
}

function extractClientNameFromSubjectInfo(subjectInfo) {
  const nameEntry = subjectInfo.find(item =>
    /^name$/i.test(item.label.trim()) ||
    /^name\s*\//i.test(item.label.trim()) ||
    item.label.toLowerCase().includes('client') ||
    item.label.includes('नाम')
  );
  if (nameEntry) return sanitizeFolderName(nameEntry.value);
  const fallback = subjectInfo[0]?.value ?? 'Unknown_Client';
  return sanitizeFolderName(fallback);
}

async function ensureDir(dirPath) {
  await mkdir(dirPath, { recursive: true });
}

function toNodeBuffer(data) {
  if (data == null) {
    throw new Error('PDF buffer is null or undefined. jsPDF output returned nothing.');
  }
  if (Buffer.isBuffer(data)) return data;
  if (data instanceof Uint8Array) return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  if (data instanceof ArrayBuffer) return Buffer.from(data);
  if (typeof data === 'string') return Buffer.from(data, 'binary');
  if (Array.isArray(data)) return Buffer.from(data);
  try {
    return Buffer.from(data);
  } catch (e) {
    throw new Error(`Cannot convert PDF output to Buffer. Received type: ${typeof data}, constructor: ${data?.constructor?.name ?? 'unknown'}`);
  }
}

export async function savePDFToLocalFolder({
  pdfBuffer,
  filename,
  subjectInfo,
  clientNameOverride,
  dateOverride,
}) {
  const dateFolder = dateOverride ?? formatDate();
  const clientName = clientNameOverride ?? extractClientNameFromSubjectInfo(subjectInfo ?? []);
  const safeClientName = sanitizeFolderName(clientName);
  const safeDateFolder = sanitizeFolderName(dateFolder);

  const targetDir = resolve(PROJECT_ROOT, OUTPUT_DIR, safeDateFolder, safeClientName);
  await ensureDir(targetDir);

  const safeFilename = filename?.endsWith('.pdf') ? filename : `${filename ?? 'report'}.pdf`;
  const filePath = join(targetDir, safeFilename);

  const nodeBuf = toNodeBuffer(pdfBuffer);
  await writeFile(filePath, nodeBuf);

  const relativePath = join(OUTPUT_DIR, safeDateFolder, safeClientName, safeFilename);

  return {
    absolutePath: filePath,
    relativePath,
    folder: targetDir,
    clientName: safeClientName,
    dateFolder: safeDateFolder,
    filename: safeFilename,
    bytes: nodeBuf.length,
  };
}

export async function saveLocalPDF(config, generateBufferFn) {
  const buffer = generateBufferFn(config);
  return savePDFToLocalFolder({
    pdfBuffer: buffer,
    filename: config.filename,
    subjectInfo: config.subjectInfo,
  });
}

export const LOCAL_PDF_OUTPUT_DIR = resolve(PROJECT_ROOT, OUTPUT_DIR);
export { formatDate, sanitizeFolderName, extractClientNameFromSubjectInfo };
