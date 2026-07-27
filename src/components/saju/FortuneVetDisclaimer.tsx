"use client";

import { useTranslations } from "next-intl";

const DEFAULT_CLASS =
  "mt-2.5 text-center text-[11px] leading-relaxed text-stone-500";

export function FortuneVetDisclaimer({ className }: { className?: string }) {
  const tFortune = useTranslations("fortune");
  return <p className={className ?? DEFAULT_CLASS}>{tFortune("vetDisclaimer")}</p>;
}
