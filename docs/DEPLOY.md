# 배포 가이드 (정리)

## 운영 배포: Vercel (기본)

이 프로젝트의 **실제 운영 배포**는 **Vercel**입니다.

| 항목 | 내용 |
|------|------|
| 프레임워크 | Next.js 15 (`vercel.json` → `"framework": "nextjs"`) |
| 빌드 명령 | `npm run build` (Vercel 기본값) |
| 프로덕션 URL | `https://pupu4372-collab-my-two-project.vercel.app` |
| 커스텀 도메인 | `https://ksajupet.com` — [DEPLOY_DOMAIN.md](./DEPLOY_DOMAIN.md) |
| 모바일(Capacitor) | 배포된 Vercel URL을 WebView로 로드 — [MOBILE_APP.md](./MOBILE_APP.md) |

### 배포 방법 (택 1)

**A. Git 연동 (권장)**  
GitHub `master`에 push → Vercel이 자동으로 Production 빌드·배포.

**B. Vercel CLI (로컬에서 즉시 배포)**  
로그인: `npx vercel login`  
프로덕션: `npm run vercel:deploy` (또는 `npx vercel deploy --prod`)

### 배포 전 체크리스트

1. `npm run lint` — 오류 없음
2. `npm run build` — 92 routes 등 빌드 성공
3. `public/stitch/` — UI에서 참조하는 정적 이미지 포함 (커밋 대상)
4. Vercel **Environment Variables** — `.env.example` 참고 (Supabase, `NEXT_PUBLIC_APP_URL` 등)
5. Supabase **Redirect URLs** — [DEPLOY_DOMAIN.md](./DEPLOY_DOMAIN.md) §4

### Vercel에 영향 없는 것

- `wrangler.jsonc`, `open-next.config.ts`, `npm run cf-*` — **Cloudflare Workers 실험용**. 운영 Vercel 배포와 무관.
- `workerd compatibility_date` 경고 — `cf-build` 할 때만 해당.
- `scripts/free-port.mjs`, `prestart` — 로컬 `npm start` 전용.

---

## 실험용: Cloudflare Workers (OpenNext)

저장소에 **대안 배포** 설정이 포함되어 있습니다. **지금까지 운영에 쓴 적은 없고**, 문서·도메인 가이드도 Vercel 기준입니다.

| 스크립트 | 용도 |
|----------|------|
| `npm run cf-build` | OpenNext 번들 (`.open-next/`, gitignore) |
| `npm run cf-deploy` | Cloudflare Workers 업로드 (`wrangler login` 또는 `CLOUDFLARE_API_TOKEN` 필요) |

Windows에서는 OpenNext가 완전 호환되지 않을 수 있습니다. CI/WSL 권장.

---

## 로컬 프로덕션 확인

```bash
npm run build
npm run start   # prestart가 :3000 점유 프로세스 정리
```

`exit_code=4294967295`(Windows)는 종종 **외부에서 프로세스를 끊은 경우**이며, `Ready`까지 뜬 뒤라면 앱 기동 실패가 아닐 수 있습니다.
