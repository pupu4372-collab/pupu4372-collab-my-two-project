"use client";

import { BirthDateSelect } from "@/components/k-saju/BirthDateSelect";
import { SajuResult } from "@/components/k-saju/SajuResult";
import { PrivacyConsent } from "@/components/legal/PrivacyConsent";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import {
  BIRTH_TIME_OPTIONS,
  getBirthTimeOptionLabel,
} from "@/lib/saju/birth-time-options";
import { Link } from "@/i18n/navigation";
import { COMMON_TIMEZONES } from "@/lib/saju/timezone";
import type { Gender, Locale, SajuBasicResponse, Species } from "@/lib/saju/types";
import { useLocale } from "next-intl";
import { useMemo, useState } from "react";

const UI = {
  en: {
    title: "K-Saju for your pet",
    subtitle: "Enter birth data in your local timezone. We store it as UTC.",
    petName: "Pet name",
    species: "Species",
    petGender: "Pet gender",
    petFemale: "Female",
    petMale: "Male",
    dog: "Dog",
    cat: "Cat",
    birthDate: "Birth date",
    birthTime: "Birth time",
    timezone: "Birth timezone",
    submit: "Reveal their vibe",
    loading: "Reading the stars...",
    errorConsent: "Please agree to the privacy notice.",
    localeLabel: "Language",
    sessionPreparing: "Preparing session. Please try again soon.",
    networkError: "Network error. Please try again.",
    continueTitle: "Keep reading",
    continueSubtitle: "Use the same pet profile for zodiac and bond readings.",
    zodiacCta: "Zodiac fortune",
    compatibilityCta: "Pet & butler bond",
  },
  ko: {
    title: "반려동물 K-사주",
    subtitle: "현지 시간대로 입력하면 UTC로 안전하게 저장해요.",
    petName: "이름",
    species: "종류",
    petGender: "동물 성별",
    petFemale: "암",
    petMale: "수",
    dog: "강아지",
    cat: "고양이",
    birthDate: "생년월일",
    birthTime: "출생 시간",
    timezone: "출생 지역 시간대",
    submit: "사주 보기",
    loading: "만세력 계산 중...",
    errorConsent: "개인정보 동의가 필요합니다.",
    localeLabel: "언어",
    sessionPreparing: "세션 준비 중이에요. 잠시 후 다시 시도해 주세요.",
    networkError: "네트워크 오류가 발생했어요.",
    continueTitle: "이 정보로 이어보기",
    continueSubtitle: "방금 입력한 이름과 생일을 그대로 가져가 별자리와 궁합도 이어서 볼 수 있어요.",
    zodiacCta: "별자리 운세보기",
    compatibilityCta: "펫과 주인간 궁합보기",
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
  const { ready: sessionReady, accessToken, configured } = useSupabaseSession();
  const routeLocale = useLocale();
  const [locale, setLocale] = useState<Locale>(routeLocale === "en" ? "en" : "ko");
  const [petName, setPetName] = useState("");
  const [species, setSpecies] = useState<Species>("dog");
  const [petGender, setPetGender] = useState<Gender>("female");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("unknown");
  const [timezone, setTimezone] = useState(detectTimezone);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SajuBasicResponse | null>(null);

  const t = UI[locale];
  const birthTimeUnknown = birthTime === "unknown";
  const inputClass = embedded
    ? "mt-1 w-full rounded-xl border border-plum/10 bg-white px-3 py-2 text-xs leading-5 text-ink outline-none transition focus:border-mint/80 focus:shadow-[0_0_0_3px_rgba(168,230,207,0.25)]"
    : "mt-1 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm";
  const labelClass = embedded
    ? "block text-xs font-medium text-plum/80"
    : "block text-xs text-ink/60";

  const timezoneOptions = useMemo(() => {
    const set = new Set<string>([...COMMON_TIMEZONES, timezone]);
    return Array.from(set);
  }, [timezone]);

  const continuationQuery = new URLSearchParams({
    petName,
    species,
    petGender,
    birthDate,
    birthTime,
    timezone,
    locale,
  }).toString();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!consent) {
      setError(t.errorConsent);
      return;
    }

    if (configured && !sessionReady) {
      setError(t.sessionPreparing);
      return;
    }

    setLoading(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const res = await fetch("/api/saju/basic", {
        method: "POST",
        headers,
        body: JSON.stringify({
          petName,
          species,
          petGender,
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
      setError(t.networkError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={embedded ? "space-y-4" : "space-y-6"}>
      {!embedded && (
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">{t.title}</h2>
          <p className="text-sm text-ink/60">{t.subtitle}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={embedded ? "space-y-3" : "oriental-card space-y-4 p-5"}
      >
        <div className="flex gap-2.5">
          {!embedded && (
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
          )}
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
          {embedded && (
            <label className={`${labelClass} flex-1`}>
              {t.petGender}
              <select
                value={petGender}
                onChange={(e) => setPetGender(e.target.value as Gender)}
                className={inputClass}
              >
                <option value="female">{t.petFemale}</option>
                <option value="male">{t.petMale}</option>
              </select>
            </label>
          )}
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

        <BirthDateSelect
          value={birthDate}
          onChange={setBirthDate}
          label={t.birthDate}
          locale={locale}
          className={labelClass}
          selectClassName={inputClass}
        />

        <label className={labelClass}>
          {t.birthTime}
          <select
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
            className={inputClass}
          >
            {BIRTH_TIME_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {getBirthTimeOptionLabel(option, locale)}
              </option>
            ))}
          </select>
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

        <PrivacyConsent
          checked={consent}
          onChange={setConsent}
          locale={locale}
          variant={embedded ? "pastelCompact" : "default"}
        />

        {error && (
          <p
            className={
              embedded
                ? "rounded-2xl bg-petal/40 px-3 py-2 text-xs text-plum"
                : "rounded-2xl bg-petal/40 px-4 py-2.5 text-sm text-plum"
            }
            role="alert"
          >
            {error}
          </p>
        )}

        {embedded ? (
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-mint px-4 py-2.5 text-center text-ink transition hover:brightness-105 disabled:opacity-60"
          >
            <span className="block text-xs font-bold">{loading ? t.loading : t.submit}</span>
            <span className="mt-0.5 block text-[11px] font-semibold text-ink/65">
              ⭐ {t.zodiacCta} · 💞 {t.compatibilityCta}
            </span>
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-ink py-3 text-sm font-medium text-cream transition hover:bg-ink/90 disabled:opacity-60"
          >
            {loading ? t.loading : t.submit}
          </button>
        )}
      </form>

      {result && (
        <>
          <SajuResult result={result} variant={embedded ? "pastel" : "default"} />
          <section
            className={
              embedded ? "pastel-card space-y-3 p-5" : "oriental-card space-y-3 p-5"
            }
          >
              <div>
                <h3 className="font-semibold text-plum">{t.continueTitle}</h3>
                <p className="mt-1 text-sm leading-relaxed text-plum/65">
                  {t.continueSubtitle}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  href={`/saju/zodiac?${continuationQuery}`}
                  className="rounded-2xl bg-channel-saju/15 px-4 py-3 text-center text-sm font-semibold text-channel-saju transition hover:bg-channel-saju/25"
                >
                  {t.zodiacCta}
                </Link>
                <Link
                  href={`/saju/compatibility?${continuationQuery}`}
                  className="rounded-2xl bg-petal/40 px-4 py-3 text-center text-sm font-semibold text-plum transition hover:bg-petal/60"
                >
                  {t.compatibilityCta}
                </Link>
              </div>
          </section>
        </>
      )}
    </div>
  );
}
