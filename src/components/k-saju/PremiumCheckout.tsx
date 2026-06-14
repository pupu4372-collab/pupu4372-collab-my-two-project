"use client";

import { BirthDateSelect } from "@/components/k-saju/BirthDateSelect";
import { PrivacyConsent } from "@/components/legal/PrivacyConsent";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import {
  BIRTH_TIME_OPTIONS,
  getBirthTimeOptionLabel,
  parseBirthTimeSelect,
} from "@/lib/saju/birth-time-options";
import { PREMIUM_PRICE_USD } from "@/lib/paypal/config";
import { COMMON_TIMEZONES } from "@/lib/saju/timezone";
import type { Locale } from "@/lib/saju/types";
import { useLocale } from "next-intl";
import { useMemo, useState } from "react";

type CalendarType = "solar" | "lunar";

interface CheckoutResult {
  reportId: string;
  webUrl: string;
  emailStatus: string;
}

const UI = {
  ko: {
    title: "Premium 평생 리포트",
    subtitle: "사주 평생 리포트를 결제 후 바로 확인하세요.",
    originalPrice: "USD $50",
    price: `USD $${PREMIUM_PRICE_USD}`,
    submit: "PayPal로 결제하기",
    cardPending: "카드 결제 준비 중",
    demo: "데모로 리포트 받기",
    loading: "처리 중…",
    consent: "개인정보 동의 필요",
    ready: "리포트가 준비됐어요",
    openReport: "웹 리포트 열기",
    emailSent: "입력한 이메일로 리포트 링크도 발송했습니다.",
    emailFailed: "리포트는 생성됐지만 이메일 발송은 실패했습니다. 관리자에게 문의해 주세요.",
    personName: "이름",
    email: "이메일",
    calendarType: "달력 기준",
    solar: "양력",
    lunar: "음력",
    timezone: "출생지 타임존",
    gender: "성별 (대운 산정, 선택)",
    genderUnknown: "미입력",
    genderMale: "남",
    genderFemale: "여",
  },
  en: {
    title: "Premium Lifetime Report",
    subtitle: "Unlock your premium lifetime K-Saju web report after checkout.",
    originalPrice: "USD $50",
    price: `USD $${PREMIUM_PRICE_USD}`,
    submit: "Pay with PayPal",
    cardPending: "Card checkout coming soon",
    demo: "Get report (demo)",
    loading: "Processing…",
    consent: "Privacy consent required",
    ready: "Your report is ready",
    openReport: "Open web report",
    emailSent: "We also sent the report link to your email.",
    emailFailed: "The report is ready, but email delivery failed. Please contact support.",
    personName: "Name",
    email: "Email",
    calendarType: "Calendar type",
    solar: "Solar",
    lunar: "Lunar",
    timezone: "Birth timezone",
    gender: "Gender for daewoon (optional)",
    genderUnknown: "Not provided",
    genderMale: "Male",
    genderFemale: "Female",
  },
};

