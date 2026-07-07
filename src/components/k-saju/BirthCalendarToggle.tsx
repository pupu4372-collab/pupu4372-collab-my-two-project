"use client";

import type { BirthCalendarType, Locale } from "@/lib/saju/types";

const LABELS = {
  ko: { field: "양력 / 음력", solar: "양력", lunar: "음력" },
  en: { field: "Solar / Lunar", solar: "Solar", lunar: "Lunar" },
} as const;

interface BirthCalendarToggleProps {
  value: BirthCalendarType;
  onChange: (value: BirthCalendarType) => void;
  locale: Locale;
  className?: string;
  legendClassName?: string;
  compact?: boolean;
}

export function BirthCalendarToggle({
  value,
  onChange,
  locale,
  className = "",
  legendClassName = "block text-sm font-bold text-primary",
  compact = false,
}: BirthCalendarToggleProps) {
  const t = LABELS[locale];

  return (
    <fieldset className={className}>
      <legend className={legendClassName}>{t.field}</legend>
      <div
        className={
          compact
            ? "mt-1 grid grid-cols-2 rounded-full bg-sand/50 p-1"
            : "mt-2 grid grid-cols-2 rounded-full bg-surface-container-low p-1"
        }
      >
        {(["solar", "lunar"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className={
              value === item
                ? "rounded-full bg-white py-3 text-xs font-extrabold text-primary shadow-sm"
                : "rounded-full py-3 text-xs font-extrabold text-on-surface-variant"
            }
            aria-pressed={value === item}
          >
            {t[item]}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
