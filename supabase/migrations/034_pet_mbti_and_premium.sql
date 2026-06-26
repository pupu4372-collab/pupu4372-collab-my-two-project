-- Pet MBTI fields on pets + per-pet premium unlock ledger (PortOne V2)

-- ---------------------------------------------------------------------------
-- 1. pets: MBTI columns
-- ---------------------------------------------------------------------------
alter table public.pets
  add column if not exists mbti_type text;

alter table public.pets
  add column if not exists mbti_answers jsonb;

alter table public.pets
  add column if not exists mbti_completed_at timestamptz;

comment on column public.pets.mbti_type is 'Pet MBTI type code, e.g. INTJ';
comment on column public.pets.mbti_answers is 'Raw MBTI questionnaire answers (question_id -> option_id)';
comment on column public.pets.mbti_completed_at is 'When the pet MBTI questionnaire was completed';

-- ---------------------------------------------------------------------------
-- 2. pet_premium_unlocks
-- ---------------------------------------------------------------------------
create table if not exists public.pet_premium_unlocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  pet_id uuid not null references public.pets (id) on delete cascade,
  product_code text not null,
  price_krw integer not null,
  payment_id text,
  paid_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.pet_premium_unlocks is 'Paid pet premium entitlements (e.g. pet_premium_v1 @ 4500 KRW)';
comment on column public.pet_premium_unlocks.product_code is 'Product SKU, e.g. pet_premium_v1';
comment on column public.pet_premium_unlocks.payment_id is 'PortOne payment ID';
comment on column public.pet_premium_unlocks.expires_at is 'NULL = lifetime access';

-- ---------------------------------------------------------------------------
-- 3. UNIQUE (pet_id, product_code) — one unlock row per pet per product
-- ---------------------------------------------------------------------------
create unique index if not exists pet_premium_unlocks_pet_id_product_code_key
  on public.pet_premium_unlocks (pet_id, product_code);

-- ---------------------------------------------------------------------------
-- 4. Indexes
-- ---------------------------------------------------------------------------
create index if not exists idx_pet_premium_unlocks_user_id
  on public.pet_premium_unlocks (user_id);

create index if not exists idx_pet_premium_unlocks_pet_id
  on public.pet_premium_unlocks (pet_id);

-- ---------------------------------------------------------------------------
-- 5. updated_at trigger (set_updated_at from 001_initial_schema)
-- ---------------------------------------------------------------------------
drop trigger if exists pet_premium_unlocks_updated_at on public.pet_premium_unlocks;

create trigger pet_premium_unlocks_updated_at
before update on public.pet_premium_unlocks
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 6. RLS
-- ---------------------------------------------------------------------------
alter table public.pet_premium_unlocks enable row level security;

drop policy if exists pet_premium_unlocks_select_own on public.pet_premium_unlocks;
create policy pet_premium_unlocks_select_own on public.pet_premium_unlocks
  for select using (auth.uid() = user_id);

drop policy if exists pet_premium_unlocks_insert_own on public.pet_premium_unlocks;
create policy pet_premium_unlocks_insert_own on public.pet_premium_unlocks
  for insert with check (auth.uid() = user_id);

drop policy if exists pet_premium_unlocks_update_own on public.pet_premium_unlocks;
create policy pet_premium_unlocks_update_own on public.pet_premium_unlocks
  for update using (auth.uid() = user_id);

drop policy if exists pet_premium_unlocks_delete_own on public.pet_premium_unlocks;
create policy pet_premium_unlocks_delete_own on public.pet_premium_unlocks
  for delete using (auth.uid() = user_id);
