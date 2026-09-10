/**
 * dashaTransitPdfService.ts
 *
 * Week 9: Professional PDF export for the Dasha + Transit Correlation result.
 *
 * Architecture:
 *   buildPdfContent()        — pure function; converts result → structured content.
 *                              Fully testable without jsPDF / browser.
 *   exportDashaTransitPdf()  — calls buildPdfContent, then renders via jsPDF
 *                              and triggers a browser download.
 *
 * Usage:
 *   const content = buildPdfContent(result, { lang: 'en', nativeName: 'Rajkumar' });
 *   exportDashaTransitPdf(result, { lang: 'en', nativeName: 'Rajkumar' });
 */

import type { DashaTransitCorrelationResult, ActivationLevel } from './dashaTransitCorrelationService';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PdfOptions {
  /** Output language. Default: 'en' */
  lang?: 'en' | 'hi';
  /** Name of the native (person whose chart this is). Used in title. */
  nativeName?: string;
}

export type PdfSection =
  | { type: 'heading';  text: string }
  | { type: 'text';     text: string }
  | { type: 'divider' }
  | { type: 'kv';       rows: Array<{ label: string; value: string }> }
  | { type: 'table';    headers: string[]; rows: string[][] }
  | { type: 'score';    score: number; level: ActivationLevel; label: string }
  | { type: 'outlook';  items: Array<{ month: string; level: ActivationLevel; score: number; mahaLord: string; antarLord: string }> };

export interface PdfContent {
  title: string;
  subtitle: string;
  metadata: {
    nativeName: string;
    targetDate: string;
    moonSign: string;
    generatedAt: string;
  };
  sections: PdfSection[];
}

// ─── Planet symbols ───────────────────────────────────────────────────────────

const PLANET_SYMBOL: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿', Jupiter: '♃',
  Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋',
};

const PLANET_HI: Record<string, string> = {
  Sun: 'सूर्य', Moon: 'चंद्र', Mars: 'मंगल', Mercury: 'बुध',
  Jupiter: 'गुरु', Venus: 'शुक्र', Saturn: 'शनि', Rahu: 'राहु', Ketu: 'केतु',
};

const LEVEL_LABEL: Record<ActivationLevel, { en: string; hi: string }> = {
  High:   { en: 'High Activation',   hi: 'उच्च सक्रियता' },
  Medium: { en: 'Medium Activation', hi: 'मध्यम सक्रियता' },
  Low:    { en: 'Low Activation',    hi: 'निम्न सक्रियता' },
};

// ─── buildPdfContent — pure function ─────────────────────────────────────────

/**
 * Convert a DashaTransitCorrelationResult into a structured PdfContent object.
 *
 * This is a pure function — no side effects, no jsPDF, fully unit-testable.
 */
