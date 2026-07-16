# 결제 아키텍처 (펫 / 집사)

> **유지보수 필수:** 결제 관련 파일이 이동·추가·삭제되면 이 문서를 함께 갱신한다.  
> 경로·분류는 코드베이스 기준이며, 작업 전 `src/app/api/payment*`, `src/lib/payments/`, `src/components/human-premium/` 를 재확인한다.

이 문서는 펫 프리미엄과 집사(인간) 프리미엄이 PortOne 등 일부 모듈을 공유할 때,  
한쪽 작업으로 다른 쪽이 깨지는 회귀를 막기 위한 **경계 명세**이다.  
AI 어시스턴트와 개발자는 결제 작업 시 이 문서를 먼저 따른다.

---

## 1. 개요 — 결제 플로우 2종

### 1.1 펫 프리미엄

단일 SKU 결제. UI는 `/[locale]/payment?product=…`.

```
[펫 결과/페이월 CTA]
    → /payment?product=<pet_premium_v1|pet_mbti_standalone_v1>&petId=…
    → (로그인 세션 확인)
    → PortOne.requestPayment(totalAmount = 카탈로그 KRW)
    → POST /api/payment/verify  (PortOne 금액·상태 검증 + unlock upsert)
    → returnTo / 성공 화면으로 이동
```

- 금액 소스: `src/lib/payments/pet-product-catalog.ts` (`PET_PRODUCT_AMOUNT_KRW`)
- 클라이언트 검증 래퍼: `src/lib/payments/pet-premium-verify-client.ts`
- 복귀/취소: `src/lib/payments/portone-redirect-return.ts` + sessionStorage checkout 백업

### 1.2 집사(인간) 프리미엄

여러 하위 플로우가 있다. **카트 실결제**가 주력이다.

#### A. 장바구니 (다중 리포트)

```
[HumanPremiumShop 담기]
    → /premium/human/cart
    → CartPayConfirmModal (확인)
    → 결제수단 분기 resolveCartPaymentMethod()
         ├─ KO + PortOne → POST …/cart/checkout
         │                    → PortOne.requestPayment(amount = 서버 resolveCartAmount)
         │                    → POST …/cart/verify  (또는 webhook)
         │                    → fulfillPaidCartOrder → pregenerate
         │                    → markHumanPremiumCartPaid (클라이언트, verify 성공 후만)
         ├─ KO + demo 허용(비프로덕션) → POST …/cart/demo-pay
         └─ EN → unsupported (PayPal 미구현, TODO §4)
```

- 금액: `resolveCartAmount` / `getCartPricingSummary`  
  (`src/lib/reports/human-premium/pricing.ts`)  
  — 전 품목(`REPORT_TYPE_ORDER`)이면 `BUNDLE_PRICING.all`, 아니면 단가 합
- 서버는 클라이언트가 보낸 금액을 쓰지 않고 `cartItems`로 재계산한다

#### B. 데일리 추가결제

```
[DayPillarPreview 일일 쿼터 소진]
    → POST …/daily-extra/checkout
    → KO: PortOne.requestPayment
    → POST …/daily-extra/verify
    → 데일리 리포트 재생성
```

#### C. PortOne 웹훅 (카트·잔여 단건 행)

레거시 `POST …/human-premium/checkout`(단건/번들 draft) **라우트는 삭제됨.**  
실결제·draft는 **카트**(`…/cart/checkout`)와 **데일리 추가**(`…/daily-extra/checkout`)만 사용한다.

```
POST …/human-premium/webhook
    → 카트 행(hp_cart_*) → fulfillPaidCartOrder → pregenerate
    → 그 외 단건 행(있을 경우) → completeHumanPremiumPayment
```

비프로덕션 단건 demo는 `…/demo-complete`가 별도로 draft를 만들 수 있다 (§D).

#### D. Demo (비프로덕션 한정)

```
isHumanPremiumDemoCheckoutAllowed() === true 일 때만
    → …/cart/demo-pay 또는 …/demo-complete
프로덕션(NODE_ENV=production) → 항상 403
```

### 1.3 신원 등급 (결제 게이트)

단일 판정: `src/lib/auth/identity.ts` (`getMembershipGrade`).

| 등급 | 의미 | 집사 카트 `user_id` |
|------|------|---------------------|
| `anonymous` | Supabase anon 세션 | `getUserIdFromRequest` → UUID 기록 |
| `email_linked` | 이메일만 연결, 비밀번호·OAuth 없음 | 동일 → UUID 기록 |
| `full_member` | 비밀번호 또는 Google/Kakao | 동일 → UUID 기록 |

원칙: **주문의 주인은 `user_id`(항상 기록; Bearer 없으면 checkout 400). 이메일은 연락처/배송일 뿐.**  
레거시 `user_id` null 주문은 verify 스킵·purchases `guest`+localStorage·제외 시 email+출생 OR로만 하위호환.  
서버 헬퍼는 `src/lib/auth/identity.ts` 등급에 위임한다.

---

