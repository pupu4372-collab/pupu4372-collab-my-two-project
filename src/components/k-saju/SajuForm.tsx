"use client";

import { BirthDateSelect } from "@/components/k-saju/BirthDateSelect";
import { PetMbtiAccordion } from "@/components/k-saju/PetMbtiAccordion";
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
import type { MbtiAnswerMap } from "@/lib/pet/calc-mbti";
import { calcMbti, isMbtiComplete } from "@/lib/pet/calc-mbti";
import { getQuestionsBySpecies } from "@/lib/pet/mbti-questions";
import { getMbtiTypeData } from "@/lib/pet/mbti-types";
import { useLocale } from "next-intl";
import { useMemo, useState } from "react";

type Step = "form" | "result";

const UI = {
  en: {
    title: "K-Saju for your pet",
    subtitle: "Enter birth data using the birth-region timezone.",
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
    submit: "Read K-Saju",
    loading: "Reading your pet's energy...",
    errorConsent: "Please agree to the privacy notice.",
    localeLabel: "Language",
    sessionPreparing: "Preparing session. Please try again soon.",
    networkError: "Network error. Please try again.",
    serverError: "Server error. Please refresh the page and try again.",
    continueTitle: "Keep reading",
    continueSubtitle: "Use the same pet profile for zodiac and bond readings.",
    zodiacCta: "Zodiac fortune →",
    compatibilityCta: "Pet & butler bond →",
    premiumBadge: "Premium ₩4,500",
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
    submit: "사주 보기",
    loading: "우리 아이 기운을 읽고 있어요...",
    errorConsent: "개인정보 동의가 필요합니다.",
    localeLabel: "언어",
    sessionPreparing: "세션 준비 중이에요. 잠시 후 다시 시도해 주세요.",
    networkError: "네트워크 오류가 발생했어요.",
    serverError: "서버 오류가 발생했어요. 새로고침 후 다시 시도해 주세요.",
    continueTitle: "이 정보로 이어보기",
    continueSubtitle:
      "방금 입력한 이름과 생일을 그대로 가져가 별자리와 궁합도 이어서 볼 수 있어요.",
    zodiacCta: "별자리 운세 보기 →",
    compatibilityCta: "펫·집사 궁합 보기 →",
    premiumBadge: "프리미엄 ₩4,500",
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
  const { ready: sessionReady, accessToken, configured, isAnonymous } =
    useSupabaseSession();
  const routeLocale = useLocale();

  const [locale, setLocale] = useState<Locale>(
    routeLocale === "en" ? "en" : "ko"
  );
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

  const t = UI[locale];
  const birthTimeUnknown = birthTime === "unknown";
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

  const timezoneOptions = useMemo(() => {
    const set = new Set<string>([...COMMON_TIMEZONES, timezone]);
    return Array.from(set);
  }, [timezone]);

  const petId = result?.petId ?? null;

  const mbtiCompleteForLink = isMbtiComplete(mbtiAnswers, mbtiQuestions);
  const mbtiTypeForLink = mbtiCompleteForLink
    ? calcMbti(mbtiAnswers, mbtiQuestions).type
    : null;

  const continuationQuery = new URLSearchParams({
    petName,
    species,
    petGender,
    birthDate,
    birthTime,
    timezone,
    locale,
    ...(petId ? { petId } : {}),
    ...(mbtiTypeForLink ? { mbtiType: mbtiTypeForLink } : {}),
  }).toString();
  const premiumPaymentHref = `/payment?product=pet_premium_v1&${continuationQuery}`;

  function handleMbtiAnswer(questionId: string, value: 0 | 1) {
    setMbtiAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

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

  async function handleApiSubmit() {
    setError(null);
    setLoading(true);

    const mbtiResult = calcMbti(mbtiAnswers, mbtiQuestions);
    const mbtiComplete = isMbtiComplete(mbtiAnswers, mbtiQuestions);

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
          birthTime: birthTimeUnknown ? null : birthTime,
          birthTimeUnknown,
          timezone,
          locale,
          privacyConsent: consent,
          ...(mbtiComplete
            ? { mbtiType: mbtiResult.type, mbtiScores: mbtiResult.scores }
            : {}),
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
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError(t.networkError);
    } finally {
      setLoading(false);
    }
  }

  const mbtiResult = useMemo(
    () => calcMbti(mbtiAnswers, mbtiQuestions),
    [mbtiAnswers, mbtiQuestions]
  );
  const mbtiTypeData = getMbtiTypeData(mbtiResult.type);

  if (step === "result" && result) {
    return (
      <div className="space-y-8 pb-40 md:pb-20">
        {mbtiTypeData && isMbtiComplete(mbtiAnswers, mbtiQuestions) && (
          <section className="rounded-[2rem] bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-outline">
              {t.mbtiResultDesc}
            </p>
            <h3 className="mt-2 text-2xl font-extrabold text-primary">
              {t.mbtiResultTitle(petName, mbtiTypeData.titleKo)}
            </h3>
            <p className="mt-1 text-sm leading-6 text-on-surface-variant">
              {mbtiTypeData.descKo}
            </p>
            <span className="mt-4 inline-flex rounded-full bg-channel-saju/20 px-4 py-1.5 text-xl font-bold tracking-wide text-channel-saju">
              {mbtiResult.type}
            </span>
          </section>
        )}

        <SajuResult
          result={result}
          variant={embedded ? "pastel" : "default"}
          mbtiType={isMbtiComplete(mbtiAnswers, mbtiQuestions) ? mbtiResult.type : undefined}
        />
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
            {locale === "ko" ? "우리 아이 K-사주 보기" : "Read your pet's K-Saju"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">
            {locale === "ko"
              ? "이름과 생일 정보를 입력하면 성향, 오행 밸런스, 케어 포인트를 알려드려요. 출생 시간을 몰라도 결과를 볼 수 있어요."
              : "Enter your pet's name and birth data to reveal personality, elemental balance, and care cues. Unknown birth time is okay."}
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
                      onClick={() => {
                        setSpecies(item.value);
                        setMbtiAnswers({});
                      }}
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

              <fieldset>
                <legend className="sr-only">{t.petGender}</legend>
                <div className="flex gap-3">
                  {(["male", "female"] as const).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPetGender(item)}
                      className={
                        petGender === item
                          ? "h-12 flex-1 rounded-full bg-primary text-sm font-extrabold text-white shadow-sm"
                          : "h-12 flex-1 rounded-full bg-surface-container-low text-sm font-extrabold text-on-surface-variant transition hover:bg-lavender/50"
                      }
                      aria-pressed={petGender === item}
                    >
                      {item === "male" ? "♂ " : "♀ "}
                      {item === "male" ? t.petMale : t.petFemale}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
          </section>
        )}

        <section
          className={
            embedded ? "space-y-3" : "rounded-[2rem] bg-white p-6 shadow-sm"
          }
        >
          {!embedded && (
            <h3 className="mb-6 text-2xl font-extrabold text-primary">
              {locale === "ko" ? "언제 태어났나요?" : "When were they born?"}
            </h3>
          )}
          <BirthDateSelect
            value={birthDate}
            onChange={setBirthDate}
            label={t.birthDate}
            locale={locale}
            className={labelClass}
            selectClassName={
              embedded
                ? inputClass
                : "w-full rounded-2xl border-0 bg-surface-container-low px-3 py-3 text-center text-sm font-bold text-primary focus:ring-4 focus:ring-primary/10"
            }
          />

          <div className={embedded ? "space-y-3" : "mt-6 space-y-4"}>
            <div className="grid grid-cols-2 rounded-full bg-surface-container-low p-1">
              <button
                type="button"
                onClick={() =>
                  setBirthTime(birthTime === "unknown" ? "11:30" : birthTime)
                }
                className={
                  !birthTimeUnknown
                    ? "rounded-full bg-white py-3 text-xs font-extrabold text-primary shadow-sm"
                    : "rounded-full py-3 text-xs font-extrabold text-on-surface-variant"
                }
              >
                {locale === "ko" ? "출생 시간을 알아요" : "I know the time"}
              </button>
              <button
                type="button"
                onClick={() => setBirthTime("unknown")}
                className={
                  birthTimeUnknown
                    ? "rounded-full bg-white py-3 text-xs font-extrabold text-primary shadow-sm"
                    : "rounded-full py-3 text-xs font-extrabold text-on-surface-variant"
                }
              >
                {locale === "ko" ? "몰라요" : "Unknown"}
              </button>
            </div>

            {birthTimeUnknown ? (
              <p className="rounded-2xl bg-surface-container-low px-4 py-3 text-sm leading-6 text-on-surface-variant">
                {locale === "ko"
                  ? "시간을 몰라도 연·월·일 기준으로 기본 사주를 볼 수 있어요."
                  : "You can still read the basic K-Saju from the date alone."}
              </p>
            ) : (
              <label className={labelClass}>
                {t.birthTime}
                <select
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  className={inputClass}
                >
                  {BIRTH_TIME_OPTIONS.filter(
                    (option) => option.value !== "unknown"
                  ).map((option) => (
                    <option key={option.value} value={option.value}>
                      {getBirthTimeOptionLabel(option, locale)}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        </section>

        <section
          className={
            embedded ? "space-y-3" : "rounded-[2rem] bg-white p-6 shadow-sm"
          }
        >
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
          {!embedded && (
            <p className="mt-2 text-xs leading-5 text-outline">
              {locale === "ko"
                ? "태어난 지역 기준 시간으로 계산해요."
                : "Calculated with the timezone of the birth region."}
            </p>
          )}
        </section>

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

        <PetMbtiAccordion
          species={species}
          questions={mbtiQuestions}
          answers={mbtiAnswers}
          onAnswer={handleMbtiAnswer}
          locale={locale}
        />

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
