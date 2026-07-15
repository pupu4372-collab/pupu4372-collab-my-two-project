"use client";

import { PayPalSpbButton } from "@/components/human-premium/PayPalSpbButton";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { getSafeInternalReturnPath } from "@/lib/auth/safe-internal-return-path";
import { buildPetPremiumSuccessHref, buildPetPremiumCancelHref } from "@/lib/payments/pet-premium-unlock-client";
import { assertPetPremiumCheckoutAllowed } from "@/lib/payments/pet-premium-checkout-client";
import {
  clearPendingPetPremiumPaymentId,
  readPetPremiumCheckout,
  savePetPremiumCheckout,
  savePendingPetPremiumPaymentId,
} from "@/lib/payments/pet-premium-checkout-storage";
import {
  buildCleanPaymentSearch,
  parsePortOneRedirectReturn,
  portOneReturnNotice,
  stripPortOneRedirectParams,
} from "@/lib/payments/portone-redirect-return";
import { normalizePetPremiumReturnTo } from "@/lib/payments/pet-premium-return-to";
import {
  formatPetProductPrice,
  getPetChargeAmount,
  getPetCheckoutCurrency,
  PET_MBTI_STANDALONE_CODE,
  PET_PREMIUM_PACKAGE_CODE,
  PET_PRODUCT_ORDER_NAME,
  PET_PRODUCT_PAYMENT_ID_PREFIX,
  toPetPortOneTotalAmount,
  type PetProductCode,
} from "@/lib/payments/pet-product-catalog";
import { resolveProductFromQuery } from "@/lib/payments/pet-premium-unlock-client";
import { verifyPetPremiumPayment } from "@/lib/payments/pet-premium-verify-client";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";

function isEnCheckoutEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_EN_CHECKOUT === "true";
}

const SHARED_UI = {
  ko: {
    processing: "결제 처리 중...",
    successMsg: "결제 완료! 이동 중...",
    errorMsg: "결제에 실패했어요. 다시 시도해 주세요.",
    sdkError: "결제 모듈을 불러오지 못했어요. 새로고침 후 다시 시도해 주세요.",
    verifyFailedMsg: "결제 확인 중 문제가 발생했어요.",
    verifyRetryCta: "다시 확인하기",
    verifyRetryNote: "결제가 이미 완료된 경우 요금이 중복 청구되지 않습니다.",
    cancel: "취소",
    priceNote: "1회 결제 · 해당 펫 영구 잠금 해제",
  },
  en: {
    processing: "Processing...",
    successMsg: "Payment complete! Redirecting...",
    errorMsg: "Payment failed. Please try again.",
    sdkError: "Failed to load payment module. Please refresh and try again.",
    verifyFailedMsg: "We could not confirm your payment.",
    verifyRetryCta: "Check again",
    verifyRetryNote: "If payment already went through, you will not be charged again.",
    cancel: "Cancel",
    priceNote: "One-time payment · Permanent unlock for this pet",
    unavailable: "Payment is not available yet",
  },
} as const;

const PRODUCT_UI: Record<
  PetProductCode,
  Record<"ko" | "en", { title: string; subtitle: string; product: string; includes: string[] }>
> = {
  [PET_PREMIUM_PACKAGE_CODE]: {
    ko: {
      title: "프리미엄 잠금 해제",
      subtitle: "집사 궁합 · 별자리 케어 — 우리 아이 맞춤 케어 가이드를 한 번에 받아보세요.",
      product: "펫 프리미엄 패키지",
      includes: ["💞 집사 궁합 케어", "🔭 별자리 케어 가이드"],
    },
    en: {
      title: "Unlock Premium",
      subtitle: "Pet–butler bond and zodiac care—personalized guides for your pet in one unlock.",
      product: "Pet Premium Package",
      includes: ["💞 Pet & butler bond care", "🔭 Zodiac care guide"],
    },
  },
  [PET_MBTI_STANDALONE_CODE]: {
    ko: {
      title: "MBTI 상세 진단",
      subtitle: "행동 진단으로 우리 아이 성향 유형과 사주×MBTI 맞춤 케어 팁을 확인해 보세요.",
      product: "펫 MBTI 상세 진단",
      includes: ["🧠 행동 진단", "📊 4축 성향 분석", "💡 사주×MBTI 맞춤 케어"],
    },
    en: {
      title: "Detailed MBTI",
      subtitle: "A behavior check with saju×MBTI personalized care tips.",
      product: "Pet MBTI Detailed Report",
      includes: ["🧠 Behavior check", "📊 Four-axis analysis", "💡 Saju×MBTI care tips"],
    },
  },
};

