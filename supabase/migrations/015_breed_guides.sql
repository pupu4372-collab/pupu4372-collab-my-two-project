-- Breed guide reference hub (SEO / pre-saju onboarding)

create table if not exists public.breed_guides (
  id uuid primary key default gen_random_uuid(),
  breed_name text not null,
  breed_name_en text,
  animal_type text not null check (animal_type in ('dog', 'cat', 'other')),
  size_category text,
  lifespan text,
  personality text,
  health_notes text,
  exercise_level text,
  grooming_level text,
  beginner_friendly boolean not null default true,
  saju_tendency text,
  seo_slug text not null unique,
  thumbnail_url text,
  hero_image_url text,
  summary text,
  body text,
  tags text[] not null default '{}',
  language text not null default 'ko' check (language in ('ko', 'en')),
  is_published boolean not null default false,
  view_count int not null default 0 check (view_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists breed_guides_animal_published_idx
  on public.breed_guides (animal_type, is_published, created_at desc);

create trigger breed_guides_updated_at
before update on public.breed_guides
for each row execute function public.set_updated_at();

alter table public.breed_guides enable row level security;

create policy "breed_guides_public_read" on public.breed_guides
  for select using (is_published = true);

create policy "breed_guides_admin_write" on public.breed_guides
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Seed samples (idempotent by seo_slug)
insert into public.breed_guides (
  breed_name, breed_name_en, animal_type, size_category, lifespan, personality,
  health_notes, exercise_level, grooming_level, beginner_friendly, saju_tendency,
  seo_slug, summary, body, tags, language, is_published
)
select
  v.breed_name, v.breed_name_en, v.animal_type, v.size_category, v.lifespan, v.personality,
  v.health_notes, v.exercise_level, v.grooming_level, v.beginner_friendly, v.saju_tendency,
  v.seo_slug, v.summary, v.body, v.tags, 'ko', true
from (values
  (
    '말티즈', 'Maltese', 'dog', 'small', '12–15년',
    '애착이 깊고 예민한 편이라 안정적인 루틴을 좋아해요.',
    '눈물 자국·슬개골·치아 관리를 꾸준히 확인하세요.',
    'low', 'high', true, '수(水) 기운 — 차분한 휴식 공간',
    'maltese',
    '소형견 대표 견종. 실내 생활에 잘 맞지만 분리불안에 주의가 필요해요.',
    '말티즈는 사람과의 교감을 중시합니다. 짧은 산책과 눈 주변 관리, 치아 브러싱을 루틴으로 잡아 주세요.',
    array['소형견', '초보']
  ),
  (
    '푸들', 'Poodle', 'dog', 'small', '12–15년',
    '똑똑하고 활동적이며 훈련 반응이 좋아요.',
    '귀 질환·피부 알레르기를 주기적으로 점검하세요.',
    'medium', 'high', true, '목(木) 기운 — 탐색·놀이',
    'poodle',
    '지능이 높아 지루함을 느끼면 문제 행동이 나올 수 있어요.',
    '푸들은 정신적 자극이 중요합니다. 산책 외에 노즈워크·퍼즐 장난감을 병행해 주세요.',
    array['소형견', '훈련']
  ),
  (
    '코리안 숏헤어', 'Korean Shorthair', 'cat', 'medium', '15–20년',
    '독립적이면서도 가족에게 애정을 표현하는 편이에요.',
    '비만·방광염 예방을 위해 급식량과 음수량을 관리하세요.',
    'low', 'low', true, '토(土) 기운 — 안정·규칙',
    'korean-shorthair',
    '우리나라 대표 묘종. 적응력이 좋아 초보 집사에게도 무난해요.',
    '캣타워와 창가 휴식 공간을 마련하고, 습식 비율을 늘려 수분 섭취를 돕는 것이 좋습니다.',
    array['단모', '초보']
  ),
  (
    '페르시안', 'Persian', 'cat', 'medium', '12–17년',
    '차분하고 조용한 성향이 많아요.',
    '털뭉침·눈물·호흡기 관리가 중요합니다.',
    'low', 'high', false, '금(金) 기운 — 정돈·청결',
    'persian',
    '장모종으로 그루밍 부담이 큰 편입니다.',
    '매일 빗질과 눈 주변 닦기를 습관화하고, 더운 날 실내 온도를 낮춰 주세요.',
    array['장모', '그루밍']
  )
) as v(
  breed_name, breed_name_en, animal_type, size_category, lifespan, personality,
  health_notes, exercise_level, grooming_level, beginner_friendly, saju_tendency,
  seo_slug, summary, body, tags
)
on conflict (seo_slug) do nothing;
