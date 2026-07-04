/**
 * src/services/vedicAstroEngine.ts
 * Paul Schlyter orbital mechanics engine ported to root app.
 * Accurate ±1-2° for 1900-2100. No external deps.
 * Exports: JD, Ayanamsa, Planetary positions, Ascendant,
 *          Nakshatra, Dignity, Houses, Dasha, Tara Bala,
 *          Ashtakavarga, Panchanga, D9, Remedies, Hora.
 */

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;
function norm(x: number) { return ((x % 360) + 360) % 360; }

function kepler(M: number, e: number): number {
  const Mr = M * DEG; let E = Mr + e * Math.sin(Mr) * (1 + e * Math.cos(Mr));
  for (let i = 0; i < 50; i++) { const dE = (Mr + e*Math.sin(E) - E)/(1 - e*Math.cos(E)); E += dE; if (Math.abs(dE) < 1e-10) break; }
  return E;
}
function trueAnom(E: number, e: number): number {
  return norm(2 * Math.atan2(Math.sqrt(1+e)*Math.sin(E/2), Math.sqrt(1-e)*Math.cos(E/2)) * RAD);
}
function helioRect(v: number, r: number, N: number, i: number, w: number) {
  const vw=norm(v+w)*DEG, Nr=N*DEG, ir=i*DEG;
  return { x: r*(Math.cos(Nr)*Math.cos(vw)-Math.sin(Nr)*Math.sin(vw)*Math.cos(ir)), y: r*(Math.sin(Nr)*Math.cos(vw)+Math.cos(Nr)*Math.sin(vw)*Math.cos(ir)) };
}

export function toJD(y: number, m: number, d: number, h: number): number {
  if (m <= 2) { y--; m += 12; }
  const A = Math.floor(y/100), B = 2 - A + Math.floor(A/4);
  return Math.floor(365.25*(y+4716)) + Math.floor(30.6001*(m+1)) + d + B - 1524.5 + h/24;
}
function d2k(jd: number) { return jd - 2451543.5; }

