# K-Saju Pet (MVP — K-Saju module)

Global pet community + K-Saju. This slice ships the **basic K-Saju** flow: 만세력 (four pillars) via `lunisolar`, hip **Mok / Hwa / …** element labels, EN/KO storytelling, UTC birth storage, and privacy consent.

## Run locally

Requires [Node.js 20+](https://nodejs.org/) with npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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
src/lib/saju/       # Engine, elements, narratives, timezone
src/app/api/saju/   # REST endpoint
src/components/k-saju/
```

## Next steps

1. Supabase `pets` + `saju_results` persistence
2. `next-intl` routes (`/en`, `/ko`)
3. Pet Show feed + report moderation
