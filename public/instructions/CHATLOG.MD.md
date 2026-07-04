# CHATLOG — Vedic Rajkumar: Marriage Prospect Finder

## Session Date: 27 May 2026

---

## 📌 Task Overview

**Primary Goal:** Find marital prospects for **Priyvrit Singh** (also spelled Priyawrit Singh Ranawat) using the Vedic Rajkumar astrology app at [github.com/CRAJKUMARSINGH/Vedic_Rajkumar](https://github.com/CRAJKUMARSINGH/Vedic_Rajkumar).

---

## 👤 Subject Profiles (from JATAKS_DATABASE.json)

### Priyvrit Singh (Priyawrit Singh Ranawat) — jatak_016
| Field | Value |
|-------|-------|
| **DOB** | 08 October 1999 |
| **Time** | 07:43 AM |
| **Place** | Udaipur, Rajasthan |
| **Coordinates** | 24.59°N, 73.71°E |
| **Moon Rashi** | Leo (सिंह) — Index 4 |
| **Moon Nakshatra** | Uttara Phalguni, Pada 1 |
| **Nakshatra Lord** | Sun (Surya) |
| **Nakshatra Deity** | Aryaman (god of contracts & partnership) |
| **Moon Sidereal** | ~149.09° |
| **Current Dasha** | Rahu Mahadasha → Jupiter Antardasha (ends Oct 2026) |
| **Relationship** | Friend/Relative |

### Priyraj Singh Ranawat — jatak_015
| Field | Value |
|-------|-------|
| **DOB** | 30 January 1997 |
| **Time** | 06:26 AM |
| **Place** | Udaipur, Rajasthan |
| **Coordinates** | 24.59°N, 73.71°E |
| **Relationship** | Friend/Relative |

---

## 🔄 Session 1: Initial App Build (7 hours ago)

### What was requested:
- Find marital prospects for "Priyvrit Singh" using the app at the GitHub repo
- His birth data is in the JATAKS seed database

### What was built:
1. **Vedic Kundali Milan Web App** (Vite + React + TailwindCSS)
   - Location: `Marriage-Prospect-Finder/artifacts/vedic-matchmaking/`
   - Pre-filled with Priyvrit Singh's data from seed (initially used jatak_005 Rajkumar's data — DOB 15 Sep 1963)
   - 5 sample female prospects with Ashtakuta Guna Milan scoring
   - Full 8-Koota breakdown: Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, Nadi
   - Score circle visualization with color-coded categories

### Key Files Created:
- `src/data/seedData.ts` — Groom data + 27 Nakshatras + Rashi names
- `src/services/ashtakuta.ts` — Complete Ashtakuta compatibility engine (378 lines)
- `src/services/dasha.ts` — Vimshottari Dasha calculator with Antardasha
- `src/pages/Home.tsx` — Full UI with prospect cards, detail panels, score circles
- `src/index.css` — Saffron/gold spiritual design palette

---

## 🔄 Session 2: Priyraj Addition

### What was requested:
- Add Priyraj (30 Jan 1997, 06:26 AM, Udaipur) as a groom

### What was done:
- Added Priyraj to JATAKS_DATABASE.json as jatak_015
- Built initial prospect matching for him

---

## 🔄 Session 3: MTSS Panel

### What was requested:
- "Probable time of marriage, characteristics of spouse, any spiritual remedy to adhere?"
- "Name it MTSS Panel"

### What was built:
**MTSS Panel** — Marriage Timing · Spouse Characteristics · Spiritual Remedies

#### ⏳ Marriage Timing Tab:
- Current dasha period display with badge
- Urgency banner for active window
- Auspicious marriage windows ranked by strength
- Full Mahadasha sequence timeline
- Antardasha sequence with marriage-favorable markers
- Jyotisha insight box

#### 💑 Spouse Profile Tab:
- Physical appearance (derived from 7th house)
- Nature & personality
- Career & background
- Spiritual & values
- Relationship style
- Best Moon sign matches
- Nadi compatibility warning

#### 🕉 Spiritual Remedies Tab:
- Homam/Puja: Swayamvara Parvathi, Surya Graha Puja, Rahu Shanti
- Mantras: Katyayani (41 days), Surya Beej, Rahu Beej, Vishnu Sahasranama
- Daan: Sunday (Sun), Saturday (Rahu/Saturn), Friday (Venus)
- Gemstone & Yantra: Ruby, Shukra Yantra
- Lifestyle: Arghya, Somvar Vrat, Soundarya Lahari, Rahu Kalam avoidance

---

## 🔄 Session 4: Switch to Priyvrit Singh as Groom

### What was requested:
- "Now Priyvrit Singh a groom 08 October 1999, 07:43 AM, Udaipur"

