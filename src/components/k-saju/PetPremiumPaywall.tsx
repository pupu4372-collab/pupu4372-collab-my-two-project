"use client";

import { COMMUNITY_SOLID_SURFACE_CLASS } from "@/components/community/CommunityDetailSurface";
import { getSafeInternalReturnPath } from "@/lib/auth/safe-internal-return-path";
import { Link } from "@/i18n/navigation";
import {
  buildMbtiStandalonePaymentHref,
  buildPetPremiumPaymentHref,
  type PetPremiumContinuation,
  type PetPremiumReturnTo,
} from "@/lib/payments/pet-premium-unlock-client";
import { PET_PREMIUM_INCLUDES } from "@/lib/payments/pet-premium-shared";
import {
  formatPetProductPrice,
  PET_MBTI_STANDALONE_CODE,
  PET_PREMIUM_PACKAGE_CODE,
} from "@/lib/payments/pet-product-catalog";
import type { Locale } from "@/lib/saju/types";

const UI = {
  ko: {
    packageTitle: "프리미엄 패키지",
    packageSubtitle: "집사 궁합 · 별자리 케어 — 우리 아이 맞춤 케어 가이드 한 번에",
    mbtiTitle: "상세 MBTI",
    mbtiSubtitle: "행동 진단으로 우리 아이 성향 유형과 맞춤 케어 팁",
    included: "포함",
    notice: "결제 후 바로 이용할 수 있어요",
    priceNote: "1회 결제 · 해당 펫 영구 잠금 해제",
    payCta: (price: string) => `${price} 결제하기`,
    signupPayCta: "가입하고 구매하기",
    accountReason:
      "구매하신 리포트는 계정에 보관돼요. 다른 기기에서도 이어서 보실 수 있어요.",
  },
  en: {
    packageTitle: "Premium package",
    packageSubtitle: "You & your pet bond and zodiac care guides in one unlock",
    mbtiTitle: "Detailed MBTI",
    mbtiSubtitle: "Discover your pet's type and tailored care tips with a behavior check",
    included: "Included",
    notice: "Available right after payment",
    priceNote: "One-time payment · Permanent unlock for this pet",
    payCta: (price: string) => `Pay ${price}`,
    signupPayCta: "Sign up to purchase",
    accountReason:
      "Your report is saved to your account, so you can pick up where you left off on any device.",
  },
} as const;

type Props = {
  locale: Locale;
  continuation: Omit<PetPremiumContinuation, "returnTo">;
  returnTo?: PetPremiumReturnTo;
  loginRequired?: boolean;
};

function loginHrefWithNext(target: string) {
  return `/login?next=${encodeURIComponent(getSafeInternalReturnPath(target))}`;
}

export function PetPremiumPaywall({ locale, continuation, returnTo, loginRequired }: Props) {
  const priceLocale = locale === "en" ? "en" : "ko";
  const t = UI[priceLocale];
  const isMbti = returnTo === "mbti_standalone";
  const productCode = isMbti ? PET_MBTI_STANDALONE_CODE : PET_PREMIUM_PACKAGE_CODE;
  const price = formatPetProductPrice(productCode, priceLocale);
  const paymentHref = isMbti
    ? buildMbtiStandalonePaymentHref(continuation)
    : buildPetPremiumPaymentHref({ ...continuation, returnTo });
  const ctaHref = loginRequired ? loginHrefWithNext(paymentHref) : paymentHref;
  const includes = PET_PREMIUM_INCLUDES[priceLocale];

  return (
    <div className={`${COMMUNITY_SOLID_SURFACE_CLASS} space-y-5 p-6 text-center md:p-8`}>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-channel-saju/70">
          {isMbti ? t.mbtiTitle : t.packageTitle}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-plum/85">
          {isMbti ? t.mbtiSubtitle : t.packageSubtitle}
        </p>
        {!loginRequired ? (
          <p className="mt-3 text-sm font-semibold text-primary">{t.notice}</p>
        ) : null}
      </div>

      {!isMbti ? (
        <ul className="space-y-2 rounded-2xl border border-channel-saju/20 bg-lavender/30 px-4 py-3 text-left text-sm text-plum">
          {includes.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="rounded-full bg-channel-saju px-2 py-0.5 text-[10px] font-bold text-white">
                {t.included}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="rounded-2xl bg-sand/50 px-6 py-4">
        <p className="text-3xl font-extrabold text-primary">{price}</p>
        <p className="mt-1 text-xs text-on-surface-variant">{t.priceNote}</p>
      </div>

      <Link
        href={ctaHref}
        className="inline-flex w-full justify-center rounded-full bg-[#6f4b8b] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#6f4b8b]/35 transition hover:bg-[#5f3f78] active:scale-[0.98]"
      >
        {loginRequired ? t.signupPayCta : t.payCta(price)}
      </Link>

      {loginRequired ? (
        <p className="text-xs leading-relaxed text-plum/70">{t.accountReason}</p>
      ) : null}
    </div>
  );
}
