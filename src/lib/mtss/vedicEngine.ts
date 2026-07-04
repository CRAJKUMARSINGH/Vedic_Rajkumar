/** 
 * Vedic Astrology Calculation Engine
 * Jean Meeus "Astronomical Algorithms" methods
 * Lahiri (Chitrapaksha) ayanamsa
 */

export const RASHI_NAMES_EN = [
  "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
  "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"
];
export const RASHI_NAMES_HI = [
  "मेष","वृषभ","मिथुन","कर्क","सिंह","कन्या",
  "तुला","वृश्चिक","धनु","मकर","कुम्भ","मीन"
];
export const RASHI_LORDS = [
  "Mars","Venus","Mercury","Moon","Sun","Mercury",
  "Venus","Mars","Jupiter","Saturn","Saturn","Jupiter"
];
export const PLANET_SYMBOLS: Record<string,string> = {
  Sun:"☉",Moon:"☽",Mars:"♂",Mercury:"☿",Jupiter:"♃",
  Venus:"♀",Saturn:"♄",Rahu:"☊",Ketu:"☋",Lagna:"Asc"
};

export const NAKSHATRAS = [
  {id:1,name:"Ashwini",lord:"Ketu",rashi:0},
  {id:2,name:"Bharani",lord:"Venus",rashi:0},
  {id:3,name:"Krittika",lord:"Sun",rashi:1},
  {id:4,name:"Rohini",lord:"Moon",rashi:1},
  {id:5,name:"Mrigashira",lord:"Mars",rashi:1},
  {id:6,name:"Ardra",lord:"Rahu",rashi:2},
  {id:7,name:"Punarvasu",lord:"Jupiter",rashi:2},
  {id:8,name:"Pushya",lord:"Saturn",rashi:3},
  {id:9,name:"Ashlesha",lord:"Mercury",rashi:3},
  {id:10,name:"Magha",lord:"Ketu",rashi:4},
  {id:11,name:"Purva Phalguni",lord:"Venus",rashi:4},
  {id:12,name:"Uttara Phalguni",lord:"Sun",rashi:5},
  {id:13,name:"Hasta",lord:"Moon",rashi:5},
  {id:14,name:"Chitra",lord:"Mars",rashi:5},
  {id:15,name:"Swati",lord:"Rahu",rashi:6},
  {id:16,name:"Vishakha",lord:"Jupiter",rashi:6},
  {id:17,name:"Anuradha",lord:"Saturn",rashi:7},
  {id:18,name:"Jyeshtha",lord:"Mercury",rashi:7},
  {id:19,name:"Mula",lord:"Ketu",rashi:8},
  {id:20,name:"Purva Ashadha",lord:"Venus",rashi:8},
  {id:21,name:"Uttara Ashadha",lord:"Sun",rashi:9},
  {id:22,name:"Shravana",lord:"Moon",rashi:9},
  {id:23,name:"Dhanishta",lord:"Mars",rashi:10},
  {id:24,name:"Shatabhisha",lord:"Rahu",rashi:10},
  {id:25,name:"Purva Bhadrapada",lord:"Jupiter",rashi:11},
  {id:26,name:"Uttara Bhadrapada",lord:"Saturn",rashi:11},
  {id:27,name:"Revati",lord:"Mercury",rashi:11},
];

export const VIMSHOTTARI = [
  {lord:"Ketu",years:7},{lord:"Venus",years:20},{lord:"Sun",years:6},
  {lord:"Moon",years:10},{lord:"Mars",years:7},{lord:"Rahu",years:18},
  {lord:"Jupiter",years:16},{lord:"Saturn",years:19},{lord:"Mercury",years:17}
];

function normalize(d: number): number { return ((d % 360)+360)%360; }
function toRad(d: number): number { return d*Math.PI/180; }
function toDeg(r: number): number { return r*180/Math.PI; }

export function julianDay(year:number,month:number,day:number,hour:number=0): number {
  if(month<=2){year--;month+=12;}
  const A=Math.floor(year/100);
  const B=2-A+Math.floor(A/4);
  return Math.floor(365.25*(year+4716))+Math.floor(30.6001*(month+1))+day+hour/24+B-1524.5;
}

export function lahiriAyanamsa(jde:number): number {
  const T=(jde-2451545.0)/36525.0;
  return 23.85 + 0.01396*T;
}

export function sunLongitude(T:number): number {
  const M=normalize(357.5291+35999.0503*T);
  const C=1.9146*Math.sin(toRad(M))+0.0200*Math.sin(toRad(2*M))+0.0003*Math.sin(toRad(3*M));
  const sun=normalize(280.4665+36000.7698*T+C);
  return sun;
}

