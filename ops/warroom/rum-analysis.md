# RUM Analysis Procedure

Source: PostHog `web_vital` events + Sentry + Web Vitals.

1. Pull p75 Web Vitals per route (last 24h).
2. Rank routes by LCP/INP/CLS over budget.
3. Cross-reference with Sentry top issues on those routes.
4. File a P1 perf ticket for any route >2× budget.
5. Fix top 3, redeploy behind canary.

## Query (PostHog)

```sql
SELECT properties.route, quantile(0.75)(properties.value) AS p75
FROM events WHERE event = 'web_vital' AND properties.name = 'LCP'
GROUP BY properties.route ORDER BY p75 DESC LIMIT 20
```

## Budgets

| Vital | Budget |
| ----- | ------ |
| LCP   | <2.5s  |
| INP   | <200ms |
| CLS   | <0.1   |
