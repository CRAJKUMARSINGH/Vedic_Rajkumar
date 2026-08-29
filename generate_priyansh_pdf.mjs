import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '.');
const OUTPUT_DIR = resolve(REPO_ROOT, 'output');
const OUTPUT_PATH = resolve(OUTPUT_DIR, 'PRIYANSH_JOINING_MUHURAT_GANESH_REPORT.pdf');

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

function drawDecorativeBorder(doc, pageW, pageH, theme = 'premium') {
  const outer = 6;
  const inner = 11;
  const colors = {
    classic:  { outer: [153, 27, 27], inner: [251, 191, 36], accent: [234, 88, 12] },
    premium:  { outer: [120, 53, 15],  inner: [250, 204, 21], accent: [217, 119, 6] },
    royal:    { outer: [146, 64, 14],  inner: [251, 191, 36], accent: [154, 52, 18] },
  }[theme];

  doc.setDrawColor(colors.outer[0], colors.outer[1], colors.outer[2]);
  doc.setLineWidth(0.9);
  doc.rect(outer, outer, pageW - outer * 2, pageH - outer * 2);
  doc.setDrawColor(colors.inner[0], colors.inner[1], colors.inner[2]);
  doc.setLineWidth(0.4);
  doc.rect(inner, inner, pageW - inner * 2, pageH - inner * 2);
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setLineWidth(0.6);
  const c = 17;
  const corners = [
    [inner, inner, inner + c, inner, inner, inner, inner, inner + c],
    [pageW - inner - c, inner, pageW - inner, inner, pageW - inner, inner, pageW - inner, inner + c],
    [inner, pageH - inner, inner + c, pageH - inner, inner, pageH - inner - c, inner, pageH - inner],
    [pageW - inner - c, pageH - inner, pageW - inner, pageH - inner, pageW - inner, pageH - inner - c, pageW - inner, pageH - inner],
  ];
  corners.forEach(([x1, y1, x2, y2, x3, y3, x4, y4]) => {
    doc.line(x1, y1, x2, y2);
    doc.line(x3, y3, x4, y4);
  });

  drawOmMotif(doc, inner + 4, inner + 4, colors);
  drawSwastika(doc, pageW - inner - 12, inner + 4, colors);
  drawKalash(doc, inner + 4, pageH - inner - 14, colors);
  drawTrishul(doc, pageW - inner - 12, pageH - inner - 14, colors);

  doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  for (let y = inner + 30; y < pageH - inner - 30; y += 18) {
    doc.circle(inner + 2.5, y, 1.1, 'F');
    doc.circle(pageW - inner - 2.5, y, 1.1, 'F');
  }
  for (let x = inner + 30; x < pageW - inner - 30; x += 10) {
    doc.setFillColor(colors.inner[0], colors.inner[1], colors.inner[2]);
    doc.circle(x, inner + 2.5, 1.0, 'F');
    doc.circle(x, pageH - inner - 2.5, 1.0, 'F');
  }
}

function drawOmMotif(doc, x, y, colors) {
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setFillColor(colors.inner[0], colors.inner[1], colors.inner[2]);
  doc.setLineWidth(0.6);
  doc.ellipse(x + 4, y + 4, 4, 5, 0, 0, 360, 'FD');
  doc.setDrawColor(colors.outer[0], colors.outer[1], colors.outer[2]);
  doc.ellipse(x + 4, y + 4, 3, 4, 0, 0, 360);
  doc.setFillColor(colors.outer[0], colors.outer[1], colors.outer[2]);
  doc.circle(x + 7, y + 1.5, 0.8, 'F');
}

function drawSwastika(doc, x, y, colors) {
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setFillColor(colors.inner[0], colors.inner[1], colors.inner[2]);
  doc.setLineWidth(0.7);
  doc.rect(x, y, 8, 8, 'FD');
  doc.setDrawColor(colors.outer[0], colors.outer[1], colors.outer[2]);
  doc.setLineWidth(0.8);
  doc.line(x + 4, y + 1, x + 4, y + 7);
  doc.line(x + 1, y + 4, x + 7, y + 4);
  doc.line(x + 4, y + 1, x + 6, y + 1);
  doc.line(x + 4, y + 7, x + 2, y + 7);
  doc.line(x + 1, y + 4, x + 1, y + 2);
  doc.line(x + 7, y + 4, x + 7, y + 6);
}

function drawKalash(doc, x, y, colors) {
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setFillColor(colors.inner[0], colors.inner[1], colors.inner[2]);
  doc.setLineWidth(0.6);
  doc.ellipse(x + 4, y + 9, 4, 3, 0, 0, 360, 'FD');
  doc.rect(x + 2.5, y + 11, 3, 1.5, 'FD');
  doc.setDrawColor(colors.outer[0], colors.outer[1], colors.outer[2]);
  doc.triangle(x + 2, y + 4, x + 6, y + 4, x + 4, y);
  doc.line(x + 4, y, x + 4, y - 2);
}

function drawTrishul(doc, x, y, colors) {
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setLineWidth(0.8);
  doc.line(x + 4, y + 2, x + 4, y + 14);
  doc.line(x + 1, y + 4, x + 1, y + 2);
  doc.line(x + 4, y + 2, x + 7, y + 2);
  doc.line(x + 7, y + 2, x + 7, y + 4);
  doc.setFillColor(colors.outer[0], colors.outer[1], colors.outer[2]);
  doc.circle(x + 4, y + 7, 0.8, 'F');
}

