import { Link } from "@/i18n/navigation";
import {
  PET_MBTI_STANDALONE_CODE,
  PET_PREMIUM_PACKAGE_CODE,
  formatPetProductPrice,
  type PetProductCode,
} from "@/lib/payments/pet-product-catalog";
import { PET_PREMIUM_INCLUDES, PET_PREMIUM_PRODUCT_LABELS } from "@/lib/payments/pet-premium-shared";
import {
  REPORT_TYPE_ORDER,
  REPORT_TYPE_SUBTITLES_EN,
  REPORT_TYPE_SUBTITLES_KO,
  formatPrice,
  getBundlePricing,
  getReportPrice,
  type HumanPremiumBundleKind,
  type PricingLocale,
} from "@/lib/reports/human-premium/pricing";
import {
  REPORT_TYPE_LABELS,
  REPORT_TYPE_LABELS_EN,
} from "@/lib/reports/human-premium/types";
import type { Metadata } from "next";

interface PricingPageProps {
  params: Promise<{ locale: string }>;
}

const PET_PRODUCT_ORDER: PetProductCode[] = [
  PET_MBTI_STANDALONE_CODE,
  PET_PREMIUM_PACKAGE_CODE,
];

const BUNDLE_ORDER: HumanPremiumBundleKind[] = ["all", "themepack", "timepack"];

function bundleLabel(kind: HumanPremiumBundleKind, isKo: boolean): string {
  if (kind === "all") {
    return isKo ? "K-Saju 올인원 번들" : "K-Saju all-in-one bundle";
  }
  return kind;
}

export async function generateMetadata({ params }: PricingPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale !== "en";
  return {
    title: isKo ? "이용요금" : "Pricing",
    description: isKo
      ? "K-Saju의 디지털 콘텐츠(사주 분석 리포트) 이용요금 안내"
      : "K-Saju digital content (saju analysis reports) pricing",
  };
}

export default async function PricingPage({ params }: PricingPageProps) {
  const { locale: localeParam } = await params;
  const isKo = localeParam !== "en";
  const priceLocale: PricingLocale = isKo ? "ko" : "en";
  const bundles = getBundlePricing(priceLocale);
  const petLabels = PET_PREMIUM_PRODUCT_LABELS[isKo ? "ko" : "en"];
  const petIncludes = PET_PREMIUM_INCLUDES[isKo ? "ko" : "en"];

  const title = isKo ? "이용요금" : "Pricing";
  const lead = isKo
    ? "K-Saju의 디지털 콘텐츠(사주 분석 리포트) 이용요금 안내"
    : "Pricing for K-Saju digital content (saju analysis reports)";

  return (
    <div className="min-h-screen night-sky-page px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-white md:text-3xl">{title}</h1>
          <p className="text-sm text-white/75 md:text-base">{lead}</p>
        </header>

        <section className="pastel-card space-y-4 p-5 md:p-6">
          <h2 className="text-lg font-semibold text-ink">
            {isKo ? "K-Saju 집사" : "K-Saju (human premium)"}
          </h2>
          <p className="text-sm text-plum">
            {isKo
              ? "개인 사주 분석 리포트 (디지털 콘텐츠)"
              : "Personal saju analysis reports (digital content)"}
          </p>
          <ul className="divide-y divide-plum/10">
            {REPORT_TYPE_ORDER.map((type) => {
              const name = isKo ? REPORT_TYPE_LABELS[type] : REPORT_TYPE_LABELS_EN[type];
              const blurb = isKo ? REPORT_TYPE_SUBTITLES_KO[type] : REPORT_TYPE_SUBTITLES_EN[type];
              const price = formatPrice(getReportPrice(type, priceLocale), priceLocale);
              return (
                <li
                  key={type}
                  className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                >
                  <div>
                    <p className="font-medium text-ink">{name}</p>
                    <p className="text-sm text-plum/80">{blurb}</p>
                  </div>
                  <p className="shrink-0 font-semibold text-ink">{price}</p>
                </li>
              );
            })}
          </ul>

          <div className="border-t border-plum/15 pt-4">
            <h3 className="mb-2 text-sm font-semibold text-ink">
              {isKo ? "번들" : "Bundles"}
            </h3>
            <ul className="divide-y divide-plum/10">
              {BUNDLE_ORDER.map((kind) => (
                <li
                  key={kind}
                  className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                >
                  <div>
                    <p className="font-medium text-ink">{bundleLabel(kind, isKo)}</p>
                  </div>
                  <p className="shrink-0 font-semibold text-ink">
                    {formatPrice(bundles[kind], priceLocale)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="pastel-card space-y-4 p-5 md:p-6">
          <h2 className="text-lg font-semibold text-ink">K-Saju Pet</h2>
          <p className="text-sm text-plum">
            {isKo
              ? "반려동물 프리미엄 디지털 콘텐츠"
              : "Pet premium digital content"}
          </p>
          <ul className="divide-y divide-plum/10">
            {PET_PRODUCT_ORDER.map((code) => {
              const name = petLabels[code];
              const blurb =
                code === PET_PREMIUM_PACKAGE_CODE ? petIncludes.join(" · ") : null;
              return (
                <li
                  key={code}
                  className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                >
                  <div>
                    <p className="font-medium text-ink">{name}</p>
                    {blurb ? <p className="text-sm text-plum/80">{blurb}</p> : null}
                  </div>
                  <p className="shrink-0 font-semibold text-ink">
                    {(() => {
                      const price = formatPetProductPrice(code, isKo ? "ko" : "en");
                      return !isKo && price.startsWith("₩") ? `${price} KRW` : price;
                    })()}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="pastel-card space-y-3 p-5 text-sm text-plum md:p-6">
          <h2 className="text-base font-semibold text-ink">
            {isKo ? "결제 · 환불 안내" : "Payment & refunds"}
          </h2>
          <p>
            {isKo
              ? "결제수단: 신용카드 등 (서비스에서 제공하는 PG 결제)"
              : "Payment methods: credit card and other methods offered via our payment gateway."}
          </p>
          <p>
            {isKo ? (
              <>
                디지털 콘텐츠 특성상 리포트 열람 후에는 단순 변심 환불이 제한될 수 있습니다. 자세한
                내용은{" "}
                <Link
                  href="/refund-policy"
                  className="font-medium text-ink underline hover:text-plum"
                >
                  환불 정책
                </Link>
                을 확인해 주세요.
              </>
            ) : (
              <>
                Because this is digital content, refunds may be limited after a report has been
                viewed. See our{" "}
                <Link
                  href="/refund-policy"
                  className="font-medium text-ink underline hover:text-plum"
                >
                  Refund Policy
                </Link>
                .
              </>
            )}
          </p>
        </section>
      </div>
    </div>
  );
}
