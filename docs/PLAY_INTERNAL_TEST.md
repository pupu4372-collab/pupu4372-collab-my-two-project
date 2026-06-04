# Google Play 내부 테스트 (Android)

K-Saju Pet (`com.ksajupet.app`)을 Play Console **내부 테스트** 트랙에 올리는 절차입니다.

## 사전 준비

| 항목 | 값 |
|------|-----|
| 패키지 ID | `com.ksajupet.app` |
| 앱 이름 | K-Saju Pet |
| 웹 URL (앱 WebView) | `https://ksajupet.com` |
| 개인정보처리방침 URL | `https://ksajupet.com/ko/privacy` |
| JDK | 21+ |
| Play Console | [Google Play Console](https://play.google.com/console) 개발자 계정 |

## 1. 업로드 키(서명) 만들기 (최초 1회)

PowerShell (프로젝트 루트):

```powershell
.\scripts\create-android-upload-keystore.ps1 -StorePassword "원하는-스토어-비밀번호" -KeyPassword "원하는-키-비밀번호"
```

생성 파일 (Git에 올리지 않음):

- `android/ksajupet-upload.keystore`
- `android/keystore.properties`

키스토어와 비밀번호는 **반드시 안전한 곳에 백업**하세요. 분실 시 동일 패키지로 업데이트 불가합니다.

## 2. Release AAB 빌드

```powershell
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
npm run cap:sync -- android
cd android
.\gradlew.bat bundleRelease
```

산출물:

`android/app/build/outputs/bundle/release/app-release.aab`

## 3. Play Console — 앱 만들기 (최초 1회)

1. Play Console → **앱 만들기**
2. 앱 이름: **K-Saju Pet**
3. 기본 언어: 한국어
4. 앱 / 게임: **앱**
5. 무료 / 유료: **무료**

## 4. 스토어 등록정보 (내부 테스트 전 최소 입력)

대시보드에서 빨간 항목을 채웁니다.

- **앱 콘텐츠** → 개인정보처리방침 URL: `https://ksajupet.com/ko/privacy`
- **앱 액세스**: 로그인 필요 시 테스트 계정 안내 (이메일 로그인 사용 중이면 테스트용 계정 제공)
- **광고**: 앱에 광고 없으면 "아니요" (슬롯만 있고 미게재면 정책에 맞게 선택)
- **콘텐츠 등급**: 설문 작성
- **대상 고객**: 연령대 선택
- **데이터 보안**: 수집 항목 설문 (Supabase 인증·업로드 등 반영)

## 5. 내부 테스트 트랙에 AAB 업로드

1. **테스트 및 출시** → **내부 테스트**
2. **새 버전 만들기**
3. **App Bundle 업로드** → `app-release.aab`
4. 출시 이름 / 버전: `1.0 (1)` (`versionName` / `versionCode`와 일치)
5. **검토 후 출시** (내부 테스트는 보통 빠르게 반영)

첫 업로드 시 **Play 앱 서명** 사용 권장(기본). Google이 앱 서명 키를 관리하고, 업로드 키는 위 keystore입니다.

## 6. 테스터 추가

1. **내부 테스트** → **테스터** 탭
2. 이메일 목록 만들기 → Google 계정 이메일 추가
3. **테스터에게 표시되는 링크** 복사 → 본인/팀 메일로 초대

테스터는 링크에서 **테스트 참여** 후 Play 스토어에서 설치합니다.

## 7. Supabase (앱 설치 후 로그인)

Play Console과 별도로 Supabase 대시보드에 다음 Redirect URL이 있는지 확인:

- `https://ksajupet.com/auth/callback`
- `https://ksajupet.com/auth/reset-password`

Site URL: `https://ksajupet.com`

## 버전 올릴 때

`android/app/build.gradle`:

```gradle
versionCode 2   // 반드시 이전보다 큰 정수
versionName "1.0.1"
```

다시 `bundleRelease` → 내부 테스트에 새 버전 업로드.

## 문제 해결

| 증상 | 조치 |
|------|------|
| 업로드 서명 오류 | `keystore.properties` 경로·비밀번호 확인 후 `bundleRelease` 재실행 |
| 버전 코드 중복 | `versionCode` 증가 |
| 정책 미완료로 출시 불가 | 대시보드 **정책 상태** 빨간 항목 완료 |
| 앱이 예전 URL 로드 | `capacitor.config.ts`의 `server.url` 확인 후 `cap sync` + 새 AAB |

## iOS

내부 테스트(TestFlight)는 Mac + Xcode 필요. Android 내부 테스트 안정화 후 진행.
