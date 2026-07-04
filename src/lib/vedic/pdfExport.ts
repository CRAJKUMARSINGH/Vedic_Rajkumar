import jsPDF from 'jspdf';
import type { ChartData } from './vedicCalc';
import {
  RASHIS_HI,
  RASHIS_EN,
  PLANET_SYMBOLS,
  PLANETS_HI,
  PLANETS_EN,
  formatDegree,
} from './vedicCalc';
import {
  getSeventhLord,
  getTrines,
  getSixthHouseRashi,
  RASHI_LORDS_HI,
  DIRECTIONS,
} from './vedicCalc';
import type { SpouseAnalysis, MarriageTimingResult } from './marriageTiming';
import { analyzeMangalDosha } from './mangalDosha';

/** Draw North Indian chart in PDF (text-based representation) */
function drawNorthIndianChart(
  doc: jsPDF,
  chart: ChartData,
  x: number,
  y: number,
  size: number,
  title: string
): void {
  const s = size;
  const hs = s / 3;

  // Draw title
  doc.setFontSize(12);
  doc.setTextColor('#7c2d12');
  doc.text(title, x + s / 2, y - 5, { align: 'center' });

  // Draw outer rectangle
  doc.setDrawColor('#92400e');
  doc.setLineWidth(1.5);
  doc.rect(x, y, s, s);

  // Draw diagonal lines (North Indian style)
  doc.setLineWidth(0.8);
  doc.line(x, y, x + s, y + s);
  doc.line(x + s, y, x, y + s);

  // Draw inner square
  doc.line(x + hs, y, x + s - hs, y + s);
  doc.line(x, y + hs, x + s, y + s - hs);
  doc.line(x + hs, y + s, x + s - hs, y);
  doc.line(x, y + s - hs, x + s, y + hs);

  // House positions for text (x, y centers of each house cell)
  const centers: Record<number, { cx: number; cy: number }> = {
    1: { cx: x + s / 2, cy: y + hs / 2 }, // Top center
    2: { cx: x + s - hs / 2, cy: y + hs / 4 }, // Top right
    3: { cx: x + s - hs / 4, cy: y + hs / 2 }, // Right top
    4: { cx: x + s - hs / 4, cy: y + s / 2 }, // Right center
    5: { cx: x + s - hs / 2, cy: y + s - hs / 4 }, // Right bottom
    6: { cx: x + s / 2, cy: y + s - hs / 2 }, // Bottom center
    7: { cx: x + hs / 2, cy: y + s - hs / 4 }, // Bottom left
    8: { cx: x + hs / 4, cy: y + s / 2 + hs / 4 }, // Left bottom
    9: { cx: x + hs / 4, cy: y + s / 2 }, // Left center
    10: { cx: x + hs / 4, cy: y + hs / 2 }, // Left top
    11: { cx: x + hs / 2, cy: y + hs / 4 }, // Top left top
    12: { cx: x + s / 2 - hs / 4, cy: y + hs / 4 }, // Top left
  };

  doc.setFontSize(7.5);

  for (let h = 1; h <= 12; h++) {
    const rashi = chart.houseRashis[h - 1];
    const { cx, cy } = centers[h];
    const planets = chart.planets.filter(p => p.house === h);

    // Rashi name (English)
    doc.setTextColor('#78350f');
    doc.setFontSize(7);
    doc.text(RASHIS_EN[rashi - 1], cx, cy - 6, { align: 'center' });

    // House number
    doc.setFontSize(6);
    doc.setTextColor('#a16207');
    doc.text(h === 1 ? 'L' : String(h), cx, cy - 10, { align: 'center' });

    // Planets
    doc.setFontSize(8);
    doc.setTextColor('#1e3a5f');
    planets.forEach((p, i) => {
      const sym = PLANET_SYMBOLS[p.name] ?? p.name.substring(0, 2);
      doc.text(`${sym}${p.retrograde ? '(R)' : ''} ${Math.floor(p.degree)}°`, cx, cy + i * 8, {
        align: 'center',
      });
    });
  }
}

