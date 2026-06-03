-- Reptile channel categories and sample editorial (after 010_reptile_channel.sql).

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
  ('reptile', 'reptile-reptiles', '파충류', 'Reptiles', '#10B981', '🦎', 1, true, false),
  ('reptile', 'reptile-birds', '앵무새(조류)', 'Birds', '#10B981', '🦜', 2, true, false),
  ('reptile', 'reptile-other-pets', '다른동물', 'Other Small Pets', '#10B981', '🐾', 3, true, false),
  ('reptile', 'reptile-habitat', '환경·온습도', 'Habitat', '#10B981', '🌡️', 4, true, false)
on conflict (slug) do update set
  channel = excluded.channel,
  name_ko = excluded.name_ko,
  name_en = excluded.name_en,
  theme_color = excluded.theme_color,
  emoji = excluded.emoji,
  sort_order = excluded.sort_order,
  is_active = true,
  is_coming_soon = false;

insert into public.contents (
  channel, title, summary, body, tags, language, is_featured, is_published, published_at
)
select
  'reptile',
  '사육장 온도·습도, 이렇게 잡으면 안정적이에요',
  '파충류·조류·소동물 공통으로 환경이 먼저예요. 온도 구배, 습도, 은신처를 점검해 보세요.',
  '바스킹 구역과 서늘한 구역의 온도 차를 종에 맞게 맞추고, 습도는 탈피 전후에 특히 신경 써 주세요. 은신처가 없으면 스트레스가 쌓일 수 있어요.',
  array['환경', '온습도', '케어'],
  'ko',
  true,
  true,
  now()
where not exists (
  select 1 from public.contents where channel = 'reptile' and title = '사육장 온도·습도, 이렇게 잡으면 안정적이에요'
);

insert into public.contents (channel, title, summary, body, tags, language, is_featured, is_published, published_at)
select
  'reptile',
  '도마뱀·거북이, UVB와 온도 구배 체크리스트',
  '조명·히팅·습도를 맞추면 활동 리듬이 안정돼요.',
  'UVB 램프와 히터를 정기 점검하고, 탈피 전에는 습도를 조금 올려 주세요. 식욕·배변 변화가 있으면 수의사와 상담하세요.',
  array['파충류', 'UVB'],
  'ko',
  false,
  true,
  now()
where not exists (
  select 1 from public.contents where channel = 'reptile' and title = '도마뱀·거북이, UVB와 온도 구배 체크리스트'
);

insert into public.contents (channel, title, summary, body, tags, language, is_featured, is_published, published_at)
select
  'reptile',
  '앵무새(조류) 스트레스 신호와 놀이 루틴',
  '깃털·울음·식욕 변화를 보면 마음 상태를 읽을 수 있어요.',
  '하루 10~15분 교감·놀이 시간을 정해 주고, 갑작스러운 위치 이동은 피해 주세요. 깃털 뽑기나 과도한 울음은 스트레스 신호일 수 있어요.',
  array['앵무새', '조류', '놀이'],
  'ko',
  false,
  true,
  now()
where not exists (
  select 1 from public.contents where channel = 'reptile' and title = '앵무새(조류) 스트레스 신호와 놀이 루틴'
);

insert into public.contents (channel, title, summary, body, tags, language, is_featured, is_published, published_at)
select
  'reptile',
  '토끼·햄스터, 공간과 식단부터 챙기기',
  '케이지 크기·청결·종별 사료가 건강의 기본이에요.',
  '종에 맞는 건초·사료 비율을 지키고, 케이지는 최소한 몸 길이의 여러 배 넓이를 확보해 주세요. 야행성인 경우 낮에는 쉴 수 있게 해 주세요.',
  array['토끼', '햄스터', '식단'],
  'ko',
  false,
  true,
  now()
where not exists (
  select 1 from public.contents where channel = 'reptile' and title = '토끼·햄스터, 공간과 식단부터 챙기기'
);
