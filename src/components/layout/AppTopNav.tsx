"use client";

import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { Link } from "@/i18n/navigation";
import { signOut } from "@/lib/supabase/auth-client";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";

type NavKey = "home" | "dog" | "cat" | "reptile" | "saju" | "community";
/** Removed from nav bar but still accepted so sub-pages do not break active-state typing. */
type NavActiveKey = NavKey | "challenge" | "support" | "profile";

function splitNavLabel(label: string): string[] {
  if (label.length < 4) return [label];

  const paren = label.indexOf("(");
  if (paren > 0 && paren < label.length - 1) {
    return [label.slice(0, paren), label.slice(paren)];
  }

  const space = label.indexOf(" ");
  if (space > 0 && space < label.length - 1) {
    return [label.slice(0, space), label.slice(space + 1)];
  }

  const chars = [...label];
  const mid = Math.ceil(chars.length / 2);
  return [chars.slice(0, mid).join(""), chars.slice(mid).join("")];
}

function NavLabel({ label }: { label: string }) {
  const lines = splitNavLabel(label);

  if (lines.length === 1) {
    return <span className="whitespace-nowrap">{lines[0]}</span>;
  }

  return (
    <span className="inline-flex min-w-[2.5rem] flex-col items-center justify-center text-center leading-[1.12]">
      {lines.map((line) => (
        <span key={line} className="block whitespace-nowrap">
          {line}
        </span>
      ))}
    </span>
  );
}

const NAV_LINK_BASE =
  "inline-flex min-h-[2.25rem] min-w-[2.5rem] items-center justify-center border-b-2 px-2 py-1 text-center text-[11px] font-bold leading-none transition sm:px-2.5 sm:text-xs lg:px-3 lg:text-sm";

const MAIN_NAV_LINKS: Array<{
  key: Exclude<NavKey, "saju">;
  href: "/" | "/dog" | "/cat" | "/reptile" | "/community";
}> = [
  { key: "home", href: "/" },
  { key: "dog", href: "/dog" },
  { key: "cat", href: "/cat" },
  { key: "reptile", href: "/reptile" },
  { key: "community", href: "/community" },
];

const SAJU_CTA_BASE =
  "inline-flex shrink-0 items-center justify-center rounded-full bg-primary px-3 py-2 text-xs font-extrabold text-white shadow-sm transition hover:brightness-105 lg:px-4 lg:text-sm";

interface AppTopNavProps {
  active?: NavActiveKey;
}

export function AppTopNav({ active = "home" }: AppTopNavProps) {
  const nav = useTranslations("nav");
  const locale = useLocale();
  const isKo = locale === "ko";
  const { ready, configured, isAnonymous, email, refresh } = useSupabaseSession();
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    setSigningOut(true);
    try {
      await signOut();
      await refresh();
      window.location.href = "/";
    } catch {
      setSigningOut(false);
    }
  }

  const isSignedIn = configured && ready && !isAnonymous;
  const accountLabel = email?.split("@")[0] ?? nav("account");
  const isSajuActive = active === "saju";

  return (
    <header className="sticky top-0 z-50 border-b border-white/45 bg-cream/80 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-2 md:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/stitch/brand/symbol-master-transparent.png"
            alt="K-Saju Pet"
            width={28}
            height={28}
            className="h-7 w-7"
            priority
          />
          <span className="text-xl font-extrabold tracking-tight text-primary md:text-2xl">{nav("brand")}</span>
        </Link>

        <nav
          className="hidden flex-1 flex-wrap items-center justify-center gap-1 md:flex lg:gap-1.5"
          aria-label={isKo ? "주요 메뉴" : "Main navigation"}
        >
          {MAIN_NAV_LINKS.map((item) => {
            const isActive = active === item.key;
            const className = isActive
              ? `${NAV_LINK_BASE} border-primary font-extrabold text-primary`
              : `${NAV_LINK_BASE} border-transparent text-plum/65 hover:border-primary/25 hover:text-primary`;

            return (
              <Link
                key={item.key}
                href={item.href}
                className={className}
                aria-current={isActive ? "page" : undefined}
              >
                <NavLabel label={nav(item.key)} />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/saju"
            className={`${SAJU_CTA_BASE} hidden md:inline-flex ${isSajuActive ? "brightness-95 shadow-md" : ""}`}
            aria-current={isSajuActive ? "page" : undefined}
          >
            <span className="whitespace-nowrap">{nav("saju")}</span>
          </Link>
          <ul className="block">
            <LanguageSwitcher />
          </ul>
          {isSignedIn ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="max-w-[5.25rem] cursor-pointer truncate rounded-full bg-white/70 px-2.5 py-2 text-xs font-extrabold text-primary shadow-sm transition hover:bg-white hover:shadow-md active:bg-white/90 sm:max-w-32 sm:px-3"
                title={email ?? nav("account")}
                aria-label={`${nav("profile")}: ${accountLabel}`}
              >
                {accountLabel}
              </Link>
              <button
                type="button"
                onClick={() => void handleLogout()}
                disabled={signingOut}
                className="rounded-full bg-primary px-3 py-2 text-xs font-extrabold text-white shadow-sm transition hover:brightness-105 disabled:opacity-60"
              >
                {signingOut ? nav("loggingOut") : nav("logout")}
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-primary px-4 py-2 text-xs font-extrabold text-white shadow-sm transition hover:brightness-105"
            >
              {nav("login")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
