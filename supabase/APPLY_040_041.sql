-- Run in Supabase SQL Editor (040 → 041 in order)
-- Or open individual files:
--   supabase/migrations/040_pet_show_photo_category.sql
--   supabase/migrations/041_human_premium_checkout_session_nullable.sql

-- ========== 040_pet_show_photo_category.sql ==========

-- Pet Show photo category (cute / funny) on community_posts + challenge_posts

do $$
begin
  if not exists (select 1 from pg_type where typname = 'pet_show_photo_category') then
    create type public.pet_show_photo_category as enum ('cute', 'funny');
  end if;
end $$;

-- community_posts.category already exists (Q&A board); reuse for photo_show
update public.community_posts
set category = 'funny'
where post_type = 'photo_show'
  and (
    category is null and tags @> array['fails']::text[]
    or category = 'fails'
  );

update public.community_posts
set category = 'cute'
where post_type = 'photo_show'
  and (category is null or category not in ('cute', 'funny'));

alter table public.challenge_posts
  add column if not exists category public.pet_show_photo_category not null default 'cute';

create index if not exists idx_community_posts_photo_show_ranking_cute
  on public.community_posts (post_type, like_count desc, created_at desc)
  where post_type = 'photo_show'
    and is_hidden = false
    and (category is null or category = 'cute');

create index if not exists idx_community_posts_photo_show_ranking_funny
  on public.community_posts (post_type, like_count desc, created_at desc)
  where post_type = 'photo_show'
    and is_hidden = false
    and category = 'funny';

comment on column public.challenge_posts.category is
  'Pet Show challenge entry tone: cute (default) or funny.';

comment on column public.community_posts.category is
  'Board category (Q&A/tips) or photo_show tone: cute | funny.';

-- ========== 041_human_premium_checkout_session_nullable.sql ==========

-- Free reports must not use sentinel checkout_session_id values (unique constraint).
-- Column is already nullable; clear legacy fixed values.

update public.human_premium_reports
set checkout_session_id = null
where checkout_session_id in ('daily-free', 'daily-extra', '')
   or checkout_session_id like 'bundle:%';

comment on column public.human_premium_reports.checkout_session_id is
  'Unique paid checkout session id for idempotent fulfillment; NULL for free reports.';
