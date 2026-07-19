"use client";

import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export function SajuHubVaultLink() {
  const t = useTranslations("saju");
  const { ready, configured, isAnonymous } = useSupabaseSession();

  if (!configured || !ready || isAnonymous) return null;

  return (
    <Link
      href="/reports"
      className="group box-border flex h-auto min-h-0 w-full flex-col items-center justify-center gap-3 rounded-[1.75rem] border border-petal/50 bg-petal px-4 py-5 text-center shadow-sm transition hover:border-petal hover:bg-petal/90 hover:shadow-md lg:h-full"
    >
      <span
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/70 text-3xl transition group-hover:bg-white"
        aria-hidden
      >
        📁
      </span>
      <span className="max-w-[8rem] text-sm font-extrabold leading-snug text-primary md:text-[0.9375rem]">
        {t("reportVaultLink")}
      </span>
    </Link>
  );
}
