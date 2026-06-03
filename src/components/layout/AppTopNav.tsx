"use client";

import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { Link } from "@/i18n/navigation";
import { signOut } from "@/lib/supabase/auth-client";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

type NavKey = "home" | "dog" | "cat" | "reptile" | "saju" | "community" | "profile";

const NAV_LINKS: Array<{
  key: NavKey;
  href: "/" | "/dog" | "/cat" | "/reptile" | "/saju" | "/community" | "/profile";
}> = [
  { key: "home", href: "/" },
  { key: "dog", href: "/dog" },
  { key: "cat", href: "/cat" },
  { key: "reptile", href: "/reptile" },
  { key: "saju", href: "/saju" },
  { key: "community", href: "/community" },
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
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-5 md:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/75 text-xl shadow-sm" aria-hidden>
            🐾
          </span>
          <span className="text-xl font-extrabold tracking-tight text-primary md:text-2xl">{nav("brand")}</span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex" aria-label={isKo ? "주요 메뉴" : "Main navigation"}>
          {NAV_LINKS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={
                active === item.key
                  ? "rounded-full bg-primary px-4 py-2 text-sm font-extrabold text-white shadow-sm"
                  : "rounded-full px-4 py-2 text-sm font-bold text-plum/65 transition hover:bg-white/65 hover:text-primary"
              }
            >
              {nav(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ul className="hidden md:block">
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
