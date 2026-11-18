# Definition of Done

Every PR ticks every applicable line. An unticked line needs a stated reason.

## Correctness

- [ ] Behaviour is covered by a test that fails without the change
- [ ] If astronomical: corpus test vs the Swiss Ephemeris golden set
      (`npm run test:accuracy:corpus`); Tier A target ≤ 1.0″ grahas / ≤ 2.0″
      ascendant, with the user-visible 0.5° bound as the hard gate
- [ ] If a derived rule (yoga, shadbala, ashtakavarga, varga): golden set from an
      independent authority (`tools/accuracy/`), exact match, no tolerance fudge
- [ ] If interpretation prose: snapshot test, and the prose names the rule it cites

## Claims

- [ ] Any number in README/docs is generated or gated by `npm run docs:verify`
- [ ] New capability is added to the README status table with a tier label
- [ ] If a limitation is introduced or persists, it goes in
      [METHODOLOGY.md](accuracy/METHODOLOGY.md)'s "not validated" list

## Data

- [ ] New birth data never lands in `public/`
- [ ] New endpoint denies by default and redacts raw birth fields for non-admin
- [ ] Role checks are server-side; client checks are noted as UX only

## Quality

- [ ] `npm run typecheck && npm run lint` clean
- [ ] Coverage does not drop below threshold
- [ ] a11y workflow green; new interactive elements are keyboard-reachable
- [ ] Perf budget on the affected route unchanged or improved

## Hygiene

- [ ] Branch squashed and deleted after merge
- [ ] `CHANGELOG.md` entry under Unreleased
- [ ] Commits signed off (DCO)