/** Display amounts only — actual charge verification uses server PRODUCT_AMOUNT (see verify route). */
function productDisplayPrice(code: PetProductCode, locale: "ko" | "en"): string {
  return formatPetProductPrice(code, locale);
}

type PaymentUiStatus =
  | "idle"
  | "processing"
  | "success"
  | "error"
  | "sdk_error"
  | "verify_failed";

function buildContinuationQuery(params: URLSearchParams, locale: string): string {
  const petIdParam = params.get("petId") ?? "";
  const mbtiTypeParam = params.get("mbtiType") ?? "";
  const sajuResultIdParam = params.get("sajuResultId") ?? "";

  return new URLSearchParams({
    petName: params.get("petName") ?? "",
    species: params.get("species") ?? "",
    petGender: params.get("petGender") ?? "",
    birthDate: params.get("birthDate") ?? "",
    birthTime: params.get("birthTime") ?? "",
    timezone: params.get("timezone") ?? "",
    locale,
    ...(petIdParam ? { petId: petIdParam } : {}),
    ...(mbtiTypeParam ? { mbtiType: mbtiTypeParam } : {}),
    ...(sajuResultIdParam ? { sajuResultId: sajuResultIdParam } : {}),
  }).toString();
}

function buildPortOneRedirectUrl(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const url = new URL(window.location.href);
  for (const key of ["paymentId", "code", "message", "pgCode", "pgMessage"] as const) {
    url.searchParams.delete(key);
  }
  return url.toString();
}

