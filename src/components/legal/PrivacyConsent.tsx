"use client";

import { Link } from "@/i18n/navigation";

interface PrivacyConsentProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  locale: "en" | "ko";
  variant?: "default" | "pastel" | "pastelCompact";
}

const COPY = {
  en: {
    label:
      "I agree to the collection and use of my pet's birth data and pet photos for K-Saju analysis and service features.",
    detail:
      "Birth date/time is stored using the selected birth-region timezone and used for readings. Pet photos may be used for profile, Pet Show, and card-generation features when uploaded by you. We never sell personal data, and you can request deletion anytime.",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
  },
  ko: {
    label: "K-Saju 분석과 서비스 이용을 위해 반려동물 생년월일시 및 펫사진 수집·이용에 동의합니다.",
    detail:
      "생년월일시는 선택한 출생 지역 시간대 기준으로 저장되어 사주 분석에 사용됩니다. 업로드한 펫사진은 프로필, 우리아이 자랑, 카드 생성 기능에 사용될 수 있습니다. 개인정보는 판매하지 않으며, 언제든 삭제를 요청할 수 있습니다.",
    privacy: "개인정보처리방침",
    terms: "이용약관",
  },
};

export function PrivacyConsent({
  checked,
  onChange,
  locale,
  variant = "default",
}: PrivacyConsentProps) {
  const t = COPY[locale];
  const wrap =
    variant === "pastelCompact"
      ? "space-y-1.5 rounded-2xl bg-lavender/25 p-3"
      : variant === "pastel"
      ? "space-y-2 rounded-2xl bg-lavender/25 p-4"
      : "oriental-card space-y-2 p-4";
  const labelText =
    variant === "pastelCompact"
      ? "text-xs font-semibold leading-relaxed text-plum"
      : "text-sm font-semibold leading-relaxed text-plum";
  const detailText =
    variant === "pastelCompact"
      ? "pl-6 text-[11px] font-medium leading-relaxed text-plum/75"
      : "pl-7 text-xs font-medium leading-relaxed text-plum/75";
  const linkText =
    variant === "pastelCompact" ? "pl-6 text-[11px] font-semibold text-plum/75" : "pl-7 text-xs font-semibold text-plum/75";

  return (
    <div className={wrap}>
      <label className="flex cursor-pointer items-start gap-2.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 h-3.5 w-3.5 rounded border-plum/30 text-mint focus:ring-mint/40"
          required
        />
        <span className={labelText}>{t.label}</span>
      </label>
      <p className={detailText}>{t.detail}</p>
      <p className={linkText}>
        <Link href="/privacy" className="underline hover:text-plum">
          {t.privacy}
        </Link>
        {" · "}
        <Link href="/terms" className="underline hover:text-plum">
          {t.terms}
        </Link>
      </p>
    </div>
  );
}
