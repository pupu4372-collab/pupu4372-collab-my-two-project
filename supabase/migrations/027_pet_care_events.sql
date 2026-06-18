-- Pet profile care calendar (growth / health / routine logs)

create type public.pet_care_category as enum (
  'weight',
  'vaccine',
  'vet',
  'grooming',
  'medication',
  'nutrition',
  'exercise',
  'other'
);

create table public.pet_care_events (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets (id) on delete cascade,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  event_date date not null,
  category public.pet_care_category not null default 'other',
  title text not null,
  memo text,
  weight_kg numeric(5, 2),
  is_done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_pet_care_events_pet_date on public.pet_care_events (pet_id, event_date desc);

create trigger pet_care_events_updated_at
before update on public.pet_care_events
for each row execute function public.set_updated_at();

alter table public.pet_care_events enable row level security;

create policy "pet_care_select_own" on public.pet_care_events
  for select using (auth.uid() = owner_id);

create policy "pet_care_insert_own" on public.pet_care_events
  for insert with check (auth.uid() = owner_id);

create policy "pet_care_update_own" on public.pet_care_events
  for update using (auth.uid() = owner_id);

create policy "pet_care_delete_own" on public.pet_care_events
  for delete using (auth.uid() = owner_id);
