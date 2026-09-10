/**
 * matchmakingPdfService.ts
 *
 * Generates a PDF match report for a pair compatibility result.
 * Uses jspdf + jspdf-autotable — same pattern as pdfExportService.ts.
 * No new dependencies required.
 *
 * Pages:
 *   1. Cover — names, score, overall recommendation, date
 *   2. Ashtakuta table — all 8 Koota rows
 *   3. Manglik analysis — male/female status, cross-check
 *   4. Dosha summary — critical issues, optional Kaal Sarp
 *   5. Remedies — combined list
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { EnhancedCompatibilityReport } from './ashtakutaServiceEnhanced';
import type { CompatibilityPdfOptions } from '@/features/matchmaking/types';
import type { DoshaReport } from './doshaCheckerService';
import { 
  sanitizePDFText,
  stripDevanagari,
  embedDevanagariFont 
} from './pdfFontUtils';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sanitiseName(name: string): string {
  return name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').slice(0, 30);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

const RECOMMENDATION_COLORS: Record<string, [number, number, number]> = {
  'Highly Recommended': [34, 197, 94],   // green
  'Proceed with Remedies': [234, 179, 8], // yellow
  'Caution Advised': [249, 115, 22],      // orange
  'Not Recommended': [239, 68, 68],       // red
};

function recommendationColor(rec: string): [number, number, number] {
  return RECOMMENDATION_COLORS[rec] ?? [148, 163, 184];
}

function bilingual(
  en: string,
  hi: string,
  lang: 'en' | 'hi' | 'both',
  hasDevanagariFont: boolean = false,
): string {
  if (lang === 'en') return sanitizePDFText(en, hasDevanagariFont);
  if (lang === 'hi') return hasDevanagariFont ? hi : stripDevanagari(hi);
  return `${sanitizePDFText(en, hasDevanagariFont)}\n${hasDevanagariFont ? hi : stripDevanagari(hi)}`;
}

// ─── Page builders ────────────────────────────────────────────────────────────

function addCoverPage(
  doc: jsPDF,
  result: EnhancedCompatibilityReport,
  options: CompatibilityPdfOptions,
  hasDevanagariFont: boolean = false,
): void {
  const lang = options.language ?? 'en';
  const { ashtakuta, overallRecommendation } = result;

  const name1 = options.person1DisplayName ?? 'Person 1';
  const name2 = options.person2DisplayName ?? 'Person 2';

  // Background header band
  doc.setFillColor(20, 13, 4);
  doc.rect(0, 0, 210, 60, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(251, 191, 36);
  const titleText = lang === 'hi' 
    ? (hasDevanagariFont ? 'कुंडली मिलान रिपोर्ट' : 'Kundli Milan Report')
    : 'Kundli Milan Report';
  doc.text(titleText, 105, 22, { align: 'center' });

  doc.setFontSize(11);
  doc.setTextColor(220, 200, 160);
  doc.text(`${name1}  ♥  ${name2}`, 105, 34, { align: 'center' });

  doc.setFontSize(9);
  doc.setTextColor(160, 140, 100);
  doc.text(`Generated: ${today()}`, 105, 43, { align: 'center' });

  // Score circle (simulated with rect)
  const [r, g, b] = recommendationColor(overallRecommendation);
  doc.setFillColor(r, g, b);
  doc.roundedRect(75, 70, 60, 40, 5, 5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text(`${ashtakuta.totalPoints}/36`, 105, 90, { align: 'center' });

  doc.setFontSize(9);
  doc.text(overallRecommendation, 105, 102, { align: 'center' });

  // Sub-info
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.text(
    bilingual(
      `Overall Compatibility: ${ashtakuta.overallCompatibility}  ·  Score: ${ashtakuta.totalPoints}/36 (${Math.round(ashtakuta.percentage)}%)`,
      `कुल अनुकूलता: ${ashtakuta.overallCompatibility}  ·  अंक: ${ashtakuta.totalPoints}/36`,
      lang,
      hasDevanagariFont,
    ),
    105, 125, { align: 'center' },
  );

  // Footer note
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text(
    'This report is for guidance only. Consult a qualified Jyotishi for important life decisions.',
    105, 285, { align: 'center' },
  );
}

function addAshtakutaTable(
  doc: jsPDF,
  result: EnhancedCompatibilityReport,
  options: CompatibilityPdfOptions,
  hasDevanagariFont: boolean = false,
): void {
  const lang = options.language ?? 'en';
  const { ashtakuta } = result;
  const categories = ashtakuta.categories ?? [];

  doc.addPage();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(20, 13, 4);
  doc.text(
    bilingual('Ashtakuta — 8 Kuta Analysis', 'अष्टकूट — 8 कूट विश्लेषण', lang, hasDevanagariFont),
    14, 20,
  );

  const rows = categories.map((cat: {
    category: string;
    points: number;
    maxPoints: number;
    compatibility: string;
    description?: { en: string; hi: string };
  }) => [
    cat.category,
    `${cat.points}`,
    `${cat.maxPoints}`,
    `${Math.round((cat.points / cat.maxPoints) * 100)}%`,
    cat.compatibility,
  ]);

  // Total row
  rows.push([
    lang === 'hi' ? (hasDevanagariFont ? 'कुल योग' : 'TOTAL') : 'TOTAL',
    `${ashtakuta.totalPoints}`,
    '36',
    `${Math.round(ashtakuta.percentage)}%`,
    ashtakuta.overallCompatibility,
  ]);

  autoTable(doc, {
    startY: 28,
    head: [[
      lang === 'hi' ? (hasDevanagariFont ? 'कूट' : 'Kuta') : 'Kuta',
      lang === 'hi' ? (hasDevanagariFont ? 'अंक' : 'Scored') : 'Scored',
      lang === 'hi' ? (hasDevanagariFont ? 'अधिकतम' : 'Max') : 'Max',
      '%',
      lang === 'hi' ? (hasDevanagariFont ? 'अनुकूलता' : 'Compatibility') : 'Compatibility',
    ]],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: [20, 13, 4], textColor: [251, 191, 36], fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'center' },
    },
    // Highlight total row
    didParseCell: (data) => {
      if (data.row.index === rows.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [251, 191, 36];
        data.cell.styles.textColor = [0, 0, 0];
      }
    },
  });
}

function addManglikSection(
  doc: jsPDF,
  result: EnhancedCompatibilityReport,
  options: CompatibilityPdfOptions,
  hasDevanagariFont: boolean = false,
): void {
  const lang = options.language ?? 'en';
  const { manglikAnalysis } = result;

  if (options.includeManglikSection === false) return;

  doc.addPage();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(20, 13, 4);
  doc.text(bilingual('Manglik Dosha Analysis', 'मांगलिक दोष विश्लेषण', lang, hasDevanagariFont), 14, 20);

  const { maleStatus, femaleStatus, recommendation, remedies } = manglikAnalysis;

  autoTable(doc, {
    startY: 28,
    head: [[
      lang === 'hi' ? (hasDevanagariFont ? 'व्यक्ति' : 'Partner') : 'Partner',
      lang === 'hi' ? (hasDevanagariFont ? 'मांगलिक' : 'Manglik?') : 'Manglik?',
      lang === 'hi' ? (hasDevanagariFont ? 'प्रभावी' : 'Effective?') : 'Effective?',
      lang === 'hi' ? (hasDevanagariFont ? 'तीव्रता' : 'Severity') : 'Severity',
      lang === 'hi' ? (hasDevanagariFont ? 'मंगल भाव' : 'Mars House') : 'Mars House',
    ]],
    body: [
      [
        lang === 'hi' ? (hasDevanagariFont ? 'वर (Male)' : 'Male') : 'Male',
        maleStatus.isManglik ? '⚠ Yes' : '✓ No',
        maleStatus.effectiveManglik ? '⚠ Yes' : '✓ No',
        maleStatus.severity,
        `${maleStatus.marsHouse}`,
      ],
      [
        lang === 'hi' ? (hasDevanagariFont ? 'वधू (Female)' : 'Female') : 'Female',
        femaleStatus.isManglik ? '⚠ Yes' : '✓ No',
        femaleStatus.effectiveManglik ? '⚠ Yes' : '✓ No',
        femaleStatus.severity,
        `${femaleStatus.marsHouse}`,
      ],
    ],
    theme: 'grid',
    headStyles: { fillColor: [20, 13, 4], textColor: [251, 191, 36], fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- jspdf-autotable extends doc
  const finalY: number = (doc as any).lastAutoTable?.finalY ?? 80;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.text(bilingual('Cross-check Result:', 'क्रॉस-चेक परिणाम:', lang, hasDevanagariFont), 14, finalY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const safeRecommendation = hasDevanagariFont ? recommendation : stripDevanagari(recommendation);
  const lines = doc.splitTextToSize(safeRecommendation, 182);
  doc.text(lines, 14, finalY + 18);

  if (remedies.length > 0) {
    let y = finalY + 18 + lines.length * 5 + 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(bilingual('Recommended Remedies:', 'अनुशंसित उपाय:', lang, hasDevanagariFont), 14, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    for (const remedy of remedies) {
      const safeRemedy = hasDevanagariFont ? remedy : stripDevanagari(remedy);
      doc.text(`• ${safeRemedy}`, 16, y);
      y += 6;
    }
  }
}

function addDoshaSection(
  doc: jsPDF,
  result: EnhancedCompatibilityReport,
  options: CompatibilityPdfOptions,
  doshaReport?: DoshaReport,
  hasDevanagariFont: boolean = false,
): void {
  const lang = options.language ?? 'en';
  const { criticalIssues } = result;

  doc.addPage();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(20, 13, 4);
  doc.text(bilingual('Dosha Summary', 'दोष सारांश', lang, hasDevanagariFont), 14, 20);

  let y = 30;

  // Critical issues
  if (criticalIssues.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(220, 50, 50);
    doc.text(bilingual('Critical Issues:', 'गंभीर दोष:', lang, hasDevanagariFont), 14, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    for (const issue of criticalIssues) {
      const safeIssue = hasDevanagariFont ? issue : stripDevanagari(issue);
      doc.text(`⚠  ${safeIssue}`, 16, y);
      y += 6;
    }
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(34, 197, 94);
    doc.text(bilingual('✓ No critical doshas found.', '✓ कोई गंभीर दोष नहीं।', lang, hasDevanagariFont), 14, y);
    y += 8;
  }

  // Kaal Sarp from doshaReport if provided
  if (doshaReport?.kaalSarp?.present) {
    y += 6;
    const ks = doshaReport.kaalSarp;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text(bilingual('Kaal Sarp Yoga:', 'काल सर्प योग:', lang, hasDevanagariFont), 14, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const desc = lang === 'hi' ? ks.description.hi : ks.description.en;
    const safeDesc = hasDevanagariFont ? desc : stripDevanagari(desc);
    const descLines = doc.splitTextToSize(safeDesc, 182);
    doc.text(descLines, 14, y);
    y += descLines.length * 5 + 4;
    doc.text(
      bilingual(`Type: ${ks.type}  ·  Severity: ${ks.severity}`, `प्रकार: ${ks.type}  ·  तीव्रता: ${ks.severity}`, lang, hasDevanagariFont),
      14, y,
    );
  }

  // Overall verdict
  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.text(bilingual('Overall Recommendation:', 'कुल सिफारिश:', lang, hasDevanagariFont), 14, y);
  y += 7;
  const [r, g, b] = recommendationColor(result.overallRecommendation);
  doc.setTextColor(r, g, b);
  doc.setFontSize(12);
  doc.text(result.overallRecommendation, 14, y);
}

function addRemediesSection(
  doc: jsPDF,
  result: EnhancedCompatibilityReport,
  options: CompatibilityPdfOptions,
  doshaReport?: DoshaReport,
  hasDevanagariFont: boolean = false,
): void {
  if (options.includeRemedies === false) return;

  const lang = options.language ?? 'en';

  doc.addPage();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(20, 13, 4);
  doc.text(bilingual('Remedies & Recommendations', 'उपाय और सुझाव', lang, hasDevanagariFont), 14, 20);

  const { ashtakuta, manglikAnalysis } = result;
  const allRemedies: string[] = [];

  // Manglik remedies
  if (manglikAnalysis.remedies.length > 0) {
    const safeRemedies = manglikAnalysis.remedies.map(r => hasDevanagariFont ? r : stripDevanagari(r));
    allRemedies.push(...safeRemedies);
  }

  // Ashtakuta dosha remedies
  if (ashtakuta.dosha?.present && Array.isArray(ashtakuta.dosha.remedies) && ashtakuta.dosha.remedies.length) {
    const safeDoshaRemedies = (ashtakuta.dosha.remedies as string[]).map(r => hasDevanagariFont ? r : stripDevanagari(r));
    allRemedies.push(...safeDoshaRemedies);
  }

  // Kaal Sarp remedies
  if (doshaReport?.kaalSarp?.present) {
    const ksRemedies = lang === 'hi'
      ? doshaReport.kaalSarp.remedies.hi
      : doshaReport.kaalSarp.remedies.en;
    const safeKsRemedies = ksRemedies.map(r => hasDevanagariFont ? r : stripDevanagari(r));
    allRemedies.push(...safeKsRemedies);
  }

  // General ashtakuta recommendations — shape is { en: string[]; hi: string[] }
  const recs = ashtakuta.recommendations;
  if (recs && typeof recs === 'object' && !Array.isArray(recs)) {
    const recList = lang === 'hi'
      ? (recs as { en: string[]; hi: string[] }).hi
      : (recs as { en: string[]; hi: string[] }).en;
    if (Array.isArray(recList)) {
      const safeRecList = recList.map(r => hasDevanagariFont ? r : stripDevanagari(r));
      allRemedies.push(...safeRecList);
    }
  } else if (Array.isArray(recs)) {
    const safeRecs = (recs as string[]).map(r => hasDevanagariFont ? r : stripDevanagari(r));
    allRemedies.push(...safeRecs);
  }

  // De-duplicate
  const unique = [...new Set(allRemedies)];

  let y = 30;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);

  if (unique.length === 0) {
    doc.text(
      bilingual(
        'No specific remedies required. Proceed with an auspicious muhurat.',
        'कोई विशेष उपाय आवश्यक नहीं। शुभ मुहूर्त में आगे बढ़ें।',
        lang,
        hasDevanagariFont,
      ),
      14, y,
    );
    return;
  }

  for (const remedy of unique) {
    if (y > 265) {
      doc.addPage();
      y = 20;
    }
    const lines = doc.splitTextToSize(`• ${remedy}`, 182);
    doc.text(lines, 14, y);
    y += lines.length * 5 + 3;
  }

  // Bilingual divider if 'both' mode
  if (lang === 'both') {
    const hiRemedies: string[] = manglikAnalysis.maleStatus.remedies?.hi ?? [];
    if (hiRemedies.length > 0) {
      y += 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(hasDevanagariFont ? 'हिंदी उपाय:' : 'Hindi Remedies:', 14, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      for (const remedy of hiRemedies) {
        if (y > 265) { doc.addPage(); y = 20; }
        const safeRemedy = hasDevanagariFont ? remedy : stripDevanagari(remedy);
        const lines = doc.splitTextToSize(`• ${safeRemedy}`, 182);
        doc.text(lines, 14, y);
        y += lines.length * 5 + 3;
      }
    }
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate and download a match report PDF.
 *
 * @param result      EnhancedCompatibilityReport from calculateEnhancedAshtakuta
 * @param options     CompatibilityPdfOptions (language, section toggles, name overrides)
 * @param doshaReport Optional DoshaReport for Kaal Sarp data on page 4
 * @param enableDevanagariFont Optional flag to enable Devanagari font support
 */
export async function exportMatchReport(
  result: EnhancedCompatibilityReport,
  options: CompatibilityPdfOptions = {},
  doshaReport?: DoshaReport,
  enableDevanagariFont: boolean = false,
): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Try to embed Devanagari font if enabled
  if (enableDevanagariFont) {
    await embedDevanagariFont(doc);
  }

  const name1 = sanitiseName(options.person1DisplayName ?? 'Person1');
  const name2 = sanitiseName(options.person2DisplayName ?? 'Person2');
  const filename = `MatchReport_${name1}_${name2}_${today()}.pdf`;

  // Build all pages
  addCoverPage(doc, result, options, enableDevanagariFont);

  if (options.includeAshtakutaDetail !== false) {
    addAshtakutaTable(doc, result, options, enableDevanagariFont);
  }

  if (options.includeManglikSection !== false) {
    addManglikSection(doc, result, options, enableDevanagariFont);
  }

  addDoshaSection(doc, result, options, doshaReport, enableDevanagariFont);
  addRemediesSection(doc, result, options, doshaReport, enableDevanagariFont);

  doc.save(filename);
}
