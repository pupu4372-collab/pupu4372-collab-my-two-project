"use client";

import { BirthDateSelect } from "@/components/k-saju/BirthDateSelect";
import { PrivacyConsent } from "@/components/legal/PrivacyConsent";
import { CompatibilityResult } from "@/components/k-saju/CompatibilityResult";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { Link } from "@/i18n/navigation";
import {
  BIRTH_TIME_OPTIONS,
  getBirthTimeOptionLabel,
  parseBirthTimeSelect,
} from "@/lib/saju/birth-time-options";
import type { CompatibilityResponse } from "@/lib/saju/compatibility/engine";
import { COMMON_TIMEZONES } from "@/lib/saju/timezone";
import type { Gender, Locale, Species } from "@/lib/saju/types";
import { useLocale } from "next-intl";
import { useEffect, useMemo, useState } from "react";

const UI = {
  ko: {
    petSection: "반려동물",
    ownerSection: "집사 (나)",
    petName: "이름",
    ownerName: "이름",
    species: "종류",
    gender: "성별",
    petMale: "수",
    petFemale: "암",
    ownerMale: "남성",
    ownerFemale: "여성",
    selectGender: "성별 선택",
    dog: "강아지",
    cat: "고양이",
    birthDate: "생년월일",
    birthTime: "출생 시간",
    timezone: "출생 지역 시간대",
    submit: "궁합 보기",
    loading: "인연 계산 중…",
    errorConsent: "개인정보 동의가 필요합니다.",
    localeLabel: "언어",
  },
  en: {
    petSection: "Pet",
    ownerSection: "Butler (you)",
    petName: "Name",
    ownerName: "Name",
    species: "Species",
    gender: "Gender",
    petMale: "Male",
    petFemale: "Female",
    ownerMale: "Male",
    ownerFemale: "Female",
    selectGender: "Select gender",
    dog: "Dog",
    cat: "Cat",
    birthDate: "Birth date",
    birthTime: "Birth time",
    timezone: "Birth timezone",
    submit: "Check our bond",
    loading: "Reading the bond…",
    errorConsent: "Privacy consent required.",
    localeLabel: "Language",
  },
};

function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "Asia/Seoul";
  }
}

function isLocale(value: string | null): value is Locale {
  return value === "ko" || value === "en";
}

function isSpecies(value: string | null): value is Species {
  return value === "dog" || value === "cat";
}

function isGender(value: string | null): value is Gender {
  return value === "male" || value === "female";
}

function isBirthTimeOption(value: string | null): value is string {
  return Boolean(value && BIRTH_TIME_OPTIONS.some((option) => option.value === value));
}

