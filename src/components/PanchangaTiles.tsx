/**
 * src/components/PanchangaTiles.tsx
 *
 * Renders the 5 Panchanga elements (Tithi, Nakshatra, Yoga, Karana, Vara)
 * as coloured tiles from a computed Panchanga object.
 * Used in EventTransitAnalysisPanel → Prognosis tab.
 */

import React from 'react';
import type { Panchanga } from '@/services/vedicAstroEngine';

interface Props {
  panchanga: Panchanga;
  lang?: 'en' | 'hi';
}

const TITHI_HI: Record<string, string> = {
  Pratipada: 'प्रतिपदा', Dwitiya: 'द्वितीया', Tritiya: 'तृतीया', Chaturthi: 'चतुर्थी',
  Panchami: 'पंचमी', Shashthi: 'षष्ठी', Saptami: 'सप्तमी', Ashtami: 'अष्टमी',
  Navami: 'नवमी', Dashami: 'दशमी', Ekadashi: 'एकादशी', Dwadashi: 'द्वादशी',
  Trayodashi: 'त्रयोदशी', Chaturdashi: 'चतुर्दशी', Purnima: 'पूर्णिमा', Amavasya: 'अमावस्या',
};

const NAK_HI: Record<string, string> = {
  Ashwini: 'अश्विनी', Bharani: 'भरणी', Krittika: 'कृत्तिका', Rohini: 'रोहिणी',
  Mrigashira: 'मृगशिरा', Ardra: 'आर्द्रा', Punarvasu: 'पुनर्वसु', Pushya: 'पुष्य',
  Ashlesha: 'आश्लेषा', Magha: 'मघा', 'Purva Phalguni': 'पूर्व फाल्गुनी',
  'Uttara Phalguni': 'उत्तर फाल्गुनी', Hasta: 'हस्त', Chitra: 'चित्रा', Swati: 'स्वाती',
  Vishakha: 'विशाखा', Anuradha: 'अनुराधा', Jyeshtha: 'ज्येष्ठा', Mula: 'मूल',
  'Purva Ashadha': 'पूर्व आषाढ़', 'Uttara Ashadha': 'उत्तर आषाढ़', Shravana: 'श्रवण',
  Dhanishtha: 'धनिष्ठा', Shatabhisha: 'शतभिषा', 'Purva Bhadrapada': 'पूर्व भाद्रपद',
  'Uttara Bhadrapada': 'उत्तर भाद्रपद', Revati: 'रेवती',
};

const YOGA_HI: Record<string, string> = {
  Vishkambha: 'विष्कम्भ', Priti: 'प्रीति', Ayushman: 'आयुष्मान', Saubhagya: 'सौभाग्य',
  Shobhana: 'शोभन', Atiganda: 'अतिगण्ड', Sukarma: 'सुकर्म', Dhriti: 'धृति',
  Shula: 'शूल', Ganda: 'गण्ड', Vriddhi: 'वृद्धि', Dhruva: 'ध्रुव',
  Vyaghata: 'व्याघात', Harshana: 'हर्षण', Vajra: 'वज्र', Siddhi: 'सिद्धि',
  Vyatipata: 'व्यतीपात', Variyan: 'वरीयान', Parigha: 'परिघ', Shiva: 'शिव',
  Siddha: 'सिद्ध', Sadhya: 'साध्य', Shubha: 'शुभ', Shukla: 'शुक्ल',
  Brahma: 'ब्रह्म', Indra: 'इन्द्र', Vaidhriti: 'वैधृति',
};

const VARA_HI: Record<string, string> = {
  Sunday: 'रविवार', Monday: 'सोमवार', Tuesday: 'मंगलवार', Wednesday: 'बुधवार',
  Thursday: 'बृहस्पतिवार', Friday: 'शुक्रवार', Saturday: 'शनिवार',
};

interface Tile {
  label: string;
  labelHi: string;
  value: string;
  valueHi: string;
  sub?: string;
  auspicious: boolean;
}

export default function PanchangaTiles({ panchanga, lang = 'en' }: Props) {
  const isHi = lang === 'hi';

  const tiles: Tile[] = [
    {
      label: 'Tithi',
      labelHi: 'तिथि',
      value: `${panchanga.tithi.paksha} ${panchanga.tithi.name} (${panchanga.tithi.number})`,
      valueHi: `${panchanga.tithi.paksha === 'Shukla' ? 'शुक्ल' : 'कृष्ण'} ${TITHI_HI[panchanga.tithi.name] ?? panchanga.tithi.name}`,
      auspicious: panchanga.tithi.auspicious,
    },
    {
      label: 'Nakshatra',
      labelHi: 'नक्षत्र',
      value: panchanga.nakshatra.name,
      valueHi: NAK_HI[panchanga.nakshatra.name] ?? panchanga.nakshatra.name,
      sub: `Lord: ${panchanga.nakshatra.lord}`,
      auspicious: panchanga.nakshatra.auspicious,
    },
    {
      label: 'Yoga',
      labelHi: 'योग',
      value: panchanga.yoga.name,
      valueHi: YOGA_HI[panchanga.yoga.name] ?? panchanga.yoga.name,
      auspicious: panchanga.yoga.auspicious,
    },
    {
      label: 'Karana',
      labelHi: 'करण',
      value: panchanga.karana.name,
      valueHi: panchanga.karana.name,
      auspicious: panchanga.karana.auspicious,
    },
    {
      label: 'Vara (Weekday)',
      labelHi: 'वार',
      value: `${panchanga.vara.dayName} (${panchanga.vara.lord})`,
      valueHi: `${VARA_HI[panchanga.vara.dayName] ?? panchanga.vara.dayName}`,
      auspicious: panchanga.vara.auspicious,
    },
  ];

  const auspCount = panchanga.auspiciousCount;
  const auspLabel =
    auspCount >= 4 ? 'Excellent Panchanga' :
    auspCount >= 3 ? 'Good Panchanga' :
    auspCount >= 2 ? 'Mixed Panchanga' : 'Weak Panchanga';

  const auspColor =
    auspCount >= 4 ? 'text-emerald-700 dark:text-emerald-300' :
    auspCount >= 3 ? 'text-blue-700 dark:text-blue-300' :
    auspCount >= 2 ? 'text-amber-700 dark:text-amber-300' : 'text-rose-700 dark:text-rose-300';

  return (
    <div className="space-y-2">
      <div className={`text-xs font-semibold ${auspColor} mb-1`}>
        🕐 Panchanga — {auspCount}/5 auspicious · {auspLabel}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className={`rounded-lg p-2.5 border text-center ${
              tile.auspicious
                ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800'
                : 'border-rose-200 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-800'
            }`}
          >
            <div className={`text-[9px] font-semibold uppercase tracking-wider mb-1 ${
              tile.auspicious ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {isHi ? tile.labelHi : tile.label}
            </div>
            <div className="text-[11px] font-bold text-gray-800 dark:text-gray-100 leading-tight">
              {isHi ? tile.valueHi : tile.value}
            </div>
            {tile.sub && (
              <div className="text-[9px] text-muted-foreground mt-0.5">{tile.sub}</div>
            )}
            <div className={`text-[9px] mt-1 font-medium ${
              tile.auspicious ? 'text-emerald-600' : 'text-rose-500'
            }`}>
              {tile.auspicious ? '✓ Auspicious' : '✗ Caution'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
