"use client";

import { AppTopNav } from "@/components/layout/AppTopNav";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { GlassCard, PageContainer } from "@/components/layout/StitchLayout";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { ComponentProps, ReactNode } from "react";

export type ChannelTheme = "dog" | "cat" | "saju" | "community" | "neutral";

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
    accent: "text-channel-community",
    bg: "bg-channel-community/15",
    border: "border-channel-community/30",
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
}: ChannelShellProps) {
  const t = THEME[theme];
  const tc = useTranslations("common");
  const nav = useTranslations("nav");
  const locale = useLocale();
  const isKo = locale === "ko";
  const active =
    theme === "dog" || theme === "cat" || theme === "saju" || theme === "community"
      ? theme
      : "home";
  const links =
    rightLinks ??
    ([
      { href: "/", label: nav("home") },
      { href: "/community", label: nav("community") },
      { href: "/saju", label: nav("saju") },
    ] satisfies ChannelShellProps["rightLinks"]);

  return (
    <div className="min-h-screen bg-dream-sky">
      <AppTopNav active={active} />
      <PageContainer>
        {topBar && <div className="mb-5">{topBar}</div>}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link href={backHref} className="rounded-full bg-white/60 px-4 py-2 text-sm font-extrabold text-plum shadow-sm transition hover:bg-white">
            {backLabel ?? tc("backHome")}
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-2">
            {links?.map((link) => (
              <Link
                key={`${link.href}-${link.label}`}
                href={link.href}
                className={`rounded-full px-3 py-1.5 text-xs font-extrabold shadow-sm transition hover:brightness-105 ${t.bg} ${t.accent}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <GlassCard className={`relative overflow-hidden border-2 ${t.border} px-6 py-8 md:px-10`}>
          <div className={`absolute -right-10 -top-14 h-44 w-44 rounded-full ${t.bg} blur-3xl`} />
          {beforeTitle && <div className="mb-6">{beforeTitle}</div>}
          {comingSoon && (
            <p className="mb-4 inline-block rounded-full bg-gold/40 px-3 py-1 text-xs font-medium text-plum">
              {isKo ? "준비 중" : "Coming soon"}
            </p>
          )}
          <p className={`relative text-sm font-extrabold ${t.accent}`}>
            {t.emoji} {isKo ? t.label.ko : t.label.en}
          </p>
          <h1 className="relative mt-2 text-3xl font-extrabold tracking-tight text-primary md:text-5xl">{title}</h1>
          {subtitle && <p className="mt-3 text-sm leading-relaxed text-plum/70">{subtitle}</p>}
        </GlassCard>
        <div className="mt-8">{children}</div>
      </PageContainer>
      <MobileBottomNav active={active} />
    </div>
  );
}
