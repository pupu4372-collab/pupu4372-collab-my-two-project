"use client";

import { PetFortunePetSelector } from "@/components/home/pet-fortune/PetFortunePetSelector";
import { MbtiLockTeaserCard } from "@/components/k-saju/MbtiLockTeaserCard";
import { SajuResult } from "@/components/k-saju/SajuResult";
import { usePetPremiumUnlock } from "@/hooks/usePetPremiumUnlock";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { PrivacyConsent } from "@/components/legal/PrivacyConsent";
import { PetBasicInfoFields } from "@/components/pet/PetBasicInfoFields";
import {
  fetchPetProfileForSaju,
  fetchPetsForSajuEntry,
  petProfileToSajuFormState,
  sajuHrefForRegisteredPet,
  type PetEntryListItem,
} from "@/lib/pets/load-pet-for-saju";
import { Link, useRouter } from "@/i18n/navigation";
import {
  formatPetProductPrice,
  PET_PREMIUM_PACKAGE_CODE,
} from "@/lib/payments/pet-product-catalog";
import type { Gender, Locale, SajuBasicResponse, Species } from "@/lib/saju/types";
import type { MbtiAnswerMap } from "@/lib/pet/calc-mbti";
import { calcMbti, isMbtiComplete } from "@/lib/pet/calc-mbti";
import { getQuestionsBySpecies } from "@/lib/pet/mbti-questions";
import { getMbtiTypeData } from "@/lib/pet/mbti-types";
import { useLocale } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  clearSajuResultSession,
  isValidSajuResultSession,
  readSajuResultSession,
  saveSajuResultSession,
  type SajuResultSessionSnapshot,
} from "@/lib/saju/saju-result-session";

type Step = "form" | "result";
type EntryGate = "resolving" | "pick" | "form";

function speciesIcon(species: string): string {
  if (species === "dog") return "🐕";
  if (species === "cat") return "🐱";
  if (species === "reptile") return "🦎";
  return "🐾";
}

const UI = {
  en: {
    title: "K-Saju for your pet",
    subtitle: "Enter name and birth date—we'll share innate traits and care tips you can use starting today. Unknown birth time is OK.",
    petName: "Pet name",
    species: "Species",
    petGender: "Pet gender",
    petFemale: "Female",
    petMale: "Male",
    dog: "Dog",
    cat: "Cat",
    reptile: "Reptile",
    other: "Other friends",
    birthDate: "Birth date",
    birthTime: "Birth time",
    timezone: "Birth timezone",
    submit: "Get personalized care",
    loading: "Preparing your pet's care guide...",
    errorConsent: "Please agree to the privacy notice.",
    localeLabel: "Language",
    sessionPreparing: "Preparing session. Please try again soon.",
    networkError: "Network error. Please try again.",
    serverError: "Server error. Please refresh the page and try again.",
    continueTitle: "Keep going",
    continueSubtitle: "Use the same pet profile for zodiac and bond care guides.",
    zodiacCta: "Zodiac care guide →",
    compatibilityCta: "Pet & butler bond care →",
    premiumBadge: `Premium ${formatPetProductPrice(PET_PREMIUM_PACKAGE_CODE, "en")}`,
    mbtiResultTitle: (name: string, typeTitle: string) =>
      `${name} is "${typeTitle}"`,
    mbtiResultDesc: "Personality type",
  },
  ko: {
    title: "반려동물 K-사주",
    subtitle: "출생 지역 시간대를 기준으로 생년월일시를 입력해 주세요.",
    petName: "이름",
    species: "종류",
    petGender: "동물 성별",
    petFemale: "암",
    petMale: "수",
    dog: "강아지",
    cat: "고양이",
    reptile: "렙타일",
    other: "그외친구들",
    birthDate: "생년월일",
    birthTime: "출생 시간",
    timezone: "출생 지역 시간대",
    submit: "맞춤 케어 보기",
    loading: "맞춤 케어 가이드를 준비하고 있어요...",
    errorConsent: "개인정보 동의가 필요합니다.",
    localeLabel: "언어",
    sessionPreparing: "세션 준비 중이에요. 잠시 후 다시 시도해 주세요.",
    networkError: "네트워크 오류가 발생했어요.",
    serverError: "서버 오류가 발생했어요. 새로고침 후 다시 시도해 주세요.",
    continueTitle: "이 정보로 이어보기",
    continueSubtitle:
      "방금 입력한 이름과 생일을 그대로 가져가 별자리·궁합 케어 가이드도 이어서 볼 수 있어요.",
    zodiacCta: "별자리 케어 가이드 →",
    compatibilityCta: "펫·집사 궁합 케어 →",
    premiumBadge: `프리미엄 ${formatPetProductPrice(PET_PREMIUM_PACKAGE_CODE, "ko")}`,
    mbtiResultTitle: (name: string, typeTitle: string) =>
      `${name}은(는) "${typeTitle}"`,
    mbtiResultDesc: "성격 유형",
  },
};

