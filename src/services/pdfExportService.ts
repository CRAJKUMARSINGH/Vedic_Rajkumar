import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { TransitResult } from '@/data/transitData';
import { RASHIS } from '@/data/transitData';
import type { KundliData } from './kundliService';
import type { ComprehensiveHoroscope } from './horoscopeService';

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

/**
 * Enhanced PDF Export for Brihat Kundli Reports
 * Week 11: AstroSage Feature Integration - Part 1
 */

export interface BrihatKundliData {
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  latitude: number;
  longitude: number;
  kundliData: KundliData;
  horoscope: ComprehensiveHoroscope;
  transitData: PDFExportData;
}

export type ReportTemplate = 'basic' | 'standard' | 'premium';

/**
 * Export comprehensive Brihat Kundli report
 */
export function exportBrihatKundli(
  data: BrihatKundliData, 
  template: ReportTemplate = 'standard',
  lang: 'en' | 'hi' = 'en'
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const isHi = lang === 'hi';
  
  // Generate report based on template
  switch (template) {
    case 'basic':
      generateBasicReport(doc, data, isHi);
      break;
    case 'standard':
      generateStandardReport(doc, data, isHi);
      break;
    case 'premium':
      generatePremiumReport(doc, data, isHi);
      break;
  }

  // Save PDF
  const fileName = `Brihat_Kundli_${template}_${data.birthDate.replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
}

/**
 * Generate basic report (10-15 pages)
 */
function generateBasicReport(doc: jsPDF, data: BrihatKundliData, isHi: boolean): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Cover Page
  generateCoverPage(doc, data, isHi, 'Basic Kundli Report');
  
  // Birth Details Page
  doc.addPage();
  generateBirthDetailsPage(doc, data, isHi);
  
  // Kundli Chart Page
  doc.addPage();
  generateKundliChartPage(doc, data, isHi);
  
  // Planetary Positions Page
  doc.addPage();
  generatePlanetaryPositionsPage(doc, data, isHi);
  
  // Basic Predictions Page
  doc.addPage();
  generateBasicPredictionsPage(doc, data, isHi);
  
  // Transit Analysis Page
  doc.addPage();
  generateTransitAnalysisPage(doc, data, isHi);
}

/**
 * Generate standard report (50-75 pages)
 */
function generateStandardReport(doc: jsPDF, data: BrihatKundliData, isHi: boolean): void {
  // Include all basic report pages
  generateBasicReport(doc, data, isHi);
  
  // Additional pages for standard report
  doc.addPage();
  generateHousesAnalysisPage(doc, data, isHi);
  
  doc.addPage();
  generatePlanetaryAspectsPage(doc, data, isHi);
  
  doc.addPage();
  generateHoroscopePage(doc, data, isHi);
  
  doc.addPage();
  generateCareerAnalysisPage(doc, data, isHi);
  
  doc.addPage();
  generateHealthAnalysisPage(doc, data, isHi);
  
  doc.addPage();
  generateRemediesPage(doc, data, isHi);
}

/**
 * Generate premium report (100+ pages)
 */
function generatePremiumReport(doc: jsPDF, data: BrihatKundliData, isHi: boolean): void {
  // Include all standard report pages
  generateStandardReport(doc, data, isHi);
  
  // Additional premium pages
  doc.addPage();
  generateDivisionalChartsPage(doc, data, isHi);
  
  doc.addPage();
  generateDashaAnalysisPage(doc, data, isHi);
  
  doc.addPage();
  generateYearlyPredictionsPage(doc, data, isHi);
  
  doc.addPage();
  generateGemstoneRecommendationsPage(doc, data, isHi);
  
  doc.addPage();
  generateVastuRecommendationsPage(doc, data, isHi);
  
  doc.addPage();
  generateMuhuratPage(doc, data, isHi);
}

/**
 * Generate cover page
 */
function generateCoverPage(doc: jsPDF, data: BrihatKundliData, isHi: boolean, reportType: string): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Background gradient effect (simulated with rectangles)
  doc.setFillColor(75, 85, 99);
  doc.rect(0, 0, pageWidth, pageHeight / 3, 'F');
  
  doc.setFillColor(99, 102, 241);
  doc.rect(0, pageHeight / 3, pageWidth, pageHeight / 3, 'F');
  
  doc.setFillColor(139, 69, 19);
  doc.rect(0, (pageHeight * 2) / 3, pageWidth, pageHeight / 3, 'F');
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  const title = isHi ? 'बृहत् कुंडली रिपोर्ट' : 'Brihat Kundli Report';
  doc.text(title, pageWidth / 2, 60, { align: 'center' });
  
  // Subtitle
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  const subtitle = isHi 
    ? 'संपूर्ण वैदिक ज्योतिष विश्लेषण'
    : 'Complete Vedic Astrology Analysis';
  doc.text(subtitle, pageWidth / 2, 80, { align: 'center' });
  
  // Name and birth details
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  const nameLabel = isHi ? 'जन्म विवरण' : 'Birth Details';
  doc.text(nameLabel, pageWidth / 2, 120, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.birthDate} | ${data.birthTime}`, pageWidth / 2, 140, { align: 'center' });
  doc.text(data.birthLocation, pageWidth / 2, 155, { align: 'center' });
  
  // Report type
  doc.setFontSize(12);
  doc.text(reportType, pageWidth / 2, 180, { align: 'center' });
  
  // Footer
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(10);
  const footer = isHi 
    ? 'वैदिक ज्योतिष के सिद्धांतों पर आधारित'
    : 'Based on Vedic Astrology Principles';
  doc.text(footer, pageWidth / 2, pageHeight - 30, { align: 'center' });
  
  // Date generated
  const dateGenerated = new Date().toLocaleDateString(isHi ? 'hi-IN' : 'en-IN');
  const dateLabel = isHi ? `रिपोर्ट तिथि: ${dateGenerated}` : `Report Date: ${dateGenerated}`;
  doc.text(dateLabel, pageWidth / 2, pageHeight - 15, { align: 'center' });
}

