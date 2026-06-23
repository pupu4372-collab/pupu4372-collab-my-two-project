"use client";

import { BirthDateSelect } from "@/components/k-saju/BirthDateSelect";
import { DayPillarPreview } from "@/components/human-premium/DayPillarPreview";
import { PrivacyConsent } from "@/components/legal/PrivacyConsent";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import {
  BUNDLE_PRICING,
  formatKrw,
  getBundleSavings,
  REPORT_PRICING,
  REPORT_TYPE_ORDER,
  REPORT_TYPE_SUBTITLES_EN,
  REPORT_TYPE_SUBTITLES_KO,
  type HumanPremiumBundleKind,
} from "@/lib/reports/human-premium/pricing";
import {
  REPORT_TYPE_LABELS,
  REPORT_TYPE_LABELS_EN,
  type ReportType,
} from "@/lib/reports/human-premium/types";
import {
  BIRTH_TIME_OPTIONS,
  getBirthTimeOptionLabel,
  parseBirthTimeSelect,
} from "@/lib/saju/birth-time-options";
import { COMMON_TIMEZONES } from "@/lib/saju/timezone";
import { useLocale } from "next-intl";
import { useMemo, useRef, useState } from "react";

type CheckoutTarget =
  | { kind: "single"; reportType: ReportType }
  | { kind: "bundle"; bundle: HumanPremiumBundleKind };

