# Kiro detailed weekly plan

## Role

Kiro is the primary tool for structured, spec-driven work on `Vedic_Rajkumar`. It should be used where correctness, architecture, testing discipline, and production hardening matter more than raw speed. The project's biggest gaps are still validation accuracy, secure data handling, and consistent quality across the four core flows, so Kiro is best positioned to drive those areas.

## Main objective

Use Kiro to move the app from a promising prototype toward a trustworthy product by focusing on:

- chart accuracy validation
- engine gap reduction
- security and privacy hardening
- stability and production readiness
- UX polish for the four core flows
- only a small number of high-value features after the foundation is stronger

## Working model

For each major task, use this sequence:

1. Write a spec.
2. Turn the spec into requirements.
3. Create a design.
4. Break the work into tasks.
5. Implement.
6. Add or update tests.
7. Review against acceptance criteria.

This tool should not be used for feature sprawl, vague experimentation, or large numbers of partially validated modules.

## Weekly plan

### Week 1: Accuracy foundation

Focus on building the first reliable validation layer for the astrology engine.

Goals:

- define how chart accuracy will be measured
- pick 12 to 15 reference charts
- compare lagna, planet degrees, signs, nakshatra, pada, and Vimshottari start points
- make the suite rerunnable and easy to inspect

Expected work:

- create a detailed validation spec
- define trusted reference sources and acceptable tolerance ranges
- build the first version of the validation test suite
- create an output format for comparison reports

Expected result:

- a working accuracy-validation baseline
- a report template that clearly shows mismatches

Prompt template:

```markdown
Create a full spec for an accuracy validation suite for the Vedic_Rajkumar app. The suite should validate 12–15 reference charts against Swiss Ephemeris or another trusted reference. Cover lagna, planet signs and degrees, nakshatra and pada, and Vimshottari dasha start points. Produce requirements, design, task breakdown, implementation plan, and tests. Keep the output focused on correctness and repeatability, not feature expansion.
```

### Week 2: Accuracy expansion and engine gaps

Focus on reducing known accuracy weaknesses revealed by week 1.

Goals:

- improve ayanamsa handling
- add edge-case validation
- increase confidence in divisional charts
- expose where engine logic is incomplete or only partially implemented

Expected work:

- review all mismatches from week 1
- identify rule gaps versus target references
- extend tests to D9, D10, and base dasha cases
- document unresolved logic areas clearly

Expected result:

- broader test coverage
- better visibility into actual calculation reliability
- an early internal accuracy dashboard or status summary

Prompt template:

```markdown
Using the existing validation suite, identify and implement missing edge-case rules in the astrology engine. Improve ayanamsa handling and add test coverage for D9, D10, and core dasha calculations. Follow a spec-driven flow: requirements, design, tasks, implementation, and tests. Show where current logic differs from the expected reference outputs.
```

### Week 3: Security and data layer

Focus on securing the project's personal data flows.

Goals:

- implement real row-level protection
- connect authentication and data ownership correctly
- support privacy-sensitive user operations
- reduce abuse risk on costly endpoints

Expected work:

- spec Supabase RLS for saved charts and reading-related data
- define Clerk to Supabase identity linking rules
- implement export and delete endpoints
- add basic rate limiting where needed

Expected result:

- a secure data baseline
- clearer ownership controls
- reduced risk around private birth data

Prompt template:

```markdown
Create a structured spec to harden the data layer of Vedic_Rajkumar. Implement Supabase RLS for user-owned data, secure Clerk-to-Supabase linking, and add data export and delete endpoints. Include basic rate limiting for sensitive or expensive endpoints. Deliver requirements, design, tasks, implementation, and validation tests.
```

### Week 4: Production hardening

Focus on reducing the gap between prototype and safe public usage.

Goals:

- improve production safety
- make privacy and consent explicit
- strengthen observability
- make environment handling safer

Expected work:

