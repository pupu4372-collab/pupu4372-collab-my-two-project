"use client";

import { BirthDateSelect } from "@/components/k-saju/BirthDateSelect";
import { ZodiacResult } from "@/components/k-saju/ZodiacResult";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
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
    birthDate: "Birth date",
    submit: "Read today's stars",
    loading: "Reading the cosmos…",
    localeLabel: "Language",
  },
  ko: {
    petName: "이름",
    species: "종류",
    dog: "강아지",
    cat: "고양이",
    birthDate: "생년월일",
    submit: "오늘의 별자리 운세 보기",
    loading: "별자리 읽는 중…",
    localeLabel: "언어",
  },
};

function isLocale(value: string | null): value is Locale {
  return value === "ko" || value === "en";
}

function isSpecies(value: string | null): value is Species {
  return value === "dog" || value === "cat";
}

export function ZodiacForm() {
  const { accessToken, isAnonymous } = useSupabaseSession();
  const routeLocale = useLocale();
  const formRef = useRef<HTMLFormElement>(null);
  const [locale, setLocale] = useState<Locale>(routeLocale === "en" ? "en" : "ko");
  const [petName, setPetName] = useState("");
  const [species, setSpecies] = useState<Species>("dog");
  const [birthDate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ZodiacFortuneResponse | null>(null);

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
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
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

  return (
    <div className="space-y-5">
      <form ref={formRef} onSubmit={handleSubmit} className="pastel-card space-y-4 p-6">
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

        <label className="block text-sm font-medium text-plum/80">
          {t.petName}
          <input
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            className="pastel-input"
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
        />

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

      {result && (
        <ZodiacResult result={result} isGuest={isAnonymous} onBack={handleBackToForm} />
      )}
    </div>
  );
}
