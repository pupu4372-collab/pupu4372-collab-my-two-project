"use client";

import { withJosa } from "@/lib/i18n/korean-josa";
import { validatePetPhotoFile } from "@/lib/pets/validate-pet-photo-file";
import type { Locale } from "@/lib/saju/types";
import { useEffect, useMemo, useRef, useState } from "react";

const UI = {
  ko: {
    label: "펫 사진 (선택)",
    hint: (name: string) =>
      `사진을 등록하면 인스타공유 카드에 ${withJosa(name, "이/가")} 담겨요`,
    pick: "사진 선택",
    change: "다른 사진 선택",
    remove: "사진 제거",
    consent:
      "사진을 서비스 개선(AI 학습)과 콘텐츠 제작에 활용하는 데 동의합니다 (선택)",
    fallbackName: "우리 아이",
  },
  en: {
    label: "Pet photo (optional)",
    hint: (name: string) => `Add a photo and ${name} appears on Instagram share cards`,
    pick: "Choose photo",
    change: "Choose another",
    remove: "Remove photo",
    consent:
      "I agree to optional use of this photo for service improvement (AI training) and content production",
    fallbackName: "your pet",
  },
} as const;

type Props = {
  locale: Locale;
  petName: string;
  disabled?: boolean;
  file: File | null;
  consent: boolean;
  fileError: string | null;
  currentPhotoUrl?: string | null;
  onFileChange: (file: File | null, error: string | null) => void;
  onConsentChange: (consent: boolean) => void;
};

export function PetPhotoUploadField({
  locale,
  petName,
  disabled = false,
  file,
  consent,
  fileError,
  currentPhotoUrl,
  onFileChange,
  onConsentChange,
}: Props) {
  const isKo = locale === "ko";
  const t = UI[locale];
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const displayName = useMemo(() => {
    const trimmed = petName.trim();
    return trimmed || t.fallbackName;
  }, [petName, t.fallbackName]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const shownPreview = previewUrl ?? currentPhotoUrl ?? null;

  function handlePick(next: File | null) {
    if (!next) {
      onFileChange(null, null);
      return;
    }
    const error = validatePetPhotoFile(next, isKo);
    if (error) {
      onFileChange(null, error);
      return;
    }
    onFileChange(next, null);
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-bold text-primary">{t.label}</p>
        <p className="mt-1 text-xs leading-5 text-on-surface-variant">{t.hint(displayName)}</p>
      </div>

      {shownPreview ? (
        <div className="overflow-hidden rounded-2xl border border-petal/60 bg-sand/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={shownPreview} alt="" className="max-h-48 w-full object-cover" />
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="rounded-full border border-channel-saju/25 bg-white px-4 py-2 text-xs font-semibold text-channel-saju transition hover:bg-channel-saju/5 disabled:opacity-60"
        >
          {shownPreview ? t.change : t.pick}
        </button>
        {file ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              handlePick(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-600 transition hover:bg-stone-50 disabled:opacity-60"
          >
            {t.remove}
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        disabled={disabled}
        onChange={(e) => handlePick(e.target.files?.[0] ?? null)}
      />

      {fileError ? (
        <p className="text-xs font-semibold text-red-700" role="alert">
          {fileError}
        </p>
      ) : null}

      {file ? (
        <label className="flex items-start gap-2 rounded-2xl border border-petal/50 bg-sand/30 px-3 py-3 text-xs leading-5 text-plum/80">
          <input
            type="checkbox"
            checked={consent}
            disabled={disabled}
            onChange={(e) => onConsentChange(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-plum/20"
          />
          <span>{t.consent}</span>
        </label>
      ) : null}
    </div>
  );
}