export function buildPdfContent(
  result: DashaTransitCorrelationResult,
  options: PdfOptions = {},
): PdfContent {
  const lang  = options.lang ?? 'en';
  const isHi  = lang === 'hi';
  const name  = options.nativeName ?? 'Native';

  const pName = (p: string) =>
    isHi ? (PLANET_HI[p] ?? p) : p;
  const sym = (p: string) => PLANET_SYMBOL[p] ?? '';

  // ── Metadata ────────────────────────────────────────────────────────────────
  const title = isHi
    ? `दशा–गोचर संगम विश्लेषण — ${name}`
    : `Dasha–Transit Correlation — ${name}`;

  const subtitle = isHi
    ? 'रमण सिद्धांत • वैदिक ज्योतिष'
    : 'B.V. Raman Principle • Vedic Astrology';

  const generatedAt = new Date().toLocaleString(isHi ? 'hi-IN' : 'en-IN', {
    dateStyle: 'long', timeStyle: 'short',
  });

  const sections: PdfSection[] = [];

  // ── Section 1: Active Dasha ─────────────────────────────────────────────────
  sections.push({
    type: 'heading',
    text: isHi ? '१. वर्तमान दशा काल' : '1. Active Dasha Period',
  });

  sections.push({
    type: 'kv',
    rows: [
      {
        label: isHi ? 'महादशा' : 'Mahadasha',
        value: `${sym(result.activeDasha.mahaLord)} ${pName(result.activeDasha.mahaLord)}  (${result.activeDasha.mahaStart} → ${result.activeDasha.mahaEnd})`,
      },
      {
        label: isHi ? 'अंतर्दशा' : 'Antardasha',
        value: `${sym(result.activeDasha.antarLord)} ${pName(result.activeDasha.antarLord)}  (${result.activeDasha.antarStart} → ${result.activeDasha.antarEnd})`,
      },
      // Week 07 AC-6: Pratyantar Dasha row
      {
        label: isHi ? 'प्रत्यंतर दशा' : 'Pratyantar Dasha',
        value: `${sym(result.activeDasha.pratyanLord)} ${pName(result.activeDasha.pratyanLord)}  (${result.activeDasha.pratyanStart} → ${result.activeDasha.pratyanEnd})`,
      },
      {
        label: isHi ? 'जन्म नक्षत्र' : 'Birth Nakshatra',
        value: result.activeDasha.moonNakshatra,
      },
      {
        label: isHi ? 'चंद्र राशि' : 'Moon Sign',
        value: result.moonSign,
      },
    ],
  });

  sections.push({ type: 'divider' });

  // Week 07 AC-6: Chandrashtama warning in PDF
  if (result.isChandrashtama) {
    sections.push({
      type: 'text',
      text: isHi
        ? '⚠️ चंद्राष्टम: आज चंद्रमा जन्म राशि से 8वें भाव में है। महत्वपूर्ण निर्णय, यात्रा, और वित्तीय लेन-देन से बचें।'
        : '⚠️ CHANDRASHTAMA: Transiting Moon is in 8th from natal Moon. Avoid important decisions, travel, and financial transactions today.',
    });
    sections.push({ type: 'divider' });
  }

  // ── Section 2: Correlation Score ────────────────────────────────────────────
  sections.push({
    type: 'heading',
    text: isHi ? '२. दशा–गोचर सक्रियता स्कोर' : '2. Dasha–Gochar Activation Score',
  });

  sections.push({
    type: 'score',
    score:  result.correlation.score,
    level:  result.correlation.activationLevel,
    label:  LEVEL_LABEL[result.correlation.activationLevel][lang],
  });

  sections.push({
    type: 'text',
    text: isHi ? result.correlation.prediction.hi : result.correlation.prediction.en,
  });

  sections.push({
    type: 'text',
    text: `${isHi ? '⏱ समय: ' : '⏱ Timing: '}${isHi ? result.correlation.timing.hi : result.correlation.timing.en}`,
  });

  const keyEvents = isHi ? result.correlation.keyEvents.hi : result.correlation.keyEvents.en;
  if (keyEvents.length > 0) {
    sections.push({
      type: 'text',
      text: `${isHi ? 'प्रमुख घटनाएं: ' : 'Key Events: '}${keyEvents.join(' • ')}`,
    });
  }

  sections.push({ type: 'divider' });

  // ── Section 3: Transit Positions ────────────────────────────────────────────
  sections.push({
    type: 'heading',
    text: isHi
      ? `३. गोचर ग्रह स्थिति (${result.targetDate})`
      : `3. Transit Planetary Positions (${result.targetDate})`,
  });

  sections.push({
    type: 'table',
    headers: isHi
      ? ['ग्रह', 'राशि', 'चंद्र से भाव', 'नक्षत्र', 'SAV', 'अनुकूल']
      : ['Planet', 'Sign', 'House from ☽', 'Nakshatra', 'SAV', 'Favorable'],
    rows: result.transitPositions.map((tp) => [
      `${sym(tp.planet)} ${pName(tp.planet)}`,
      tp.sign,
      String(tp.houseFromMoon),
      tp.nakshatra,
      // Week 07 AC-6: SAV score column in PDF
      `${tp.savScore} / ${tp.savStrength}`,
      tp.isFavorable ? (isHi ? '✓ हाँ' : '✓ Yes') : (isHi ? '— नहीं' : '— No'),
    ]),
  });

  sections.push({
    type: 'text',
    text: isHi
      ? '* भाव जन्म चंद्र राशि से गिने गए हैं। ✓ = शास्त्रीय अनुकूल भाव। SAV = सार्वाष्टकवर्ग (Strong ≥28, Weak <25)।'
      : '* Houses counted from natal Moon sign. ✓ = classically favorable. SAV = Sarvashtakavarga (Strong ≥28, Weak <25).',
  });

  sections.push({ type: 'divider' });

  // ── Section 4: Ashtakavarga Summary (Week 07 AC-6) ──────────────────────────
  sections.push({
    type: 'heading',
    text: isHi ? '४. अष्टकवर्ग गोचर शक्ति' : '4. Ashtakavarga Transit Strength',
  });

  sections.push({
    type: 'kv',
    rows: [
      {
        label: isHi ? 'समग्र शक्ति' : 'Overall Strength',
        value: result.ashtakavargaSummary.overallStrength,
      },
      {
        label: isHi ? 'औसत SAV स्कोर' : 'Average SAV Score',
        value: result.ashtakavargaSummary.averageScore.toFixed(1),
      },
      {
        label: isHi ? 'अनुकूल ग्रह (SAV ≥28)' : 'Favorable Transits (SAV ≥28)',
        value: String(result.ashtakavargaSummary.favorableTransits),
      },
      {
        label: isHi ? 'प्रतिकूल ग्रह (SAV <25)' : 'Unfavorable Transits (SAV <25)',
        value: String(result.ashtakavargaSummary.unfavorableTransits),
      },
    ],
  });

  sections.push({ type: 'divider' });

  // ── Section 5: 12-Month Outlook ─────────────────────────────────────────────
  sections.push({
    type: 'heading',
    text: isHi ? '५. 12-मास दृष्टिकोण' : '5. 12-Month Outlook',
  });

  sections.push({
    type: 'outlook',
    items: result.monthlyOutlook.map((m) => ({
      month:     m.month,
      level:     m.activationLevel,
      score:     m.score,
      mahaLord:  m.mahaLord,
      antarLord: m.antarLord,
    })),
  });

  sections.push({ type: 'divider' });

  // ── Disclaimer ───────────────────────────────────────────────────────────────
  sections.push({
    type: 'text',
    text: isHi
      ? '⚠️ यह विश्लेषण वैदिक ज्योतिष के सिद्धांतों पर आधारित है। यह चिकित्सीय, कानूनी या वित्तीय परामर्श का विकल्प नहीं है।'
      : '⚠️ This analysis is based on Vedic astrology principles. It is not a substitute for medical, legal, or financial advice.',
  });

  return {
    title,
    subtitle,
    metadata: {
      nativeName: name,
      targetDate: result.targetDate,
      moonSign:   result.moonSign,
      generatedAt,
    },
    sections,
  };
}

