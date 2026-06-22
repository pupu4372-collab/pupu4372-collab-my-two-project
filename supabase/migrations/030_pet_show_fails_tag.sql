-- pet-show fails tag: 업로드 시 'fails' 태그로 구분
-- tags 컬럼은 이미 community_posts에 있으므로
-- 별도 스키마 변경 없이 인덱스만 추가

create index if not exists idx_community_posts_tags
  on public.community_posts using gin (tags);

comment on column public.community_posts.tags is
  'pet-show fails = tags @> ARRAY[''fails'']';