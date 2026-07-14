"use client";

import { ReportGenerateLoader } from "@/components/human-premium/ReportGenerateLoader";
import { BirthCalendarToggle } from "@/components/k-saju/BirthCalendarToggle";
import { BirthDateSelect } from "@/components/k-saju/BirthDateSelect";
import { CompatibilityResult } from "@/components/k-saju/CompatibilityResult";
import { PetPremiumPaywall } from "@/components/k-saju/PetPremiumPaywall";
import { PremiumHubBackToBasicLink } from "@/components/k-saju/PremiumHubBackToBasicLink";
import { PetPremiumPdfSaveRow } from "@/components/k-saju/PetPremiumPdfSaveRow";
import { PetPremiumUnlockSkeleton } from "@/components/k-saju/PetPremiumUnlockSkeleton";
import { ZodiacResult } from "@/components/k-saju/ZodiacResult";
import { COMMUNITY_SOLID_SURFACE_CLASS } from "@/components/community/CommunityDetailSurface";
import { PrivacyConsent } from "@/components/legal/PrivacyConsent";
import { usePetPremiumUnlock } from "@/hooks/usePetPremiumUnlock";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import type { PetPremiumReturnTo } from "@/lib/payments/pet-premium-unlock-client";
import { Link, useRouter } from "@/i18n/navigation";
import { fetchPetProfileForSaju, petProfileToSajuFormState } from "@/lib/pets/load-pet-for-saju";
import {
  BIRTH_TIME_OPTIONS,
  formatBirthTimeSummary,
  getBirthTimeOptionLabel,
  parseBirthTimeSelect,
} from "@/lib/saju/birth-time-options";
import type { CompatibilityResponse } from "@/lib/saju/compatibility/engine";
import type { ZodiacFortuneResponse } from "@/lib/saju/zodiac/engine";
import { COMMON_TIMEZONES } from "@/lib/saju/timezone";
import {
  EMPTY_PET_PREMIUM_SECTION_COMPLETION,
  type PetPremiumSectionCompletion,
} from "@/lib/reports/pet-premium/section-completion";
import type { BirthCalendarType, Gender, Locale, Species } from "@/lib/saju/types";
import { useLocale } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

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
  petBreed: string | null;
  petGender: Gender;
  petBirthDate: string;
  petBirthTime: string | null;
  petBirthTimeUnknown: boolean;
  timezone: string;
  locale: Locale;
  petId: string | null;
};

type HubPhase = "menu" | "butler-form";
type ActiveView = "zodiac" | "compatibility" | null;