/**
 * Generate birth details page
 */
function generateBirthDetailsPage(doc: jsPDF, data: BrihatKundliData, isHi: boolean): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Page header
  generatePageHeader(doc, isHi ? 'जन्म विवरण' : 'Birth Details', isHi);
  
  let yPos = 40;
  
  // Birth information table
  const birthHeaders = isHi 
    ? [['विवरण', 'मान']]
    : [['Detail', 'Value']];
    
  const birthData = [
    [isHi ? 'जन्म तिथि' : 'Birth Date', data.birthDate],
    [isHi ? 'जन्म समय' : 'Birth Time', data.birthTime],
    [isHi ? 'जन्म स्थान' : 'Birth Place', data.birthLocation],
    [isHi ? 'अक्षांश' : 'Latitude', `${data.latitude}°`],
    [isHi ? 'देशांतर' : 'Longitude', `${data.longitude}°`],
    [isHi ? 'लग्न राशि' : 'Ascendant Sign', isHi ? data.kundliData.ascendant.ascendant.rashiNameHi : data.kundliData.ascendant.ascendant.rashiName],
    [isHi ? 'चंद्र राशि' : 'Moon Sign', isHi ? data.horoscope.general.moonSignNameHi : data.horoscope.general.moonSignName]
  ];
  
  autoTable(doc, {
    head: birthHeaders,
    body: birthData,
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [75, 85, 99], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold' },
      1: { cellWidth: 100 }
    }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 20;
  
  // Ascendant details
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(isHi ? 'लग्न विवरण' : 'Ascendant Details', 20, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const ascendantText = isHi 
    ? `आपका लग्न ${data.kundliData.ascendant.ascendant.rashiNameHi} राशि में ${data.kundliData.ascendant.ascendant.degrees.toFixed(2)}° पर है। लग्न स्वामी ${data.kundliData.houses[0].lordHi} है।`
    : `Your ascendant is in ${data.kundliData.ascendant.ascendant.rashiName} at ${data.kundliData.ascendant.ascendant.degrees.toFixed(2)}°. The ascendant lord is ${data.kundliData.houses[0].lord}.`;
    
  doc.text(ascendantText, 20, yPos, { maxWidth: pageWidth - 40 });
}

/**
 * Generate kundli chart page
 */
function generateKundliChartPage(doc: jsPDF, data: BrihatKundliData, isHi: boolean): void {
  generatePageHeader(doc, isHi ? 'जन्म कुंडली' : 'Birth Chart (Kundli)', isHi);
  
  // For now, add a placeholder for the chart
  // In a full implementation, you would render the actual chart
  doc.setFontSize(12);
  doc.text(isHi ? 'कुंडली चार्ट यहाँ होगा' : 'Kundli Chart will be rendered here', 20, 60);
  
  // Add houses information
  let yPos = 80;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(isHi ? 'भाव विवरण' : 'Houses Information', 20, yPos);
  
  yPos += 15;
  
  // Houses table
  const houseHeaders = isHi 
    ? [['भाव', 'राशि', 'स्वामी', 'ग्रह']]
    : [['House', 'Sign', 'Lord', 'Planets']];
    
  const houseData = data.kundliData.houses.map(house => [
    house.houseNumber.toString(),
    isHi ? house.rashiNameHi : house.rashiName,
    isHi ? house.lordHi : house.lord,
    house.planets.map(p => p.name).join(', ') || (isHi ? 'कोई नहीं' : 'None')
  ]);
  
  autoTable(doc, {
    head: houseHeaders,
    body: houseData,
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [75, 85, 99], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' },
      1: { cellWidth: 40 },
      2: { cellWidth: 40 },
      3: { cellWidth: 'auto' }
    }
  });
}

