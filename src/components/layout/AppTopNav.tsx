"use client";

import { AuthRequiredLink } from "@/components/auth/AuthRequiredLink";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { Link } from "@/i18n/navigation";
import { signOut } from "@/lib/supabase/auth-client";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

type NavKey = "home" | "dog" | "cat" | "reptile" | "saju" | "challenge" | "community" | "support" | "profile";

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

const NAV_LINK_CLASS =
  "inline-flex min-h-[2.25rem] min-w-[2.5rem] items-center justify-center rounded-full px-2 py-1 text-center text-[11px] font-bold leading-none sm:px-2.5 sm:text-xs lg:px-3 lg:text-sm";

const NAV_LINKS: Array<{
  key: NavKey;
  href:
    | "/"
    | "/dog"
    | "/cat"
    | "/reptile"
    | "/saju"
    | "/community/challenge"
    | "/community"
    | "/support"
    | "/profile";
}> = [
  { key: "home", href: "/" },
  { key: "dog", href: "/dog" },
  { key: "cat", href: "/cat" },
  { key: "reptile", href: "/reptile" },
  { key: "saju", href: "/saju" },
  { key: "challenge", href: "/community/challenge" },
  { key: "community", href: "/community" },
  { key: "support", href: "/support" },
  { key: "profile", href: "/profile" },
];

interface AppTopNavProps {
  active?: NavKey;
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

  return (
    <header className="sticky top-0 z-50 border-b border-white/45 bg-cream/80 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-2 md:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/75 text-xl shadow-sm" aria-hidden>
            🐾
          </span>
          <span className="text-xl font-extrabold tracking-tight text-primary md:text-2xl">{nav("brand")}</span>
        </Link>

        <nav
          className="hidden flex-1 flex-wrap items-center justify-center gap-1 md:flex lg:gap-1.5"
          aria-label={isKo ? "주요 메뉴" : "Main navigation"}
        >
          {NAV_LINKS.map((item) => {
            const className =
              active === item.key
                ? `${NAV_LINK_CLASS} bg-primary font-extrabold text-white shadow-sm`
                : `${NAV_LINK_CLASS} text-plum/65 transition hover:bg-white/65 hover:text-primary`;

            if (item.key === "home") {
              return (
                <Link key={item.key} href={item.href} className={className}>
                  <NavLabel label={nav(item.key)} />
                </Link>
              );
            }

            return (
              <AuthRequiredLink key={item.key} href={item.href} className={className}>
                <NavLabel label={nav(item.key)} />
              </AuthRequiredLink>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ul className="block">
            <LanguageSwitcher />
          </ul>
          {isSignedIn ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="hidden max-w-32 truncate rounded-full bg-white/70 px-3 py-2 text-xs font-extrabold text-primary shadow-sm transition hover:bg-white sm:block"
                title={email ?? nav("account")}
              >
                {email?.split("@")[0] ?? nav("account")}
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
