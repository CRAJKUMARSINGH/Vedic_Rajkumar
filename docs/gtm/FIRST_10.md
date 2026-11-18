# The first 10 humans

**Owner:** Founder · **Success:** 10 people use it, 3 come back, 1 pays. That is all.

## The rule that matters

**Do not optimise pricing before 10 users.** Every pricing debate before real
usage is speculation. Pick ₹{pro_inr}, ship it, revisit after 30 days of data.

## Where the first 10 come from

One channel, not five. Pick the one where you already exist:

| Channel                    | Fit                              | Effort |
| -------------------------- | -------------------------------- | ------ |
| Jyotish WhatsApp groups    | highest intent, hardest to enter | medium |
| r/vedicastrology           | English, technical, skeptical    | low    |
| X / Twitter jyotish circle | reach, low conversion            | low    |
| Personal network           | fast, biased feedback            | lowest |

Start with **personal network for feedback, one online channel for strangers.**
Your friends will not tell you the landing page is confusing; strangers will.

## The ask (copy-paste)

    Built a jyotish app — Swiss Ephemeris, Lahiri, Hindi + English, no login needed.
    Would you try one chart and tell me the one thing that was confusing?
    <link>

Two questions only: **what did you expect that you did not get**, and **where did
you nearly stop**. Open-ended. A 1-10 rating tells you nothing at n=10.

## What to watch (in order of importance)

1. **Did they get a chart?** `landing_to_chart` in `funnel_summary()`.
2. **Where did they stop?** Read the funnel gap, not the total.
3. **Did they come back within 7 days?** The only retention number that counts now.
4. **Did anyone hit the weekly limit?** If nobody does, the free tier is too generous
   and `limit_to_upgrade` is unmeasurable.

## What to ignore until 10 users

- Signup rate. You have no traffic to measure it on.
- Conversion to Pro. n=10 gives you a coin flip.
- SEO. It takes 3 months and you have 3 weeks.
- A/B tests. Statistically meaningless below ~1000 per arm.

## The 14-day plan

| Day   | Do                                                                     |
| ----- | ---------------------------------------------------------------------- |
| 1     | Deploy to production. Send the ask to 5 people personally.             |
| 2-3   | Watch sessions. Fix the single biggest drop-off only.                  |
| 4     | Post in one online channel.                                            |
| 5-7   | Answer every reply within an hour. Log every complaint as a `DEF-`.    |
| 8-10  | Ship the top 3 `DEF-`s.                                                |
| 11    | Ask the 3 most engaged to pay, explicitly.                             |
| 12-14 | Write `docs/gtm/LEARNINGS.md` — what you got wrong, in your own words. |

## Honest expectations

10 users will not feel like traction. That is the point: it is enough to tell you
whether the _product_ is wrong, and it is the only stage where the answer is still
cheap to act on.
