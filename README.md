# K-Saju Pet (MVP — K-Saju module)

Global pet community + K-Saju. This slice ships the **basic K-Saju** flow: 만세력 (four pillars) via `lunisolar`, hip **Mok / Hwa / …** element labels, EN/KO storytelling, UTC birth storage, and privacy consent.

## Run locally

Requires [Node.js 20+](https://nodejs.org/) with npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy (Vercel)

**Production deploys go to Vercel** (`npm run build` on push or `npm run vercel:deploy`).  
See [docs/DEPLOY.md](docs/DEPLOY.md) for the full checklist. Cloudflare (`cf-*` scripts) is optional/experimental only.

## Custom domain (Gabia → Vercel)

See [docs/DEPLOY_DOMAIN.md](docs/DEPLOY_DOMAIN.md) for DNS, Supabase, and app URL setup.

## Mobile app (Android)

Capacitor wraps the deployed site in a native shell. See [docs/MOBILE_APP.md](docs/MOBILE_APP.md).

```bash
npm run cap:sync
npm run cap:open:android
```

## API

`POST /api/saju/basic`

```json
{
  "petName": "Mochi",
  "species": "dog",
  "birthDate": "2020-03-15",
  "birthTime": "14:30",
  "birthTimeUnknown": false,
  "timezone": "Asia/Seoul",
  "locale": "en",
  "privacyConsent": true
}
```

## Architecture notes

| Topic | Choice |
|--------|--------|
| Birth time | User enters **local** date/time + IANA timezone → stored/displayed as **UTC** |
| Unknown hour | Noon local for calculation; **hour pillar hidden** in UI |
| KST 12 branches | Birth UTC → **KST HH:mm** → `getZodiacSignByTime()` (Ja-si 23:30–01:30, …) |
| Moderation (MVP) | Pet name profanity filter; Pet Show will add **Report** + manual review later |
| Premium | PayPal deep report — not in this MVP |

## Project layout

```
supabase/migrations/     # PostgreSQL schema + triggers + seed categories
src/lib/saju/            # Engine, 12 지지, elements, narratives
src/lib/supabase/        # Client + DB types
src/lib/community/       # Pet Show ranking queries
src/app/                 # App Router (dog, cat, saju, community, my, admin)
src/app/api/             # saju/basic, community/pet-show/ranking
src/components/          # k-saju, home, layout, community
docs/ARCHITECTURE.md     # Sitemap ↔ routes map
```

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Copy `.env.example` → `.env.local` and fill keys
3. Run SQL from `supabase/migrations/` in the SQL Editor (or use Supabase CLI)

```bash
npm install
npm run dev
```

Without env vars, Pet Show ranking uses demo data; with Supabase configured, queries hit `community_posts`.

## APIs

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/saju/basic` | K-Saju + save `pets` / `saju_results` (Bearer token) |
| GET | `/api/profile` | User profile (auth) |
| GET | `/api/profile/pets` | Pet profiles + latest saju (auth) |
| GET | `/api/community/pet-show/ranking?period=week` | Pet Show Top 5 |
| GET | `/api/community/pet-show/feed?cursor=` | Pet Show infinite feed |

## Auth & persistence

1. Copy `.env.local` from `.env.example`
2. Supabase → **Authentication → Providers**: enable **Anonymous**, **Kakao**, **Google**
3. Redirect URLs: `http://localhost:3000/auth/callback`
4. On first saju submit, the app calls `signInAnonymously()` so results save under a guest profile
5. `/login` upgrades to Kakao/Google OAuth

## Pet Show upload

1. Run `supabase/migrations/003_pet_show_storage.sql` in Supabase SQL Editor
2. Open `/community/pet-show` → upload photo + title → appears in feed
3. APIs: `POST .../upload`, `POST .../posts`, `POST .../like`

## Next steps

1. PayPal premium report flow
2. 별자리 운세 (`/saju/zodiac`) full logic
3. 펫·집사 궁합 (`/saju/compatibility`) full logic
4. `next-intl` (`/en`, `/ko`) routes
