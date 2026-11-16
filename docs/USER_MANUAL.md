# USER MANUAL — Vedic Rajkumar (quick reference)

## Getting started

1. Open the app → enter **Date of birth (DD/MM/YYYY)**, **Time (HH:MM, 24h)**,
   and **Place of birth** on the home form.
2. Pick a place suggestion from the dropdown (or type any city) → **Calculate**.
3. Results appear in tabs: Overview, Kundli, Transit, Dasha, Yogas, Advanced,
   Tajik, Deep Reading, Muhurta, Marriage (MTSS).

## Core journeys

- **Kundli** — full north-Indian chart, planetary positions (Lahiri ayanamsa),
  nakshatras, divisional charts, Vimshottari dasha.
- **Prashna** — ask a question with the moment/location; get a horary verdict.
- **Kundli Milan** — fill both partners' details → Ashta Koota (36-point)
  compatibility report.
- **Panchang** — choose date + city → Tithi, Vaara, Nakshatra, Yoga, Karana,
  sunrise/sunset. Works offline once loaded (PWA).
- **Language** — EN/HI toggle top-right; all core flows are bilingual.

## Privacy

`/privacy-settings`: manage consent, export your data (JSON), or delete it.
Export/delete need sign-in (Clerk); in demo mode they show an honest
"unavailable" notice — nothing is simulated. Birth data stays owner-scoped.

## Dates & times

- Birth date format: **DD/MM/YYYY** (e.g. 15/09/1963). Impossible dates
  (31/04, 29/02/1900) are rejected with a clear message.
- Supported range: 1800-01-01 → 2100-12-31. Future birth dates rejected.
- Time: 24-hour HH:MM; midnight 00:00 is valid.

## Keyboard & accessibility

- `Tab` through fields; in the place field use `↓`/`↑` + `Enter` to pick a
  suggestion, `Esc` to close, `Enter` to submit.
- All primary journeys are keyboard-completable.

## Troubleshooting

- Blank panchang offline on **dev server**: expected — the service worker only
  exists in the production build (`npm run build && npm run preview`).
- Geocoder suggestions need network once; pre-cached cities work offline.