### What was done:
1. Computed Moon Nakshatra: **Uttara Phalguni Pada 1** (Sun's nakshatra)
2. Moon Rashi: **Leo (सिंह)** — Index 4
3. Moon Sidereal: **~149.09°**
4. Added as jatak_016 in JATAKS_DATABASE.json
5. Updated entire app:
   - Groom card → Priyvrit Singh
   - All 5 prospects re-ranked with his Uttara Phalguni data
   - MTSS Panel updated:
     - Current dasha: Rahu MD → Jupiter AD (ends Oct 2026)
     - 7th house from Leo = Aquarius (Saturn)
     - Spouse profile derived from Aquarius/Saturn/Uttara Phalguni
     - All remedies updated for Sun nakshatra lord + Rahu MD
   - Urgency banner: "Active Window Closing Soon — Oct 2026"

### Current Prospect Rankings (Priyvrit as groom):
| Rank | Name | Nakshatra | Rashi | Score | Rating |
|------|------|-----------|-------|-------|--------|
| 1 | Priya Sharma | Ashwini | Aries | 23.5/36 | Good |
| 2 | Kavya Verma | Rohini | Taurus | ~22/36 | Good |
| 3 | Sunaina Joshi | Uttara Phalguni | Virgo | ~20/36 | Good |
| 4 | Meera Gupta | Revati | Pisces | ~19/36 | Average |
| 5 | Divya Sisodia | Anuradha | Scorpio | ~17/36 | Average |

---

## 🔮 Marriage Timing Analysis (Priyvrit Singh)

| Period | Dates | Strength | Notes |
|--------|-------|----------|-------|
| Rahu–Jupiter AD | May 2024 → Oct 2026 | **Strong** | Jupiter Vivaha Karaka active — **CURRENT** |
| Rahu–Saturn AD | Oct 2026 → Aug 2029 | Moderate | Saturn may delay |
| Rahu–Mercury AD | Aug 2029 → Mar 2032 | Moderate | Mercury neutral |
| Rahu–Venus AD | Mar 2033 → Mar 2036 | **Very Strong** | Venus Kalatrakaraka — best window |

**⚡ URGENT:** Current Jupiter AD window closes **October 2026** (~5 months).

---

## ✅ Completed Tasks
- [x] Analyzed GitHub repo structure and JATAKS database
- [x] Built Vedic Kundali Milan web app with Vite + React
- [x] Implemented complete Ashtakuta 8-Koota compatibility engine
- [x] Created Vimshottari Dasha calculator
- [x] Added Priyraj Singh (30 Jan 1997) as jatak_015
- [x] Built MTSS Panel (Marriage Timing · Spouse · Spiritual Remedies)
- [x] Switched groom to Priyvrit Singh (08 Oct 1999)
- [x] Computed Moon Nakshatra = Uttara Phalguni Pada 1
- [x] Updated JATAKS_DATABASE.json with jatak_016
- [x] Re-ranked all prospects against Priyvrit's chart
- [x] Updated MTSS Panel for Priyvrit's specific dasha/nakshatra

## 🔲 Pending / Due Tasks
- [ ] Add Navamsa (D9) chart analysis for Priyvrit
- [ ] Add real bride data (need actual prospect DOB/time/place)
- [ ] Auto-compute Moon Nakshatra from birth data (ephemeris integration)
- [ ] Add more realistic female prospects with varied nakshatras
- [ ] Cross-reference with main app's ashtakutaService.ts for calculation parity
- [ ] Validate dasha calculations against known Jyotish software

---

## 📂 File Inventory

### Marriage-Prospect-Finder App
```
Marriage-Prospect-Finder/artifacts/vedic-matchmaking/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── App.tsx (Router setup with wouter)
│   ├── main.tsx (Entry point)
│   ├── index.css (Saffron/gold theme, Inter font)
│   ├── data/
│   │   └── seedData.ts (PRIYVRIT_SINGH, 27 Nakshatras, Rashis)
│   ├── services/
│   │   ├── ashtakuta.ts (Full 8-Koota compatibility engine)
│   │   └── dasha.ts (Vimshottari + Marriage windows)
│   ├── pages/
│   │   ├── Home.tsx (Main UI: GroomCard + ProspectList + DetailPanel + MTSSPanel)
│   │   └── not-found.tsx
│   └── components/
│       └── ui/ (Radix UI components)
```

### Seed Data
```
jataks/JATAKS_DATABASE.json — 16 jataks including Priyvrit (jatak_016)
```

### Main App Reference
```
src/services/ashtakutaService.ts — Production Ashtakuta engine (886 lines)
src/pages/MatchMaking.tsx — Main app's matchmaking page
src/components/CompatibilityReport.tsx — Report component
```

---

## 🛠 Technology Stack
- **Framework:** Vite + React 18 + TypeScript
- **Styling:** TailwindCSS v4 with custom saffron/gold spiritual palette
- **Routing:** Wouter
- **UI Components:** Radix UI primitives
- **Font:** Inter (Google Fonts)
- **Ayanamsa:** Lahiri (Chitrapaksha)
- **Calculation Method:** Vedic/Sidereal

---

*Last updated: 27 May 2026, 3:30 PM IST*
