-- K-Saju Pet / Cosmic Paws — initial schema
-- Run in Supabase SQL Editor or: supabase db push

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.pet_species as enum ('dog', 'cat');
create type public.user_role as enum ('user', 'admin');
create type public.app_channel as enum ('home', 'dog', 'cat', 'community', 'pet_saju');
create type public.post_type as enum ('photo_show', 'qa', 'free', 'saju_review');
create type public.saju_type as enum ('basic', 'compatibility', 'character_card', 'premium');
create type public.payment_status as enum (
  'pending', 'approved', 'captured', 'failed', 'refunded', 'cancelled'
);
create type public.five_element as enum ('mok', 'hwa', 'to', 'geum', 'su');
create type public.report_status as enum ('pending', 'reviewing', 'resolved', 'rejected');

-- ---------------------------------------------------------------------------
-- Profiles (extends auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  avatar_url text,
  locale text not null default 'ko' check (locale in ('ko', 'en')),
  timezone text not null default 'Asia/Seoul',
  provider text,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Pets & health records (My Pet)
-- ---------------------------------------------------------------------------
create table public.pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  species public.pet_species not null,
  breed text,
  gender text check (gender in ('male', 'female', 'unknown')) default 'unknown',
  birth_date date not null,
  birth_time time,
  birth_time_unknown boolean not null default false,
  birth_timezone text not null default 'Asia/Seoul',
  profile_image_url text,
  personality_tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pets_birth_time_consistency check (
    (birth_time_unknown = true and birth_time is null)
    or (birth_time_unknown = false)
  )
);

