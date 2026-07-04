/**
 * Integrate SUPPLEMENT feature code into the root Vedic app.
 * Copies Mamosa-Guidev3 deliverables (TS/TSX) and rewrites relative imports to @/ aliases.
 */
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const DELIVERABLES = path.join(PROJECT_ROOT, 'SUPLEMENTS', 'Mamosa-Guidev3', 'deliverables');

/** Source file → destination under src/ */
const FEATURE_MAP: Array<{ src: string; dest: string }> = [
  { src: 'navamsa.ts', dest: 'lib/mtss/navamsa.ts' },
  { src: 'MTSSPanel.tsx', dest: 'components/MTSSPanel.tsx' },
  { src: 'DashboardShell.tsx', dest: 'components/DashboardShell.tsx' },
  { src: 'AshtakavargaPanel.tsx', dest: 'components/AshtakavargaPanel.tsx' },
  { src: 'ashtakavargaService.ts', dest: 'services/classicalAshtakavargaService.ts' },
  { src: 'DashaTimeline.tsx', dest: 'components/supplements/DashaTimeline.tsx' },
  { src: 'ShadbalaPanel.tsx', dest: 'components/supplements/ShadbalaPanel.tsx' },
  { src: 'JaiminiPanel.tsx', dest: 'components/supplements/JaiminiPanel.tsx' },
  { src: 'TransitsPanel.tsx', dest: 'components/supplements/TransitsPanel.tsx' },
  { src: 'YogaInsightsPanel.tsx', dest: 'components/supplements/YogaInsightsPanel.tsx' },
  { src: 'PsychologicalProfilePanel.tsx', dest: 'components/supplements/PsychologicalProfilePanel.tsx' },
  { src: 'CompatibilityPanel.tsx', dest: 'components/supplements/CompatibilityPanel.tsx' },
];

function rewriteImports(content: string, destRel: string): string {
  let out = content
    .replace(/from ['"]\.\.\/services\/ashtakavargaService['"]/g, "from '@/services/classicalAshtakavargaService'")
    .replace(/from ['"]\.\.\/services\/([^'"]+)['"]/g, "from '@/services/$1'")
    .replace(/from ['"]\.\.\/lib\/([^'"]+)['"]/g, "from '@/lib/$1'")
    .replace(/from ['"]\.\.\/data\/([^'"]+)['"]/g, "from '@/data/$1'")
    .replace(/from ['"]\.\/EnhancedBirthInputForm['"]/g, "from '@/components/EnhancedBirthInputForm'");

  if (destRel.endsWith('MTSSPanel.tsx') && !out.includes('export default MTSSPanel')) {
    out = out.trimEnd() + '\n\nexport default MTSSPanel;\n';
  }

  if (destRel.endsWith('AshtakavargaPanel.tsx')) {
    out = out.replace(
      /from ['"]@\/services\/classicalAshtakavargaService['"]/g,
      "from '@/services/classicalAshtakavargaService'",
    );
  }

  return out;
}

async function integrateFeatures(): Promise<void> {
  console.log('Integrating supplement features from Mamosa-Guidev3/deliverables...\n');

  try {
    await fs.access(DELIVERABLES);
  } catch {
    console.error(`Deliverables not found: ${DELIVERABLES}`);
    process.exit(1);
  }

  let copied = 0;
  for (const { src, dest } of FEATURE_MAP) {
    const sourcePath = path.join(DELIVERABLES, src);
    const destPath = path.join(PROJECT_ROOT, 'src', dest);

    try {
      await fs.access(sourcePath);
    } catch {
      console.warn(`  skip (missing): ${src}`);
      continue;
    }

    await fs.mkdir(path.dirname(destPath), { recursive: true });
    const raw = await fs.readFile(sourcePath, 'utf-8');
    const rewritten = rewriteImports(raw, dest);
    await fs.writeFile(destPath, rewritten, 'utf-8');
    console.log(`  integrated: ${src} -> src/${dest}`);
    copied += 1;
  }

  console.log(`\nFeature integration complete. ${copied} file(s) updated.`);
  console.log('\nWired routes (manual — already in App.tsx):');
  console.log('  /dashboard              -> DashboardShell (unified 6-tab engine)');
  console.log('  /classical-ashtakavarga -> AshtakavargaPanel (BAV/SAV/wealth/life-thirds)');
  console.log('  /mtss                   -> MTSSPanel (any birth, dynamic D9)');
  console.log('\nRun: npm run syntax-check');
}

integrateFeatures().catch(err => {
  console.error('Feature integration failed:', err);
  process.exit(1);
});
