-- Run once in Supabase SQL Editor


-- ===== 001_initial_schema.sql =====

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


-- ===== 002_pet_show_ranking_view.sql =====

-- Materialized-friendly ranking view for Pet Show (photo_show)
-- Refresh optional; live queries use community_posts.like_count index.

create or replace view public.pet_show_ranking_weekly
with (security_invoker = true) as
select
  p.id,
  p.author_id,
  p.pet_id,
  p.title,
  p.image_urls,
  p.like_count,
  p.comment_count,
  p.created_at,
  rank() over (
    order by p.like_count desc, p.created_at desc
  ) as rank_position
from public.community_posts p
where p.post_type = 'photo_show'
  and p.is_hidden = false
  and p.created_at >= (now() at time zone 'utc') - interval '7 days';

comment on view public.pet_show_ranking_weekly is
  'Top Pet Show posts in the last 7 days, ordered by like_count then recency.';


-- ===== 003_pet_show_storage.sql =====

-- Supabase Storage bucket for Pet Show photos

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pet-show',
  'pet-show',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

create policy "pet_show_images_public_read"
on storage.objects for select
using (bucket_id = 'pet-show');

create policy "pet_show_images_auth_upload"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'pet-show'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "pet_show_images_auth_delete_own"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'pet-show'
  and (storage.foldername(name))[1] = auth.uid()::text
);


-- ===== 004_saju_type_zodiac.sql =====

-- Add zodiac fortune type for saved readings
ALTER TYPE public.saju_type ADD VALUE IF NOT EXISTS 'zodiac';


-- ===== 005_seed_channel_contents.sql =====

-- Sample published editorial content for dog / cat channels
insert into public.contents (
  channel, title, summary, body, tags, language, is_featured, is_published, published_at
)
select
  'dog',
  '비 오는 날 산책 체크리스트',
  '젖은 발·귀 관리와 실내 대체 놀이까지, 장마철 댕댕이 산책 가이드.',
  '비 오는 날에는 발가락 사이를 꼼꼼히 말려주고, 귀 안쪽 습기도 확인해 주세요. 실외 산책이 어렵다면 집 안 노즈워크 매트로 냄새 탐험 시간을 대신해 주는 것도 좋아요.',
  array['산책', '장마', '케어'],
  'ko',
  true,
  true,
  now()
where not exists (
  select 1 from public.contents where channel = 'dog' and title = '비 오는 날 산책 체크리스트'
);

insert into public.contents (channel, title, summary, body, tags, language, is_featured, is_published, published_at)
select 'dog', '퍼피의 첫 산책, 이렇게 시작해요', '하네스 적응부터 짧은 코스까지, 무리 없는 첫 산책 루틴.', '첫 산책은 5분도 충분해요. 하네스를 먼저 집 안에서 긍정적으로 연결한 뒤, 익숙한 골목 한 바퀴만 돌아오세요.', array['퍼피', '산책'], 'ko', false, true, now()
where not exists (select 1 from public.contents where channel = 'dog' and title = '퍼피의 첫 산책, 이렇게 시작해요');

insert into public.contents (channel, title, summary, body, tags, language, is_featured, is_published, published_at)
select 'dog', '간식은 칭찬 도구, 밥은 루틴', '급여량·간식 비율을 지키는 실전 식단 팁.', '간식은 훈련 직후 짧게 주는 것이 가장 좋아요. 하루 총 열량의 10% 안쪽을 지키면 체중 관리에 도움이 됩니다.', array['식단', '간식'], 'ko', false, true, now()
where not exists (select 1 from public.contents where channel = 'dog' and title = '간식은 칭찬 도구, 밥은 루틴');

insert into public.contents (channel, title, summary, body, tags, language, is_featured, is_published, published_at)
select 'dog', '혼자 있을 때 불안, 환경부터 바꿔요', '분리불안 예방을 위한 출근 전·후 루틴.', '출근 10분 전Play는 피하고, 돌아오면 조용히 인사한 뒤 2분 뒤에 산책을 시작하면 기대치를 낮출 수 있어요.', array['분리불안', '훈련'], 'ko', false, true, now()
where not exists (select 1 from public.contents where channel = 'dog' and title = '혼자 있을 때 불안, 환경부터 바꿔요');

insert into public.contents (channel, title, summary, body, tags, language, is_featured, is_published, published_at)
select
  'cat',
  '새벽 우다다, 낮에 사냥 놀이',
  '밤 에너지를 낮에 풀어주는 사냥 놀이 시퀀스.',
  '낚싯대 놀이는 숨기기-추격-잡기 순서로 10분만 해도 효과가 있어요. 끝에 소량의 급여로 사냥을 완성해 주세요.',
  array['우다다', '놀이'],
  'ko',
  true,
  true,
  now()
