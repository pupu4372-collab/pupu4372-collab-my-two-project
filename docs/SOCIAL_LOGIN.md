# Social login setup

K-Saju Pet currently shows Google and Kakao buttons on `/login`.

- Google button: wired to Supabase Google OAuth fallback now.
- Kakao button: UI placeholder now, native/server login can be wired later.
- Target app UX: replace Google fallback with native Google sign-in + Supabase `signInWithIdToken`.

## Current Google fallback

The current button calls:

```ts
supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
    queryParams: { prompt: "select_account" },
  },
});
```

If the browser shows:

```txt
Unsupported provider: provider is not enabled
```

then code is working, but Supabase Google Provider is not enabled yet.

## Enable Google in Supabase

Supabase Dashboard:

1. Authentication -> Providers
2. Enable Google
3. Paste Google Cloud **Web client ID**
4. Paste Google Cloud **Web client secret**
5. Save

Supabase URL configuration:

- Site URL: `https://ksajupet.com`
- Redirect URLs (exact path or wildcard; query strings are not part of the allowlist match):
  - `https://ksajupet.com/auth/callback`
  - `https://ksajupet.com/auth/reset-password`
  - `https://www.ksajupet.com/auth/callback`
  - `https://www.ksajupet.com/auth/reset-password`
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/auth/reset-password`
  - `http://localhost:3000/**` (optional wildcard for local ports)
  - If you use another dev port (for example `3010`), add `http://localhost:3010/auth/callback` too

## Google Cloud Web OAuth client

Google Cloud Console:

1. APIs & Services -> OAuth consent screen
2. Set app name: `K-Saju Pet`
3. Add support email and developer contact email
4. Credentials -> Create Credentials -> OAuth client ID
5. Application type: **Web application**
6. Authorized redirect URI:

```txt
https://jvvduburvqfcualzmwig.supabase.co/auth/v1/callback
```

Copy its Client ID and Client Secret into Supabase.

## Android native Google later

For native Google login, add an **Android OAuth client** in Google Cloud:

- Package name: `com.ksajupet.app`
- SHA-1: debug keystore for emulator/dev testing
- SHA-1: upload keystore for Play builds

Debug SHA-1 command:

```powershell
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
keytool -list -v -alias androiddebugkey -keystore "$env:USERPROFILE\.android\debug.keystore" -storepass android -keypass android
```

Upload keystore SHA-1 command (after creating `android/ksajupet-upload.keystore`):

```powershell
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
keytool -list -v -keystore android/ksajupet-upload.keystore -alias upload
```

The native app flow should be:

```txt
Google native account chooser
-> Google idToken
-> supabase.auth.signInWithIdToken({ provider: "google", token: idToken })
-> existing Supabase session / DB / RLS
```

## Kakao placeholder now

Kakao currently only displays a "coming soon" message. This avoids a broken redirect flow while we prepare a proper native/server-backed implementation.

Future Kakao native flow:

```txt
Kakao native login
-> Kakao access token
-> Next.js API verifies token with Kakao
-> map/create Supabase user
-> issue app session
```

Needed Kakao Developer settings later:

- Android package: `com.ksajupet.app`
- Key hash for debug and upload signing keys
- Consent items: account email, profile nickname, profile image
- Native app key

## Session policy (remember me + 3h cap)

App-level policy in `src/lib/supabase/auth-session-policy.ts` (Supabase auth cookies stay on SSR defaults for OAuth PKCE).

1. **Supabase Dashboard** → Authentication → Settings → JWT expiry: `10800` (3 hours).
2. Login page **로그인 상태 유지**:
   - Checked: session survives browser restart until 3 hours after login.
   - Unchecked: closing the browser ends the session (`sessionStorage` alive flag).
3. After 3 hours from login time, the app signs out regardless of the checkbox.

Google OAuth stores the checkbox choice in `auth_remember_me` cookie before redirect; it is applied on the first `SIGNED_IN` event after callback.

## Play Console data safety

If Google/Kakao login is enabled, reflect this in Play Console:

- Account info / email may be collected
- Profile info may be collected if stored in `profiles`
- Purpose: account management, app functionality
- Data is transmitted over HTTPS

