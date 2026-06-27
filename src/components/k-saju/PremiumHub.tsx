"use client";

import { BirthDateSelect } from "@/components/k-saju/BirthDateSelect";
import { CompatibilityResult } from "@/components/k-saju/CompatibilityResult";
import { PremiumMbtiReport } from "@/components/k-saju/PremiumMbtiReport";
import { ZodiacResult } from "@/components/k-saju/ZodiacResult";
import { COMMUNITY_SOLID_SURFACE_CLASS } from "@/components/community/CommunityDetailSurface";
import { PrivacyConsent } from "@/components/legal/PrivacyConsent";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { Link } from "@/i18n/navigation";
import {
  BIRTH_TIME_OPTIONS,
  getBirthTimeOptionLabel,
  parseBirthTimeSelect,
} from "@/lib/saju/birth-time-options";
import type { CompatibilityResponse } from "@/lib/saju/compatibility/engine";
import {
  buildPetMbtiPremiumInsight,
  buildPetMbtiResultFromType,
} from "@/lib/pet/mbti-inference";
import type { ZodiacFortuneResponse } from "@/lib/saju/zodiac/engine";
import { COMMON_TIMEZONES } from "@/lib/saju/timezone";
import type { Gender, Locale, Species } from "@/lib/saju/types";
import { useLocale } from "next-intl";
import { useEffect, useMemo, useState } from "react";

export type PremiumHubProfile = {
  petName: string;
  species: Species;
  petGender: Gender;
  petBirthDate: string;
  petBirthTime: string | null;
  petBirthTimeUnknown: boolean;
  ownerName: string;
  ownerGender: Gender;
  ownerBirthDate: string;
  ownerBirthTime: string | null;
  ownerBirthTimeUnknown: boolean;
  timezone: string;
  locale: Locale;
  petId: string | null;
  mbtiType: string | null;
  privacyConsent: boolean;
};

const UI = {
  ko: {
    intro: "궁합을 보려면 간단한 정보를 입력해 주세요.",
    petSection: "반려동물 (사주에서 가져옴)",
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
    submit: "입력 완료",
    errorConsent: "개인정보 동의가 필요합니다.",
    ownerBirthNotice:
      "생년월일 저장에 동의하시면 로그인할 때마다 오늘의 운세를 점쳐드립니다.",
    menuTitle: "프리미엄 결과 보기",
    menuSubtitle: "원하는 항목을 하나씩 눌러 확인하세요.",
    btnCompatibility: "집사와의 궁합 보기",
    btnZodiac: "별자리 운세 보기",
    btnMbti: "상세 MBTI 보기",
    editButler: "집사 정보 수정",
    backToMenu: "← 프리미엄 결과 목록으로",
    loginRequired: "프리미엄을 보려면 로그인이 필요해요.",
    login: "로그인하기",
    missingPet: "펫 정보가 없어요. 사주를 먼저 본 뒤 결제해 주세요.",
    backSaju: "← 사주 보기",
    backMenu: "← 목록으로",
    loading: "불러오는 중…",
    networkError: "네트워크 오류가 발생했어요.",
    premiumRequired: "프리미엄 결제가 필요해요.",
    mbtiMissing:
      "MBTI 설문을 완료하지 않았어요. 사주 페이지에서 MBTI를 완료한 뒤 다시 시도해 주세요.",
  },
  en: {
    intro: "Enter a few details about you (the butler) to unlock premium readings.",
    petSection: "Pet (from your K-Saju reading)",
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
    submit: "Continue",
    errorConsent: "Privacy consent is required.",
    ownerBirthNotice:
      "If you agree to save your birth date, we will show a small daily fortune whenever you log in.",
    menuTitle: "Your premium readings",
    menuSubtitle: "Tap each item to view one at a time.",
    btnCompatibility: "Pet & butler bond",
    btnZodiac: "Zodiac fortune",
    btnMbti: "Detailed MBTI",
    editButler: "Edit butler details",
    backToMenu: "← Back to premium menu",
    loginRequired: "Please log in to view premium content.",
    login: "Log in",
    missingPet: "Missing pet info. Complete K-Saju and payment first.",
    backSaju: "← K-Saju",
    backMenu: "← Back to menu",
    loading: "Loading…",
    networkError: "Network error. Please try again.",
    premiumRequired: "Premium payment required.",
    mbtiMissing:
      "Complete the MBTI survey on the K-Saju page, then try again.",
  },
};

