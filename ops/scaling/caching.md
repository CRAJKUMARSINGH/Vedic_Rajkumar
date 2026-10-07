# Caching Strategy

## Layers

1. **CDN edge** — static assets immutable-hashed, `Cache-Control: public, max-age=31536000, immutable`
2. **Edge function cache** — panchang/transit snapshots cached 15–60 min (slow-moving data)
3. **DB materialized views** — expensive aggregates (SAV, accuracy stats) refreshed hourly
4. **Client** — React Query staleTime per data class

## Cache headers by route

| Route              | Header                                    |
| ------------------ | ----------------------------------------- |
| /assets/*          | max-age=31536000, immutable               |
| /v1/panchang/:date | s-maxage=3600, stale-while-revalidate=600 |
| /v1/transits/:id   | s-maxage=1800                             |
| /v1/charts/:id     | private, max-age=300                      |
| /health            | no-store                                  |
