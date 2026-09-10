/**
 * PDF Font Utilities
 * 
 * Handles font embedding for jsPDF to support Devanagari (Hindi) characters.
 * Uses Noto Sans Devanagari font from @fontsource package.
 */

import { jsPDF } from 'jspdf';

// Font face names for jsPDF
export const DEVANAGARI_FONT_NAME = 'NotoSansDevanagari';
export const DEVANAGARI_FONT_BOLD_NAME = 'NotoSansDevanagari-Bold';

/**
 * Convert base64 font data to ArrayBuffer for jsPDF
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Load and embed Devanagari font into jsPDF document
 * This function should be called before adding any Hindi text to the PDF
 * 
 * Implementation: Uses CDN-hosted TTF version of Noto Sans Devanagari
 * Fetched dynamically and embedded into the PDF document
 * 
 * Enhanced Week 04: Better error handling, fallback support, and font loading optimization
 */
export async function embedDevanagariFont(doc: jsPDF): Promise<boolean> {
  try {
    // Use GitHub raw content as CDN for Noto Sans Devanagari (TTF format)
    // This is more reliable than Google Fonts CDN for Node.js environments
    const fontUrl = 'https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansDevanagari/NotoSansDevanagari-Regular.ttf';
    const fontBoldUrl = 'https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansDevanagari/NotoSansDevanagari-Bold.ttf';
    
    // Fetch regular font with timeout
    const fetchWithTimeout = (url: string, timeoutMs: number): Promise<Response> => {
      return Promise.race([
        fetch(url),
        new Promise<Response>((_, reject) => 
          setTimeout(() => reject(new Error('Font fetch timeout')), timeoutMs)
        )
      ]);
    };
    
    const fontResponse = await fetchWithTimeout(fontUrl, 10000);
    
    if (!fontResponse.ok) {
      throw new Error(`Failed to fetch font: ${fontResponse.status}`);
    }
    const fontArrayBuffer = await fontResponse.arrayBuffer();
    
    // Fetch bold font with timeout
    const boldFontResponse = await fetchWithTimeout(fontBoldUrl, 10000);
    
    if (!boldFontResponse.ok) {
      throw new Error(`Failed to fetch bold font: ${boldFontResponse.status}`);
    }
    const boldFontArrayBuffer = await boldFontResponse.arrayBuffer();
    
    // Convert to base64 for jsPDF
    const fontBase64 = arrayBufferToBase64(fontArrayBuffer);
    const boldFontBase64 = arrayBufferToBase64(boldFontArrayBuffer);
    
    // Add fonts to jsPDF virtual file system
    doc.addFileToVFS('NotoSansDevanagari.ttf', fontBase64);
    doc.addFileToVFS('NotoSansDevanagari-Bold.ttf', boldFontBase64);
    
    // Register fonts with jsPDF (only normal and bold, no italic support)
    doc.addFont('NotoSansDevanagari.ttf', 'NotoSansDevanagari', 'normal');
    doc.addFont('NotoSansDevanagari-Bold.ttf', 'NotoSansDevanagari', 'bold');
    
    console.log('Devanagari fonts embedded successfully');
    return true;
  } catch (error) {
    console.error('Failed to load Devanagari font:', error);
    return false;
  }
}

/**
 * Convert ArrayBuffer to Base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Improved text sanitization that preserves Devanagari when font is available
 * Falls back to safe Latin-1 characters when font is not embedded
 */
export function sanitizePDFText(
  text: string, 
  hasDevanagariFont: boolean = false
): string {
  if (!text) return '';
  
  if (hasDevanagariFont) {
    // If Devanagari font is embedded, preserve all characters
    return text;
  }
  
  // Fallback: strip Devanagari and use safe characters only
  let out = '';
  for (const ch of String(text)) {
    const cp = ch.codePointAt(0) ?? 0;
    // Keep Latin-1, basic punctuation, and common symbols
    if (cp <= 0xFF || ch === '|' || ch === '•' || ch === '-' || ch === '±') {
      out += ch;
    }
  }
  return out.replace(/\s+/g, ' ').trim();
}

/**
 * Check if text contains Devanagari characters
 */
export function containsDevanagari(text: string): boolean {
  return /[\u0900-\u097F]/.test(text);
}

/**
 * Strip Devanagari characters (for fallback mode)
 */
export function stripDevanagari(text: string): string {
  if (!text) return '';
  return String(text).replace(/[\u0900-\u097F]/g, '').trim();
}

/**
 * Text measurement helper considering font availability
 */
export function measureTextWidth(
  doc: jsPDF, 
  text: string, 
  fontSize: number,
  hasDevanagariFont: boolean = false
): number {
  const safeText = hasDevanagariFont ? text : sanitizePDFText(text, false);
  doc.setFontSize(fontSize);
  return doc.getTextWidth(safeText);
}

/**
 * Smart text wrapper that handles bilingual content
 */
export function wrapBilingualText(
  doc: jsPDF,
  englishText: string,
  hindiText: string,
  maxWidth: number,
  fontSize: number,
  hasDevanagariFont: boolean = false
): { enLines: string[]; hiLines: string[] } {
  const safeEn = sanitizePDFText(englishText, hasDevanagariFont);
  const safeHi = hasDevanagariFont ? hindiText : stripDevanagari(hindiText);
  
  doc.setFontSize(fontSize);
  
  const enLines = doc.splitTextToSize(safeEn, maxWidth);
  const hiLines = safeHi ? doc.splitTextToSize(safeHi, maxWidth) : [];
  
  return { enLines, hiLines };
}