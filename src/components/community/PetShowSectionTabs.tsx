"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const TABS = [
  { id: "show" as const, href: "/community/pet-show", labelKey: "tabShow" as const },
  { id: "challenge" as const, href: "/community/challenge", labelKey: "tabChallenge" as const },
];

function isShowTab(pathname: string) {
  return pathname === "/community/pet-show" || pathname.startsWith("/community/pet-show/");
}

function isChallengeTab(pathname: string) {
  return pathname === "/community/challenge" || pathname.startsWith("/community/challenge/");
}

export function PetShowSectionTabs() {
  const pathname = usePathname();
  const t = useTranslations("petshow");

  return (
    <nav
      className="grid grid-cols-2 gap-2 rounded-2xl border border-white/35 bg-white/95 p-1.5 text-sm font-extrabold text-plum shadow-md"
      aria-label={t("sectionNavLabel")}
    >
      {TABS.map((tab) => {
        const active = tab.id === "show" ? isShowTab(pathname) : isChallengeTab(pathname);
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={
              active
                ? "rounded-xl bg-channel-community px-3 py-3 text-center text-white shadow-sm"
                : "rounded-xl px-3 py-3 text-center text-plum/60 transition hover:bg-channel-community/10 hover:text-channel-community"
            }
            aria-current={active ? "page" : undefined}
          >
            {t(tab.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
