"use client";

import { AppTopNav } from "@/components/layout/AppTopNav";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { GlassCard, PageContainer } from "@/components/layout/StitchLayout";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { ComponentProps, ReactNode } from "react";

export type ChannelTheme = "dog" | "cat" | "reptile" | "saju" | "community" | "neutral";

const THEME: Record<
  ChannelTheme,
  { label: { ko: string; en: string }; emoji: string; accent: string; bg: string; border: string }
> = {
  dog: {
    label: { ko: "강아지", en: "Dog" },
    emoji: "🐕",
    accent: "text-channel-dog",
    bg: "bg-channel-dog/15",
    border: "border-channel-dog/30",
  },
  cat: {
    label: { ko: "고양이", en: "Cat" },
    emoji: "🐈",
    accent: "text-channel-cat",
    bg: "bg-channel-cat/15",
    border: "border-channel-cat/30",
  },
  reptile: {
    label: { ko: "렙타일", en: "Reptiles" },
    emoji: "🦎",
    accent: "text-[#3d8b64]",
    bg: "bg-channel-community/15",
    border: "border-channel-community/30",
  },
  saju: {
    label: { ko: "펫 사주", en: "Pet Saju" },
    emoji: "✨",
    accent: "text-channel-saju",
    bg: "bg-channel-saju/15",
    border: "border-channel-saju/30",
  },
  community: {
    label: { ko: "커뮤니티", en: "Community" },
    emoji: "💬",
    accent: "text-[#6f4b8b]",
    bg: "bg-[#efe6ff]",
    border: "border-[#6f4b8b]/25",
  },
  neutral: {
    label: { ko: "K-Saju Pet", en: "K-Saju Pet" },
    emoji: "☀️",
    accent: "text-plum",
    bg: "bg-lavender/40",
    border: "border-plum/20",
  },
};

interface ChannelShellProps {
  theme: ChannelTheme;
  title: string;
  subtitle?: string;
  beforeTitle?: ReactNode;
  topBar?: ReactNode;
  children?: ReactNode;
  comingSoon?: boolean;
  backHref?: ComponentProps<typeof Link>["href"];
  backLabel?: string;
  rightLinks?: Array<{
    href: ComponentProps<typeof Link>["href"];
    label: string;
  }>;
  heroMedia?: ReactNode;
  hideThemeLabel?: boolean;
  /** Match human-premium preview card width (max-w-sm / sm:max-w-md) */
  narrowHero?: boolean;
  /** Skip the hero GlassCard (content only) */
  hideHero?: boolean;
  /** Hide back link and top-right shortcut row (Pet Show uses global header only). */
  hideBreadcrumbRow?: boolean;
  /** Smaller hero: no channel label, tighter title/subtitle padding. */
  compactHero?: boolean;
}

export function ChannelShell({
  theme,
  title,
  subtitle,
  beforeTitle,
  topBar,
  children,
  comingSoon = false,
  backHref = "/",
  backLabel,
  rightLinks,
  heroMedia,
  hideThemeLabel = false,
  narrowHero = false,
  hideHero = false,
  hideBreadcrumbRow = false,
  compactHero = false,
}: ChannelShellProps) {
  const t = THEME[theme];
  const tc = useTranslations("common");
  const nav = useTranslations("nav");
  const locale = useLocale();
  const isKo = locale === "ko";
  const topNavActive =
    theme === "dog" || theme === "cat" || theme === "reptile" || theme === "saju" || theme === "community"
      ? theme
      : "home";
  const mobileNavActive: "home" | "dog" | "cat" | "reptile" | "saju" | "community" | null =
    theme === "dog"
      ? "dog"
      : theme === "cat"
        ? "cat"
        : theme === "saju"
          ? "saju"
          : theme === "community"
            ? "community"
            : theme === "reptile"
              ? "reptile"
              : "home";
  const heroSolid = theme === "community" || theme === "saju";
  const links =
    rightLinks ??
    ([
      { href: "/", label: nav("home") },
      { href: "/community", label: nav("community") },
      { href: "/saju", label: nav("saju") },
    ] satisfies ChannelShellProps["rightLinks"]);

  return (
    <div className="min-h-screen night-sky-page">
      <AppTopNav active={topNavActive} />
      <PageContainer>
        {topBar && <div className={compactHero ? "mb-3" : "mb-5"}>{topBar}</div>}
        {!hideBreadcrumbRow && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link
            href={backHref}
            className={
              heroSolid
                ? "rounded-full border border-white/35 bg-white/95 px-4 py-2 text-sm font-extrabold text-primary shadow-sm transition hover:bg-white"
                : "rounded-full bg-white/60 px-4 py-2 text-sm font-extrabold text-plum shadow-sm transition hover:bg-white"
            }
          >
            {backLabel ?? tc("backHome")}
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-2">
            {links?.map((link) => (
              <Link
                key={`${link.href}-${link.label}`}
                href={link.href}
                className={
                  heroSolid
                    ? "rounded-full border border-white/30 bg-white/95 px-3 py-1.5 text-xs font-extrabold text-primary shadow-sm transition hover:bg-white"
                    : "rounded-full bg-[#efe6ff] px-3 py-1.5 text-xs font-extrabold text-[#56326f] shadow-sm transition hover:bg-white hover:text-primary"
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        )}
        <GlassCard
          variant={heroSolid ? "solid" : "glass"}
          className={`relative overflow-hidden ${heroSolid ? "" : `border-2 ${t.border}`} ${compactHero ? "px-4 py-4 md:px-5 md:py-5" : "px-6 py-8 md:px-10"} ${narrowHero ? "mx-auto w-full max-w-sm sm:max-w-md" : ""} ${hideHero ? "hidden" : ""}`}
        >
          <div className={`absolute -right-10 -top-14 h-44 w-44 rounded-full ${t.bg} blur-3xl`} />
          <div className={heroMedia ? "relative grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(260px,42%)] sm:items-center" : "relative"}>
            <div>
              {beforeTitle && <div className={compactHero ? "mb-3" : "mb-6"}>{beforeTitle}</div>}
              {comingSoon && (
                <p className="mb-4 inline-block rounded-full bg-gold/40 px-3 py-1 text-xs font-medium text-plum">
                  {isKo ? "준비 중" : "Coming soon"}
                </p>
              )}
              {!hideThemeLabel && !compactHero && (
                <p className={`text-sm font-extrabold ${t.accent}`}>
                  {t.emoji} {isKo ? t.label.ko : t.label.en}
                </p>
              )}
              <h1 className={`font-extrabold tracking-tight text-primary ${compactHero ? "text-xl md:text-2xl" : "mt-2 text-3xl md:text-5xl"}`}>{title}</h1>
              {subtitle && (
                <p
                  className={`font-semibold leading-relaxed ${compactHero ? "mt-1 text-sm text-on-surface-variant" : `mt-3 text-sm ${heroSolid ? "text-on-surface-variant" : "text-plum"}`}`}
                >
                  {subtitle}
                </p>
              )}
            </div>
            {heroMedia && <div>{heroMedia}</div>}
          </div>
        </GlassCard>
        <div className={compactHero ? "mt-4" : "mt-8"}>{children}</div>
      </PageContainer>
      <MobileBottomNav active={mobileNavActive} />
    </div>
  );
}
