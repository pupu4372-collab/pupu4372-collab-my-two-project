# 구글 / 페이스북 / 네이버 간편 로그인 설정

앱 코드는 이미 준비되어 있습니다. 아래 설정만 하면 로그인 화면의 소셜 버튼이 동작합니다.

공통 Supabase Callback URL:

```text
https://jvvduburvqfcualzmwig.supabase.co/auth/v1/callback
```

Vercel 사이트 URL (Supabase → Authentication → URL Configuration):

```text
Site URL: https://my-first-project.vercel.app
Redirect URLs: https://my-first-project.vercel.app/**
```

### 한 번에 진행 체크리스트

| 순서 | Google | Facebook | Naver |
|------|--------|----------|-------|
| 1 | Cloud Console OAuth 클라이언트 생성 | Meta 앱 + Facebook Login | 네이버 개발자 앱 등록 |
| 2 | Redirect URI → Supabase callback | Valid OAuth Redirect URIs 동일 | Callback URL 동일 |
| 3 | Supabase → Google ON | Supabase → Facebook ON | Supabase → **custom:naver** OAuth2 생성 |
| 4 | `/ko/login` 에서 구글 버튼 테스트 | 페이스북 버튼 테스트 | 네이버 버튼 테스트 |

로컬 테스트 시 Redirect URLs에 `http://localhost:3000/**` 도 추가하세요.

---

## 1. Google

### Google Cloud Console
1. https://console.cloud.google.com 접속
2. 프로젝트 선택 또는 새로 만들기
3. **APIs & Services → OAuth consent screen** 설정 (External, 테스트 사용자에 본인 이메일 추가)
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
5. Application type: **Web application**
6. **Authorized redirect URIs**에 추가:

```text
https://jvvduburvqfcualzmwig.supabase.co/auth/v1/callback
```

7. **Client ID**, **Client Secret** 복사

### Supabase
1. **Authentication → Sign In / Providers → Google**
2. Enable ON
3. Client ID / Client Secret 붙여넣기
4. Save

---

## 2. Facebook

### Meta for Developers
1. https://developers.facebook.com 접속
2. **My Apps → Create App** (Consumer 또는 Login 용도)
3. 제품에 **Facebook Login** 추가
4. **Facebook Login → Settings**
5. **Valid OAuth Redirect URIs**에 추가:

```text
https://jvvduburvqfcualzmwig.supabase.co/auth/v1/callback
```

6. **Settings → Basic**에서 **App ID**, **App Secret** 확인
7. 앱을 **Live** 모드로 전환 (테스트만 할 때는 테스트 사용자 등록)

### Supabase
1. **Authentication → Sign In / Providers → Facebook**
2. Enable ON
3. Facebook App ID / Secret 붙여넣기
4. Save

---

## 3. Naver (Custom OAuth2)

앱 코드는 Supabase provider id **`custom:naver`** 로 로그인을 요청합니다.  
대시보드에서 아래와 같이 **Custom OAuth2** provider를 만들어야 합니다.

### Naver Developers
1. https://developers.naver.com 접속
2. **Application → 애플리케이션 등록**
3. 사용 API: **네이버 로그인** 선택
4. 서비스 URL:

```text
https://my-first-project.vercel.app
```

5. Callback URL (네이버 콘솔에 입력):

```text
https://jvvduburvqfcualzmwig.supabase.co/auth/v1/callback
```

6. **Client ID**, **Client Secret** 복사

### Supabase (Custom OAuth2)
1. **Authentication → Sign In / Providers → New Provider**
2. **Manual configuration (OAuth2)** 선택
3. 설정값:

| 항목 | 값 |
|------|-----|
| Identifier | `custom:naver` (반드시 이 이름) |
| Client ID / Secret | 네이버에서 복사한 값 |
| Authorization URL | `https://nid.naver.com/oauth2.0/authorize` |
| Token URL | `https://nid.naver.com/oauth2.0/token` |
| UserInfo URL | `https://openapi.naver.com/v1/nid/me` |
| Scopes | `profile` (필요 시 `email` 추가) |

4. **Email optional** 을 ON (네이버는 이메일을 안 줄 수 있음)
5. Provider **Enable** 후 Save

> 대시보드에 기본 **Naver** provider가 따로 있다면, identifier를 `naver`로 쓰는 방식도 가능합니다. 그 경우 개발자에게 알려주면 코드의 `custom:naver`를 `naver`로 맞출 수 있습니다.

---

## 4. 테스트 순서

1. Vercel 최신 배포가 **Ready**인지 확인
2. `https://my-first-project.vercel.app/ko/login` 접속
3. **구글로 로그인** → 계정 선택 → **홈(/ko)** 으로 이동하는지 확인
4. 같은 방식으로 Facebook, Naver 테스트

---

## 5. 자주 나는 오류

| 증상 | 해결 |
|------|------|
| redirect_uri_mismatch | Google/Facebook/Naver 콘솔의 Callback URL이 Supabase URL과 정확히 같은지 확인 |
| provider is not enabled | Supabase Providers에서 해당 항목 Enable |
| 로그인 후 localhost로 이동 | Supabase Site URL을 Vercel 주소로 변경 |
| 네이버만 안 됨 | Supabase에 Naver provider 없을 수 있음 → Custom OIDC 또는 Kakao 검토 |
