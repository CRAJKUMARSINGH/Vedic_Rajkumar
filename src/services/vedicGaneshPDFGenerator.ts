import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Vedic Ganesh PDF Generator — PREMIUM ESSENTIAL TEMPLATE
 * =========================================================
 * Features:
 *  • Colourful Lord Ganesha header (generated geometrically — no images needed)
 *  • Saffron / Marigold / Gold colour palette
 *  • Decorative 4-corner page borders with Kalash & Om motif corners
 *  • Central page watermark: ॐ + Swastika + Trishul patterns
 *  • Reusable section system for future reports (all tasks)
 *  • autoTable integration for professional muhurat tables
 *
 * For:  PRIYANSH_JOINING_MUHURAT report + all future Vedic reports.
 */

export interface PDFSection {
  title: string;
  titleHi?: string;
  body: (string | string[])[];
  accentColor?: [number, number, number];
  icon?: string;
}

export interface PDFTable {
  title: string;
  titleHi?: string;
  headers: string[];
  rows: (string | number)[][];
  accentColor?: [number, number, number];
  columnWidths?: Record<number, number | 'auto' | 'wrap'>;
}

export interface GaneshPDFConfig {
  reportTitle: string;
  reportTitleHi?: string;
  subtitle: string;
  subtitleHi?: string;
  subjectInfo: { label: string; value: string }[];
  sections: PDFSection[];
  tables?: PDFTable[];
  footerBlessing?: string;
  filename: string;
  theme?: 'classic' | 'premium' | 'royal' | 'magenta';
}

const THEME_PALETTE: Record<
  Exclude<GaneshPDFConfig['theme'], undefined>,
  { outer: [number,number,number]; inner: [number,number,number]; accent: [number,number,number]; banner: [number,number,number]; gold: [number,number,number]; softFill: [number,number,number]; labelText: [number,number,number]; lineTint: [number,number,number] }
> = {
  classic: { outer: [153,27,27], inner: [251,191,36], accent: [234,88,12], banner: [153,27,27], gold: [251,191,36], softFill: [255,249,219], labelText: [120,53,15], lineTint: [220,160,80] },
  premium: { outer: [120,53,15], inner: [250,204,21], accent: [217,119,6], banner: [120,53,15], gold: [250,204,21], softFill: [255,249,219], labelText: [120,53,15], lineTint: [220,160,80] },
  royal:   { outer: [146,64,14], inner: [251,191,36], accent: [154,52,18], banner: [146,64,14], gold: [251,191,36], softFill: [255,249,219], labelText: [120,53,15], lineTint: [220,160,80] },
  magenta: { outer: [157,23,77], inner: [244,114,182], accent: [236,72,153], banner: [157,23,77], gold: [251,207,232], softFill: [253,232,242], labelText: [157,23,77], lineTint: [234,128,180] },
};
const palette = (theme: GaneshPDFConfig['theme']) => THEME_PALETTE[(theme ?? 'premium') as keyof typeof THEME_PALETTE];

