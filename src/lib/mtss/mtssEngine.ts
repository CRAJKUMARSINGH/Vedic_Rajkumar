/**
 * MTSS Engine — Marriage Timing, Spouse Characteristics, Spiritual Remedies
 * Self-contained computation from birth data.
 */
import {
  buildChart, calcVimshottariDashas, getMarriageWindows, getNavamsaRashi,
  RASHI_NAMES_EN, RASHI_NAMES_HI, RASHI_LORDS, NAKSHATRAS, PLANET_SYMBOLS,
  type ChartData, type DashaPeriod, type MarriageWindow, type PlanetPosition
} from "./vedicEngine";

export interface JatakInput {
  id: string;
  name: string;
  day: number; month: number; year: number;
  hour: number; minute: number;
  placeOfBirth: string;
  lat: number; lon: number;
  tz?: number;
  notes?: string;
}

export interface MTSSResult {
  jatak: JatakInput;
  chart: ChartData;
  dashas: DashaPeriod[];
  currentMD: DashaPeriod | null;
  currentAD: { lord:string;startDate:Date;endDate:Date;isMarriageFavorable:boolean;note:string; } | null;
  marriageWindows: MarriageWindow[];
  spouseAnalysis: SpouseAnalysis;
  navamsaAnalysis: NavamsaAnalysis;
  remedies: Remedy[];
  timingMethods: TimingMethod[];
  overallScore: number;
  status: "Very Auspicious" | "Auspicious" | "Moderate" | "Delayed";
}

export interface SpouseAnalysis {
  seventhSign: string;
  seventhSignHi: string;
  seventhLord: string;
  seventhLordPosition: string;
  direction: string;
  physique: string;
  nature: string;
  profession: string;
  spiritualQuality: string;
  mangalDosha: boolean;
  mangalDoshaSeverity: string;
}

export interface NavamsaAnalysis {
  lagnaD9: string;
  seventhD9: string;
  seventhLordD9: string;
  venusD9: string;
  jupiterD9: string;
  overallScore: number;
  spouseQualities: string[];
  doshas: string[];
  yogas: string[];
  timingInsights: string[];
}

export interface Remedy {
  category: "Mantra" | "Gemstone" | "Charity" | "Fasting" | "Yantra" | "Remedy";
  title: string;
  detail: string;
  day?: string;
}

export interface TimingMethod {
  method: string;
  window: string;
  confidence: "High" | "Medium" | "Low";
  detail: string;
}

const DIRECTIONS: Record<number,string> = {
  0:"East",1:"South-East",2:"South",3:"South-West",
  4:"West",5:"North-West",6:"North",7:"North-East",
  8:"East",9:"South-East",10:"South",11:"South-West"
};

function getRashiPhysique(r:number): string {
  const traits = [
    "Athletic, medium build, reddish complexion",         // Aries
    "Sturdy, well-built, fair skin, beautiful eyes",       // Taurus
    "Tall, slender, talkative, expressive",               // Gemini
    "Medium height, round face, soft complexion",          // Cancer
    "Tall, broad forehead, dignified, magnetic personality", // Leo
    "Neat, analytical, refined, medium build",             // Virgo
    "Beautiful, well-proportioned, charming smile",        // Libra
    "Intense eyes, athletic, magnetic personality",        // Scorpio
    "Tall, well-built, cheerful, athletic",               // Sagittarius
    "Lean, dark complexion, serious demeanor",             // Capricorn
    "Tall, distinctive features, humanitarian aura",       // Aquarius
    "Soft, dreamy eyes, graceful, imaginative"             // Pisces
  ];
  return traits[r] ?? "Pleasant appearance";
}

function getRashiNature(r:number): string {
  const natures = [
    "Passionate, independent, pioneering",
    "Steadfast, sensual, loyal, patient",
    "Intellectual, versatile, communicative",
    "Nurturing, emotional, intuitive, family-oriented",
    "Generous, warm, creative, authoritative",
    "Analytical, hardworking, health-conscious, perfectionistic",
    "Diplomatic, charming, artistic, harmony-seeking",
    "Intense, determined, secretive, transformative",
    "Philosophical, adventurous, optimistic, freedom-loving",
    "Disciplined, ambitious, practical, responsible",
    "Humanitarian, intellectual, independent, innovative",
    "Spiritual, compassionate, imaginative, sensitive"
  ];
  return natures[r] ?? "Balanced nature";
}