where not exists (select 1 from public.contents where channel = 'cat' and title = '새벽 우다다, 낮에 사냥 놀이');

insert into public.contents (channel, title, summary, body, tags, language, is_featured, is_published, published_at)
select 'cat', '화장실 밖 실수, 체크 순서', '모래·위치·청결·건강을 순서대로 점검.', '갑작스러운 실수는 스트레스나 요로 문제 신호일 수 있어요. 화장실 개수와 청결도를 먼저 확인하세요.', array['화장실'], 'ko', false, true, now()
where not exists (select 1 from public.contents where channel = 'cat' and title = '화장실 밖 실수, 체크 순서');

insert into public.contents (channel, title, summary, body, tags, language, is_featured, is_published, published_at)
select 'cat', '물그릇 위치만 바꿔도 음수량 UP', '습식·그릇 재질·위치 실험 가이드.', '밥그릇 옆이 아닌 다른 공간에 물그릇을 두면 마시는 양이 늘어나는 경우가 많아요.', array['음수', '식단'], 'ko', false, true, now()
where not exists (select 1 from public.contents where channel = 'cat' and title = '물그릇 위치만 바꿔도 음수량 UP');

insert into public.contents (channel, title, summary, body, tags, language, is_featured, is_published, published_at)
select 'cat', '만져도 되는 시간 만들기', '스킨십 경계를 존중하는 접근법.', '먼저 코를 맡게 하고, 턱 아래 짧게 스킨십한 뒤, 스스로 물러나면 바로 멈춰 주세요.', array['행동', '심리'], 'ko', false, true, now()
where not exists (select 1 from public.contents where channel = 'cat' and title = '만져도 되는 시간 만들기');


-- ===== 006_qa_comments_and_seed.sql =====

-- Q&A detail support: comment counters and starter board data.
-- Topics are based on common dog/cat care FAQ categories: walking, anxiety,
-- litter, feeding, grooming, introductions, and everyday behavior.

create or replace function public.handle_post_comment_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.community_posts
  set comment_count = comment_count + 1
  where id = new.post_id;
  return new;
end;
$$;

create or replace function public.handle_post_comment_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.community_posts
  set comment_count = greatest(comment_count - 1, 0)
  where id = old.post_id;
  return old;
end;
$$;

drop trigger if exists trg_post_comment_insert on public.post_comments;
create trigger trg_post_comment_insert
after insert on public.post_comments
for each row execute function public.handle_post_comment_insert();