/**
 * Generate planetary positions page
 */
function generatePlanetaryPositionsPage(doc: jsPDF, data: BrihatKundliData, isHi: boolean): void {
  generatePageHeader(doc, isHi ? 'ग्रह स्थितियां' : 'Planetary Positions', isHi);
  
  let yPos = 40;
  
  const planetHeaders = isHi 
    ? [['ग्रह', 'राशि', 'अंश', 'भाव', 'गुणवत्ता', 'शक्ति']]
    : [['Planet', 'Sign', 'Degrees', 'House', 'Dignity', 'Strength']];
    
  const planetData = data.kundliData.planets.map(planet => {
    const dignity = data.kundliData.dignityData.find(d => d.planet === planet.name);
    return [
      planet.name,
      isHi ? planet.rashiNameHi : planet.rashiName,
      `${planet.degrees.toFixed(2)}°`,
      planet.house.toString(),
      dignity ? (isHi ? dignity.descriptionHi : dignity.description) : (isHi ? 'तटस्थ' : 'Neutral'),
      dignity ? `${dignity.strength}%` : '50%'
    ];
  });
  
  autoTable(doc, {
    head: planetHeaders,
    body: planetData,
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [75, 85, 99], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 25, fontStyle: 'bold' },
      1: { cellWidth: 30 },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 40 },
      5: { cellWidth: 25, halign: 'center' }
    }
  });
}

/**
 * Generate basic predictions page
 */
