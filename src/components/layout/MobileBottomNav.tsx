"use client";

import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useId, useState } from "react";

type NavKey = "home" | "channels" | "saju" | "community" | "profile";
/** Legacy/sub-page keys still accepted for highlight mapping. */
type MobileNavActiveKey =
  | NavKey
  | "dog"
  | "cat"
  | "reptile"
  | "challenge"
  | null;

type ChannelPick = "dog" | "cat" | "reptile";

const CHANNEL_OPTIONS: Array<{
  key: ChannelPick;
  href: "/dog" | "/cat" | "/reptile";
  icon: string;
}> = [
  { key: "dog", href: "/dog", icon: "🐕" },
  { key: "cat", href: "/cat", icon: "🐈" },
  { key: "reptile", href: "/reptile", icon: "🦎" },
];

const MOBILE_LINKS: Array<{
  key: NavKey;
  href?: "/" | "/saju" | "/community" | "/profile";
  icon: string;
  labelKey: "home" | "channels" | "sajuShort" | "community" | "myPage";
}> = [
  { key: "home", href: "/", icon: "⌂", labelKey: "home" },
  { key: "channels", icon: "🐾", labelKey: "channels" },
  { key: "saju", href: "/saju", icon: "✨", labelKey: "sajuShort" },
  { key: "community", href: "/community", icon: "💬", labelKey: "community" },
  { key: "profile", href: "/profile", icon: "👤", labelKey: "myPage" },
];

function resolveActive(active: MobileNavActiveKey): NavKey | null {
  if (!active || active === "challenge") return null;
  if (active === "dog" || active === "cat" || active === "reptile") return "channels";
  return active;
}

function currentChannel(active: MobileNavActiveKey): ChannelPick | null {
  if (active === "dog" || active === "cat" || active === "reptile") return active;
  return null;
}

function tabClass(isSaju: boolean, isActive: boolean) {
  if (isSaju) {
    return isActive
      ? "flex min-w-0 max-w-[4.25rem] flex-1 flex-col items-center justify-center rounded-full bg-primary px-1 py-1.5 text-white shadow-md brightness-95"
      : "flex min-w-0 max-w-[4.25rem] flex-1 flex-col items-center justify-center rounded-full bg-primary px-1 py-1.5 text-white shadow-sm transition active:brightness-95";
  }
  return isActive
    ? "flex min-w-0 flex-1 flex-col items-center justify-center border-b-2 border-primary px-1 py-1.5 text-primary"
    : "flex min-w-0 flex-1 flex-col items-center justify-center border-b-2 border-transparent px-1 py-1.5 text-plum/60 transition active:scale-95";
}

interface MobileBottomNavProps {
  active?: MobileNavActiveKey;
}

export function MobileBottomNav({ active = "home" }: MobileBottomNavProps) {
  const nav = useTranslations("nav");
  const locale = useLocale();
  const isKo = locale === "ko";
  const resolved = resolveActive(active);
  const channelActive = currentChannel(active);
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetTitleId = useId();

  useEffect(() => {
    if (!sheetOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSheetOpen(false);
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [sheetOpen]);

  return (
    <>
      {sheetOpen ? (
        <div className="fixed inset-0 z-[60] md:hidden" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-primary/45"
            aria-label={isKo ? "채널 선택 닫기" : "Close channel picker"}
            onClick={() => setSheetOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={sheetTitleId}
            className="absolute inset-x-0 bottom-0 rounded-t-[1.75rem] border border-primary/15 bg-cream pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] pt-3 shadow-[0_-16px_40px_rgba(61,42,74,0.18)]"
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-primary/20" aria-hidden />
            <p id={sheetTitleId} className="px-5 text-center text-sm font-extrabold text-primary">
              {nav("channels")}
            </p>
            <ul className="mt-3 space-y-2 px-4">
              {CHANNEL_OPTIONS.map((option) => {
                const isCurrent = channelActive === option.key;
                return (
                  <li key={option.key}>
                    <Link
                      href={option.href}
                      onClick={() => setSheetOpen(false)}
                      className={
                        isCurrent
                          ? "flex items-center gap-3 rounded-2xl bg-primary px-4 py-3.5 text-white shadow-sm"
                          : "flex items-center gap-3 rounded-2xl border border-primary/15 bg-white px-4 py-3.5 text-primary shadow-sm transition active:bg-lavender/40"
                      }
                      aria-current={isCurrent ? "page" : undefined}
                    >
                      <span className="text-xl leading-none" aria-hidden>
                        {option.icon}
                      </span>
                      <span className="text-sm font-extrabold">{nav(option.key)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/55 bg-white/75 px-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] pt-2 shadow-[0_-12px_32px_rgba(68,38,86,0.08)] backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-lg items-stretch justify-around gap-0.5">
          {MOBILE_LINKS.map((item) => {
            const isActive = resolved === item.key;
            const isSaju = item.key === "saju";
            const label = nav(item.labelKey);
            const className = tabClass(isSaju, isActive);

            if (item.key === "channels") {
              return (
                <button
                  key={item.key}
                  type="button"
                  className={className}
                  aria-expanded={sheetOpen}
                  aria-haspopup="dialog"
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setSheetOpen(true)}
                >
                  <span className="text-base leading-none" aria-hidden>
                    {item.icon}
                  </span>
                  <span className="mt-0.5 max-w-full truncate text-center text-[9px] font-extrabold leading-tight">
                    {label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={item.key}
                href={item.href!}
                className={className}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="text-base leading-none" aria-hidden>
                  {item.icon}
                </span>
                <span className="mt-0.5 max-w-full truncate text-center text-[9px] font-extrabold leading-tight">
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
