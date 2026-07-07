"use client";

import { ReportGenerateLoader } from "@/components/human-premium/ReportGenerateLoader";
import { BirthCalendarToggle } from "@/components/k-saju/BirthCalendarToggle";
import { BirthDateSelect } from "@/components/k-saju/BirthDateSelect";
import { CompatibilityResult } from "@/components/k-saju/CompatibilityResult";
import { PetPremiumPdfSaveRow } from "@/components/k-saju/PetPremiumPdfSaveRow";
import { PremiumMbtiReport } from "@/components/k-saju/PremiumMbtiReport";
import { PremiumMbtiSurvey } from "@/components/k-saju/PremiumMbtiSurvey";
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
  buildPetMbtiResult,
  buildPetMbtiResultFromType,
  isPetMbtiComplete,
  scoresFromAnswers,
  type PetMbtiPremiumInsight,
  type PetMbtiResult,
} from "@/lib/pet/mbti-inference";
import type { ZodiacFortuneResponse } from "@/lib/saju/zodiac/engine";
import { COMMON_TIMEZONES } from "@/lib/saju/timezone";
import type { PetPremiumPdfRequest } from "@/lib/reports/pet-premium/types";
import { computeBasicSaju } from "@/lib/saju/engine";
import type { BirthCalendarType, Gender, Locale, Species } from "@/lib/saju/types";
import { useLocale } from "next-intl";
import { useEffect, useMemo, useState } from "react";

type ButlerSession = {
  ownerName: string;
  ownerGender: Gender;
  ownerBirthDate: string;
  ownerCalendarType: BirthCalendarType;
  ownerBirthTime: string | null;
  ownerBirthTimeUnknown: boolean;
  timezone: string;
  privacyConsent: boolean;
};

type PetContext = {
  petName: string;
  species: Species;
  petGender: Gender;
  petBirthDate: string;
  petCalendarType: BirthCalendarType;
  petBirthTime: string | null;
  petBirthTimeUnknown: boolean;
  timezone: string;
  locale: Locale;
  petId: string | null;
};

type HubPhase = "menu" | "butler-form";
type ActiveView = "mbti" | "zodiac" | "compatibility" | null;

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
    reptile: "렙타일",
    other: "그외친구들",
    birthDate: "생년월일",
    birthTime: "출생 시간",
    timezone: "출생 지역 시간대",
    butlerIntro: "궁합을 보려면 집사 정보를 입력해 주세요.",
    butlerSubmit: "궁합 보기",
    butlerCancel: "← 목록으로",
    errorConsent: "개인정보 동의가 필요합니다.",
    menuTitle: "프리미엄 결과 보기",
    menuSubtitle: "항목을 순서대로 눌러 확인하세요.",
    btnMbti: "상세 MBTI 케어 보기",
    btnZodiac: "별자리 케어 가이드",
    btnCompatibility: "집사 궁합 케어",
    backToMenu: "← 프리미엄 결과 목록으로",
    loginRequired: "프리미엄을 보려면 로그인이 필요해요.",
    login: "로그인하기",
    missingPet: "펫 정보가 없어요. 사주를 먼저 본 뒤 결제해 주세요.",
    backSaju: "← 사주 보기",
    loading: "불러오는 중…",
    networkError: "네트워크 오류가 발생했어요.",
    premiumRequired: "프리미엄 결제가 필요해요.",
    mbtiTypeTitle: (name: string, type: string) => `${name}은(는) ${type}형이에요`,
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
    reptile: "Reptile",
    other: "Other friends",
    birthDate: "Birth date",
    birthTime: "Birth time",
    timezone: "Birth timezone",
    butlerIntro: "Enter your details to see pet–butler compatibility.",
    butlerSubmit: "View bond",
    butlerCancel: "← Back to menu",
    errorConsent: "Privacy consent is required.",
    menuTitle: "Your premium readings",
    menuSubtitle: "Tap each item in order to view.",
    btnMbti: "Detailed MBTI care",
    btnZodiac: "Zodiac care guide",
    btnCompatibility: "Pet & butler bond care",
    backToMenu: "← Back to premium menu",
    loginRequired: "Please log in to view premium content.",
    login: "Log in",
    missingPet: "Missing pet info. Complete K-Saju and payment first.",
    backSaju: "← K-Saju",
    loading: "Loading…",
    networkError: "Network error. Please try again.",
    premiumRequired: "Premium payment required.",
    mbtiTypeTitle: (name: string, type: string) => `${name} is ${type}`,
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