// ─── exportDashaTransitPdf — browser side-effect ─────────────────────────────

/**
 * Generate and download a PDF for a Dasha+Transit correlation result.
 * Uses jsPDF — must be called in a browser context.
 *
 * @param result   The full DashaTransitCorrelationResult from computeCorrelation()
 * @param options  { lang, nativeName }
 */
export async function exportDashaTransitPdf(
  result: DashaTransitCorrelationResult,
  options: PdfOptions = {},
): Promise<void> {
  const lang = options.lang ?? 'en';
  const isHi = lang === 'hi';

  // Dynamic import — keeps jsPDF out of the main bundle until needed
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const content = buildPdfContent(result, options);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const PW   = doc.internal.pageSize.getWidth();
  const PH   = doc.internal.pageSize.getHeight();
  const ML   = 18; // margin left
  const MR   = 18; // margin right
  const TW   = PW - ML - MR; // text width

  let y = 20;

  // ── Helper: new page if needed ────────────────────────────────────────────
  function checkPage(needed = 12): void {
    if (y + needed > PH - 15) {
      doc.addPage();
      y = 20;
    }
  }

  // ── Cover: Title ─────────────────────────────────────────────────────────
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229); // violet-600
  const titleLines = doc.splitTextToSize(content.title, TW);
  doc.text(titleLines, PW / 2, y, { align: 'center' });
  y += 6 * titleLines.length + 3;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(content.subtitle, PW / 2, y, { align: 'center' });
  y += 5;

  // Metadata bar
  doc.setFontSize(8);
  doc.text(
    `${isHi ? 'लक्ष्य तिथि' : 'Target date'}: ${content.metadata.targetDate}  |  ☽ ${content.metadata.moonSign}  |  ${isHi ? 'रिपोर्ट' : 'Generated'}: ${content.metadata.generatedAt}`,
    PW / 2, y, { align: 'center' },
  );
  y += 5;

  // Horizontal rule
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(ML, y, PW - MR, y);
  y += 6;

  doc.setTextColor(0, 0, 0);

  // ── Render sections ───────────────────────────────────────────────────────
  for (const section of content.sections) {
    switch (section.type) {
      case 'heading': {
        checkPage(14);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(55, 48, 163);
        doc.text(section.text, ML, y);
        y += 7;
        doc.setTextColor(0, 0, 0);
        break;
      }

      case 'text': {
        const lines = doc.splitTextToSize(section.text, TW);
        checkPage(lines.length * 5 + 2);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(40, 40, 40);
        doc.text(lines, ML, y);
        y += lines.length * 5 + 2;
        doc.setTextColor(0, 0, 0);
        break;
      }

      case 'divider': {
        checkPage(5);
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.2);
        doc.line(ML, y, PW - MR, y);
        y += 4;
        break;
      }

      case 'kv': {
        const rows = section.rows.map((r) => [r.label, r.value]);
        checkPage(rows.length * 8 + 4);
        autoTable(doc, {
          body: rows,
          startY: y,
          theme: 'plain',
          styles: { fontSize: 9, cellPadding: 2 },
          columnStyles: {
            0: { cellWidth: 45, fontStyle: 'bold', textColor: [79, 70, 229] },
            1: { cellWidth: TW - 45 },
          },
          margin: { left: ML, right: MR },
        });
        y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;
        break;
      }

      case 'score': {
        checkPage(20);
        // Score box
        const boxH = 14;
        const colour = section.level === 'High'   ? ([22, 163, 74] as [number, number, number])
          : section.level === 'Medium' ? ([217, 119, 6] as [number, number, number])
          : ([220, 38, 38] as [number, number, number]);

        doc.setFillColor(colour[0], colour[1], colour[2]);
        doc.roundedRect(ML, y, TW, boxH, 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`${section.score}/100 — ${section.label}`, PW / 2, y + 9, { align: 'center' });
        doc.setTextColor(0, 0, 0);
        y += boxH + 4;
        break;
      }

      case 'table': {
        checkPage(section.rows.length * 7 + 12);
        autoTable(doc, {
          head: [section.headers],
          body: section.rows,
          startY: y,
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [245, 245, 255] },
          margin: { left: ML, right: MR },
        });
        y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;
        break;
      }

      case 'outlook': {
        checkPage(40);
        const outHeaders = isHi
          ? [['माह', 'स्तर', 'स्कोर', 'महादशा', 'अंतर्दशा']]
          : [['Month', 'Level', 'Score', 'Mahadasha', 'Antardasha']];
        const outBody = section.items.map((i) => [
          i.month,
          i.level,
          String(i.score),
          i.mahaLord,
          i.antarLord,
        ]);
        autoTable(doc, {
          head: outHeaders,
          body: outBody,
          startY: y,
          theme: 'grid',
          styles: { fontSize: 7.5, cellPadding: 1.8 },
          headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
          columnStyles: {
            0: { cellWidth: 30 },
            1: { cellWidth: 28 },
            2: { cellWidth: 18, halign: 'center' },
            3: { cellWidth: 28 },
            4: { cellWidth: 28 },
          },
          didParseCell(info) {
            if (info.column.index === 1 && info.section === 'body') {
              const lvl = info.cell.text[0] as ActivationLevel;
              if (lvl === 'High')   info.cell.styles.textColor = [22, 163, 74];
              else if (lvl === 'Medium') info.cell.styles.textColor = [217, 119, 6];
              else info.cell.styles.textColor = [220, 38, 38];
              info.cell.styles.fontStyle = 'bold';
            }
          },
          margin: { left: ML, right: MR },
        });
        y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;
        break;
      }
    }
  }

  // ── Page footer on every page ─────────────────────────────────────────────
  const totalPages = (doc as unknown as { internal: { getNumberOfPages: () => number } })
    .internal.getNumberOfPages();

  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `${isHi ? 'वैदिक राजकुमार' : 'Vedic Rajkumar'} • ${isHi ? 'पृष्ठ' : 'Page'} ${p}/${totalPages}`,
      PW / 2, PH - 8, { align: 'center' },
    );
  }

  // ── Save ─────────────────────────────────────────────────────────────────
  const safeName = (options.nativeName ?? 'Report').replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '_');
  doc.save(`DashaTransit_${safeName}_${result.targetDate}.pdf`);
}