- add privacy policy and consent flows
- validate environment configuration
- add error monitoring hooks
- reduce risky development fallbacks in production

Expected result:

- a more production-aware application
- more trustworthy deployment behavior

Prompt template:

```markdown
Create a production-hardening spec for Vedic_Rajkumar. Add privacy policy flows, consent handling, production-safe environment validation, and error monitoring hooks. Keep the project clearly marked as a prototype where appropriate. Deliver implementation details, tests where applicable, and a list of follow-up risks.
```

### Week 5: Core polish I

Focus on `Kundli` and `Prashna`, the first two core flows.

Goals:

- standardize state handling
- improve mobile usability
- improve user trust during loading and errors
- reduce rough edges in the main journeys

Expected work:

- define loading, empty, error, and success states
- improve visual consistency
- tighten validation and recovery messaging
- improve responsive behavior

Expected result:

- noticeably more polished `Kundli` and `Prashna` experiences

Prompt template:

```markdown
Write a spec and implement UX polish for Kundli and Prashna in Vedic_Rajkumar. Standardize loading, empty, error, and success states. Improve mobile responsiveness and accessibility. Keep the scope limited to the two core flows. Include a before/after checklist and tests if practical.
```

### Week 6: Core polish II

Focus on `Matchmaking` and `Panchang`.

Goals:

- complete core-flow consistency
- strengthen accessibility
- ensure keyboard and focus behavior is usable

Expected work:

- repeat the week 5 polish process for the remaining two core flows
- fix visible focus issues
- improve keyboard navigation where necessary
- align visuals and feedback states

Expected result:

- all four core experiences feel more stable and coherent

Prompt template:

```markdown
Write a spec and implement UX polish for Matchmaking and Panchang in Vedic_Rajkumar. Standardize state handling, improve keyboard navigation and visible focus states, and fix consistency issues across layouts. Keep the implementation narrow and testable.
```

### Week 7: Selective feature 1

Focus on one high-value feature only.

Recommended options:

- `Dasha + Transit correlation view`
- improved professional `PDF reports`

Goals:

- avoid bloat
- deliver something deep and useful
- choose a feature that compounds product trust or user retention

Expected work:

- evaluate options by impact and implementation risk
- produce a spec for one selected feature
- build it with tests and quality gates

Expected result:

- one meaningful, usable addition rather than multiple weak modules

Prompt template:

```markdown
Create a spec for one high-ROI feature only. Preferred options are Dasha + Transit correlation view or improved professional PDF reports. Evaluate complexity, user value, and fit with the current architecture, then implement the chosen feature with tests. Do not introduce feature sprawl.
```

### Week 8: Selective feature 2 or hardening pass

Focus on a second high-value feature only if the foundation is holding.

Recommended options:

- `multi-profile family mode`
- hardening and improving the week 7 feature

Goals:

- deepen usability
- increase repeat use
- maintain quality discipline

Expected work:

- assess whether another feature is justified
- if yes, implement family mode carefully
- if no, improve reliability and completeness of week 7 output

Expected result:

- either a second strong feature or a much more reliable first feature

Prompt template:

```markdown
Based on the current state of the product, either implement multi-profile family mode or harden the week 7 feature. Follow a full spec-driven workflow. Favor depth, reliability, and production readiness over adding a broad new surface area.
```

## Success criteria

At the end of the Kiro cycle, you should have:

- an accuracy suite that exposes real engine quality
- stronger security controls for personal birth data
- more production-safe deployment behavior
- visibly better core-flow UX
- no unnecessary explosion of unfinished modules

## Review checklist

Use this at the end of each week:

- Did the work reduce risk in one of the priority areas?
- Is there a written spec or clear design artifact?
- Are acceptance criteria explicit?
- Did tests improve or at least remain credible?
- Did the week add depth rather than surface area?
- Is the result something you would trust more than the prior week?

## Best use summary

Use Kiro when the task needs discipline, correctness, and follow-through. If a task is foundational or risky, Kiro should lead it.
