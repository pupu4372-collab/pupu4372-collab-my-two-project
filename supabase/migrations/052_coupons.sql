-- DRAFT: coupons (apply manually). Migration 052.
-- Rollback:
--   drop policy if exists "coupons_select_own" on public.coupons;
--   drop table if exists public.coupons;

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  coupon_type text not null,
  granted_reason text not null,
  used_at timestamptz null,
  used_for text null,
  created_at timestamptz not null default now()
);

create index if not exists idx_coupons_user_type_used
  on public.coupons (user_id, coupon_type, used_at);

comment on table public.coupons is
  'Generic coupon inventory. First type: daily_lucky_free. Writes are service-role only.';

alter table public.coupons enable row level security;

drop policy if exists "coupons_select_own" on public.coupons;
create policy "coupons_select_own" on public.coupons
  for select to authenticated
  using (auth.uid() = user_id);

-- No insert/update/delete policies for anon/authenticated → client writes blocked.
-- Service role bypasses RLS.

-- ---------------------------------------------------------------------------
-- Backfill: 1x daily_lucky_free for existing full members (idempotent).
-- Full member ≈ non-anonymous AND (has_password OR google/kakao identity).
-- ---------------------------------------------------------------------------
insert into public.coupons (user_id, coupon_type, granted_reason)
select
  u.id,
  'daily_lucky_free',
  'launch_promo'
from auth.users u
where coalesce(u.is_anonymous, false) is not true
  and (
    coalesce((u.raw_app_meta_data ->> 'has_password')::boolean, false) is true
    or exists (
      select 1
      from auth.identities i
      where i.user_id = u.id
        and i.provider in ('google', 'kakao')
    )
  )
  and not exists (
    select 1
    from public.coupons c
    where c.user_id = u.id
      and c.coupon_type = 'daily_lucky_free'
  );
