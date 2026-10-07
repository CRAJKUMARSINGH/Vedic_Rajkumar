import { jsPDF } from 'jspdf';
import type { PractitionerProfile } from '../features/practitioner/types';

export const generatePractitionerPDF = async (
  chart: any,
  practitioner: PractitionerProfile
) => {
  const doc = new jsPDF();
  
  // Practitioner branding
  if (practitioner.logoUrl) {
    // Note: To add image properly we need base64 data url. 
    // Assuming logoUrl is accessible or already a data URL.
    try {
      doc.addImage(practitioner.logoUrl, 'PNG', 10, 10, 40, 40);
    } catch (e) {
      console.warn('Could not load practitioner logo for PDF', e);
    }
  }
  
  doc.setFontSize(20);
  doc.text(practitioner.businessName || practitioner.name, 60, 30);
  
  // Chart content
  doc.setFontSize(14);
  doc.text('Astrological Report', 10, 60);
  doc.setFontSize(10);
  doc.text(`Generated for: ${chart?.birthData?.name || 'Client'}`, 10, 70);
  
  // Disclaimer footer
  doc.setFontSize(8);
  const certificationText = practitioner.certification ? ` | ${practitioner.certification}` : '';
  doc.text(
    `Prepared by ${practitioner.name}${certificationText}\n` +
    'This report is for spiritual guidance only. Not a substitute for professional advice.',
    10,
    280
  );
  
  return doc.output('blob');
};
