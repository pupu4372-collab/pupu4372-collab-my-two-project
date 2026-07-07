"use client";

import { ReportGenerateLoader } from "@/components/human-premium/ReportGenerateLoader";
import { BirthCalendarToggle } from "@/components/k-saju/BirthCalendarToggle";
import { BirthDateSelect } from "@/components/k-saju/BirthDateSelect";
import { COMMUNITY_SOLID_SURFACE_CLASS } from "@/components/community/CommunityDetailSurface";
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
import type { BirthCalendarType, Gender, Locale, Species } from "@/lib/saju/types";
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
    other: "다른 동물",
    birthDate: "생년월일",
    birthTime: "출생 시간",
    timezone: "출생 지역 시간대",
    submit: "궁합 보기",
    loading: "인연 계산 중…",
    errorConsent: "개인정보 동의가 필요합니다.",
    localeLabel: "언어",
    ownerBirthNotice:
      "로그인하면 매일 달라지는 맞춤 케어 팁을 받아보실 수 있어요",
    premiumRequired: "이 기능은 프리미엄 전용이에요. 결제 후 이용할 수 있어요.",
    goToPay: "결제하러 가기 →",
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
    other: "Other pet",
    birthDate: "Birth date",
    birthTime: "Birth time",
    timezone: "Birth timezone",
    submit: "Check our bond",
    loading: "Reading the bond…",
    errorConsent: "Privacy consent required.",
    localeLabel: "Language",
    ownerBirthNotice:
      "Log in to get personalized care tips that update every day.",
    premiumRequired: "This feature requires premium. Please complete payment to continue.",
    goToPay: "Go to payment →",
  },
};

const FIELD_LABEL_CLASS = "block text-sm font-bold text-primary";
const STITCH_INPUT_CLASS =
  "pastel-input mt-2 w-full rounded-[2rem] border-transparent bg-sand/50 px-4 py-3.5 text-sm text-on-surface focus:ring-primary/20";

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
  return value === "dog" || value === "cat" || value === "other";
}

function isGender(value: string | null): value is Gender {
  return value === "male" || value === "female";
}

function isBirthTimeOption(value: string | null): value is string {
  return Boolean(value && BIRTH_TIME_OPTIONS.some((option) => option.value === value));
}