// ────────────────────────────────────────────────────────────────────────
// 1. PAGE BORDER — Kalash + Om motif corners
// ────────────────────────────────────────────────────────────────────────
function drawDecorativeBorder(doc: jsPDF, pageW: number, pageH: number, theme: 'classic' | 'premium' | 'royal' | 'magenta' = 'premium'): void {
  const outer = 6;
  const inner = 11;
  const colors = {
    classic:  { outer: [153, 27, 27], inner: [251, 191, 36], accent: [234, 88, 12] },
    premium:  { outer: [120, 53, 15],  inner: [250, 204, 21], accent: [217, 119, 6] },
    royal:    { outer: [146, 64, 14],  inner: [251, 191, 36], accent: [154, 52, 18] },
    magenta:  { outer: [157, 23, 77],  inner: [244, 114, 182], accent: [236, 72, 153] },
  }[theme];

  // Outer double border
  doc.setDrawColor(colors.outer[0], colors.outer[1], colors.outer[2]);
  doc.setLineWidth(0.9);
  doc.rect(outer, outer, pageW - outer * 2, pageH - outer * 2);

  doc.setDrawColor(colors.inner[0], colors.inner[1], colors.inner[2]);
  doc.setLineWidth(0.4);
  doc.rect(inner, inner, pageW - inner * 2, pageH - inner * 2);

  // Corner connectors (double-line corners -> accent)
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setLineWidth(0.6);
  const c = 17;
  const corners: Array<[number, number, number, number, number, number, number, number]> = [
    // TL
    [inner, inner, inner + c, inner, inner, inner, inner, inner + c],
    // TR
    [pageW - inner - c, inner, pageW - inner, inner, pageW - inner, inner, pageW - inner, inner + c],
    // BL
    [inner, pageH - inner, inner + c, pageH - inner, inner, pageH - inner - c, inner, pageH - inner],
    // BR
    [pageW - inner - c, pageH - inner, pageW - inner, pageH - inner, pageW - inner, pageH - inner - c, pageW - inner, pageH - inner],
  ];
  corners.forEach(([x1, y1, x2, y2, x3, y3, x4, y4]) => {
    doc.line(x1, y1, x2, y2);
    doc.line(x3, y3, x4, y4);
  });

  // ── 4 CORNER MOTIFS ──────────────────────────────────────────────
  drawOmMotif(doc, inner + 4, inner + 4, colors);                 // TL
  drawSwastika(doc, pageW - inner - 12, inner + 4, colors);       // TR
  drawKalash(doc, inner + 4, pageH - inner - 14, colors);         // BL
  drawTrishul(doc, pageW - inner - 12, pageH - inner - 14, colors); // BR

  // Vertical side motifs — lotus dots pattern along inner border
  doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  for (let y = inner + 30; y < pageH - inner - 30; y += 18) {
    doc.circle(inner + 2.5, y, 1.1, 'F');
    doc.circle(pageW - inner - 2.5, y, 1.1, 'F');
  }

  // Top & bottom marigold dot band
  for (let x = inner + 30; x < pageW - inner - 30; x += 10) {
    doc.setFillColor(colors.inner[0], colors.inner[1], colors.inner[2]);
    doc.circle(x, inner + 2.5, 1.0, 'F');
    doc.circle(x, pageH - inner - 2.5, 1.0, 'F');
  }
}

// ॐ Motif (geometric — no fonts needed)
function drawOmMotif(doc: jsPDF, x: number, y: number, colors: { outer: number[]; inner: number[]; accent: number[] }): void {
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setFillColor(colors.inner[0], colors.inner[1], colors.inner[2]);
  doc.setLineWidth(0.6);
  doc.ellipse(x + 4, y + 4, 4, 5, 'FD');
  doc.setDrawColor(colors.outer[0], colors.outer[1], colors.outer[2]);
  doc.ellipse(x + 4, y + 4, 3, 4);
  doc.setFillColor(colors.outer[0], colors.outer[1], colors.outer[2]);
  doc.circle(x + 7, y + 1.5, 0.8, 'F');                  // bindi top
}

// Swastika motif
function drawSwastika(doc: jsPDF, x: number, y: number, colors: { outer: number[]; inner: number[]; accent: number[] }): void {
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setFillColor(colors.inner[0], colors.inner[1], colors.inner[2]);
  doc.setLineWidth(0.7);
  doc.rect(x, y, 8, 8, 'FD');
  doc.setDrawColor(colors.outer[0], colors.outer[1], colors.outer[2]);
  doc.setLineWidth(0.8);
  doc.line(x + 4, y + 1, x + 4, y + 7);  // vertical
  doc.line(x + 1, y + 4, x + 7, y + 4);  // horizontal
  doc.line(x + 4, y + 1, x + 6, y + 1);  // top right arm
  doc.line(x + 4, y + 7, x + 2, y + 7);  // bottom left arm
  doc.line(x + 1, y + 4, x + 1, y + 2);  // top left arm
  doc.line(x + 7, y + 4, x + 7, y + 6);  // bottom right arm
}

// Kalash (sacred pot motif — triangle+ pot on top
function drawKalash(doc: jsPDF, x: number, y: number, colors: { outer: number[]; inner: number[]; accent: number[] }): void {
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setFillColor(colors.inner[0], colors.inner[1], colors.inner[2]);
  doc.setLineWidth(0.6);
  doc.ellipse(x + 4, y + 9, 4, 3, 'FD'); // pot body
  doc.rect(x + 2.5, y + 11, 3, 1.5, 'FD');           // base
  doc.setDrawColor(colors.outer[0], colors.outer[1], colors.outer[2]);
  doc.triangle(x + 2, y + 4, x + 6, y + 4, x + 4, y); // coconut top
  doc.line(x + 4, y, x + 4, y - 2);                        // flag stick
}

// Trishul (trident motif
function drawTrishul(doc: jsPDF, x: number, y: number, colors: { outer: number[]; inner: number[]; accent: number[] }): void {
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setLineWidth(0.8);
  doc.line(x + 4, y + 2, x + 4, y + 14);          // staff
  doc.line(x + 1, y + 4, x + 1, y + 2);              // left prong
  doc.line(x + 4, y + 2, x + 7, y + 2);            // top center
  doc.line(x + 7, y + 2, x + 7, y + 4);              // right prong
  doc.setFillColor(colors.outer[0], colors.outer[1], colors.outer[2]);
  doc.circle(x + 4, y + 7, 0.8, 'F');                // damru
}