function sunPos(jd: number): { lon: number; r: number } {
  const d=d2k(jd), w=norm(282.9404+4.70935e-5*d), e=0.016709-1.151e-9*d, M=norm(356.0470+0.9856002585*d);
  const E=kepler(M,e), v=trueAnom(E,e), r=(1-e*e)/(1+e*Math.cos(v*DEG));
  return { lon:norm(v+w), r };
}
function moonPos(jd: number): number {
  const d=d2k(jd), N=norm(125.1228-0.0529538083*d), i=5.1454, w=norm(318.0634+0.1643573223*d);
  const e=0.054900, M=norm(115.3654+13.0649929509*d), E=kepler(M,e), v=trueAnom(E,e);
  const r=60.2666*(1-e*e)/(1+e*Math.cos(v*DEG)), {x,y}=helioRect(v,r,N,i,w);
  const Ms=norm(356.0470+0.9856002585*d), Ls=norm(Ms+norm(282.9404+4.70935e-5*d));
  const Lm=norm(N+w+M), D=norm(Lm-Ls);
  return norm(Math.atan2(y,x)*RAD-1.274*Math.sin((M-2*D)*DEG)+0.658*Math.sin(2*D*DEG)-0.186*Math.sin(Ms*DEG)
    -0.059*Math.sin((2*M-2*D)*DEG)+0.053*Math.sin((M+2*D)*DEG)+0.046*Math.sin((2*D-Ms)*DEG)
    +0.041*Math.sin((M-Ms)*DEG)-0.035*Math.sin(D*DEG)-0.031*Math.sin((M+Ms)*DEG)+0.011*Math.sin((M-4*D)*DEG));
}
function pgeo(d:number,N:number,i:number,w:number,a:number,e:number,M:number): number {
  const E=kepler(M,e),v=trueAnom(E,e),r=a*(1-e*e)/(1+e*Math.cos(v*DEG));
  const {x:xh,y:yh}=helioRect(v,r,N,i,w), sun=sunPos(d+2451543.5);
  const xe=-sun.r*Math.cos(sun.lon*DEG), ye=-sun.r*Math.sin(sun.lon*DEG);
  return norm(Math.atan2(yh-ye,xh-xe)*RAD);
}
function mercPos(jd:number){const d=d2k(jd);return pgeo(d,norm(48.3313+3.24587e-5*d),7.0047,norm(29.1241+1.01444e-5*d),0.387098,0.205635+5.59e-10*d,norm(168.6562+4.0923344368*d));}
function venPos(jd:number){const d=d2k(jd);return pgeo(d,norm(76.6799+2.4659e-5*d),3.3946,norm(54.8910+1.38374e-5*d),0.723330,0.006773-1.302e-9*d,norm(48.0052+1.6021302244*d));}
function marsPos(jd:number){const d=d2k(jd);return pgeo(d,norm(49.5574+2.11081e-5*d),1.8497,norm(286.5016+2.92961e-5*d),1.523688,0.093405+2.516e-9*d,norm(18.6021+0.5240207766*d));}
function jupPos(jd:number):number{
  const d=d2k(jd),Mj=norm(19.8950+0.0830853001*d),Ms=norm(316.9670+0.0334442282*d);
  const e=0.048498+4.469e-9*d,E=kepler(Mj,e),v=trueAnom(E,e),r=5.20256*(1-e*e)/(1+e*Math.cos(v*DEG));
  const pert=-0.332*Math.sin((2*Mj-5*Ms-67.6)*DEG)+0.042*Math.sin((3*Mj-5*Ms+21)*DEG);
  const {x:xh,y:yh}=helioRect(v+pert,r,norm(100.4542+2.76854e-5*d),1.3030,norm(273.8777+1.64505e-5*d));
  const sun=sunPos(jd); return norm(Math.atan2(yh+sun.r*Math.sin(sun.lon*DEG),xh+sun.r*Math.cos(sun.lon*DEG))*RAD);
}
function satPos(jd:number):number{
  const d=d2k(jd),Mj=norm(19.8950+0.0830853001*d),Ms=norm(316.9670+0.0334442282*d);
  const e=0.055546-9.499e-9*d,E=kepler(Ms,e),v=trueAnom(E,e),r=9.55475*(1-e*e)/(1+e*Math.cos(v*DEG));
  const pert=0.812*Math.sin((2*Mj-5*Ms-67.6)*DEG)+0.119*Math.sin((Mj-2*Ms-3)*DEG);
  const {x:xh,y:yh}=helioRect(v+pert,r,norm(113.6634+2.3898e-5*d),2.4886,norm(339.3939+2.97661e-5*d));
  const sun=sunPos(jd); return norm(Math.atan2(yh+sun.r*Math.sin(sun.lon*DEG),xh+sun.r*Math.cos(sun.lon*DEG))*RAD);
}
function rahuPos(jd:number){const T=(jd-2451545)/36525;return norm(125.0445479-1934.1362608*T+0.0020754*T*T);}

export interface AllPositions{Sun:number;Moon:number;Mercury:number;Venus:number;Mars:number;Jupiter:number;Saturn:number;Rahu:number;Ketu:number;}
export function allPositions(jd:number):AllPositions{
  const rahu=rahuPos(jd);
  return{Sun:sunPos(jd).lon,Moon:moonPos(jd),Mercury:mercPos(jd),Venus:venPos(jd),Mars:marsPos(jd),Jupiter:jupPos(jd),Saturn:satPos(jd),Rahu:rahu,Ketu:norm(rahu+180)};
}

export function calcAscendant(jd:number,lat:number,lon:number):number{
  const T=(jd-2451545)/36525;
  const GMST=norm(280.46061837+360.98564736629*(jd-2451545)+0.000387933*T*T-T*T*T/38710000);
  const LST=norm(GMST+lon),e=23.439291111-0.013004167*T;
  return norm(Math.atan2(Math.cos(LST*DEG),-(Math.sin(LST*DEG)*Math.cos(e*DEG)+Math.tan(lat*DEG)*Math.sin(e*DEG)))*RAD);
}

export function lahiriAyanamsa(jd:number):number{return 23.854816+1.397267*(jd-2451545)/36525;}