function getRashiProfession(r:number): string {
  const profs = [
    "Military, sports, engineering, police",
    "Banking, agriculture, arts, beauty",
    "Media, communication, writing, IT, business",
    "Nursing, hospitality, real estate, food",
    "Administration, politics, arts, entertainment",
    "Medicine, accounting, analysis, nutrition",
    "Law, diplomacy, fashion, luxury",
    "Research, occult, surgery, insurance",
    "Teaching, law, philosophy, travel, religion",
    "Government, management, architecture, mining",
    "Technology, social work, aviation, research",
    "Spirituality, medicine, arts, healing"
  ];
  return profs[r] ?? "Varied fields";
}

function getDirection(r:number): string {
  return DIRECTIONS[r] ?? "East";
}

function detectMangalDosha(chart:ChartData): {dosha:boolean;severity:string} {
  const mars = chart.planets.find(p=>p.name==="Mars");
  if(!mars) return {dosha:false,severity:"Not detectable"};
  const doshaHouses = [1,2,4,7,8,12];
  if(doshaHouses.includes(mars.house)){
    const severity = [1,7,8].includes(mars.house) ? "High" : "Moderate";
    return {dosha:true,severity:`${severity} — Mars in ${mars.house}th house`};
  }
  return {dosha:false,severity:"No Mangal Dosha"};
}

function buildSpouseAnalysis(chart:ChartData): SpouseAnalysis {
  const seventhRashi = chart.houseRashis[6];
  const seventhLord = RASHI_LORDS[seventhRashi];
  const seventhLordPlanet = chart.planets.find(p=>p.name===seventhLord);
  const {dosha,severity} = detectMangalDosha(chart);

  return {
    seventhSign: RASHI_NAMES_EN[seventhRashi],
    seventhSignHi: RASHI_NAMES_HI[seventhRashi],
    seventhLord,
    seventhLordPosition: seventhLordPlanet
      ? `${seventhLord} in ${seventhLordPlanet.rashiName} (House ${seventhLordPlanet.house})`
      : "Position unknown",
    direction: getDirection(seventhRashi),
    physique: getRashiPhysique(seventhRashi),
    nature: getRashiNature(seventhRashi),
    profession: getRashiProfession(seventhRashi),
    spiritualQuality: seventhRashi===11||seventhRashi===9||seventhRashi===11
      ? "Deeply spiritual, yogic inclinations"
      : seventhRashi===4||seventhRashi===0
      ? "Honours traditions, religious rituals"
      : "Balanced spiritual outlook",
    mangalDosha: dosha,
    mangalDoshaSeverity: severity
  };
}

function buildNavamsaAnalysis(chart:ChartData): NavamsaAnalysis {
  const lagnaD9 = getNavamsaRashi(chart.lagnaLong);
  const seventhD9Rashi = (lagnaD9.rashi+6)%12;
  const seventhLordD9 = RASHI_LORDS[seventhD9Rashi];

  const venus = chart.planets.find(p=>p.name==="Venus");
  const jupiter = chart.planets.find(p=>p.name==="Jupiter");
  const venusD9 = venus ? getNavamsaRashi(venus.longitude) : {rashi:0,pada:1};
  const jupiterD9 = jupiter ? getNavamsaRashi(jupiter.longitude) : {rashi:0,pada:1};

  const venusD9Name = RASHI_NAMES_EN[venusD9.rashi];
  const jupiterD9Name = RASHI_NAMES_EN[jupiterD9.rashi];

  const doshas: string[] = [];
  const yogas: string[] = [];

  if(venusD9.rashi===5) yogas.push("Venus exalted in D9 (Pisces) — exceptional marital bliss");
  if(venusD9.rashi===5||venusD9.rashi===1) yogas.push("Venus in own/exalted sign in D9 — spouse will be beautiful and devoted");
  if(jupiter && [3,6,9].includes(jupiter.house)) yogas.push("Jupiter in trikona in D1 — blessings of dharma on marriage");
  if(seventhD9Rashi===5||seventhD9Rashi===9) yogas.push("D9 7th house in Pisces/Capricorn — spiritually oriented spouse");
  
  const mars = chart.planets.find(p=>p.name==="Mars");
  if(mars){
    const marsD9 = getNavamsaRashi(mars.longitude);
    if([0,7,3].includes(marsD9.rashi)) doshas.push("Mars in fiery/watery D9 signs — need spouse compatibility check");
  }
  if(yogas.length===0) yogas.push("Standard D9 configuration — marriage prospects stable");

  const overallScore = Math.min(100,
    50 + (yogas.length*10) - (doshas.length*8)
  );

  return {
    lagnaD9: RASHI_NAMES_EN[lagnaD9.rashi],
    seventhD9: RASHI_NAMES_EN[seventhD9Rashi],
    seventhLordD9,
    venusD9: venusD9Name,
    jupiterD9: jupiterD9Name,
    overallScore: Math.max(30,overallScore),
    spouseQualities: [
      `7th lord in D9: ${seventhLordD9} — ${getRashiNature(seventhD9Rashi)}`,
      `Venus (Kalatrakaraka) in D9: ${venusD9Name} — ${getRashiPhysique(venusD9.rashi)}`,
      `Jupiter (Vivaha Karaka) in D9: ${jupiterD9Name}`,
      "Spouse likely well-educated and from a good family",
    ],
    doshas,
    yogas,
    timingInsights: [
      "Venus Dasha/Antardasha periods are strongest for marriage",
      "Jupiter transit over natal 7th house activates marriage yoga",
      "Saturn transit over natal Moon can delay — plan accordingly",
    ]
  };
}

