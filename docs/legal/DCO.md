# Developer Certificate of Origin

**Status:** required for every commit · **Enforced by:** `.github/workflows/dco.yml`

By adding `Signed-off-by:` you certify the [DCO 1.1](https://developercertificate.org/):
you wrote the contribution, or have the right to submit it, and you grant the
project the right to use it under the project's licence.

## Why we require it

Not ceremony. Three concrete reasons:

1. **AGPL escape hatch (ADR-007).** `swisseph-wasm` is dual-licensed. Exercising
   the commercial branch — or relicensing this repo — requires consent from
   _every_ copyright holder. The DCO is that consent, dated and attributed.
2. **White-label.** A customer who cannot accept AGPL is the exact scenario the
   escape hatch exists for. Without consent on record, that customer's contract
   has a hole in it.
3. **Provenance.** `package-lock.json` proves what we ship; the DCO proves who
   wrote it.

## How

    git commit -s -m "feat(tier): ..."          # new commits
    git rebase --signoff main                    # fix a branch

Configure once: `git config --global format.signoff true`

## Co-authored and agent commits

An AI-assisted commit still needs a human sign-off — the human is the one
certifying provenance. `Co-authored-by:` is metadata, not consent.

## Escalation

A contribution from someone who cannot sign (e.g. an employer owns the IP) needs a
corporate CLA instead. Record it in `docs/legal/CLA_REGISTER.md` with the entity
name and date. That file starts empty and is filled as needed.
