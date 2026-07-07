-- Materialized-friendly ranking view for Pet Show (photo_show)
-- Refresh optional; live queries use community_posts.like_count index.

create or replace view public.pet_show_ranking_weekly as
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
  and (p.category is null or p.category = 'cute')
  and p.created_at >= (now() at time zone 'utc') - interval '7 days';

comment on view public.pet_show_ranking_weekly is
  'Top Pet Show posts in the last 7 days, ordered by like_count then recency.';