function buildRemedies(chart:ChartData, spouseAnalysis:SpouseAnalysis): Remedy[] {
  const venus = chart.planets.find(p=>p.name==="Venus");
  const jupiter = chart.planets.find(p=>p.name==="Jupiter");
  const remedies: Remedy[] = [];

  remedies.push({
    category:"Mantra",
    title:"Vivah Sukta Chanting",
    detail:"Recite Vivah Sukta (Rigveda 10.85) 11 times daily. Strengthens 7th house and marriage bhava.",
    day:"Friday"
  });

  if(venus){
    const isVenusAfflicted = venus.retrograde || [1,6,8].includes(venus.house);
    remedies.push({
      category:"Mantra",
      title:isVenusAfflicted?"Shukra Shanti Mantra":"Venus Beej Mantra",
      detail:isVenusAfflicted
        ?"Om Shum Shukraya Namah (108 times on Fridays) — pacify afflicted Venus for early marriage"
        :"Om Dram Dreem Draum Sah Shukraya Namah (108 times on Fridays)",
      day:"Friday"
    });
  }

  remedies.push({
    category:"Gemstone",
    title:"Diamond / White Sapphire",
    detail:"Wear a natural Diamond (0.5+ carat) or White Sapphire in silver on the right ring finger on a Friday during Shukla Paksha. Strengthens Venus and marriage karaka.",
    day:"Friday Shukla Paksha"
  });

  remedies.push({
    category:"Gemstone",
    title:"Yellow Sapphire (Pukhraj)",
    detail:"For Jupiter strengthening — wear Yellow Sapphire (2+ carat) in gold on the index finger on Thursday.",
    day:"Thursday"
  });

  if(spouseAnalysis.mangalDosha){
    remedies.push({
      category:"Remedy",
      title:"Mangal Dosha Nivaran Puja",
      detail:"Perform Hanuman Chalisa recitation 108 times on Tuesdays. Offer red flowers to Hanuman ji. This pacifies Mars and reduces Mangal Dosha effects.",
      day:"Tuesday"
    });
    remedies.push({
      category:"Mantra",
      title:"Mars/Mangal Mantra",
      detail:"Om Kram Kreem Kraum Sah Bhoumaya Namah — recite 108 times on Tuesdays to reduce Mangal Dosha severity.",
      day:"Tuesday"
    });
  }

  remedies.push({
    category:"Charity",
    title:"Friday Charity for Venus",
    detail:"Donate white sweets, rice, white clothes, or silver items to young women or Brahmin families on Fridays. Feed cows with green fodder.",
    day:"Friday"
  });

  remedies.push({
    category:"Charity",
    title:"Thursday Charity for Jupiter",
    detail:"Donate yellow items (turmeric, yellow lentils, yellow clothes), books, or gold on Thursdays.",
    day:"Thursday"
  });

  remedies.push({
    category:"Fasting",
    title:"Solah Somvar Vrat",
    detail:"Observe 16 consecutive Monday fasts. This is classically prescribed for obtaining an ideal spouse. Pray to Lord Shiva and Parvati.",
    day:"Monday"
  });

  remedies.push({
    category:"Yantra",
    title:"Shukra Yantra Sthapan",
    detail:"Install a copper Shukra (Venus) Yantra in the puja room, facing East, on a Friday during Shukla Paksha. Energize with 108 repetitions of Venus mantra.",
    day:"Friday Shukla Paksha"
  });

  remedies.push({
    category:"Remedy",
    title:"Gayatri Mantra + Surya Namaskar",
    detail:"108 Gayatri Mantra recitations at sunrise, followed by 12 Surya Namaskars. Strengthens Sun (ruler of 7th lord in Leo/Virgo configurations).",
    day:"Daily / Sunday"
  });

  return remedies;
}

