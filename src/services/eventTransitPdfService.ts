/**
 * src/services/eventTransitPdfService.ts
 * PDF export for the Event Transit Analysis report (4-section layout).
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { PrognosisReport } from './eventTransitAnalysisService';

export function exportEventTransitPDF(report: PrognosisReport, lang: 'en' | 'hi' = 'en'): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const isHi = lang === 'hi';
  const W = doc.internal.pageSize.getWidth();
  const addHeader = (title: string) => {
    doc.setFillColor(67, 56, 202);
    doc.rect(0, 0, W, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, W / 2, 14, { align: 'center' });
    doc.setTextColor(0, 0, 0);
  };

  // ── PAGE 1: Cover ──────────────────────────────────────────────────────────
  addHeader(isHi ? 'घटना गोचर विश्लेषण रिपोर्ट' : 'Event Transit Analysis Report');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(report.profile.name, W / 2, 34, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`DOB: ${report.profile.birthDate}  |  ${report.profile.birthTime}  |  Moon: ${['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'][report.profile.moonRashiIndex]}`, W / 2, 40, { align: 'center' });
  doc.text(`Event: ${report.event.eventDate} ${report.event.eventTime}  |  ${report.event.eventLocation}`, W / 2, 46, { align: 'center' });
  doc.text(`Domain: ${report.event.domainLabel ?? report.event.eventType}`, W / 2, 52, { align: 'center' });

  // Scores table
  autoTable(doc, {
    head: [[isHi ? 'मापदंड' : 'Metric', isHi ? 'स्कोर' : 'Score', isHi ? 'विवरण' : 'Detail']],
    body: report.scores.map(s => [isHi ? s.labelHi : s.label, `${s.score}/100`, s.detail]),
    startY: 60,
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    headStyles: { fillColor: [67, 56, 202], textColor: [255, 255, 255] },
    columnStyles: { 0: { cellWidth: 55, fontStyle: 'bold' }, 1: { cellWidth: 22, halign: 'center' }, 2: { cellWidth: 'auto' } },
  });

  let y: number = (doc as any).lastAutoTable.finalY + 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`${isHi ? 'समग्र स्कोर' : 'Overall Score'}: ${report.overallScore}/100`, 14, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const verdictLines = doc.splitTextToSize(isHi ? report.verdictHi : report.verdict, W - 28);
  doc.text(verdictLines, 14, y);
  y += verdictLines.length * 4.5 + 6;

  // Muhurta
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`${isHi ? 'मुहूर्त' : 'Muhurta'}: ${report.muhurtaDetails.weekday}, ${report.muhurtaDetails.hora} — ${report.muhurtaDetails.quality.toUpperCase()}`, 14, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  report.muhurtaDetails.notes.forEach(n => {
    const lines = doc.splitTextToSize(`• ${n}`, W - 28);
    doc.text(lines, 14, y);
    y += lines.length * 4 + 1;
  });

  // Dasha
  y += 3;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`${isHi ? 'दशा' : 'Dasha'}: ${report.dashaState.mahadasha} MD → ${report.dashaState.antardasha} AD → ${report.dashaState.pratyantardasha} PD`, 14, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const dashaLines = doc.splitTextToSize(report.dashaState.dashaInterpretation, W - 28);
  doc.text(dashaLines, 14, y);

  // ── PAGE 2: Natal Chart ────────────────────────────────────────────────────
  doc.addPage();
  addHeader(isHi ? 'जन्म कुंडली — ग्रह स्थिति' : 'Natal Chart — Planetary Positions');

  autoTable(doc, {
    head: [['Planet', 'Rashi', 'H/Lagna', 'H/Moon', 'Dignity', 'Str%', 'Career Role']],
    body: report.natalPlanets.map(p => [
      `${p.symbol} ${p.planet}`, p.rashiName,
      p.houseFromLagna, p.houseFromMoon, p.dignity, `${p.strength}%`, p.careerRelevance,
    ]),
    startY: 26,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [67, 56, 202], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 22, fontStyle: 'bold' }, 1: { cellWidth: 24 },
      2: { cellWidth: 18, halign: 'center' }, 3: { cellWidth: 18, halign: 'center' },
      4: { cellWidth: 22 }, 5: { cellWidth: 16, halign: 'center' }, 6: { cellWidth: 'auto' },
    },
  });

  // Career Yogas
  const yogaY: number = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(isHi ? 'कैरियर योग' : 'Career Yogas', 14, yogaY);

  autoTable(doc, {
    head: [['Yoga', 'Active', 'Strength', 'Description']],
    body: report.careerYogas.map(y => [y.name, y.active ? '✅ Yes' : '○ No', y.active ? `${y.strength}%` : '—', y.description]),
    startY: yogaY + 5,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [88, 28, 135], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' }, 1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 22, halign: 'center' }, 3: { cellWidth: 'auto' },
    },
  });

  // ── PAGE 3: Transits ───────────────────────────────────────────────────────
  doc.addPage();
  addHeader(isHi ? `गोचर — ${report.event.eventDate} ${report.event.eventTime}` : `Transits — ${report.event.eventDate} ${report.event.eventTime}`);

  autoTable(doc, {
    head: [['Planet', 'Transit Rashi', 'H/Moon', 'Vedha', 'Status', 'Strength', 'Interpretation']],
    body: [...report.transitPlanets]
      .sort((a, b) => b.strength - a.strength)
      .map(t => [
        `${t.symbol} ${t.planet}`, t.transitRashiName, t.houseFromMoon,
        t.vedhaNote !== 'None' ? t.vedhaNote : '—',
        t.status, `${t.strength}%`, t.interpretation,
      ]),
    startY: 26,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [67, 56, 202], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 22, fontStyle: 'bold' }, 1: { cellWidth: 28 },
      2: { cellWidth: 16, halign: 'center' }, 3: { cellWidth: 22 },
      4: { cellWidth: 22, halign: 'center' }, 5: { cellWidth: 18, halign: 'center' },
      6: { cellWidth: 'auto' },
    },
    didParseCell(info) {
      if (info.column.index === 4 && info.section === 'body') {
        const s = info.cell.text[0];
        info.cell.styles.textColor = s === 'favorable' ? [22, 163, 74] : s === 'mixed' ? [217, 119, 6] : [220, 38, 38];
        info.cell.styles.fontStyle = 'bold';
      }
    },
  });

  // ── PAGE 4: Guidance ───────────────────────────────────────────────────────
  doc.addPage();
  addHeader(isHi ? 'मार्गदर्शन' : 'Guidance');

  let gy = 28;
  report.guidanceSections.forEach(section => {
    if (gy > 260) { doc.addPage(); addHeader(isHi ? 'मार्गदर्शन (जारी)' : 'Guidance (cont.)'); gy = 28; }
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(240, 237, 255);
    doc.rect(12, gy - 4, W - 24, 7, 'F');
    doc.text(isHi ? section.titleHi : section.title, 14, gy);
    gy += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    section.points.forEach(pt => {
      const lines = doc.splitTextToSize(`• ${pt}`, W - 28);
      if (gy + lines.length * 4 > 275) { doc.addPage(); addHeader(isHi ? 'मार्गदर्शन (जारी)' : 'Guidance (cont.)'); gy = 28; }
      doc.text(lines, 14, gy);
      gy += lines.length * 4 + 1.5;
    });
    gy += 4;
  });

  // ── Footer on all pages ────────────────────────────────────────────────────
  const pageCount: number = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(`Page ${i}/${pageCount} — Generated ${new Date().toLocaleString()} — Vedic Rajkumar App`, W / 2, 290, { align: 'center' });
    doc.setTextColor(0, 0, 0);
  }

  const fname = `EventTransit_${report.profile.name.replace(/\s+/g, '_')}_${report.event.eventDate}.pdf`;
  doc.save(fname);
}
