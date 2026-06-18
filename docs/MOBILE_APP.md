# Mobile app (Capacitor)

The Android and iOS apps wrap the deployed web app in a WebView. Most feature work still happens in the Next.js codebase and deploys through Vercel.

## Prerequisites

- Node.js 20.x
- Android Studio (SDK + emulator or USB device)
- Java 21+ (Capacitor Android 7 build uses Java 21 source level)
- macOS + Xcode + CocoaPods for iOS builds

## Local commands

```bash
npm install
npm run build
npm run cap:sync
npm run cap:open:android
```

In Android Studio, run the `app` configuration on an emulator or device.
For CLI builds on Windows, make sure `JAVA_HOME` points to a JDK 21 installation:

```powershell
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
cd android
.\gradlew.bat assembleDebug
.\gradlew.bat bundleRelease
```

For iOS on a Mac:

```bash
npm install
npm run cap:sync
npm run cap:open:ios
```

Open `ios/App/App.xcworkspace` in Xcode, then run the `App` target.

## Live URL

`capacitor.config.ts` points the shell at:

`https://ksajupet.com`

After you connect a custom domain, update `server.url` in `capacitor.config.ts`, run `npm run cap:sync`, and rebuild the native apps.

## Supabase redirect URLs

Add every URL users can open in the app:

- `https://pupu4372-collab-my-two-project.vercel.app/auth/callback`
- `https://pupu4372-collab-my-two-project.vercel.app/auth/reset-password`
- `https://ksajupet.com/auth/callback`
- `https://ksajupet.com/auth/reset-password`
- `https://www.ksajupet.com/auth/callback`
- `https://www.ksajupet.com/auth/reset-password`
- `http://localhost:3000/auth/callback` (local web testing)
- `http://localhost:3000/auth/reset-password`

Also set **Site URL** to your production domain.

For Google/Kakao login setup details, see [SOCIAL_LOGIN.md](./SOCIAL_LOGIN.md).

## Kakao share (native app vs web)

The hybrid app uses **two paths**:

| Environment | Mechanism | Key |
|-------------|-----------|-----|
| Browser (`ksajupet.com`) | Kakao **JavaScript SDK** | `NEXT_PUBLIC_KAKAO_JS_KEY` in `.env.local` / Vercel |
| Capacitor Android/iOS shell | **Native Kakao SDK** via `capacitor-kakao-login-plugin` | **Native app key** in native config |

Code: `src/lib/share/kakao-share.ts` — `Capacitor.isNativePlatform()` branches automatically.

### Native app key setup

1. [developers.kakao.com](https://developers.kakao.com) → your app → **앱 키** → copy **네이티브 앱 키**
2. Replace `REPLACE_WITH_NATIVE_APP_KEY` in:
   - `android/app/src/main/res/values/strings.xml` (`kakao_app_key`, `kakao_scheme`)
   - `ios/App/App/Info.plist` (`KAKAO_APP_KEY`, URL scheme, `LSApplicationQueriesSchemes`)
3. **Android** platform: package `com.ksajupet.app` + **키해시** (debug + release) register in Kakao console
4. **iOS** platform: bundle ID `com.ksajupet.app` register in Kakao console
5. Run `npm run cap:sync` and rebuild the native app

Debug key hash (Windows):

```powershell
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
keytool -exportcert -alias androiddebugkey -keystore "$env:USERPROFILE\.android\debug.keystore" -storepass android -keypass android | openssl sha1 -binary | openssl base64
```

Web share still needs **Web** site domains (`https://ksajupet.com`, `http://localhost:3000`). Native share does **not** use JS SDK domain checks.

## PayPal / app URL

Set `NEXT_PUBLIC_APP_URL` in Vercel to the same domain users open in the app.

## Play internal testing

See [PLAY_INTERNAL_TEST.md](./PLAY_INTERNAL_TEST.md) for upload keystore, release AAB build, and Play Console internal test track steps.

## Android smoke test checklist

1. App opens to home
2. Login with email/password
3. Signup email confirm link opens `/auth/callback` and keeps session
4. Forgot password email opens `/auth/reset-password`
5. Saju form submit works
6. Pet Show image upload works

## iOS

The `ios/` project is generated. Windows can keep it in sync, but final iOS builds require macOS, Xcode, and CocoaPods.