function buildTimingMethods(chart:ChartData, dashas:DashaPeriod[], moonLong:number): TimingMethod[] {
  const today = new Date();
  const currentMD = dashas.find(d=>d.isCurrent);
  const currentAD = currentMD?.antardashas.find(a=>a.isCurrent);
  
  const methods: TimingMethod[] = [];

  methods.push({
    method:"Vimshottari Dasha",
    window: currentMD && currentAD
      ? `${currentMD.lord} MD / ${currentAD.lord} AD (${currentAD.startDate.getFullYear()}–${currentAD.endDate.getFullYear()})`
      : "Compute current dasha",
    confidence: currentAD?.isMarriageFavorable ? "High" : "Medium",
    detail:`Primary Dasha method. ${currentMD?.lord} Mahadasha is active. ${currentAD?.note ?? "Monitor antardasha transitions."}`
  });

  const venus = chart.planets.find(p=>p.name==="Venus");
  const seventh = chart.houseRashis[6];
  methods.push({
    method:"Jupiter Transit (Gochar)",
    window:`When Jupiter transits Rashi ${RASHI_NAMES_EN[seventh]} or ${RASHI_NAMES_EN[(seventh+6)%12]}`,
    confidence:"High",
    detail:"Jupiter's transit over the 7th house or natal 7th lord's sign is a classic activator of marriage yoga. Also watch transit over natal Venus."
  });

  methods.push({
    method:"Saturn Transit (Gochar)",
    window:"Avoid Saturn transit over natal Moon or Lagna",
    confidence:"Medium",
    detail:"Saturn transiting natal Moon (Sade Sati) can delay marriage. Plan ceremonies outside this period for smooth outcomes."
  });

  methods.push({
    method:"Jaimini Navamsa Dasha",
    window:"Compute from Lagna Nakshatra pada",
    confidence:"Medium",
    detail:"Jaimini system offers independent timing confirmation. Navamsa Dasha activates marriage when running through 7th sign in D9. Currently unimplemented in the app — high priority for enterprise upgrade."
  });

  methods.push({
    method:"Double Transit (Jupiter + Saturn)",
    window:"When Jupiter + Saturn both aspect natal 7th lord/house",
    confidence:"High",
    detail:"The double transit of Jupiter and Saturn over significant marriage points is the strongest confirmation of marriage timing. This is a critical missing feature in the current app."
  });

  methods.push({
    method:"Upapada Lagna (UL) Analysis",
    window:"Planets activating UL indicate marriage events",
    confidence:"Medium",
    detail:"UL is derived from the 12th lord's count. Planets transiting or in dasha of UL lord signal marriage. Currently missing from MTSS panel — should be added."
  });

  return methods;
}

export function computeMTSS(jatak: JatakInput, ayanamsa?: string): MTSSResult {
  const chart = buildChart(
    jatak.day,
    jatak.month,
    jatak.year,
    jatak.hour,
    jatak.minute,
    jatak.lat,
    jatak.lon,
    jatak.tz ?? 5.5,
    ayanamsa
  );

  const moonPlanet = chart.planets.find(p=>p.name==="Moon");
  const moonSidereal = moonPlanet?.longitude ?? 0;
  const dashas = calcVimshottariDashas(new Date(jatak.year,jatak.month-1,jatak.day,jatak.hour,jatak.minute), moonSidereal);
  const marriageWindows = getMarriageWindows(dashas);

  const currentMD = dashas.find(d=>d.isCurrent) ?? null;
  const currentAD = currentMD?.antardashas.find(a=>a.isCurrent) ?? null;

  const spouseAnalysis = buildSpouseAnalysis(chart);
  const navamsaAnalysis = buildNavamsaAnalysis(chart);
  const remedies = buildRemedies(chart,spouseAnalysis);
  const timingMethods = buildTimingMethods(chart,dashas,moonSidereal);

  const veryStrongWindows = marriageWindows.filter(w=>w.strength==="Very Strong").length;
  const strongWindows = marriageWindows.filter(w=>w.strength==="Strong").length;
  const overallScore = Math.min(100,
    40 + veryStrongWindows*15 + strongWindows*8 + navamsaAnalysis.overallScore*0.3
  );

  const status: MTSSResult["status"] =
    overallScore>=80 ? "Very Auspicious" :
    overallScore>=60 ? "Auspicious" :
    overallScore>=40 ? "Moderate" : "Delayed";

  return {
    jatak,chart,dashas,currentMD,
    currentAD: currentAD ? {
      lord:currentAD.lord,
      startDate:currentAD.startDate,
      endDate:currentAD.endDate,
      isMarriageFavorable:currentAD.isMarriageFavorable,
      note:currentAD.note
    } : null,
    marriageWindows,
    spouseAnalysis,navamsaAnalysis,remedies,timingMethods,
    overallScore:Math.round(overallScore),
    status
  };
}
