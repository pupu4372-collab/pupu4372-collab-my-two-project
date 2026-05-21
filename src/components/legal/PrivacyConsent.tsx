"use client";

interface PrivacyConsentProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  locale: "en" | "ko";
  variant?: "default" | "pastel";
}

const COPY = {
  en: {
    label: "I agree to the collection of my pet's birth data for K-Saju analysis.",
    detail:
      "We store birth date/time as UTC, use it only for readings, and never sell personal data. You can request deletion anytime.",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
  },
  ko: {
    label: "K-Saju 분석을 위해 반려동물 생년월일시 수집·이용에 동의합니다.",
    detail:
      "생년월일시는 UTC로 저장되며, 사주 분석 목적으로만 사용됩니다. 개인정보는 판매하지 않으며, 언제든 삭제를 요청할 수 있습니다.",
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
    variant === "pastel"
      ? "space-y-2 rounded-2xl bg-lavender/25 p-4"
      : "oriental-card space-y-2 p-4";

  return (
    <div className={wrap}>
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-plum/30 text-mint focus:ring-mint/40"
          required
        />
        <span className="text-sm leading-relaxed text-plum/90">{t.label}</span>
      </label>
      <p className="pl-7 text-xs leading-relaxed text-plum/55">{t.detail}</p>
      <p className="pl-7 text-xs text-plum/55">
        <a href="/privacy" className="underline hover:text-plum">
          {t.privacy}
        </a>
        {" · "}
        <a href="/terms" className="underline hover:text-plum">
          {t.terms}
        </a>
      </p>
    </div>
  );
}
