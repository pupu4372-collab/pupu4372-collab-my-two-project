"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";

export function SajuHubPremiumSidebar() {
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
        </div>
        <div className="relative aspect-[4/5] overflow-hidden bg-surface-container-low">
          <Image
            src="/about/premium-report.png"
            alt=""
            fill
            className="object-cover object-top"
            sizes="(max-width: 1024px) 100vw, 320px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <p className="text-sm font-extrabold text-white">{t("premiumSidebarSampleTitle")}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-white/85">
              {t("premiumSidebarSampleHint")}
            </p>
          </div>
          <div
            className="pointer-events-none absolute inset-0 backdrop-blur-[2px] [mask-image:linear-gradient(to_top,black_35%,transparent_72%)]"
            aria-hidden
          />
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-channel-saju/15 bg-lavender/35 px-4 py-4">
        <p className="text-xs font-extrabold text-primary">{t("premiumSidebarInfoTitle")}</p>
        <p className="mt-2 text-xs leading-relaxed text-plum/80">{t("premiumSidebarInfo")}</p>
      </section>
    </aside>
  );
}
