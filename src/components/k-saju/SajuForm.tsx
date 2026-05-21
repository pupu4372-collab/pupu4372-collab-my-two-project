"use client";

import { PrivacyConsent } from "@/components/legal/PrivacyConsent";
import { SajuResult } from "@/components/k-saju/SajuResult";
import { COMMON_TIMEZONES } from "@/lib/saju/timezone";
import type { Locale, SajuBasicResponse, Species } from "@/lib/saju/types";
import { useMemo, useState } from "react";

const UI = {
  en: {
    title: "K-Saju for your pet",
    subtitle: "Enter birth data in your local timezone — we store it as UTC.",
    petName: "Pet name",
    species: "Species",
    dog: "Dog",
    cat: "Cat",
    birthDate: "Birth date",
    birthTime: "Birth time",
    timeUnknown: "Time unknown (use noon, hide hour pillar)",
    timezone: "Birth timezone",
    submit: "Reveal their vibe",
    loading: "Reading the stars…",
    errorConsent: "Please agree to the privacy notice.",
    localeLabel: "Language",
  },
  ko: {
    title: "반려동물 K-사주",
    subtitle: "현지 시간대로 입력하면 UTC로 안전하게 저장해요.",
    petName: "이름",
    species: "종류",
    dog: "강아지",
    cat: "고양이",
    birthDate: "생년월일",
    birthTime: "출생 시간",
    timeUnknown: "시간 모름 (정오 기준, 시주 제외)",
    timezone: "출생 지역 시간대",
    submit: "사주 보기",
    loading: "만세력 계산 중…",
    errorConsent: "개인정보 동의가 필요합니다.",
    localeLabel: "언어",
  },
};

function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "Asia/Seoul";
  }
}

interface SajuFormProps {
  embedded?: boolean;
}

export function SajuForm({ embedded = false }: SajuFormProps) {
  const [locale, setLocale] = useState<Locale>("ko");
  const [petName, setPetName] = useState("");
  const [species, setSpecies] = useState<Species>("dog");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("12:00");
  const [birthTimeUnknown, setBirthTimeUnknown] = useState(false);
  const [timezone, setTimezone] = useState(detectTimezone);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SajuBasicResponse | null>(null);

  const t = UI[locale];
  const inputClass = embedded ? "pastel-input" : "mt-1 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm";
  const labelClass = embedded ? "block text-sm font-medium text-plum/80" : "block text-xs text-ink/60";

  const timezoneOptions = useMemo(() => {
    const set = new Set<string>([...COMMON_TIMEZONES, timezone]);
    return Array.from(set);
  }, [timezone]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!consent) {
      setError(t.errorConsent);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/saju/basic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petName,
          species,
          birthDate,
          birthTime: birthTimeUnknown ? null : birthTime,
          birthTimeUnknown,
          timezone,
          locale,
          privacyConsent: consent,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setResult(data as SajuBasicResponse);
    } catch {
      setError(locale === "ko" ? "네트워크 오류가 발생했어요." : "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={embedded ? "space-y-5" : "space-y-6"}>
      {!embedded && (
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">{t.title}</h2>
          <p className="text-sm text-ink/60">{t.subtitle}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={embedded ? "space-y-4" : "oriental-card space-y-4 p-5"}
      >
        <div className="flex gap-3">
          <label className={`${labelClass} flex-1`}>
            {t.localeLabel}
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              className={inputClass}
            >
              <option value="ko">한국어</option>
              <option value="en">English</option>
            </select>
          </label>
          <label className={`${labelClass} flex-1`}>
            {t.species}
            <select
              value={species}
              onChange={(e) => setSpecies(e.target.value as Species)}
              className={inputClass}
            >
              <option value="dog">{t.dog}</option>
              <option value="cat">{t.cat}</option>
            </select>
          </label>
        </div>

        <label className={labelClass}>
          {t.petName}
          <input
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            placeholder="모찌"
            className={inputClass}
            required
            maxLength={32}
          />
        </label>

        <label className={labelClass}>
          {t.birthDate}
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className={inputClass}
            required
          />
        </label>

        <label className={labelClass}>
          {t.birthTime}
          <input
            type="time"
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
            disabled={birthTimeUnknown}
            className={`${inputClass} disabled:opacity-50`}
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-plum/75">
          <input
            type="checkbox"
            checked={birthTimeUnknown}
            onChange={(e) => setBirthTimeUnknown(e.target.checked)}
            className="h-4 w-4 rounded border-plum/30 text-mint focus:ring-mint/40"
          />
          {t.timeUnknown}
        </label>

        <label className={labelClass}>
          {t.timezone}
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className={inputClass}
          >
            {timezoneOptions.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </label>

        <PrivacyConsent checked={consent} onChange={setConsent} locale={locale} variant={embedded ? "pastel" : "default"} />

        {error && (
          <p
            className="rounded-2xl bg-petal/40 px-4 py-2.5 text-sm text-plum"
            role="alert"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={
            embedded
              ? "w-full rounded-full bg-mint py-3.5 text-sm font-semibold text-ink transition hover:brightness-105 disabled:opacity-60"
              : "w-full rounded-xl bg-ink py-3 text-sm font-medium text-cream transition hover:bg-ink/90 disabled:opacity-60"
          }
        >
          {loading ? t.loading : t.submit}
        </button>
      </form>

      {result && <SajuResult result={result} variant={embedded ? "pastel" : "default"} />}
    </div>
  );
}