function drawGaneshHeader(doc, pageW, theme) {
  const colors = {
    classic: { banner: [153, 27, 27], gold: [251, 191, 36], skin: [249, 115, 22] },
    premium: { banner: [120, 53, 15], gold: [250, 204, 21], skin: [251, 146, 60] },
    royal:   { banner: [146, 64, 14], gold: [251, 191, 36], skin: [234, 88, 12] },
  }[theme];

  doc.setFillColor(colors.banner[0], colors.banner[1], colors.banner[2]);
  doc.rect(0, 0, pageW, 46, 'F');
  doc.setFillColor(colors.gold[0], colors.gold[1], colors.gold[2]);
  doc.rect(0, 44, pageW, 2.5, 'F');
  doc.setFillColor(colors.skin[0], colors.skin[1], colors.skin[2]);
  doc.rect(0, 46.5, pageW, 1, 'F');

  const gx = pageW / 2;
  const gy = 24;

  doc.setDrawColor(colors.gold[0], colors.gold[1], colors.gold[2]);
  doc.setFillColor(255, 251, 235);
  doc.setLineWidth(1.2);
  doc.ellipse(gx, gy + 2, 20, 18, 0, 0, 360, 'FD');
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

  doc.setFillColor(colors.gold[0], colors.gold[1], colors.gold[2]);
  doc.setDrawColor(colors.banner[0], colors.banner[1], colors.banner[2]);
  doc.setLineWidth(0.4);
  doc.triangle(gx - 7, gy - 13, gx + 7, gy - 13, gx, gy - 22);
  doc.rect(gx - 8, gy - 14, 16, 2, 'FD');
  doc.setFillColor(220, 38, 38);
  doc.circle(gx, gy - 17, 1.1, 'F');

  doc.setFillColor(252, 211, 153);
  doc.setDrawColor(colors.banner[0], colors.banner[1], colors.banner[2]);
  doc.setLineWidth(0.4);
  doc.ellipse(gx - 13, gy - 2, 4.5, 6.5, -20 * Math.PI / 180, 0, 360, 'FD');
  doc.ellipse(gx + 13, gy - 2, 4.5, 6.5, 20 * Math.PI / 180, 0, 360, 'FD');
  doc.setFillColor(colors.skin[0], colors.skin[1], colors.skin[2]);
  doc.ellipse(gx - 13, gy - 2, 2.5, 4.2, -20 * Math.PI / 180, 0, 360, 'FD');
  doc.ellipse(gx + 13, gy - 2, 2.5, 4.2, 20 * Math.PI / 180, 0, 360, 'FD');

  doc.setFillColor(253, 230, 138);
  doc.setDrawColor(colors.banner[0], colors.banner[1], colors.banner[2]);
  doc.setLineWidth(0.5);
  doc.ellipse(gx, gy, 12, 13, 0, 0, 360, 'FD');

  doc.setFillColor(253, 230, 138);
  doc.ellipse(gx, gy + 7, 3.8, 6.5, 0, 0, 360, 'FD');
  doc.setDrawColor(colors.banner[0], colors.banner[1], colors.banner[2]);
  doc.setLineWidth(0.4);
  doc.ellipse(gx, gy + 10.5, 1.4, 1.1, 0, 0, 360, 'FD');

  doc.setLineWidth(0.6);
  doc.setDrawColor(colors.banner[0], colors.banner[1], colors.banner[2]);
  doc.line(gx - 6, gy - 3, gx - 2, gy - 2);
  doc.line(gx + 2, gy - 3, gx + 6, gy - 2);
  doc.setFillColor(220, 38, 38);
  doc.triangle(gx - 1.8, gy - 11, gx + 1.8, gy - 11, gx, gy - 7.5);
  doc.setFillColor(colors.gold[0], colors.gold[1], colors.gold[2]);
  doc.circle(gx, gy - 9, 0.8, 'F');

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(colors.banner[0], colors.banner[1], colors.banner[2]);
  doc.triangle(gx - 3, gy + 4, gx - 1, gy + 4, gx - 1, gy + 9);
  doc.triangle(gx + 3, gy + 4, gx + 1, gy + 4, gx + 1, gy + 7.2);

  doc.setDrawColor(colors.banner[0], colors.banner[1], colors.banner[2]);
  doc.setLineWidth(0.4);
  doc.ellipse(gx, gy + 4.5, 2.2, 1.1, 0, 180, 360);

  doc.setFillColor(251, 191, 36);
  doc.setDrawColor(colors.banner[0], colors.banner[1], colors.banner[2]);
  doc.ellipse(gx + 7.5, gy + 12, 2.2, 2.5, 0, 0, 360, 'FD');
  doc.setFillColor(153, 27, 27);
  doc.circle(gx + 7.5, gy + 10.2, 0.6, 'F');

  doc.setTextColor(255, 248, 220);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('\u096A \u0950 \u0936\u094D\u0930\u0940 \u0917\u0923\u0947\u0936\u093E\u092F \u0928\u092E\u0903 \u096A', gx, 3, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('\u096A Vakratunda Mahakaya Suryakoti Samaprabha \u096A', gx, 48, { align: 'center' });

  return 50;
}

function renderSection(doc, section, x, y, maxW, pageW, pageH) {
  const accent = section.accentColor ?? [120, 53, 15];
  const safe = [250, 204, 21];
  const theme = section._themeOverride ?? 'premium';

  doc.setFillColor(accent[0], accent[1], accent[2]);
  doc.roundedRect(x, y, maxW, 8, 1.5, 1.5, 'F');
  doc.setFillColor(safe[0], safe[1], safe[2]);
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

  y += 11;

  doc.setTextColor(24, 24, 27);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  for (const block of section.body) {
    if (y > pageH - 40) {
      doc.addPage();
      drawDecorativeBorder(doc, pageW, pageH, theme);
      drawWatermark(doc, pageW, pageH);
      y = 15;
    }
    if (Array.isArray(block)) {
      for (const item of block) {
        doc.setFillColor(accent[0], accent[1], accent[2]);
        doc.circle(x + 2.2, y - 1.6, 0.8, 'F');
        const split = doc.splitTextToSize(item, maxW - 6);
        doc.setTextColor(24, 24, 27);
        doc.text(split, x + 5, y);
        y += split.length * 4.4 + 1;
      }
      y += 1;
    } else {
      const split = doc.splitTextToSize(block, maxW);
      doc.setTextColor(24, 24, 27);
      doc.text(split, x, y);
      y += split.length * 4.4 + 1;
    }
  }

  return { y };
}

function renderTable(doc, table, x, y, maxW, pageW, pageH) {
  const accent = table.accentColor ?? [120, 53, 15];

  doc.setFillColor(accent[0], accent[1], accent[2]);
  doc.roundedRect(x, y, maxW, 8, 1.5, 1.5, 'F');
  doc.setFillColor(250, 204, 21);
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

  y += 11;

  autoTable(doc, {
    startY: y,
    margin: { left: x, right: pageW - x - maxW },
    head: [table.headers],
    body: table.rows.map(r => r),
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: [220, 160, 80],
      lineWidth: 0.15,
      textColor: [24, 24, 27],
      font: 'helvetica',
    },
    headStyles: {
      fillColor: accent,
      textColor: [255, 248, 220],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 8.5,
    },
    alternateRowStyles: {
      fillColor: [255, 249, 219],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 'auto', textColor: [120, 53, 15] },
    },
    didDrawCell: (data) => {
      if (data.section === 'body' && typeof data.cell.text[0] === 'string') {
        const txt = data.cell.text[0];
        if (txt.includes('\u2B50') || txt.includes('\uD83C\uDFC6') || txt.includes('BEST') || txt.includes('\u2705')) {
          data.cell.styles.textColor = [22, 163, 74];
          data.cell.styles.fillColor = [220, 252, 231];
        } else if (txt.includes('\u274C') || txt.includes('AVOID') || txt.includes('\uD83D\uDD34')) {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fillColor = [254, 226, 226];
        } else if (txt.includes('\u26A0\uFE0F') || txt.includes('CAUTION')) {
          data.cell.styles.textColor = [202, 138, 4];
          data.cell.styles.fillColor = [254, 243, 199];
        }
      }
    },
  });

  const endY = doc.lastAutoTable.finalY + 4;
  return { endY };
}

