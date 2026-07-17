"use client";

import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { Link } from "@/i18n/navigation";
import { signOut } from "@/lib/supabase/auth-client";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";

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

function ProfilePersonIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M5.5 19.25c.9-3.1 3.2-4.75 6.5-4.75s5.6 1.65 6.5 4.75"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
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

const SECONDARY_CTA_BASE =
  "inline-flex shrink-0 items-center justify-center rounded-full border border-primary/20 bg-white/75 px-3 py-2 text-xs font-extrabold text-primary shadow-sm transition hover:bg-white hover:shadow-md lg:px-3.5";

interface AppTopNavProps {
  active?: NavActiveKey;
}

export function AppTopNav({ active = "home" }: AppTopNavProps) {
  const nav = useTranslations("nav");
  const locale = useLocale();
  const isKo = locale === "ko";
  const { ready, configured, isAnonymous, email, refresh } = useSupabaseSession();
  const [signingOut, setSigningOut] = useState(false);
  const [vaultOpen, setVaultOpen] = useState(false);
  const vaultWrapRef = useRef<HTMLDivElement>(null);
  const vaultMenuId = useId();

  useEffect(() => {
    if (!vaultOpen) return;

    function onPointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node | null;
      if (target && vaultWrapRef.current?.contains(target)) return;
      setVaultOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setVaultOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [vaultOpen]);

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

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="relative" ref={vaultWrapRef}>
            <button
              type="button"
              className={SECONDARY_CTA_BASE}
              aria-expanded={vaultOpen}
              aria-haspopup="menu"
              aria-controls={vaultMenuId}
              onClick={() => setVaultOpen((open) => !open)}
            >
              <span className="whitespace-nowrap">{nav("vault")}</span>
              <span className="ml-1 text-[0.65rem] leading-none opacity-70" aria-hidden>
                {vaultOpen ? "▴" : "▾"}
              </span>
            </button>
            {vaultOpen ? (
              <div
                id={vaultMenuId}
                role="menu"
                className="absolute right-0 z-50 mt-2 min-w-[12.5rem] overflow-hidden rounded-2xl border border-primary/15 bg-white py-1 shadow-lg shadow-primary/10"
              >
                <Link
                  href="/reports"
                  role="menuitem"
                  className="block px-4 py-2.5 text-sm font-bold text-primary transition hover:bg-lavender/40"
                  onClick={() => setVaultOpen(false)}
                >
                  {nav("vaultPet")}
                </Link>
                <Link
                  href="/premium/human/vault"
                  role="menuitem"
                  className="block px-4 py-2.5 text-sm font-bold text-primary transition hover:bg-lavender/40"
                  onClick={() => setVaultOpen(false)}
                >
                  {nav("vaultHuman")}
                </Link>
              </div>
            ) : null}
          </div>

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
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href="/profile"
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary px-3 py-2 text-xs font-extrabold text-white shadow-sm transition hover:brightness-105 active:brightness-95"
                title={email ?? nav("myPage")}
                aria-label={nav("myPage")}
              >
                <ProfilePersonIcon className="h-3.5 w-3.5 shrink-0" />
                <span className="whitespace-nowrap">{nav("myPage")}</span>
              </Link>
              <button
                type="button"
                onClick={() => void handleLogout()}
                disabled={signingOut}
                className="rounded-full border border-primary/20 bg-white/75 px-3 py-2 text-xs font-extrabold text-primary shadow-sm transition hover:bg-white disabled:opacity-60"
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
