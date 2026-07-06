"use client";

import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import type { Species } from "@/lib/saju/types";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState, type FormEvent } from "react";

const SPECIES_OPTIONS: { value: Species; emoji: string; labelKey: "dog" | "cat" | "reptile" | "otherFriends" }[] = [
  { value: "dog", emoji: "🐕", labelKey: "dog" },
  { value: "cat", emoji: "🐱", labelKey: "cat" },
  { value: "reptile", emoji: "🦎", labelKey: "reptile" },
  { value: "other", emoji: "🐾", labelKey: "otherFriends" },
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
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

type Props = {
  onAdded?: (petId: string) => void;
};

export function PetFortuneSajuGuide() {
  const t = useTranslations("home.guestFortune");
  const tNav = useTranslations("nav");

  return (
    <div className="pet-fortune-saju-guide-box">
      <p className="pet-fortune-saju-guide-line">{t("quickAddGuideLine1")}</p>
      <p className="pet-fortune-saju-guide-line">
        {t("quickAddGuideLine2Before")}
        <Link href="/saju" className="pet-fortune-saju-guide-link">
          {tNav("saju")}
        </Link>
        {t("quickAddGuideLine2After")}
      </p>
    </div>
  );
}

export function PetFortuneQuickAddForm({ onAdded }: Props) {
  const locale = useLocale();
  const isKo = locale === "ko";
  const t = useTranslations("home.guestFortune");
  const { accessToken } = useSupabaseSession();
  const [petName, setPetName] = useState("");
  const [species, setSpecies] = useState<Species | "">("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!species || !accessToken) return;

    const y = Number(year);
    const m = Number(month);
    const d = Number(day);
    if (!y || !m || !d) {
      setError(t("invalidDate"));
      return;
    }

    const birthDate = `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const parsed = new Date(`${birthDate}T12:00:00`);
    if (Number.isNaN(parsed.getTime()) || parsed.getUTCMonth() + 1 !== m || parsed.getUTCDate() !== d) {
      setError(t("invalidDate"));
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Seoul";

    try {
      const res = await fetch("/api/saju/basic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          petName: petName.trim(),
          species,
          birthDate,
          birthTime: null,
          birthTimeUnknown: true,
          timezone,
          locale,
          privacyConsent: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : isKo ? "등록에 실패했어요." : "Could not add pet.");
        return;
      }
      if (!data.petId) {
        setError(
          typeof data.persistError === "string" && data.persistError
            ? data.persistError
            : isKo
              ? "로그인 후 다시 시도해 주세요."
              : "Please log in and try again."
        );
        return;
      }

      const addedName = petName.trim();
      setPetName("");
      setSpecies("");
      setYear("");
      setMonth("");
      setDay("");
      setMessage(isKo ? `${addedName || "펫"}이(가) 추가됐어요!` : "Pet added!");
      onAdded?.(data.petId as string);
    } catch {
      setError(isKo ? "네트워크 오류가 발생했어요." : "Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pet-fortune-quick-add">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
        <div className="grid grid-cols-1 gap-3">
          <label className="pet-fortune-field">
            <div className="pet-fortune-input pet-fortune-input--saju pet-fortune-input--compact">
              <select
                className="pet-fortune-input-field pet-fortune-select"
                value={species}
                onChange={(e) => setSpecies(e.target.value as Species | "")}
                required
                aria-label={t("labelSpecies")}
              >
                <option value="" disabled>
                  {t("quickAddSpeciesPlaceholder")}
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
            <div className="pet-fortune-input pet-fortune-input--compact">
              <input
                className="pet-fortune-input-field"
                placeholder={t("namePlaceholder")}
                type="text"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                required
                maxLength={40}
                autoComplete="off"
                aria-label={t("labelName")}
              />
            </div>
          </label>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <label className="pet-fortune-date-cell">
            <div className="pet-fortune-input pet-fortune-input--date pet-fortune-input--compact">
              <select
                className="pet-fortune-input-field pet-fortune-select text-center"
                value={year}
                onChange={(e) => updateBirthDate({ year: e.target.value })}
                required
                aria-label={t("yearPlaceholder")}
              >
                <option value="">{t("quickAddYear")}</option>
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
            <div className="pet-fortune-input pet-fortune-input--date pet-fortune-input--compact">
              <select
                className="pet-fortune-input-field pet-fortune-select text-center"
                value={month}
                onChange={(e) => updateBirthDate({ month: e.target.value })}
                required
                aria-label={t("monthPlaceholder")}
              >
                <option value="">{t("quickAddMonth")}</option>
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
            <div className="pet-fortune-input pet-fortune-input--date pet-fortune-input--compact">
              <select
                className="pet-fortune-input-field pet-fortune-select text-center"
                value={day}
                onChange={(e) => updateBirthDate({ day: e.target.value })}
                required
                aria-label={t("dayPlaceholder")}
              >
                <option value="">{t("quickAddDay")}</option>
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

        {error ? <p className="pet-fortune-entry-error !mt-0 !py-2">{error}</p> : null}
        {message ? <p className="text-center text-xs font-semibold text-channel-community">{message}</p> : null}

        <button type="submit" className="pet-fortune-quick-add-btn" disabled={loading || !accessToken}>
          {loading ? t("loading") : t("quickAddSubmit")}
        </button>
      </form>
    </div>
  );
}
