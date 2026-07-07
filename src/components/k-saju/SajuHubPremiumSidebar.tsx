"use client";

import { PremiumReportPreviewSample } from "@/components/k-saju/PremiumReportPreviewSample";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";

export function SajuHubPremiumSidebar() {
  const routeLocale = useLocale();
  const locale = routeLocale === "en" ? "en" : "ko";
  const t = useTranslations("saju");

  return (
    <aside className="space-y-4">
      <section className="overflow-hidden rounded-[1.75rem] bg-primary p-5 text-cream shadow-xl">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-cream/70">
          Premium
        </p>
        <h2 className="mt-2 text-lg font-extrabold leading-snug">{t("premiumTitle")}</h2>
        <p className="mt-2 text-xs leading-relaxed text-cream/80">{t("premiumSubtitle")}</p>
        <span className="mt-4 inline-flex rounded-full border border-cream/25 bg-cream/15 px-3 py-1 text-[11px] font-bold text-cream">
          {t("premiumDailyFree")}
        </span>
        <Link
          href="/premium/human"
          className="mt-4 flex w-full items-center justify-center rounded-full bg-cream px-5 py-3 text-sm font-bold leading-none text-primary transition hover:bg-white"
        >
          {t("premium")}
        </Link>
      </section>

      <section className="overflow-hidden rounded-[1.75rem] border border-channel-saju/20 bg-white shadow-sm">
        <div className="border-b border-channel-saju/10 px-4 py-3">
          <p className="text-xs font-extrabold text-channel-saju">{t("premiumSidebarSampleLabel")}</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-plum/65">{t("premiumSidebarSampleHint")}</p>
        </div>
        <PremiumReportPreviewSample locale={locale} />
      </section>

      <section className="rounded-[1.75rem] border border-channel-saju/20 bg-cream px-4 py-4 shadow-sm">
        <p className="text-xs font-extrabold text-ink">{t("premiumSidebarInfoTitle")}</p>
        <p className="mt-2 text-xs leading-relaxed text-plum">{t("premiumSidebarInfo")}</p>
      </section>
    </aside>
  );
}