create table public.pet_health_records (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets (id) on delete cascade,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  record_date date not null default current_date,
  weight_kg numeric(5, 2),
  mood text,
  symptoms text[] not null default '{}',
  meal_note text,
  exercise_note text,
  memo text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Saju results
-- ---------------------------------------------------------------------------
create table public.saju_results (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets (id) on delete cascade,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  saju_type public.saju_type not null default 'basic',
  analysis_mode text not null check (analysis_mode in ('three_pillars', 'four_pillars')),
  birth_basis jsonb not null,
  pillars jsonb not null default '{}',
  five_elements jsonb not null default '{}',
  dominant_element public.five_element,
  title text,
  summary text,
  storytelling_payload jsonb not null default '{}',
  is_premium boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Editorial content (Dog / Cat / Pet Saju channels)
-- ---------------------------------------------------------------------------
create table public.content_categories (
  id uuid primary key default gen_random_uuid(),
  channel public.app_channel not null,
  slug text not null unique,
  name_ko text not null,
  name_en text not null,
  theme_color text,
  emoji text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  is_coming_soon boolean not null default false
);

create table public.contents (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.content_categories (id) on delete set null,
  channel public.app_channel not null,
  title text not null,
  summary text,
  body text,
  thumbnail_url text,
  tags text[] not null default '{}',
  language text not null default 'ko',
  is_featured boolean not null default false,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Community (Pet Show, Q&A, etc.)
-- ---------------------------------------------------------------------------
create table public.community_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  pet_id uuid references public.pets (id) on delete set null,
  channel public.app_channel not null default 'community',
  post_type public.post_type not null,
  title text,
  content text,
  image_urls text[] not null default '{}',
  tags text[] not null default '{}',
  language text not null default 'ko',
  like_count int not null default 0 check (like_count >= 0),
  comment_count int not null default 0 check (comment_count >= 0),
  view_count int not null default 0 check (view_count >= 0),
  is_hidden boolean not null default false,
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create table public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  parent_id uuid references public.post_comments (id) on delete cascade,
  content text not null,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.post_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.community_posts (id) on delete cascade,
  comment_id uuid references public.post_comments (id) on delete cascade,
  reporter_id uuid references public.profiles (id) on delete set null,
  reason text not null,
  detail text,
  status public.report_status not null default 'pending',
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  constraint post_reports_target check (
    post_id is not null or comment_id is not null
  )
);

-- ---------------------------------------------------------------------------
-- Payments (PayPal premium reports)
-- ---------------------------------------------------------------------------
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  pet_id uuid references public.pets (id) on delete set null,
  saju_result_id uuid references public.saju_results (id) on delete set null,
  provider text not null default 'paypal',
  provider_order_id text unique,
  provider_capture_id text unique,
  product_type text not null,
  amount numeric(10, 2) not null,
  currency text not null default 'USD',
  status public.payment_status not null default 'pending',
  raw_payload jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index idx_pets_owner_id on public.pets (owner_id);
create index idx_pet_health_pet_id on public.pet_health_records (pet_id);
create index idx_saju_results_pet_id on public.saju_results (pet_id);
create index idx_saju_results_owner_id on public.saju_results (owner_id);
create index idx_contents_channel_published
  on public.contents (channel, is_published, published_at desc);
create index idx_posts_feed
  on public.community_posts (post_type, created_at desc)
  where is_hidden = false;
create index idx_posts_photo_ranking
  on public.community_posts (post_type, like_count desc, created_at desc)
  where post_type = 'photo_show' and is_hidden = false;
create index idx_post_likes_post_id on public.post_likes (post_id);
create index idx_post_likes_user_id on public.post_likes (user_id);
create index idx_payments_user_id on public.payments (user_id);
create index idx_payments_status on public.payments (status);

-- ---------------------------------------------------------------------------
-- Denormalized counters (likes / comments)
-- ---------------------------------------------------------------------------
create or replace function public.handle_post_like_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.community_posts
  set like_count = like_count + 1
  where id = new.post_id;
  return new;
end;
$$;

create or replace function public.handle_post_like_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.community_posts
  set like_count = greatest(like_count - 1, 0)
  where id = old.post_id;
  return old;
end;
$$;

create trigger trg_post_like_insert
after insert on public.post_likes
for each row execute function public.handle_post_like_insert();

create trigger trg_post_like_delete
after delete on public.post_likes
for each row execute function public.handle_post_like_delete();

-- Auto profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url, provider)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Pet Parent'),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_app_meta_data->>'provider'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger pets_updated_at
before update on public.pets
for each row execute function public.set_updated_at();

create trigger community_posts_updated_at
before update on public.community_posts
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.pets enable row level security;
alter table public.pet_health_records enable row level security;
alter table public.saju_results enable row level security;
alter table public.content_categories enable row level security;
alter table public.contents enable row level security;
alter table public.community_posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_comments enable row level security;
alter table public.post_reports enable row level security;
alter table public.payments enable row level security;

-- Profiles: own row
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Pets: owner CRUD
create policy "pets_select_own" on public.pets
  for select using (auth.uid() = owner_id);
create policy "pets_insert_own" on public.pets
  for insert with check (auth.uid() = owner_id);
create policy "pets_update_own" on public.pets
  for update using (auth.uid() = owner_id);
create policy "pets_delete_own" on public.pets
  for delete using (auth.uid() = owner_id);

-- Health records: owner
create policy "health_select_own" on public.pet_health_records
  for select using (auth.uid() = owner_id);
create policy "health_insert_own" on public.pet_health_records
  for insert with check (auth.uid() = owner_id);
create policy "health_update_own" on public.pet_health_records
  for update using (auth.uid() = owner_id);
create policy "health_delete_own" on public.pet_health_records
  for delete using (auth.uid() = owner_id);

-- Saju: owner read/write
create policy "saju_select_own" on public.saju_results
  for select using (auth.uid() = owner_id);
create policy "saju_insert_own" on public.saju_results
  for insert with check (auth.uid() = owner_id);

-- Content: public read when published
create policy "categories_public_read" on public.content_categories
  for select using (is_active = true);
create policy "contents_public_read" on public.contents
  for select using (is_published = true);

-- Community posts: public read (non-hidden), author write
create policy "posts_public_read" on public.community_posts
  for select using (is_hidden = false);
create policy "posts_insert_auth" on public.community_posts
  for insert with check (auth.uid() = author_id);
create policy "posts_update_own" on public.community_posts
  for update using (auth.uid() = author_id);
create policy "posts_delete_own" on public.community_posts
  for delete using (auth.uid() = author_id);

-- Likes: auth users
create policy "likes_public_read" on public.post_likes
  for select using (true);
create policy "likes_insert_own" on public.post_likes
  for insert with check (auth.uid() = user_id);
create policy "likes_delete_own" on public.post_likes
  for delete using (auth.uid() = user_id);

-- Comments
create policy "comments_public_read" on public.post_comments
  for select using (is_hidden = false);
create policy "comments_insert_auth" on public.post_comments
  for insert with check (auth.uid() = author_id);
create policy "comments_update_own" on public.post_comments
  for update using (auth.uid() = author_id);

-- Reports: reporter can insert
create policy "reports_insert_auth" on public.post_reports
  for insert with check (auth.uid() = reporter_id);

-- Payments: owner only
create policy "payments_select_own" on public.payments
  for select using (auth.uid() = user_id);
create policy "payments_insert_own" on public.payments
  for insert with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Seed: sitemap categories (coming-soon flags match diagram)
-- ---------------------------------------------------------------------------
insert into public.content_categories (channel, slug, name_ko, name_en, theme_color, emoji, sort_order, is_coming_soon) values
  ('dog', 'dog-breed', '견종 정보', 'Breed Info', '#3B82F6', '🐕', 1, true),
  ('dog', 'dog-health', '건강·케어', 'Health & Care', '#3B82F6', '💊', 2, true),
  ('dog', 'dog-training', '훈련', 'Training', '#3B82F6', '🎾', 3, true),
  ('dog', 'dog-food', '식단', 'Food', '#3B82F6', '🍖', 4, true),
  ('cat', 'cat-breed', '묘종 정보', 'Breed Info', '#EF4444', '🐈', 1, true),
  ('cat', 'cat-health', '건강·케어', 'Health & Care', '#EF4444', '💊', 2, true),
  ('cat', 'cat-behavior', '행동·심리', 'Behavior', '#EF4444', '🧠', 3, true),
  ('cat', 'cat-food', '식단', 'Food', '#EF4444', '🐟', 4, true),
  ('pet_saju', 'saju-daily', 'K-사주·띠별 운세', 'K-Saju Daily', '#8B5CF6', '✨', 1, false),
  ('pet_saju', 'saju-compatibility', '집사 궁합', 'Owner Compatibility', '#8B5CF6', '💞', 2, true),
  ('pet_saju', 'saju-premium', '평생 사주 리포트', 'Lifetime Report', '#8B5CF6', '📜', 3, true),
  ('community', 'pet-show', '사진 자랑', 'Pet Show', '#22C55E', '📸', 1, false),
  ('community', 'community-qa', 'Q&A', 'Q&A Board', '#22C55E', '❓', 2, false),
  ('community', 'community-free', '자유 게시판', 'Free Board', '#22C55E', '💬', 3, false),
  ('community', 'community-reviews', '후기·팁', 'Reviews & Tips', '#22C55E', '⭐', 4, false);
