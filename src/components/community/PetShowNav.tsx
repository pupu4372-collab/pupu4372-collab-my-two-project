"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";

const TABS = [
  { href: "/community/pet-show", ko: "메인허브", en: "Main Hub" },
  { href: "/community/pet-show/ranking", ko: "랭킹", en: "Ranking" },
  { href: "/community/pet-show/snapzone", ko: "스냅존", en: "Snapzone" },
  { href: "/community/pet-show/fails", ko: "실패사진", en: "Fails" },
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
      className="sticky top-3 z-20 grid grid-cols-4 gap-2 rounded-2xl border border-white/35 bg-white/95 p-1.5 text-sm font-extrabold text-plum shadow-md"
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
