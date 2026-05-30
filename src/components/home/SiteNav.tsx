"use client";

import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { Link, usePathname } from "@/i18n/navigation";
import { signOut } from "@/lib/supabase/auth-client";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";

export function SiteNav() {
  const pathname = usePathname();
  const { ready, isAnonymous, email, accessToken, configured, refresh } = useSupabaseSession();
  const t = useTranslations("nav");
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!configured || !ready || isAnonymous || !accessToken) {
      setDisplayName(null);
      return;
    }

    async function loadProfileName() {
      try {
        const res = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        setDisplayName(data.profile?.display_name ?? null);
      } catch {
        setDisplayName(null);
      }
    }

    void loadProfileName();
  }, [configured, ready, isAnonymous, accessToken]);

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

  const profileHref = configured && ready && isAnonymous ? "/login" : "/profile";
  const NAV = [
    { label: t("home"), href: "/" as const },
    { label: t("dog"), href: "/dog" as const },
    { label: t("cat"), href: "/cat" as const },
    { label: t("saju"), href: "/saju" as const },
    { label: t("community"), href: "/community" as const },
    { label: t("profile"), href: profileHref },
  ];

  return (
    <nav className="relative z-20 flex items-center justify-between px-5 py-5 md:px-10">
      <div className="flex flex-col items-start">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="relative h-9 w-9 overflow-hidden rounded-full bg-white/70 shadow-sm md:h-11 md:w-11" aria-hidden>
            <Image
              src="/images/home-dog-moon.png"
              alt=""
              fill
              sizes="44px"
              unoptimized
              className="object-cover object-[58%_42%]"
            />
          </span>
          <span className="text-2xl font-extrabold tracking-tight text-plum md:text-[2.5rem]">
            {t("brand")}
          </span>
        </Link>
        {configured && ready && !isAnonymous && (
          <div className="mt-0.5 flex w-56 self-center overflow-hidden rounded-full bg-white/55 text-xs font-semibold text-plum/70 md:w-72">
            <span
              className="min-w-0 flex-1 truncate px-4 py-1 text-center"
              title={displayName ?? email ?? t("account")}
            >
              {displayName ?? email?.split("@")[0] ?? t("account")}
            </span>
            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={signingOut}
              className="shrink-0 border-l border-plum/10 px-3 py-1 text-[11px] text-plum/65 transition hover:bg-petal/35 hover:text-plum disabled:opacity-60"
            >
              {signingOut ? t("loggingOut") : t("logout")}
            </button>
          </div>
        )}
      </div>
      <ul className="flex flex-wrap items-center justify-end gap-2 text-xs font-medium text-plum/90 sm:gap-4 sm:text-sm md:gap-6 md:text-[15px]">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={
                  active
                    ? "text-plum underline decoration-mint decoration-2 underline-offset-4"
                    : "transition hover:text-plum"
                }
              >
                {item.label}
              </Link>
            </li>
          );
        })}
        <LanguageSwitcher />
        {configured && ready && isAnonymous && (
          <li>
            <Link
              href="/login"
              className={
                pathname === "/login"
                  ? "text-plum underline decoration-mint decoration-2 underline-offset-4"
                  : "transition hover:text-plum"
              }
            >
              {t("login")}
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