const FIELD_LABEL_CLASS = "block text-sm font-bold text-primary";
const STITCH_INPUT_CLASS =
  "pastel-input mt-2 w-full rounded-[2rem] border-transparent bg-sand/50 px-4 py-3.5 text-sm text-on-surface focus:ring-primary/20";
const FORM_ERROR_CLASS =
  "rounded-2xl border border-red-300/70 bg-white/95 px-4 py-2.5 text-sm font-semibold text-red-800 shadow-sm";

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

function formatPetBirthTime(value: string, locale: Locale): string {
  const option = BIRTH_TIME_OPTIONS.find((o) => o.value === value);
  if (!option) return value;
  return getBirthTimeOptionLabel(option, locale);
}

type ActiveView = "compatibility" | "zodiac" | "mbti" | null;

export function PremiumHub() {
  const { ready, configured, isAnonymous, accessToken } = useSupabaseSession();
  const routeLocale = useLocale();

  const [locale, setLocale] = useState<Locale>(routeLocale === "en" ? "en" : "ko");
  const [phase, setPhase] = useState<"form" | "menu">("form");
  const [profile, setProfile] = useState<PremiumHubProfile | null>(null);

  const [petName, setPetName] = useState("");
  const [species, setSpecies] = useState<Species>("dog");
  const [petGender, setPetGender] = useState<Gender>("female");
  const [petBirthDate, setPetBirthDate] = useState("");
  const [petBirthTime, setPetBirthTime] = useState("unknown");
  const [petId, setPetId] = useState<string | null>(null);
  const [mbtiType, setMbtiType] = useState<string | null>(null);

  const [activeView, setActiveView] = useState<ActiveView>(null);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [compatibilityResult, setCompatibilityResult] =
    useState<CompatibilityResponse | null>(null);
  const [zodiacResult, setZodiacResult] = useState<ZodiacFortuneResponse | null>(null);

  const [ownerName, setOwnerName] = useState("");
  const [ownerGender, setOwnerGender] = useState<Gender | "">("");
  const [ownerBirthDate, setOwnerBirthDate] = useState("");
  const [ownerBirthTime, setOwnerBirthTime] = useState("unknown");
  const [timezone, setTimezone] = useState(detectTimezone);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    const nextPetId = params.get("petId");

    if (isLocale(nextLocale)) setLocale(nextLocale);
    if (isSpecies(nextSpecies)) setSpecies(nextSpecies);
    if (isGender(nextPetGender)) setPetGender(nextPetGender);
    if (nextName) setPetName(nextName);
    if (nextBirthDate) setPetBirthDate(nextBirthDate);
    if (isBirthTimeOption(nextBirthTime)) setPetBirthTime(nextBirthTime);
    if (nextTimezone) setTimezone(nextTimezone);
    if (nextPetId) setPetId(nextPetId);
    const nextMbtiType = params.get("mbtiType");
    if (nextMbtiType) setMbtiType(nextMbtiType);
  }, []);

  if (configured && ready && isAnonymous) {
    return (
      <div className={`${COMMUNITY_SOLID_SURFACE_CLASS} p-6 text-center`}>
        <p className="text-sm text-plum/70">{t.loginRequired}</p>
        <Link
          href="/login"
          className="mt-4 inline-flex rounded-full bg-channel-saju px-6 py-3 text-sm font-semibold text-white transition hover:brightness-105"
        >
          {t.login}
        </Link>
      </div>
    );
  }

  if (!petName.trim() || !petBirthDate) {
    return (
      <div className={`${COMMUNITY_SOLID_SURFACE_CLASS} space-y-4 p-6 text-center`}>
        <p className="text-sm text-plum/70">{t.missingPet}</p>
        <Link
          href="/saju"
          className="inline-flex rounded-full bg-channel-saju px-6 py-3 text-sm font-semibold text-white"
        >
          {t.backSaju}
        </Link>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!consent) {
      setError(t.errorConsent);
      return;
    }
    if (!ownerGender) {
      setError(t.selectGender);
      return;
    }

    const petTime = parseBirthTimeSelect(petBirthTime);
    const ownerTime = parseBirthTimeSelect(ownerBirthTime);

    const nextProfile: PremiumHubProfile = {
      petName: petName.trim(),
      species,
      petGender,
      petBirthDate,
      petBirthTime: petTime.birthTime,
      petBirthTimeUnknown: petTime.birthTimeUnknown,
      ownerName: ownerName.trim(),
      ownerGender,
      ownerBirthDate,
      ownerBirthTime: ownerTime.birthTime,
      ownerBirthTimeUnknown: ownerTime.birthTimeUnknown,
      timezone,
      locale,
      petId,
      mbtiType,
      privacyConsent: consent,
    };

    setProfile(nextProfile);
    setActiveView(null);
    setMenuError(null);
    setPhase("menu");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (phase === "menu" && profile) {
    const menuProfile = profile;

    async function loadCompatibility() {
      setActiveView("compatibility");
      setMenuError(null);
      if (compatibilityResult) return;

      setMenuLoading(true);
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

        const res = await fetch("/api/saju/compatibility", {
          method: "POST",
          headers,
          body: JSON.stringify({
            petName: menuProfile.petName,
            ownerName: menuProfile.ownerName,
            species: menuProfile.species,
            petGender: menuProfile.petGender,
            ownerGender: menuProfile.ownerGender,
            petBirthDate: menuProfile.petBirthDate,
            ownerBirthDate: menuProfile.ownerBirthDate,
            petBirthTime: menuProfile.petBirthTime,
            petBirthTimeUnknown: menuProfile.petBirthTimeUnknown,
            ownerBirthTime: menuProfile.ownerBirthTime,
            ownerBirthTimeUnknown: menuProfile.ownerBirthTimeUnknown,
            timezone: menuProfile.timezone,
            locale: menuProfile.locale,
            privacyConsent: menuProfile.privacyConsent,
            petId: menuProfile.petId,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setMenuError(
            data.error === "premium_required" ? t.premiumRequired : (data.error ?? t.networkError)
          );
          return;
        }
        setCompatibilityResult(data as CompatibilityResponse);
      } catch {
        setMenuError(t.networkError);
      } finally {
        setMenuLoading(false);
      }
    }

    async function loadZodiac() {
      setActiveView("zodiac");
      setMenuError(null);
      if (zodiacResult) return;

      setMenuLoading(true);
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

        const res = await fetch("/api/saju/zodiac", {
          method: "POST",
          headers,
          body: JSON.stringify({
            petName: menuProfile.petName,
            species: menuProfile.species,
            birthDate: menuProfile.petBirthDate,
            locale: menuProfile.locale,
            petId: menuProfile.petId,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setMenuError(
            data.error === "premium_required" ? t.premiumRequired : (data.error ?? t.networkError)
          );
          return;
        }
        setZodiacResult(data as ZodiacFortuneResponse);
      } catch {
        setMenuError(t.networkError);
      } finally {
        setMenuLoading(false);
      }
    }

    function loadMbti() {
      setActiveView("mbti");
      setMenuError(null);
      if (!menuProfile.mbtiType) {
        setMenuError(t.mbtiMissing);
      }
    }

    const mbtiResult = menuProfile.mbtiType
      ? buildPetMbtiResultFromType(menuProfile.mbtiType)
      : null;
    const mbtiInsight =
      mbtiResult && menuProfile.mbtiType
        ? buildPetMbtiPremiumInsight(mbtiResult, menuProfile.petName)
        : null;

    return (
      <div className="space-y-5 pb-32 md:pb-16">
        <section className={`${COMMUNITY_SOLID_SURFACE_CLASS} space-y-4 p-6 md:p-8`}>
          {!activeView ? (
            <>
              <div>
                <h2 className="text-lg font-extrabold text-primary">{t.menuTitle}</h2>
                <p className="mt-1 text-sm text-on-surface-variant">{t.menuSubtitle}</p>
              </div>
              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={() => void loadCompatibility()}
                  disabled={menuLoading}
                  className="w-full rounded-full bg-primary py-4 text-sm font-bold text-white shadow-lg shadow-primary/15 transition hover:bg-primary/90 disabled:opacity-60"
                >
                  {t.btnCompatibility}
                </button>
                <button
                  type="button"
                  onClick={() => void loadZodiac()}
                  disabled={menuLoading}
                  className="w-full rounded-full border-2 border-channel-saju/40 bg-white py-4 text-sm font-bold text-primary transition hover:bg-channel-saju/10 disabled:opacity-60"
                >
                  {t.btnZodiac}
                </button>
                <button
                  type="button"
                  onClick={loadMbti}
                  disabled={menuLoading}
                  className="w-full rounded-full border-2 border-plum/20 bg-white py-4 text-sm font-bold text-plum transition hover:bg-petal/30 disabled:opacity-60"
                >
                  {t.btnMbti}
                </button>
              </div>
            </>
          ) : (
            <>
              {menuLoading && (
                <p className="text-sm text-on-surface-variant">{t.loading}</p>
              )}
              {menuError && (
                <p className={FORM_ERROR_CLASS} role="alert">
                  {menuError}
                </p>
              )}
              {activeView === "compatibility" && compatibilityResult && !menuLoading && (
                <CompatibilityResult result={compatibilityResult} isGuest={false} />
              )}
              {activeView === "zodiac" && zodiacResult && !menuLoading && (
                <ZodiacResult result={zodiacResult} />
              )}
              {activeView === "mbti" && mbtiInsight && !menuError && (
                <PremiumMbtiReport insight={mbtiInsight} locale={menuProfile.locale} />
              )}
            </>
          )}
          {activeView ? (
            <button
              type="button"
              onClick={() => {
                setActiveView(null);
                setMenuError(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="w-full rounded-full border-2 border-channel-saju/40 bg-gradient-to-r from-lavender/50 via-white to-mint/40 py-3.5 text-sm font-bold text-primary shadow-md transition hover:border-channel-saju hover:shadow-lg"
            >
              {t.backToMenu}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setPhase("form");
                setActiveView(null);
              }}
              className="w-full py-2 text-sm font-semibold text-on-surface-variant underline"
            >
              {t.editButler}
            </button>
          )}
        </section>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`${COMMUNITY_SOLID_SURFACE_CLASS} space-y-6 p-6 md:p-8`}
    >
      <p className="text-sm leading-relaxed text-on-surface-variant">{t.intro}</p>

      <fieldset className="space-y-3 rounded-[2rem] border border-channel-saju/20 bg-sand/40 p-5">
        <legend className="px-2 text-sm font-bold text-primary">🐾 {t.petSection}</legend>
        <dl className="grid gap-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-on-surface-variant">{t.petName}</dt>
            <dd className="font-semibold text-primary">{petName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-on-surface-variant">{t.species}</dt>
            <dd className="font-semibold text-primary">{t[species]}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-on-surface-variant">{t.gender}</dt>
            <dd className="font-semibold text-primary">
              {petGender === "male" ? t.petMale : t.petFemale}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-on-surface-variant">{t.birthDate}</dt>
            <dd className="font-semibold text-primary">{petBirthDate}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-on-surface-variant">{t.birthTime}</dt>
            <dd className="font-semibold text-primary">
              {formatPetBirthTime(petBirthTime, locale)}
            </dd>
          </div>
        </dl>
      </fieldset>

      <fieldset className="space-y-4 rounded-[2rem] border border-plum/15 bg-white p-5">
        <legend className="px-2 text-sm font-bold text-primary">💞 {t.ownerSection}</legend>
        <p className="rounded-2xl bg-sand/50 px-4 py-2 text-xs leading-relaxed text-on-surface-variant">
          {t.ownerBirthNotice}
        </p>
        <label className={FIELD_LABEL_CLASS}>
          {t.ownerName}
          <input
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            className={STITCH_INPUT_CLASS}
            placeholder={locale === "ko" ? "집사" : "Butler"}
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
        <p className={FORM_ERROR_CLASS} role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="w-full rounded-full bg-primary py-4 text-sm font-bold text-white shadow-lg shadow-primary/15 transition hover:bg-primary/90 active:scale-[0.98]"
      >
        {t.submit}
      </button>
    </form>
  );
}
