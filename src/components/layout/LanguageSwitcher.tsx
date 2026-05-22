"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useLocale } from "next-intl";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(next: (typeof routing.locales)[number]) {
    router.replace(pathname, { locale: next });
  }

  return (
    <li className="flex items-center gap-1 rounded-full bg-white/50 p-0.5 text-[11px] font-semibold">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => switchLocale(loc)}
          className={
            locale === loc
              ? "rounded-full bg-plum px-2.5 py-1 text-white"
              : "rounded-full px-2.5 py-1 text-plum/60 hover:text-plum"
          }
          aria-current={locale === loc ? "true" : undefined}
        >
          {loc === "ko" ? "KO" : "EN"}
        </button>
      ))}
    </li>
  );
}