## 2. 파일 경계표

### 2.1 펫 전용 — 집사 결제 작업 시 수정 금지

| 경로 | 역할 |
|------|------|
| `src/app/[locale]/payment/page.tsx` | 펫 PortOne 결제 UI |
| `src/app/api/payment/verify/route.ts` | 펫 결제 검증 + unlock |
| `src/app/api/payment/pet-premium/checkout/route.ts` | 펫 checkout 허용 여부 |
| `src/app/api/payments/pet-premium/unlock/route.ts` | unlock 조회 |
| `src/app/api/payments/pet-premium/history/route.ts` | 펫 결제 이력 |
| `src/lib/payments/pet-product-catalog.ts` | SKU·금액·주문명 |
| `src/lib/payments/pet-premium-*.ts` | checkout/verify/unlock/returnTo/storage/history/shared/llm-gate |
| `src/lib/payments/pet-unlock-dev-bypass.ts` | 펫 unlock 로컬 bypass |
| `src/lib/payments/portone-redirect-return.ts` | 펫 PortOne 리다이렉트 복귀 파싱 |
| `src/lib/payments/portone/entitlement.ts` | 펫 unlock entitlement 조회 |

관련 UI(페이월·허브 등): `src/components/k-saju/PetPremium*.tsx`, `SajuPremiumPackagePanel.tsx`, `MbtiLockTeaserCard.tsx` 등 — 펫 unlock CTA만 다룰 때 수정.

### 2.2 집사 전용 — 펫 결제 작업 시 수정 금지

| 경로 | 역할 |
|------|------|
| `src/app/api/payments/human-premium/cart/checkout/route.ts` | 카트 pending + PortOne draft |
| `src/app/api/payments/human-premium/cart/verify/route.ts` | 카트 PortOne 검증·fulfill |
| `src/app/api/payments/human-premium/cart/demo-pay/route.ts` | 카트 demo (비프로덕션) |
| `src/app/api/payments/human-premium/cart/generate/route.ts` | 카트 항목 리포트 생성 |
| `src/app/api/payments/human-premium/cart/pregenerate/route.ts` | 카트 일괄 생성 |
| `src/app/api/payments/human-premium/webhook/route.ts` | PortOne 웹훅 (카트 + 잔여 단건 행) |
| `src/app/api/premium/human/purchases/route.ts` | 구매 이력 (any `user_id` incl. anon; `guest: true`면 localStorage 병합) |
| `src/app/api/payments/human-premium/config/route.ts` | portone/paypal/demo 플래그 |
| `src/app/api/payments/human-premium/demo-complete/route.ts` | 단건 demo 완료 |
| `src/app/api/payments/human-premium/daily-extra/checkout/route.ts` | 데일리 추가 checkout |
| `src/app/api/payments/human-premium/daily-extra/verify/route.ts` | 데일리 추가 verify |
| `src/app/api/payments/human-premium/vault/route.ts` | 보관함 |
| `src/app/api/payments/human-premium/status/route.ts` | 단건 결제 상태 폴링 |
| `src/app/api/payments/human-premium/history/route.ts` | 집사 결제 이력 |
| `src/components/human-premium/HumanPremiumCartClient.tsx` | 카트 UI·PortOne·결제수단 분기 |
| `src/components/human-premium/CartPayConfirmModal.tsx` | 결제 확인 모달 |
| `src/components/human-premium/HumanPremiumShop.tsx` | 담기·번들 CTA |
| `src/components/human-premium/DayPillarPreview.tsx` | 데일리 + 추가결제 |
| `src/lib/reports/human-premium/cart.ts` | pending/fulfill/pregenerate |
| `src/lib/reports/human-premium/cart-session.ts` | 브라우저 카트 상태 |
| `src/lib/reports/human-premium/pricing.ts` | `resolveCartAmount` 등 |
| `src/lib/payments/human-premium-demo.ts` | demo 허용 게이트 |
| `src/lib/payments/paypal-links.ts` | 집사 PayPal 링크 (EN 예정) |
| `src/lib/reports/human-premium/daily-extra-payment.ts` | 데일리 추가 주문 |

### 2.3 공유 — 수정 시 양쪽 회귀 필수

| 경로 | 역할 |
|------|------|
| **`src/lib/payments/portone/config.ts`** | shop ID / API secret / `isPortOneConfigured` |
| **`src/lib/payments/portone/server.ts`** | `fetchPortOnePayment` / paid·amount 검증 |
| **`src/lib/auth/identity.ts`** | 3등급 신원 (`anonymous` / `email_linked` / `full_member`) — 결제 게이트 공통 |

**경고: 위 두 파일을 수정하면 펫·집사 양쪽 결제 회귀 테스트를 반드시 수행한다.**  
가능하면 공유 파일을 바꾸지 말고, 제품별 래퍼·라우트에서 분기한다.

---

## 3. 작업 규칙 (AI 어시스턴트용)

