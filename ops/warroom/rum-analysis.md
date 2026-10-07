# Real-User Monitoring (RUM) Analysis Procedure

Source: PostHog `web_vital` events + Sentry issues + Web Vitals reporter.

---

## Daily procedure (first 30 days post-launch)

1. **Pull p75 Web Vitals per route (last 24 h)**

   PostHog query:

   ```sql
   SELECT properties.route,
          quantile(0.75)(properties.value) AS p75
   FROM events
   WHERE event = 'web_vital'
     AND properties.name = 'LCP'
     AND timestamp > now() - INTERVAL 1 DAY
   GROUP BY properties.route
   ORDER BY p75 DESC
   LIMIT 20
   ```

2. **Rank routes by budget breach**

   | Route        | LCP budget | Breach threshold |
   | ------------ | ---------- | ---------------- |
   | `/` landing  | 2500 ms    | > 3000 ms        |
   | `/horoscope` | 2500 ms    | > 3500 ms        |
   | `/panchang`  | 2000 ms    | > 3000 ms        |
   | `/dasha`     | 2500 ms    | > 3500 ms        |

3. **Cross-reference with Sentry**
   - Open Sentry → filter `release:latest`
   - Sort by `Affected Users` descending
   - For each top-5 issue: note the correlation ID and trace it in Logtail

4. **File P1 perf ticket** for any route > 2× budget — assign to current sprint

5. **Fix top 3, redeploy behind canary at 10%**

---

## Weekly trend review

Compare p75 LCP week-over-week per route. Any route regressing > 20% triggers
a regression analysis using `src/analytics/funnels/regressions.ts`.

---

## Alerting thresholds (PostHog)

| Vital | Good      | Needs improvement | Poor — alert |
| ----- | --------- | ----------------- | ------------ |
| LCP   | < 2500 ms | 2500–4000 ms      | > 4000 ms    |
| INP   | < 200 ms  | 200–500 ms        | > 500 ms     |
| CLS   | < 0.1     | 0.1–0.25          | > 0.25       |
| TTFB  | < 800 ms  | 800–1800 ms       | > 1800 ms    |

---

## Escalation

- Single route breach: file ticket, fix within 1 week
- 3+ routes in poor: P2 incident, freeze deploys
- Homepage LCP > 4s: P1 — on-call page
