"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { useTransition } from "react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const isKo = locale === "ko";
  const displayLocales = ["en", "ko"] as const satisfies ReadonlyArray<(typeof routing.locales)[number]>;

  function switchLocale(next: (typeof routing.locales)[number]) {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <li className="relative flex h-8 w-[4.5rem] items-center rounded-full bg-white/50 p-0.5 text-[11px] font-semibold shadow-sm">
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-full bg-white shadow-sm transition-transform duration-200 ease-out ${
          isKo ? "translate-x-[calc(100%+4px)]" : "translate-x-0"
        }`}
      />
      {displayLocales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => switchLocale(loc)}
          disabled={isPending}
          className={`relative z-10 flex flex-1 items-center justify-center rounded-full py-1 transition disabled:opacity-60 ${
            locale === loc ? "font-extrabold text-primary" : "text-plum/45 hover:text-plum/70"
          }`}
          aria-current={locale === loc ? "true" : undefined}
        >
          {loc === "ko" ? "한" : "EN"}
        </button>
      ))}
    </li>
  );
}
