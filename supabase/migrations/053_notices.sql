-- Site notices (customer support list + community pinned rail)
-- Admin CRUD uses service-role APIs (bypasses RLS). RLS: public read only.

create table public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  locale text not null check (locale in ('ko', 'en')),
  is_pinned boolean not null default false,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index idx_notices_locale_published
  on public.notices (locale, published_at desc);

create index idx_notices_pinned_locale_published
  on public.notices (locale, published_at desc)
  where is_pinned = true;

alter table public.notices enable row level security;

-- Public read: only notices whose publish time has passed
-- (no insert/update/delete policies — writes go through service-role admin APIs)
create policy "notices_public_read" on public.notices
  for select using (published_at <= now());

-- Seed: migrate former static support-page notices (ko / en pairs)
insert into public.notices (title, body, locale, is_pinned, published_at) values
  (
    'K-사주 펫 모바일 앱 버전 2.1 업데이트 안내',
    '더욱 빠르고 정확해진 반려동물 사주 분석 로직이 적용되었습니다.',
    'ko',
    true,
    '2024-05-20T00:00:00+09:00'
  ),
  (
    'K-Saju Pet mobile app v2.1 update',
    'Updated support details for K-Saju Pet users.',
    'en',
    true,
    '2024-05-20T00:00:00+09:00'
  ),
  (
    '서버 점검 및 안정화 작업 공지 (5월 22일)',
    '서비스 안정화를 위한 서버 점검이 진행되었습니다. 이용에 참고해 주세요.',
    'ko',
    false,
    '2024-05-15T00:00:00+09:00'
  ),
  (
    'Server maintenance notice (May 22)',
    'Server maintenance for stability has been completed. Thank you for your patience.',
    'en',
    false,
    '2024-05-15T00:00:00+09:00'
  ),
  (
    '개인정보 처리방침 개정 안내',
    '개인정보 처리방침이 개정되었습니다. 고객센터와 정책 페이지에서 확인해 주세요.',
    'ko',
    false,
    '2024-05-10T00:00:00+09:00'
  ),
  (
    'Privacy policy update notice',
    'Our privacy policy has been updated. Please review the latest version on the support and policy pages.',
    'en',
    false,
    '2024-05-10T00:00:00+09:00'
  );