export function CompatibilityForm() {
  const { ready, accessToken, configured, isAnonymous } = useSupabaseSession();
  const routeLocale = useLocale();
  const [locale, setLocale] = useState<Locale>(routeLocale === "en" ? "en" : "ko");
  const [petName, setPetName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [species, setSpecies] = useState<Species>("dog");
  const [petGender, setPetGender] = useState<Gender | "">("");
  const [ownerGender, setOwnerGender] = useState<Gender | "">("");
  const [petBirthDate, setPetBirthDate] = useState("");
  const [ownerBirthDate, setOwnerBirthDate] = useState("");
  const [petBirthTime, setPetBirthTime] = useState("unknown");
  const [ownerBirthTime, setOwnerBirthTime] = useState("unknown");
  const [timezone, setTimezone] = useState(detectTimezone);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompatibilityResponse | null>(null);

  const t = UI[locale];
  const timezoneOptions = useMemo(() => {
    const set = new Set<string>([...COMMON_TIMEZONES, timezone]);
    return Array.from(set);
  }, [timezone]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextLocale = params.get("locale");
    const nextSpecies = params.get("species");
    const nextPetGender = params.get("petGender");
    const nextName = params.get("petName");
    const nextBirthDate = params.get("birthDate");
    const nextBirthTime = params.get("birthTime");
    const nextTimezone = params.get("timezone");

    if (isLocale(nextLocale)) setLocale(nextLocale);
    if (isSpecies(nextSpecies)) setSpecies(nextSpecies);
    if (isGender(nextPetGender)) setPetGender(nextPetGender);
    if (nextName) setPetName(nextName);
    if (nextBirthDate) setPetBirthDate(nextBirthDate);
    if (isBirthTimeOption(nextBirthTime)) setPetBirthTime(nextBirthTime);
    if (nextTimezone) setTimezone(nextTimezone);
  }, []);

  if (configured && ready && isAnonymous) {
    return (
      <div className="pastel-card p-6 text-center">
        <p className="text-sm text-plum/70">
          {locale === "ko" ? "궁합을 보려면 로그인이 필요해요." : "Please log in to check compatibility."}
        </p>
        <Link
          href="/login"
          className="mt-4 inline-flex rounded-full bg-channel-saju px-6 py-3 text-sm font-semibold text-white transition hover:brightness-105"
        >
          {locale === "ko" ? "로그인하기" : "Log in"}
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!consent) {
      setError(t.errorConsent);
      return;
    }

    const petTime = parseBirthTimeSelect(petBirthTime);
    const ownerTime = parseBirthTimeSelect(ownerBirthTime);

    setLoading(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const res = await fetch("/api/saju/compatibility", {
        method: "POST",
        headers,
        body: JSON.stringify({
          petName,
          ownerName,
          species,
          petGender,
          ownerGender,
          petBirthDate,
          ownerBirthDate,
          petBirthTime: petTime.birthTime,
          petBirthTimeUnknown: petTime.birthTimeUnknown,
          ownerBirthTime: ownerTime.birthTime,
          ownerBirthTimeUnknown: ownerTime.birthTimeUnknown,
          timezone,
          locale,
          privacyConsent: consent,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error");
        return;
      }
      setResult(data as CompatibilityResponse);
    } catch {
      setError(locale === "ko" ? "네트워크 오류" : "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="pastel-card space-y-6 p-6">
        <div className="flex gap-3">
          <label className="block flex-1 text-sm font-medium text-plum/80">
            {t.localeLabel}
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              className="pastel-input"
            >
              <option value="ko">한국어</option>
              <option value="en">English</option>
            </select>
          </label>
          <label className="block flex-1 text-sm font-medium text-plum/80">
            {t.species}
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

        <fieldset className="space-y-3 rounded-2xl border border-channel-saju/20 bg-lavender/15 p-4">
          <legend className="px-2 text-sm font-bold text-channel-saju">
            🐾 {t.petSection}
          </legend>
          <label className="block text-sm font-medium text-plum/80">
            {t.petName}
            <input
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              className="pastel-input"
              required
              maxLength={32}
            />
          </label>
          <label className="block text-sm font-medium text-plum/80">
            {t.gender}
            <select
              value={petGender}
              onChange={(e) => setPetGender(e.target.value as Gender | "")}
              className="pastel-input"
              required
            >
              <option value="">{t.selectGender}</option>
              <option value="male">{t.petMale}</option>
              <option value="female">{t.petFemale}</option>
            </select>
          </label>
          <BirthDateSelect
            value={petBirthDate}
            onChange={setPetBirthDate}
            label={t.birthDate}
            locale={locale}
          />
          <label className="block text-sm font-medium text-plum/80">
            {t.birthTime}
            <select
              value={petBirthTime}
              onChange={(e) => setPetBirthTime(e.target.value)}
              className="pastel-input"
            >
              {BIRTH_TIME_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {getBirthTimeOptionLabel(o, locale)}
                </option>
              ))}
            </select>
          </label>
        </fieldset>

        <fieldset className="space-y-3 rounded-2xl border border-plum/15 bg-white/40 p-4">
          <legend className="px-2 text-sm font-bold text-plum">💞 {t.ownerSection}</legend>
          <label className="block text-sm font-medium text-plum/80">
            {t.ownerName}
            <input
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="pastel-input"
              placeholder="집사"
              required
              maxLength={32}
            />
          </label>
          <label className="block text-sm font-medium text-plum/80">
            {t.gender}
            <select
              value={ownerGender}
              onChange={(e) => setOwnerGender(e.target.value as Gender | "")}
              className="pastel-input"
              required
            >
              <option value="">{t.selectGender}</option>
              <option value="male">{t.ownerMale}</option>
              <option value="female">{t.ownerFemale}</option>
            </select>
          </label>
          <BirthDateSelect
            value={ownerBirthDate}
            onChange={setOwnerBirthDate}
            label={t.birthDate}
            locale={locale}
          />
          <label className="block text-sm font-medium text-plum/80">
            {t.birthTime}
            <select
              value={ownerBirthTime}
              onChange={(e) => setOwnerBirthTime(e.target.value)}
              className="pastel-input"
            >
              {BIRTH_TIME_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {getBirthTimeOptionLabel(o, locale)}
                </option>
              ))}
            </select>
          </label>
        </fieldset>

        <label className="block text-sm font-medium text-plum/80">
          {t.timezone}
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="pastel-input"
          >
            {timezoneOptions.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </label>

        <PrivacyConsent checked={consent} onChange={setConsent} locale={locale} variant="pastel" />

        {error && (
          <p className="rounded-2xl bg-petal/40 px-4 py-2 text-sm text-plum" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-channel-saju py-3.5 text-sm font-semibold text-white transition hover:brightness-105 disabled:opacity-60"
        >
          {loading ? t.loading : t.submit}
        </button>
      </form>

      {result && <CompatibilityResult result={result} isGuest={isAnonymous} />}
    </div>
  );
}
