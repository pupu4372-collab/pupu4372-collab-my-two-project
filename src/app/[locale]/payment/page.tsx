"use client";

import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const UI = {
  ko: {
    title: "프리미엄 잠금 해제",
    subtitle: "별자리 운세 + 펫·집사 궁합을 한 번에 열어보세요.",
    product: "펫 프리미엄 패키지",
    includes: ["🔭 별자리 운세", "💞 펫·집사 궁합"],
    price: "₩4,500",
    priceNote: "1회 결제 · 해당 펫 영구 잠금 해제",
    cta: "₩4,500 결제하기",
    processing: "결제 처리 중...",
    successMsg: "결제 완료! 이동 중...",
    errorMsg: "결제에 실패했어요. 다시 시도해 주세요.",
    sdkError: "결제 모듈을 불러오지 못했어요. 새로고침 후 다시 시도해 주세요.",
    cancel: "취소",
  },
  en: {
    title: "Unlock Premium",
    subtitle: "Get zodiac fortune + pet-parent bond reading in one go.",
    product: "Pet Premium Package",
    includes: ["🔭 Zodiac fortune", "💞 Pet & butler bond"],
    price: "₩4,500",
    priceNote: "One-time payment · Permanent unlock for this pet",
    cta: "Pay ₩4,500",
    processing: "Processing...",
    successMsg: "Payment complete! Redirecting...",
    errorMsg: "Payment failed. Please try again.",
    sdkError: "Failed to load payment module. Please refresh and try again.",
    cancel: "Cancel",
  },
} as const;

function PaymentContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { accessToken } = useSupabaseSession();

  const type = params.get("type") ?? "zodiac";
  const locale = (params.get("locale") ?? "ko") as "ko" | "en";
  const t = UI[locale];

  const petIdParam = params.get("petId") ?? "";

  const continuationQuery = new URLSearchParams({
    petName: params.get("petName") ?? "",
    species: params.get("species") ?? "",
    petGender: params.get("petGender") ?? "",
    birthDate: params.get("birthDate") ?? "",
    birthTime: params.get("birthTime") ?? "",
    timezone: params.get("timezone") ?? "",
    locale,
    ...(petIdParam ? { petId: petIdParam } : {}),
  }).toString();

  const successHref =
    type === "compatibility"
      ? `/saju/compatibility?${continuationQuery}`
      : `/saju/zodiac?${continuationQuery}`;

  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error" | "sdk_error">("idle");
  const [sdkReady, setSdkReady] = useState(false);

  // PortOne V2 브라우저 SDK 로드
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

  async function handlePay() {
    setStatus("processing");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const PortOne = (window as any).PortOne;
    if (!PortOne || !sdkReady) {
      setStatus("sdk_error");
      return;
    }

    if (!process.env.NEXT_PUBLIC_PORTONE_SHOP_ID) {
      setStatus("error");
      return;
    }

    // V2 방식: paymentId는 우리가 직접 생성
    const paymentId = `pet_premium_v1_${Date.now()}`;

    try {
      const response = await PortOne.requestPayment({
        storeId: process.env.NEXT_PUBLIC_PORTONE_SHOP_ID ?? "",
        paymentId,
        orderName: "펫 프리미엄 패키지 (별자리 + 궁합)",
        totalAmount: 4500,
        currency: "KRW",
        channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY ?? "",
        payMethod: "CARD",
        customer: {
          fullName: params.get("petName") ?? "펫",
        },
      });

      if (response.code !== undefined) {
        // 결제 실패 or 사용자 취소
        setStatus("error");
        return;
      }

      // 서버 검증
      const res = await fetch("/api/payment/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          payment_id: paymentId,
          product_code: "pet_premium_v1",
          pet_id: params.get("petId") ?? null,
        }),
      });

      if (!res.ok) {
        console.error("verify failed");
        // 검증 실패해도 UX는 성공 처리 (webhook으로 보완)
      }

      setStatus("success");
      setTimeout(() => router.push(successHref), 1200);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-12">
      <div className="rounded-[2rem] bg-white p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-primary/60">
          {t.title}
        </p>
        <h1 className="mt-2 text-2xl font-extrabold text-primary">{t.product}</h1>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{t.subtitle}</p>

        <ul className="mt-6 space-y-2">
          {t.includes.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm font-semibold text-primary">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs">✓</span>
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-8 rounded-2xl bg-surface-container-low px-6 py-4 text-center">
          <p className="text-3xl font-extrabold text-primary">{t.price}</p>
          <p className="mt-1 text-xs text-on-surface-variant">{t.priceNote}</p>
        </div>

        {(status === "error" || status === "sdk_error") && (
          <p className="mt-4 rounded-2xl bg-petal/40 px-4 py-2.5 text-sm text-plum" role="alert">
            {status === "sdk_error" ? t.sdkError : t.errorMsg}
          </p>
        )}
        {status === "success" && (
          <p className="mt-4 rounded-2xl bg-mint/40 px-4 py-2.5 text-sm text-primary" role="status">
            {t.successMsg}
          </p>
        )}

        <button
          onClick={handlePay}
          disabled={status === "processing" || status === "success" || !sdkReady}
          className="mt-6 w-full rounded-full bg-[#6f4b8b] px-8 py-4 text-base font-extrabold text-white shadow-xl shadow-[#6f4b8b]/25 transition hover:bg-[#5f3f78] active:scale-[0.98] disabled:opacity-60"
        >
          {status === "processing" ? t.processing : t.cta}
        </button>

        <button
          onClick={() => router.back()}
          className="mt-3 w-full rounded-full py-3 text-sm text-on-surface-variant transition hover:text-primary"
        >
          {t.cancel}
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
