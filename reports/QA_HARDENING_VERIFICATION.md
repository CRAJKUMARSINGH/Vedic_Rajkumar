# QA hardening — static review

Baseline: `907d11e5991183e3f88f757def9e7707e5b80781`.

Changes: schedule mobile performance at 02:00 IST; add general Chromium E2E to existing CI with failure artifacts; align accuracy and answer-layer Node pins to .nvmrc; simplify pre-push while retaining both mandatory checks.

The third-party QA kit is not installed. Existing specialist gates remain unchanged. No calculation changes.

Runtime tests and Windows hook reproduction are pending. GitHub API commits do not invoke local Husky. Cross-browser expansion, production-preview testing, video privacy/overhead review, and branch protection are deferred. Release remains on hold. Do not merge until CI and required local checks pass.
