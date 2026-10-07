# Week 10 — Advanced Transit System (Gochar)

Sidereal (Lahiri) transit engine covering whole-sign drishti, Sade Sati / Ashtama / Kantaka Shani, Bhinnashtakavarga + Sarvashtakavarga scoring, Vedha obstruction, panchang, muhurta windows, and alert subscriptions.

## Modules

- `src/astrology/core` — grahas, rashis, pluggable ephemeris
- `src/astrology/transits` — aspects, Sade Sati, Vedha
- `src/astrology/ashtakavarga` — BAV / SAV
- `src/services/transits/transitService.ts` — snapshot + ingress calendar
- `supabase/functions/transit-calendar` and `transit-alerts`

## Tests

```bash
npx vitest run src/test/transits
```
