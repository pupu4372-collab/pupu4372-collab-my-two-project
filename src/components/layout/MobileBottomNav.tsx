"use client";

import { AuthRequiredLink } from "@/components/auth/AuthRequiredLink";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

type NavKey = "home" | "dog" | "cat" | "reptile" | "saju" | "community";
type MobileNavActiveKey = NavKey | "challenge" | "profile" | null;

const MOBILE_LINKS: Array<{
  key: NavKey;
  href: "/" | "/dog" | "/cat" | "/reptile" | "/saju" | "/community";
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
  active?: MobileNavActiveKey;
}

export function MobileBottomNav({ active = "home" }: MobileBottomNavProps) {
  const nav = useTranslations("nav");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/55 bg-white/75 px-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] pt-2 shadow-[0_-12px_32px_rgba(68,38,86,0.08)] backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-around gap-0.5">
        {MOBILE_LINKS.map((item) => {
          const isActive = active === item.key;
          const isSaju = item.key === "saju";
          const label = isSaju ? nav("sajuShort") : nav(item.key);

          const className = isSaju
            ? isActive
              ? "flex min-w-0 max-w-[4.25rem] flex-1 flex-col items-center justify-center rounded-full bg-primary px-1 py-1.5 text-white shadow-md brightness-95"
              : "flex min-w-0 max-w-[4.25rem] flex-1 flex-col items-center justify-center rounded-full bg-primary px-1 py-1.5 text-white shadow-sm transition active:brightness-95"
            : isActive
              ? "flex min-w-0 flex-1 flex-col items-center justify-center border-b-2 border-primary px-1 py-1.5 text-primary"
              : "flex min-w-0 flex-1 flex-col items-center justify-center border-b-2 border-transparent px-1 py-1.5 text-plum/60 transition active:scale-95";

          const content = (
            <>
              <span className="text-base leading-none" aria-hidden>
                {item.icon}
              </span>
              <span className="mt-0.5 max-w-full truncate text-center text-[9px] font-extrabold leading-tight">
                {label}
              </span>
            </>
          );

          return item.requiresAuth ? (
            <AuthRequiredLink
              key={item.key}
              href={item.href}
              className={className}
              aria-current={isActive ? "page" : undefined}
            >
              {content}
            </AuthRequiredLink>
          ) : (
            <Link
              key={item.key}
              href={item.href}
              className={className}
              aria-current={isActive ? "page" : undefined}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
