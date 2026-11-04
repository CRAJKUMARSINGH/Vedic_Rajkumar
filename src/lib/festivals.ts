/**
 * festivals.ts — seasonal skin registry.
 *
 * One source of truth for every festival window, token set and copy block.
 * Adding a festival is a data edit, not a component edit.
 */

export type FestivalId = 'diwali' | 'navratri' | 'holi';

export interface FestivalSkin {
  id: FestivalId;
  /** ISO days, inclusive. */
  start: string;
  end: string;
  /** CSS custom properties applied to <html data-festival="..."> */
  tokens: Record<string, string>;
  copy: Record<'en' | 'hi' | 'hi-Latn', { title: string; sub: string }>;
  /** Ornament density: 0 none, 1 ribbon only, 2 full strip. */
  density: 0 | 1 | 2;
}

export const FESTIVALS: Record<FestivalId, FestivalSkin> = {
  diwali: {
    id: 'diwali',
    start: '2026-11-01',
    end: '2026-11-15',
    density: 2,
    tokens: {
      '--festival-gold': '#d99a2b',
      '--festival-flame': '#ffb347',
      '--festival-marigold': '#e8833a',
      '--festival-vermilion': '#c0392b',
    },
    copy: {
      en: { title: 'Shubh Deepavali', sub: 'Light over darkness — may this season favour your chart.' },
      hi: { title: 'शुभ दीपावली', sub: 'अंधकार पर प्रकाश — यह ऋतु आपकी कुंडली के अनुकूल हो।' },
      'hi-Latn': { title: 'Shubh Deepavali', sub: 'Andhkaar par prakaash — yah ritu aapki kundli ke anukool ho.' },
    },
  },
  navratri: {
    id: 'navratri',
    start: '2027-04-07',
    end: '2027-04-15',
    density: 1,
    tokens: {
      '--festival-gold': '#c2185b',
      '--festival-flame': '#ff7043',
      '--festival-marigold': '#8e24aa',
      '--festival-vermilion': '#ad1457',
    },
    copy: {
      en: { title: 'Shubh Navratri', sub: 'Nine nights of Shakti — a good window for beginnings.' },
      hi: { title: 'शुभ नवरात्रि', sub: 'शक्ति की नौ रातें — नई शुरुआत के लिए शुभ समय।' },
      'hi-Latn': { title: 'Shubh Navratri', sub: 'Shakti ki nau raatein — nayi shuruaat ke liye shubh samay.' },
    },
  },
  holi: {
    id: 'holi',
    start: '2027-03-20',
    end: '2027-03-24',
    density: 1,
    tokens: {
      '--festival-gold': '#00897b',
      '--festival-flame': '#fdd835',
      '--festival-marigold': '#d81b60',
      '--festival-vermilion': '#7b1fa2',
    },
    copy: {
      en: { title: 'Shubh Holi', sub: 'Colour and renewal — may the year turn bright.' },
      hi: { title: 'शुभ होली', sub: 'रंग और नवीनता — वर्ष मंगलमय हो।' },
      'hi-Latn': { title: 'Shubh Holi', sub: 'Rang aur navinta — varsh mangalmay ho.' },
    },
  },
};

// Festival days are Indian calendar days: the key is computed in Asia/Kolkata,
// never in the host timezone.
const IST_DAY = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' });
const dayKey = (d: Date): string => IST_DAY.format(d);

/** Active skin for a day, or `null`. At most one window may contain a day. */
export function activeFestival(now: Date = new Date()): FestivalSkin | null {
  const today = dayKey(now);
  for (const skin of Object.values(FESTIVALS)) {
    if (today >= skin.start && today <= skin.end) return skin;
  }
  return null;
}

export function applyFestivalTokens(skin: FestivalSkin, root: HTMLElement): () => void {
  const previous = new Map<string, string>();
  for (const [k, v] of Object.entries(skin.tokens)) {
    previous.set(k, root.style.getPropertyValue(k));
    root.style.setProperty(k, v);
  }
  root.dataset.festival = skin.id;
  return () => {
    for (const [k, v] of previous) {
      if (v) root.style.setProperty(k, v);
      else root.style.removeProperty(k);
    }
    delete root.dataset.festival;
  };
}
