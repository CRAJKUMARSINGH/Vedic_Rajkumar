/**
 * hinglish.ts — Roman Hindi (Hinglish / BCP-47 `hi-Latn`).
 *
 * Input:  normalizeQuestion() folds Roman Hindi onto the English tokens the
 *         Bhava classifier scores, so a Hinglish question lands in the same
 *         house as its English form.
 * Output: toRomanHindi() renders the existing `hi` strings in Latin script, so
 *         no second translation pass exists anywhere.
 *
 * Devanagari and English both pass through unchanged.
 */

export type ScriptKind = 'devanagari' | 'roman-hindi' | 'english';

const DEVANAGARI = /[\u0900-\u097F]/;
const isDev = (c: string | undefined): boolean => !!c && DEVANAGARI.test(c);

// ─── Devanagari → Latin ──────────────────────────────────────────────────────

const INDEPENDENT_VOWELS: Record<string, string> = {
  अ: 'a', आ: 'aa', इ: 'i', ई: 'i', उ: 'u', ऊ: 'u', ऋ: 'ri',
  ए: 'e', ऐ: 'ai', ओ: 'o', औ: 'au', ऍ: 'e', ऑ: 'o',
};

// Long vowels collapse to the short Latin letter: this is what people actually
// type, and matching the typed form matters more than phonetic precision.
const VOWEL_SIGNS: Record<string, string> = {
  'ा': 'aa', 'ि': 'i', 'ी': 'i', 'ु': 'u', 'ू': 'u', 'ृ': 'ri',
  'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ॅ': 'e', 'ॉ': 'o',
};

const CONSONANTS: Record<string, string> = {
  क: 'k', ख: 'kh', ग: 'g', घ: 'gh', ङ: 'n',
  च: 'ch', छ: 'chh', ज: 'j', झ: 'jh', ञ: 'n',
  ट: 't', ठ: 'th', ड: 'd', ढ: 'dh', ण: 'n',
  त: 't', थ: 'th', द: 'd', ध: 'dh', न: 'n',
  प: 'p', फ: 'ph', ब: 'b', भ: 'bh', म: 'm',
  य: 'y', र: 'r', ल: 'l', व: 'v',
  श: 'sh', ष: 'sh', स: 's', ह: 'h', ळ: 'l',
  क़: 'q', ख़: 'kh', ग़: 'g', ज़: 'z', ड़: 'r', ढ़: 'rh', फ़: 'f', य़: 'y',
};

const SIGNS: Record<string, string> = {
  'ं': 'n', 'ँ': 'n', 'ः': 'h', '।': '.', '॥': '.', 'ॐ': 'om',
  '\u200c': '', '\u200d': '',
};

const DIGITS: Record<string, string> = {
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
  '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
};

/**
 * Words the algorithm gets wrong (cluster schwas, irregular short vowels).
 * Checked per word before the character loop. Extend, do not special-case.
 */
const LEXICON: Record<string, string> = {
  नौकरी: 'naukri', पढ़ाई: 'padhai', पढाई: 'padhai', समय: 'samay',
  शादी: 'shaadi', विवाह: 'vivah', कुंडली: 'kundli', राशि: 'rashi',
  लग्न: 'lagna', दशा: 'dasha', मुहूर्त: 'muhurat', शुभ: 'shubh',
  अशुभ: 'ashubh', उपाय: 'upay', रत्न: 'ratna', गोचर: 'gochar',
  ग्रह: 'grah', पंचांग: 'panchang', तिथि: 'tithi', नक्षत्र: 'nakshatra',
  विवाहित: 'vivahit', संतान: 'santan', बीमारी: 'beemari', इलाज: 'ilaaj',
  करियर: 'career', पैसा: 'paisa', धन: 'dhan', घर: 'ghar', मकान: 'makaan',
  दुश्मन: 'dushman', मुकदमा: 'mukadma', अदालत: 'adalat', कर्ज़: 'karz',
  वर्ष: 'varsh', आज: 'aaj', कल: 'kal', अभी: 'abhi', क्योंकि: 'kyunki',
};

const isCons = (c: string | undefined): boolean => !!c && c in CONSONANTS;
const isSign = (c: string | undefined): boolean => !!c && c in VOWEL_SIGNS;