1. **펫 결제 작업 시**  
   - §2.2 집사 전용 구역을 수정하지 않는다.  
   - 공유 파일(§2.3)이 필요하면 수정 전에 사용자에게 보고하고 승인을 받는다.

2. **집사 결제 작업 시**  
   - §2.1 펫 전용 구역을 수정하지 않는다.  
   - `/payment?product=` 및 `api/payment/verify` 를 카트/집사 플로우에 재사용하지 않는다.

3. **공유 구역(`portone/config.ts`, `portone/server.ts`) 수정 시**  
   - 사전 보고: 변경 이유, 영향 범위, 대안(제품별 래퍼)  
   - 승인 후 구현  
   - §5 체크리스트로 **펫 + 집사** 회귀를 모두 통과시킨다.

4. **금액 계산**  
   - 서버에서 재계산한다. 클라이언트가 보낸 `amount`/`totalAmount`를 청구·검증 기준으로 쓰지 않는다.  
   - 집사 카트: `resolveCartAmount(cartItems, locale)`  
   - 펫: 카탈로그 `PET_PRODUCT_AMOUNT_KRW[productCode]`

5. **잠금 해제 / 카트 paid**  
   - PortOne 창만 닫힌 것으로 해제하지 않는다.  
   - `verify` 또는 `webhook` 의 fulfill 성공 후에만 unlock / `markHumanPremiumCartPaid` / vault 반영.

6. **Demo 결제**  
   - 반드시 `isHumanPremiumDemoCheckoutAllowed()` 를 경유한다.  
   - `NODE_ENV === "production"` 이면 403.  
   - 프로덕션에서 demo-pay·demo-complete 가 호출 가능한 상태로 두지 않는다.

7. **결제수단 분기**  
   - 집사 카트: `resolveCartPaymentMethod` (`HumanPremiumCartClient.tsx`) 와  
     `cart/checkout` 의 locale/`paymentMethod` 분기를 유지한다.  
   - EN PayPal은 §4 TODO 위치에서만 추가한다.

---

## 4. 예정 작업 (TODO)

### EN 진출 — 카트 PayPal 연동

- **상태:** 미구현. EN은 `unsupported` + 안내 문구.
- **이식 위치 (분기점만 확장, KO PortOne 재작성 금지):**
  1. `src/components/human-premium/HumanPremiumCartClient.tsx`  
     — `resolveCartPaymentMethod()` / `handleConfirmPay` switch
  2. `src/app/api/payments/human-premium/cart/checkout/route.ts`  
     — `locale === "en"` / `paymentMethod === "paypal_link"` 분기 (현재 501)
  3. `src/app/api/payments/human-premium/cart/verify/route.ts`  
     — PayPal 확인 분기 (현재 EN 501)
- **원본 패턴:** 커밋 **`d350855^`** (카트 도입 직전)의  
  `HumanPremiumShop.tsx` — `prepareCheckout("paypal_link")`, PayPal 링크 오픈, success 폴링.  
  카트 도입 커밋: **`d350855`** (`Add human premium cart/vault flow…`).
- **링크 env:** `src/lib/payments/paypal-links.ts` (`PAYPAL_LINK_*`).

---

## 5. 회귀 테스트 체크리스트

### 5.1 집사 카트

- [ ] 전 품목 담기 → 모달·합계 = `BUNDLE_PRICING.all` (KO ₩30,000)
- [ ] 개별로 전 품목 담기 → 동일 번들가 적용
- [ ] 전 품목 후 1개 제거 → 단가 합산으로 전환
- [ ] 일부만 담기 → 단가 합산, 번들가 미적용
- [ ] 결제 버튼 → 확인 모달 → 취소 시 결제·paid 미실행
- [ ] 모달 결제하기 → PortOne 창 금액 = 서버 checkout `amount` = UI 합계
- [ ] PortOne 창 취소 → 카트 유지, vault/paid 미반영
- [ ] 결제 완료 → `cart/verify`(또는 webhook) 성공 후에만 paid·리포트 생성
- [ ] `POST …/cart/demo-pay` 프로덕션(또는 `NODE_ENV=production`) → 403
- [ ] EN 카트 → 결제 미지원 안내 (PayPal 미호출)

### 5.2 펫 프리미엄

- [ ] `/payment?product=pet_premium_v1` (또는 MBTI SKU) 진입
- [ ] 표시 금액 = 카탈로그 금액
- [ ] PortOne 창 금액 일치
- [ ] 결제 완료 → `POST /api/payment/verify` 성공 → unlock
- [ ] verify 실패 시 성공 화면으로 보내지 않고 재확인 UI
- [ ] 결제 취소/실패 → unlock 없음, 카트/집사 상태 무관

### 5.3 공유 모듈을 건드린 경우

- [ ] §5.1 전부
- [ ] §5.2 전부
- [ ] 데일리 추가결제(KO PortOne) 1회 스모크

---

## 6. 관련 문서

- `docs/ARCHITECTURE.md` — 라우트 맵
- `docs/DEPLOY_DOMAIN.md` — 배포·도메인
- 프로덕션: https://ksajupet.com