function isCalendarType(value: string | null): value is BirthCalendarType {
  return value === "solar" || value === "lunar";
}

function formatPetBirthTime(value: string, locale: Locale): string {
  const option = BIRTH_TIME_OPTIONS.find((o) => o.value === value);
  if (!option) return value;
  return getBirthTimeOptionLabel(option, locale);
}

export function PremiumHub() {
  const { ready, configured, isAnonymous, accessToken } = useSupabaseSession();
  const routeLocale = useLocale();

  const [locale, setLocale] = useState<Locale>(routeLocale === "en" ? "en" : "ko");
  const [phase, setPhase] = useState<HubPhase>("menu");
  const [pet, setPet] = useState<PetContext | null>(null);

  const [mbtiType, setMbtiType] = useState<string | null>(null);
  const [mbtiAnswers, setMbtiAnswers] = useState<Record<string, string>>({});
  const [mbtiResult, setMbtiResult] = useState<PetMbtiResult | null>(null);
  const [mbtiInsight, setMbtiInsight] = useState<PetMbtiPremiumInsight | null>(null);
  const [mbtiInsightLoading, setMbtiInsightLoading] = useState(false);

  const [butler, setButler] = useState<ButlerSession | null>(null);
  const [ownerName, setOwnerName] = useState("");
  const [ownerGender, setOwnerGender] = useState<Gender | "">("");
  const [ownerBirthDate, setOwnerBirthDate] = useState("");
  const [ownerCalendarType, setOwnerCalendarType] = useState<BirthCalendarType>("solar");
  const [ownerBirthTime, setOwnerBirthTime] = useState("unknown");
  const [timezone, setTimezone] = useState(detectTimezone);
  const [consent, setConsent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [activeView, setActiveView] = useState<ActiveView>(null);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [compatibilityResult, setCompatibilityResult] =
    useState<CompatibilityResponse | null>(null);
  const [zodiacResult, setZodiacResult] = useState<ZodiacFortuneResponse | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [deeplinkView, setDeeplinkView] = useState<ActiveView | null>(null);

  const t = UI[locale];
  const timezoneOptions = useMemo(() => {
    const set = new Set<string>([...COMMON_TIMEZONES, timezone]);
    return Array.from(set);
  }, [timezone]);

  const mbtiSurveyComplete = isPetMbtiComplete(mbtiAnswers);

  const dominantElement = useMemo(() => {
    if (!pet) return undefined;
    return computeBasicSaju({
      petName: pet.petName,
      species: pet.species,
      petGender: pet.petGender,
      birthDate: pet.petBirthDate,
      calendarType: pet.petCalendarType,
      birthTime: pet.petBirthTime,
      birthTimeUnknown: pet.petBirthTimeUnknown,
      timezone: pet.timezone,
      locale: pet.locale,
      privacyConsent: true,
    }).dominantElement;
  }, [pet]);

  const pdfContext = useMemo((): PetPremiumPdfRequest | null => {
    if (!pet) return null;
    return {
      petName: pet.petName,
      species: pet.species,
      petGender: pet.petGender,
      birthDate: pet.petBirthDate,
      calendarType: pet.petCalendarType,
      birthTime: pet.petBirthTime,
      birthTimeUnknown: pet.petBirthTimeUnknown,
      timezone: pet.timezone,
      locale: pet.locale,
      petId: pet.petId,
      mbtiType: mbtiType ?? undefined,
      mbtiAnswers: mbtiSurveyComplete ? mbtiAnswers : undefined,
      ownerName: butler?.ownerName,
      ownerGender: butler?.ownerGender,
      ownerBirthDate: butler?.ownerBirthDate,
      ownerCalendarType: butler?.ownerCalendarType,
      ownerBirthTime: butler?.ownerBirthTime,
      ownerBirthTimeUnknown: butler?.ownerBirthTimeUnknown,
      privacyConsent: butler?.privacyConsent,
    };
  }, [pet, butler, mbtiType, mbtiAnswers, mbtiSurveyComplete]);

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
    const nextPetId = params.get("petId");
    const nextMbtiType = params.get("mbtiType");
    const nextView = params.get("view");

    const resolvedLocale = isLocale(nextLocale) ? nextLocale : locale;
    if (isLocale(nextLocale)) setLocale(nextLocale);

    if (!nextName?.trim() || !nextBirthDate) {
      setInitialized(true);
      return;
    }

    const petTime = parseBirthTimeSelect(
      isBirthTimeOption(nextBirthTime) ? nextBirthTime : "unknown"
    );

    setPet({
      petName: nextName.trim(),
      species: isSpecies(nextSpecies) ? nextSpecies : "dog",
      petGender: isGender(nextPetGender) ? nextPetGender : "female",
      petBirthDate: nextBirthDate,
      petCalendarType: isCalendarType(nextCalendarType) ? nextCalendarType : "solar",
      petBirthTime: petTime.birthTime,
      petBirthTimeUnknown: petTime.birthTimeUnknown,
      timezone: nextTimezone ?? detectTimezone(),
      locale: resolvedLocale,
      petId: nextPetId,
    });

    if (nextTimezone) setTimezone(nextTimezone);
    if (nextMbtiType) {
      setMbtiType(nextMbtiType);
      setMbtiResult(buildPetMbtiResultFromType(nextMbtiType));
      setMbtiInsight(null);
    }
    if (nextView === "mbti" || nextView === "zodiac" || nextView === "compatibility") {
      setDeeplinkView(nextView);
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!pet || !deeplinkView) return;
    const petCtx = pet;

    if (deeplinkView === "mbti") {
      setActiveView("mbti");
      setPhase("menu");
      setDeeplinkView(null);
      return;
    }

    if (deeplinkView === "compatibility") {
      setDeeplinkView(null);
      if (!butler) {
        setPhase("butler-form");
        setActiveView(null);
        return;
      }

      setActiveView("compatibility");
      setPhase("menu");
      if (compatibilityResult) return;

      setMenuLoading(true);
      void (async () => {
        try {
          const headers: Record<string, string> = { "Content-Type": "application/json" };
          if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

          const res = await fetch("/api/saju/compatibility", {
            method: "POST",
            headers,
            body: JSON.stringify({
              petName: petCtx.petName,
              ownerName: butler.ownerName,
              species: petCtx.species,
              petGender: petCtx.petGender,
              ownerGender: butler.ownerGender,
              petBirthDate: petCtx.petBirthDate,
              ownerBirthDate: butler.ownerBirthDate,
              petCalendarType: petCtx.petCalendarType,
              ownerCalendarType: butler.ownerCalendarType,
              petBirthTime: petCtx.petBirthTime,
              petBirthTimeUnknown: petCtx.petBirthTimeUnknown,
              ownerBirthTime: butler.ownerBirthTime,
              ownerBirthTimeUnknown: butler.ownerBirthTimeUnknown,
              timezone: butler.timezone,
              locale: petCtx.locale,
              privacyConsent: butler.privacyConsent,
              petId: petCtx.petId,
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            setMenuError(
              data.error === "premium_required"
                ? UI[petCtx.locale].premiumRequired
                : (data.error ?? UI[petCtx.locale].networkError)
            );
            return;
          }
          setCompatibilityResult(data as CompatibilityResponse);
        } catch {
          setMenuError(UI[petCtx.locale].networkError);
        } finally {
          setMenuLoading(false);
        }
      })();
      return;
    }

    if (deeplinkView === "zodiac") {
      setActiveView("zodiac");
      setPhase("menu");
      setDeeplinkView(null);
      if (zodiacResult) return;

      setMenuLoading(true);
      void (async () => {
        try {
          const headers: Record<string, string> = { "Content-Type": "application/json" };
          if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

          const res = await fetch("/api/saju/zodiac", {
            method: "POST",
            headers,
            body: JSON.stringify({
              petName: petCtx.petName,
              species: petCtx.species,
              birthDate: petCtx.petBirthDate,
              calendarType: petCtx.petCalendarType,
              birthTime: petCtx.petBirthTime,
              birthTimeUnknown: petCtx.petBirthTimeUnknown,
              timezone: petCtx.timezone,
              locale: petCtx.locale,
              petId: petCtx.petId,
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            setMenuError(
              data.error === "premium_required" ? UI[petCtx.locale].premiumRequired : (data.error ?? UI[petCtx.locale].networkError)
            );
            return;
          }
          setZodiacResult(data as ZodiacFortuneResponse);
        } catch {
          setMenuError(UI[petCtx.locale].networkError);
        } finally {
          setMenuLoading(false);
        }
      })();
    }
  }, [pet, deeplinkView, butler, accessToken, zodiacResult, compatibilityResult]);

  useEffect(() => {
    if (!mbtiSurveyComplete || mbtiType) return;
    const result = buildPetMbtiResult(scoresFromAnswers(mbtiAnswers));
    setMbtiType(result.type);
    setMbtiResult(result);
    setMbtiInsight(null);
  }, [mbtiAnswers, mbtiSurveyComplete, mbtiType]);

  useEffect(() => {
    if (activeView !== "mbti" || !pet || !mbtiType || !mbtiResult || mbtiInsight || mbtiInsightLoading) {
      return;
    }

    const petCtx = pet;
    setMbtiInsightLoading(true);
    setMenuError(null);

    void (async () => {
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

        const res = await fetch("/api/saju/premium/mbti", {
          method: "POST",
          headers,
          body: JSON.stringify({
            petName: petCtx.petName,
            species: petCtx.species,
            petGender: petCtx.petGender,
            birthDate: petCtx.petBirthDate,
            calendarType: petCtx.petCalendarType,
            birthTime: petCtx.petBirthTime,
            birthTimeUnknown: petCtx.petBirthTimeUnknown,
            timezone: petCtx.timezone,
            locale: petCtx.locale,
            mbtiType,
            mbtiAnswers,
            petId: petCtx.petId,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setMenuError(
            data.error === "premium_required"
              ? UI[petCtx.locale].premiumRequired
              : (data.error ?? UI[petCtx.locale].networkError)
          );
          return;
        }
        setMbtiInsight(data as PetMbtiPremiumInsight);
      } catch {
        setMenuError(UI[petCtx.locale].networkError);
      } finally {
        setMbtiInsightLoading(false);
      }
    })();
  }, [activeView, pet, mbtiType, mbtiResult, mbtiInsight, mbtiInsightLoading, mbtiAnswers, accessToken]);

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

  if (!initialized) {
    return (
      <div className={`${COMMUNITY_SOLID_SURFACE_CLASS} p-6 text-center`}>
        <p className="text-sm text-on-surface-variant">{t.loading}</p>
      </div>
    );
  }

  if (!pet) {
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

  const petCtx = pet;

  function handleMbtiAnswer(questionId: string, optionId: string) {
    setMbtiAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  function openMbti() {
    setActiveView("mbti");
    setMenuError(null);
    setPhase("menu");
  }

  async function openZodiac() {
    setActiveView("zodiac");
    setMenuError(null);
    setPhase("menu");
    if (zodiacResult) return;

    setMenuLoading(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const res = await fetch("/api/saju/zodiac", {
        method: "POST",
        headers,
        body: JSON.stringify({
          petName: petCtx.petName,
          species: petCtx.species,
          birthDate: petCtx.petBirthDate,
          calendarType: petCtx.petCalendarType,
          birthTime: petCtx.petBirthTime,
          birthTimeUnknown: petCtx.petBirthTimeUnknown,
          timezone: petCtx.timezone,
          locale: petCtx.locale,
          petId: petCtx.petId,
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

  function openCompatibility() {
    setMenuError(null);
    if (!butler) {
      setPhase("butler-form");
      setActiveView(null);
      return;
    }
    void fetchCompatibility(butler);
  }

  async function fetchCompatibility(session: ButlerSession) {
    setActiveView("compatibility");
    setPhase("menu");
    if (compatibilityResult) return;

    setMenuLoading(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const res = await fetch("/api/saju/compatibility", {
        method: "POST",
        headers,
        body: JSON.stringify({
          petName: petCtx.petName,
          ownerName: session.ownerName,
          species: petCtx.species,
          petGender: petCtx.petGender,
          ownerGender: session.ownerGender,
          petBirthDate: petCtx.petBirthDate,
          ownerBirthDate: session.ownerBirthDate,
          petCalendarType: petCtx.petCalendarType,
          ownerCalendarType: session.ownerCalendarType,
          petBirthTime: petCtx.petBirthTime,
          petBirthTimeUnknown: petCtx.petBirthTimeUnknown,
          ownerBirthTime: session.ownerBirthTime,
          ownerBirthTimeUnknown: session.ownerBirthTimeUnknown,
          timezone: session.timezone,
          locale: petCtx.locale,
          privacyConsent: session.privacyConsent,
          petId: petCtx.petId,
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

  function handleButlerSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!consent) {
      setFormError(t.errorConsent);
      return;
    }
    if (!ownerGender) {
      setFormError(t.selectGender);
      return;
    }

    const ownerTime = parseBirthTimeSelect(ownerBirthTime);
    const session: ButlerSession = {
      ownerName: ownerName.trim() || (locale === "ko" ? "집사" : "Butler"),
      ownerGender,
      ownerBirthDate,
      ownerCalendarType,
      ownerBirthTime: ownerTime.birthTime,
      ownerBirthTimeUnknown: ownerTime.birthTimeUnknown,
      timezone,
      privacyConsent: consent,
    };

    setButler(session);
    void fetchCompatibility(session);
  }

  const reportGenerating = menuLoading || mbtiInsightLoading;

  if (phase === "butler-form") {
    return (
      <form
        onSubmit={handleButlerSubmit}
        className={`${COMMUNITY_SOLID_SURFACE_CLASS} space-y-6 p-6 md:p-8`}
      >
        <p className="text-sm leading-relaxed text-on-surface-variant">{t.butlerIntro}</p>

        <fieldset className="space-y-3 rounded-[2rem] border border-channel-saju/20 bg-sand/40 p-5">
          <legend className="px-2 text-sm font-bold text-primary">🐾 {t.petSection}</legend>
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-on-surface-variant">{t.petName}</dt>
              <dd className="font-semibold text-primary">{pet.petName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-on-surface-variant">{t.species}</dt>
              <dd className="font-semibold text-primary">{t[pet.species]}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-on-surface-variant">{t.birthDate}</dt>
              <dd className="font-semibold text-primary">{pet.petBirthDate}</dd>
            </div>
          </dl>
        </fieldset>

        <fieldset className="space-y-4 rounded-[2rem] border border-plum/15 bg-white p-5">
          <legend className="px-2 text-sm font-bold text-primary">💞 {t.ownerSection}</legend>
          <label className={FIELD_LABEL_CLASS}>
            {t.ownerName}
            <input
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className={STITCH_INPUT_CLASS}
              placeholder={locale === "ko" ? "집사" : "Butler"}
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

        {formError && (
          <p className={FORM_ERROR_CLASS} role="alert">
            {formError}
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-full bg-primary py-4 text-sm font-bold text-white shadow-lg shadow-primary/15 transition hover:bg-primary/90"
        >
          {t.butlerSubmit}
        </button>
        <button
          type="button"
          onClick={() => {
            setPhase("menu");
            setFormError(null);
          }}
          className="w-full py-2 text-sm font-semibold text-on-surface-variant underline"
        >
          {t.butlerCancel}
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-5 pb-32 md:pb-16">
      <ReportGenerateLoader isKo={locale === "ko"} active={reportGenerating} />
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
                onClick={openMbti}
                disabled={menuLoading}
                className="w-full rounded-full bg-primary py-4 text-sm font-bold text-white shadow-lg shadow-primary/15 transition hover:bg-primary/90 disabled:opacity-60"
              >
                {t.btnMbti}
              </button>
              <button
                type="button"
                onClick={() => void openZodiac()}
                disabled={menuLoading}
                className="w-full rounded-full border-2 border-channel-saju/40 bg-white py-4 text-sm font-bold text-primary transition hover:bg-channel-saju/10 disabled:opacity-60"
              >
                {t.btnZodiac}
              </button>
              <button
                type="button"
                onClick={openCompatibility}
                disabled={menuLoading}
                className="w-full rounded-full border-2 border-plum/20 bg-white py-4 text-sm font-bold text-plum transition hover:bg-petal/30 disabled:opacity-60"
              >
                {t.btnCompatibility}
              </button>
            </div>
          </>
        ) : (
          <>
            {menuLoading && !reportGenerating && (
              <p className="text-sm text-on-surface-variant">{t.loading}</p>
            )}
            {menuError && (
              <p className={FORM_ERROR_CLASS} role="alert">
                {menuError}
              </p>
            )}
            {activeView === "mbti" && !mbtiType && !menuError && (
              <PremiumMbtiSurvey
                locale={locale}
                answers={mbtiAnswers}
                onSelect={handleMbtiAnswer}
              />
            )}
            {activeView === "mbti" && mbtiType && mbtiResult && mbtiInsight && !menuError && (
              <div className="space-y-4">
                <article className="rounded-[2rem] border border-channel-saju/25 bg-channel-saju/5 p-5 text-center">
                  <p className="text-lg font-extrabold text-primary">
                    {t.mbtiTypeTitle(pet.petName, mbtiType)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-plum">
                    {locale === "ko" ? mbtiResult.titleKo : mbtiResult.titleEn}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                    {locale === "ko" ? mbtiResult.summaryKo : mbtiResult.summaryEn}
                  </p>
                </article>
                <PremiumMbtiReport
                  insight={mbtiInsight}
                  locale={locale}
                  dominantElement={dominantElement}
                />
                {pdfContext ? (
                  <PetPremiumPdfSaveRow
                    locale={locale}
                    context={pdfContext}
                    accessToken={accessToken}
                  />
                ) : null}
              </div>
            )}
            {activeView === "zodiac" && zodiacResult && !menuLoading && (
              <ZodiacResult
                result={zodiacResult}
                shareMode="pdf"
                pdfContext={pdfContext ?? undefined}
                accessToken={accessToken}
              />
            )}
            {activeView === "compatibility" && compatibilityResult && !menuLoading && (
              <CompatibilityResult
                result={compatibilityResult}
                isGuest={false}
                shareMode="pdf"
                pdfContext={pdfContext ?? undefined}
                accessToken={accessToken}
              />
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
        ) : null}
      </section>
    </div>
  );
}
