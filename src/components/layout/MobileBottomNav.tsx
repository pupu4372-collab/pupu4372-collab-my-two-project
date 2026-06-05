"use client";

import { AuthRequiredLink } from "@/components/auth/AuthRequiredLink";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

type NavKey = "home" | "dog" | "cat" | "reptile" | "saju" | "community" | "profile";

const MOBILE_LINKS: Array<{
  key: NavKey;
  href: "/" | "/dog" | "/cat" | "/reptile" | "/saju" | "/community" | "/profile";
  icon: string;
  requiresAuth?: boolean;
}> = [
  { key: "home", href: "/", icon: "⌂" },
  { key: "dog", href: "/dog", icon: "🐕", requiresAuth: true },
  { key: "cat", href: "/cat", icon: "🐈", requiresAuth: true },
  { key: "reptile", href: "/reptile", icon: "🦎", requiresAuth: true },
  { key: "saju", href: "/saju", icon: "✨", requiresAuth: true },
  { key: "community", href: "/community", icon: "💬", requiresAuth: true },
];

interface MobileBottomNavProps {
  active?: NavKey | null;
}

export function MobileBottomNav({ active = "home" }: MobileBottomNavProps) {
  const nav = useTranslations("nav");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/55 bg-white/75 px-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] pt-2 shadow-[0_-12px_32px_rgba(68,38,86,0.08)] backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-md items-stretch justify-around gap-1">
        {MOBILE_LINKS.map((item) => {
          const className =
            active === item.key
              ? "flex min-w-0 flex-1 flex-col items-center justify-center rounded-full bg-primary px-1.5 py-2 text-white shadow-sm"
              : "flex min-w-0 flex-1 flex-col items-center justify-center rounded-full px-1.5 py-2 text-plum/60 transition active:scale-95";
          const content = (
            <>
              <span className="text-base leading-none" aria-hidden>
                {item.icon}
              </span>
              <span className="mt-1 text-center text-[9px] font-extrabold leading-tight">{nav(item.key)}</span>
            </>
          );

          return item.requiresAuth ? (
            <AuthRequiredLink key={item.key} href={item.href} className={className}>
              {content}
            </AuthRequiredLink>
          ) : (
            <Link key={item.key} href={item.href} className={className}>
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
