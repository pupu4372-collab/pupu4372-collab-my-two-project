"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

type NavKey = "home" | "dog" | "cat" | "saju" | "community" | "profile";

const MOBILE_LINKS: Array<{
  key: NavKey;
  href: "/" | "/dog" | "/cat" | "/saju" | "/community" | "/profile";
  icon: string;
}> = [
  { key: "home", href: "/", icon: "⌂" },
  { key: "dog", href: "/dog", icon: "🐕" },
  { key: "cat", href: "/cat", icon: "🐈" },
  { key: "saju", href: "/saju", icon: "✨" },
  { key: "community", href: "/community", icon: "💬" },
];

interface MobileBottomNavProps {
  active?: NavKey;
}

export function MobileBottomNav({ active = "home" }: MobileBottomNavProps) {
  const nav = useTranslations("nav");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/55 bg-white/75 px-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] pt-2 shadow-[0_-12px_32px_rgba(68,38,86,0.08)] backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around gap-1">
        {MOBILE_LINKS.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={
              active === item.key
                ? "flex min-w-14 flex-col items-center rounded-full bg-primary px-3 py-2 text-white shadow-sm"
                : "flex min-w-14 flex-col items-center rounded-full px-3 py-2 text-plum/60 transition active:scale-95"
            }
          >
            <span className="text-base leading-none" aria-hidden>
              {item.icon}
            </span>
            <span className="mt-1 text-[10px] font-extrabold leading-none">{nav(item.key)}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