export function moonLongitude(T:number): number {
  const D=normalize(297.8502+445267.1115*T);
  const M=normalize(357.5291+35999.0503*T);
  const Mm=normalize(134.9634+477198.8676*T);
  const F=normalize(93.2721+483202.0175*T);
  let lon=normalize(218.3165+481267.8813*T);
  lon+=6.2888*Math.sin(toRad(Mm));
  lon+=1.2740*Math.sin(toRad(2*D-Mm));
  lon+=0.6583*Math.sin(toRad(2*D));
  lon+=0.2136*Math.sin(toRad(2*Mm));
  lon-=0.1851*Math.sin(toRad(M));
  lon-=0.1144*Math.sin(toRad(2*F));
  lon+=0.0588*Math.sin(toRad(2*D-2*Mm));
  return normalize(lon);
}

export function rahuLongitude(T:number): number {
  return normalize(125.0445-1934.1362*T);
}

export function marsLongitude(T:number): number {
  const M=normalize(19.3730+19141.6964*T);
  return normalize(355.433+19140.2993*T+1.8497*Math.sin(toRad(M))+0.1020*Math.sin(toRad(2*M)));
}

export function venusLongitude(T:number): number {
  const M=normalize(212.1+58517.8*T);
  const sunM=normalize(357.5291+35999.0503*T);
  return normalize(282.0+58519.2*T+0.7293*Math.sin(toRad(M))+0.0325*Math.sin(toRad(2*M))+0.0044*Math.sin(toRad(sunM)));
}

export function jupiterLongitude(T:number): number {
  const M=normalize(20.020+3034.906*T);
  return normalize(34.351+3034.906*T+1.0275*Math.sin(toRad(M))+0.0454*Math.sin(toRad(2*M)));
}

export function saturnLongitude(T:number): number {
  const M=normalize(317.020+1222.114*T);
  return normalize(50.077+1222.114*T+0.8337*Math.sin(toRad(M))+0.0560*Math.sin(toRad(2*M)));
}

export function mercuryLongitude(T:number): number {
  const M=normalize(102.279+149472.515*T);
  const sunM=normalize(357.5291+35999.0503*T);
  return normalize(252.251+149472.515*T+0.1116*Math.sin(toRad(M))+0.0055*Math.sin(toRad(2*M))+0.0044*Math.sin(toRad(sunM)));
}

export function calcAscendant(jde:number,lat:number,lon:number): number {
  const T=(jde-2451545.0)/36525.0;
  const gmst=normalize(280.46061837+360.98564736629*(jde-2451545)+0.000387933*T*T);
  const lst=normalize(gmst+lon);
  const eps=23.4393-0.013004*T;
  const lstRad=toRad(lst);
  const latRad=toRad(lat);
  const epsRad=toRad(eps);
  const y=-(Math.cos(lstRad));
  const x=Math.sin(lstRad)*Math.cos(epsRad)+Math.tan(latRad)*Math.sin(epsRad);
  let asc=normalize(toDeg(Math.atan2(y,x)));
  return asc;
}

export interface PlanetPosition {
  name: string;
  longitude: number;
  rashi: number;
  rashiName: string;
  degree: number;
  retrograde: boolean;
  house: number;
  nakshatra: string;
  nakshatraLord: string;
  pada: number;
}

export interface ChartData {
  lagna: number;
  lagnaLong: number;
  planets: PlanetPosition[];
  houseRashis: number[];
}

export function buildChart(
  day:number, month:number, year:number,
  hour:number, minute:number,
  lat:number, lon:number,
  tz:number = 5.5,
  ayanamsa?: string
): ChartData {
  const utcH = hour + minute/60 - tz;
  const jde = julianDay(year,month,day,utcH);
  const T = (jde-2451545.0)/36525.0;
  const ayn = lahiriAyanamsa(jde);

  const ascTrop = calcAscendant(jde,lat,lon);
  const ascSid = normalize(ascTrop - ayn);
  const lagnaRashi = Math.floor(ascSid/30);

  const rawPositions: Array<{name:string;trop:number;retro:boolean}> = [
    {name:"Sun",    trop:sunLongitude(T),     retro:false},
    {name:"Moon",   trop:moonLongitude(T),    retro:false},
    {name:"Mars",   trop:marsLongitude(T),    retro:false},
    {name:"Mercury",trop:mercuryLongitude(T), retro:false},
    {name:"Jupiter",trop:jupiterLongitude(T), retro:false},
    {name:"Venus",  trop:venusLongitude(T),   retro:false},
    {name:"Saturn", trop:saturnLongitude(T),  retro:false},
    {name:"Rahu",   trop:rahuLongitude(T),    retro:true },
    {name:"Ketu",   trop:normalize(rahuLongitude(T)+180), retro:true},
  ];

  const planets: PlanetPosition[] = rawPositions.map(p => {
    const sid = normalize(p.trop - ayn);
    const rashi = Math.floor(sid/30);
    const deg = sid % 30;
    const nakIdx = Math.floor(sid / (360/27));
    const nak = NAKSHATRAS[nakIdx];
    const pada = Math.floor((sid % (360/27)) / (360/27/4)) + 1;
    const house = ((rashi - lagnaRashi + 12) % 12) + 1;
    return {
      name: p.name,
      longitude: sid,
      rashi,
      rashiName: RASHI_NAMES_EN[rashi],
      degree: deg,
      retrograde: p.retro,
      house,
      nakshatra: nak?.name ?? "Unknown",
      nakshatraLord: nak?.lord ?? "Unknown",
      pada,
    };
  });

  const houseRashis = Array.from({length:12},(_,i)=>(lagnaRashi+i)%12);

  return { lagna:lagnaRashi, lagnaLong:ascSid, planets, houseRashis };
}

