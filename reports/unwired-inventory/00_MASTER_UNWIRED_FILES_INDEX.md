# Master unwired files index

Baseline: `907d11e5991183e3f88f757def9e7707e5b80781` (remote main). Complete tracked tree, 2637 blobs, not truncated. Local untracked/ignored/unpushed files inaccessible. Classification is path-based unless explicit evidence is shown; no runtime reachability or semantic equivalence claimed.

Every tracked blob has exactly one ID in registers 01–05. Inclusion is not a finding of unused code.

| Register | Entries |
|---|---:|
| [01_UNWIRED_SOURCE_CODE](01_UNWIRED_SOURCE_CODE.md) | 816 |
| [02_PENDING_PATCHES](02_PENDING_PATCHES.md) | 8 |
| [03_ENHANCEMENT_GUIDANCE](03_ENHANCEMENT_GUIDANCE.md) | 170 |
| [04_REFERENCE_ASSETS](04_REFERENCE_ASSETS.md) | 1316 |
| [05_TEST_AND_SCRIPT_INTEGRATION](05_TEST_AND_SCRIPT_INTEGRATION.md) | 327 |
| Total | 2637 |

Confirmed unwired: not established. Semantic reviews completed: 0. Pending: 2637. Local-only count: unknown. No exclusions from tracked tree.

Next: inspect patch counterparts, extract guidance requirements, build entry-point reachability graph including dynamic imports and build/CI consumers, then reconcile local files. Preserve all original materials.
