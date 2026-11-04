-- Private feedback inbox for the in-app reporter (closes DEF-015).
--
-- WHY: userFeedbackService.sendToBackend() was a localStorage mock, so tester
-- reports never left the browser. This table is the sink. `submit-feedback`
-- (service role) is the only writer, so RLS can stay deny-by-default for clients
-- — the edge function, not a client check, is the enforcement point (AGENTS.md
-- rule 5).
--
-- CONFIDENTIALITY (AGENTS.md standing order): rows are private. They may contain
-- user prose, so they are readable only by the author and owner/admin and are
-- never exported to public/. The widget invites *synthetic* birth input for
-- reproduction; real seed-bank values must not be pasted.

create extension if not exists pgcrypto;

create table if not exists public.user_feedback (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  tier        text not null default 'free',   -- server-derived at write time
  category    text not null check (char_length(category) between 1 and 32),
  title       text not null check (char_length(title) between 1 and 200),
  description text not null check (char_length(description) between 1 and 5000),
  page_url    text,
  user_agent  text,
  app_version text,
  session_id  text,
  tags        text[] not null default '{}',
  created_at  timestamptz not null default now()
);

create index if not exists idx_user_feedback_created  on public.user_feedback (created_at desc);
create index if not exists idx_user_feedback_user     on public.user_feedback (user_id, created_at desc);
create index if not exists idx_user_feedback_category on public.user_feedback (category);

alter table public.user_feedback enable row level security;

-- Deny by default: there is deliberately NO insert policy. Only the
-- `submit-feedback` edge function (service role, which bypasses RLS) writes rows,
-- and it derives user_id + tier from the verified JWT, never from the payload.

drop policy if exists "author reads own feedback" on public.user_feedback;
create policy "author reads own feedback"
  on public.user_feedback for select
  using (auth.uid() = user_id);

drop policy if exists "owner or admin reads feedback" on public.user_feedback;
create policy "owner or admin reads feedback"
  on public.user_feedback for select
  using (exists (
    select 1 from public.user_roles r
     where r.user_id = auth.uid() and r.role in ('owner','admin')
  ));

comment on table public.user_feedback is
  'Private in-app feedback inbox (DEF-015). Writes: submit-feedback edge fn (service role) only. Reads: author or owner/admin. Never expose via public/.';
comment on column public.user_feedback.tier is
  'Server-derived canonical tier at write time (resolve_entitlement()); never trusted from the client payload.';
