# Vedic Rajkumar Product Brief

Last updated: 2026-09-02

## Product Focus

Vedic Rajkumar is a focused Jyotish application for users who want practical, transparent Vedic astrology tools without a noisy feature maze.

The current product promise is intentionally narrow:

- Cast a sidereal Lahiri Kundli from birth details.
- Ask a Prashna question and receive a grounded horary reading.
- Compare two charts through Kundli Milan.
- Check Panchang and Muhurta timing for daily decisions.

## Primary User

The primary user is an astrology-curious Indian or diaspora household user who wants trustworthy chart guidance in English or Hindi. They may not know technical Jyotish terminology, but they care about marriage, timing, career, family rituals, and auspicious dates.

Secondary users are practicing astrologers and advanced learners who want transparent intermediate data: graha positions, nakshatras, kutas, panchang limbs, and timing windows.

## Core Jobs

1. Generate a birth chart quickly from date, time, and place.
2. Understand the key chart factors without exaggerated claims.
3. Ask a focused Prashna question and see the reasoning chain.
4. Compare marriage compatibility using all 8 Ashta Koota factors.
5. Choose practical auspicious windows while avoiding Rahu Kalam and other blocked periods.

## What We Deliberately Do Not Promise Yet

- We do not claim fully validated accuracy for every advanced module.
- We do not promote Western, Chinese, Nadi, Lal Kitab, KP, medical, financial, or enterprise modules as production-ready.
- We do not claim that AI can answer every life question with certainty.
- We do not treat remedies as guaranteed outcomes.
- We do not ask users to trust interpretations without showing the chart factors behind them.

## Current Core Features

### Kundli

Input: name, local date, local time, place, latitude, longitude, timezone.

Output: sidereal chart data using Lahiri ayanamsa by default, planetary positions, houses, nakshatra/pada information, and related dasha context where available.

Success signal: the user can cast a chart and inspect the underlying positions without needing hidden assumptions.

### Prashna

Input: question, moment asked, location, timezone, and optional natal data.

Output: Prashna chart, verdict, confidence, significators, timing if applicable, and proportionate remedies.

Success signal: the answer explains why a verdict was reached instead of presenting unsupported certainty.

### Matchmaking

Input: birth data for two people.

Output: 36-point Ashta Koota breakdown, critical dosha flags, Manglik checks, strengths, shortcomings, and remedies where appropriate.

Success signal: the user can see how the score was built and whether a high score is weakened by critical doshas.

### Panchang and Muhurta

Input: date or date range, location, timezone, and optional purpose.

Output: five panchang limbs, sunrise/sunset context, inauspicious periods, auspicious periods, and ranked muhurta windows.

Success signal: the user receives a practical time window and clear reasons for avoiding blocked periods.

## Roadmap Boundary

Advanced modules remain visible as preview roadmap items so existing links do not break. A module graduates into the main navigation only when:

- Its inputs and outputs have TypeScript contracts.
- Its calculation path is testable outside React.
- It has at least basic known-case tests.
- The UI includes loading, empty, error, and success states.
- Marketing copy matches the actual validation level.

## Measurement

The next product-health metrics should be:

- Landing page to first Kundli conversion.
- Prashna question completion rate.
- Matchmaking report completion rate.
- Panchang repeat usage.
- Chart accuracy delta against reference cases.
- User-reported trust and clarity after reading a report.