function PaymentContent() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const routeLocale = useLocale();
  const { accessToken, ready, configured, isAnonymous } = useSupabaseSession();
  const redirectHandled = useRef(false);
  const loginRedirected = useRef(false);

  const locale = (routeLocale === "en" ? "en" : "ko") as "ko" | "en";
  const currency = getPetCheckoutCurrency(locale);
  const enCheckoutOn = isEnCheckoutEnabled();
  const usePaypalSpb = currency === "USD" && enCheckoutOn;
  const usdUnavailable = currency === "USD" && !enCheckoutOn;

  const productCode = useMemo(
    () => resolveProductFromQuery(params.get("product")),
    [params]
  );
  const productCopy = PRODUCT_UI[productCode][locale];
  const shared = SHARED_UI[locale];
  const displayPrice = productDisplayPrice(productCode, locale);
  const payCta =
    locale === "ko" ? `${displayPrice} 결제하기` : `Pay ${displayPrice}`;
  const chargeAmount = getPetChargeAmount(productCode, currency);
  const spbTotalAmount = toPetPortOneTotalAmount(chargeAmount, "USD");
  const petPaymentCustomData = useMemo(() => {
    const data: Record<string, unknown> = { productCode };
    const petId = params.get("petId");
    if (petId) data.petId = petId;
    return data;
  }, [params, productCode]);

  const normalizedReturnTo = useMemo(
    () => normalizePetPremiumReturnTo(params.get("returnTo")),
    [params]
  );

  const continuationQuery = useMemo(
    () => buildContinuationQuery(params, locale),
    [params, locale]
  );

  const successHref = useMemo(
    () => buildPetPremiumSuccessHref(continuationQuery, normalizedReturnTo),
    [continuationQuery, normalizedReturnTo]
  );

  const cancelHref = useMemo(() => {
    const stored = readPetPremiumCheckout();
    const returnTo = normalizedReturnTo ?? stored?.returnTo ?? null;
    const continuation = stored?.continuationQuery ?? continuationQuery;
    return buildPetPremiumCancelHref(continuation, returnTo);
  }, [continuationQuery, normalizedReturnTo]);

  function handleCancel() {
    router.push(cancelHref);
  }

  const sessionAllowed = configured && ready && !isAnonymous && Boolean(accessToken);

  useEffect(() => {
    if (!configured || !ready || loginRedirected.current) return;
    if (!isAnonymous && accessToken) return;

    loginRedirected.current = true;
    const qs = params.toString();
    const returnPath = getSafeInternalReturnPath(qs ? `/payment?${qs}` : "/payment");
    router.replace(`/login?next=${encodeURIComponent(returnPath)}`);
  }, [accessToken, configured, isAnonymous, params, ready, router]);

  const [status, setStatus] = useState<PaymentUiStatus>("idle");
  const [sdkReady, setSdkReady] = useState(false);
  const [returnNotice, setReturnNotice] = useState<string | null>(null);
  const [verifyFailedPaymentId, setVerifyFailedPaymentId] = useState<string | null>(null);
  const [spbPaymentId, setSpbPaymentId] = useState<string | null>(null);

  useEffect(() => {
    savePetPremiumCheckout({
      continuationQuery,
      returnTo: normalizedReturnTo,
      productCode,
    });
  }, [continuationQuery, normalizedReturnTo, productCode]);

  useEffect(() => {
    if (document.querySelector('script[src*="cdn.portone.io"]')) {
      setSdkReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.portone.io/v2/browser-sdk.js";
    script.async = true;
    script.onload = () => setSdkReady(true);
    script.onerror = () => setStatus("sdk_error");
    document.head.appendChild(script);
  }, []);

  // EN SPB: mint paymentId when PayPal path is ready (refresh on product change).
  useEffect(() => {
    if (!usePaypalSpb || !sessionAllowed || !sdkReady) {
      setSpbPaymentId(null);
      return;
    }
    const paymentId = `${PET_PRODUCT_PAYMENT_ID_PREFIX[productCode]}_${Date.now()}`;
    savePendingPetPremiumPaymentId(paymentId);
    savePetPremiumCheckout({
      continuationQuery,
      returnTo: normalizedReturnTo,
      productCode,
    });
    setSpbPaymentId(paymentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- remint only on product/auth/sdk gate
  }, [usePaypalSpb, sessionAllowed, sdkReady, productCode]);

  const replaceWithCleanCheckoutUrl = useCallback(() => {
    const cleanQs = buildCleanPaymentSearch(stripPortOneRedirectParams(params));
    const href = cleanQs ? `${pathname}?${cleanQs}` : pathname;
    router.replace(href);
  }, [params, pathname, router]);

  const completeVerifiedPayment = useCallback(
    (paymentId: string) => {
      const stored = readPetPremiumCheckout();
      const returnTo =
        normalizePetPremiumReturnTo(params.get("returnTo")) ?? stored?.returnTo ?? null;
      const continuation =
        stored?.continuationQuery ?? buildContinuationQuery(params, locale);
      const nextHref = buildPetPremiumSuccessHref(continuation, returnTo);

      clearPendingPetPremiumPaymentId();
      setVerifyFailedPaymentId(null);
      setReturnNotice(null);
      setStatus("success");
      setTimeout(() => router.push(nextHref), 800);
    },
    [locale, params, router]
  );

  const runVerify = useCallback(
    async (paymentId: string, verifyProductCode: PetProductCode = productCode) => {
      setStatus("processing");
      setReturnNotice(null);

      const result = await verifyPetPremiumPayment({
        paymentId,
        productCode: verifyProductCode,
        petId: params.get("petId"),
        accessToken,
      });

      if (result.ok) {
        completeVerifiedPayment(paymentId);
        return;
      }

      setVerifyFailedPaymentId(paymentId);
      setStatus("verify_failed");
      replaceWithCleanCheckoutUrl();
    },
    [accessToken, completeVerifiedPayment, params, productCode, replaceWithCleanCheckoutUrl]
  );

  useEffect(() => {
    if (redirectHandled.current || !accessToken) return;

    const redirect = parsePortOneRedirectReturn(params);

    if (redirect.kind === "cancel_or_fail") {
      redirectHandled.current = true;
      clearPendingPetPremiumPaymentId();
      setVerifyFailedPaymentId(null);
      setReturnNotice(portOneReturnNotice(redirect.code, locale));
      setStatus("idle");
      replaceWithCleanCheckoutUrl();
      return;
    }

    if (redirect.kind === "success_pending_verify") {
      redirectHandled.current = true;
      const stored = readPetPremiumCheckout();
      const verifyProduct = stored?.productCode ?? productCode;
      void runVerify(redirect.paymentId, verifyProduct);
    }
  }, [accessToken, locale, params, productCode, replaceWithCleanCheckoutUrl, runVerify]);

  async function handleRetryVerify() {
    if (!verifyFailedPaymentId) return;
    const stored = readPetPremiumCheckout();
    await runVerify(verifyFailedPaymentId, stored?.productCode ?? productCode);
  }

  async function handleSpbSuccess(paymentId: string) {
    if (!sessionAllowed || !accessToken) return;

    setStatus("processing");
    setReturnNotice(null);
    setVerifyFailedPaymentId(null);

    const checkout = await assertPetPremiumCheckoutAllowed(accessToken, productCode);
    if (!checkout.ok) {
      if (checkout.status === 401) {
        const qs = params.toString();
        const returnPath = getSafeInternalReturnPath(qs ? `/payment?${qs}` : "/payment");
        router.replace(`/login?next=${encodeURIComponent(returnPath)}`);
        return;
      }
      setStatus("error");
      return;
    }

    await runVerify(paymentId, productCode);
  }

  function handleSpbError(message: string) {
    clearPendingPetPremiumPaymentId();
    setReturnNotice(message || SHARED_UI.en.unavailable);
    setStatus("idle");
  }

  async function handlePay() {
    if (!sessionAllowed || !accessToken) return;
    if (currency !== "KRW") return;

    setStatus("processing");
    setReturnNotice(null);
    setVerifyFailedPaymentId(null);

    const checkout = await assertPetPremiumCheckoutAllowed(accessToken, productCode);
    if (!checkout.ok) {
      if (checkout.status === 401) {
        const qs = params.toString();
        const returnPath = getSafeInternalReturnPath(qs ? `/payment?${qs}` : "/payment");
        router.replace(`/login?next=${encodeURIComponent(returnPath)}`);
        return;
      }
      setStatus("error");
      return;
    }

    const PortOne = (window as unknown as {
      PortOne: { requestPayment: (args: unknown) => Promise<{ code?: string }> };
    }).PortOne;
    if (!PortOne || !sdkReady) {
      setStatus("sdk_error");
      return;
    }

    if (!process.env.NEXT_PUBLIC_PORTONE_SHOP_ID) {
      setStatus("error");
      return;
    }

    const paymentId = `${PET_PRODUCT_PAYMENT_ID_PREFIX[productCode]}_${Date.now()}`;
    savePendingPetPremiumPaymentId(paymentId);
    savePetPremiumCheckout({
      continuationQuery,
      returnTo: normalizedReturnTo,
      productCode,
    });

    const redirectUrl = buildPortOneRedirectUrl();

    try {
      const response = await PortOne.requestPayment({
        storeId: process.env.NEXT_PUBLIC_PORTONE_SHOP_ID ?? "",
        paymentId,
        orderName: PET_PRODUCT_ORDER_NAME[productCode],
        totalAmount: chargeAmount,
        currency: "KRW",
        channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY ?? "",
        payMethod: "CARD",
        customData: petPaymentCustomData,
        customer: {
          fullName: params.get("petName") ?? "펫",
        },
        ...(redirectUrl
          ? {
              redirectUrl,
              forceRedirect: true,
            }
          : {}),
      });

      if (response?.code !== undefined) {
        clearPendingPetPremiumPaymentId();
        setReturnNotice(portOneReturnNotice(response.code, locale));
        setStatus("idle");
        return;
      }

      const result = await verifyPetPremiumPayment({
        paymentId,
        productCode,
        petId: params.get("petId"),
        accessToken,
      });

      if (!result.ok) {
        setVerifyFailedPaymentId(paymentId);
        setStatus("verify_failed");
        return;
      }

      completeVerifiedPayment(paymentId);
    } catch {
      clearPendingPetPremiumPaymentId();
      setStatus("error");
    }
  }

  const payDisabled =
    status === "processing" || status === "success" || !sdkReady || !sessionAllowed;

  if (!configured || !ready || !sessionAllowed) {
    return null;
  }

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-12">
      <div className="rounded-[2rem] bg-white p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-primary/60">
          {productCopy.title}
        </p>
        <h1 className="mt-2 text-2xl font-extrabold text-primary">{productCopy.product}</h1>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{productCopy.subtitle}</p>

        <ul className="mt-6 space-y-2">
          {productCopy.includes.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm font-semibold text-primary">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs">✓</span>
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-8 rounded-2xl bg-surface-container-low px-6 py-4 text-center">
          <p className="text-3xl font-extrabold text-primary">{displayPrice}</p>
          <p className="mt-1 text-xs text-on-surface-variant">{shared.priceNote}</p>
        </div>

        {returnNotice && status === "idle" && (
          <p className="mt-4 rounded-2xl bg-sand/60 px-4 py-2.5 text-sm text-plum" role="status">
            {returnNotice}
          </p>
        )}

        {(status === "error" || status === "sdk_error") && (
          <p className="mt-4 rounded-2xl bg-petal/40 px-4 py-2.5 text-sm text-plum" role="alert">
            {status === "sdk_error" ? shared.sdkError : shared.errorMsg}
          </p>
        )}

        {status === "verify_failed" && (
          <div className="mt-4 space-y-3 rounded-2xl bg-petal/40 px-4 py-3 text-sm text-plum" role="alert">
            <p>{shared.verifyFailedMsg}</p>
            <p className="text-xs text-plum/80">{shared.verifyRetryNote}</p>
            <button
              type="button"
              onClick={() => void handleRetryVerify()}
              className="w-full rounded-full bg-[#6f4b8b] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#5f3f78]"
            >
              {shared.verifyRetryCta}
            </button>
          </div>
        )}

        {status === "success" && (
          <p className="mt-4 rounded-2xl bg-mint/40 px-4 py-2.5 text-sm text-primary" role="status">
            {shared.successMsg}
          </p>
        )}

        {usdUnavailable ? (
          <p
            className="mt-6 rounded-2xl bg-sand/60 px-4 py-3 text-center text-sm text-plum"
            role="status"
          >
            {SHARED_UI.en.unavailable}
          </p>
        ) : usePaypalSpb ? (
          <div className="mt-6 w-full space-y-2">
            {status === "processing" || status === "success" ? (
              <p className="text-center text-sm text-on-surface-variant">
                {status === "success" ? shared.successMsg : shared.processing}
              </p>
            ) : !sdkReady || !spbPaymentId ? (
              <p className="text-center text-sm text-on-surface-variant">
                Preparing PayPal…
              </p>
            ) : (
              <PayPalSpbButton
                paymentId={spbPaymentId}
                orderName={PET_PRODUCT_ORDER_NAME[productCode]}
                totalAmount={spbTotalAmount}
                currency="USD"
                customData={petPaymentCustomData}
                onSuccess={(paymentId) => void handleSpbSuccess(paymentId)}
                onError={handleSpbError}
              />
            )}
          </div>
        ) : (
          <button
            onClick={() => void handlePay()}
            disabled={payDisabled}
            className="mt-6 w-full rounded-full bg-[#6f4b8b] px-8 py-4 text-base font-extrabold text-white shadow-xl shadow-[#6f4b8b]/25 transition hover:bg-[#5f3f78] active:scale-[0.98] disabled:opacity-60"
          >
            {status === "processing" ? shared.processing : payCta}
          </button>
        )}

        <button
          type="button"
          onClick={handleCancel}
          className="mt-3 w-full rounded-full py-3 text-sm text-on-surface-variant transition hover:text-primary"
        >
          {shared.cancel}
        </button>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense>
      <PaymentContent />
    </Suspense>
  );
}