function drawWatermark(doc, pageW, pageH) {
  doc.setTextColor(233, 213, 163);
  doc.setFontSize(42);
  doc.setFont('helvetica', 'bold');
  doc.text('\u0950', pageW / 2, pageH / 2 - 5, { align: 'center' });
  doc.setFontSize(28);
  doc.text('\u5350', pageW / 2, pageH / 2 + 20, { align: 'center' });
}

function renderSubjectInfoBox(doc, info, x, y, maxW) {
  const boxH = 6 + Math.ceil(info.length / 2) * 5.2 + 4;
  doc.setFillColor(255, 249, 219);
  doc.setDrawColor(202, 138, 4);
  doc.setLineWidth(0.5);
  doc.roundedRect(x, y, maxW, boxH, 2, 2, 'FD');

  doc.setFillColor(120, 53, 15);
  doc.roundedRect(x, y, maxW, 5, 2, 0, 'F');
  doc.setTextColor(250, 204, 21);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text('\uD83D\uDCCB REPORT SUBJECT / \u091C\u0928\u094D\u092E \u0935\u093F\u0935\u0930\u0923', x + 5, y + 3.5);

  y += 10;

  info.forEach((item, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const lx = x + 5 + col * (maxW / 2);
    const ly = y + row * 5.2;
    doc.setTextColor(120, 53, 15);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text(item.label + ':', lx, ly);
    doc.setTextColor(24, 24, 27);
    doc.setFont('helvetica', 'normal');
    doc.text(String(item.value).slice(0, 40), lx + 2 + doc.getTextWidth(item.label + ': '), ly);
  });
  return { endY: y + Math.ceil(info.length / 2) * 5.2 + 6 };
}

