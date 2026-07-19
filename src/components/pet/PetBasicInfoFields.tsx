"use client";

import { BirthDateSelect } from "@/components/k-saju/BirthDateSelect";
import {
  BIRTH_TIME_OPTIONS,
  getBirthTimeOptionLabel,
} from "@/lib/saju/birth-time-options";
import { COMMON_TIMEZONES } from "@/lib/saju/timezone";
import type { Gender, Locale } from "@/lib/saju/types";
import { useMemo } from "react";

export const PET_BASIC_INFO_UI = {
  en: {
    petGender: "Pet gender",
    petFemale: "Female",
    petMale: "Male",
    birthDate: "Birth date",
    birthTime: "Birth time",
    timezone: "Birth timezone",
    knowTime: "I know the time",
    unknownTime: "Unknown",
    unknownTimeHint:
      "You can still read the basic K-Saju from the date alone.",
    timezoneHint: "Calculated with the timezone of the birth region.",
    birthHeading: "When were they born?",
  },
  ko: {
    petGender: "동물 성별",
    petFemale: "암",
    petMale: "수",
    birthDate: "생년월일",
    birthTime: "출생 시간",
    timezone: "출생 지역 시간대",
    knowTime: "출생 시간을 알아요",
    unknownTime: "몰라요",
    unknownTimeHint: "시간을 몰라도 연·월·일 기준으로 기본 사주를 볼 수 있어요.",
    timezoneHint: "태어난 지역 기준 시간으로 계산해요.",
    birthHeading: "언제 태어났나요?",
  },
} as const;

const FIELD_LABEL_CLASS = "block text-sm font-bold text-primary";
const STITCH_INPUT_CLASS =
  "pastel-input mt-2 w-full min-w-0 max-w-full rounded-[2rem] border-transparent bg-sand/50 px-4 py-3.5 text-sm text-on-surface focus:ring-primary/20";

export type PetBasicInfoVariant = "stitch" | "stitch-embedded" | "compact";

export type PetBasicInfoFieldsProps = {
  locale: Locale;
  variant: PetBasicInfoVariant;
  petGender: Gender;
  onPetGenderChange: (gender: Gender) => void;
  birthDate: string;
  onBirthDateChange: (birthDate: string) => void;
  birthTime: string;
  onBirthTimeChange: (birthTime: string) => void;
  timezone: string;
  onTimezoneChange: (timezone: string) => void;
  showGender?: boolean;
  birthDateMinYear?: number;
};