const FIELD_LABEL_CLASS = "block text-sm font-bold text-primary";
const FORM_ERROR_CLASS =
  "rounded-2xl border border-red-300/70 bg-white/95 px-4 py-2.5 text-sm font-semibold text-red-800 shadow-sm";
const STITCH_INPUT_CLASS =
  "pastel-input mt-2 w-full rounded-[2rem] border-transparent bg-sand/50 px-4 py-3.5 text-sm text-on-surface focus:ring-primary/20";

const SPECIES_OPTIONS = [
  { value: "dog", emoji: "🐶", icon: "🐾" },
  { value: "cat", emoji: "🐱", icon: "🐾" },
  { value: "reptile", emoji: "🦎", icon: "🦎" },
  { value: "other", emoji: "🐾", icon: "🐰" },
] as const;

const ELEMENT_DOTS = [
  "bg-[#7FB8B0]",
  "bg-[#F28C82]",
  "bg-[#D9C5B2]",
  "bg-[#E6C994]",
  "bg-[#343A40]",
] as const;

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
  const router = useRouter();
  const { ready: sessionReady, accessToken, configured, isAnonymous } =
    useSupabaseSession();
  const routeLocale = useLocale();
  const locale: Locale = routeLocale === "en" ? "en" : "ko";
  const [step, setStep] = useState<Step>("form");

  const [petName, setPetName] = useState("");
  const [species, setSpecies] = useState<Species>("dog");
  const [petGender, setPetGender] = useState<Gender>("female");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("unknown");
  const [timezone, setTimezone] = useState(detectTimezone);
  const [consent, setConsent] = useState(false);

  const [mbtiAnswers, setMbtiAnswers] = useState<MbtiAnswerMap>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SajuBasicResponse | null>(null);
  const [prefillPhotoUrl, setPrefillPhotoUrl] = useState<string | null>(null);
  const [prefillPetId, setPrefillPetId] = useState<string | null>(null);
  const skipEntryGateRef = useRef(false);
  const entryGateAttemptedRef = useRef(false);
  const sessionRestoreAppliedRef = useRef(false);
  const [entryGate, setEntryGate] = useState<EntryGate>(embedded ? "form" : "resolving");
  const [entryPets, setEntryPets] = useState<PetEntryListItem[]>([]);

  const t = UI[locale];
  const mbtiQuestions = useMemo(
    () => getQuestionsBySpecies(species, locale),
    [species, locale]
  );

  const inputClass = embedded
    ? "mt-1 w-full rounded-xl border border-plum/10 bg-white px-3 py-2 text-xs leading-5 text-ink outline-none transition focus:border-mint/80 focus:shadow-[0_0_0_3px_rgba(168,230,207,0.25)]"
    : STITCH_INPUT_CLASS;
  const labelClass = embedded
    ? "block text-xs font-medium text-plum/80"
    : FIELD_LABEL_CLASS;

  const applySessionSnapshot = useCallback((saved: SajuResultSessionSnapshot) => {
    setPetName(saved.petName);
    setSpecies(saved.species);
    setPetGender(saved.petGender);
    setBirthDate(saved.birthDate);
    setBirthTime(saved.birthTime);
    setTimezone(saved.timezone);
    setConsent(true);
    if (saved.mbtiAnswers) setMbtiAnswers(saved.mbtiAnswers);
    setResult(saved.result);
    setStep("result");
    sessionRestoreAppliedRef.current = true;
    skipEntryGateRef.current = true;
    setEntryGate("form");
  }, []);

  const tryRestoreFromSession = useCallback(() => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    if (params.get("new") === "1") return false;

    const saved = readSajuResultSession();
    if (!isValidSajuResultSession(saved)) return false;

    applySessionSnapshot(saved);
    return true;
  }, [applySessionSnapshot]);

  const openNewPetForm = useCallback(() => {
    clearSajuResultSession();
    skipEntryGateRef.current = true;
    setEntryGate("form");
    setEntryPets([]);
    router.replace("/saju?new=1");
  }, [router]);

  const navigateRegisteredPet = useCallback(
    (pet: PetEntryListItem) => {
      const href = sajuHrefForRegisteredPet(pet);
      if (href.startsWith("/reports/")) {
        router.push(href);
      } else {
        router.replace(href);
      }
    },
    [router]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("new") === "1") {
      clearSajuResultSession();
      skipEntryGateRef.current = true;
      sessionRestoreAppliedRef.current = false;
      setEntryGate("form");
      router.replace("/saju");
      return;
    }

    if (params.get("petId")?.trim()) {
      skipEntryGateRef.current = true;
      setEntryGate("form");
    }

    tryRestoreFromSession();

    if (params.get("restore") === "1") {
      router.replace("/saju");
    }

    const onPageShow = () => {
      tryRestoreFromSession();
    };
    const onPopState = () => {
      tryRestoreFromSession();
    };

    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("popstate", onPopState);
    };
  }, [router, tryRestoreFromSession]);

  /**
   * Entry gate: 0 pets → form; 1 pet → reports or ?petId=; 2+ → pick UI.
   * Runs for anon + full members (Bearer via getUserIdFromRequest).
   */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!sessionReady) return;
    if (step !== "form") return;
    if (skipEntryGateRef.current) {
      setEntryGate("form");
      return;
    }
    if (entryGateAttemptedRef.current) return;
    if (sessionRestoreAppliedRef.current) return;
    if (isValidSajuResultSession(readSajuResultSession())) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("petId")?.trim()) {
      setEntryGate("form");
      return;
    }
    if (params.get("restore") === "1") return;
    if (params.get("new") === "1") {
      setEntryGate("form");
      return;
    }

    if (!accessToken) {
      setEntryGate("form");
      return;
    }

    entryGateAttemptedRef.current = true;
    let cancelled = false;

    void (async () => {
      try {
        const pets = await fetchPetsForSajuEntry(accessToken);
        if (cancelled || skipEntryGateRef.current) return;

        if (pets.length === 0) {
          setEntryPets([]);
          setEntryGate("form");
          return;
        }

        if (pets.length === 1) {
          navigateRegisteredPet(pets[0]!);
          return;
        }

        setEntryPets(pets);
        setEntryGate("pick");
      } catch {
        if (!cancelled) setEntryGate("form");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionReady, accessToken, step, navigateRegisteredPet]);

  const handleApiSubmit = useCallback(async () => {
    setError(null);
    clearSajuResultSession();
    setLoading(true);

    const birthTimeUnknownNow = birthTime === "unknown";

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const res = await fetch("/api/saju/basic", {
        method: "POST",
        headers,
        body: JSON.stringify({
          petName,
          species,
          petGender,
          birthDate,
          calendarType: "solar",
          birthTime: birthTimeUnknownNow ? null : birthTime,
          birthTimeUnknown: birthTimeUnknownNow,
          timezone,
          locale,
          privacyConsent: consent,
        }),
      });

      const raw = await res.text();
      let data: { error?: string } = {};
      if (raw) {
        try {
          data = JSON.parse(raw) as { error?: string };
        } catch {
          setError(res.status >= 500 ? t.serverError : t.networkError);
          return;
        }
      }
      if (!res.ok) {
        setError(data.error ?? t.networkError);
        return;
      }
      setResult(data as SajuBasicResponse);
      setStep("result");
      saveSajuResultSession({
        result: data as SajuBasicResponse,
        petName,
        species,
        petGender,
        birthDate,
        birthTime,
        timezone,
        locale,
        ...(Object.keys(mbtiAnswers).length > 0 ? { mbtiAnswers } : {}),
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError(t.networkError);
    } finally {
      setLoading(false);
    }
  }, [
    accessToken,
    birthDate,
    birthTime,
    consent,
    locale,
    mbtiAnswers,
    petGender,
    petName,
    species,
    t.networkError,
    t.serverError,
    timezone,
  ]);

  useEffect(() => {
    if (typeof window === "undefined" || !accessToken || step !== "form") return;
    if (sessionRestoreAppliedRef.current) return;
    if (isValidSajuResultSession(readSajuResultSession())) return;

    const params = new URLSearchParams(window.location.search);
    const petIdParam = params.get("petId")?.trim();
    if (!petIdParam) return;

    let cancelled = false;

    void (async () => {
      const pet = await fetchPetProfileForSaju(accessToken, petIdParam);
      if (cancelled || !pet) return;

      const next = petProfileToSajuFormState(pet);
      setPrefillPetId(pet.id);
      setPetName(next.petName);
      setSpecies(next.species);
      setPetGender(next.petGender);
      setBirthDate(next.birthDate);
      setBirthTime(next.birthTime);
      setTimezone(next.timezone);
      setPrefillPhotoUrl(next.photoUrl);
      setConsent(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [accessToken, step]);

  const petId = result?.petId ?? prefillPetId;
  const mbtiUnlockCheckEnabled = configured && sessionReady && !isAnonymous && Boolean(petId);
  const { unlocked: mbtiUnlocked, loading: mbtiUnlockLoading } = usePetPremiumUnlock(
    petId,
    accessToken,
    mbtiUnlockCheckEnabled,
    "mbti"
  );
  const isGuest = configured && sessionReady && isAnonymous;

  const restoredMbtiComplete = isMbtiComplete(mbtiAnswers, mbtiQuestions);
  const restoredMbtiResult = useMemo(
    () => (restoredMbtiComplete ? calcMbti(mbtiAnswers, mbtiQuestions) : null),
    [mbtiAnswers, mbtiQuestions, restoredMbtiComplete]
  );
  const restoredMbtiTypeData = restoredMbtiResult
    ? getMbtiTypeData(restoredMbtiResult.type)
    : null;

  function handleFormNext(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!consent) {
      setError(t.errorConsent);
      return;
    }
    if (configured && !sessionReady) {
      setError(t.sessionPreparing);
      return;
    }

    void handleApiSubmit();
  }

  if (step === "result" && result) {
    return (
      <div className="space-y-8 pb-40 md:pb-20">
        {restoredMbtiTypeData && restoredMbtiResult ? (
          <section className="rounded-[2rem] bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-outline">
              {t.mbtiResultDesc}
            </p>
            <h3 className="mt-2 text-2xl font-extrabold text-primary">
              {t.mbtiResultTitle(petName, restoredMbtiTypeData.titleKo)}
            </h3>
            <p className="mt-1 text-sm leading-6 text-on-surface-variant">
              {restoredMbtiTypeData.descKo}
            </p>
            <span className="mt-4 inline-flex rounded-full bg-channel-saju/20 px-4 py-1.5 text-xl font-bold tracking-wide text-channel-saju">
              {restoredMbtiResult.type}
            </span>
          </section>
        ) : (
          <MbtiLockTeaserCard
            petName={petName}
            locale={locale}
            isGuest={isGuest}
            mbtiUnlocked={mbtiUnlocked}
            mbtiUnlockLoading={mbtiUnlockCheckEnabled && mbtiUnlockLoading}
            continuation={{
              petName,
              species,
              petGender,
              birthDate,
              birthTime,
              timezone,
              petId: petId ?? undefined,
              sajuResultId: result.sajuResultId ?? undefined,
            }}
          />
        )}

        <SajuResult
          result={result}
          variant={embedded ? "pastel" : "default"}
          mbtiType={restoredMbtiResult?.type}
          birthTimeSelect={birthTime}
        />
      </div>
    );
  }

  if (entryGate === "resolving" && !embedded && step === "form") {
    return (
      <div className="rounded-[1.75rem] border border-channel-saju/15 bg-surface px-5 py-8 text-center text-sm text-on-surface-variant shadow-sm">
        {locale === "ko" ? "등록된 아이를 확인하는 중…" : "Checking your pets…"}
      </div>
    );
  }

  if (entryGate === "pick" && !embedded && step === "form") {
    return (
      <div className="space-y-5 pb-28 md:pb-10">
        <section className="relative overflow-hidden rounded-[1.75rem] border border-channel-saju/15 bg-surface px-5 py-5 shadow-sm md:px-6">
          <h2 className="text-xl font-extrabold tracking-tight text-primary md:text-2xl">
            {locale === "ko" ? "어떤 아이의 사주를 볼까요?" : "Whose K-Saju do you want to see?"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">
            {locale === "ko"
              ? "등록된 아이를 고르면 저장된 결과가 있으면 바로 열고, 없으면 생일로 새로 계산해요."
              : "Pick a registered pet to open a saved reading, or compute a new one from their birth details."}
          </p>
          <div className="mt-5">
            <PetFortunePetSelector
              pets={entryPets.map((pet) => ({
                id: pet.id,
                name: pet.name,
                icon: speciesIcon(pet.species),
                photo_url: pet.photo_url,
                profile_image_url: pet.profile_image_url ?? null,
              }))}
              onSelectPet={(petId) => {
                const pet = entryPets.find((p) => p.id === petId);
                if (pet) navigateRegisteredPet(pet);
              }}
            />
          </div>
          <button
            type="button"
            onClick={openNewPetForm}
            className="mt-6 w-full rounded-full border border-channel-saju/25 bg-white px-5 py-3 text-sm font-extrabold text-channel-saju transition hover:bg-lavender/30"
          >
            {locale === "ko" ? "새로운 아이 사주 보기" : "Read K-Saju for a new pet"}
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className={embedded ? "space-y-4" : "space-y-5 pb-28 md:pb-10"}>
      {!embedded && (
        <section className="relative overflow-hidden rounded-[1.75rem] border border-channel-saju/15 bg-surface px-5 py-5 shadow-sm md:px-6">
          <span
            className="absolute right-4 top-4 text-2xl text-gold/50"
            aria-hidden
          >
            ✨
          </span>
          <h2 className="max-w-xl text-xl font-extrabold tracking-tight text-primary md:text-2xl">
            {locale === "ko" ? "우리 아이 맞춤 케어 보기" : "Personalized pet care"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">
            {locale === "ko"
              ? "이름과 생일만 입력하면 우리 아이 타고난 성향과 오늘부터 쓸 수 있는 맞춤 케어 팁을 알려드려요. 출생 시간을 몰라도 괜찮아요."
              : "Enter name and birth date only—we'll share innate traits and care tips you can use starting today. Unknown birth time is OK."}
          </p>
          <div className="mt-4 flex gap-1.5">
            {ELEMENT_DOTS.map((dot) => (
              <span key={dot} className={`h-2.5 w-2.5 rounded-full ${dot}`} />
            ))}
          </div>
        </section>
      )}

      <form
        onSubmit={handleFormNext}
        className={embedded ? "space-y-3" : "space-y-5"}
      >
        {embedded ? (
          <>
            <div className="flex gap-2.5">
              <label className={`${labelClass} flex-1`}>
                {t.species}
                <select
                  value={species}
                  onChange={(e) => setSpecies(e.target.value as Species)}
                  className={inputClass}
                >
                  <option value="dog">{t.dog}</option>
                  <option value="cat">{t.cat}</option>
                  <option value="reptile">{t.reptile}</option>
                  <option value="other">{t.other}</option>
                </select>
              </label>
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
          </>
        ) : (
          <section className="rounded-[1.75rem] bg-white p-5 shadow-sm md:p-6">
            <h3 className="text-xl font-extrabold text-primary md:text-[1.35rem]">
              {locale === "ko" ? "우리 아이는 누구인가요?" : "Who is your pet?"}
            </h3>
            <div className="mt-5 space-y-5">
              <label className="block text-sm font-bold uppercase tracking-[0.08em] text-outline">
                {t.petName}
                <input
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  placeholder={
                    locale === "ko"
                      ? "아이의 이름을 입력해주세요"
                      : "Enter your pet's name"
                  }
                  className="mt-2 h-14 w-full rounded-2xl border-0 bg-surface-container-low px-4 text-lg font-bold text-primary placeholder:text-outline/60 focus:ring-4 focus:ring-primary/10"
                  required
                  maxLength={32}
                />
              </label>

              <fieldset>
                <legend className="sr-only">{t.species}</legend>
                <div className="grid grid-cols-3 gap-2">
                  {SPECIES_OPTIONS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setSpecies(item.value)}
                      className={
                        species === item.value
                          ? "flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-primary bg-primary/10 text-primary shadow-sm"
                          : "flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-surface-container bg-white text-on-surface-variant transition hover:border-primary/30"
                      }
                      aria-pressed={species === item.value}
                    >
                      <span className="text-2xl" aria-hidden>
                        {item.emoji}
                      </span>
                      <span className="text-xs font-extrabold">
                        {t[item.value]}
                      </span>
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
          </section>
        )}

        <PetBasicInfoFields
          locale={locale}
          variant={embedded ? "stitch-embedded" : "stitch"}
          showGender={!embedded}
          petGender={petGender}
          onPetGenderChange={setPetGender}
          birthDate={birthDate}
          onBirthDateChange={setBirthDate}
          birthTime={birthTime}
          onBirthTimeChange={setBirthTime}
          timezone={timezone}
          onTimezoneChange={setTimezone}
        />

        {prefillPhotoUrl ? (
          <p className="rounded-2xl border border-channel-saju/20 bg-channel-saju/5 px-4 py-3 text-sm font-semibold text-channel-saju">
            {locale === "ko"
              ? "홈에서 등록한 사진이 연결돼 있어요. 다시 올릴 필요 없어요."
              : "The photo from home is already linked — no need to upload again."}
          </p>
        ) : null}

        <div
          className={embedded ? "" : "rounded-[2rem] bg-white p-6 shadow-sm"}
        >
          <PrivacyConsent
            checked={consent}
            onChange={setConsent}
            locale={locale}
            variant={embedded ? "pastelCompact" : "plain"}
          />
        </div>

        {error && (
          <p className={FORM_ERROR_CLASS} role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{ position: "static" }}
          className={
            embedded
              ? "w-full rounded-full bg-mint px-4 py-2.5 text-center text-ink transition hover:brightness-105 disabled:opacity-60"
              : "mt-2 flex w-full items-center justify-center rounded-full bg-[#6f4b8b] px-8 py-4 text-base font-extrabold text-white shadow-xl shadow-[#6f4b8b]/25 transition hover:bg-[#5f3f78] active:scale-[0.98] disabled:opacity-60"
          }
        >
          {loading ? t.loading : t.submit}
        </button>
      </form>
    </div>
  );
}