export function PremiumCheckout() {
  const { ready, accessToken } = useSupabaseSession();
  const routeLocale = useLocale();
  const [locale, setLocale] = useState<Locale>(routeLocale === "en" ? "en" : "ko");
  const [personName, setPersonName] = useState("");
  const [email, setEmail] = useState("");
  const [calendarType, setCalendarType] = useState<CalendarType>("solar");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("unknown");
  const [timezone, setTimezone] = useState("Asia/Seoul");
  const [gender, setGender] = useState<"" | "male" | "female">("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckoutResult | null>(null);

  const t = UI[locale];
  const petTime = parseBirthTimeSelect(birthTime);

  const timezoneOptions = useMemo(() => {
    const set = new Set<string>([...COMMON_TIMEZONES, timezone]);
    return Array.from(set);
  }, [timezone]);

  async function runCheckout(useDemo: boolean) {
    setError(null);
    setResult(null);
    if (!consent) {
      setError(t.consent);
      return;
    }
    if (!ready) return;

    setLoading(true);
    try {
      const payload = {
        personName,
        email,
        calendarType,
        birthDate,
        birthTime: petTime.birthTime,
        birthTimeUnknown: petTime.birthTimeUnknown,
        timezone,
        locale,
        privacyConsent: true,
        ...(gender ? { gender } : {}),
        demo: useDemo,
      };

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const orderRes = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error);

      if (!useDemo && orderData.approvalUrl) {
        sessionStorage.setItem(
          "premium_pending",
          JSON.stringify({
            orderId: orderData.orderId,
            reportId: orderData.reportId,
            ...payload,
          })
        );
        window.location.href = orderData.approvalUrl;
        return;
      }

      const capRes = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers,
        body: JSON.stringify({
          orderId: orderData.orderId,
          reportId: orderData.reportId,
        }),
      });
      const capData = await capRes.json();
      if (!capRes.ok) throw new Error(capData.error);

      setResult({
        reportId: capData.report.id,
        webUrl: capData.webUrl,
        emailStatus: capData.report.email_status,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="pastel-card space-y-2 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-channel-saju">
          Premium
        </p>
        <h2 className="text-2xl font-extrabold text-ink">{t.title}</h2>
        <p className="text-sm leading-relaxed text-plum/75">{t.subtitle}</p>
        <div className="flex items-end gap-3 pt-2">
          <span className="text-sm text-plum/50 line-through">{t.originalPrice}</span>
          <strong className="text-3xl text-channel-saju">{t.price}</strong>
        </div>
      </div>

      {!result && (
        <form
          className="pastel-card space-y-4 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            void runCheckout(false);
          }}
        >
          <div className="flex gap-3">
            <label className="block flex-1 text-sm text-plum/80">
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as Locale)}
                className="pastel-input"
              >
                <option value="ko">한국어</option>
                <option value="en">English</option>
              </select>
            </label>
          </div>

          <input
            className="pastel-input"
            placeholder={t.personName}
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
            required
          />
          <input
            className="pastel-input"
            placeholder={t.email}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label className="block text-sm font-medium text-plum/80">
            <span className="mb-2 block">{t.calendarType}</span>
            <select
              className="pastel-input"
              value={calendarType}
              onChange={(e) => setCalendarType(e.target.value as CalendarType)}
            >
              <option value="solar">{t.solar}</option>
              <option value="lunar">{t.lunar}</option>
            </select>
          </label>
          <BirthDateSelect
            value={birthDate}
            onChange={setBirthDate}
            label={locale === "ko" ? "생년월일" : "Birth date"}
            locale={locale}
          />
          <select
            className="pastel-input"
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
          >
            {BIRTH_TIME_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {getBirthTimeOptionLabel(o, locale)}
              </option>
            ))}
          </select>
          <label className="block text-sm font-medium text-plum/80">
            <span className="mb-2 block">{t.timezone}</span>
            <select
              className="pastel-input"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            >
              {timezoneOptions.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-plum/80">
            <span className="mb-2 block">{t.gender}</span>
            <select
              className="pastel-input"
              value={gender}
              onChange={(e) => setGender(e.target.value as "" | "male" | "female")}
            >
              <option value="">{t.genderUnknown}</option>
              <option value="male">{t.genderMale}</option>
              <option value="female">{t.genderFemale}</option>
            </select>
          </label>

          <PrivacyConsent
            checked={consent}
            onChange={setConsent}
            locale={locale}
            variant="pastel"
          />

          {error && (
            <p className="text-sm text-red-700/80" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-channel-saju py-3 font-semibold text-white disabled:opacity-60"
          >
            {loading ? t.loading : t.submit}
          </button>
          <button
            type="button"
            disabled
            className="w-full rounded-full border border-plum/15 bg-white/40 py-3 text-sm text-plum/45"
          >
            {t.cardPending}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => runCheckout(true)}
            className="w-full rounded-full border border-plum/20 py-3 text-sm text-plum"
          >
            {t.demo}
          </button>
        </form>
      )}

      {result && (
        <div className="pastel-card space-y-4 p-6 text-center">
          <h3 className="text-xl font-extrabold text-plum">{t.ready}</h3>
          <p className="text-sm text-plum/70">
            {result.emailStatus === "sent" ? t.emailSent : t.emailFailed}
          </p>
          <a
            href={result.webUrl}
            className="inline-flex rounded-full bg-channel-saju px-5 py-3 text-sm font-semibold text-white"
          >
            {t.openReport}
          </a>
          <p className="break-all text-xs text-plum/50">ID: {result.reportId}</p>
        </div>
      )}
    </div>
  );
}
