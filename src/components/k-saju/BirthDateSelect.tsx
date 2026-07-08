"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

type Locale = "ko" | "en";

interface BirthDateSelectProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  locale: Locale;
  className?: string;
  selectClassName?: string;
  minYear?: number;
  maxYear?: number;
  layout?: "default" | "pet-fortune-compact";
}

const COPY = {
  ko: {
    year: "연도 선택",
    month: "월 선택",
    day: "일 선택",
    monthSuffix: "월",
    daySuffix: "일",
  },
  en: {
    year: "Select year",
    month: "Select month",
    day: "Select day",
    monthSuffix: "",
    daySuffix: "",
  },
};

function splitDate(value: string) {
  const [year = "", month = "", day = ""] = value.split("-");
  return { year, month, day };
}

function daysInMonth(year: string, month: string) {
  if (!month) return 31;
  const y = Number(year || new Date().getFullYear());
  const m = Number(month);
  return new Date(y, m, 0).getDate();
}

function formatDatePart(year: string, month: string, day: string) {
  if (!year || !month || !day) return "";
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
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

export function BirthDateSelect({
  value,
  onChange,
  label,
  locale,
  className = "block text-sm font-medium text-plum/80",
  selectClassName = "pastel-input",
  minYear = 1900,
  maxYear = new Date().getFullYear(),
  layout = "default",
}: BirthDateSelectProps) {
  const t = COPY[locale];
  const [draft, setDraft] = useState(splitDate(value));
  const { year, month, day } = draft;

  useEffect(() => {
    if (value) setDraft(splitDate(value));
  }, [value]);

  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = maxYear; y >= minYear; y -= 1) list.push(y);
    return list;
  }, [maxYear, minYear]);

  const dayCount = daysInMonth(year, month);
  const days = useMemo(
    () => Array.from({ length: dayCount }, (_, i) => String(i + 1).padStart(2, "0")),
    [dayCount]
  );

  function update(next: Partial<{ year: string; month: string; day: string }>) {
    const nextYear = next.year ?? year;
    const nextMonth = next.month ?? month;
    let nextDay = next.day ?? day;

    const maxDay = daysInMonth(nextYear, nextMonth);
    if (nextDay && Number(nextDay) > maxDay) {
      nextDay = String(maxDay).padStart(2, "0");
    }

    const nextDraft = { year: nextYear, month: nextMonth, day: nextDay };
    setDraft(nextDraft);

    const completeDate = formatDatePart(nextYear, nextMonth, nextDay);
    if (completeDate) onChange(completeDate);
  }

  const isFortuneCompact = layout === "pet-fortune-compact";
  const selectClass = isFortuneCompact
    ? "pet-fortune-input-field pet-fortune-select text-center"
    : selectClassName;

  function renderSelect(select: ReactNode) {
    if (!isFortuneCompact) return select;

    return (
      <label className="pet-fortune-date-cell">
        <div className="pet-fortune-input pet-fortune-input--date pet-fortune-input--compact">
          {select}
          <SelectChevron />
        </div>
      </label>
    );
  }

  const grid = (
    <div className={isFortuneCompact ? "grid grid-cols-3 gap-2" : "mt-1 grid grid-cols-3 gap-2"}>
      {renderSelect(
        <select
          value={year}
          onChange={(e) => update({ year: e.target.value })}
          className={selectClass}
          required
          aria-label={t.year}
        >
          <option value="">{isFortuneCompact ? (locale === "ko" ? "연도" : "Year") : t.year}</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      )}
      {renderSelect(
        <select
          value={month}
          onChange={(e) => update({ month: e.target.value })}
          className={selectClass}
          required
          aria-label={t.month}
        >
          <option value="">{isFortuneCompact ? (locale === "ko" ? "월" : "Month") : t.month}</option>
          {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((m) => (
            <option key={m} value={m}>
              {locale === "ko" ? `${Number(m)}${t.monthSuffix}` : m}
            </option>
          ))}
        </select>
      )}
      {renderSelect(
        <select
          value={day}
          onChange={(e) => update({ day: e.target.value })}
          className={selectClass}
          required
          aria-label={t.day}
        >
          <option value="">{isFortuneCompact ? (locale === "ko" ? "일" : "Day") : t.day}</option>
          {days.map((d) => (
            <option key={d} value={d}>
              {locale === "ko" ? `${Number(d)}${t.daySuffix}` : d}
            </option>
          ))}
        </select>
      )}
    </div>
  );

  if (isFortuneCompact) {
    return grid;
  }

  return (
    <div className={className}>
      <span>{label}</span>
      {grid}
    </div>
  );
}