drop trigger if exists trg_post_comment_delete on public.post_comments;
create trigger trg_post_comment_delete
after delete on public.post_comments
for each row execute function public.handle_post_comment_delete();

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) values (
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'demo-qa@cosmic-paws.local',
  crypt('cosmic-paws-demo', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Cosmic Paws Q&A"}'::jsonb,
  now(),
  now()
) on conflict (id) do nothing;

insert into public.profiles (id, display_name, avatar_url, locale, timezone, provider, role)
values (
  '00000000-0000-0000-0000-000000000101',
  'Cosmic Paws 운영진',
  null,
  'ko',
  'Asia/Seoul',
  'seed',
  'admin'
)
on conflict (id) do update
set display_name = excluded.display_name,
    provider = excluded.provider,
    role = excluded.role,
    updated_at = now();

with seed(n, title, content, tags, likes, views) as (
  values
    (1, '강아지가 혼자 있으면 계속 짖어요', '외출하면 10분 안에 짖기 시작하고 문 앞에서 기다립니다. 분리불안인지, 집에서 어떤 순서로 연습하면 좋을까요?', array['dog','separation-anxiety','training'], 32, 410),
    (2, '고양이 화장실은 몇 개가 적당할까요?', '한 마리를 키우는데 화장실 하나로 충분한지 고민입니다. 위치와 모래 종류도 같이 조언 부탁드려요.', array['cat','litter','care'], 28, 356),
    (3, '산책 중 다른 강아지만 보면 흥분해요', '줄을 당기고 낑낑거리다가 짖기도 합니다. 인사시키는 게 맞는지, 거리를 두고 훈련해야 하는지 궁금해요.', array['dog','walk','behavior'], 25, 330),
    (4, '새벽 우다다를 줄이는 방법이 있을까요?', '밤마다 뛰어다니고 장난감을 물고 옵니다. 자기 전 놀이 루틴을 어떻게 잡으면 좋을까요?', array['cat','play','night'], 21, 288),
    (5, '강아지가 사료를 갑자기 안 먹어요', '간식은 먹는데 사료만 남깁니다. 사료를 바로 바꿔도 되는지, 병원에 가야 하는 기준이 궁금해요.', array['dog','food','health'], 19, 275),
    (6, '고양이가 물을 너무 적게 마시는 것 같아요', '정수기를 써도 관심이 적습니다. 습식 비율이나 물그릇 위치를 어떻게 바꾸면 좋을까요?', array['cat','water','food'], 18, 261),
    (7, '배변 실수가 다시 시작됐어요', '배변 훈련이 끝난 줄 알았는데 최근 러그에 실수합니다. 환경 변화가 원인일 수 있을까요?', array['dog','potty','routine'], 16, 240),
    (8, '고양이 스크래처를 안 써요', '소파만 긁고 스크래처는 피합니다. 재질이나 위치를 바꾸면 효과가 있을까요?', array['cat','scratch','home'], 15, 229),
    (9, '입질이 심한 어린 강아지 어떻게 알려줘야 하나요?', '놀 때 손을 물고 흥분하면 더 세게 뭅니다. 혼내지 않고 멈추게 하는 방법이 궁금해요.', array['dog','puppy','bite'], 23, 315),
    (10, '고양이가 갑자기 숨는 시간이 늘었어요', '평소보다 침대 밑에 오래 있고 만지는 걸 피합니다. 스트레스인지 건강 문제인지 구분하고 싶어요.', array['cat','stress','health'], 20, 300),
    (11, '하네스 적응은 얼마나 걸릴까요?', '집에서는 괜찮은데 밖에 나가면 얼어붙습니다. 단계별로 적응시키는 팁이 있을까요?', array['dog','harness','walk'], 13, 190),
    (12, '고양이 합사 첫날에 서로 하악질해요', '문틈 냄새 교환은 했는데 얼굴을 보자마자 하악질합니다. 다시 분리해야 할까요?', array['cat','introductions','behavior'], 24, 340),
    (13, '강아지 귀 청소 주기가 궁금해요', '귀 냄새는 심하지 않은데 갈색 귀지가 조금 보입니다. 집에서 관리해도 되는 범위가 있을까요?', array['dog','grooming','health'], 12, 180),
    (14, '고양이 털토를 자주 해요', '일주일에 한두 번 정도 털을 토합니다. 빗질이나 사료로 줄일 수 있는지 궁금해요.', array['cat','grooming','hairball'], 17, 248),
    (15, '산책 시간이 짧아도 괜찮을까요?', '평일에는 15분씩 두 번이 한계입니다. 노즈워크나 실내 놀이로 보완할 수 있을까요?', array['dog','walk','enrichment'], 14, 210),
    (16, '고양이가 밥을 조금씩 자주 먹고 싶어해요', '정해진 시간 급식으로 바꾸려는데 계속 달라고 울어요. 천천히 바꾸는 방법이 있을까요?', array['cat','food','routine'], 11, 170),
    (17, '강아지가 초인종 소리에 심하게 짖어요', '택배가 오면 멈추지 않고 짖습니다. 소리 둔감화 훈련을 어떻게 시작하면 좋을까요?', array['dog','barking','training'], 22, 305),
    (18, '고양이 모래를 바꾸면 바로 거부할까요?', '먼지가 적은 모래로 바꾸고 싶은데 화장실을 안 쓸까 봐 걱정됩니다. 섞어서 바꾸는 게 좋나요?', array['cat','litter','routine'], 13, 205),
    (19, '강아지가 차만 타면 침을 흘려요', '병원 가는 날마다 차멀미처럼 보여요. 짧은 거리부터 연습하면 도움이 될까요?', array['dog','car','stress'], 10, 165),
    (20, '고양이가 손을 사냥감처럼 물어요', '놀다가 갑자기 손목을 잡고 뒷발차기를 합니다. 손놀이를 끊는 방법이 궁금해요.', array['cat','play','bite'], 18, 260),
    (21, '강아지 발 닦을 때 너무 싫어해요', '산책 후 발을 닦으려면 도망가고 으르렁거립니다. 간식 보상으로 천천히 해도 될까요?', array['dog','grooming','training'], 12, 188),
    (22, '고양이가 창밖 새를 보며 이상한 소리를 내요', '짹짹거리는 듯한 소리를 내는데 스트레스인지 흥분인지 궁금합니다.', array['cat','behavior','play'], 9, 140),
    (23, '강아지 사회화가 늦은 것 같아요', '성견 입양 후 사람과 개를 모두 무서워합니다. 무리하지 않고 적응시키는 기준을 알고 싶어요.', array['dog','socialization','adoption'], 20, 289),
    (24, '고양이 양치 적응은 어떻게 시작하나요?', '칫솔만 보면 고개를 돌립니다. 손가락 거즈부터 시작하는 게 맞을까요?', array['cat','dental','care'], 15, 236),
    (25, '강아지가 자기 방석 대신 바닥에서 자요', '좋은 방석을 사줬는데 시원한 바닥만 찾습니다. 그냥 둬도 괜찮을까요?', array['dog','sleep','home'], 7, 120),
    (26, '고양이가 새 장난감에 금방 질려요', '처음 하루만 좋아하고 관심이 사라집니다. 장난감 로테이션이 효과가 있나요?', array['cat','play','enrichment'], 12, 198),
    (27, '강아지 간식은 하루에 얼마나 줘야 할까요?', '훈련 보상으로 자주 주다 보니 식사량이 줄었습니다. 간식 비율 기준이 궁금해요.', array['dog','food','training'], 16, 255),
    (28, '고양이가 높은 곳에서만 쉬어요', '캣타워 위에서만 자고 아래로 잘 안 내려옵니다. 안정감을 느끼는 행동일까요?', array['cat','home','behavior'], 8, 132),
    (29, '비 오는 날 산책을 싫어해요', '우비를 입히면 멈춰 서고 비 냄새도 싫어하는 듯합니다. 실내 대체 활동 추천 부탁드려요.', array['dog','walk','weather'], 14, 215),
    (30, '고양이 발톱 깎을 때 한 발도 힘들어요', '자는 틈에 하나씩 깎아도 깨면 도망갑니다. 스트레스 적게 관리하는 루틴이 있을까요?', array['cat','grooming','nail'], 19, 278),
    (31, '강아지가 손님에게 뛰어올라요', '반가워서 달려드는데 손님들이 놀랍니다. 앉아서 인사하는 연습을 어떻게 시키나요?', array['dog','manners','training'], 17, 250),
    (32, '고양이가 밥그릇 주변을 긁어요', '먹고 난 뒤 바닥을 덮는 것처럼 긁습니다. 불만 표시인지 본능 행동인지 궁금해요.', array['cat','food','behavior'], 10, 168),
    (33, '강아지가 다른 집 개똥을 먹으려 해요', '산책 중 냄새 맡다가 먹으려 해서 걱정됩니다. 식분증과 훈련 방법을 알고 싶어요.', array['dog','walk','coprophagia'], 18, 290),
    (34, '고양이 이동장 적응이 너무 어려워요', '병원 갈 때만 이동장을 꺼내서 그런지 보자마자 숨습니다. 평소에 어떻게 둬야 할까요?', array['cat','carrier','vet'], 22, 315),
    (35, '강아지 노즈워크를 매일 해도 되나요?', '산책을 못 한 날 노즈워크를 길게 해줍니다. 난이도와 시간을 어떻게 조절하면 좋을까요?', array['dog','enrichment','play'], 13, 202),
    (36, '고양이가 특정 사람만 피합니다', '가족 중 한 명만 보면 멀리 돌아갑니다. 냄새나 목소리 때문일 수 있을까요?', array['cat','stress','family'], 9, 152),
    (37, '강아지가 물그릇을 엎어요', '마시기보다 앞발로 장난치듯 엎습니다. 그릇 높이나 재질을 바꿔야 할까요?', array['dog','water','home'], 8, 138),
    (38, '고양이가 새벽에 밥 달라고 깨워요', '자동급식기를 쓰면 도움이 될까요? 울 때 바로 주면 습관이 될까 봐 걱정됩니다.', array['cat','food','night'], 21, 301),
    (39, '강아지가 미용 후 예민해졌어요', '미용실 다녀온 뒤 만지는 걸 싫어하고 잠을 많이 잡니다. 어느 정도까지 정상 반응일까요?', array['dog','grooming','stress'], 15, 230),
    (40, '고양이 캣닢 반응이 없어요', '다른 고양이들은 좋아한다는데 우리 아이는 무덤덤합니다. 정상인가요?', array['cat','catnip','play'], 6, 110),
    (41, '강아지 예방접종 후 산책은 언제부터 괜찮나요?', '접종 스케줄 중인데 사회화도 중요하다고 해서 고민됩니다. 안전한 범위가 궁금해요.', array['dog','vaccine','walk'], 20, 330),
    (42, '고양이가 화장실 밖에서 소변을 봤어요', '딱 한 번 실수했는데 그냥 지켜봐도 될까요? 병원에 바로 가야 하는 신호가 궁금합니다.', array['cat','litter','health'], 26, 380),
    (43, '강아지가 장난감을 지키며 으르렁거려요', '뺏으려고 하면 으르렁거립니다. 교환 놀이로 연습하면 나아질까요?', array['dog','resource-guarding','training'], 23, 345),
    (44, '고양이가 그루밍을 너무 많이 해요', '배 쪽 털이 조금 얇아진 것 같습니다. 스트레스와 피부 문제 중 무엇을 먼저 봐야 할까요?', array['cat','grooming','health'], 24, 360),
    (45, '강아지 산책 코스를 매일 바꾸는 게 좋나요?', '익숙한 길을 좋아하는지 새로운 길을 좋아하는지 헷갈립니다. 성향별로 다를까요?', array['dog','walk','routine'], 11, 172),
    (46, '고양이에게 두 번째 캣타워가 필요할까요?', '창가 자리를 두고 고양이 둘이 경쟁합니다. 공간을 분리하면 싸움이 줄어들까요?', array['cat','multi-cat','home'], 16, 242),
    (47, '강아지가 보호자 뒤만 따라다녀요', '화장실까지 따라오고 떨어지면 불안해합니다. 독립 시간을 어떻게 연습하면 좋을까요?', array['dog','attachment','training'], 27, 390),
    (48, '고양이가 갑자기 사료를 묻으려 해요', '밥그릇 주변을 긁고 남깁니다. 양이 많거나 맛이 마음에 안 드는 걸까요?', array['cat','food','behavior'], 13, 208),
    (49, '반려동물 사주 결과를 생활 루틴에 적용해도 될까요?', '목 기운이 강한 아이는 탐색 놀이를 늘리는 식으로 참고해도 괜찮을지 궁금합니다.', array['saju','routine','enrichment'], 30, 420),
    (50, '우리 아이 성향 태그는 어떻게 고르면 좋을까요?', '겁쟁이, 에너자이저, 애교쟁이처럼 여러 태그가 맞는 것 같습니다. 프로필에는 몇 개가 적당할까요?', array['profile','saju','community'], 12, 184)
),
upserted as (
  insert into public.community_posts (
    id,
    author_id,
    channel,
    post_type,
    title,
    content,
    image_urls,
    tags,
    language,
    like_count,
    view_count,
    is_pinned,
    created_at,
    updated_at
  )
  select
    ('00000000-0000-0000-0000-' || lpad((600000 + n)::text, 12, '0'))::uuid,
    '00000000-0000-0000-0000-000000000101',
    'community',
    'qa',
    title,
    content,
    '{}',
    tags,
    'ko',
    likes,
    views,
    n <= 3,
    now() - (n || ' hours')::interval,
    now() - (n || ' hours')::interval
  from seed
  on conflict (id) do update
  set title = excluded.title,
      content = excluded.content,
      tags = excluded.tags,
      like_count = excluded.like_count,
      view_count = excluded.view_count,
      is_pinned = excluded.is_pinned,
      updated_at = now()
  returning id, title
)
insert into public.post_comments (id, post_id, author_id, content, created_at, updated_at)
select
  ('00000000-0000-0000-0000-' || lpad((700000 + row_number() over (order by id))::text, 12, '0'))::uuid,
  id,
  '00000000-0000-0000-0000-000000000101',
  case
    when title like '%병원%' or title like '%건강%' or title like '%소변%' or title like '%예방접종%'
      then '증상이 반복되거나 통증, 식욕 저하가 보이면 수의사 상담을 먼저 권장해요. 생활 루틴은 기록해두면 진료 때 도움이 됩니다.'
    when title like '%고양이%'
      then '고양이는 환경 변화에 민감해서 위치, 냄새, 소리부터 하나씩 바꿔보는 방식이 좋아요. 갑작스러운 변화는 피해주세요.'
    when title like '%강아지%'
      then '짧게 성공할 수 있는 상황을 만들고 보상을 바로 주는 방식이 좋아요. 흥분이 높아지기 전 거리를 확보해보세요.'
    else '아이 성향을 관찰하면서 작은 변화부터 적용해보세요. 기록을 남기면 패턴을 찾기 훨씬 쉬워요.'
  end,
  now() - interval '10 minutes',
  now() - interval '10 minutes'
from upserted
on conflict (id) do nothing;

update public.community_posts p
set comment_count = c.count
from (
  select post_id, count(*)::int as count
  from public.post_comments
  where is_hidden = false
  group by post_id
) c
where p.id = c.post_id
  and p.post_type = 'qa';

