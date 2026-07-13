"use client";

import { Link } from "@/i18n/navigation";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { getPaidHumanPremiumOrderIds, resolveHumanPremiumStorageUserId } from "@/lib/reports/human-premium/cart-session";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";

type FooterNavLinksProps = {
  aboutLabel: string;
  termsLabel: string;
  privacyLabel: string;
  supportLabel: string;
  paymentsLabel: string;
  hasServerPayments: boolean;
};

export function FooterNavLinks({
  aboutLabel,
  termsLabel,
  privacyLabel,
  supportLabel,
  paymentsLabel,
  hasServerPayments,
}: FooterNavLinksProps) {
  const locale = useLocale();
  const { userId, isAnonymous } = useSupabaseSession();
  const storageUserId = resolveHumanPremiumStorageUserId(userId, isAnonymous);
  const [showPayments, setShowPayments] = useState(hasServerPayments);
  const pricingLabel = locale === "en" ? "Pricing" : "이용요금";

  useEffect(() => {
    const sync = () => {
      setShowPayments(hasServerPayments || getPaidHumanPremiumOrderIds(storageUserId).length > 0);
    };
    sync();
    window.addEventListener("human-premium-paid", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("human-premium-paid", sync);
      window.removeEventListener("storage", sync);
    };
  }, [hasServerPayments, storageUserId]);

  const links = [
    { href: "/about" as const, label: aboutLabel },
    { href: "/terms" as const, label: termsLabel },
    { href: "/privacy" as const, label: privacyLabel },
    { href: "/support" as const, label: supportLabel },
    { href: "/pricing" as const, label: pricingLabel },
    ...(showPayments ? [{ href: "/payments" as const, label: paymentsLabel }] : []),
  ];

  return (
    <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-white/75">
      {links.map((item, index) => (
        <span key={item.href} className="inline-flex items-center gap-3">
          {index > 0 ? <span className="text-white/25" aria-hidden>|</span> : null}
          <Link href={item.href} className="transition-colors hover:text-[#ffd7ff] hover:underline">
            {item.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}