/** Character-level fallback. Lexicon misses land here. */
function transliterateWord(word: string): string {
  const known = LEXICON[word];
  if (known) return known;

  const chars = Array.from(word);
  const out: string[] = [];

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const next = chars[i + 1];

    if (ch in CONSONANTS) {
      out.push(CONSONANTS[ch]);
      if (next === '्') {
        i++; // virama — cluster, no vowel
        continue;
      }
      if (isSign(next)) {
        const sign = VOWEL_SIGNS[next];
        const atWordEnd = !isDev(chars[i + 2]);
        out.push(sign === 'aa' && atWordEnd ? 'a' : sign);
        i++;
        continue;
      }
      // Inherent vowel, deleted only for a true cluster schwa (C C V), which is
      // what makes नौकरी → naukri and कुंडली → kundli without breaking जन्म.
      const clusterSchwa = isCons(next) && isSign(chars[i + 2]);
      if (isDev(next) && !clusterSchwa) out.push('a');
      continue;
    }

    if (ch in INDEPENDENT_VOWELS) {
      const v = INDEPENDENT_VOWELS[ch];
      out.push(v === 'aa' && !isDev(next) ? 'a' : v);
      continue;
    }
    if (ch in SIGNS) {
      out.push(SIGNS[ch]);
      continue;
    }
    if (ch in DIGITS) {
      out.push(DIGITS[ch]);
      continue;
    }
    out.push(ch);
  }

  return out.join('');
}

/** Transliterate Devanagari to Latin. Latin input is returned untouched. */
export function toRomanHindi(input: string): string {
  if (!input || !DEVANAGARI.test(input)) return input;
  // Split on whitespace, keep separators so spacing and punctuation survive.
  return input
    .split(/(\s+)/)
    .map(part => (DEVANAGARI.test(part) ? transliterateWord(part) : part))
    .join('');
}

/** Recursively transliterate every string in a plain object/array tree. */
export function deepTransliterate<T>(value: T): T {
  if (typeof value === 'string') return toRomanHindi(value) as unknown as T;
  if (Array.isArray(value)) return value.map(v => deepTransliterate(v)) as unknown as T;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = deepTransliterate(v);
    }
    return out as T;
  }
  return value;
}

// ─── Input normalisation ─────────────────────────────────────────────────────

/** Roman Hindi → canonical English token. Lowercase, unaccented. */
const TOKENS: Record<string, string> = {
  naukri: 'job', nokri: 'job', nokari: 'job', kaam: 'job', kaamkaj: 'job',
  padonnati: 'promotion', tarakki: 'promotion', transfer: 'transfer',
  salary: 'salary', tankha: 'salary', vetan: 'salary', paisa: 'money',
  paise: 'money', dhan: 'wealth', sampatti: 'wealth', kamai: 'income',
  vyapar: 'business', dhandha: 'business', dukan: 'business', vyapari: 'business',
  interview: 'interview', sifarish: 'reference',
  shaadi: 'marriage', shadi: 'marriage', vivah: 'marriage', byah: 'marriage',
  biyah: 'marriage', sagai: 'engagement', mangni: 'engagement',
  pati: 'husband', patni: 'wife', jeevansathi: 'spouse', prem: 'love',
  pyar: 'love', pyarr: 'love', rishta: 'relationship', sasural: 'in-laws',
  talaq: 'divorce', divorce: 'divorce',
  santan: 'children', santaan: 'children', bachcha: 'children',
  bachche: 'children', aulaad: 'children', garbh: 'pregnancy',
  pregnancy: 'pregnancy', prasav: 'childbirth',
  ghar: 'house', makan: 'house', makaan: 'house', plot: 'property',
  jameen: 'land', zameen: 'land', kiraya: 'rent',
  padhai: 'education', padhaai: 'education', shiksha: 'education',
  pariksha: 'exam', imtihan: 'exam', exam: 'exam', college: 'college',
  vishwavidyalaya: 'university', dakhila: 'admission', admission: 'admission',
  sehat: 'health', bimari: 'illness', beemari: 'illness', rog: 'illness',
  ilaaj: 'treatment', dawai: 'medicine', operation: 'surgery',
  mokadma: 'lawsuit', mukadma: 'lawsuit', adalat: 'court', case: 'case',
  karz: 'debt', rin: 'debt', loan: 'loan', udhaar: 'debt',
  dushman: 'enemy', dushmani: 'enemy', virodhi: 'enemy', jhagda: 'dispute',
  videsh: 'foreign', pardesh: 'foreign', abroad: 'abroad', yatra: 'travel',
  safar: 'travel', travel: 'travel', ghumna: 'travel', visa: 'visa',
  maa: 'mother', mata: 'mother', mummy: 'mother', pita: 'father',
  papa: 'father', bhai: 'brother', behen: 'sister', bahan: 'sister',
  dost: 'friend', mitra: 'friend', beta: 'son', beti: 'daughter',
  kundli: 'kundli', kundali: 'kundli', janmakundli: 'kundli', rashi: 'rashi',
  lagna: 'lagna', dasha: 'dasha', gochar: 'transit', grah: 'planet',
  shani: 'saturn', rahu: 'rahu', ketu: 'ketu', mangal: 'mars',
  shukra: 'venus', guru: 'jupiter', budh: 'mercury', chandra: 'moon',
  surya: 'sun', manglik: 'manglik', dosh: 'dosha', dosha: 'dosha',
  upay: 'remedy', upaay: 'remedy', mantra: 'mantra', puja: 'puja',
  ratna: 'gemstone', muhurat: 'muhurat', shubh: 'auspicious',
  ashubh: 'inauspicious', yog: 'yoga',
  achha: 'good', accha: 'good', behtar: 'better', kharab: 'bad',
  theek: 'okay', sahi: 'right', galat: 'wrong', safal: 'success',
  asafal: 'failure', jaldi: 'soon', der: 'delay', samay: 'time',
};