// ────────────────────────────────────────────────────────────────────────
// 2. GANESHA HEADER (vector Ganesha — geometric)
// ────────────────────────────────────────────────────────────────────────
function drawGaneshHeader(doc: jsPDF, pageW: number, theme: 'classic' | 'premium' | 'royal' | 'magenta'): number {
  const colors = {
    classic: { banner: [153, 27, 27], gold: [251, 191, 36], skin: [249, 115, 22] },
    premium: { banner: [120, 53, 15], gold: [250, 204, 21], skin: [251, 146, 60] },
    royal:   { banner: [146, 64, 14], gold: [251, 191, 36], skin: [234, 88, 12] },
    magenta: { banner: [157, 23, 77], gold: [244, 114, 182], skin: [251, 207, 232] },
  }[theme];

  // ── Saffron gradient banner (2 rectangles)
  doc.setFillColor(colors.banner[0], colors.banner[1], colors.banner[2]);
  doc.rect(0, 0, pageW, 46, 'F');
  doc.setFillColor(colors.gold[0], colors.gold[1], colors.gold[2]);
  doc.rect(0, 44, pageW, 2.5, 'F');
  doc.setFillColor(colors.skin[0], colors.skin[1], colors.skin[2]);
  doc.rect(0, 46.5, pageW, 1, 'F');

  // ── GANESH (centered at x = pageW/2, y range 1..44
  const gx = pageW / 2;
  const gy = 24;

  // Crown / Halo (golden circle behind Ganesha)
  doc.setDrawColor(colors.gold[0], colors.gold[1], colors.gold[2]);
  doc.setFillColor(255, 251, 235);
  doc.setLineWidth(1.2);
  doc.ellipse(gx, gy + 2, 20, 18, 'FD');
  // 8-point star (sun rays around halo points
  doc.setDrawColor(colors.gold[0], colors.gold[1], colors.gold[2]);
  for (let i = 0; i < 12; i++) {
    const ang = (i / 12) * 360;
    const r1 = 18;
    const rad = (ang * Math.PI) / 180;
    const x1 = gx + Math.cos(rad) * (r1 - 2);
    const y1 = gy + 2 + Math.sin(rad) * (r1 - 2);
    const x2 = gx + Math.cos(rad) * (r1 + 1.2);
    const y2 = gy + 2 + Math.sin(rad) * (r1 + 1.2);
    doc.setLineWidth(0.5);
    doc.line(x1, y1, x2, y2);
  }

  // Crown top — golden mukut
  doc.setFillColor(colors.gold[0], colors.gold[1], colors.gold[2]);
  doc.setDrawColor(colors.banner[0], colors.banner[1], colors.banner[2]);
  doc.setLineWidth(0.4);
  doc.triangle(gx - 7, gy - 13, gx + 7, gy - 13, gx, gy - 22);
  doc.rect(gx - 8, gy - 14, 16, 2, 'FD');
  // Crown gem
  doc.setFillColor(220, 38, 38);
  doc.circle(gx, gy - 17, 1.1, 'F');

  // Ganesha Ears (big fan ears)
  doc.setFillColor(252, 211, 153);
  doc.setDrawColor(colors.banner[0], colors.banner[1], colors.banner[2]);
  doc.setLineWidth(0.4);
  doc.ellipse(gx - 13, gy - 2, 6.5, 4.5, 'FD');
  doc.ellipse(gx + 13, gy - 2, 6.5, 4.5, 'FD');
  // Inner ear
  doc.setFillColor(colors.skin[0], colors.skin[1], colors.skin[2]);
  doc.ellipse(gx - 13, gy - 2, 4.2, 2.5, 'F');
  doc.ellipse(gx + 13, gy - 2, 4.2, 2.5, 'F');

  // Ganesha Face / head
  doc.setFillColor(253, 230, 138);
  doc.setDrawColor(colors.banner[0], colors.banner[1], colors.banner[2]);
  doc.setLineWidth(0.5);
  doc.ellipse(gx, gy, 12, 13, 'FD');

  // Elephant trunk
  doc.setFillColor(253, 230, 138);
  doc.ellipse(gx, gy + 7, 3.8, 6.5, 'FD');
  // trunk curve
  doc.setDrawColor(colors.banner[0], colors.banner[1], colors.banner[2]);
  doc.setLineWidth(0.4);
  doc.ellipse(gx, gy + 10.5, 1.4, 1.1, 'FD'); // trunk tip curl

  // Eyes (closed meditating)
  doc.setLineWidth(0.6);
  doc.setDrawColor(colors.banner[0], colors.banner[1], colors.banner[2]);
  doc.line(gx - 6, gy - 3, gx - 2, gy - 2);   // left eye curve
  doc.line(gx + 2, gy - 3, gx + 6, gy - 2);   // right eye curve
  // Tilak on forehead (tripund)
  doc.setFillColor(220, 38, 38);
  doc.triangle(gx - 1.8, gy - 11, gx + 1.8, gy - 11, gx, gy - 7.5);
  // Third eye dot
  doc.setFillColor(colors.gold[0], colors.gold[1], colors.gold[2]);
  doc.circle(gx, gy - 9, 0.8, 'F');

  // Tusks
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(colors.banner[0], colors.banner[1], colors.banner[2]);
  // left tusk (whole)
  doc.triangle(gx - 3, gy + 4, gx - 1, gy + 4, gx - 1, gy + 9);
  // right tusk (broken — classic Ganesha style)
  doc.triangle(gx + 3, gy + 4, gx + 1, gy + 4, gx + 1, gy + 7.2);

  // Vakratunda — curved mouth smile (3-segment arc approx)
  doc.setDrawColor(colors.banner[0], colors.banner[1], colors.banner[2]);
  doc.setLineWidth(0.4);
  doc.moveTo(gx - 2.2, gy + 4.5);
  doc.curveTo(gx - 1.5, gy + 5.6, gx + 1.5, gy + 5.6, gx + 2.2, gy + 4.5);

  // Modak (sweet) in hand — bottom right near trunk
  doc.setFillColor(251, 191, 36);
  doc.setDrawColor(colors.banner[0], colors.banner[1], colors.banner[2]);
  doc.ellipse(gx + 7.5, gy + 12, 2.2, 2.5, 'FD');
  doc.setFillColor(153, 27, 27);
  doc.circle(gx + 7.5, gy + 10.2, 0.6, 'F');

  // Banner text — Ganesh Invocation
  doc.setTextColor(255, 248, 220);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('॥ ॐ श्री गणेशाय नमः ॥', gx, 3, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('॥ Vakratunda Mahakaya Suryakoti Samaprabha ॥', gx, 48, { align: 'center' });

  return 50;  // return next content start y after ganesha header
}

// ────────────────────────────────────────────────────────────────────────
// 3. SECTION RENDERERS — title bar + bullet content
// ────────────────────────────────────────────────────────────────────────
function renderSection(
  doc: jsPDF,
  section: PDFSection,
  x: number,
  y: number,
  maxW: number,
  pageW: number,
  pageH: number
): { y: number } {
  const theme = (section as any)._themeOverride ?? 'premium';
  const pal = palette(theme);
  const accent: [number, number, number] = section.accentColor ?? pal.outer;
  const LINE_H = 5.0;
  const SAFETY = 55;

  const needNewPageForTitle = (): boolean => {
    const titleHeight = 8 + 3 + 15;
    return y + titleHeight > pageH - SAFETY;
  };
  if (needNewPageForTitle()) {
    doc.addPage();
    drawDecorativeBorder(doc, pageW, pageH, theme as any);
    drawWatermark(doc, pageW, pageH, theme as any);
    y = 15;
  }

  doc.setFillColor(accent[0], accent[1], accent[2]);
  doc.roundedRect(x, y, maxW, 8, 1.5, 1.5, 'F');
  doc.setFillColor(pal.gold[0], pal.gold[1], pal.gold[2]);
  doc.roundedRect(x, y, 3, 8, 1.5, 0, 'F');

  doc.setTextColor(255, 248, 220);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  const icon = section.icon ? `${section.icon}  ` : '';
  doc.text(icon + section.title, x + 5, y + 5.5);

  if (section.titleHi) {
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(254, 243, 199);
    doc.text(section.titleHi, pageW / 2, y + 5.5, { align: 'center' });
  }

  y += 12;

  doc.setTextColor(24, 24, 27);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  for (const block of section.body) {
    if (y > pageH - SAFETY) {
      doc.addPage();
      drawDecorativeBorder(doc, pageW, pageH, theme as any);
      drawWatermark(doc, pageW, pageH, theme as any);
      y = 15;
    }
    if (Array.isArray(block)) {
      for (const item of block) {
        const split = doc.splitTextToSize(item, maxW - 6);
        const needed = split.length * LINE_H + 2;
        if (y + needed > pageH - SAFETY) {
          doc.addPage();
          drawDecorativeBorder(doc, pageW, pageH, theme as any);
          drawWatermark(doc, pageW, pageH, theme as any);
          y = 15;
        }
        doc.setFillColor(accent[0], accent[1], accent[2]);
        doc.circle(x + 2.2, y - 1.6, 0.8, 'F');
        doc.setTextColor(24, 24, 27);
        doc.text(split, x + 5, y);
        y += split.length * LINE_H + 1;
      }
      y += 1.5;
    } else {
      const split = doc.splitTextToSize(block, maxW);
      const needed = split.length * LINE_H + 2;
      if (y + needed > pageH - SAFETY) {
        doc.addPage();
        drawDecorativeBorder(doc, pageW, pageH, theme as any);
        drawWatermark(doc, pageW, pageH, theme as any);
        y = 15;
      }
      doc.setTextColor(24, 24, 27);
      doc.text(split, x, y);
      y += split.length * LINE_H + 1;
    }
  }

  return { y };
}

// ────────────────────────────────────────────────────────────────────────
// 4. TABLE RENDERER via autoTable
// ────────────────────────────────────────────────────────────────────────
function renderTable(
  doc: jsPDF,
  table: PDFTable,
  x: number,
  y: number,
  maxW: number,
  pageW: number,
  pageH: number
): { endY: number } {
  const themeKey = (table as any)._themeOverride ?? 'premium';
  const pal = palette(themeKey);
  const accent: [number, number, number] = table.accentColor ?? pal.outer;
  const SAFETY = 55;

  const titleHeight = 8 + 15;
  if (y + titleHeight > pageH - SAFETY) {
    doc.addPage();
    drawDecorativeBorder(doc, pageW, pageH, themeKey as any);
    drawWatermark(doc, pageW, pageH, themeKey as any);
    y = 15;
  }

  // Subtitle-bar with icon
  doc.setFillColor(accent[0], accent[1], accent[2]);
  doc.roundedRect(x, y, maxW, 8, 1.5, 1.5, 'F');
  doc.setFillColor(pal.gold[0], pal.gold[1], pal.gold[2]);
  doc.roundedRect(x, y, 3, 8, 1.5, 0, 'F');
  doc.setTextColor(255, 248, 220);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.text(table.title, x + 5, y + 5.5);
  if (table.titleHi) {
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(254, 243, 199);
    doc.text(table.titleHi, pageW / 2, y + 5.5, { align: 'center' });
  }

  y += 12;

  const buildColumnStyles = (): Record<number, any> => {
    const styles: Record<number, any> = {};
    const n = table.headers.length;
    const explicit = table.columnWidths ?? {};
    const assigned: Record<number, number> = {};
    let remaining = maxW;

    for (let i = 0; i < n; i++) {
      const w = explicit[i];
      if (typeof w === 'number' && w > 0) {
        assigned[i] = Math.min(w, maxW);
        remaining -= assigned[i];
      }
    }

    if (Object.keys(assigned).length === 0) {
      const header0 = (table.headers[0] ?? '').toLowerCase();
      const header1 = (table.headers[1] ?? '').toLowerCase();
      const header2 = (table.headers[2] ?? '').toLowerCase();
      const headerN_1 = (table.headers[n - 1] ?? '').toLowerCase();

      if (header0 === '#' || header0.startsWith('no.') || header0.startsWith('sl')) {
        assigned[0] = 8; remaining -= 8;
      } else if (/time|मुहूर्त|edt|ist|hour/.test(header0)) {
        assigned[0] = 30; remaining -= 30;
      }

      if (/quality|score|गुणवत्ता|0-100|\/100/.test(header2)) {
        assigned[2] = 22; remaining -= 22;
      } else if (/week|सप्ताह|rule|नियम/.test(header0) && n >= 3) {
        if (assigned[0] === undefined) { assigned[0] = 30; remaining -= 30; }
      }

      if (/verdict|result|निर्णय|conclusion/.test(headerN_1)) {
        assigned[n - 1] = Math.min(50, remaining - 20);
        remaining -= assigned[n - 1];
      } else if (/checklist|ritual|चेकलिस्ट|item|सामग्री/.test(headerN_1)) {
        assigned[n - 1] = Math.max(remaining, 50);
      }

      if (/energy|ऊर्जा|expected|event|events/.test(header1) && assigned[1] === undefined && n >= 4) {
        assigned[1] = 32; remaining -= 32;
      }
    } else {
      for (let i = 0; i < n; i++) {
        const w = explicit[i];
        if (typeof w === 'number' && w > 0) {
          if (assigned[i] === undefined) {
            assigned[i] = w;
            remaining -= w;
          }
        }
      }
    }

    const unsetCount = Math.max(1, n - Object.keys(assigned).length);
    const share = Math.max(18, Math.floor(remaining / unsetCount));
    let leftover = remaining;
    for (let i = 0; i < n; i++) {
      if (assigned[i] === undefined) {
        const isLast = i === n - 1;
        const mine = isLast ? leftover : share;
        assigned[i] = Math.max(10, mine);
        leftover -= mine;
      }
    }

    for (let i = 0; i < n; i++) {
      styles[i] = {
        cellWidth: assigned[i],
        minCellWidth: assigned[i],
        maxCellWidth: assigned[i],
        overflow: 'linebreak',
        cellPadding: 2.4,
        valign: 'middle',
      };
      if (i === 0) {
        styles[i].fontStyle = 'bold';
        styles[i].textColor = pal.labelText;
      }
    }
    return styles;
  };
  const finalColumnStyles = buildColumnStyles();

  autoTable(doc, {
    startY: y,
    margin: { left: x, right: pageW - x - maxW, top: 15, bottom: 30 },
    head: [table.headers],
    body: table.rows.map(r => r),
    theme: 'grid',
    tableWidth: maxW,
    useCss: false,
    rowPageBreak: 'auto',
    styles: {
      fontSize: 8,
      cellPadding: 2.4,
      lineColor: pal.lineTint,
      lineWidth: 0.15,
      textColor: [24, 24, 27],
      font: 'helvetica',
      overflow: 'linebreak',
      valign: 'middle',
    },
    headStyles: {
      fillColor: accent,
      textColor: [255, 248, 220],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 8.5,
    },
    alternateRowStyles: {
      fillColor: pal.softFill,
    },
    columnStyles: finalColumnStyles,
    didDrawPage: (d) => {
      const currentPageNum = doc.getNumberOfPages();
      doc.setPage(currentPageNum);
      drawDecorativeBorder(doc, pageW, pageH, themeKey as any);
      drawWatermark(doc, pageW, pageH, themeKey as any);
    },
    didDrawCell: (data) => {
      if (data.section === 'body' && typeof data.cell.text[0] === 'string') {
        const txt = data.cell.text[0] as string;
        if (txt.includes('⭐') || txt.includes('🏆') || txt.includes('BEST') || txt.includes('✅')) {
          data.cell.styles.textColor = themeKey === 'magenta' ? [157, 23, 77] : [22, 163, 74];
          data.cell.styles.fillColor = themeKey === 'magenta' ? [252, 231, 243] : [220, 252, 231];
        } else if (txt.includes('❌') || txt.includes('AVOID') || txt.includes('🔴')) {
          data.cell.styles.textColor = [225, 29, 72];
          data.cell.styles.fillColor = themeKey === 'magenta' ? [255, 228, 238] : [254, 226, 226];
        } else if (txt.includes('⚠️') || txt.includes('CAUTION')) {
          data.cell.styles.textColor = themeKey === 'magenta' ? [194, 65, 12] : [202, 138, 4];
          data.cell.styles.fillColor = themeKey === 'magenta' ? [254, 240, 245] : [254, 243, 199];
        }
      }
    },
  });

  const endY = (doc as any).lastAutoTable.finalY + 5;
  return { endY };
}

// ────────────────────────────────────────────────────────────────────────
// 5. WATERMARK — center
// ────────────────────────────────────────────────────────────────────────
function drawWatermark(doc: jsPDF, pageW: number, pageH: number, theme?: 'classic' | 'premium' | 'royal' | 'magenta'): void {
  const isMagenta = theme === 'magenta';
  const tint: [number, number, number] = isMagenta ? [244, 182, 214] : [233, 213, 163];
  doc.setTextColor(tint[0], tint[1], tint[2]);
  doc.setFontSize(42);
  doc.setFont('helvetica', 'bold');
  doc.text('ॐ', pageW / 2, pageH / 2 - 5, { align: 'center' });
  doc.setFontSize(28);
  doc.text('卐', pageW / 2, pageH / 2 + 20, { align: 'center' });
}

// ────────────────────────────────────────────────────────────────────────
// 6. SUBJECT INFO BOX
// ────────────────────────────────────────────────────────────────────────
function renderSubjectInfoBox(
  doc: jsPDF,
  info: { label: string; value: string }[],
  x: number,
  y: number,
  maxW: number,
  theme: 'classic' | 'premium' | 'royal' | 'magenta' = 'premium'
): { endY: number } {
  const pal = palette(theme);
  const rowH = 6.0;
  const numRows = Math.ceil(info.length / 2);
  const boxH = 6 + numRows * rowH + 5;
  doc.setFillColor(pal.softFill[0], pal.softFill[1], pal.softFill[2]);
  doc.setDrawColor(pal.lineTint[0], pal.lineTint[1], pal.lineTint[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(x, y, maxW, boxH, 2, 2, 'FD');

  doc.setFillColor(pal.labelText[0], pal.labelText[1], pal.labelText[2]);
  doc.roundedRect(x, y, maxW, 5.5, 2, 0, 'F');
  doc.setTextColor(pal.gold[0], pal.gold[1], pal.gold[2]);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text('📋 REPORT SUBJECT / जन्म विवरण', x + 5, y + 3.8);

  y += 11;

  info.forEach((item, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const lx = x + 5 + col * (maxW / 2);
    const ly = y + row * rowH;
    doc.setTextColor(pal.labelText[0], pal.labelText[1], pal.labelText[2]);
    doc.setFontSize(7.8);
    doc.setFont('helvetica', 'bold');
    const labelTxt = item.label + ':';
    doc.text(labelTxt, lx, ly);
    doc.setTextColor(24, 24, 27);
    doc.setFontSize(7.8);
    doc.setFont('helvetica', 'normal');
    const maxValLen = 38;
    const val = String(item.value).slice(0, maxValLen);
    doc.text(val, lx + 1.5 + doc.getTextWidth(labelTxt), ly);
  });
  return { endY: y + numRows * rowH + 6 };
}

// ────────────────────────────────────────────────────────────────────────
// 7. FOOTER
// ────────────────────────────────────────────────────────────────────────
function renderFooter(
  doc: jsPDF,
  pageW: number,
  pageH: number,
  blessing: string,
  currentPage: number,
  totalPages: number,
  theme: 'classic' | 'premium' | 'royal' | 'magenta' = 'premium'
): void {
  const pal = palette(theme);
  const y = pageH - 8;
  doc.setDrawColor(pal.lineTint[0], pal.lineTint[1], pal.lineTint[2]);
  doc.setLineWidth(0.3);
  doc.line(14, y - 3, pageW - 14, y - 3);
  doc.setTextColor(pal.labelText[0], pal.labelText[1], pal.labelText[2]);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'italic');
  doc.text(blessing, pageW / 2, y - 0.5, { align: 'center', maxWidth: pageW - 40 });
  doc.setTextColor(pal.labelText[0], pal.labelText[1], pal.labelText[2]);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Page ${currentPage} / ${totalPages}   •   Generated by Vedic Rajkumar`, pageW - 14, y - 0.5, { align: 'right' });
}

// ────────────────────────────────────────────────────────────────────────
// 8. MAIN GENERATOR
// ────────────────────────────────────────────────────────────────────────
export function buildVedicGaneshPDF(config: GaneshPDFConfig): jsPDF {
  const theme: 'classic' | 'premium' | 'royal' | 'magenta' = config.theme ?? 'premium';
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = 210;
  const pageH = 297;
  const margin = 14;
  const contentW = pageW - margin * 2;
  const contentX = margin;
  const accent: [number, number, number] = theme === 'classic' ? [153, 27, 27] : theme === 'royal' ? [146, 64, 14] : theme === 'magenta' ? [157, 23, 77] : [120, 53, 15];
  const gold: [number, number, number] = theme === 'magenta' ? [251, 207, 232] : [250, 204, 21];
  const blessing = config.footerBlessing ?? '॥ श्री गणेशाय नमः ॐ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभः। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥';

  // ── PAGE 1 ────────────────────────────────────────────────────────
  drawDecorativeBorder(doc, pageW, pageH, theme);
  drawWatermark(doc, pageW, pageH, theme);
  let y = drawGaneshHeader(doc, pageW, theme);

  // Title + subtitle below header banner
  doc.setFillColor(accent[0], accent[1], accent[2]);
  doc.roundedRect(contentX, y + 1, contentW, 14, 2, 2, 'F');
  doc.setFillColor(gold[0], gold[1], gold[2]);
  doc.roundedRect(contentX, y + 1, 4, 14, 2, 0, 'F');
  doc.setTextColor(255, 248, 220);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(config.reportTitle, pageW / 2, y + 6.5, { align: 'center' });
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(254, 243, 199);
  doc.text(config.subtitle, pageW / 2, y + 11, { align: 'center' });
  if (config.reportTitleHi) {
    doc.setFontSize(7.5);
    doc.text(config.reportTitleHi, pageW / 2, y + 14, { align: 'center' });
  }
  y += 20;

  const subjectBox = renderSubjectInfoBox(doc, config.subjectInfo, contentX, y, contentW, theme);
  y = subjectBox.endY + 5;

  for (const section of config.sections) {
    if (y > pageH - 55) {
      doc.addPage();
      drawDecorativeBorder(doc, pageW, pageH, theme);
      drawWatermark(doc, pageW, pageH, theme);
      y = 15;
    }
    (section as any)._themeOverride = theme;
    const end = renderSection(doc, section, contentX, y, contentW, pageW, pageH);
    y = end.y + 4;
  }

  if (config.tables) {
    for (const table of config.tables) {
      if (y > pageH - 55) {
        doc.addPage();
        drawDecorativeBorder(doc, pageW, pageH, theme);
        drawWatermark(doc, pageW, pageH, theme);
        y = 15;
      }
      (table as any)._themeOverride = theme;
      const end = renderTable(doc, table, contentX, y, contentW, pageW, pageH);
      y = end.endY + 4;
    }
  }

  // Final: draw footers with page numbers
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    renderFooter(doc, pageW, pageH, blessing, i, total, theme);
  }

  return doc;
}

export function generateVedicGaneshPDFBuffer(config: GaneshPDFConfig): Uint8Array | ArrayBuffer | string {
  const doc = buildVedicGaneshPDF(config);
  try {
    const arr = doc.output('uint8array') as unknown;
    if (arr instanceof Uint8Array && arr.length > 0) return arr;
  } catch { /* fallthrough */ }
  try {
    const ab = doc.output('arraybuffer') as unknown;
    if (ab instanceof ArrayBuffer && ab.byteLength > 0) return ab;
  } catch { /* fallthrough */ }
  return doc.output();
}

export function generateVedicGaneshPDF(config: GaneshPDFConfig): jsPDF {
  const doc = buildVedicGaneshPDF(config);
  doc.save(config.filename);
  return doc;
}

export function extractClientName(subjectInfo: { label: string; value: string }[]): string {
  const nameEntry = subjectInfo.find(item =>
    /^name$/i.test(item.label.trim()) ||
    /^name\s*\//i.test(item.label.trim()) ||
    item.label.toLowerCase().includes('client') ||
    item.label.toLowerCase().includes('नाम')
  );
  if (nameEntry) {
    return nameEntry.value
      .trim()
      .replace(/[^\w\u00C0-\u024F\u1E00-\u1EFF\s-]/g, '')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }
  const fallback = subjectInfo[0]?.value ?? 'Unknown_Client';
  return fallback
    .trim()
    .replace(/[^\w\u00C0-\u024F\u1E00-\u1EFF\s-]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

export function getTodayFolderName(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * ⭐ DEFAULT ESSENTIAL PDF GENERATOR for ALL FUTURE TASKS in Vedic Rajkumar
 * =========================================================================
 * Register as default/essential for all future reports:
 *  - Kundli / Muhurat / Horoscope / Career / Transit / Marriage / Dasha etc.
 *
 * Standard usage:
 *   import { generateVedicGaneshPDF } from '@/services/vedicGaneshPDFGenerator';
 *   generateVedicGaneshPDF({
 *     reportTitle, reportTitleHi, subtitle, subjectInfo, sections, tables,
 *     filename: 'MY_REPORT_NAME.pdf', theme: 'premium' (or 'classic'/'royal')
 *   });
 *
 * Features guaranteed in every generated PDF:
 *  ✔ Colourful Lord Ganesha geometric vector header with crown + modak + sun-halo
 *  ✔ Kalash / Om / Swastika / Trishul motifs on all 4 corners
 *  ✔ Double-line saffron-gold decorative page borders on ALL pages
 *  ✔ Marigold + lotus dots border pattern (side + top/bottom bars)
 *  ✔ Page watermark: ॐ (Om) + 卐 (Swastika) behind content on every page
 *  ✔ Section title bars with gold left strip + accent color
 *  ✔ Professional autoTables with conditional emoji-based color cells
 *  ✔ Footer with Vakratunda Mahakaya Ganesh blessing + page numbers
 */
export default {
  generateVedicGaneshPDF,
  buildVedicGaneshPDF,
  generateVedicGaneshPDFBuffer,
  extractClientName,
  getTodayFolderName,
  drawDecorativeBorder,
  drawGaneshHeader,
  renderTable,
  renderSection,
};
export const ESSENTIAL_PDF_GENERATOR = generateVedicGaneshPDF;
export const REGISTER_AS_DEFAULT_FOR_FUTURE_TASKS = true;
