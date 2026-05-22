"use client";

import { BirthDateSelect } from "@/components/k-saju/BirthDateSelect";
import { PrivacyConsent } from "@/components/legal/PrivacyConsent";
import { PremiumReportView } from "@/components/k-saju/PremiumReportView";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import {
  BIRTH_TIME_OPTIONS,
  getBirthTimeOptionLabel,
  parseBirthTimeSelect,
} from "@/lib/saju/birth-time-options";
import type { PremiumReport } from "@/lib/saju/premium-report";
import { PREMIUM_PRICE_USD } from "@/lib/paypal/config";
import { COMMON_TIMEZONES } from "@/lib/saju/timezone";
import type { Locale, Species } from "@/lib/saju/types";
import { useLocale } from "next-intl";
import { useMemo, useState } from "react";

const UI = {
  ko: {
    title: "Premium 평생 사주 리포트",
    price: `USD $${PREMIUM_PRICE_USD}`,
    submit: "PayPal로 결제하기",
    demo: "데모로 리포트 받기",
    loading: "처리 중…",
    consent: "개인정보 동의 필요",
    petName: "반려동물 이름",
    dog: "강아지",
    cat: "고양이",
  },
  en: {
    title: "Premium Lifetime Report",
    price: `USD $${PREMIUM_PRICE_USD}`,
    submit: "Pay with PayPal",
    demo: "Get report (demo)",
    loading: "Processing…",
    consent: "Privacy consent required",
    petName: "Pet name",
    dog: "Dog",
    cat: "Cat",
  },
};

export function PremiumCheckout() {
  const { ready, accessToken } = useSupabaseSession();
  const routeLocale = useLocale();
  const [locale, setLocale] = useState<Locale>(routeLocale === "en" ? "en" : "ko");
  const [petName, setPetName] = useState("");
  const [species, setSpecies] = useState<Species>("dog");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("unknown");
  const [timezone, setTimezone] = useState("Asia/Seoul");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<PremiumReport | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  const t = UI[locale];
  const petTime = parseBirthTimeSelect(birthTime);

  const timezoneOptions = useMemo(() => {
    const set = new Set<string>([...COMMON_TIMEZONES, timezone]);
    return Array.from(set);
  }, [timezone]);

  async function runCheckout(useDemo: boolean) {
    setError(null);
    setReport(null);
    if (!consent) {
      setError(t.consent);
      return;
    }
    if (!ready) return;

    setLoading(true);
    try {
      const orderRes = await fetch("/api/paypal/create-order", { method: "POST" });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error);

      if (!useDemo && orderData.approvalUrl) {
        sessionStorage.setItem(
          "premium_pending",
          JSON.stringify({
            orderId: orderData.orderId,
            petName,
            species,
            birthDate,
            birthTime: petTime.birthTime,
            birthTimeUnknown: petTime.birthTimeUnknown,
            timezone,
            locale,
          })
        );
        window.location.href = orderData.approvalUrl;
        return;
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const capRes = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers,
        body: JSON.stringify({
          orderId: orderData.orderId,
          petName,
          species,
          birthDate,
          birthTime: petTime.birthTime,
          birthTimeUnknown: petTime.birthTimeUnknown,
          timezone,
          locale,
        }),
      });
      const capData = await capRes.json();
      if (!capRes.ok) throw new Error(capData.error);

      setReport(capData.report);
      setDemoMode(capData.capture?.demo ?? useDemo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-plum/70">
        {t.title} · <strong>{t.price}</strong>
      </p>

      {!report && (
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
            <label className="block flex-1 text-sm text-plum/80">
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value as Species)}
                className="pastel-input"
              >
                <option value="dog">{t.dog}</option>
                <option value="cat">{t.cat}</option>
              </select>
            </label>
          </div>

          <input
            className="pastel-input"
            placeholder={t.petName}
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            required
          />
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
            disabled={loading}
            onClick={() => runCheckout(true)}
            className="w-full rounded-full border border-plum/20 py-3 text-sm text-plum"
          >
            {t.demo}
          </button>
        </form>
      )}

      {report && (
        <PremiumReportView report={report} petName={petName} demo={demoMode} />
      )}
    </div>
  );
}
