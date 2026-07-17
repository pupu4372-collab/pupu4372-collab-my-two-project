"use client";

import { BirthDateSelect } from "@/components/k-saju/BirthDateSelect";
import { HumanPremiumFreePreviewReport } from "@/components/human-premium/HumanPremiumFreePreviewReport";
import { ReportGenerateLoader } from "@/components/human-premium/ReportGenerateLoader";
import { PrivacyConsent } from "@/components/legal/PrivacyConsent";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { Link } from "@/i18n/navigation";
import { COUPON_TYPE_DAILY_LUCKY_FREE } from "@/lib/coupons/constants";
import { formatHumanPremiumError } from "@/lib/reports/human-premium/client-errors";
import { DAILY_EXTRA_PRODUCT_CODE } from "@/lib/reports/human-premium/daily-extra-constants";
import type { HumanPremiumProfile } from "@/lib/reports/human-premium/cart-session";
import {
  formatPrice,
  getDailyExtraPrice,
  REPORT_TYPE_SUBTITLES_EN,
  REPORT_TYPE_SUBTITLES_KO,
} from "@/lib/reports/human-premium/pricing";
import type { HumanPremiumReportPayload } from "@/lib/reports/human-premium/types";
import {
  BIRTH_TIME_OPTIONS,
  getBirthTimeOptionLabel,
  parseBirthTimeSelect,
} from "@/lib/saju/birth-time-options";
import { COMMON_TIMEZONES } from "@/lib/saju/timezone";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

/** Product header + CTA labels (no duplicate title/sub on the same button). */
const PRODUCT_UI = {
  ko: {
    title: "데일리 럭키 운세",
    description: REPORT_TYPE_SUBTITLES_KO.daily,
    signupAlertTitle: "가입이 필요해요",
    signupAlertBody: "가입하면 오픈기념 럭키운세 쿠폰을 드려요",
    ctaGuest: "가입하고 오픈기념 무료 쿠폰 받기",
    ctaCoupon: "오픈기념 쿠폰으로 무료로 보기",
    ctaPay: (price: string) => `${price} 결제하고 보기`,
  },
  en: {
    title: "Daily Lucky Reading",
    description: REPORT_TYPE_SUBTITLES_EN.daily,
    signupAlertTitle: "Sign up required",
    signupAlertBody: "Sign up to get a free Lucky Reading coupon",
    ctaGuest: "Sign up for a free launch coupon",
    ctaCoupon: "View free with launch coupon",
    ctaPay: (price: string) => `Pay ${price} to view`,
  },
} as const;

function buildRequestBody(
  profile: HumanPremiumProfile,
  routeLocale: string,
  birthTime: string | null,
  birthTimeUnknown: boolean,
  calendarType: "solar" | "lunar",
  isKo: boolean,
  dailyExtraPaymentId?: string
) {
  return {
    personName: profile.personName.trim() || (isKo ? "게스트" : "Guest"),
    email: profile.email.trim(),
    birthDate: profile.birthDate,
    birthTime,
    birthTimeUnknown,
    timezone: profile.timezone,
    calendarType,
    locale: routeLocale,
    privacyConsent: profile.privacyConsent,
    gender: profile.gender || null,
    ...(dailyExtraPaymentId ? { dailyExtraPaymentId } : {}),
  };
}

