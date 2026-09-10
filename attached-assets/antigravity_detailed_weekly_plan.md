# Antigravity detailed weekly plan

## Role

Antigravity is the optional specialist tool for complex analysis, parallel exploration, and multi-agent research. It should not be the daily driver for `Vedic_Rajkumar`, but it can add strong value when the team needs deeper reasoning on validation strategy, production-readiness gaps, UX approaches for complex data, or higher-risk feature directions.

## Main objective

Use Antigravity to reduce decision uncertainty before committing engineering time. The best use cases are:

- comparing validation strategies
- researching ayanamsa and classical-rule implementation approaches
- reviewing architecture from a production-readiness perspective
- identifying product risks
- exploring whether advanced features are worth building at all

## Working model

Treat Antigravity as the research and decision-support layer.

Use it when:

- multiple approaches are possible
- the wrong implementation choice would waste time
- a multi-agent comparison is more useful than raw coding speed
- you want a ranked recommendation, not just an implementation

Do not use it for routine coding tasks that Kiro, Devin, or Trae can handle directly.

## Weekly plan

### Week 1: Research sprint on ayanamsa validation

Focus on understanding the best methods for validating foundational calculation choices.

Goals:

- compare validation methods
- identify trusted reference approaches
- understand practical trade-offs

Expected work:

- research ayanamsa validation options
- compare classical and modern reference methods
- recommend the most practical workflow for this project stage

Expected result:

- a clearer decision on how the engine should be validated going forward

Prompt template:

```markdown
Run a multi-agent research pass on the best ways to validate ayanamsa correctness for a Vedic astrology web app like Vedic_Rajkumar. Compare methods, trusted references, and practical implementation trade-offs. Return a concise recommendation.
```

### Week 2: Accuracy edge-case research

Focus on deeper validation complexity.

Goals:

- identify difficult chart-accuracy edge cases
- compare validation approaches for those cases
- reduce blind spots in future test strategy

Expected work:

- explore planetary position validation edge cases
- assess house calculation differences
- assess dasha timing comparison approaches
- recommend a sustainable long-term validation workflow

Expected result:

- stronger research support for expanding the accuracy suite

Prompt template:

```markdown
Explore edge cases in chart accuracy validation for Vedic_Rajkumar, including planetary positions, house calculations, and dasha timing. Compare different validation approaches and recommend a sustainable long-term workflow.
```

### Week 3: Architecture review

Focus on production-readiness from a systems perspective.

Goals:

- identify architecture weaknesses
- examine privacy-sensitive data paths
- review service boundaries and maintainability

Expected work:

- analyze the current app shape as a React + TypeScript astrology product
- identify readiness gaps for deployment and scaling
- surface maintainability risks in current structure

Expected result:

- a ranked list of production-readiness gaps and solution paths

Prompt template:

```markdown
Analyze the current architecture of a React + TypeScript astrology app like Vedic_Rajkumar from a production-readiness perspective. Focus on deployment reliability, privacy-sensitive data handling, service boundaries, and maintainability. Return gap analysis plus proposed options.
```

### Week 4: Product risk review

Focus on trust, product scope, and operational risk.

Goals:

- reduce over-promising
- expose unfinished areas that create trust problems
- identify where product focus is weakening

Expected work:

- review trust claims and their evidence level
- review unfinished preview modules
- review missing safeguards or monitoring gaps
- rank product risks by severity and urgency

Expected result:

- a sharper view of which risks are most important to address next

Prompt template:

```markdown
Run a multi-agent product risk review for Vedic_Rajkumar. Focus on trust claims, unfinished preview modules, missing operational safeguards, and areas where the product may over-promise relative to current validation depth. Return prioritized risks and mitigation suggestions.
```

### Week 5: UX research for dense astrology interfaces

Focus on how to present complexity without overwhelming the user.

Goals:

- improve clarity
- reduce cognitive overload
- support trust and comprehension

Expected work:

- research progressive disclosure patterns
- compare ways to show charts, timelines, interpretations, and summaries
- rank presentation ideas by usability and implementation practicality

Expected result:

- research-backed guidance for future UI work

Prompt template:

```markdown
Research the best ways to present complex astrological data in a web product without overwhelming users. Focus on clarity, progressive disclosure, and trust-building patterns relevant to Vedic_Rajkumar. Provide practical examples and ranked recommendations.
```

### Week 6: Accessibility and mobile review

Focus on the usability of dense data on small screens and across varied interaction methods.

Goals:

- improve inclusiveness
- improve keyboard and screen-size handling
- avoid desktop-only design thinking

Expected work:

- research chart interaction patterns for keyboard use
- assess dense-data mobile presentation patterns
- identify practical accessibility upgrades for astrology-heavy interfaces

Expected result:

- a usable set of recommendations that can guide the next polish cycle

Prompt template:

```markdown
Explore accessibility and mobile-friendly presentation approaches for dense astrology interfaces like charts, timelines, and comparison views in Vedic_Rajkumar. Return practical recommendations that can guide the next UI polish pass.
```

### Week 7: Advanced feature exploration

Focus on whether future features deserve investment.

Possible areas:

- deeper `KP` support
- `Jaimini` extensions
- enhanced transit correlation
- other advanced rule systems

Goals:

- compare payoff versus complexity
- understand validation burden
- avoid expensive dead ends

Expected work:

- explore several advanced directions
- rank them by engineering cost, user value, and trust risk
- recommend what should wait and what might be viable

Expected result:

- a disciplined feature-priority view instead of feature accumulation

Prompt template:

```markdown
Explore several advanced feature directions for Vedic_Rajkumar, such as deeper KP support, Jaimini extensions, or enhanced transit-correlation features. Compare engineering complexity, product value, and validation risk. Recommend what should and should not be pursued next.
```

### Week 8: Decision synthesis

Focus on turning research into a practical next-step recommendation.

Goals:

- consolidate prior findings
- choose what to build next
- decide what to defer or archive

Expected work:

- synthesize findings from earlier weeks
- recommend the best next advanced feature if any
- identify features or research lines that should be paused

Expected result:

- a clear go or no-go recommendation with reasoning

Prompt template:

```markdown
Synthesize the prior research for Vedic_Rajkumar into a final recommendation on which advanced feature to build next, which to defer, and which to archive. Optimize for product trust, maintainability, and user value, not breadth.
```

## Success criteria

At the end of the Antigravity cycle, you should have:

- stronger confidence in strategic choices
- less wasted engineering effort on low-value directions
- better understanding of validation, UX, and production risks
- a more disciplined roadmap for advanced features

## Review checklist

After each Antigravity run, ask:

- Did this reduce an important uncertainty?
- Did it compare real alternatives rather than just describe one?
- Is the recommendation practical for this repo's current maturity?
- Did it help prevent waste or over-expansion?
- Is there a clear next decision that follows from the research?

## Best use summary

Use Antigravity when you need structured exploration and ranked recommendations before committing implementation time. It is most valuable when the question is not "how do we code this?" but "should we code this, and what is the smartest version to pursue?"
