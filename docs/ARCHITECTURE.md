# K-Saju Pet / Cosmic Paws — Architecture

## App Router (sitemap → routes)

| Sitemap | Route | Status |
|---------|-------|--------|
| 메인 홈 | `/` | Live (K-Saju form) |
| 강아지 | `/dog` | Scaffold |
| 고양이 | `/cat` | Scaffold |
| 펫 사주 | `/saju` | Hub + `/` form |
| 커뮤니티 | `/community` | Hub |
| 사진 자랑 | `/community/pet-show` | Ranking UI |
| Q&A | `/community/qa` | Scaffold |
| 로그인 | `/login` | Scaffold |
| 프로필 | `/profile` | 내 정보 + 펫 프로필 (`/my` → redirect) |
| 관리자 | `/admin` | Scaffold |

## Database

Migrations: `supabase/migrations/001_initial_schema.sql`, `002_pet_show_ranking_view.sql`

```
auth.users → profiles → pets → saju_results
                      → community_posts → post_likes / post_comments / post_reports
                      → payments
```

## Core logic

- `src/lib/saju/jiji-hours.ts` — KST 30-min 12 지지 (`getZodiacSignByTime`, `resolveJijiBranch`)
- `src/lib/saju/engine.ts` — lunisolar four pillars + narratives
- `src/lib/community/ranking.ts` — Pet Show Top 5 queries

## APIs

- `POST /api/saju/basic` — 사주 계산 + DB 저장 (Authorization: Bearer)
- `GET /api/profile` — 집사 프로필 (auth)
- `GET /api/profile/pets` — 펫 프로필 목록 (auth)
- `GET /api/community/pet-show/ranking?period=week|realtime` — 랭킹 JSON
- `GET /api/community/pet-show/feed?cursor=` — 피드 페이지

## Auth flow

```
Browser → signInAnonymously() (or OAuth)
       → access_token in Authorization header
       → API persist pets + saju_results (RLS)
```