const UI = {
  ko: {
    petSection: "반려동물",
    ownerSection: "집사 (나)",
    petName: "이름",
    ownerName: "이름",
    species: "종류",
    gender: "성별",
    petFemale: "암",
    petMale: "수",
    ownerMale: "남성",
    ownerFemale: "여성",
    selectGender: "성별 선택",
    dog: "강아지",
    cat: "고양이",
    reptile: "렙타일",
    other: "그외친구들",
    birthDate: "생년월일",
    birthTime: "출생 시간",
    birthTimeUnknown: "시간 모름",
    timezone: "출생 지역 시간대",
    butlerIntro: "궁합을 보려면 집사 정보를 입력해 주세요.",
    butlerSubmit: "궁합 보기",
    butlerCancel: "← 목록으로",
    errorConsent: "개인정보 동의가 필요합니다.",
    menuTitle: "프리미엄 결과 보기",
    menuSubtitle: "항목을 순서대로 눌러 확인하세요.",
    btnZodiac: "별자리 케어 가이드",
    btnCompatibility: "집사 궁합 케어",
    backToMenu: "← 프리미엄 결과 목록으로",
    loginRequired: "프리미엄을 보려면 로그인이 필요해요.",
    login: "로그인하기",
    missingPet: "펫 정보가 없어요. 사주를 먼저 본 뒤 결제해 주세요.",
    backSaju: "← 사주 보기",
    backBasicResult: "← 사주 결과로 돌아가기",
    loading: "불러오는 중…",
    networkError: "네트워크 오류가 발생했어요.",
    premiumRequired: "프리미엄 결제가 필요해요.",
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
    birthTimeUnknown: "Unknown",
    timezone: "Birth timezone",
    butlerIntro: "Enter your details to see pet–butler compatibility.",
    butlerSubmit: "View bond",
    butlerCancel: "← Back to menu",
    errorConsent: "Privacy consent is required.",
    menuTitle: "Your premium readings",
    menuSubtitle: "Tap each item in order to view.",
    btnZodiac: "Zodiac care guide",
    btnCompatibility: "Pet & butler bond care",
    backToMenu: "← Back to premium menu",
    loginRequired: "Please log in to view premium content.",
    login: "Log in",
    missingPet: "Missing pet info. Complete K-Saju and payment first.",
    backSaju: "← K-Saju",
    backBasicResult: "← Back to saju result",
    loading: "Loading…",
    networkError: "Network error. Please try again.",
    premiumRequired: "Premium payment required.",
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

export function PremiumHub() {
  const router = useRouter();
  const { ready, configured, isAnonymous, accessToken } = useSupabaseSession();
  const routeLocale = useLocale();
  const locale: Locale = routeLocale === "en" ? "en" : "ko";

  const [phase, setPhase] = useState<HubPhase>("menu");
  const [pet, setPet] = useState<PetContext | null>(null);

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
  const [premiumBlocked, setPremiumBlocked] = useState(false);
  const [premiumReturnTo, setPremiumReturnTo] = useState<PetPremiumReturnTo>("zodiac");
  const [sajuResultId, setSajuResultId] = useState<string | null>(null);
  const [storedCompletion, setStoredCompletion] = useState<PetPremiumSectionCompletion>(
    EMPTY_PET_PREMIUM_SECTION_COMPLETION
  );

  const refreshStoredCompletion = useCallback(
    async (targetPetId: string) => {
      if (!accessToken) return;
      try {
        const res = await fetch(
          `/api/saju/premium/sections?petId=${encodeURIComponent(targetPetId)}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!res.ok) return;
        const data = (await res.json()) as { completion?: PetPremiumSectionCompletion };
        if (data.completion) setStoredCompletion(data.completion);
      } catch {
        // keep previous completion snapshot
      }
    },
    [accessToken]
  );

  const syncPetIdAndRefreshCompletion = useCallback(
    (nextPetId: string | null | undefined) => {
      if (nextPetId) {
        setPet((current) => (current ? { ...current, petId: nextPetId } : current));
        void refreshStoredCompletion(nextPetId);
        return;
      }
      if (pet?.petId) void refreshStoredCompletion(pet.petId);
    },
    [pet?.petId, refreshStoredCompletion]
  );

  const unlockCheckEnabled = configured && ready && !isAnonymous;
  const { unlocked, loading: unlockLoading } = usePetPremiumUnlock(
    pet?.petId,
    accessToken,
    unlockCheckEnabled && Boolean(pet)
  );

  const t = UI[locale];
  const timezoneOptions = useMemo(() => {
    const set = new Set<string>([...COMMON_TIMEZONES, timezone]);
    return Array.from(set);
  }, [timezone]);

  useEffect(() => {
    if (!configured || !ready || isAnonymous || !pet?.petId || !accessToken) return;
    void refreshStoredCompletion(pet.petId);
  }, [configured, ready, isAnonymous, pet?.petId, accessToken, refreshStoredCompletion]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextSpecies = params.get("species");
    const nextPetGender = params.get("petGender");
    const nextName = params.get("petName");
    const nextBirthDate = params.get("birthDate");
    const nextBirthTime = params.get("birthTime");
    const nextTimezone = params.get("timezone");
    const nextPetId = params.get("petId");
    const nextView = params.get("view");
    const nextSajuResultId = params.get("sajuResultId");

    if (nextSajuResultId) setSajuResultId(nextSajuResultId);

    if (nextView === "mbti") {
      const mbtiParams = new URLSearchParams(params);
      mbtiParams.delete("view");
      router.replace(`/saju/mbti?${mbtiParams.toString()}`);
      return;
    }

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
      petBreed: null,
      petGender: isGender(nextPetGender) ? nextPetGender : "female",
      petBirthDate: nextBirthDate,
      petBirthTime: petTime.birthTime,
      petBirthTimeUnknown: petTime.birthTimeUnknown,
      timezone: nextTimezone ?? detectTimezone(),
      locale,
      petId: nextPetId,
    });

    if (nextTimezone) setTimezone(nextTimezone);
    if (nextView === "zodiac" || nextView === "compatibility") {
      setDeeplinkView(nextView);
      setPremiumReturnTo(nextView);
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!pet?.petId || !accessToken) return;

    let cancelled = false;
    void fetchPetProfileForSaju(accessToken, pet.petId).then((profile) => {
      if (cancelled || !profile) return;
      const form = petProfileToSajuFormState(profile);
      const petTime = parseBirthTimeSelect(form.birthTime);
      setPet((current) => {
        if (!current || current.petId !== profile.id) return current;
        return {
          ...current,
          petName: form.petName,
          species: form.species,
          petBreed: profile.breed,
          petGender: form.petGender,
          petBirthDate: form.birthDate,
          petBirthTime: petTime.birthTime,
          petBirthTimeUnknown: petTime.birthTimeUnknown,
          timezone: form.timezone,
        };
      });
    });

    return () => {
      cancelled = true;
    };
  }, [pet?.petId, accessToken]);

  useEffect(() => {
    if (!pet || !deeplinkView || !unlocked || premiumBlocked) return;
    const petCtx = pet;

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
              petCalendarType: "solar",
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
            if (data.error === "premium_required") {
              setPremiumBlocked(true);
              setPremiumReturnTo("compatibility");
              setActiveView(null);
            } else {
              setMenuError(data.error ?? UI[petCtx.locale].networkError);
            }
            return;
          }
          setCompatibilityResult(data as CompatibilityResponse);
          syncPetIdAndRefreshCompletion((data as CompatibilityResponse).petId);
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
              calendarType: "solar",
              birthTime: petCtx.petBirthTime,
              birthTimeUnknown: petCtx.petBirthTimeUnknown,
              timezone: petCtx.timezone,
              locale: petCtx.locale,
              petId: petCtx.petId,
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            if (data.error === "premium_required") {
              setPremiumBlocked(true);
              setPremiumReturnTo("zodiac");
              setActiveView(null);
            } else {
              setMenuError(data.error ?? UI[petCtx.locale].networkError);
            }
            return;
          }
          setZodiacResult(data as ZodiacFortuneResponse);
          syncPetIdAndRefreshCompletion((data as ZodiacFortuneResponse).petId);
        } catch {
          setMenuError(UI[petCtx.locale].networkError);
        } finally {
          setMenuLoading(false);
        }
      })();
    }
  }, [pet, deeplinkView, butler, accessToken, zodiacResult, compatibilityResult, unlocked, premiumBlocked]);

  function backToBasicResultLink(petId?: string | null) {
    return (
      <PremiumHubBackToBasicLink
        locale={locale}
        sajuResultId={sajuResultId}
        petId={petId ?? pet?.petId ?? null}
      />
    );
  }

  if (configured && ready && isAnonymous) {
    return (
      <div className="space-y-4">
        {backToBasicResultLink()}
        <div className={`${COMMUNITY_SOLID_SURFACE_CLASS} p-6 text-center`}>
        <p className="text-sm text-plum/70">{t.loginRequired}</p>
        <Link
          href="/login"
          className="mt-4 inline-flex rounded-full bg-channel-saju px-6 py-3 text-sm font-semibold text-white transition hover:brightness-105"
        >
          {t.login}
        </Link>
        </div>
      </div>
    );
  }

  if (!initialized) {
    return (
      <div className="space-y-4">
        {backToBasicResultLink()}
        <div className={`${COMMUNITY_SOLID_SURFACE_CLASS} p-6 text-center`}>
        <p className="text-sm text-on-surface-variant">{t.loading}</p>
      </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="space-y-4">
        {backToBasicResultLink()}
        <div className={`${COMMUNITY_SOLID_SURFACE_CLASS} space-y-4 p-6 text-center`}>
        <p className="text-sm text-plum/70">{t.missingPet}</p>
        <Link
          href="/saju"
          className="inline-flex rounded-full bg-channel-saju px-6 py-3 text-sm font-semibold text-white"
        >
          {t.backSaju}
        </Link>
        </div>
      </div>
    );
  }

  const petCtx = pet;

  const premiumContinuation = {
    petName: petCtx.petName,
    species: petCtx.species,
    petGender: petCtx.petGender,
    birthDate: petCtx.petBirthDate,
    birthTime: petCtx.petBirthTimeUnknown ? "unknown" : (petCtx.petBirthTime ?? "unknown"),
    timezone: petCtx.timezone,
    locale: petCtx.locale,
    petId: petCtx.petId,
    ...(sajuResultId ? { sajuResultId } : {}),
  };

  if (unlockCheckEnabled && unlockLoading) {
    return (
      <div className="space-y-4">
        {backToBasicResultLink(petCtx.petId)}
        <PetPremiumUnlockSkeleton />
      </div>
    );
  }

  if (premiumBlocked || (unlockCheckEnabled && !unlocked)) {
    return (
      <div className="space-y-4">
        {backToBasicResultLink(petCtx.petId)}
        <PetPremiumPaywall
        locale={petCtx.locale}
        continuation={premiumContinuation}
        returnTo={premiumReturnTo}
      />
      </div>
    );
  }

  async function openZodiac() {
    setPremiumReturnTo("zodiac");
    setPremiumBlocked(false);
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
          calendarType: "solar",
          birthTime: petCtx.petBirthTime,
          birthTimeUnknown: petCtx.petBirthTimeUnknown,
          timezone: petCtx.timezone,
          locale: petCtx.locale,
          petId: petCtx.petId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "premium_required") {
          setPremiumBlocked(true);
          setPremiumReturnTo("zodiac");
          setActiveView(null);
        } else {
          setMenuError(data.error ?? t.networkError);
        }
        return;
      }
      setZodiacResult(data as ZodiacFortuneResponse);
      syncPetIdAndRefreshCompletion((data as ZodiacFortuneResponse).petId);
    } catch {
      setMenuError(t.networkError);
    } finally {
      setMenuLoading(false);
    }
  }

  function openCompatibility() {
    setPremiumReturnTo("compatibility");
    setPremiumBlocked(false);
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
          petCalendarType: "solar",
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
        if (data.error === "premium_required") {
          setPremiumBlocked(true);
          setPremiumReturnTo("compatibility");
          setActiveView(null);
        } else {
          setMenuError(data.error ?? t.networkError);
        }
        return;
      }
      setCompatibilityResult(data as CompatibilityResponse);
      syncPetIdAndRefreshCompletion((data as CompatibilityResponse).petId);
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

  const reportGenerating = menuLoading;

  if (phase === "butler-form") {
    return (
      <div className="space-y-4">
        {backToBasicResultLink(petCtx.petId)}
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
              <dd className="text-right font-semibold text-primary">
                {pet.petBreed ? `${t[pet.species]} · ${pet.petBreed}` : t[pet.species]}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-on-surface-variant">{t.gender}</dt>
              <dd className="font-semibold text-primary">
                {pet.petGender === "male" ? t.petMale : t.petFemale}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-on-surface-variant">{t.birthDate}</dt>
              <dd className="font-semibold text-primary">{pet.petBirthDate}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-on-surface-variant">{t.birthTime}</dt>
              <dd className="text-right font-semibold text-primary">
                {formatBirthTimeSummary(pet.petBirthTime, pet.petBirthTimeUnknown, locale)}
              </dd>
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
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-32 md:pb-16">
      {backToBasicResultLink(petCtx.petId)}
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
                onClick={openCompatibility}
                disabled={menuLoading}
                className="w-full rounded-full bg-primary py-4 text-sm font-bold text-white shadow-lg shadow-primary/15 transition hover:bg-primary/90 disabled:opacity-60"
              >
                {t.btnCompatibility}
              </button>
              <button
                type="button"
                onClick={() => void openZodiac()}
                disabled={menuLoading}
                className="w-full rounded-full border-2 border-channel-saju/40 bg-white py-4 text-sm font-bold text-primary transition hover:bg-channel-saju/10 disabled:opacity-60"
              >
                {t.btnZodiac}
              </button>
            </div>
            {pet.petId ? (
              <PetPremiumPdfSaveRow
                locale={locale}
                petId={pet.petId}
                accessToken={accessToken}
                completion={storedCompletion}
              />
            ) : null}
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
            {activeView === "zodiac" && zodiacResult && !menuLoading && (
              <ZodiacResult result={zodiacResult} />
            )}
            {activeView === "compatibility" && compatibilityResult && !menuLoading && (
              <CompatibilityResult result={compatibilityResult} isGuest={false} />
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