export function getNakshatraFromLong(siderealLong:number): {name:string;lord:string;pada:number} {
  const nakIdx = Math.floor(normalize(siderealLong)/(360/27));
  const nak = NAKSHATRAS[nakIdx] ?? NAKSHATRAS[0];
  const pada = Math.floor((normalize(siderealLong)%(360/27))/((360/27)/4))+1;
  return {name:nak.name,lord:nak.lord,pada};
}

export interface DashaPeriod {
  lord: string;
  startDate: Date;
  endDate: Date;
  years: number;
  isCurrent: boolean;
  antardashas: AntarDasha[];
}

export interface AntarDasha {
  lord: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  isMarriageFavorable: boolean;
  note: string;
}

function addYearsF(date:Date, years:number): Date {
  const d = new Date(date);
  const wholeYears = Math.floor(years);
  const months = Math.round((years - wholeYears)*12);
  d.setFullYear(d.getFullYear()+wholeYears);
  d.setMonth(d.getMonth()+months);
  return d;
}

const MARRIAGE_LORDS = new Set(["Venus","Jupiter","Moon","Rahu"]);
const STRONG_LORDS   = new Set(["Venus","Jupiter"]);

export function calcVimshottariDashas(birthDate:Date, moonSidereal:number): DashaPeriod[] {
  const nakIdx = Math.floor(moonSidereal/(360/27));
  const posInNak = moonSidereal - nakIdx*(360/27);
  const fracElapsed = posInNak/(360/27);

  const firstSeqIdx = nakIdx % 9;
  const firstMD = VIMSHOTTARI[firstSeqIdx];
  const balanceYears = firstMD.years*(1-fracElapsed);

  const today = new Date();
  const periods: DashaPeriod[] = [];
  let cursor = new Date(birthDate);

  for(let i=0;i<9;i++){
    const seqIdx=(firstSeqIdx+i)%9;
    const md=VIMSHOTTARI[seqIdx];
    const dur=i===0?balanceYears:md.years;
    const start=new Date(cursor);
    const end=addYearsF(cursor,dur);
    const isCurrent=today>=start&&today<end;

    const antars: AntarDasha[] = [];
    let aCursor=new Date(start);
    const startAntarIdx=seqIdx;
    for(let j=0;j<9;j++){
      const aSeqIdx=(startAntarIdx+j)%9;
      const ad=VIMSHOTTARI[aSeqIdx];
      const aDur=(dur*ad.years)/120;
      const aStart=new Date(aCursor);
      const aEnd=addYearsF(aCursor,aDur);
      const isMarriageFav=MARRIAGE_LORDS.has(md.lord)&&MARRIAGE_LORDS.has(ad.lord);
      const isStrong=STRONG_LORDS.has(md.lord)&&STRONG_LORDS.has(ad.lord);
      antars.push({
        lord:ad.lord,startDate:aStart,endDate:aEnd,
        isCurrent:today>=aStart&&today<aEnd,
        isMarriageFavorable:isMarriageFav,
        note: isStrong
          ? `${md.lord}–${ad.lord}: Both are marriage karakas. Highly auspicious.`
          : isMarriageFav
          ? `${md.lord}–${ad.lord}: Active marriage period.`
          : `${md.lord}–${ad.lord}: Monitor 7th house transits.`
      });
      aCursor=new Date(aEnd);
    }

    periods.push({lord:md.lord,startDate:start,endDate:end,years:dur,isCurrent,antardashas:antars});
    cursor=new Date(end);
  }
  return periods;
}

export interface MarriageWindow {
  from: string;
  to: string;
  strength: "Very Strong"|"Strong"|"Moderate";
  reason: string;
  mdLord: string;
  adLord: string;
}