export function HumanPremiumShop() {
  const routeLocale = useLocale();
  const isKo = routeLocale === "ko";
  const gridRef = useRef<HTMLDivElement>(null);
  const { accessToken } = useSupabaseSession();

  const [checkout, setCheckout] = useState<CheckoutTarget | null>(null);
  const [personName, setPersonName] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTimeSelect, setBirthTimeSelect] = useState("unknown");
  const [timezone, setTimezone] = useState("Asia/Seoul");
  const [calendarType, setCalendarType] = useState<"solar" | "lunar">("solar");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [portOneReady, setPortOneReady] = useState<boolean | null>(null);

  const birthTimeUnknown = birthTimeSelect === "unknown";
  const birthTime = useMemo(
    () => (birthTimeUnknown ? null : parseBirthTimeSelect(birthTimeSelect)),
    [birthTimeSelect, birthTimeUnknown]
  );

  const savings = getBundleSavings();
  const subtitles = isKo ? REPORT_TYPE_SUBTITLES_KO : REPORT_TYPE_SUBTITLES_EN;
  const typeLabels = isKo ? REPORT_TYPE_LABELS : REPORT_TYPE_LABELS_EN;

  function scrollToGrid() {
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openCheckout(target: CheckoutTarget) {
    setCheckout(target);
    setError(null);
    scrollToGrid();
  }

  function checkoutAmount(target: CheckoutTarget): number {
    if (target.kind === "bundle") return BUNDLE_PRICING[target.bundle];
    return REPORT_PRICING[target.reportType];
  }

  function checkoutReportType(target: CheckoutTarget): ReportType {
    if (target.kind === "single") return target.reportType;
    if (target.bundle === "timepack") return "yearly";
    if (target.bundle === "themepack") return "mental";
    return "lifetime";
  }

  async function handlePay() {
    if (!checkout || !privacyConsent) return;
    setLoading(true);
    setError(null);

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    try {
      const res = await fetch("/api/payments/human-premium/checkout", {
        method: "POST",
        headers,
        body: JSON.stringify({
          personName,
          email,
          birthDate,
          birthTime,
          birthTimeUnknown,
          timezone,
          calendarType,
          locale: routeLocale,
          privacyConsent,
          gender: gender || undefined,
          reportType: checkoutReportType(checkout),
          isBundle: checkout.kind === "bundle" && checkout.bundle === "all",
          bundle: checkout.kind === "bundle" ? checkout.bundle : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");

      setPortOneReady(data.configured ?? false);

      if (!data.configured) {
        setError(
          isKo
            ? "결제 연동 준비 중입니다. PortOne 키 설정 후 이용 가능합니다."
            : "Payment integration pending. Configure PortOne keys to checkout."
        );
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl as string;
        return;
      }

      const PortOne = (window as Window & { PortOne?: unknown }).PortOne;
      if (!PortOne || typeof PortOne !== "object") {
        throw new Error(isKo ? "결제 SDK 로드 실패" : "Payment SDK failed to load");
      }

      const requestPayment = (
        PortOne as {
          requestPayment: (opts: Record<string, unknown>) => Promise<unknown>;
        }
      ).requestPayment;

      await requestPayment({
        storeId: data.storeId,
        paymentId: data.paymentId,
        orderName: data.orderName,
        totalAmount: data.amount,
        currency: "KRW",
        customData: { reportId: data.reportId },
        redirectUrl: `${window.location.origin}/${routeLocale}/premium/human/success?reportId=${data.reportId}`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-10">
      <DayPillarPreview onViewFull={(type) => openCheckout({ kind: "single", reportType: type })} />

      <div ref={gridRef} className="space-y-6">
        <header className="text-center">
          <h2 className="text-2xl font-bold text-ink">
            {isKo ? "리포트 선택" : "Choose your report"}
          </h2>
          <p className="mt-2 text-sm text-plum/80">
            {isKo ? "원하는 분석 유형을 골라 구매하세요." : "Pick a report type and checkout."}
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REPORT_TYPE_ORDER.map((reportType) => (
            <article
              key={reportType}
              className="pastel-card flex flex-col p-5 transition hover:border-channel-saju/40"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-channel-saju">
                {typeLabels[reportType]}
              </p>
              <p className="mt-2 text-sm text-plum/85">{subtitles[reportType]}</p>
              <p className="mt-4 text-2xl font-bold text-ink">
                {formatKrw(REPORT_PRICING[reportType])}
              </p>
              <button
                type="button"
                onClick={() => openCheckout({ kind: "single", reportType })}
                className="mt-auto pt-4 text-sm font-bold text-channel-saju underline underline-offset-4"
              >
                {isKo ? "구매하기" : "Buy"}
              </button>
            </article>
          ))}
        </div>
      </div>

      {checkout ? (
        <section className="pastel-card space-y-4 border-2 border-channel-saju/30 p-6">
          <h3 className="text-lg font-bold text-ink">
            {isKo ? "결제 정보" : "Checkout"}
            <span className="ml-2 text-channel-saju">
              {formatKrw(checkoutAmount(checkout))}
            </span>
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-ink">
              {isKo ? "이름" : "Name"}
              <input
                className="pastel-input mt-1 w-full"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
              />
            </label>
            <label className="block text-sm font-medium text-ink">
              {isKo ? "이메일" : "Email"}
              <input
                type="email"
                className="pastel-input mt-1 w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
          </div>
          <BirthDateSelect
            value={birthDate}
            onChange={setBirthDate}
            label={isKo ? "생년월일" : "Birth date"}
            locale={routeLocale as "ko" | "en"}
          />
          <label className="block text-sm font-medium text-ink">
            {isKo ? "출생 시간" : "Birth time"}
            <select
              className="pastel-input mt-1 w-full"
              value={birthTimeSelect}
              onChange={(e) => setBirthTimeSelect(e.target.value)}
            >
              {BIRTH_TIME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {getBirthTimeOptionLabel(opt, routeLocale as "ko" | "en")}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-ink">
            {isKo ? "타임존" : "Timezone"}
            <select
              className="pastel-input mt-1 w-full"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-ink">
            {isKo ? "성별 (선택)" : "Gender (optional)"}
            <select
              className="pastel-input mt-1 w-full"
              value={gender}
              onChange={(e) => setGender(e.target.value as "" | "male" | "female")}
            >
              <option value="">{isKo ? "미입력" : "Not provided"}</option>
              <option value="male">{isKo ? "남" : "Male"}</option>
              <option value="female">{isKo ? "여" : "Female"}</option>
            </select>
          </label>
          <PrivacyConsent
            checked={privacyConsent}
            onChange={setPrivacyConsent}
            locale={routeLocale as "ko" | "en"}
            variant="pastel"
            audience="human"
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {portOneReady === false ? (
            <p className="text-sm text-plum/80">
              {isKo
                ? "PortOne 환경변수 설정 후 실제 결제가 가능합니다."
                : "Set PortOne env vars to enable live checkout."}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={loading || !privacyConsent || !personName || !email || !birthDate}
              onClick={handlePay}
              className="rounded-full bg-channel-saju px-6 py-3 font-bold text-white disabled:opacity-50"
            >
              {loading ? (isKo ? "처리 중…" : "Processing…") : isKo ? "결제하기" : "Pay now"}
            </button>
            <button
              type="button"
              onClick={() => setCheckout(null)}
              className="rounded-full border border-plum/20 px-6 py-3 text-sm font-semibold text-plum"
            >
              {isKo ? "취소" : "Cancel"}
            </button>
          </div>
        </section>
      ) : null}

      <section className="rounded-[2rem] bg-gradient-to-br from-channel-saju/90 to-plum p-6 text-white sm:p-8">
        <p className="text-sm font-semibold text-white/80">
          {isKo ? "올인원 번들" : "All-in-one bundle"}
        </p>
        <h3 className="mt-2 text-xl font-bold sm:text-2xl">
          {isKo
            ? `단품으로 모두 구매 시 ${formatKrw(Object.values(REPORT_PRICING).reduce((a, b) => a + b, 0))}`
            : `Buying all singles: ${formatKrw(Object.values(REPORT_PRICING).reduce((a, b) => a + b, 0))}`}
        </h3>
        <p className="mt-2 text-lg font-semibold">
          → {isKo ? "올인원 번들" : "All-in-one bundle"}{" "}
          <span className="text-2xl">{formatKrw(BUNDLE_PRICING.all)}</span>
          <span className="ml-2 text-sm text-white/90">
            ({isKo ? `${formatKrw(savings)} 절약` : `save ${formatKrw(savings)}`})
          </span>
        </p>
        <button
          type="button"
          onClick={() => openCheckout({ kind: "bundle", bundle: "all" })}
          className="mt-6 rounded-full bg-white px-8 py-3 font-bold text-channel-saju shadow-lg"
        >
          {isKo ? "번들 구매하기" : "Buy bundle"}
        </button>
      </section>
    </div>
  );
}
