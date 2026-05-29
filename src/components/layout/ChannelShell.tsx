"use client";

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
  const links =
    rightLinks ??
    ([
      { href: "/", label: nav("home") },
      { href: "/community", label: nav("community") },
      { href: "/saju", label: nav("saju") },
    ] satisfies ChannelShellProps["rightLinks"]);

  return (
    <div className="min-h-screen bg-dream-sky">
      <header className="border-b border-white/50 bg-white/30 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-4 md:px-8">
          <Link href={backHref} className="text-sm font-semibold text-plum hover:opacity-80">
            {backLabel ?? tc("backHome")}
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-2">
            {links?.map((link) => (
              <Link
                key={`${link.href}-${link.label}`}
                href={link.href}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition hover:brightness-105 ${t.bg} ${t.accent}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-14">
        {topBar && <div className="mb-5">{topBar}</div>}
        <div className={`pastel-card border-2 ${t.border} px-6 py-8 md:px-10`}>
          {beforeTitle && <div className="mb-6">{beforeTitle}</div>}
          {comingSoon && (
            <p className="mb-4 inline-block rounded-full bg-gold/40 px-3 py-1 text-xs font-medium text-plum">
              {isKo ? "준비 중" : "Coming soon"}
            </p>
          )}
          <h1 className={`text-2xl font-bold md:text-3xl ${t.accent}`}>{title}</h1>
          {subtitle && <p className="mt-3 text-sm leading-relaxed text-plum/70">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
