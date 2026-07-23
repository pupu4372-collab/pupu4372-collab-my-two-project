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
import { isDeliverableHumanPremiumEmail } from "@/lib/reports/human-premium/email-policy";
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
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { portOnePaymentDisplayOptions } from "@/lib/payments/portone-display";
import {
  parsePortOneRedirectReturn,
  portOneReturnNotice,
  stripPortOneRedirectParams,
} from "@/lib/payments/portone-redirect-return";

/** Product header + CTA labels (no duplicate title/sub on the same button). */
const PRODUCT_UI = {
  ko: {
    title: "데일리 럭키 운세",
    description: REPORT_TYPE_SUBTITLES_KO.daily,
    guestPayHint: "게스트도 바로 결제할 수 있어요",
    guestSignupHint: "가입하시면 데일리 럭키를 평생 1회 무료로 받아볼 수 있어요",
    ctaSignup: "가입하고 1회 무료 받기",
    ctaFree: "무료로 받기",
    ctaPay: (price: string) => `${price} 결제하고 보기`,
    emailRequired: "리포트를 받으실 이메일을 입력해 주세요.",
  },
  en: {
    title: "Daily Lucky Reading",
    description: REPORT_TYPE_SUBTITLES_EN.daily,
    guestPayHint: "Guests can pay and view right away",
    guestSignupHint: "Sign up to claim one free Daily Lucky Reading (lifetime)",
    ctaSignup: "Sign up for 1 free reading",
    ctaFree: "Get it free",
    ctaPay: (price: string) => `Pay ${price} to view`,
    emailRequired: "Enter your email to receive your report.",
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const portoneRedirectHandled = useRef(false);

  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    if (portoneRedirectHandled.current) return;
    const parsed = parsePortOneRedirectReturn(new URLSearchParams(searchParams.toString()));
    if (parsed.kind === "none") return;

    if (parsed.kind === "cancel_or_fail") {
      portoneRedirectHandled.current = true;
      const cleaned = stripPortOneRedirectParams(new URLSearchParams(searchParams.toString()));
      const qs = cleaned.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
      setError(portOneReturnNotice(parsed.code, isKo ? "ko" : "en"));
      return;
    }

    if (!accessToken || !sessionReady) return;

    portoneRedirectHandled.current = true;
    const cleaned = stripPortOneRedirectParams(new URLSearchParams(searchParams.toString()));
    const qs = cleaned.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);

    const paymentId = parsed.paymentId;
    setPaying(true);
    setError(null);
    void (async () => {
      try {
        const verifyRes = await fetch("/api/payments/human-premium/daily-extra/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ paymentId, locale: routeLocale, paymentMethod: "portone" }),
        });
        const verifyData = (await verifyRes.json()) as {
          error?: string;
          status?: string;
          paymentId?: string;
        };
        if (!verifyRes.ok) {
          throw new Error(verifyData.error ?? "Payment verify failed");
        }
        const resolvedPaymentId = String(verifyData.paymentId ?? paymentId);
        setLoading(true);

        // Already consumed / report exists: open existing report — do not re-generate.
        if (verifyData.status === "consumed") {
          const opened = await openExistingDailyReport(resolvedPaymentId);
          if (!opened) {
            throw new Error(
              isKo
                ? "이미 결제된 리포트를 찾지 못했어요. 보관함에서 확인해 주세요."
                : "Could not find your paid report. Please check the vault."
            );
          }
          return;
        }

        const alreadyOpen = await openExistingDailyReport(resolvedPaymentId);
        if (alreadyOpen) return;

        await requestDailyReport(resolvedPaymentId);
      } catch (err) {
        const raw = err instanceof Error ? err.message : "Payment failed";
        setError(formatHumanPremiumError(raw, routeLocale as "ko" | "en"));
      } finally {
        setPaying(false);
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot PortOne redirect resume
  }, [accessToken, isKo, pathname, routeLocale, router, searchParams, sessionReady]);

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

  const ctaLabel = isFullMember && hasCoupon
    ? ui.ctaFree
    : ui.ctaPay(paidPriceLabel);

  /** Vault lookup only — no daily-routine generate. Returns true if navigated. */
  async function openExistingDailyReport(paymentOrderId: string): Promise<boolean> {
    if (!accessToken || !paymentOrderId) return false;
    const vaultRes = await fetch(
      `/api/payments/human-premium/vault?locale=${encodeURIComponent(routeLocale)}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!vaultRes.ok) return false;
    const data = (await vaultRes.json()) as {
      orders?: Array<{
        orderId?: string;
        generated?: Partial<Record<string, { webToken?: string }>>;
      }>;
    };
    const order = (data.orders ?? []).find((entry) => entry.orderId === paymentOrderId);
    const token = order?.generated?.daily?.webToken?.trim();
    if (!token) return false;
    window.location.assign(`/${routeLocale}/reports/human/${token}`);
    return true;
  }

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
      return { paymentRequired: true as const };
    }
    if (res.status === 402 && errCode === "payment_required") {
      return { paymentRequired: true as const };
    }
    if (res.status === 401 && data.error === "login_required") {
      throw new Error(String(data.error));
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
    if (data.couponUsed === true) {
      setHasCoupon(false);
    }
    return data;
  }

  function assertEmailReady(): boolean {
    if (isDeliverableHumanPremiumEmail(profile.email)) return true;
    setError(ui.emailRequired);
    return false;
  }

  async function handleGenerate() {
    if (!assertEmailReady()) return;

    // Guests always pay. Members without free claim pay.
    if (!isFullMember || hasCoupon === false) {
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
    if (!accessToken) {
      setError(
        isKo
          ? "세션을 준비 중이에요. 잠시 후 다시 시도해 주세요."
          : "Preparing your session. Please try again in a moment."
      );
      return;
    }
    if (!assertEmailReady()) return;

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
          ...portOnePaymentDisplayOptions(),
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
            {isKo ? "집사님의 사주" : "Your birth chart"}
          </p>
          <h2 className="mt-2 text-2xl font-bold">{ui.title}</h2>
          <p className="mt-2 text-sm text-plum/75">{ui.description}</p>
          <p className="mt-1 text-base font-bold text-ink">{paidPriceLabel}</p>
        </div>

        <div className="human-premium-birth-form-inner space-y-4">
          <label className="human-premium-birth-field">
            {isKo ? "닉네임" : "Nickname"}
            <input
              className="human-premium-birth-input"
              value={profile.personName}
              onChange={(e) => patchProfile({ personName: e.target.value })}
              placeholder={isKo ? "닉네임 입력" : "Your nickname"}
            />
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
            <div className="space-y-3">
              <p className="text-center text-xs font-semibold text-plum/70">{ui.guestPayHint}</p>
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
                    <span className="human-premium-birth-submit-title">{ui.ctaPay(paidPriceLabel)}</span>
                  )}
                </span>
              </button>
              <div className="rounded-2xl border border-channel-saju/20 bg-lavender/20 px-4 py-3 text-center text-sm text-plum">
                <p>{ui.guestSignupHint}</p>
                <Link
                  href="/login"
                  className="mt-2 inline-block font-extrabold text-channel-saju underline"
                >
                  {ui.ctaSignup}
                </Link>
              </div>
            </div>
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