function renderFooter(doc, pageW, pageH, blessing, currentPage, totalPages) {
  const y = pageH - 8;
  doc.setDrawColor(202, 138, 4);
  doc.setLineWidth(0.3);
  doc.line(14, y - 3, pageW - 14, y - 3);
  doc.setTextColor(120, 53, 15);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'italic');
  doc.text(blessing, pageW / 2, y - 0.5, { align: 'center', maxWidth: pageW - 40 });
  doc.setTextColor(156, 80, 20);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Page ${currentPage} / ${totalPages}   \u2022   Generated by Vedic Rajkumar`, pageW - 14, y - 0.5, { align: 'right' });
}

const HOUR_SLOTS = [
  { time: '08:00 - 09:45 AM', period: 'Early Clear Zone', quality: 82, grade: 'B+', verdict: '\u2705 ACCEPTABLE FALLBACK' },
  { time: '09:45 - 10:13 AM', period: 'Pre-Yamaganda Buffer', quality: 84, grade: 'B+', verdict: '\u2705 GOOD' },
  { time: '10:13 - 11:50 AM', period: '\u26A0\uFE0F YAMAGANDA (Yama Lord)', quality: 40, grade: 'C', verdict: '\u274C AVOID IF POSSIBLE' },
  { time: '11:50 AM - 12:48 PM', period: 'Pre-Abhijit Pure Clear', quality: 89, grade: 'A', verdict: '\u2705 EXCELLENT FALLBACK' },
  { time: '12:48 - 01:45 PM', period: '\uD83C\uDF1F\uD83C\uDF1F ABHIJIT MUHURAT CORE \uD83C\uDF1F\uD83C\uDF1F', quality: 95, grade: 'A+', verdict: '\uD83C\uDFC6\uD83C\uDFC6\uD83C\uDFC6 BEST OF DAY' },
  { time: '01:51 - 03:02 PM', period: 'Late Abhijit + Gulika', quality: 62, grade: 'B', verdict: '\u26A0\uFE0F CAUTION \u2014 Sluggish' },
  { time: '03:02 - 04:39 PM', period: 'Pure Clear Zone', quality: 88, grade: 'A', verdict: '\u2705 EXCELLENT SECONDARY' },
  { time: '04:40 - 06:00 PM', period: '\uD83D\uDD34\uD83D\uDD34 RAHU KAAL \uD83D\uDD34\uD83D\uDD34', quality: 0, grade: 'Avoid', verdict: '\u274C\u274C\u274C ABSOLUTELY AVOID' },
];

const WEEKLY_FORECAST = [
  { week: 'Week 1 (Sep 1-6)', energy: '\uD83C\uDF1F\uD83C\uDF1F\uD83C\uDF1F\uD83C\uDF1F\uD83C\uDF1F EXTREME HIGH', events: 'Rapid intros; 1st impressions LOCK IN; training DAY 1', caution: 'Do NOT say YES to everything', tip: '3 small daily goals; LISTEN 80%' },
  { week: 'Week 2 (Sep 7-13)', energy: '\uD83D\uDCCA\uD83D\uDCCA\uD83D\uDCCA MODERATE', events: 'Training & docs; first REAL ticket', caution: 'DOUBLE-CHECK EVERYTHING (Mercury errors!)', tip: 'Physical notebook notes = KARMA' },
  { week: 'Week 3 (Sep 14-20)', energy: '\u26A1\u26A1\u26A1\u26A1 INTENSE', events: 'First REAL deadline + minor conflict', caution: 'PAUSE 5 FULL SECONDS before reacting', tip: 'Hanuman Chalisa DAILY this week' },
  { week: 'Week 4 (Sep 21-27)', energy: '\uD83E\uDE90\uD83E\uDE90\uD83E\uDE90 SATURN TEST', events: 'Manager 1:1 \u2014 Process & Quality review', caution: 'NO CUTTING CORNERS (Saturn sees all)', tip: 'First-Month Wins tracker file' },
  { week: 'Week 5 (Sep 28-30)', energy: '\uD83D\uDCAB\uD83D\uDCAB\uD83D\uDCAB\uD83D\uDCAB POSITIVE', events: 'First praise + work friendships deepen', caution: 'AVOID overconfidence', tip: 'Thank You notes \u00D7 3-5 people' },
];

const FIVE_RULES = [
  { n: 1, rule: 'TALK LESS, LISTEN MORE', why: 'Mercury watches every word. Early reputation = LIFETIME reputation. Ask: "Does this need to be said, by ME, RIGHT NOW?" If 2/3 = NO \u2192 SILENCE IS GOLDEN.' },
  { n: 2, rule: 'NO OFFICE POLITICS EVER. Stay NEUTRAL.', why: 'Rahu creates gossip traps. If colleague badmouths: Say "Hmm, I\'m new so I reserve judgment" \u2192 CHANGE SUBJECT. Do NOT pick sides. Do NOT agree. Neutrality = POWER.' },
  { n: 3, rule: 'Arrive 15 min EARLY. Leave ON TIME (+5 min max late.)', why: 'First 90 days = Saturn PROBATION test of DEPENDABILITY. Brilliance can wait. Reliability builds USA career foundation. Everybody notices the person who is always there.' },
  { n: 4, rule: 'FEED BIRDS / FISH / SQUIRRELS EVERY SATURDAY.', why: '$1 Publix/Walmart bread. Park 10 min. Feed 5+ birds. SHANI DEV (Saturn) will PERSONALLY OVERSEE your promotion timeline. 100x more powerful than any resume service.' },
  { n: 5, rule: 'CALL PARENTS EVERY WEEK \u2014 MIN: WED + SUN.', why: 'Father = SUN = Career framework. Mother = MOON = Mental peace. You CANNOT succeed long-term with EITHER blessing missing. 5 min call OK. Script: "Just calling to say hi, how are you?" DO IT.' },
];

const CHECKLIST_ITEMS = [
  '\uD83C\uDFAF Join at 12:48 - 1:45 PM EDT (ABHIJIT MUHURAT CORE) \u2014 #1 slot!',
  '\uD83D\uDED5 Brahma Muhurat Puja + HANUMAN CHALISA (TUESDAY!) before leaving',
  '\uD83D\uDC54 Outfit: \uD83D\uDD34 RED / Saffron / Emerald Green (Tuesday Mars colors)',
  '\uD83C\uDF72 Satvik breakfast + GREEN MOONG SPROUTS (Mercury career boost!)',
  '\uD83D\uDEB6 Exit house + Enter office: RIGHT FOOT FIRST. 100% MANDATORY.',
  '\uD83D\uDD8B\uFE0F Sign papers: Mental "Ganeshaya Namah \u00D7 5 + Hanumate Namah \u00D7 3"',
  '\uD83E\uDD1D Accept offer/ID WITH BOTH HANDS. Accept water/coffee \u2192 1 sip minimum.',
  '\uD83D\uDCB8 Donate $5-$11 to charity WITHIN 3 DAYS of joining.',
  '\uD83D\uDCDE CALL PARENTS AFTER JOINING. SHARE EXCITEMENT!',
  '\uD83E\uDDF7F Red Mauli (7 knots) on wrist + Vibhuti Tripund on forehead DAILY.',
  '\uD83D\uDC26 FEED BIRDS EVERY SATURDAY IN USA. Publix bread $1. Shani Dev.',
  '\uD83D\uDD31 Visit Shiva temple in Miami WITHIN 40 DAYS. Jalabhishek minimum.',
  '\uD83E\uDDF9 11-DAY PURGE: Nothing from office to home for 11 days. Wipe bag/laptop.',
  '\uD83D\uDEAB AVOID 4:40 PM - 6:00 PM RAHU KAAL AT ALL COSTS. Finish by 4:30 PM!',
  '\uD83E\uDDD8 START 11-MIN USA DAILY SADHANA TODAY. Not tomorrow. TODAY!',
];

function buildPDFConfig() {
  return {
    reportTitle: 'PRIYANSH SINGH CHAUHAN \u2022 NEW JOB JOINING MUHURAT',
    reportTitleHi: '\u092A\u094D\u0930\u093F\u092F\u093E\u0902\u0936 \u0938\u093F\u0902\u0918 \u091A\u094C\u0939\u093E\u0928 \u2022 \u0928\u094C\u0915\u0930\u0940 \u092F\u094B\u0917\u0926\u093E\u0928 \u0936\u0941\u092D \u092E\u0941\u0939\u0942\u0930\u094D\u0924',
    subtitle: 'MIAMI, FLORIDA, USA \u2503 1 SEPTEMBER 2026 \u2503 8:00 AM - 6:00 PM EDT',
    subtitleHi: '\u092E\u093F\u092F\u093E\u092E\u0940, \u092B\u094D\u0932\u094B\u0930\u093F\u0921\u093E, \u092F\u0942\u090F\u090F\u0938\u090F \u2503 \u0967 \u0938\u093F\u0924\u0902\u092C\u0930 \u0968\u0966\u0968\u0968 \u2503 \u096E:\u0966\u0966 - \u0967\u096E:\u0966\u0966 EDT',
    theme: 'premium',
    filename: 'PRIYANSH_JOINING_MUHURAT_GANESH_REPORT.pdf',
    footerBlessing: '\u096A \u0936\u094D\u0930\u0940 \u0917\u0923\u0947\u0936\u093E\u092F \u0928\u092E\u0903 \u0950 \u0935\u0915\u094D\u0930\u0924\u0941\u0923\u094D\u0921 \u092E\u0939\u093E\u0915\u093E\u092F \u0938\u0942\u0930\u094D\u092F\u0915\u094B\u091F\u093F \u0938\u092E\u092A\u094D\u0930\u092D\u0903\u0964 \u0928\u093F\u0930\u094D\u0935\u093F\u0918\u094D\u0928\u0902 \u0915\u0941\u0930\u0941 \u092E\u0947 \u0926\u0947\u0935 \u0938\u0930\u094D\u0935\u0915\u093E\u0930\u094D\u092F\u0947\u0937\u0941 \u0938\u0930\u094D\u0935\u0926\u093E\u0964\u096A',
    subjectInfo: [
      { label: 'Name / \u0928\u093E\u092E', value: 'Priyansh Singh Chauhan' },
      { label: 'DOB / \u091C\u0928\u094D\u092E \u0924\u093F\u0925\u093F', value: '26 Oct 2000' },
      { label: 'Birth Time / \u0938\u092E\u092F', value: '00:50 AM IST' },
      { label: 'Birth Place / \u0938\u094D\u0925\u093E\u0928', value: 'Indore, MP, India' },
      { label: 'Joining / \u092F\u094B\u0917\u0926\u093E\u0928', value: '1 Sep 2026 (Tuesday)' },
      { label: 'Work Location', value: 'Miami, Florida, USA' },
      { label: 'Mahadasha', value: 'MARS (2020-2027) \uD83D\uDD25' },
      { label: 'Report Date', value: new Date().toISOString().slice(0, 10) },
    ],
    sections: [
      { icon: '\uD83C\uDFC6', title: 'CORRECT MUHURAT RECOMMENDATION (Within 8AM-6PM EDT, TUESDAY)', titleHi: '\u0938\u0939\u0940 \u092E\u0941\u0939\u0942\u0930\u094D\u0924 \u0938\u0932\u093E\u0939', accentColor: [22, 101, 52], body: [
        '\u2B50\u2B50\u2B50\u2B50\u2B50 #1 PRIMARY & ABSOLUTE BEST RECOMMENDED JOINING TIME: 12:48 PM - 1:45 PM EDT',
        ['Falls perfectly in ABHIJIT MUHURAT CORE (8th Muhurat \u2014 Quality 95/100)', 'Abhijit destroys ALL obstacles; INDEPENDENT of doshas; PURIFIES everything', 'Tuesday (Mars Day = his Mahadasha Lord!) + Auspicious Nakshatra + Siddha Yoga + Abhijit = QUADRUPLE BLESSING'],
        '\u2B50\u2B50\u2B50\u2B50 #2 SECONDARY CHOICE: 3:15 PM - 4:30 PM EDT',
        ['Pure Clear Zone, completely free of all major doshas', 'Excellent; use only if HR scheduling conflicts with 1 PM prime slot'],
        '\u2B50\u2B50\u2B50 #3 ACCEPTABLE FALLBACK: 8:15 AM - 9:30 AM EDT',
        ['Clear of all doshas; Morning Sattva guna dominant; mind fresh & alert'],
        '\u274C\uD83D\uDD34 NON-NEGOTIABLE \u2014 ABSOLUTELY AVOID: 4:40 PM - 6:00 PM EDT',
        ['THIS ENTIRE 80-MINUTE WINDOW = RAHU KAAL ON TUESDAY. NEVER JOIN IN RAHU KAAL.', 'Effects: Hostile coworkers, broken HR promises, confusion, toxic environment.', 'If 6 PM is hard deadline \u2192 finish ALL rituals BY 4:30 PM LATEST.'],
      ]},
      { icon: '\uD83D\uDCC5', title: '1 SEPT 2026 \u2014 PANCHANG ANALYSIS (Miami, 5-Limbs)', titleHi: '\u092A\u0902\u091A\u093E\u0902\u0917 \u0935\u093F\u0936\u094D\u0932\u0947\u0937\u0923', accentColor: [120, 53, 15], body: [
        ['VAR (Day): TUESDAY (Mangalvaar) \u2705 HIGHLY AUSPICIOUS. Lord = Mars + Hanuman.',
        '\u26A1 SPECIAL: Tuesday = MARS DAY = HIS MAHADASHA LORD DAY. DOUBLE MARS ENERGY \uD83D\uDD25\uD83D\uDD25 \u2014 COSMIC SYNERGY.',
        'TITHI: Shukla Paksha Chaturthi/Panchami Zone \u2705 FAVORABLE for contracts.',
        'NAKSHATRA: Uttara Ashadha / Shravana / Uttara Bhadrapada \u2705 BEST career nakshatras \u2014 Foreign settlement.',
        'YOGA: Siddha / Shubha / Shiva class \u2705 HIGHLY AUSPICIOUS \u2014 Siddha Yoga = EVERYTHING succeeds that you start.',
        'KARANA: Bava / Balava / Kaulava \u2705 Positive for new beginnings.',
        'SUNRISE: 7:00 AM EDT | SUNSET: 7:52 PM EDT | Day ~12h52m.']
      ]},
      { icon: '\uD83E\uDE90', title: 'BIRTH CHART & CAREER INDICATORS (Foreign Destiny)', titleHi: '\u0915\u0941\u0902\u0921\u0932\u0940 \u090F\u0935\u0902 \u0915\u0930\u0940\u092F\u0930 \u0938\u0902\u0915\u0947\u0924', accentColor: [30, 64, 175], body: [
        'MAHADASHA IN PROGRESS: MARS (Sept 2020 - Sept 2027) \uD83D\uDD25 ACTION / COURAGE / MANIFESTATION \u2014 PEAK AT AGE 25.',
        ['Mars Mahadasha at 25 = PEAK. This USA move is karmic destiny.',
        'Antardasha: Mars-Rahu \u2192 Mars-Jupiter transition = Sudden positive life events.',
        '10th House Lord: Strong \u2192 Foreign career explicitly indicated.',
        '12th House (Foreign): ACTIVATED \u2705 Miami = East/Southeast from Indore \u2014 DIRECTION AUSPICIOUS.',
        'Nakshatra Family: Jyeshtha/Anuradha (Scorpio) \u2192 FOREIGN SUCCESS pattern.',
        'TRANSIT: Mercury = OWN SIGN (Virgo) \u2192 Intellect, Business & Communication TRIPLY AMPLIFIED \u2705\u2705\u2705',
        'TRANSIT: Jupiter in Taurus (friend sign) \u2192 Blessings & expansion.']
      ]},
      { icon: '\uD83E\uDDD8', title: 'JOINING DAY (1 SEPT, TUESDAY) \u2014 SPIRITUAL RITUAL TIME TABLE (MIAMI EDT)', titleHi: '\u092F\u094B\u0917\u0926\u093E\u0928 \u0926\u093F\u0928 \u2014 \u0906\u0927\u094D\u092F\u093E\u0924\u094D\u092E\u093F\u0915 \u0935\u093F\u0927\u093F', accentColor: [157, 23, 77], body: [
        '5:00 - 5:45 AM \u25B8 BRAHMA MUHURAT', ['Bath with Ganga water drops; NEW clothes: \uD83D\uDD34 RED/SAFFRON/MAROON (Mars colors!)', '20 min silent meditation + Maha Mrityunjaya \u00D7 11 + HANUMAN CHALISA \u00D7 1 (TUESDAY!)'],
        '5:45 - 6:30 AM \u25B8 GANESH + HANUMAN VANDANA', ['1 GHEE DIYA + 2 Sandal incense. Offer MODAK/Ladoo + JAGGERY+CHANA to HANUMAN (Tue mandatory!)', 'Ganesh Atharvashirsha once or Vakratunda \u00D7 7. Prayer: "Remove obstacles from USA journey."'],
        '6:30 - 7:00 AM \u25B8 NAVAGRAHA SHANTI', ['SUN: Copper Arghya + red flower. MARS: Red flower + sindoor tilak.', 'MERCURY: Eat GREEN MOONG SPROUTS (MUST for software career!). JUPITER: Yellow dal/flowers.'],
        '7:00 - 7:45 AM \u25B8 BREAKFAST & DRESSING', ['Satvik breakfast: Poha, Upma, Idli, Fruits, GREEN MOONG SPROUTS. NO meat/onion/garlic/alcohol.', '\uD83D\uDC54 OUTFIT: \uD83D\uDD34 RED/SAFFRON/MAROON BEST; EMERALD GREEN good; YELLOW/cream OK. \u274C NO black/dark grey!'],
        '8:00 AM \u25B8 DEPARTURE (RIGHT FOOT FIRST \u2014 ALWAYS!)', ['Exit bedroom + house: RIGHT foot first. Touch car \u00D7 4 corners clockwise + "Om Vayave Swaha."', 'POCKETS: Ganesha photo LEFT pocket (heart!), Hanuman + sindoor, steel coin+muri RIGHT pocket, RED handkerchief, sanitizer.'],
        '12:15 PM \u25B8 OFFICE RITUALS (15 min before Abhijit!)', ['Right foot first out of car. 3 slow deep breaths + silent OM at entrance. Threshold touch. Enter with forehead bowed.', 'Stand 10 sec facing chair \u2192 namaste prayer. Sprinkle 2-3 water drops clockwise around chair. Sit EAST or SOUTH.'],
        '\uD83C\uDFC6 12:48 PM - 1:45 PM \u25B8 PRIME JOINING (ABHIJIT \u2014 TUESDAY + MARS MAHADASHA!)', ['Spine STRAIGHT. GENUINE smile (Venus \u2192 good relations!). Handshake: Firm-WARM, 2-3 pumps, eye contact.', 'While SIGNING: Mentally "Ganeshaya Namah \u00D7 5 + Shri Hanumate Namah \u00D7 3". Accept offer/ID WITH BOTH HANDS. Accept drink \u2192 1 sip minimum.'],
        '3:00 PM+ \u25B8 POST-JOINING', ['First lunch with GRATITUDE. WITHIN 3 DAYS: Donate $5-$11 charity. CALL PARENTS AFTER JOINING! Share excitement!']
      ]},
      { icon: '\uD83E\uDDF7F', title: '1ST MONTH PROTECTION REMEDIES + LIFELONG USA AURA SHIELD', titleHi: '\u092A\u0939\u0932\u0947 \u092E\u0939\u0940\u0928\u0947 \u0915\u0947 \u0938\u0941\u0930\u0915\u094D\u0937\u093E \u0909\u092A\u093E\u092F', accentColor: [146, 64, 14], body: [
        '\uD83E\uDEA2 RED MAULI (Kalava) WITH 7 KNOTS on RIGHT WRIST \u2192 Hanuman Kavach. Tuesday joining + 7 knots = DOUBLE MARS-HANUMAN PROTECTION \uD83D\uDD25.',
        '\uD83D\uDD49\uFE0F VIBHUTI / TRIPUND BHASM: Apply 3 HORIZONTAL lines on forehead EVERYDAY before leaving. (Shiva armor!)',
        '🪙 SILVER PIECE: Small silver coin/ring in wallet 100% of time. Moon blessing: mental peace + money flow.',
        '\uD83D\uDCC5 11-DAY PURGE: Do NOT bring ANY office item (not pen/mint/sticker!) home for 11 days. Wipe laptop/bag before threshold. Why? Prevents negative office aura from contaminating sacred home.',
        '\uD83D\uDD31 40-DAY SHIVA: Visit ANY Shiva temple in Miami WITHIN 40 DAYS. MIN: Jalabhishek. If no temple, Monday 11 Rudra mantra + milk on Shiva photo. 40 days = karmic completion.',
        '\uD83D\uDE1F WORKPLACE EMERGENCY (21-second aura reset):',
        ['\u2460 Hold breath 8 sec \u2192 slow exhale \u2461 Touch 3rd eye 2 sec \u2462 2 slow deep breaths \u2463 Mentally: Om Namah Shivaya \u00D7 3 + Om Shri Hanumate Namah \u00D7 1']
      ]},
      { icon: '\uD83D\uDC8E', title: 'GEMSTONE GUIDANCE (Career + Wellbeing \u2014 USA budget alternatives)', titleHi: '\u0930\u0924\u094D\u0928 \u0938\u0932\u093E\u0939', accentColor: [8, 47, 73], body: [
        '\uD83D\uDC9A #1 EMERALD (PANNA) \u2014 MERCURY (Intellect, Communication, Coworkers, Docs, Software!)',
        ['Weight: 3.25-4.50 Ratti. QUALITY > WEIGHT. Gold/Silver ring. LITTLE finger RIGHT hand. Wear WEDNESDAY morning after sunrise.', '\uD83D\uDD25 USA BUDGET ALTERNATIVE: GREEN PERIDOT bracelet <$20. 90% same Mercury results. DAILY WEAR.'],
        '\uD83E\uDD0D #2 PEARL (MOTI) \u2014 MOON (Mental peace + culture-shock resilience)',
        ['Silver ring/pendant. MONDAY. Little/Ring finger. Stabilizes emotions; mother blessings.'],
        '\uD83D\uDD34 #3 RED CORAL (MOONGA) \u2014 MARS (OPTIONAL Mahadasha boost!)',
        ['Ring finger, Tuesday. \u2705 BUDGET ALT: RED MAULI 7-knot you already wear = 50% boost! No cost!']
      ]},
      { icon: '\uD83E\uDDD8', title: '11-MINUTE DAILY USA SADHANA (Culture-Shock Anchor)', titleHi: '\u0967\u0967 \u092E\u093F\u0928\u091F \u0926\u0948\u0928\u093F\u0915 \u0938\u093E\u0927\u0928\u093E', accentColor: [6, 78, 59], body: [
        'America is fast-paced. Culture shock is real. Burnout is real. Your 11 minutes = anchor. MAKE the time.',
        ['\u2460 WAKE \u2192 Splash cold water + Om Gam Ganapataye Namah \u00D7 21 (5 min) \u2192 Aura reset + obstacle removal.',
         '\u2461 BREAKFAST \u2192 Hands over food + Gratitude: "Annapurne Sadapurne..." or "Thank you for this food" (2 min) \u2192 Anna Lakshmi food purity.',
         '\u2462 BEDTIME \u2192 3 deep breaths + Self forgiveness for ANY mistake + Recall 1 GOOD moment (even coffee!) (4 min) \u2192 Prevents karma buildup; rewires positivity.',
         'TOTAL = 11 MIN. EVERY. SINGLE. DAY.']
      ]},
      { icon: '\uD83D\uDD49\uFE0F', title: 'FINAL SPIRITUAL MESSAGE (Chauhan Vansh Lineage Blessing)', titleHi: '\u0905\u0902\u0924\u093F\u092E \u0906\u0927\u094D\u092F\u093E\u0924\u094D\u092E\u093F\u0915 \u0938\u0902\u0926\u0947\u0936', accentColor: [127, 29, 29], body: [
        '',
        '"Beloved Priyansh Beta,',
        'You are in MARS MAHADASHA \u2014 7-year cycle of ACTION, COURAGE, and MANIFESTATION.',
        'Miami is not an accident. It is karmically prepared destination, cultivated over MANY lifetimes, for your NEXT evolution.',
        'You carry CHAUHAN VANSH bloodline \u2014 warriors, leaders, defenders of Dharma. Prithviraj Chauhan did not carry fear. Carry that same light into every American office:',
        ['Speak TRUTH even if unpopular.', 'Work with INTEGRITY even when camera is off.', 'RESPECT every human \u2014 janitor to CEO.', 'Never forget Indore. America gives platform; Indore raised you.'],
        'Every past "No" was not rejection\u2014it was PROTECTION. Saving you for THIS exact "Yes." THIS exact Tuesday. THIS exact Abhijit.',
        'This USA chapter is not just a job. It is becoming the man your 10-year-old self watched in wonder. It is making parents proud beyond words. It is opening doors for sister, future children, family back home. Job = launching pad, NOT destination.',
        'You are not alone in that Miami building on Tuesday Sep 1 2026:',
        ['Your Ancestors walk with you. Ganesha clears obstacles BEFORE you see them. Hanuman carries your courage. Shiva stands behind you always. Lakshmi rests in your sincere work. Saraswati speaks through your code and words.'],
        'Only YOU can fail Sep 1 \u2014 if you forget love, respect, humility. Everything else already taken care of by Divine Plan.',
        'Ganpati Bappa Morya! \uD83D\uDE4F | Jai Shri Ram! \uD83D\uDEA9 | Har Har Mahadev! \uD83D\uDD31 | Bajrang Bali Ki Jai! \uD83D\uDCA8"',
        '',
        'With Vedic Blessings \u2014 Vedic Rajkumar Analysis Engine',
      ]},
    ],
    tables: [
      { title: '\u23F0 8AM-6PM EDT WINDOW \u2014 HOUR-BY-HOUR MUHURAT (TUESDAY 1 SEPT)', titleHi: '\u0918\u0902\u091F\u0947\u0935\u093E\u0930 \u092E\u0941\u0939\u0942\u0930\u094D\u0924', accentColor: [120, 53, 15],
        headers: ['Time EDT', 'Vedic Period', 'Quality 0-100', 'Verdict'],
        rows: HOUR_SLOTS.map(s => [s.time, s.period, `${s.quality}/100`, s.verdict]) },
      { title: '\uD83D\uDCC8 1-MONTH FORECAST (1 Sep \u2192 30 Sep 2026)', titleHi: '\u0967 \u092E\u0939\u093F\u0928\u093E \u092D\u0935\u093F\u0937\u094D\u092F\u0935\u093E\u0923\u0940', accentColor: [30, 64, 175],
        headers: ['Week', 'Energy', 'Expected Events', '\u26A0\uFE0F CAUTION', '\uD83D\uDCA1 ACTION TIP'],
        rows: WEEKLY_FORECAST.map(w => [w.week, w.energy, w.events, w.caution, w.tip]) },
      { title: '\uD83D\uDD34 5 NON-NEGOTIABLE LIFE RULES (1st Month & Beyond USA)', titleHi: '\u0965 \u0928\u093F\u092F\u092E', accentColor: [153, 27, 27],
        headers: ['#', 'Rule', 'Why it Matters'],
        rows: FIVE_RULES.map(r => [r.n.toString(), r.rule, r.why]) },
      { title: '\u2705 PRINT & CARRY \u2014 JOINING DAY 15-POINT CHECKLIST', titleHi: '\u091A\u0947\u0915\u0932\u093F\u0938\u094D\u091F', accentColor: [22, 101, 52],
        headers: ['#', 'Item / Ritual'],
        rows: CHECKLIST_ITEMS.map((item, i) => [(i+1).toString(), item]) },
    ],
  };
}

function generateVedicGaneshPDF(config, outputPath) {
  const theme = config.theme ?? 'premium';
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = 210;
  const pageH = 297;
  const margin = 14;
  const contentW = pageW - margin * 2;
  const contentX = margin;
  const accent = theme === 'classic' ? [153, 27, 27] : theme === 'royal' ? [146, 64, 14] : [120, 53, 15];
  const gold = [250, 204, 21];
  const blessing = config.footerBlessing ?? '\u096A \u0936\u094D\u0930\u0940 \u0917\u0923\u0947\u0936\u093E\u092F \u0928\u092E\u0903 \u0950 \u0935\u0915\u094D\u0930\u0924\u0941\u0923\u094D\u0921 \u092E\u0939\u093E\u0915\u093E\u092F \u0938\u0942\u0930\u094D\u092F\u0915\u094B\u091F\u093F \u0938\u092E\u092A\u094D\u0930\u092D\u0903\u0964 \u0928\u093F\u0930\u094D\u0935\u093F\u0918\u094D\u0928\u0902 \u0915\u0941\u0930\u0941 \u092E\u0947 \u0926\u0947\u0935 \u0938\u0930\u094D\u0935\u0915\u093E\u0930\u094D\u092F\u0947\u0937\u0941 \u0938\u0930\u094D\u0935\u0926\u093E\u0964\u096A';

  drawDecorativeBorder(doc, pageW, pageH, theme);
  drawWatermark(doc, pageW, pageH);
  let y = drawGaneshHeader(doc, pageW, theme);

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

  const subjectBox = renderSubjectInfoBox(doc, config.subjectInfo, contentX, y, contentW);
  y = subjectBox.endY + 4;

  for (const section of config.sections) {
    if (y > pageH - 50) {
      doc.addPage();
      drawDecorativeBorder(doc, pageW, pageH, theme);
      drawWatermark(doc, pageW, pageH);
      y = 15;
    }
    section._themeOverride = theme;
    const end = renderSection(doc, section, contentX, y, contentW, pageW, pageH);
    y = end.y + 3;
  }

  if (config.tables) {
    for (const table of config.tables) {
      if (y > pageH - 50) {
        doc.addPage();
        drawDecorativeBorder(doc, pageW, pageH, theme);
        drawWatermark(doc, pageW, pageH);
        y = 15;
      }
      const end = renderTable(doc, table, contentX, y, contentW, pageW, pageH);
      y = end.endY + 3;
    }
  }

  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    renderFooter(doc, pageW, pageH, blessing, i, total);
  }

  const buffer = doc.output('arraybuffer');
  const uint8 = new Uint8Array(buffer);
  writeFileSync(outputPath, uint8);
  return { outputPath, pages: total, bytes: uint8.byteLength };
}

const config = buildPDFConfig();
const result = generateVedicGaneshPDF(config, OUTPUT_PATH);

console.log('='.repeat(72));
console.log('  PRIYANSH JOINING MUHURAT \u2014 GANESH MOTIF A4 PDF GENERATED');
console.log('='.repeat(72));
console.log(`  Output:    ${result.outputPath}`);
console.log(`  Pages:     ${result.pages} A4`);
console.log(`  Size:      ${(result.bytes / 1024).toFixed(2)} KB`);
console.log(`  Filename:  ${config.filename}`);
console.log(`  Theme:     ${config.theme}`);
console.log(`  Sections:  ${config.sections.length} (${config.sections.map(s => s.title.split(' ')[0]).join(', ')})`);
console.log(`  Tables:    ${config.tables?.length ?? 0}`);
console.log('='.repeat(72));
console.log('  PDF saved to local repository at: output/PRIYANSH_JOINING_MUHURAT_GANESH_REPORT.pdf');
console.log('  Includes: Lord Ganesha geometric header, Om/Swastika/Kalash/Trishul');
console.log('            corner motifs, page watermarks, saffron borders, all 8 analysis');
console.log('            sections, 4 autoTables (hourly slots, 1-month forecast, 5 rules,');
console.log('            15-point checklist).');
console.log('='.repeat(72));
