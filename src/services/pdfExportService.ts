import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { TransitResult } from '@/data/transitData';
import { RASHIS } from '@/data/transitData';

interface PDFExportData {
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  latitude?: string;
  longitude?: string;
  moonRashi: string;
  transitDate: string;
  results: TransitResult[];
  overallScore: number;
}

export function exportTransitToPDF(data: PDFExportData, lang: 'en' | 'hi' = 'en'): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const isHi = lang === 'hi';
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  const title = isHi ? 'गोचर फल रिपोर्ट' : 'Gochar Phal Report';
  doc.text(title, pageWidth / 2, 15, { align: 'center' });

  // Subtitle
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const subtitle = isHi 
    ? 'वैदिक गोचर विश्लेषण • फलदीपिका एवं बृहत् पाराशर होरा शास्त्र'
    : 'Vedic Transit Analysis • Phaladeepika & Brihat Parashara Hora Shastra';
  doc.text(subtitle, pageWidth / 2, 21, { align: 'center' });

  // Birth Details
  doc.setFontSize(9);
  const birthInfo = isHi
    ? `जन्म विवरण: ${data.birthDate} | समय: ${data.birthTime} | स्थान: ${data.birthLocation}`
    : `Birth Details: ${data.birthDate} | Time: ${data.birthTime} | Place: ${data.birthLocation}`;
  doc.text(birthInfo, pageWidth / 2, 27, { align: 'center' });

  // Coordinates if available
  if (data.latitude && data.longitude) {
    const coordInfo = isHi
      ? `अक्षांश: ${data.latitude} | देशांतर: ${data.longitude} | चन्द्र राशि: ${data.moonRashi}`
      : `Lat: ${data.latitude} | Long: ${data.longitude} | Moon Sign: ${data.moonRashi}`;
    doc.text(coordInfo, pageWidth / 2, 32, { align: 'center' });
    
    const transitInfo = isHi
      ? `गोचर तिथि: ${data.transitDate}`
      : `Transit Date: ${data.transitDate}`;
    doc.text(transitInfo, pageWidth / 2, 37, { align: 'center' });
  } else {
    const moonInfo = isHi
      ? `चन्द्र राशि: ${data.moonRashi}`
      : `Moon Sign: ${data.moonRashi}`;
    doc.text(moonInfo, pageWidth / 2, 32, { align: 'center' });
    
    const transitInfo = isHi
      ? `गोचर तिथि: ${data.transitDate}`
      : `Transit Date: ${data.transitDate}`;
    doc.text(transitInfo, pageWidth / 2, 37, { align: 'center' });
  }

  // Prepare table data
  const headers = isHi
    ? [['ग्रह', 'वर्तमान राशि', 'भाव', 'मूल', 'वेध?', 'प्रभावी स्थिति', '+/-', 'अंक', 'मुख्य प्रभाव']]
    : [['Planet', 'Current Sign', 'House', 'Base', 'Vedha?', 'Effective Status', '+/-', 'Rating', 'Key Effect']];

  const tableData = data.results.map(r => {
    const planetName = isHi ? r.planet.hi : r.planet.en;
    const rashiName = isHi ? RASHIS[r.currentRashi].hi : RASHIS[r.currentRashi].en;
    const baseStatus = r.baseFavorable 
      ? (isHi ? 'शुभ' : 'Favorable')
      : (isHi ? 'अशुभ' : 'Unfavorable');
    const vedhaStatus = r.vedhaActive 
      ? (isHi ? 'हाँ' : 'Yes')
      : (isHi ? 'नहीं' : 'No');
    const effectiveStatus = r.effectiveStatus === 'favorable'
      ? (isHi ? 'शुभ' : 'Favorable')
      : r.effectiveStatus === 'mixed'
      ? (isHi ? 'वेध अवरोध' : 'Vedha Block')
      : (isHi ? 'अशुभ' : 'Unfavorable');
    const score = r.scoreContribution > 0 ? '+1' : '0';
    const effect = isHi ? r.effectHi : r.effectEn;

    return [
      `${r.planet.symbol} ${planetName}`,
      `${RASHIS[r.currentRashi].symbol} ${rashiName}`,
      r.houseFromMoon.toString(),
      baseStatus,
      vedhaStatus,
      effectiveStatus,
      score,
      `${r.rating}/9`,
      effect
    ];
  });

  // Generate table
  autoTable(doc, {
    head: headers,
    body: tableData,
    startY: data.latitude && data.longitude ? 43 : 38,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [75, 85, 99],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 25, fontStyle: 'bold' },
      1: { cellWidth: 28 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 22, halign: 'center' },
      4: { cellWidth: 15, halign: 'center' },
      5: { cellWidth: 25, halign: 'center' },
      6: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
      7: { cellWidth: 18, halign: 'center' },
      8: { cellWidth: 'auto' },
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    didParseCell: function(data) {
      // Color coding for effective status
      if (data.column.index === 5 && data.section === 'body') {
        const status = data.cell.text[0];
        if (status.includes('Favorable') || status.includes('शुभ')) {
          data.cell.styles.textColor = [34, 197, 94]; // green
          data.cell.styles.fontStyle = 'bold';
        } else if (status.includes('Unfavorable') || status.includes('अशुभ')) {
          data.cell.styles.textColor = [239, 68, 68]; // red
        } else {
          data.cell.styles.textColor = [234, 179, 8]; // yellow
        }
      }
      // Color coding for score
      if (data.column.index === 6 && data.section === 'body') {
        const score = data.cell.text[0];
        if (score === '+1') {
          data.cell.styles.textColor = [34, 197, 94]; // green
        } else {
          data.cell.styles.textColor = [156, 163, 175]; // gray
        }
      }
    }
  });

  // Overall Score Summary
  const finalY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  
  const scoreLabel = isHi ? 'समग्र स्कोर:' : 'Overall Score:';
  const scoreColor = data.overallScore >= 5 
    ? [34, 197, 94] 
    : data.overallScore >= 3 
    ? [234, 179, 8] 
    : [239, 68, 68];
  
  doc.text(scoreLabel, 20, finalY);
  doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.setFontSize(16);
  doc.text(`${data.overallScore}/9`, 60, finalY);
  
  // Summary text
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const summaryText = isHi
    ? `${data.overallScore} ग्रह शुभ स्थिति में (बिना वेध)। ${
        data.overallScore <= 2 
          ? 'सावधानी बरतें, आध्यात्मिक कार्य उपयुक्त।' 
          : data.overallScore <= 5 
          ? 'मिश्रित दिन, संतुलन बनाएं।' 
          : 'अनुकूल दिन, कार्य आगे बढ़ाएं।'
      }`
    : `${data.overallScore} planet(s) effectively favorable (without Vedha). ${
        data.overallScore <= 2 
          ? 'Exercise caution; spiritual activities recommended.' 
          : data.overallScore <= 5 
          ? 'Mixed day; maintain balance.' 
          : 'Favorable day; proceed with plans.'
      }`;
  doc.text(summaryText, 20, finalY + 7, { maxWidth: pageWidth - 40 });

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 10;
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  const disclaimer = isHi
    ? '⚠️ यह फलदीपिका व बृहत् पाराशर होरा शास्त्र पर आधारित सामान्य गोचर विश्लेषण है। व्यक्तिगत फल हेतु पूर्ण कुंडली विश्लेषण आवश्यक है।'
    : '⚠️ General transit analysis based on Phaladeepika & BPHS principles. For personalized results, full chart analysis is needed.';
  doc.text(disclaimer, pageWidth / 2, footerY, { align: 'center', maxWidth: pageWidth - 20 });

  // Save PDF
  const fileName = `Gochar_Phal_${data.birthDate.replace(/\//g, '-')}_${data.transitDate.replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
}
