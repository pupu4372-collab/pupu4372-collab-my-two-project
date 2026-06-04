-- Q&A / Tips: animal_type + major category (Excel content structure)

alter table public.community_posts
  add column if not exists animal_type text,
  add column if not exists category text;

alter table public.community_posts
  drop constraint if exists community_posts_animal_type_check,
  add constraint community_posts_animal_type_check
    check (animal_type is null or animal_type in ('dog', 'cat', 'other'));

create index if not exists community_posts_board_animal_category_idx
  on public.community_posts (post_type, animal_type, category, created_at desc);

-- Backfill animal_type from legacy tags
update public.community_posts
set animal_type = 'dog'
where animal_type is null and 'dog' = any (tags);

update public.community_posts
set animal_type = 'cat'
where animal_type is null and 'cat' = any (tags);

update public.community_posts
set animal_type = 'other'
where animal_type is null and 'other' = any (tags);