function isCalendarType(value: string | null): value is BirthCalendarType {
  return value === "solar" || value === "lunar";
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
  const [petCalendarType, setPetCalendarType] = useState<BirthCalendarType>("solar");
  const [ownerCalendarType, setOwnerCalendarType] = useState<BirthCalendarType>("solar");
  const [petBirthTime, setPetBirthTime] = useState("unknown");
  const [ownerBirthTime, setOwnerBirthTime] = useState("unknown");
  const [timezone, setTimezone] = useState(detectTimezone);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompatibilityResponse | null>(null);
  const [petId, setPetId] = useState<string | null>(null);

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
    const nextCalendarType = params.get("calendarType");
    const nextBirthTime = params.get("birthTime");
    const nextTimezone = params.get("timezone");

    if (isLocale(nextLocale)) setLocale(nextLocale);
    if (isSpecies(nextSpecies)) setSpecies(nextSpecies);
    if (isGender(nextPetGender)) setPetGender(nextPetGender);
    if (nextName) setPetName(nextName);
    if (nextBirthDate) setPetBirthDate(nextBirthDate);
    if (isCalendarType(nextCalendarType)) setPetCalendarType(nextCalendarType);
    if (isBirthTimeOption(nextBirthTime)) setPetBirthTime(nextBirthTime);
    if (nextTimezone) setTimezone(nextTimezone);

    const nextPetId = params.get("petId");
    if (nextPetId) setPetId(nextPetId);
  }, []);

  if (configured && ready && isAnonymous) {
    return (
      <div className={`${COMMUNITY_SOLID_SURFACE_CLASS} p-6 text-center`}>
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
          petCalendarType,
          ownerCalendarType,
          petBirthTime: petTime.birthTime,
          petBirthTimeUnknown: petTime.birthTimeUnknown,
          ownerBirthTime: ownerTime.birthTime,
          ownerBirthTimeUnknown: ownerTime.birthTimeUnknown,
          timezone,
          locale,
          privacyConsent: consent,
          petId: petId ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "premium_required") {
          setError("premium_required");
        } else {
          setError(data.error ?? "Error");
        }
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
      <ReportGenerateLoader isKo={locale === "ko"} active={loading} />
      <form onSubmit={handleSubmit} className={`${COMMUNITY_SOLID_SURFACE_CLASS} space-y-7 p-6 md:p-8`}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={FIELD_LABEL_CLASS}>
            {t.localeLabel}
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              className={STITCH_INPUT_CLASS}
            >
              <option value="ko">한국어</option>
              <option value="en">English</option>
            </select>
          </label>
          <fieldset className="space-y-3 sm:col-span-2">
            <legend className="flex items-center gap-2 text-sm font-bold text-primary">
              <span aria-hidden>🐾</span>
              {t.species}
            </legend>
            <div className="grid grid-cols-2 gap-3">
              {(["dog", "cat", "other"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSpecies(item)}
                  className={
                    species === item
                      ? "rounded-[2rem] border border-primary bg-primary px-4 py-4 text-center text-white shadow-lg shadow-primary/15"
                      : "rounded-[2rem] border border-white/35 bg-white px-4 py-4 text-center text-primary transition hover:bg-sand/40"
                  }
                  aria-pressed={species === item}
                >
                  <span className="block text-3xl" aria-hidden>
                    {item === "dog" ? "🐶" : item === "cat" ? "🐱" : "🐾"}
                  </span>
                  <span className="mt-2 block text-xs font-extrabold uppercase tracking-wide">
                    {t[item]}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <fieldset className="space-y-4 rounded-[2rem] border border-channel-saju/20 bg-sand/40 p-5">
          <legend className="px-2 text-sm font-bold text-primary">
            🐾 {t.petSection}
          </legend>
          <label className={FIELD_LABEL_CLASS}>
            {t.petName}
            <input
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              className={STITCH_INPUT_CLASS}
              required
              maxLength={32}
            />
          </label>
          <label className={FIELD_LABEL_CLASS}>
            {t.gender}
            <select
              value={petGender}
              onChange={(e) => setPetGender(e.target.value as Gender | "")}
              className={STITCH_INPUT_CLASS}
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
            className={FIELD_LABEL_CLASS}
            selectClassName={STITCH_INPUT_CLASS}
          />
          <BirthCalendarToggle
            value={petCalendarType}
            onChange={setPetCalendarType}
            locale={locale}
            compact
          />
          <label className={FIELD_LABEL_CLASS}>
            {t.birthTime}
            <select
              value={petBirthTime}
              onChange={(e) => setPetBirthTime(e.target.value)}
              className={STITCH_INPUT_CLASS}
            >
              {BIRTH_TIME_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {getBirthTimeOptionLabel(o, locale)}
                </option>
              ))}
            </select>
          </label>
        </fieldset>

        <fieldset className="space-y-4 rounded-[2rem] border border-plum/15 bg-white p-5">
          <legend className="px-2 text-sm font-bold text-primary">💞 {t.ownerSection}</legend>
          {isAnonymous ? (
            <p className="rounded-2xl bg-sand/50 px-4 py-2 text-xs leading-relaxed text-on-surface-variant">
              {t.ownerBirthNotice}
            </p>
          ) : null}
          <label className={FIELD_LABEL_CLASS}>
            {t.ownerName}
            <input
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className={STITCH_INPUT_CLASS}
              placeholder="집사"
              required
              maxLength={32}
            />
          </label>
          <label className={FIELD_LABEL_CLASS}>
            {t.gender}
            <select
              value={ownerGender}
              onChange={(e) => setOwnerGender(e.target.value as Gender | "")}
              className={STITCH_INPUT_CLASS}
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
            className={FIELD_LABEL_CLASS}
            selectClassName={STITCH_INPUT_CLASS}
          />
          <BirthCalendarToggle
            value={ownerCalendarType}
            onChange={setOwnerCalendarType}
            locale={locale}
            compact
          />
          <label className={FIELD_LABEL_CLASS}>
            {t.birthTime}
            <select
              value={ownerBirthTime}
              onChange={(e) => setOwnerBirthTime(e.target.value)}
              className={STITCH_INPUT_CLASS}
            >
              {BIRTH_TIME_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {getBirthTimeOptionLabel(o, locale)}
                </option>
              ))}
            </select>
          </label>
        </fieldset>

        <label className={FIELD_LABEL_CLASS}>
          {t.timezone}
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className={STITCH_INPUT_CLASS}
          >
            {timezoneOptions.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-[2rem] border border-white/35 bg-white p-5">
          <PrivacyConsent checked={consent} onChange={setConsent} locale={locale} variant="plain" />
        </div>

        {error && (
          error === "premium_required" ? (
            <div className="rounded-2xl bg-petal/40 px-4 py-3 text-sm text-plum space-y-2">
              <p>{t.premiumRequired}</p>
              <Link
                href={`/payment?product=pet_premium_v1&type=compatibility&petName=${encodeURIComponent(petName)}&species=${species}&birthDate=${petBirthDate}&calendarType=${petCalendarType}&locale=${locale}${petId ? `&petId=${petId}` : ""}`}
                className="inline-block font-bold text-primary underline"
              >
                {t.goToPay}
              </Link>
            </div>
          ) : (
            <p className="rounded-2xl bg-petal/40 px-4 py-2 text-sm text-plum" role="alert">
              {error}
            </p>
          )
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-primary py-4 text-sm font-bold text-white shadow-lg shadow-primary/15 transition hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? t.loading : t.submit}
        </button>
      </form>

      {result && <CompatibilityResult result={result} isGuest={isAnonymous} />}
    </div>
  );
}