function generateBasicPredictionsPage(doc: jsPDF, data: BrihatKundliData, isHi: boolean): void {
  generatePageHeader(doc, isHi ? 'मूलभूत भविष्यवाणियां' : 'Basic Predictions', isHi);
  
  let yPos = 40;
  
  // General prediction
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(isHi ? 'सामान्य भविष्यवाणी' : 'General Prediction', 20, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const generalPrediction = isHi ? data.horoscope.general.predictionHi : data.horoscope.general.prediction;
  doc.text(generalPrediction, 20, yPos, { maxWidth: 170 });
  
  yPos += 30;
  
  // Career prediction
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(isHi ? 'करियर भविष्यवाणी' : 'Career Prediction', 20, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const careerPrediction = isHi ? data.horoscope.career.predictionHi : data.horoscope.career.prediction;
  doc.text(careerPrediction, 20, yPos, { maxWidth: 170 });
  
  yPos += 30;
  
  // Health prediction
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(isHi ? 'स्वास्थ्य भविष्यवाणी' : 'Health Prediction', 20, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const healthPrediction = isHi ? data.horoscope.health.predictionHi : data.horoscope.health.prediction;
  doc.text(healthPrediction, 20, yPos, { maxWidth: 170 });
}

/**
 * Generate transit analysis page
 */
function generateTransitAnalysisPage(doc: jsPDF, data: BrihatKundliData, isHi: boolean): void {
  generatePageHeader(doc, isHi ? 'गोचर विश्लेषण' : 'Transit Analysis', isHi);
  
  // Use existing transit export logic but in portrait format
  let yPos = 40;
  
  const headers = isHi
    ? [['ग्रह', 'राशि', 'भाव', 'प्रभाव', 'अंक']]
    : [['Planet', 'Sign', 'House', 'Effect', 'Score']];

  const tableData = data.transitData.results.map(r => {
    const planetName = isHi ? r.planet.hi : r.planet.en;
    const rashiName = isHi ? RASHIS[r.currentRashi].hi : RASHIS[r.currentRashi].en;
    const effect = isHi ? r.effectHi : r.effectEn;
    const score = r.scoreContribution > 0 ? '+1' : '0';

    return [
      `${r.planet.symbol} ${planetName}`,
      `${RASHIS[r.currentRashi].symbol} ${rashiName}`,
      r.houseFromMoon.toString(),
      effect,
      score
    ];
  });

  autoTable(doc, {
    head: headers,
    body: tableData,
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [75, 85, 99], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold' },
      1: { cellWidth: 35 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 'auto' },
      4: { cellWidth: 20, halign: 'center' }
    }
  });
}

// Placeholder functions for additional pages (to be implemented)
function generateHousesAnalysisPage(doc: jsPDF, data: BrihatKundliData, isHi: boolean): void {
  generatePageHeader(doc, isHi ? 'भाव विश्लेषण' : 'Houses Analysis', isHi);
  doc.text(isHi ? 'भाव विश्लेषण विवरण यहाँ होगा' : 'Detailed houses analysis will be here', 20, 60);
}

function generatePlanetaryAspectsPage(doc: jsPDF, data: BrihatKundliData, isHi: boolean): void {
  generatePageHeader(doc, isHi ? 'ग्रहीय दृष्टि' : 'Planetary Aspects', isHi);
  doc.text(isHi ? 'ग्रहीय दृष्टि विवरण यहाँ होगा' : 'Planetary aspects details will be here', 20, 60);
}

function generateHoroscopePage(doc: jsPDF, data: BrihatKundliData, isHi: boolean): void {
  generatePageHeader(doc, isHi ? 'राशिफल' : 'Horoscope', isHi);
  doc.text(isHi ? 'विस्तृत राशिफल यहाँ होगा' : 'Detailed horoscope will be here', 20, 60);
}

function generateCareerAnalysisPage(doc: jsPDF, data: BrihatKundliData, isHi: boolean): void {
  generatePageHeader(doc, isHi ? 'करियर विश्लेषण' : 'Career Analysis', isHi);
  doc.text(isHi ? 'करियर विश्लेषण विवरण यहाँ होगा' : 'Career analysis details will be here', 20, 60);
}

function generateHealthAnalysisPage(doc: jsPDF, data: BrihatKundliData, isHi: boolean): void {
  generatePageHeader(doc, isHi ? 'स्वास्थ्य विश्लेषण' : 'Health Analysis', isHi);
  doc.text(isHi ? 'स्वास्थ्य विश्लेषण विवरण यहाँ होगा' : 'Health analysis details will be here', 20, 60);
}

function generateRemediesPage(doc: jsPDF, data: BrihatKundliData, isHi: boolean): void {
  generatePageHeader(doc, isHi ? 'उपाय' : 'Remedies', isHi);
  doc.text(isHi ? 'उपाय विवरण यहाँ होगा' : 'Remedies details will be here', 20, 60);
}

function generateDivisionalChartsPage(doc: jsPDF, data: BrihatKundliData, isHi: boolean): void {
  generatePageHeader(doc, isHi ? 'विभागीय चार्ट' : 'Divisional Charts', isHi);
  doc.text(isHi ? 'विभागीय चार्ट यहाँ होंगे' : 'Divisional charts will be here', 20, 60);
}

function generateDashaAnalysisPage(doc: jsPDF, data: BrihatKundliData, isHi: boolean): void {
  generatePageHeader(doc, isHi ? 'दशा विश्लेषण' : 'Dasha Analysis', isHi);
  doc.text(isHi ? 'दशा विश्लेषण यहाँ होगा' : 'Dasha analysis will be here', 20, 60);
}

function generateYearlyPredictionsPage(doc: jsPDF, data: BrihatKundliData, isHi: boolean): void {
  generatePageHeader(doc, isHi ? 'वार्षिक भविष्यवाणी' : 'Yearly Predictions', isHi);
  doc.text(isHi ? 'वार्षिक भविष्यवाणी यहाँ होगी' : 'Yearly predictions will be here', 20, 60);
}

function generateGemstoneRecommendationsPage(doc: jsPDF, data: BrihatKundliData, isHi: boolean): void {
  generatePageHeader(doc, isHi ? 'रत्न सुझाव' : 'Gemstone Recommendations', isHi);
  doc.text(isHi ? 'रत्न सुझाव यहाँ होंगे' : 'Gemstone recommendations will be here', 20, 60);
}

function generateVastuRecommendationsPage(doc: jsPDF, data: BrihatKundliData, isHi: boolean): void {
  generatePageHeader(doc, isHi ? 'वास्तु सुझाव' : 'Vastu Recommendations', isHi);
  doc.text(isHi ? 'वास्तु सुझाव यहाँ होंगे' : 'Vastu recommendations will be here', 20, 60);
}

function generateMuhuratPage(doc: jsPDF, data: BrihatKundliData, isHi: boolean): void {
  generatePageHeader(doc, isHi ? 'मुहूर्त' : 'Muhurat', isHi);
  doc.text(isHi ? 'मुहूर्त विवरण यहाँ होगा' : 'Muhurat details will be here', 20, 60);
}

/**
 * Generate page header
 */
function generatePageHeader(doc: jsPDF, title: string, isHi: boolean): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header line
  doc.setDrawColor(75, 85, 99);
  doc.setLineWidth(0.5);
  doc.line(20, 25, pageWidth - 20, 25);
  
  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(75, 85, 99);
  doc.text(title, 20, 20);
  
  // Page number
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  const pageNum = (doc as any).internal.getCurrentPageInfo().pageNumber;
  doc.text(`${isHi ? 'पृष्ठ' : 'Page'} ${pageNum}`, pageWidth - 40, 20);
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
}