/** Multi-word Hinglish, mapped before tokenisation. Longest first. */
const PHRASES: ReadonlyArray<readonly [RegExp, string]> = [
  [/\bbahar desh\b/g, 'foreign'],
  [/\bdesh chhod\b/g, 'foreign'],
  [/\bpaise ka lena dena\b/g, 'loan'],
  [/\bghar kharidna\b/g, 'buy house'],
  [/\bnaukri badalna\b/g, 'change job'],
  [/\bkya hoga\b/g, 'what will happen'],
  [/\bkitna samay\b/g, 'how much time'],
];

/** Grammatical particles — dropped so they cannot outscore real keywords. */
const PARTICLES = new Set([
  'kya', 'kyaa', 'hai', 'hain', 'ho', 'hoga', 'hogi', 'honge', 'hona',
  'ka', 'ki', 'ke', 'ko', 'se', 'mein', 'me', 'par', 'pe', 'aur', 'ya',
  'to', 'toh', 'bhi', 'na', 'nahi', 'nahin', 'mat', 'kab', 'kaise', 'kaisi',
  'kyun', 'kyon', 'kitna', 'kitni', 'kitne', 'koi', 'kuch', 'mujhe', 'mera',
  'meri', 'mere', 'hamara', 'hamari', 'hamare', 'apna', 'apni', 'apne',
  'raha', 'rahi', 'rahe', 'gaya', 'gayi', 'gaye', 'chahiye', 'sakta',
  'sakti', 'sakte', 'wala', 'wali', 'wale', 'ek', 'tha', 'thi', 'the',
  'ab', 'abhi', 'phir', 'karna', 'karne', 'kare', 'hota', 'hoti', 'hote',
  'jayega', 'jayegi', 'milega', 'milegi', 'banega', 'banegi', 'liye', 'sath',
]);

/**
 * Particles that are also plain English words. They must still be *dropped*
 * during normalisation, but they must not, on their own, tilt script detection
 * toward Hinglish — otherwise "the loan officer" reads as Roman Hindi.
 */
const ENGLISH_COLLISIONS = new Set(['the', 'to', 'me', 'na', 'ho']);

const tokenize = (text: string): string[] =>
  text.toLowerCase().split(/[^a-z']+/).filter(Boolean);

/**
 * Fold Roman Hindi onto English keywords. English survives intact (unknown
 * tokens are kept), so this is safe to call unconditionally. Particles are
 * always removed; raw text is returned only when nothing survives at all.
 */
export function normalizeQuestion(text: string): string {
  if (!text) return text;
  if (DEVANAGARI.test(text)) return text;
  // English is returned verbatim: folding it would lower-case it and drop its
  // own function words ("Will I get the job" must not become "will i get job").
  if (detectScript(text) !== 'roman-hindi') return text;

  let out = ` ${text.toLowerCase()} `;
  for (const [pattern, replacement] of PHRASES) out = out.replace(pattern, replacement);

  const mapped = tokenize(out)
    .filter(t => !PARTICLES.has(t))
    .map(t => TOKENS[t] ?? t)
    .filter(Boolean);

  return mapped.length ? mapped.join(' ') : text;
}

export function detectScript(text: string): ScriptKind {
  if (DEVANAGARI.test(text)) return 'devanagari';
  const tokens = tokenize(text);
  if (!tokens.length) return 'english';

  const particles = tokens.filter(
    t => PARTICLES.has(t) && !ENGLISH_COLLISIONS.has(t)
  ).length;
  const content = tokens.filter(t => !PARTICLES.has(t));
  if (!content.length) return particles >= 2 ? 'roman-hindi' : 'english';

  const hits = content.filter(t => t in TOKENS).length;
  // A particle and a recognised content word is the Hinglish signature;
  // English with one accidental match ("my case") stays English.
  if (particles > 0 && hits / content.length >= 0.25) return 'roman-hindi';
  return hits >= 2 && hits / content.length >= 0.6 ? 'roman-hindi' : 'english';
}

/** Map typed text to an output language code. */
export function detectLanguage(text: string): 'en' | 'hi' | 'hi-Latn' {
  const script = detectScript(text);
  if (script === 'devanagari') return 'hi';
  return script === 'roman-hindi' ? 'hi-Latn' : 'en';
}
