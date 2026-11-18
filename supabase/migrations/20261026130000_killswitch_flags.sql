-- W17d: coarse kill switches, mirrored from Flagsmith.
--
-- `kill_switches` (20241007000008) already backs the per-feature switches used
-- by the edge functions. The week-17 spec adds three coarse flags that cut whole
-- surfaces at once — the API, the edge tier, and telemetry. Seeding them here
-- means an operator can flip a row (no deploy) and the next request short-circuits.
--
-- `is_feature_killed(text)` already reads this table, so no function change is
-- needed. `_shared/killSwitch.ts` KILL_SWITCH_FLAGS names must match these rows.

INSERT INTO kill_switches (feature, enabled) VALUES
  ('killswitch.api',       false),
  ('killswitch.edge',      false),
  ('killswitch.telemetry', false)
ON CONFLICT (feature) DO NOTHING;