function SelectChevron() {
  return (
    <span className="pet-fortune-select-chevron" aria-hidden>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function PetBasicInfoFields({
  locale,
  variant,
  petGender,
  onPetGenderChange,
  birthDate,
  onBirthDateChange,
  birthTime,
  onBirthTimeChange,
  timezone,
  onTimezoneChange,
  showGender = true,
  birthDateMinYear = 1990,
}: PetBasicInfoFieldsProps) {
  const t = PET_BASIC_INFO_UI[locale];
  const birthTimeUnknown = birthTime === "unknown";
  const isCompact = variant === "compact";
  const isEmbedded = variant === "stitch-embedded";

  const inputClass = isEmbedded
    ? "mt-1 w-full min-w-0 max-w-full rounded-xl border border-plum/10 bg-white px-3 py-2 text-xs leading-5 text-ink outline-none transition focus:border-mint/80 focus:shadow-[0_0_0_3px_rgba(168,230,207,0.25)]"
    : isCompact
      ? "pet-fortune-input-field pet-fortune-select min-w-0 max-w-full text-center"
      : STITCH_INPUT_CLASS;
  const labelClass = isEmbedded
    ? "block text-xs font-medium text-plum/80"
    : isCompact
      ? "pet-fortune-field"
      : FIELD_LABEL_CLASS;

  const timezoneOptions = useMemo(() => {
    const set = new Set<string>([...COMMON_TIMEZONES, timezone]);
    return Array.from(set);
  }, [timezone]);

  const genderField =
    showGender && !isEmbedded ? (
      isCompact ? (
        <label className="pet-fortune-field">
          <div className="pet-fortune-input pet-fortune-input--compact">
            <select
              className="pet-fortune-input-field pet-fortune-select"
              value={petGender}
              onChange={(e) => onPetGenderChange(e.target.value as Gender)}
              aria-label={t.petGender}
            >
              <option value="female">{t.petFemale}</option>
              <option value="male">{t.petMale}</option>
            </select>
            <SelectChevron />
          </div>
        </label>
      ) : (
        <fieldset>
          <legend className="sr-only">{t.petGender}</legend>
          <div className="flex gap-3">
            {(["male", "female"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onPetGenderChange(item)}
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
      )
    ) : null;

  const birthDateField = isCompact ? (
    <BirthDateSelect
      value={birthDate}
      onChange={onBirthDateChange}
      label=""
      locale={locale}
      layout="pet-fortune-compact"
      minYear={birthDateMinYear}
    />
  ) : (
    <BirthDateSelect
      value={birthDate}
      onChange={onBirthDateChange}
      label={t.birthDate}
      locale={locale}
      className={labelClass}
      selectClassName={
        isEmbedded
          ? inputClass
          : "w-full min-w-0 max-w-full rounded-2xl border-0 bg-surface-container-low px-3 py-3 text-center text-sm font-bold text-primary focus:ring-4 focus:ring-primary/10"
      }
    />
  );

  const birthTimeField = (
    <div className={isEmbedded ? "space-y-3" : isCompact ? "space-y-2" : "mt-6 space-y-4"}>
      <div
        className={
          isCompact
            ? "grid grid-cols-2 gap-1 rounded-full bg-stone-100 p-1"
            : "grid grid-cols-2 rounded-full bg-surface-container-low p-1"
        }
      >
        <button
          type="button"
          onClick={() => onBirthTimeChange(birthTime === "unknown" ? "11:30" : birthTime)}
          className={
            !birthTimeUnknown
              ? isCompact
                ? "rounded-full bg-white py-2 text-[11px] font-extrabold text-primary shadow-sm"
                : "rounded-full bg-white py-3 text-xs font-extrabold text-primary shadow-sm"
              : isCompact
                ? "rounded-full py-2 text-[11px] font-extrabold text-stone-600"
                : "rounded-full py-3 text-xs font-extrabold text-on-surface-variant"
          }
        >
          {t.knowTime}
        </button>
        <button
          type="button"
          onClick={() => onBirthTimeChange("unknown")}
          className={
            birthTimeUnknown
              ? isCompact
                ? "rounded-full bg-white py-2 text-[11px] font-extrabold text-primary shadow-sm"
                : "rounded-full bg-white py-3 text-xs font-extrabold text-primary shadow-sm"
              : isCompact
                ? "rounded-full py-2 text-[11px] font-extrabold text-stone-600"
                : "rounded-full py-3 text-xs font-extrabold text-on-surface-variant"
          }
        >
          {t.unknownTime}
        </button>
      </div>

      {birthTimeUnknown ? (
        isCompact ? null : (
          <p className="rounded-2xl bg-surface-container-low px-4 py-3 text-sm leading-6 text-on-surface-variant">
            {t.unknownTimeHint}
          </p>
        )
      ) : (
        <label className={labelClass}>
          {!isCompact ? t.birthTime : null}
          {isCompact ? (
            <div className="pet-fortune-input pet-fortune-input--compact">
              <select
                className={inputClass}
                value={birthTime}
                onChange={(e) => onBirthTimeChange(e.target.value)}
                aria-label={t.birthTime}
              >
                {BIRTH_TIME_OPTIONS.filter((option) => option.value !== "unknown").map((option) => (
                  <option key={option.value} value={option.value}>
                    {getBirthTimeOptionLabel(option, locale)}
                  </option>
                ))}
              </select>
              <SelectChevron />
            </div>
          ) : (
            <select
              value={birthTime}
              onChange={(e) => onBirthTimeChange(e.target.value)}
              className={inputClass}
            >
              {BIRTH_TIME_OPTIONS.filter((option) => option.value !== "unknown").map((option) => (
                <option key={option.value} value={option.value}>
                  {getBirthTimeOptionLabel(option, locale)}
                </option>
              ))}
            </select>
          )}
        </label>
      )}
    </div>
  );

  const timezoneField = (
    <label className={labelClass}>
      {!isCompact ? t.timezone : null}
      {isCompact ? (
        <div className="pet-fortune-input pet-fortune-input--compact">
          <select
            className="pet-fortune-input-field pet-fortune-select"
            value={timezone}
            onChange={(e) => onTimezoneChange(e.target.value)}
            aria-label={t.timezone}
          >
            {timezoneOptions.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
          <SelectChevron />
        </div>
      ) : (
        <select value={timezone} onChange={(e) => onTimezoneChange(e.target.value)} className={inputClass}>
          {timezoneOptions.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      )}
      {!isCompact && !isEmbedded ? (
        <p className="mt-2 text-xs leading-5 text-outline">{t.timezoneHint}</p>
      ) : null}
    </label>
  );

  if (isCompact) {
    return (
      <div className="space-y-3">
        {genderField}
        {birthDateField}
        {birthTimeField}
        {timezoneField}
      </div>
    );
  }

  return (
    <>
      {genderField}
      <section className={isEmbedded ? "space-y-3" : "rounded-[2rem] bg-white p-6 shadow-sm"}>
        {!isEmbedded ? (
          <h3 className="mb-6 text-2xl font-extrabold text-primary">{t.birthHeading}</h3>
        ) : null}
        {birthDateField}
        {birthTimeField}
      </section>
      <section className={isEmbedded ? "space-y-3" : "rounded-[2rem] bg-white p-6 shadow-sm"}>
        {timezoneField}
      </section>
    </>
  );
}
