"use client";

import { BirthDateSelect } from "@/components/k-saju/BirthDateSelect";
import { ZodiacResult } from "@/components/k-saju/ZodiacResult";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { Link } from "@/i18n/navigation";
import type { ZodiacFortuneResponse } from "@/lib/saju/zodiac/engine";
import type { Locale, Species } from "@/lib/saju/types";
import { useLocale } from "next-intl";
import { useEffect, useRef, useState } from "react";

const UI = {
  en: {
    petName: "Pet name",
    species: "Species",
    dog: "Dog",
    cat: "Cat",
    other: "Other pet",
    birthDate: "Birth date",
    submit: "Read today's stars",
    loading: "Reading the cosmos…",
    localeLabel: "Language",
    premiumRequired: "This feature requires premium. Please complete payment to continue.",
    goToPay: "Go to payment →",
  },
  ko: {
    petName: "이름",
    species: "종류",
    dog: "강아지",
    cat: "고양이",
    other: "다른 동물",
    birthDate: "생년월일",
    submit: "오늘의 별자리 운세 보기",
    loading: "별자리 읽는 중…",
    localeLabel: "언어",
    premiumRequired: "이 기능은 프리미엄 전용이에요. 결제 후 이용할 수 있어요.",
    goToPay: "결제하러 가기 →",
  },
};

const FIELD_LABEL_CLASS = "block text-sm font-bold text-primary";
const STITCH_INPUT_CLASS =
  "pastel-input mt-2 w-full rounded-[2rem] border-transparent bg-sand/50 px-4 py-3.5 text-sm text-on-surface focus:ring-primary/20";

function isLocale(value: string | null): value is Locale {
  return value === "ko" || value === "en";
}

function isSpecies(value: string | null): value is Species {
  return value === "dog" || value === "cat" || value === "other";
}

export function ZodiacForm() {
  const { ready, accessToken, configured, isAnonymous } = useSupabaseSession();
  const routeLocale = useLocale();
  const formRef = useRef<HTMLFormElement>(null);
  const [locale, setLocale] = useState<Locale>(routeLocale === "en" ? "en" : "ko");
  const [petName, setPetName] = useState("");
  const [species, setSpecies] = useState<Species>("dog");
  const [birthDate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ZodiacFortuneResponse | null>(null);
  const [petId, setPetId] = useState<string | null>(null);

  const t = UI[locale];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextLocale = params.get("locale");
    const nextSpecies = params.get("species");
    const nextName = params.get("petName");
    const nextBirthDate = params.get("birthDate");

    if (isLocale(nextLocale)) setLocale(nextLocale);
    if (isSpecies(nextSpecies)) setSpecies(nextSpecies);
    if (nextName) setPetName(nextName);
    if (nextBirthDate) setBirthDate(nextBirthDate);

    const nextPetId = params.get("petId");
    if (nextPetId) setPetId(nextPetId);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    setLoading(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const res = await fetch("/api/saju/zodiac", {
        method: "POST",
        headers,
        body: JSON.stringify({
          petName,
          species,
          birthDate,
          locale,
          petId: petId ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "premium_required") {
          setError("premium_required");
        } else {
          setError(data.error ?? "Something went wrong.");
        }
        return;
      }
      setResult(data as ZodiacFortuneResponse);
    } catch {
      setError(locale === "ko" ? "네트워크 오류" : "Network error");
    } finally {
      setLoading(false);
    }
  }

  function handleBackToForm() {
    setResult(null);
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (configured && ready && isAnonymous) {
    return (
      <div className="pastel-card p-6 text-center">
        <p className="text-sm text-plum/70">
          {locale === "ko" ? "별자리 운세를 보려면 로그인이 필요해요." : "Please log in to read zodiac fortunes."}
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

  return (
    <div className="space-y-5">
      <form ref={formRef} onSubmit={handleSubmit} className="pastel-card space-y-6 p-6 md:p-8">
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
                      : "rounded-[2rem] border border-outline/20 bg-white/45 px-4 py-4 text-center text-primary transition hover:bg-lavender/50"
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

        <label className={FIELD_LABEL_CLASS}>
          {t.petName}
          <input
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            className={STITCH_INPUT_CLASS}
            placeholder="모찌"
            required
            maxLength={32}
          />
        </label>

        <BirthDateSelect
          value={birthDate}
          onChange={setBirthDate}
          label={t.birthDate}
          locale={locale}
          className={FIELD_LABEL_CLASS}
          selectClassName={STITCH_INPUT_CLASS}
        />

        {error && (
          error === "premium_required" ? (
            <div className="rounded-2xl bg-petal/40 px-4 py-3 text-sm text-plum space-y-2">
              <p>{t.premiumRequired}</p>
              <Link
                href={`/payment?product=pet_premium_v1&type=zodiac&petName=${encodeURIComponent(petName)}&species=${species}&birthDate=${birthDate}&locale=${locale}${petId ? `&petId=${petId}` : ""}`}
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

      {result && (
        <ZodiacResult result={result} isGuest={isAnonymous} onBack={handleBackToForm} />
      )}
    </div>
  );
}
