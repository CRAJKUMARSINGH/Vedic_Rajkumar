# FEATURE READINESS — honest status (2026-11-16)

Only features verified end-to-end are marked Ready. "Prototype" = UI exists,
partial backend/validation.

| Feature                                                       | Route                  | Status                               | Evidence                                         |
| ------------------------------------------------------------- | ---------------------- | ------------------------------------ | ------------------------------------------------ |
| Kundli (birth chart)                                          | `/horoscope`, `/` calc | Ready                                | persona basic/intermediate PASS; engine tests    |
| Prashna (horary)                                              | `/question`, `/horary` | Ready                                | persona prashna verdict PASS                     |
| Kundli Milan                                                  | `/matchmaking`         | Ready                                | persona compatibility PASS; ashtakuta tests      |
| Panchang                                                      | `/panchang`            | Ready                                | persona + offline SW test PASS                   |
| PDF/print export                                              | report flows           | Ready (control wired)                | persona intermediate #10                         |
| Privacy settings                                              | `/privacy-settings`    | Ready                                | demo + Clerk-configured verified                 |
| Date validation                                               | birth forms            | Ready                                | strict parser, 17 unit + 3 e2e cases             |
| Dasha / Yogas / Divisional charts                             | tabs on `/`            | Ready (engine-verified)              | unit suites                                      |
| Tajik / KP / Jaimini / Lal Kitab / Vaastu / Western / Chinese | various                | Prototype→Ready varies               | in quick links; per-page tests exist for several |
| AI predictions                                                | `/ai-predictions`      | Prototype                            | requires API keys; kill-switches present         |
| Supabase cloud sync                                           | auth'd flows           | Ready when Clerk+Supabase configured | edge functions + RLS                             |

Rule: do not advertise Prototype rows as complete in README/marketing.
