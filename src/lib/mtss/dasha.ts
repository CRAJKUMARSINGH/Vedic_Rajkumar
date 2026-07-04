import { VIMSHOTTARI_SEQUENCE, NAKSHATRA_LORD_ORDER } from "./seedData";

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

export interface MarriageWindow {
  from: string;
  to: string;
  strength: "Very Strong" | "Strong" | "Moderate";
  reason: string;
}

const MARRIAGE_LORDS = ["Venus", "Jupiter", "Moon"];
const STRONG_LORDS = ["Venus", "Jupiter"];

/** BUG FIX #1: Use millisecond-exact arithmetic (years × 365.25 days) to avoid
 *  the 30-day-month drift that caused up to 12-year boundary errors. */
function addYears(date: Date, years: number): Date {
  const MS_PER_YEAR = 365.25 * 24 * 3600 * 1000;
  return new Date(date.getTime() + years * MS_PER_YEAR);
}

function fmt(d: Date): string {
  return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

export function calcVimshottariDashas(
  birthDate: Date,
  moonNakshatra: string,
  moonLongSidereal: number
): DashaPeriod[] {
  const nakIdx = Math.floor(moonLongSidereal / (360 / 27));
  const posInNak = moonLongSidereal - nakIdx * (360 / 27);
  const fracElapsed = posInNak / (360 / 27);

  const lordIdx = NAKSHATRA_LORD_ORDER.indexOf(
    VIMSHOTTARI_SEQUENCE[nakIdx % 9].lord
  );
  const firstSeqIdx = nakIdx % 9;
  const firstLord = VIMSHOTTARI_SEQUENCE[firstSeqIdx];
  const balanceYears = firstLord.years * (1 - fracElapsed);

  const today = new Date();
  const periods: DashaPeriod[] = [];
  let cursor = new Date(birthDate);

  for (let i = 0; i < 9; i++) {
    const seqIdx = (firstSeqIdx + i) % 9;
    const md = VIMSHOTTARI_SEQUENCE[seqIdx];
    const dur = i === 0 ? balanceYears : md.years;
    const start = new Date(cursor);
    const end = addYears(cursor, dur);
    const isCurrent = today >= start && today < end;

    const antardashas: AntarDasha[] = [];
    let adCursor = new Date(start);
    for (let j = 0; j < 9; j++) {
      const adIdx = (seqIdx + j) % 9;
      const ad = VIMSHOTTARI_SEQUENCE[adIdx];
      const adYears = (dur * ad.years) / 120;
      const adStart = new Date(adCursor);
      const adEnd = addYears(adCursor, adYears);
      const adCurrent = today >= adStart && today < adEnd;
      const isMarFav = MARRIAGE_LORDS.includes(ad.lord) || MARRIAGE_LORDS.includes(md.lord);
      let note = "";
      if (ad.lord === "Venus" || md.lord === "Venus")
        note = "Venus active — prime marriage significator (Kalatrakaraka)";
      else if (ad.lord === "Jupiter" || md.lord === "Jupiter")
        note = "Jupiter active — marriage karaka, auspicious for wedding";
      else if (ad.lord === "Moon")
        note = "Moon period — emotional readiness for commitment";
      antardashas.push({
        lord: ad.lord,
        startDate: adStart,
        endDate: adEnd,
        isCurrent: adCurrent,
        isMarriageFavorable: isMarFav,
        note,
      });
      adCursor = new Date(adEnd);
    }

    periods.push({ lord: md.lord, startDate: start, endDate: end, years: dur, isCurrent, antardashas });
    cursor = new Date(end);
  }
  return periods;
}

export function getMarriageWindows(periods: DashaPeriod[]): MarriageWindow[] {
  const windows: MarriageWindow[] = [];
  const today = new Date();
  for (const md of periods) {
    if (md.endDate < today) continue;
    for (const ad of md.antardashas) {
      if (ad.endDate < today) continue;
      if (!ad.isMarriageFavorable) continue;
      const mLord = md.lord;
      const aLord = ad.lord;
      let strength: MarriageWindow["strength"] = "Moderate";
      if (STRONG_LORDS.includes(mLord) && STRONG_LORDS.includes(aLord)) strength = "Very Strong";
      else if (STRONG_LORDS.includes(mLord) || STRONG_LORDS.includes(aLord)) strength = "Strong";
      windows.push({
        from: fmt(ad.startDate < today ? today : ad.startDate),
        to: fmt(ad.endDate),
        strength,
        reason: `${mLord} Mahadasha – ${aLord} Antardasha${ad.note ? ": " + ad.note : ""}`,
      });
      if (windows.length >= 4) return windows;
    }
  }
  return windows;
}
