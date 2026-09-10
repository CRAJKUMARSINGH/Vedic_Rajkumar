# Trae detailed weekly plan

## Role

Trae is the daily driver for fast iteration on `Vedic_Rajkumar`. It should be used for quick UI improvements, layout cleanup, bilingual copy work, small component changes, scaffolding, and rapid experimentation. It is not the best primary tool for deep engine correctness or major security design, but it is excellent for keeping visible product quality moving every day.

## Main objective

Use Trae to improve the product's practical usability and polish while the heavier foundational work is handled elsewhere. The best areas for Trae are:

- landing-page messaging
- UI cleanup
- responsive fixes
- loading, empty, and error states
- fast prototyping of dashboards and feature shells
- bilingual English and Hindi copy refinement

## Working model

Treat Trae as the fast loop tool.

Use it when you want:

- a quick first pass
- UI scaffolding before hardening
- friction reduction in visible flows
- inexpensive iteration on design and product wording

Do not rely on it as the only source of truth for critical engine correctness or production security policy.

## Weekly plan

### Week 1: UI and copy cleanup

Focus on immediate trust and presentation improvements.

Goals:

- remove or soften unsupported trust claims
- tighten product copy
- improve the landing page and visible UI consistency

Expected work:

- review landing page messages
- soften claims like large usage or accuracy statements unless fully supported
- clean awkward or repetitive interface copy
- fix small visual inconsistencies

Expected result:

- a more honest and polished first impression

Prompt template:

```markdown
Help me improve the Vedic_Rajkumar front end quickly. Remove or soften any unsupported trust claims, tighten landing-page messaging, and polish small UI inconsistencies. Focus on speed, clarity, and low-risk improvements only.
```

### Week 2: Rapid dashboard prototyping

Focus on quickly visualizing the accuracy work in progress.

Goals:

- create a lightweight internal validation dashboard
- make comparison results easier to inspect
- keep the build flexible and low-cost

Expected work:

- scaffold a dashboard UI for chart comparison output
- show mismatches and pass/fail summaries
- avoid over-engineering backend integration

Expected result:

- a practical prototype that supports the validation initiative

Prompt template:

```markdown
Prototype a lightweight validation dashboard UI for Vedic_Rajkumar that can display chart comparison results, mismatches, and summary status. Keep it fast to build and easy to change. Do not over-engineer the backend integration yet.
```

### Week 3: Security UI support

Focus on the front-end pieces needed for privacy-related flows.

Goals:

- support secure backend work with usable interface components
- make privacy actions understandable
- make user-controlled data actions visible and manageable

Expected work:

- create privacy settings UI
- add consent prompts
- scaffold data export and delete screens or controls

Expected result:

- better user-facing privacy experience without waiting for every backend detail to be finalized

Prompt template:

```markdown
Create front-end screens and components for privacy settings, consent prompts, and user data management actions in Vedic_Rajkumar. Focus on quick, clean implementation that can later connect to the hardened backend flows.
```

### Week 4: Deployment and prototype messaging

Focus on communicating the product state clearly.

Goals:

- reduce trust gaps
- set realistic expectations
- make prototype status understandable but not alarming

Expected work:

- add prototype status banners
- clarify validation-in-progress messaging
- improve onboarding copy for new users

Expected result:

- a more transparent and trustworthy product surface

Prompt template:

```markdown
Improve product messaging in Vedic_Rajkumar so the app clearly communicates prototype status, validation-in-progress status, and user expectations. Add lightweight banners, notices, and polished onboarding text without changing the core information architecture.
```

### Week 5: Core polish for Kundli and Prashna

Focus on visible flow quality in the two most important user journeys.

Goals:

- improve responsiveness
- improve loading and empty states
- reduce visual friction

Expected work:

- add or improve loading skeletons
- fix awkward empty states
- improve responsiveness on smaller screens
- align spacing, hierarchy, and visual rhythm

Expected result:

- smoother, more credible core experiences

Prompt template:

```markdown
Quickly improve Kundli and Prashna UX in Vedic_Rajkumar. Add better loading skeletons, empty states, responsive layout fixes, and cleaner visual consistency. Keep the work focused on practical UI improvements that can be reviewed quickly.
```

### Week 6: Core polish for Matchmaking and Panchang

Focus on the remaining core flows.

Goals:

- bring them to the same visible standard as weeks 4 and 5
- refine bilingual copy where needed

Expected work:

- improve state handling visuals
- clean up layout inconsistencies
- refine English and Hindi text where necessary

Expected result:

- more consistency across the whole product

Prompt template:

```markdown
Quickly improve Matchmaking and Panchang UX in Vedic_Rajkumar. Clean up interaction states, improve bilingual English/Hindi copy where needed, and make the visual experience more consistent on mobile and desktop.
```

### Week 7: Feature UI scaffolding

Focus on fast front-end shaping of the next approved feature.

Good targets:

- `family profiles`
- `transit timeline`
- improved report UI shells

Goals:

- speed up exploration
- test usefulness before full hardening
- give other tools a good UI starting point

Expected work:

- scaffold the main screens and interactions
- keep code easy to replace or refine later
- prioritize usability over perfection

Expected result:

- a usable first version of the feature interface

Prompt template:

```markdown
Scaffold the UI for the next approved high-value feature in Vedic_Rajkumar, such as family profiles or a transit timeline. Optimize for speed, clarity, and easy iteration. Treat this as a front-end-first prototype that can later be hardened.
```

### Week 8: Refinement loop

Focus on feedback-driven cleanup.

Goals:

- reduce confusion
- simplify labels and flows
- remove friction from recent changes

Expected work:

- revise labels and helper text
- simplify interactions based on test or pilot feedback
- smooth out awkward UI behavior

Expected result:

- a cleaner user experience without major engineering overhead

Prompt template:

```markdown
Based on recent testing or pilot feedback, refine the new or updated UI flows in Vedic_Rajkumar. Improve labels, reduce confusion, simplify friction points, and keep the changes small and practical.
```

## Success criteria

At the end of the Trae cycle, you should have:

- stronger first impressions
- better copy and trust messaging
- smoother mobile and state handling
- faster UI experimentation for future features

## Review checklist

Use this after each Trae pass:

- Did the change improve visible product quality?
- Did the update reduce confusion?
- Is the interface more consistent than before?
- Did the task stay lightweight and fast?
- Is this a good scaffold for later hardening?

## Best use summary

Use Trae every day for speed, polish, and front-end momentum. It is the best tool for quick wins that make the product feel more usable while larger foundational work continues in parallel.