// ─── Rashi / Nakshatra ─────────────────────────────────────────────────────────
export const RASHIS=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'] as const;
export type VRashi=typeof RASHIS[number];
export const NAKSHATRAS=['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'] as const;
export const NAKSHATRA_LORDS=['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury','Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury','Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
export const RASHI_LORDS_MAP:Record<string,string>={Aries:'Mars',Taurus:'Venus',Gemini:'Mercury',Cancer:'Moon',Leo:'Sun',Virgo:'Mercury',Libra:'Venus',Scorpio:'Mars',Sagittarius:'Jupiter',Capricorn:'Saturn',Aquarius:'Saturn',Pisces:'Jupiter'};
export function vRashiIdx(lon:number):number{return Math.floor(lon/30);}
export function vGetRashi(lon:number):VRashi{return RASHIS[vRashiIdx(lon)];}
export function vNakIdx(lon:number):number{return Math.floor(lon/(360/27));}
export function vGetNak(lon:number):string{return NAKSHATRAS[vNakIdx(lon)];}
export function vNakLord(lon:number):string{return NAKSHATRA_LORDS[vNakIdx(lon)];}
export function nakFraction(lon:number):number{return(lon%(360/27))/(360/27);}
export function vHouse(pRashiIdx:number,ascRashiIdx:number):number{return((pRashiIdx-ascRashiIdx+12)%12)+1;}
export function vDignity(planet:string,rashi:VRashi):string{
  const EX:Record<string,string>={Sun:'Aries',Moon:'Taurus',Mars:'Capricorn',Mercury:'Virgo',Jupiter:'Cancer',Venus:'Pisces',Saturn:'Libra',Rahu:'Gemini',Ketu:'Sagittarius'};
  const DE:Record<string,string>={Sun:'Libra',Moon:'Scorpio',Mars:'Cancer',Mercury:'Pisces',Jupiter:'Capricorn',Venus:'Virgo',Saturn:'Aries',Rahu:'Sagittarius',Ketu:'Gemini'};
  const OW:Record<string,string[]>={Sun:['Leo'],Moon:['Cancer'],Mars:['Aries','Scorpio'],Mercury:['Gemini','Virgo'],Jupiter:['Sagittarius','Pisces'],Venus:['Taurus','Libra'],Saturn:['Capricorn','Aquarius']};
  if(EX[planet]===rashi)return 'Exalted';
  if(DE[planet]===rashi)return 'Debilitated';
  if(OW[planet]?.includes(rashi))return 'Own Sign';
  return 'Neutral';
}

// ─── Vimshottari Dasha ────────────────────────────────────────────────────────
export const DASHA_YEARS:Record<string,number>={Ketu:7,Venus:20,Sun:6,Moon:10,Mars:7,Rahu:18,Jupiter:16,Saturn:19,Mercury:17};
export const DASHA_ORDER=['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];

export interface VDashaPeriod{planet:string;start:Date;end:Date;years:number;antardashas:VAntardasha[];}
export interface VAntardasha{planet:string;start:Date;end:Date;}
export interface VCurrentDasha{mahadasha:string;antardasha:string;pratyantardasha:string;mahaEnd:Date;antarEnd:Date;}
export interface VDashaResult{periods:VDashaPeriod[];current:VCurrentDasha;}

export function computeVimshottariDasha(moonSidLon:number,birthJD:number):VDashaResult{
  const nakIdx=vNakIdx(moonSidLon), lord=NAKSHATRA_LORDS[nakIdx], frac=nakFraction(moonSidLon);
  const startIdx=DASHA_ORDER.indexOf(lord), firstYears=DASHA_YEARS[lord];
  const elapsed=frac*firstYears, remaining=firstYears-elapsed;
  const birthMs=(birthJD-2440587.5)*86400000;
  let cur=new Date(birthMs - elapsed*365.25*86400000);
  const periods:VDashaPeriod[]=[];
  for(let i=0;i<9;i++){
    const idx=(startIdx+i)%9, planet=DASHA_ORDER[idx];
    const yrs=i===0?remaining:DASHA_YEARS[planet];
    const start=new Date(cur), end=new Date(cur.getTime()+yrs*365.25*86400000);
    const antds:VAntardasha[]=[];let ac=new Date(start);const totalYrs=DASHA_YEARS[planet];
    for(let j=0;j<9;j++){const ai=(idx+j)%9,ap=DASHA_ORDER[ai],ay=(totalYrs*DASHA_YEARS[ap])/120;const as2=new Date(ac),ae=new Date(ac.getTime()+ay*365.25*86400000);antds.push({planet:ap,start:as2,end:ae});ac=ae;}
    periods.push({planet,start,end,years:yrs,antardashas:antds});cur=end;
  }
  const now=new Date();
  const maha=periods.find(p=>now>=p.start&&now<p.end)??periods[0];
  const antar=maha.antardashas.find(a=>now>=a.start&&now<a.end)??maha.antardashas[0];
  const aYrs=(DASHA_YEARS[maha.planet]*DASHA_YEARS[antar.planet])/120;
  const aIdx=DASHA_ORDER.indexOf(antar.planet);let pc=antar.start,pratya=antar.planet;
  for(let j=0;j<9;j++){const pi=(aIdx+j)%9,pp=DASHA_ORDER[pi],py=(aYrs*DASHA_YEARS[pp])/120;const pe=new Date(pc.getTime()+py*365.25*86400000);if(now>=pc&&now<pe){pratya=pp;break;}pc=pe;}
  return{periods,current:{mahadasha:maha.planet,antardasha:antar.planet,pratyantardasha:pratya,mahaEnd:maha.end,antarEnd:antar.end}};
}
// ─── Tara Bala ─────────────────────────────────────────────────────────────────
const TARA_NAMES=['Janma','Sampat','Vipat','Kshema','Pratyak','Sadhana','Naidhana','Mitra','Parama Mitra'];
const TARA_AUS=[false,true,false,true,false,true,false,true,true];
const TARA_DESCS:Record<string,string>={'Janma':'Birth star — introspective, mixed for events.','Sampat':'Prosperity star — excellent for gains & career. ✓','Vipat':'Danger star — obstacles likely. ✗','Kshema':'Well-being star — comfort & success. ✓','Pratyak':'Obstruction star — delays & blocks. ✗','Sadhana':'Achievement star — effort rewards. ✓','Naidhana':'Death star — most inauspicious. ✗','Mitra':'Friend star — harmonious support. ✓','Parama Mitra':'Best friend star — highly auspicious. ✓✓'};
export interface TaraBala{taraName:string;taraNumber:number;isAuspicious:boolean;transitNakshatra:string;birthNakshatra:string;description:string;}
export function computeTaraBala(birthMoonLon:number,transitMoonLon:number):TaraBala{
  const b=vNakIdx(birthMoonLon),t=vNakIdx(transitMoonLon),diff=(t-b+27)%27,pos=diff%9;
  return{taraName:TARA_NAMES[pos],taraNumber:pos+1,isAuspicious:TARA_AUS[pos],transitNakshatra:NAKSHATRAS[t],birthNakshatra:NAKSHATRAS[b],description:TARA_DESCS[TARA_NAMES[pos]]??'Neutral.'};
}

// ─── Ashtakavarga ──────────────────────────────────────────────────────────────
const MOON_AV=[0,6,3,5,3,5,6,3,4,5,6,7,4];
export function moonAVBindu(h:number):number{return h>=1&&h<=12?MOON_AV[h]:4;}
const SARVA_AV:Record<number,number>={1:25,2:22,3:29,4:24,5:25,6:34,7:19,8:24,9:29,10:36,11:54,12:16};
export function sarvaAVBindu(h:number):number{return SARVA_AV[h]??25;}

// ─── Panchanga ─────────────────────────────────────────────────────────────────
const TITHI_NAMES=['Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi','Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Purnima','Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi','Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Amavasya'];
const YOGA_NAMES=['Vishkambha','Priti','Ayushman','Saubhagya','Shobhana','Atiganda','Sukarma','Dhriti','Shula','Ganda','Vriddhi','Dhruva','Vyaghata','Harshana','Vajra','Siddhi','Vyatipata','Variyan','Parigha','Shiva','Siddha','Sadhya','Shubha','Shukla','Brahma','Indra','Vaidhriti'];
const BAD_T=new Set([4,8,9,12,14,19,23,24,25,30]),BAD_Y=new Set([1,6,9,10,13,15,17,19,27]),BAD_N=new Set([2,6,9,10,13,15,17,19,26]);
const KAR_CYC=['Bava','Balava','Kaulava','Taitila','Garaja','Vanija','Vishti'];
const VARA_DAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const VARA_LORDS=['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];
const AUSP_VARA=new Set([1,3,4,5]);
export interface Panchanga{tithi:{number:number;name:string;paksha:string;auspicious:boolean};nakshatra:{index:number;name:string;lord:string;auspicious:boolean};yoga:{index:number;name:string;auspicious:boolean};karana:{name:string;auspicious:boolean};vara:{dayName:string;lord:string;auspicious:boolean};auspiciousCount:number;}
export function computePanchanga(jd:number):Panchanga{
  const ay=lahiriAyanamsa(jd),tr=allPositions(jd);
  const ss=((tr.Sun-ay)%360+360)%360,sm=((tr.Moon-ay)%360+360)%360;
  const diff=((sm-ss)%360+360)%360,tn=Math.floor(diff/12)+1;
  const paksha=tn<=15?'Shukla':'Krishna',tA=!BAD_T.has(tn);
  const ni=vNakIdx(sm),nA=!BAD_N.has(ni);
  const yi=Math.floor(((sm+ss)%360)/(360/27))%27,yA=!BAD_Y.has(yi+1);
  const ko=Math.floor(diff/6);let kn:string;
  if(ko===0)kn='Kimstughna';else if(ko>=57)kn='Naga';else if(ko>=55)kn='Chatushpada';else if(ko>=53)kn='Shakuni';else kn=KAR_CYC[(ko-1)%7];
  const kA=kn!=='Vishti'&&kn!=='Naga',dow=Math.floor(jd+1.5)%7,vA=AUSP_VARA.has(dow);
  return{tithi:{number:tn,name:TITHI_NAMES[(tn-1)%30],paksha,auspicious:tA},nakshatra:{index:ni,name:NAKSHATRAS[ni],lord:NAKSHATRA_LORDS[ni],auspicious:nA},yoga:{index:yi,name:YOGA_NAMES[yi],auspicious:yA},karana:{name:kn,auspicious:kA},vara:{dayName:VARA_DAYS[dow],lord:VARA_LORDS[dow],auspicious:vA},auspiciousCount:[tA,nA,yA,kA,vA].filter(Boolean).length};
}

// ─── D9 Navamsa ────────────────────────────────────────────────────────────────
const D9S:Record<number,number>={0:0,4:0,8:0,1:9,5:9,9:9,2:6,6:6,10:6,3:3,7:3,11:3};
export function d9Sign(sidLon:number):VRashi{
  const l=((sidLon%360)+360)%360,ri=Math.floor(l/30),d9i=Math.floor((l%30)/(30/9));
  return RASHIS[((D9S[ri]??0)+d9i)%12];
}
export function computeD9(birthJD:number):Record<string,VRashi>{
  const ay=lahiriAyanamsa(birthJD),tr=allPositions(birthJD),out:Record<string,VRashi>={};
  for(const p of['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Rahu','Ketu']){const s=((tr[p as keyof AllPositions]-ay)%360+360)%360;out[p]=d9Sign(s);}
  return out;
}

// ─── Hora timeline ─────────────────────────────────────────────────────────────
const HORA_P=['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];
export interface HoraSlot{planet:string;symbol:string;startsAt:number;endsAt:number;isNow:boolean;quality:'excellent'|'good'|'neutral';}
const HORA_SYM:Record<string,string>={Sun:'☉',Moon:'☽',Mars:'♂',Mercury:'☿',Jupiter:'♃',Venus:'♀',Saturn:'♄'};
const HORA_Q:Record<string,HoraSlot['quality']>={Jupiter:'excellent',Venus:'excellent',Mercury:'good',Moon:'good',Sun:'good',Mars:'neutral',Saturn:'neutral'};
export function getHoraTimeline(targetDate:Date,hoursAhead=12):HoraSlot[]{
  const start=new Date(targetDate);start.setMinutes(0,0,0);const now=Date.now();
  const slots:HoraSlot[]=[];
  for(let i=0;i<hoursAhead;i++){
    const t=start.getTime()+i*3600000,d=new Date(t),dow=d.getDay(),h=d.getHours();
    const dayLordIdx=[0,2,4,6,5,3,1][dow],pIdx=(dayLordIdx+h)%7,planet=HORA_P[pIdx];
    slots.push({planet,symbol:HORA_SYM[planet]??'★',startsAt:t,endsAt:t+3600000,isNow:now>=t&&now<t+3600000,quality:HORA_Q[planet]??'neutral'});
  }
  return slots;
}
export function getCurrentHora(d:Date=new Date()):string{
  return HORA_P[([0,2,4,6,5,3,1][d.getDay()]+d.getHours())%7];
}

// ─── Dynamic Remedies ──────────────────────────────────────────────────────────
export interface RemedyItem{category:'mantra'|'gemstone'|'color'|'ritual'|'donation';planet:string;title:string;detail:string;urgency:'PRIMARY'|'SECONDARY'|'PRACTICAL'|'OPTIONAL';}
const MANTRAS:Record<string,string>={Sun:'Om Suryaya Namaha (108x) — daily at sunrise facing East',Moon:'Om Chandraya Namaha (108x) — Monday mornings',Mars:'Om Angarakaya Namaha (108x) — Tuesday',Mercury:'Om Budhaya Namaha (108x) — Wednesday mornings',Jupiter:'Om Brihaspataye Namaha (108x) — Thursday',Venus:'Om Shukraya Namaha (108x) — Friday',Saturn:'Om Shanaischaraya Namaha (108x) — Saturday',Rahu:'Om Rahave Namaha (108x) — Saturday',Ketu:'Om Ketave Namaha (108x) — Tuesday'};
const GEMS:Record<string,string>={Sun:'Ruby (Manik)',Moon:'Pearl (Moti)',Mars:'Red Coral (Moonga)',Mercury:'Emerald (Panna)',Jupiter:'Yellow Sapphire (Pukhraj)',Venus:'Diamond or White Sapphire',Saturn:'Blue Sapphire (Neelam)',Rahu:'Hessonite Garnet (Gomed)',Ketu:"Cat's Eye (Lahsuniya)"};
const COLORS:Record<string,string>={Sun:'deep orange or gold',Moon:'white or cream',Mars:'red or coral',Mercury:'green or emerald',Jupiter:'yellow or saffron',Venus:'white or light pink',Saturn:'dark blue or black',Rahu:'smoky grey or dark blue',Ketu:'multi-color or grey-brown'};
const DONATIONS:Record<string,string>={Sun:'wheat, jaggery on Sundays',Moon:'rice, milk, white cloth on Mondays',Mars:'red lentils, red cloth on Tuesdays',Mercury:'green moong, green cloth on Wednesdays',Jupiter:'yellow chana dal, turmeric on Thursdays',Venus:'white rice, white sugar, white cloth on Fridays',Saturn:'black sesame, mustard oil on Saturdays',Rahu:'black items, coconut on Saturdays',Ketu:'multi-colored cloth, blankets on Tuesdays'};
export function generateRemedies(mahadasha:string,antardasha:string,debilitatedPlanets:string[],afflictedHouses:{planet:string;house:number}[]):RemedyItem[]{
  const items:RemedyItem[]=[];
  items.push({category:'mantra',planet:mahadasha,urgency:'PRIMARY',title:`${mahadasha} Mantra (Mahadasha Lord)`,detail:MANTRAS[mahadasha]??`Recite ${mahadasha} mantra 108x daily.`});
  items.push({category:'gemstone',planet:mahadasha,urgency:'PRIMARY',title:`${GEMS[mahadasha]??mahadasha+' gem'} (Mahadasha Lord)`,detail:'Wear only after astrological consultation. Energize on correct weekday with mantra.'});
  if(antardasha!==mahadasha)items.push({category:'mantra',planet:antardasha,urgency:'SECONDARY',title:`${antardasha} Mantra (Antardasha Lord)`,detail:MANTRAS[antardasha]??`Recite ${antardasha} mantra 108x daily.`});
  items.push({category:'color',planet:mahadasha,urgency:'PRACTICAL',title:`Lucky Colors — ${mahadasha} Dasha`,detail:`Wear ${COLORS[mahadasha]??'neutral colors'} (primary); ${COLORS[antardasha]??'mixed'} (secondary) during ${mahadasha}–${antardasha} period.`});
  for(const p of debilitatedPlanets)items.push({category:'ritual',planet:p,urgency:'SECONDARY',title:`${p} Debilitation Remedy`,detail:`${MANTRAS[p]??''} + Donate ${DONATIONS[p]??'appropriate items'}.`});
  for(const {planet,house} of afflictedHouses)if(!['Rahu','Ketu'].includes(planet))items.push({category:'donation',planet,urgency:'PRACTICAL',title:`${planet} Donation (${house}th house)`,detail:`Donate ${DONATIONS[planet]??'appropriate items'} on the correct weekday.`});
  items.push({category:'mantra',planet:'Ganesha',urgency:'OPTIONAL',title:'Ganesha Obstacle-Remover',detail:'Om Gam Ganapataye Namaha (21x) before any important event.'});
  return items;
}