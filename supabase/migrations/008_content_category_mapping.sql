-- Categorize dog/cat editorial contents for richer channel browsing.
-- Existing content_categories/category_id columns are reused; this seed makes
-- the categories active and connects current articles by tags/title patterns.

insert into public.content_categories (
  channel,
  slug,
  name_ko,
  name_en,
  theme_color,
  emoji,
  sort_order,
  is_active,
  is_coming_soon
) values
  ('dog', 'dog-walk', '산책·놀이', 'Walks & Play', '#3B82F6', '🦮', 5, true, false),
  ('dog', 'dog-anxiety', '분리불안·생활', 'Anxiety & Home Life', '#3B82F6', '🏠', 6, true, false),
  ('cat', 'cat-litter', '화장실·환경', 'Litter & Environment', '#EF4444', '🚽', 5, true, false),
  ('cat', 'cat-play', '사냥놀이·활동', 'Play & Activity', '#EF4444', '🪶', 6, true, false)
on conflict (slug) do update set
  name_ko = excluded.name_ko,
  name_en = excluded.name_en,
  theme_color = excluded.theme_color,
  emoji = excluded.emoji,
  sort_order = excluded.sort_order,
  is_active = true,
  is_coming_soon = false;

update public.content_categories
set is_active = true,
    is_coming_soon = false
where slug in (
  'dog-breed',
  'dog-health',
  'dog-training',
  'dog-food',
  'cat-breed',
  'cat-health',
  'cat-behavior',
  'cat-food'
);

update public.contents c
set category_id = cc.id
from public.content_categories cc
where c.channel = 'dog'
  and cc.slug = 'dog-walk'
  and (
    c.tags && array['산책', '퍼피', '장마', '놀이']
    or c.title ilike '%산책%'
  );

update public.contents c
set category_id = cc.id
from public.content_categories cc
where c.channel = 'dog'
  and cc.slug = 'dog-food'
  and (
    c.tags && array['식단', '간식']
    or c.title ilike '%간식%'
    or c.title ilike '%밥%'
  );

update public.contents c
set category_id = cc.id
from public.content_categories cc
where c.channel = 'dog'
  and cc.slug = 'dog-anxiety'
  and (
    c.tags && array['분리불안', '생활']
    or c.title ilike '%불안%'
    or c.title ilike '%혼자%'
  );

update public.contents c
set category_id = cc.id
from public.content_categories cc
where c.channel = 'dog'
  and c.category_id is null
  and cc.slug = 'dog-training'
  and c.tags && array['훈련'];

update public.contents c
set category_id = cc.id
from public.content_categories cc
where c.channel = 'cat'
  and cc.slug = 'cat-play'
  and (
    c.tags && array['우다다', '놀이']
    or c.title ilike '%우다다%'
    or c.title ilike '%놀이%'
  );

update public.contents c
set category_id = cc.id
from public.content_categories cc
where c.channel = 'cat'
  and cc.slug = 'cat-litter'
  and (
    c.tags && array['화장실']
    or c.title ilike '%화장실%'
  );

update public.contents c
set category_id = cc.id
from public.content_categories cc
where c.channel = 'cat'
  and cc.slug = 'cat-food'
  and (
    c.tags && array['음수', '식단']
    or c.title ilike '%물그릇%'
    or c.title ilike '%음수%'
  );

update public.contents c
set category_id = cc.id
from public.content_categories cc
where c.channel = 'cat'
  and c.category_id is null
  and cc.slug = 'cat-behavior'
  and c.tags && array['행동', '심리'];

create index if not exists idx_contents_category_published
  on public.contents (category_id, is_published, published_at desc);
