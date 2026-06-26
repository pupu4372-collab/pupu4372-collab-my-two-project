-- Pet care calendar: categories, events, RLS (growth / health / routine logs)

-- 1. pet_care_category ENUM (idempotent)
do $enum$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'pet_care_category'
      and n.nspname = 'public'
  ) then
    create type public.pet_care_category as enum (
      'feeding',
      'grooming',
      'vet_visit',
      'vaccination',
      'exercise',
      'medication',
      'other'
    );
  end if;
end
$enum$;

-- 2. pet_care_events table (idempotent)
create table if not exists public.pet_care_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  pet_id uuid references public.pets (id) on delete cascade,
  category public.pet_care_category not null,
  title text not null,
  description text,
  event_date date not null,
  event_time time,
  is_recurring boolean not null default false,
  recurrence_rule text,
  reminder_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. indexes (idempotent)
create index if not exists idx_pet_care_events_user_id
  on public.pet_care_events (user_id);

create index if not exists idx_pet_care_events_pet_id
  on public.pet_care_events (pet_id);

create index if not exists idx_pet_care_events_event_date
  on public.pet_care_events (event_date);

-- 4. updated_at trigger (uses set_updated_at from 001_initial_schema)
drop trigger if exists pet_care_events_updated_at on public.pet_care_events;

create trigger pet_care_events_updated_at
before update on public.pet_care_events
for each row execute function public.set_updated_at();

-- 3. RLS policies (idempotent)
alter table public.pet_care_events enable row level security;

drop policy if exists pet_care_events_select_own on public.pet_care_events;
create policy pet_care_events_select_own on public.pet_care_events
  for select using (auth.uid() = user_id);

drop policy if exists pet_care_events_insert_own on public.pet_care_events;
create policy pet_care_events_insert_own on public.pet_care_events
  for insert with check (auth.uid() = user_id);

drop policy if exists pet_care_events_update_own on public.pet_care_events;
create policy pet_care_events_update_own on public.pet_care_events
  for update using (auth.uid() = user_id);

drop policy if exists pet_care_delete_own on public.pet_care_events;
drop policy if exists pet_care_events_delete_own on public.pet_care_events;
create policy pet_care_events_delete_own on public.pet_care_events
  for delete using (auth.uid() = user_id);