export function getMarriageWindows(dashas:DashaPeriod[]): MarriageWindow[] {
  const windows: MarriageWindow[] = [];
  const fmt=(d:Date)=>d.toLocaleDateString("en-IN",{month:"short",year:"numeric"});
  for(const md of dashas){
    for(const ad of md.antardashas){
      if(!ad.isMarriageFavorable) continue;
      const str = STRONG_LORDS.has(md.lord)&&STRONG_LORDS.has(ad.lord)
        ? "Very Strong"
        : (STRONG_LORDS.has(md.lord)||STRONG_LORDS.has(ad.lord)) ? "Strong" : "Moderate";
      windows.push({
        from:fmt(ad.startDate),to:fmt(ad.endDate),
        strength:str,reason:ad.note,
        mdLord:md.lord,adLord:ad.lord
      });
    }
  }
  return windows;
}

export function getNavamsaRashi(siderealLong:number):{rashi:number;pada:number} {
  const sidNorm = normalize(siderealLong);
  const signIndex = Math.floor(sidNorm/30)%12;
  const degreeInSign = sidNorm%30;
  const navamsaNum = Math.floor(degreeInSign/(30/9));
  const elementStarts: Record<number,number> = {0:0,1:9,2:6,3:3};
  const element = signIndex%4;
  const startSign = elementStarts[element];
  const navamsaRashi = (startSign+navamsaNum)%12;
  return {rashi:navamsaRashi,pada:navamsaNum+1};
}

export function getCurrentTransits(tz: number = 5.5): {
  date: Date;
  jupiter: { longitude: number; rashi: number; rashiName: string };
  saturn: { longitude: number; rashi: number; rashiName: string };
} {
  const now = new Date();
  const utcH = now.getUTCHours() + now.getUTCMinutes()/60;
  const jde = julianDay(now.getUTCFullYear(), now.getUTCMonth()+1, now.getUTCDate(), utcH);
  const T = (jde-2451545.0)/36525.0;
  const ayn = lahiriAyanamsa(jde);

  const jupTrop = jupiterLongitude(T);
  const satTrop = saturnLongitude(T);

  const jupSid = normalize(jupTrop - ayn);
  const satSid = normalize(satTrop - ayn);

  const jupRashi = Math.floor(jupSid/30);
  const satRashi = Math.floor(satSid/30);

  return {
    date: now,
    jupiter: { longitude: jupSid, rashi: jupRashi, rashiName: RASHI_NAMES_EN[jupRashi] },
    saturn: { longitude: satSid, rashi: satRashi, rashiName: RASHI_NAMES_EN[satRashi] }
  };
}

export function checkDoubleTransit(
  lagnaRashi: number,
  natalSeventhLordRashi: number,
  currentJupRashi: number,
  currentSatRashi: number
): {
  isDoubleTransitActive: boolean;
  aspects7thHouse: boolean;
  aspects7thLord: boolean;
  message: string;
} {
  const seventhHouse = (lagnaRashi + 6) % 12;

  // Jupiter aspects 5, 7, 9 houses from its position (+4, +6, +8 signs away)
  const jupAspects = [
    (currentJupRashi + 4) % 12,
    (currentJupRashi + 6) % 12,
    (currentJupRashi + 8) % 12,
    currentJupRashi // Conjunction is also an influence
  ];

  // Saturn aspects 3, 7, 10 houses from its position (+2, +6, +9 signs away)
  const satAspects = [
    (currentSatRashi + 2) % 12,
    (currentSatRashi + 6) % 12,
    (currentSatRashi + 9) % 12,
    currentSatRashi // Conjunction is also an influence
  ];

  const jupOn7thHouse = jupAspects.includes(seventhHouse);
  const satOn7thHouse = satAspects.includes(seventhHouse);

  const jupOn7thLord = jupAspects.includes(natalSeventhLordRashi);
  const satOn7thLord = satAspects.includes(natalSeventhLordRashi);

  const aspects7thHouse = jupOn7thHouse && satOn7thHouse;
  const aspects7thLord = jupOn7thLord && satOn7thLord;

  const isDoubleTransitActive = aspects7thHouse || aspects7thLord;

  let message = "Double Transit is not currently activating the 7th house/lord.";
  if (isDoubleTransitActive) {
    if (aspects7thHouse && aspects7thLord) {
      message = "Double Transit active on BOTH 7th House and 7th Lord! Extremely high probability of marriage.";
    } else if (aspects7thHouse) {
      message = "Double Transit active on the 7th House. Strong trigger for marriage.";
    } else {
      message = "Double Transit active on the 7th Lord. Strong trigger for marriage.";
    }
  }

  return {
    isDoubleTransitActive,
    aspects7thHouse,
    aspects7thLord,
    message
  };
}
