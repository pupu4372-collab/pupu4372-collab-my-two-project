-- withdrawn_accounts: hashed emails for 30-day rejoin cooldown after hard delete.
-- Service role only — no client policies.

create table if not exists public.withdrawn_accounts (
  id uuid primary key default gen_random_uuid(),
  email_hash text not null,
  withdrawn_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint withdrawn_accounts_email_hash_key unique (email_hash)
);

create index if not exists idx_withdrawn_accounts_withdrawn_at
  on public.withdrawn_accounts (withdrawn_at);

comment on table public.withdrawn_accounts is
  'SHA-256(email_hash) of withdrawn accounts for 30-day rejoin cooldown. No plaintext email. Service role only.';

comment on column public.withdrawn_accounts.email_hash is
  'Deterministic SHA-256 hex of normalized email + server pepper.';

alter table public.withdrawn_accounts enable row level security;

-- No policies: authenticated/anon cannot SELECT/INSERT/UPDATE/DELETE.
-- Service role bypasses RLS.

revoke all on table public.withdrawn_accounts from anon, authenticated;
grant all on table public.withdrawn_accounts to service_role;
