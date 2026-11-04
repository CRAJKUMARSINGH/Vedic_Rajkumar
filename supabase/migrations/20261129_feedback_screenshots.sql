-- Screenshot attachment for the in-app reporter, held in a PRIVATE bucket.
--
-- WHY: the feedback sink is server-side (20261127), but playbook §3.1/§8.1 still
-- listed screenshots as open. A screenshot may show a chart, a name or a place,
-- so it is treated as private data — exactly like the report row it belongs to.
--
-- CONFIDENTIALITY (AGENTS.md standing order): the bucket is private and there is
-- deliberately NO storage.objects policy for it, so no client can read or write
-- it directly. Uploads go through a service-role-minted signed upload URL scoped
-- to the caller's own `<uid>/` prefix (`feedback-screenshot` edge function);
-- reads are service-role signed URLs only (author or owner/admin). These objects
-- are never placed in public/ and never served from it.
--
-- RETENTION: a screenshot is kept 90 days from its report's `created_at`, then
-- purged by the erasure sweep (`supabase/functions/erasure-sweep`). Consent to
-- upload is captured on the client and is required before any upload happens;
-- the tester may submit without a screenshot.
-- Policy defined: docs/launch/pre-launch-user-testing-playbook.md §3.1.

alter table public.user_feedback
  add column if not exists screenshot_path text;

comment on column public.user_feedback.screenshot_path is
  'Object path in the private feedback-screenshots bucket. Always "<auth.uid()>/<uuid>.<ext>"; submit-feedback rejects any path not prefixed by the caller''s own uid. Null when the tester attached no screenshot.';

-- Private bucket with hard limits. Upsert, so re-running this migration is safe.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'feedback-screenshots',
  'feedback-screenshots',
  false,                                      -- private: no anonymous read
  5242880,                                    -- 5 MiB
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
  set public             = false,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Deny by default: no storage.objects policies are created for this bucket on
-- purpose. Access is granted ONLY by a short-lived signed URL minted by the
-- service role inside the feedback-screenshot edge function. A client-side check
-- is UX, not a boundary (AGENTS.md rule 5).