export function DayPillarPreview({
  profile,
  onPatchProfile,
}: {
  profile: HumanPremiumProfile;
  onPatchProfile: (partial: Partial<HumanPremiumProfile>) => void;
}) {
  const routeLocale = useLocale();
  const tNav = useTranslations("nav");
  const isKo = routeLocale === "ko";
  const ui = PRODUCT_UI[isKo ? "ko" : "en"];
  const { accessToken, isFullMember, ready: sessionReady } = useSupabaseSession();
  const paidPriceLabel = formatPrice(getDailyExtraPrice(isKo ? "ko" : "en"), isKo ? "ko" : "en");

  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupPrompt, setSignupPrompt] = useState(false);
  const [portoneReady, setPortoneReady] = useState(false);
  const [report, setReport] = useState<HumanPremiumReportPayload | null>(null);
  const [webToken, setWebToken] = useState<string | null>(null);
  const [hasCoupon, setHasCoupon] = useState<boolean | null>(null);

  useEffect(() => {
    if (document.querySelector('script[src*="cdn.portone.io"]')) {
      setPortoneReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.portone.io/v2/browser-sdk.js";
    script.async = true;
    script.onload = () => setPortoneReady(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!sessionReady) return;
    if (!isFullMember || !accessToken) {
      setHasCoupon(null);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(
          `/api/coupons/usable?type=${encodeURIComponent(COUPON_TYPE_DAILY_LUCKY_FREE)}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!res.ok) {
          if (!cancelled) setHasCoupon(false);
          return;
        }
        const data = (await res.json()) as { usable?: boolean };
        if (!cancelled) setHasCoupon(Boolean(data.usable));
      } catch {
        if (!cancelled) setHasCoupon(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionReady, isFullMember, accessToken]);

  function patchProfile(partial: Partial<HumanPremiumProfile>) {
    onPatchProfile(partial);
  }

  const calendarType = profile.calendarType === "lunar" ? "lunar" : "solar";

  const birthTimeUnknown = profile.birthTimeSelect === "unknown";
  const birthTime = useMemo(() => {
    if (birthTimeUnknown) return null;
    return parseBirthTimeSelect(profile.birthTimeSelect).birthTime;
  }, [profile.birthTimeSelect, birthTimeUnknown]);

  const ctaLabel = !isFullMember
    ? ui.ctaGuest
    : hasCoupon
      ? ui.ctaCoupon
      : ui.ctaPay(paidPriceLabel);

  async function requestDailyReport(dailyExtraPaymentId?: string) {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const res = await fetch("/api/human-premium/daily-routine", {
      method: "POST",
      headers,
      body: JSON.stringify(
        buildRequestBody(
          profile,
          routeLocale,
          birthTime,
          birthTimeUnknown,
          calendarType,
          isKo,
          dailyExtraPaymentId
        )
      ),
    });
    const data = (await res.json()) as Record<string, unknown>;
    const errCode = String(data.code ?? data.error ?? "");

    if (res.status === 402 && errCode === "signup_required") {
      setSignupPrompt(true);
      return null;
    }
    if (res.status === 402 && errCode === "payment_required") {
      return { paymentRequired: true as const };
    }
    if (res.status === 401 && data.error === "login_required") {
      setSignupPrompt(true);
      return null;
    }
    if (res.status === 409 && data.error === "daily_generating_in_progress") {
      throw new Error("daily_generating_in_progress");
    }
    if (!res.ok) {
      if (data.webUrl && (data.reused || data.duplicate)) {
        window.location.assign(String(data.webUrl));
        return data;
      }
      throw new Error(String(data.error ?? "Report failed"));
    }

    const webUrl = String(data.webUrl ?? "");
    if (webUrl && (data.reused || data.duplicate)) {
      window.location.assign(webUrl);
      return data;
    }

    setReport(data.report as HumanPremiumReportPayload);
    setWebToken(String(data.webToken ?? ""));
    setSignupPrompt(false);
    if (data.couponUsed === true) {
      setHasCoupon(false);
    }
    return data;
  }

  async function handleGenerate() {
    if (!isFullMember) {
      setSignupPrompt(true);
      return;
    }

    // Paid path: skip daily-routine free gate — go straight to daily_extra checkout.
    if (hasCoupon === false) {
      await handleDailyExtraPay();
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const result = await requestDailyReport();
      if (result && "paymentRequired" in result && result.paymentRequired) {
        // Coupon race / stale UI — clear generate overlay before PortOne opens.
        setHasCoupon(false);
        setLoading(false);
        await handleDailyExtraPay();
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Report failed";
      setError(formatHumanPremiumError(raw, routeLocale as "ko" | "en"));
    } finally {
      setLoading(false);
    }
  }

  async function handleDailyExtraPay() {
    if (!accessToken || !isFullMember) {
      setSignupPrompt(true);
      return;
    }

    setPaying(true);
    setError(null);
    try {
      const checkoutRes = await fetch("/api/payments/human-premium/daily-extra/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ locale: routeLocale }),
      });
      const checkout = (await checkoutRes.json()) as Record<string, unknown>;
      if (!checkoutRes.ok) {
        throw new Error(String(checkout.error ?? "Checkout failed"));
      }

      const paymentId = String(checkout.paymentId ?? "");
      if (!paymentId) throw new Error("Checkout failed");

      if (isKo) {
        const PortOne = (
          window as unknown as {
            PortOne?: { requestPayment: (args: unknown) => Promise<{ code?: string }> };
          }
        ).PortOne;
        if (!PortOne || !portoneReady || !process.env.NEXT_PUBLIC_PORTONE_SHOP_ID) {
          throw new Error(isKo ? "결제 모듈을 불러오지 못했어요." : "Payment module unavailable.");
        }

        // Keep full-screen generate loader OFF while PortOne modal is open (z-[80] would cover it).
        const payResult = await PortOne.requestPayment({
          storeId: process.env.NEXT_PUBLIC_PORTONE_SHOP_ID,
          paymentId,
          orderName: String(checkout.orderName ?? ui.title),
          totalAmount: Number(checkout.totalAmount ?? checkout.amount ?? 1900),
          currency: String(checkout.currency ?? "KRW"),
          channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY ?? "",
          payMethod: "CARD",
          customData: { productCode: DAILY_EXTRA_PRODUCT_CODE },
        });

        if (payResult.code !== undefined) {
          throw new Error(isKo ? "결제가 취소되었어요." : "Payment cancelled.");
        }

        const verifyRes = await fetch("/api/payments/human-premium/daily-extra/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ paymentId, locale: routeLocale, paymentMethod: "portone" }),
        });
        if (!verifyRes.ok) {
          const verifyData = (await verifyRes.json()) as { error?: string };
          throw new Error(verifyData.error ?? "Payment verify failed");
        }
      } else {
        const paypalLink = String((checkout.paypal as { link?: string } | undefined)?.link ?? "");
        if (paypalLink) {
          window.open(paypalLink, "_blank", "noopener,noreferrer");
        }
        const confirmed = window.confirm(
          isKo
            ? "PayPal 결제를 완료하셨나요?"
            : "Have you completed PayPal checkout?"
        );
        if (!confirmed) return;

        const verifyRes = await fetch("/api/payments/human-premium/daily-extra/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            paymentId,
            locale: routeLocale,
            paymentMethod: "paypal_link",
          }),
        });
        if (!verifyRes.ok) {
          const verifyData = (await verifyRes.json()) as { error?: string };
          throw new Error(verifyData.error ?? "Payment verify failed");
        }
      }

      setLoading(true);
      await requestDailyReport(paymentId);
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Payment failed";
      setError(formatHumanPremiumError(raw, routeLocale as "ko" | "en"));
    } finally {
      setPaying(false);
      setLoading(false);
    }
  }

  function resetReport() {
    setReport(null);
    setWebToken(null);
    setError(null);
  }

  if (report && webToken) {
    return (
      <div className="space-y-6">
        <HumanPremiumFreePreviewReport report={report} webToken={webToken} />
        <p className="text-center text-sm">
          <button
            type="button"
            className="font-semibold text-white underline"
            onClick={resetReport}
          >
            {isKo ? "다시 입력" : "Enter again"}
          </button>
        </p>
      </div>
    );
  }

  const submitBusy = loading || paying || !sessionReady || (isFullMember && hasCoupon === null);

  return (
    <>
      {/* Loader only during report generation — never while PortOne/PayPal checkout is open */}
      <ReportGenerateLoader isKo={isKo} active={loading} />
      <section className="human-premium-birth-card mx-auto w-full max-w-sm space-y-6 p-6 sm:max-w-md sm:p-8">
        <div className="text-center">
          <p className="human-premium-birth-eyebrow">
            {isKo ? "집사님의 사주" : "Butler birth chart"}
          </p>
          <h2 className="mt-2 text-2xl font-bold">{ui.title}</h2>
          <p className="mt-2 text-sm text-plum/75">{ui.description}</p>
          <p className="mt-1 text-base font-bold text-ink">{paidPriceLabel}</p>
        </div>

        {signupPrompt ? (
          <div
            role="alert"
            className="rounded-2xl border border-channel-saju/30 bg-white/90 px-4 py-4 text-sm"
          >
            <p className="font-bold text-ink">{ui.signupAlertTitle}</p>
            <p className="mt-2 text-plum/80">{ui.signupAlertBody}</p>
            <Link
              href="/login"
              className="mt-3 inline-block font-semibold text-channel-saju underline"
            >
              {ui.ctaGuest}
            </Link>
          </div>
        ) : null}

        <div className="human-premium-birth-form-inner space-y-4">
          <label className="human-premium-birth-field">
            {isKo ? "닉네임" : "Nickname"}
            <input
              className="human-premium-birth-input"
              value={profile.personName}
              onChange={(e) => patchProfile({ personName: e.target.value })}
              placeholder={isKo ? "닉네임 입력" : "Your nickname"}
            />
            <span className="human-premium-birth-hint">
              {isKo
                ? "보안을 위해 닉네임으로 넣어주세요."
                : "For your privacy, please use a nickname."}
            </span>
          </label>
          <label className="human-premium-birth-field">
            {isKo ? "리포트를 받으실 이메일" : "Email for your report"}
            <input
              type="email"
              className="human-premium-birth-input"
              value={profile.email}
              onChange={(e) => patchProfile({ email: e.target.value })}
              placeholder="you@email.com"
            />
            <span className="human-premium-birth-hint">
              {isKo
                ? "리포트 링크를 받을 이메일을 입력해 주세요."
                : "We'll email your report link to this address."}
            </span>
          </label>
          <BirthDateSelect
            value={profile.birthDate}
            onChange={(birthDate) => patchProfile({ birthDate })}
            label={isKo ? "생년월일" : "Birth date"}
            locale={routeLocale as "ko" | "en"}
            className="human-premium-birth-field"
            selectClassName="human-premium-birth-input"
          />
          <label className="human-premium-birth-field">
            {isKo ? "출생 시간" : "Birth time"}
            <select
              className="human-premium-birth-input"
              value={profile.birthTimeSelect}
              onChange={(e) => patchProfile({ birthTimeSelect: e.target.value })}
            >
              {BIRTH_TIME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {getBirthTimeOptionLabel(opt, routeLocale as "ko" | "en")}
                </option>
              ))}
            </select>
          </label>
          <fieldset className="human-premium-birth-calendar">
            <legend className="human-premium-birth-field">
              {isKo ? "양력 / 음력" : "Solar / Lunar"}
            </legend>
            <div className="mt-1 flex gap-3">
              <button
                type="button"
                onClick={() => patchProfile({ calendarType: "solar" })}
                className={`human-premium-birth-pill flex-1 ${
                  calendarType === "solar"
                    ? "human-premium-birth-pill--active"
                    : "human-premium-birth-pill--idle"
                }`}
                aria-pressed={calendarType === "solar"}
              >
                {isKo ? "양력" : "Solar"}
              </button>
              <button
                type="button"
                onClick={() => patchProfile({ calendarType: "lunar" })}
                className={`human-premium-birth-pill flex-1 ${
                  calendarType === "lunar"
                    ? "human-premium-birth-pill--active"
                    : "human-premium-birth-pill--idle"
                }`}
                aria-pressed={calendarType === "lunar"}
              >
                {isKo ? "음력" : "Lunar"}
              </button>
            </div>
          </fieldset>
          <label className="human-premium-birth-field">
            {isKo ? "타임존" : "Timezone"}
            <select
              className="human-premium-birth-input"
              value={profile.timezone}
              onChange={(e) => patchProfile({ timezone: e.target.value })}
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </label>
          <fieldset className="human-premium-birth-calendar">
            <legend className="human-premium-birth-field">
              {isKo ? "성별" : "Gender"}
            </legend>
            <div className="mt-1 flex gap-3">
              <button
                type="button"
                onClick={() => patchProfile({ gender: "male" })}
                className={`human-premium-birth-pill flex-1 ${
                  profile.gender === "male"
                    ? "human-premium-birth-pill--active"
                    : "human-premium-birth-pill--idle"
                }`}
                aria-pressed={profile.gender === "male"}
              >
                {isKo ? "남성" : "Male"}
              </button>
              <button
                type="button"
                onClick={() => patchProfile({ gender: "female" })}
                className={`human-premium-birth-pill flex-1 ${
                  profile.gender === "female"
                    ? "human-premium-birth-pill--active"
                    : "human-premium-birth-pill--idle"
                }`}
                aria-pressed={profile.gender === "female"}
              >
                {isKo ? "여성" : "Female"}
              </button>
            </div>
          </fieldset>
          <div className="human-premium-birth-consent">
            <PrivacyConsent
              checked={profile.privacyConsent}
              onChange={(privacyConsent) => patchProfile({ privacyConsent })}
              locale={routeLocale as "ko" | "en"}
              variant="card"
              audience="human"
            />
          </div>
          {error ? (
            <p
              role="alert"
              className="rounded-2xl border border-red-300/80 bg-red-50 px-4 py-3 text-sm font-medium text-red-900"
            >
              {error}
            </p>
          ) : null}

          {!isFullMember ? (
            <>
              <p className="text-center text-xs font-semibold text-plum/70">
                {isKo
                  ? "PDF로 저장해두세요. 회원가입하면 언제든 다시 볼 수 있어요"
                  : "Save your report as PDF. Sign up to access it anytime."}
              </p>
              <Link
                href="/login"
                className="human-premium-birth-submit human-premium-birth-submit--plan"
              >
                <span className="human-premium-birth-submit-body">
                  <span className="human-premium-birth-submit-title">{ui.ctaGuest}</span>
                </span>
              </Link>
            </>
          ) : (
            <button
              type="button"
              disabled={!profile.birthDate || !profile.privacyConsent || submitBusy}
              onClick={() => void handleGenerate()}
              className="human-premium-birth-submit human-premium-birth-submit--plan"
            >
              <span className="human-premium-birth-submit-body">
                {loading || paying ? (
                  isKo
                    ? paying
                      ? "결제 창 여는 중…"
                      : "생성 중…"
                    : paying
                      ? "Opening checkout…"
                      : "Generating…"
                ) : (
                  <span className="human-premium-birth-submit-title">{ctaLabel}</span>
                )}
              </span>
            </button>
          )}
        </div>

        <p className="text-center text-xs text-plum/60">
          <Link href="/saju" className="underline">
            {tNav("saju")}
          </Link>
        </p>
      </section>
    </>
  );
}
