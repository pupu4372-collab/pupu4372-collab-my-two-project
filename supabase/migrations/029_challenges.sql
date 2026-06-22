-- Challenges & challenge posts

create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  channel text check (channel in ('dog', 'cat', 'reptile', 'all')) not null default 'all',
  thumbnail_url text,
  is_active boolean not null default true,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_challenges_channel on public.challenges (channel, is_active);

create trigger challenges_updated_at
before update on public.challenges
for each row execute function public.set_updated_at();

alter table public.challenges enable row level security;

create policy "challenges_select_active" on public.challenges
  for select using (is_active = true);

create policy "challenges_insert_admin" on public.challenges
  for insert with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "challenges_update_admin" on public.challenges
  for update using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "challenges_delete_admin" on public.challenges
  for delete using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create table public.challenge_posts (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  pet_id uuid references public.pets (id) on delete set null,
  content text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_challenge_posts_challenge on public.challenge_posts (challenge_id, created_at desc);
create index idx_challenge_posts_user on public.challenge_posts (user_id);

create trigger challenge_posts_updated_at
before update on public.challenge_posts
for each row execute function public.set_updated_at();

alter table public.challenge_posts enable row level security;

create policy "challenge_posts_select" on public.challenge_posts
  for select using (true);

create policy "challenge_posts_insert" on public.challenge_posts
  for insert with check (auth.uid() = user_id);

create policy "challenge_posts_update_own" on public.challenge_posts
  for update using (auth.uid() = user_id);

create policy "challenge_posts_delete_own" on public.challenge_posts
  for delete using (auth.uid() = user_id);