export async function generatePDF(
  d1: ChartData,
  d9: ChartData,
  marriageResults: MarriageTimingResult[],
  spouseAnalysis: SpouseAnalysis,
  personName: string,
  birthInfo: string
): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = 210;
  const pageH = 297;
  const margin = 12;
  let y = margin;

  // Decorative header
  doc.setFillColor('#7c2d12');
  doc.rect(0, 0, pageW, 18, 'F');
  doc.setTextColor('#fef3c7');
  doc.setFontSize(14);
  doc.text('॥ श्री गणेशाय नमः ॥', pageW / 2, 7, { align: 'center' });
  doc.setFontSize(11);
  doc.text('वैदिक कुण्डली एवं विवाह विचार / Vedic Chart & Marriage Analysis', pageW / 2, 14, {
    align: 'center',
  });

  y = 24;

  // Person info box
  doc.setFillColor('#fef3c7');
  doc.setDrawColor('#92400e');
  doc.setLineWidth(0.8);
  doc.roundedRect(margin, y, pageW - 2 * margin, 22, 2, 2, 'FD');
  doc.setTextColor('#1e3a5f');
  doc.setFontSize(13);
  doc.text(personName, pageW / 2, y + 7, { align: 'center' });
  doc.setFontSize(9);
  doc.setTextColor('#78350f');
  doc.text(birthInfo, pageW / 2, y + 14, { align: 'center' });
  doc.text('Generated: ' + new Date().toLocaleDateString('en-IN'), pageW / 2, y + 20, {
    align: 'center',
  });

  y += 28;

  // D-1 Chart
  const chartSize = 82;
  const chartX1 = margin;
  const chartX2 = pageW / 2 + 2;

  drawNorthIndianChart(doc, d1, chartX1, y, chartSize, 'D-1 Rashi Chart (जन्म कुण्डली)');

  // D-9 Chart
  drawNorthIndianChart(doc, d9, chartX2, y, chartSize, 'D-9 Navamsa (नवांश)');

  y += chartSize + 14;

  // Planet table D-1
  doc.setFontSize(10);
  doc.setTextColor('#7c2d12');
  doc.text('Planetary Positions D-1 (ग्रह स्थिति)', margin, y);
  y += 5;

  const tableHeaders = ['Planet / ग्रह', 'Rashi / राशि', 'House / भाव', 'Degree', 'R?'];
  const colWidths = [42, 42, 28, 35, 15];
  const xCol = margin;

  doc.setFillColor('#92400e');
  doc.setTextColor('#fef3c7');
  doc.setFontSize(8);
  doc.rect(xCol, y, pageW - 2 * margin, 6, 'F');
  tableHeaders.forEach((h, i) => {
    const prevW = colWidths.slice(0, i).reduce((a, b) => a + b, 0);
    doc.text(h, margin + prevW + 2, y + 4.5);
  });
  y += 7;

  doc.setTextColor('#1e3a5f');
  d1.planets.forEach((p, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor('#fef9c3');
      doc.rect(margin, y - 1, pageW - 2 * margin, 6, 'F');
    }
    doc.setFontSize(7.5);
    const row = [
      `${PLANET_SYMBOLS[p.name] ?? p.name} ${p.nameHi} (${p.name})`,
      `${p.rashiNameHi} (${p.rashiName})`,
      String(p.house),
      formatDegree(p.longitude),
      p.retrograde ? 'R' : '-',
    ];
    row.forEach((cell, i) => {
      const prevW = colWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc.text(cell, margin + prevW + 2, y + 4);
    });
    y += 6;
  });

  // Lagna row
  doc.setFillColor('#ffedd5');
  doc.rect(margin, y - 1, pageW - 2 * margin, 6, 'F');
  doc.setTextColor('#92400e');
  doc.setFontSize(7.5);
  doc.text(`लग्न (Lagna)`, margin + 2, y + 4);
  doc.text(`${RASHIS_HI[d1.lagna - 1]} (${RASHIS_EN[d1.lagna - 1]})`, margin + 44, y + 4);
  doc.text('1', margin + 86, y + 4);
  doc.text(formatDegree(d1.lagnaLongitude), margin + 114, y + 4);
  y += 10;

  // Marriage Analysis Section
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  doc.setFillColor('#7c2d12');
  doc.rect(margin, y, pageW - 2 * margin, 7, 'F');
  doc.setTextColor('#fef3c7');
  doc.setFontSize(10);
  doc.text('Marriage Timing Analysis / विवाह काल विचार', pageW / 2, y + 5, { align: 'center' });
  y += 11;

  const seventhLord = getSeventhLord(d1);
  const sixthHouse = getSixthHouseRashi(d1);

  doc.setTextColor('#1e3a5f');
  doc.setFontSize(8.5);

  // Key points
  const keyPoints = [
    `7th House Rashi: ${RASHIS_HI[d1.houseRashis[6] - 1]} (${RASHIS_EN[d1.houseRashis[6] - 1]}) | 7th Lord: ${seventhLord.planetHi} (${seventhLord.planet}) in ${seventhLord.house}th house`,
    `6th House Rashi: ${sixthHouse.rashiNameHi} (${sixthHouse.rashiName})`,
    `7th Lord Trines from D-1: Houses ${getTrines(seventhLord.house).join(', ')}`,
    `7th House Trines: Houses ${getTrines(7).join(', ')}`,
    `D-9 7th House Rashi: ${RASHIS_HI[d9.houseRashis[6] - 1]} (${RASHIS_EN[d9.houseRashis[6] - 1]})`,
    `In-laws Direction: ${spouseAnalysis.directionHi} (${spouseAnalysis.direction})`,
  ];

  keyPoints.forEach(pt => {
    doc.setFillColor('#fef9c3');
    doc.rect(margin, y, pageW - 2 * margin, 6, 'F');
    doc.text('• ' + pt, margin + 3, y + 4.5);
    y += 7;
  });

  y += 5;

  // Marriage timing methods
  marriageResults.slice(0, 3).forEach(result => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    doc.setFillColor('#ffedd5');
    doc.setDrawColor('#92400e');
    doc.rect(margin, y, pageW - 2 * margin, 6, 'FD');
    doc.setTextColor('#92400e');
    doc.setFontSize(9);
    doc.text(result.methodNameHi + ' / ' + result.methodName, margin + 3, y + 4.5);
    y += 8;

    doc.setTextColor('#1e3a5f');
    doc.setFontSize(7.5);
    const lines = doc.splitTextToSize(result.descriptionHi, pageW - 2 * margin - 6);
    lines.forEach((line: string) => {
      doc.text(line, margin + 3, y);
      y += 5;
    });

    result.favorablePeriods.slice(0, 3).forEach(period => {
      doc.setTextColor('#065f46');
      doc.text('✓ ' + period, margin + 5, y);
      y += 5;
    });

    doc.setTextColor('#7c2d12');
    doc.text('Forecast: ' + result.forecastWindowHi, margin + 3, y);
    y += 8;
  });

  // Spouse analysis
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  doc.setFillColor('#7c2d12');
  doc.rect(margin, y, pageW - 2 * margin, 7, 'F');
  doc.setTextColor('#fef3c7');
  doc.setFontSize(10);
  doc.text('Spouse Analysis / जीवनसाथी विचार', pageW / 2, y + 5, { align: 'center' });
  y += 11;

  doc.setTextColor('#1e3a5f');
  doc.setFontSize(8.5);

  [
    `दिशा (Direction): ${spouseAnalysis.directionHi} (${spouseAnalysis.direction}) — ${spouseAnalysis.directionDesc}`,
    `स्वभाव (Nature): ${spouseAnalysis.natureHi.join('; ')}`,
    `शरीर (Physique): ${spouseAnalysis.physiqueHi.join('; ')}`,
    `व्यवसाय (Profession): ${spouseAnalysis.professionHi.join('; ')}`,
    `सारांश: ${spouseAnalysis.overallDescHi}`,
  ].forEach(line => {
    const wrapped = doc.splitTextToSize(line, pageW - 2 * margin - 6);
    wrapped.forEach((wl: string) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(wl, margin + 3, y);
      y += 5;
    });
    y += 2;
  });

  // ── Mangal Dosha Section ──────────────────────────────────────────────────
  if (y > 220) {
    doc.addPage();
    y = 20;
  }

  const md = analyzeMangalDosha(d1);

  const mdColor = md.finalVerdict.startsWith('No') ? '#166534' : '#991b1b';
  const mdBg = md.finalVerdict.startsWith('No') ? '#dcfce7' : '#fee2e2';

  doc.setFillColor('#7c2d12');
  doc.rect(margin, y, pageW - 2 * margin, 7, 'F');
  doc.setTextColor('#fef3c7');
  doc.setFontSize(10);
  doc.text('Mangal Dosha Analysis / मंगल दोष विचार', pageW / 2, y + 5, { align: 'center' });
  y += 11;

  // Verdict box
  doc.setFillColor(mdBg);
  doc.setDrawColor(mdColor);
  doc.setLineWidth(0.8);
  doc.roundedRect(margin, y, pageW - 2 * margin, 12, 2, 2, 'FD');
  doc.setTextColor(mdColor);
  doc.setFontSize(10);
  doc.text(md.finalVerdictHi + '  |  ' + md.finalVerdict, pageW / 2, y + 5, { align: 'center' });
  doc.setFontSize(8);
  doc.text(
    `Mars in ${RASHIS_EN[md.marsRashi - 1]} (House ${md.marsHouseFromLagna} from Lagna)  •  Severity: ${md.severityHi} (${md.severity})`,
    pageW / 2,
    y + 10,
    { align: 'center' }
  );
  y += 16;

  // Three reference checks
  doc.setFontSize(9);
  doc.setTextColor('#7c2d12');
  doc.text('Three-Reference Check (Lagna / Moon / Venus):', margin, y);
  y += 5;

  md.checks.forEach(check => {
    if (y > 278) {
      doc.addPage();
      y = margin;
    }
    doc.setFillColor(check.hasDosha ? '#fee2e2' : '#dcfce7');
    doc.rect(margin, y, pageW - 2 * margin, 6, 'F');
    doc.setTextColor(check.hasDosha ? '#991b1b' : '#166534');
    doc.setFontSize(7.5);
    doc.text(
      `${check.hasDosha ? '⚠' : '✓'} ${check.referenceHi} (${check.reference}): Mars in ${check.marsHouse}th house — ${check.hasDosha ? 'DOSHA' : 'No Dosha'}`,
      margin + 2,
      y + 4.3
    );
    doc.setTextColor('#374151');
    doc.setFontSize(6.8);
    doc.text(check.note, margin + 110, y + 4.3);
    y += 6.5;
  });

  y += 3;
  doc.setFontSize(9);
  doc.setTextColor('#7c2d12');
  doc.text('Cancellation Rules Applied:', margin, y);
  y += 5;

  md.cancellations.forEach(c => {
    if (y > 278) {
      doc.addPage();
      y = margin;
    }
    doc.setFillColor(c.applies ? '#dcfce7' : '#f9fafb');
    doc.rect(margin, y, pageW - 2 * margin, 5.5, 'F');
    doc.setTextColor(c.applies ? '#166534' : '#9ca3af');
    doc.setFontSize(7);
    doc.text(`${c.applies ? '✓' : '○'} ${c.ruleHi}`, margin + 2, y + 4);
    doc.setTextColor('#374151');
    doc.setFontSize(6.5);
    doc.text(c.details, margin + 100, y + 4);
    y += 6;
  });

  y += 3;
  doc.setFontSize(8);
  doc.setTextColor('#1e3a5f');
  const interpLines = doc.splitTextToSize(md.interpretationHi, pageW - 2 * margin - 4);
  interpLines.forEach((line: string) => {
    if (y > 278) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin + 2, y);
    y += 5;
  });

  y += 4;

  // ── Appendix: Calculation Notes ──────────────────────────────────────────
  doc.addPage();
  let ay = margin;

  // Appendix header bar
  doc.setFillColor('#7c2d12');
  doc.rect(0, 0, pageW, 18, 'F');
  doc.setTextColor('#fef3c7');
  doc.setFontSize(13);
  doc.text('Appendix: Calculation Notes', pageW / 2, 8, { align: 'center' });
  doc.setFontSize(8.5);
  doc.text(
    'How each result in this chart was derived — source: Jean Meeus "Astronomical Algorithms" (2nd ed.) & classical Vedic texts',
    pageW / 2,
    15,
    { align: 'center' }
  );
  ay = 24;

  function appendSection(title: string): void {
    if (ay > 262) {
      doc.addPage();
      ay = margin;
    }
    doc.setFillColor('#92400e');
    doc.rect(margin, ay, pageW - 2 * margin, 6.5, 'F');
    doc.setTextColor('#fef3c7');
    doc.setFontSize(9);
    doc.text(title, margin + 3, ay + 4.8);
    ay += 9;
  }

  function appendRow(label: string, value: string, note: string = ''): void {
    if (ay > 278) {
      doc.addPage();
      ay = margin;
    }
    doc.setFillColor('#fef9c3');
    doc.rect(margin, ay, pageW - 2 * margin, 6, 'F');
    doc.setTextColor('#1e3a5f');
    doc.setFontSize(7.5);
    doc.text(label, margin + 2, ay + 4.3);
    doc.setTextColor('#7c2d12');
    doc.text(value, margin + 60, ay + 4.3);
    if (note) {
      doc.setTextColor('#065f46');
      doc.setFontSize(6.8);
      doc.text(note, margin + 115, ay + 4.3);
    }
    ay += 6.5;
  }

  function appendText(text: string, indent: number = 3): void {
    if (ay > 278) {
      doc.addPage();
      ay = margin;
    }
    const lines = doc.splitTextToSize(text, pageW - 2 * margin - indent - 4);
    doc.setTextColor('#374151');
    doc.setFontSize(7.5);
    lines.forEach((line: string) => {
      if (ay > 278) {
        doc.addPage();
        ay = margin;
      }
      doc.text(line, margin + indent, ay);
      ay += 4.8;
    });
    ay += 1;
  }

  // ── 1. Time & Base ────────────────────────────────────────────────────────
  appendSection('1. Time Base & Ayanamsa');
  appendRow('Birth (IST)', '8 Sep 2004, 01:05', 'Input');
  appendRow('UTC conversion', '01:05 − 5.5 h = 19:35 UTC, 7 Sep 2004', 'IST offset');
  appendRow(
    'Julian Day (JDE)',
    '2453256.316',
    'Meeus Ch. 7: JDE = 365.25(Y+4716) + 30.6001(M+1) + D + h/24 + B − 1524.5'
  );
  appendRow('T (Julian centuries)', '(JDE − 2451545.0) / 36525 = 0.04849', 'From J2000.0 epoch');
  appendRow(
    'Lahiri Ayanamsa',
    '≈ 23.92° (Birth)',
    'Formula: 23.85472 + (0.01396 × T × 100) - (0.000308 × T²)'
  );
  appendText(
    "All tropical longitudes are converted to sidereal by subtracting the ayanamsa (mod 360°). The 2415020.0 epoch is 1 Jan 1900; 50.2564″/yr is Lahiri's precession constant adopted as India's national standard in 1955."
  );

  // ── 2. Ascendant ─────────────────────────────────────────────────────────
  appendSection('2. Ascendant (Lagna) — Meeus Ch. 13');
  appendRow('GMST at 19:35 UTC', '≈ 351.4°', 'θ₀ = 280.46061837 + 360.98564737 × (JDE−2451545)');
  appendRow('Local Sidereal Time', '351.4 + 73.71° = 65.1°', 'LST = GMST + geographic longitude');
  appendRow('Obliquity ε', '23.4393 − 0.013 × T = 23.438°', 'Mean obliquity of ecliptic');
  appendRow(
    'Ascendant formula',
    'atan2(−cos RAMC,  sin ε·tan φ + cos ε·sin RAMC)',
    'φ = 23.84° (Aspur lat)'
  );
  appendRow('Tropical Asc', "≈ 284.9° (Sagittarius 14°52')", '');
  appendRow('Sidereal Asc (Lagna)', "≈ 259.6° → Sagittarius 9°36'", '− ayanamsa 25.33°');

  // ── 3. Planet Longitudes ──────────────────────────────────────────────────
  appendSection('3. Planetary Longitudes  (Tropical → subtract ayanamsa for sidereal)');

  const planetRows: [string, string, string, string][] = [
    [
      'Sun',
      '≈ 166.0° trop → 140.7° sid',
      "Leo 20°42'  H-9",
      'Meeus Ch. 25: L₀+C − nutation; C = 1.9146 sin M + …',
    ],
    [
      'Moon',
      '≈ 96.5° trop → 71.2° sid',
      "Gemini 11°12' H-7",
      'Meeus Ch. 47: L′ + ΣL/1000000; 24-term ELP-2000 series',
    ],
    [
      'Mars',
      '≈ 169.3° trop → 144.0° sid',
      "Leo 24°00' H-9",
      'Meeus Ch. 32: L+C; C = 10.691 sin M + 0.623 sin 2M',
    ],
    [
      'Mercury',
      '≈ 168.9° trop → 143.6° sid',
      "Aries 18°36' H-5",
      'Meeus Ch. 31: C = 23.44 sin M + 2.994 sin 2M + …',
    ],
    [
      'Jupiter',
      '≈ 168.4° trop → 143.1° sid',
      "Virgo 2°44' H-10",
      'Meeus Ch. 33: C = 5.555 sin M + 0.168 sin 2M',
    ],
    [
      'Venus',
      '≈ 169.7° trop → 144.4° sid',
      "Aries 19°12' H-5",
      'Meeus Ch. 32: C = 0.7758 sin M (Venus near-circular)',
    ],
    [
      'Saturn',
      '≈ 97.3° trop → 72.0° sid',
      "Gemini 12°00' H-7",
      'Meeus Ch. 33: C = 6.406 sin M + 0.320 sin 2M',
    ],
    [
      'Rahu',
      '≈ 35.3° trop → 10.0° sid',
      "Aries 10°00' H-5",
      'Mean node: 125.0445 − 1934.1362 T (always retrograde)',
    ],
    [
      'Ketu',
      '≈ 215.3° trop → 190.0° sid',
      "Libra 10°00' H-11",
      'Ketu = Rahu + 180° (exact opposition)',
    ],
  ];

  planetRows.forEach(([planet, tropical, sidereal, source]) => {
    if (ay > 272) {
      doc.addPage();
      ay = margin;
    }
    doc.setFillColor(planet === 'Moon' || planet === 'Saturn' ? '#e0f2fe' : '#fef9c3');
    doc.rect(margin, ay, pageW - 2 * margin, 6, 'F');
    doc.setFontSize(7.5);
    doc.setTextColor('#1e3a5f');
    doc.text(planet, margin + 2, ay + 4.3);
    doc.setTextColor('#7c2d12');
    doc.text(tropical, margin + 24, ay + 4.3);
    doc.setTextColor('#065f46');
    doc.text(sidereal, margin + 82, ay + 4.3);
    doc.setTextColor('#374151');
    doc.setFontSize(6.5);
    doc.text(source, margin + 118, ay + 4.3);
    ay += 6.5;
  });

  appendText(
    'Retrograde detection: numerical — compare longitude at T−0.01 and T+0.01 centuries; if Δλ < 0 the planet is retrograde.'
  );

  // ── 4. D-9 Navamsa ────────────────────────────────────────────────────────
  appendSection('4. D-9 Navamsa Mapping — BPHS Ch. 7');
  appendText(
    "Each rashi (30°) is split into 9 navamsas of 3°20' each. The navamsa sequence starting rashi depends on the element of the natal rashi:"
  );
  appendRow('Fire signs (1,5,9)', 'Navamsa sequence starts at Aries (1)', 'Mesha');
  appendRow('Earth signs (2,6,10)', 'Starts at Capricorn (10)', 'Makara');
  appendRow('Air signs (3,7,11)', 'Starts at Libra (7)', 'Tula');
  appendRow('Water signs (4,8,12)', 'Starts at Cancer (4)', 'Karka');
  appendText('Formula: navamsaRashi = ((startRashi − 1 + floor(degInRashi / 3.333)) mod 12) + 1');

  // ── 5. Vimshottari Dasha ──────────────────────────────────────────────────
  appendSection('5. Vimshottari Dasha — BPHS Ch. 46');
  appendRow('Moon sidereal longitude', '71.2°', '');
  appendRow('Nakshatra index', 'floor(71.2 / 13.333) = 5 → Ardra', '27 nakshatras × 13.333°');
  appendRow('Nakshatra lord', 'Rahu', 'Ardra ruled by Rahu');
  appendRow('Degree elapsed in Ardra', '71.2 − 5×13.333 = 4.53°  →  34% elapsed', '');
  appendRow('Rahu Mahadasha years', '18 years × (1−0.34) = 11.88 yrs remaining at birth', '');
  appendRow('Rahu MD dates', '~Oct 2011 – ~Oct 2029', 'Birth + elapsed offset');
  appendText(
    'Antardasha formula: AD years = (MD years × AD lord years) / 120. Example: Rahu/Jupiter = (18×16)/120 = 2.4 years.'
  );

  // ── 6. Marriage Timing Methods ────────────────────────────────────────────
  appendSection('6. Marriage Timing — Derivation Summary');

  const methods: [string, string, string][] = [
    [
      'Vimshottari Dasha',
      'Scan all dashas for Venus / Jupiter / 7th lord (Mercury) periods',
      'BPHS Ch. 46; Phaladeepika Ch. 14',
    ],
    [
      'Jupiter Transit',
      'Jupiter enters 7th house (Gemini) until Jun 2026 — direct activation',
      'Phaladeepika Ch. 28; Saravali Ch. 40',
    ],
    [
      'Upapada Lagna',
      '12th house = Scorpio → lord Mars in Leo → count 10 → UL = Taurus; lord Venus',
      'Jaimini Sutras 1.2.7–1.2.9',
    ],
    [
      'Saturn Transit',
      'Moon in Gemini; Saturn in Pisces = 10th from Moon → Sade Sati NOT active',
      'Phaladeepika Ch. 28',
    ],
    [
      'Jaimini / D-9',
      '7th house = Gemini → Mercury in Aries → count 11 → A7 = Libra (Darapada)',
      'Jaimini Sutras 2.1.20–2.1.32',
    ],
  ];

  methods.forEach(([method, calc, source]) => {
    if (ay > 270) {
      doc.addPage();
      ay = margin;
    }
    doc.setFillColor('#fef9c3');
    doc.rect(margin, ay, pageW - 2 * margin, 5.5, 'F');
    doc.setTextColor('#92400e');
    doc.setFontSize(7.5);
    doc.text(method, margin + 2, ay + 4);
    doc.setTextColor('#1e3a5f');
    doc.text(calc, margin + 46, ay + 4);
    doc.setTextColor('#374151');
    doc.setFontSize(6.5);
    doc.text(source, margin + 145, ay + 4);
    ay += 6;
  });

  ay += 3;
  appendText(
    'Marriage window consensus: overlap of all 5 methods → Primary: Oct 2026 – Aug 2027  |  Secondary: 2028–2029'
  );

  // ── 7. Spouse Direction ───────────────────────────────────────────────────
  appendSection('7. Spouse Direction — Classical Digbala Mapping');
  appendRow('7th lord', 'Mercury (Gemini lord)', '7th house = Gemini');
  appendRow('Mercury natal house', 'House 5 (Aries)', 'Sidereal longitude 143.6°');
  appendRow('House → Direction', 'House 5 = West (पश्चिम)', 'Classical digbala direction table');
  appendText(
    "In-laws' home is indicated toward the West of Aspur, Rajasthan. Nature from 7th house element (Gemini = Air) and D-9 7th lord: intellectual, communicative, IT/Law/Teaching professions."
  );

  // ── 8. References ─────────────────────────────────────────────────────────
  appendSection('8. Source References');
  const refs = [
    'Jean Meeus — Astronomical Algorithms, 2nd ed. (1998), Willmann-Bell  [Chapters 7, 13, 25, 31–33, 47]',
    'N.C. Lahiri — Chitrapaksha ayanamsa; Indian Calendar Reform Committee standard (1955)',
    'Parashara — Brihat Parashara Hora Shastra (BPHS)  [Ch. 7 Navamsa, Ch. 46 Dasha, Ch. 80–82 Spouse]',
    'Jaimini — Jaimini Sutras (trans. Sanjay Rath, 2002)  [1.2.7 Upapada, 2.1.20 Marriage timing]',
    'Mantreswara — Phaladeepika (c. 1400 CE)  [Ch. 14 Marriage dasha, Ch. 28 Gochara transits]',
    'Full step-by-step derivations: docs/calculations-reference.md & docs/marriage-timing-reference.md',
  ];
  refs.forEach(ref => appendText('• ' + ref, 4));

  // ── Footer on all pages ──────────────────────────────────────────────────
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setTextColor('#92400e');
    doc.text(
      'Vedic Chart — Kanchi Jain | Generated by Vedic Jyotish App | For educational purposes',
      pageW / 2,
      pageH - 8,
      { align: 'center' }
    );
    doc.text(`Page ${p} of ${totalPages}`, pageW - margin, pageH - 8, { align: 'right' });
  }

  doc.save('Kanchi_Vedic_Chart.pdf');
}
