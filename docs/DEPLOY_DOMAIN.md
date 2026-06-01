# 가비아 도메인 → Vercel 연결 가이드

구매한 도메인을 `pupu4372-collab-my-two-project` 프로젝트에 연결하는 순서입니다.

## 1. Vercel에 도메인 추가

1. [Vercel Dashboard](https://vercel.com) 로그인
2. 프로젝트 **pupu4372-collab-my-two-project** 선택
3. **Settings → Domains**
4. 구매한 도메인 입력 (예: `ksajupet.com`) → **Add**
5. `www`도 쓰려면 `www.ksajupet.com`도 추가

Vercel이 **Invalid Configuration** 또는 DNS 안내 화면을 보여줍니다. 아래 값을 메모하세요.

### 가비아에 넣을 DNS

| 호스트 | 타입 | 값 |
|--------|------|-----|
| `@` (또는 비움) | A | `76.76.21.21` |
| `www` | A | `76.76.21.21` |

Vercel 화면에 다른 값이 나오면 **Vercel에 표시된 값을 그대로** 사용하세요.

## 2. 가비아 DNS 설정

1. [가비아](https://www.gabia.com) 로그인
2. **My가비아 → 도메인 관리 → 구매한 도메인 → DNS 관리** (또는 네임서버/DNS 설정)
3. 기존 `@` A 레코드가 있으면 Vercel 값으로 수정
4. `www` A 레코드 추가
5. 저장 후 **전파 대기** (보통 10분~24시간, 많은 경우 1시간 내)

## 3. 연결 확인

브라우저에서 열어보기:

- `https://ksajupet.com`
- `https://www.ksajupet.com`

Vercel Domains 화면에서 **Valid Configuration** 이 되면 OK입니다.

**Primary Domain**을 루트 도메인(또는 www 없는 주소)으로 설정하는 것을 권장합니다.

## 4. Supabase (필수)

Supabase Dashboard → **Authentication → URL Configuration**

**Site URL**

```
https://ksajupet.com
```

**Redirect URLs**에 추가:

```
https://ksajupet.com/auth/callback
https://ksajupet.com/auth/reset-password
https://www.ksajupet.com/auth/callback
https://www.ksajupet.com/auth/reset-password
https://pupu4372-collab-my-two-project.vercel.app/auth/callback
https://pupu4372-collab-my-two-project.vercel.app/auth/reset-password
```

## 5. Vercel 환경 변수

Vercel → 프로젝트 → **Settings → Environment Variables**

| 이름 | 값 |
|------|-----|
| `NEXT_PUBLIC_APP_URL` | `https://ksajupet.com` |

Production에 적용 후 **Redeploy** 한 번 실행하세요.

## 6. 로컬 `.env.local`

```env
NEXT_PUBLIC_APP_URL=https://ksajupet.com
CAPACITOR_SERVER_URL=https://ksajupet.com
```

## 7. 모바일 앱 (Capacitor)

도메인 연결 후 프로젝트 루트에서:

```bash
npm run cap:sync
```

Android Studio에서 앱을 다시 빌드/실행하면 WebView가 새 도메인을 엽니다.

## 8. SSL

Vercel이 Let's Encrypt 인증서를 자동 발급합니다. DNS만 맞으면 `https://` 로 접속됩니다.

## 문제 해결

| 증상 | 확인 |
|------|------|
| 도메인이 안 열림 | 가비아 DNS 전파, A/CNAME 값 재확인 |
| Vercel Invalid Configuration | Domains 화면의 Required Records와 가비아 값 일치 여부 |
| 로그인/이메일 링크 실패 | Supabase Redirect URLs에 정확한 `https://도메인/auth/...` 포함 여부 |
| 앱만 예전 주소로 열림 | `CAPACITOR_SERVER_URL` 설정 후 `npm run cap:sync` |
