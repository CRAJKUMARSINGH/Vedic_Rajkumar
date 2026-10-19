# Chart Timezone Migration

Slices 1–5 built the resolver, the corpus, the UI chip, and the wrapper.  
This document covers the mechanical part: making production code actually use it.

## The bug being fixed

`calculatePreciseChart(date, time, lat, lon, tzOffsetHours = 5.5)` defaults to
modern IST (+5:30) for every chart, regardless of the birth year.

India has had multiple historical offsets. For a 1943 Mumbai birth at 04:27,
the wartime offset was UTC+6:30 — 1 hour different from IST. That is ~15° of
ascendant error — **an entire rashi wrong**. Most Jyotish apps have this bug.

## Run it

```bash
npm run migrate:chart-tz          # dry run — prints the plan
npm run migrate:chart-tz:write    # applies it
npm run typecheck
npm run test:run
```

`src/tests/chartTimezoneWiring.test.ts` fails until the migration is complete.
That failure IS the worklist — it names every file and line.

## What the codemod changes

```diff
- import { calculatePreciseChart } from '@/services/precisionEphemerisService';
+ import { calculateChartForBirth } from '@/services/chartWithTimezone';

- const chart = calculatePreciseChart(date, time, lat, lon);
+ const chart = calculateChartForBirth(date, time, lat, lon);
```

Other names imported from `precisionEphemerisService` survive unchanged.
If the old name is still used in a `typeof` type position, the original import
is kept alongside the new one.

## The cache key trap

**The migration introduces a cache bug if you do not handle it.**

A cache keyed on date + time + coordinates alone cannot distinguish an IST chart
from a wartime chart for the same birth moment. Same key, wrong result served.

Fix: use `chartCacheKeyForBirth` from `src/lib/chartCacheKey.ts`:

```diff
- const key = `${date}|${time}|${lat}|${lon}`;
+ const key = chartCacheKeyForBirth(date, time, lat, lon);
```

`legacyChartCacheKey` is kept so a test can demonstrate the collision rather than
assume it doesn't exist.

## Allow list

`tools/accuracy/chartTzAllowList.json` names files permitted to call
`calculatePreciseChart` directly:

| Entry                                       | Reason                                       |
| ------------------------------------------- | -------------------------------------------- |
| `src/services/precisionEphemerisService.ts` | the function definition itself               |
| `src/services/chartWithTimezone.ts`         | the wrapper — calls through on purpose       |
| `src/tests/**`                              | tests pin offsets explicitly for determinism |

A stale entry (file gone or no longer referencing the function) fails the guard,
so exemptions get cleaned up automatically.

## Verify by hand once

1. Open `/horoscope`, enter `15/06/1943` and `Mumbai`
2. The timezone chip should show `UTC+06:30` with a wartime note
3. Cast the chart — the ascendant must differ from the same chart at IST by
   roughly 15° (one full rashi)

If it does not differ, the offset is not reaching the engine.

## Historical India timezone reference

| Period                  | Offset         | Notes                         |
| ----------------------- | -------------- | ----------------------------- |
| pre-1905                | LMT (lon/15 h) | Local Mean Time               |
| 1905-06-01 – 1905-12-31 | +5:21 (HMT)    | Madras Time, rounded to +5:30 |
| 1906-01-01 – 1941-09-30 | +5:30 (IST)    | Standard IST adopted          |
| 1941-10-01 – 1942-05-14 | +6:30          | Wartime advance #1            |
| 1942-05-15 – 1942-08-31 | +5:30          | Reverted to IST               |
| 1942-09-01 – 1945-10-14 | +6:30          | Wartime advance #2            |
| 1945-10-15 – present    | +5:30 (IST)    | Final revert                  |
