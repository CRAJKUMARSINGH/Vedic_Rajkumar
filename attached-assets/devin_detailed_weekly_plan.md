# Devin detailed weekly plan

## Role

Devin is the secondary tool and should be used as a parallel autonomous worker for clearly scoped tasks in `Vedic_Rajkumar`. It is most useful when the task has crisp acceptance criteria, a measurable outcome, and enough structure that it can work independently without drifting into speculative astrology logic.

## Main objective

Use Devin to increase throughput on implementation-heavy work that can run in parallel with Kiro-led planning and review. The best use cases are:

- validation suite implementation
- testing expansion
- security implementation
- report and PDF polish
- larger bounded features with defined outcomes

## Working model

Treat Devin like an autonomous engineer working from a ticket.

Each Devin task should include:

1. a narrow scope
2. a clear definition of done
3. measurable acceptance criteria
4. any constraints on libraries, architecture, or product behavior
5. a review expectation such as tests, reports, or PR output

Do not give Devin vague prompts like "improve the astrology engine" unless you want uneven results. It performs best when the destination is concrete.

## Weekly plan

### Week 1: Validation suite build

Focus on building an autonomous version of the validation machinery.

Goals:

- run known charts consistently
- compare outputs to a trusted reference
- generate mismatch reports
- make the result reusable in CI or repeated QA passes

Expected work:

- implement the core test runner
- structure comparison output
- include clear mismatch labels
- make it rerunnable without manual cleanup

Expected result:

- a usable validation suite with readable side-by-side results

Prompt template:

```markdown
Build a validation suite for the Vedic_Rajkumar repo that runs 15 known charts and outputs a side-by-side comparison report against Swiss Ephemeris. Acceptance criteria: reproducible runs, readable report output, clear mismatch reporting, and tests or scripts that can be rerun in CI.
```

### Week 2: Accuracy follow-through

Focus on extending the validation system beyond the initial baseline.

Goals:

- increase coverage
- expose deeper mismatches
- organize unresolved discrepancies

Expected work:

- expand validation to house cusps and more planetary checkpoints
- validate more dasha-related outputs
- summarize likely causes for mismatches

Expected result:

- better visibility into which engine areas are strong and which are weak

Prompt template:

```markdown
Extend the accuracy validation suite to include house cusps, more planetary checkpoints, and additional dasha validation points. Flag all mismatches clearly and propose likely causes. Acceptance criteria: broader coverage, stable output format, and a short summary of unresolved issues.
```

### Week 3: Security implementation

Focus on turning data-layer plans into actual enforcement.

Goals:

- isolate user data properly
- prevent unauthorized access
- support privacy-sensitive operations

Expected work:

- implement Supabase RLS for saved charts and reading tables
- support export and delete actions
- verify policies through tests or proof cases

Expected result:

- a reviewable security implementation instead of just a design

Prompt template:

```markdown
Implement complete Supabase RLS policies for saved charts and reading-related tables in Vedic_Rajkumar. Add export and delete flows for user data. Acceptance criteria: user data isolation, tested policies, and documentation of assumptions.
```

### Week 4: PDF and report polish

Focus on a bounded but high-value quality area.

Goals:

- improve professional feel of generated reports
- eliminate overlapping or broken layout
- support Devanagari output properly

Expected work:

- fix layout collisions
- add correct font embedding where needed
- improve overall readability without changing product direction

Expected result:

- export output that is far more presentable and reliable

Prompt template:

```markdown
Fix PDF report issues in Vedic_Rajkumar. Eliminate overlapping text, embed proper Devanagari font support, and improve the visual layout while preserving the existing Ganesh-style motif. Acceptance criteria: clean rendering on sample reports and no overlap on common content lengths.
```

### Week 5: Testing expansion for Kundli and Prashna

Focus on protecting the first two high-priority user journeys.

Goals:

- reduce regression risk
- verify happy paths and important edge cases
- expose brittle points in current behavior

Expected work:

- generate integration tests for `Kundli`
- generate integration tests for `Prashna`
- repair broken paths revealed by testing

Expected result:

- stronger confidence in the two most important flows

Prompt template:

```markdown
Generate integration tests for the Kundli and Prashna user journeys in Vedic_Rajkumar and repair failing paths uncovered by the tests. Acceptance criteria: passing tests for the main happy paths, at least some key edge cases, and reduced manual regression risk.
```

### Week 6: Regression hardening for Matchmaking and Panchang

Focus on the remaining two core flows.

Goals:

- bring test maturity across all four main product areas
- reduce hidden breakage
- make future refactors safer

Expected work:

- extend integration and unit coverage to `Matchmaking`
- extend integration and unit coverage to `Panchang`
- fix failing states as they are found

Expected result:

- all four core flows have at least a credible automated safety net

Prompt template:

```markdown
Extend integration and unit coverage to Matchmaking and Panchang in Vedic_Rajkumar. Acceptance criteria: automated coverage of the core flows, clear test organization, and fixes for any broken states discovered during implementation.
```

### Week 7: Feature build for family profiles

Focus on one larger autonomous feature.

Goals:

- improve repeat use
- support multiple saved profiles cleanly
- preserve data separation

Expected work:

- add create, edit, select, and switch profile behavior
- integrate saved birth data into core flows
- prevent profile mix-ups or leakage

Expected result:

- a practical feature users can return to regularly

Prompt template:

```markdown
Implement multi-profile family mode in Vedic_Rajkumar with profile switching, saved birth data handling, and a clean UI integration. Acceptance criteria: multiple profiles can be created, selected, edited, and used across core chart flows without data leakage.
```

### Week 8: Timeline feature

Focus on a second large feature only if the previous weeks are in good shape.

Goals:

- improve user value without diluting product focus
- present ongoing astrology insights more clearly

Expected work:

- build a `Dasha + Transit timeline` view
- show current Mahadasha and Antardasha with major transits
- make the presentation readable, not overloaded

Expected result:

- a feature with strong perceived value if implemented cleanly

Prompt template:

```markdown
Build a Dasha + Transit timeline view for Vedic_Rajkumar that presents current Mahadasha and Antardasha alongside major transit windows in a readable format. Acceptance criteria: usable timeline presentation, clear data sourcing, and stable rendering across common user scenarios.
```

## Success criteria

At the end of the Devin cycle, you should have:

- more autonomous throughput without losing reviewability
- broader validation and test coverage
- implemented security improvements, not just plans
- one or two bounded features that feel complete enough to review

## Review checklist

At the end of each Devin task, check:

- Was the scope narrow enough?
- Are the acceptance criteria actually met?
- Is there evidence in tests, reports, or screenshots?
- Did the task create hidden complexity?
- Would you merge this after review, or does it need major rewriting?

## Best use summary

Use Devin for well-bounded autonomous tickets that can run in parallel while you keep human control over architecture, domain judgment, and final quality decisions.
