"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";

const TABS = [
  { href: "/community/pet-show", ko: "허브", en: "Hub" },
  { href: "/community/pet-show/upload", ko: "자랑 올리기", en: "Upload" },
  { href: "/community/pet-show/ranking", ko: "주간 랭킹", en: "Ranking" },
  { href: "/community/pet-show/snapzone", ko: "스냅존", en: "Snapzone" },
] as const;

function isActiveTab(pathname: string, href: (typeof TABS)[number]["href"]) {
  if (pathname === href) return true;
  return false;
}

export function PetShowNav() {
  const pathname = usePathname();
  const locale = useLocale();
  const isKo = locale === "ko";

  return (
    <nav
      className="sticky top-3 z-20 grid grid-cols-2 gap-2 rounded-2xl border border-channel-community/20 bg-white/90 p-1.5 text-sm font-extrabold text-plum shadow-md backdrop-blur-sm sm:grid-cols-4"
      aria-label={isKo ? "우리아이 자랑 메뉴" : "Pet Show menu"}
    >
      {TABS.map((tab) => {
        const active = isActiveTab(pathname, tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={
              active
                ? "rounded-xl bg-channel-community px-3 py-3 text-center text-white shadow-sm"
                : "rounded-xl px-3 py-3 text-center text-plum/60 transition hover:bg-channel-community/10 hover:text-channel-community"
            }
            aria-current={active ? "page" : undefined}
          >
            {isKo ? tab.ko : tab.en}
          </Link>
        );
      })}
    </nav>
  );
}
