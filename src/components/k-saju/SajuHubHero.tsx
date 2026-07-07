"use client";

import { useTranslations } from "next-intl";

export function SajuHubHero() {
  const t = useTranslations("saju");

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-channel-saju/20 bg-white px-5 py-5 shadow-sm md:px-6 md:py-6">
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-channel-saju">
        ✨ K-Saju Pet
      </p>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-primary md:text-3xl">
        {t("hubTitle")}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-on-surface-variant md:text-[0.9375rem]">
        {t("hubSubtitle")}
      </p>
    </section>
  );
}
