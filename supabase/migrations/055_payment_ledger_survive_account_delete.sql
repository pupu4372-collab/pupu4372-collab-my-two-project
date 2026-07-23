-- Preserve payment ledgers when accounts (and pets) are deleted.
-- Rollback sketch:
--   Restore NOT NULL + ON DELETE CASCADE only after backfilling null user_id/pet_id
--   (cannot restore blindly if orphan rows exist).

-- ---------------------------------------------------------------------------
-- 1. pet_premium_unlocks: user_id + pet_id → ON DELETE SET NULL
-- Cascade paths today: user_id→auth.users CASCADE, pet_id→pets CASCADE.
-- payment_id is text UNIQUE only (no FK). No other FKs delete unlock rows.
-- Unique (pet_id, product_code): multiple NULL pet_id rows are allowed in Postgres.
-- Amount: price_krw (required). Optional amount/currency may exist in some envs — not altered.
-- ---------------------------------------------------------------------------

do $unlocks_user$
declare
  fk_name text;
begin
  select c.conname into fk_name
  from pg_constraint c
  join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any (c.conkey)
  where c.conrelid = 'public.pet_premium_unlocks'::regclass
    and c.contype = 'f'
    and a.attname = 'user_id'
  limit 1;

  if fk_name is not null then
    execute format('alter table public.pet_premium_unlocks drop constraint %I', fk_name);
  end if;
end
$unlocks_user$;

do $unlocks_pet$
declare
  fk_name text;
begin
  select c.conname into fk_name
  from pg_constraint c
  join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any (c.conkey)
  where c.conrelid = 'public.pet_premium_unlocks'::regclass
    and c.contype = 'f'
    and a.attname = 'pet_id'
  limit 1;

  if fk_name is not null then
    execute format('alter table public.pet_premium_unlocks drop constraint %I', fk_name);
  end if;
end
$unlocks_pet$;

alter table public.pet_premium_unlocks
  alter column user_id drop not null;

alter table public.pet_premium_unlocks
  alter column pet_id drop not null;

alter table public.pet_premium_unlocks
  add constraint pet_premium_unlocks_user_id_fkey
  foreign key (user_id) references auth.users (id) on delete set null;

alter table public.pet_premium_unlocks
  add constraint pet_premium_unlocks_pet_id_fkey
  foreign key (pet_id) references public.pets (id) on delete set null;

comment on column public.pet_premium_unlocks.user_id is
  'Buyer auth user. NULL after account delete — row kept for payment evidence; never grants entitlement (lookups use eq user_id).';

comment on column public.pet_premium_unlocks.pet_id is
  'Pet at purchase time. NULL after pet/account delete — row kept for payment evidence.';

-- ---------------------------------------------------------------------------
-- 2. human_premium_daily_extra_orders.user_id → ON DELETE SET NULL
-- ---------------------------------------------------------------------------

do $daily_user$
declare
  fk_name text;
begin
  select c.conname into fk_name
  from pg_constraint c
  join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any (c.conkey)
  where c.conrelid = 'public.human_premium_daily_extra_orders'::regclass
    and c.contype = 'f'
    and a.attname = 'user_id'
  limit 1;

  if fk_name is not null then
    execute format(
      'alter table public.human_premium_daily_extra_orders drop constraint %I',
      fk_name
    );
  end if;
end
$daily_user$;

alter table public.human_premium_daily_extra_orders
  alter column user_id drop not null;

alter table public.human_premium_daily_extra_orders
  add constraint human_premium_daily_extra_orders_user_id_fkey
  foreign key (user_id) references public.profiles (id) on delete set null;

comment on column public.human_premium_daily_extra_orders.user_id is
  'Buyer profile. NULL after account delete — order row kept for payment evidence.';

-- ---------------------------------------------------------------------------
-- 3. payments.user_id → ON DELETE SET NULL (legacy ledger)
-- ---------------------------------------------------------------------------

do $payments_user$
declare
  fk_name text;
begin
  select c.conname into fk_name
  from pg_constraint c
  join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any (c.conkey)
  where c.conrelid = 'public.payments'::regclass
    and c.contype = 'f'
    and a.attname = 'user_id'
  limit 1;

  if fk_name is not null then
    execute format('alter table public.payments drop constraint %I', fk_name);
  end if;
end
$payments_user$;

alter table public.payments
  alter column user_id drop not null;

alter table public.payments
  add constraint payments_user_id_fkey
  foreign key (user_id) references public.profiles (id) on delete set null;

comment on column public.payments.user_id is
  'Buyer profile. NULL after account delete — row kept for payment evidence.';
