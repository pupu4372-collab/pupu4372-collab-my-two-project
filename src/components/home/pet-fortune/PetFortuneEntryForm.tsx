"use client";

import type { Species } from "@/lib/saju/types";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState, type FormEvent } from "react";

export type PetFortuneFormValues = {
  petName: string;
  species: Species;
  birthDate: string;
};

type Props = {
  loading?: boolean;
  error?: string | null;
  onSubmit: (values: PetFortuneFormValues) => void;
};

const SPECIES_OPTIONS: { value: Species; emoji: string; labelKey: "dog" | "cat" | "other" }[] = [
  { value: "dog", emoji: "🐕", labelKey: "dog" },
  { value: "cat", emoji: "🐱", labelKey: "cat" },
  { value: "other", emoji: "🦎", labelKey: "other" },
];

const MIN_BIRTH_YEAR = 1990;

function daysInMonth(year: string, month: string) {
  if (!month) return 31;
  const y = Number(year || new Date().getFullYear());
  const m = Number(month);
  return new Date(y, m, 0).getDate();
}

function SelectChevron() {
  return (
    <span className="pet-fortune-select-chevron" aria-hidden>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function PetFortuneEntryForm({ loading, error, onSubmit }: Props) {
  const locale = useLocale();
  const isKo = locale === "ko";
  const t = useTranslations("home.guestFortune");
  const [petName, setPetName] = useState("");
  const [species, setSpecies] = useState<Species | "">("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const maxYear = new Date().getFullYear();

  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = maxYear; y >= MIN_BIRTH_YEAR; y -= 1) list.push(y);
    return list;
  }, [maxYear]);

  const months = useMemo(
    () => Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")),
    []
  );

  const dayCount = daysInMonth(year, month);
  const days = useMemo(
    () => Array.from({ length: dayCount }, (_, i) => String(i + 1).padStart(2, "0")),
    [dayCount]
  );

  function updateBirthDate(next: Partial<{ year: string; month: string; day: string }>) {
    const nextYear = next.year ?? year;
    const nextMonth = next.month ?? month;
    let nextDay = next.day ?? day;

    const maxDay = daysInMonth(nextYear, nextMonth);
    if (nextDay && Number(nextDay) > maxDay) {
      nextDay = String(maxDay).padStart(2, "0");
    }

    setYear(nextYear);
    setMonth(nextMonth);
    setDay(nextDay);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!species) return;

    const y = Number(year);
    const m = Number(month);
    const d = Number(day);
    if (!y || !m || !d) {
      setLocalError(t("invalidDate"));
      return;
    }

    const birthDate = `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const parsed = new Date(`${birthDate}T12:00:00`);
    if (Number.isNaN(parsed.getTime()) || parsed.getUTCMonth() + 1 !== m || parsed.getUTCDate() !== d) {
      setLocalError(t("invalidDate"));
      return;
    }

    setLocalError(null);
    onSubmit({
      petName: petName.trim(),
      species,
      birthDate,
    });
  }

  const displayError = localError ?? error;

  return (
    <form onSubmit={handleSubmit} className="pet-fortune-entry-frame">
      <div className="pet-fortune-entry-corner pet-fortune-entry-corner--tl" aria-hidden />
      <div className="pet-fortune-entry-corner pet-fortune-entry-corner--tr" aria-hidden />
      <div className="pet-fortune-entry-corner pet-fortune-entry-corner--bl" aria-hidden />
      <div className="pet-fortune-entry-corner pet-fortune-entry-corner--br" aria-hidden />
      <div className="pet-fortune-entry-ornate" aria-hidden />

      <header className="pet-fortune-entry-header">
        <p className="pet-fortune-entry-eyebrow">K-Saju Pet</p>
        <h2 className="pet-fortune-entry-title">{t("title")}</h2>
        <div className="pet-fortune-entry-divider" aria-hidden />
        <p className="pet-fortune-entry-subtitle">{t("subtitle")}</p>
      </header>

      <div className="pet-fortune-entry-fields">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <label className="pet-fortune-field">
            <span className="pet-fortune-field-label">{t("labelSpecies")}</span>
            <div className="pet-fortune-input pet-fortune-input--dark">
              <select
                className="pet-fortune-input-field pet-fortune-select"
                value={species}
                onChange={(e) => setSpecies(e.target.value as Species | "")}
                required
              >
                <option value="" disabled>
                  {t("speciesPlaceholder")}
                </option>
                {SPECIES_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.emoji} {t(opt.labelKey)}
                  </option>
                ))}
              </select>
              <SelectChevron />
            </div>
          </label>

          <label className="pet-fortune-field">
            <span className="pet-fortune-field-label">{t("labelName")}</span>
            <div className="pet-fortune-input">
              <input
                className="pet-fortune-input-field"
                placeholder={t("namePlaceholder")}
                type="text"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                required
                maxLength={40}
                autoComplete="off"
              />
            </div>
          </label>
        </div>

        <fieldset className="pet-fortune-field">
          <legend className="pet-fortune-field-label">{t("labelBirth")}</legend>
          <div className="grid grid-cols-3 gap-3">
            <label className="pet-fortune-date-cell">
              <span className="pet-fortune-date-hint">{t("yearPlaceholder")}</span>
              <div className="pet-fortune-input pet-fortune-input--date">
                <select
                  className="pet-fortune-input-field pet-fortune-select text-center"
                  value={year}
                  onChange={(e) => updateBirthDate({ year: e.target.value })}
                  required
                  aria-label={t("yearPlaceholder")}
                >
                  <option value="">{t("yearPlaceholder")}</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <SelectChevron />
              </div>
            </label>
            <label className="pet-fortune-date-cell">
              <span className="pet-fortune-date-hint">{t("monthPlaceholder")}</span>
              <div className="pet-fortune-input pet-fortune-input--date">
                <select
                  className="pet-fortune-input-field pet-fortune-select text-center"
                  value={month}
                  onChange={(e) => updateBirthDate({ month: e.target.value })}
                  required
                  aria-label={t("monthPlaceholder")}
                >
                  <option value="">{t("monthPlaceholder")}</option>
                  {months.map((m) => (
                    <option key={m} value={m}>
                      {isKo ? `${Number(m)}월` : m}
                    </option>
                  ))}
                </select>
                <SelectChevron />
              </div>
            </label>
            <label className="pet-fortune-date-cell">
              <span className="pet-fortune-date-hint">{t("dayPlaceholder")}</span>
              <div className="pet-fortune-input pet-fortune-input--date">
                <select
                  className="pet-fortune-input-field pet-fortune-select text-center"
                  value={day}
                  onChange={(e) => updateBirthDate({ day: e.target.value })}
                  required
                  aria-label={t("dayPlaceholder")}
                >
                  <option value="">{t("dayPlaceholder")}</option>
                  {days.map((d) => (
                    <option key={d} value={d}>
                      {isKo ? `${Number(d)}일` : d}
                    </option>
                  ))}
                </select>
                <SelectChevron />
              </div>
            </label>
          </div>
        </fieldset>
      </div>

      {displayError ? <p className="pet-fortune-entry-error">{displayError}</p> : null}

      <button type="submit" className="pet-fortune-entry-cta" disabled={loading}>
        <span className="pet-fortune-entry-stamp">{t("stamp")}</span>
        <span>{loading ? t("loading") : t("submit")}</span>
      </button>
    </form>
  );
}
