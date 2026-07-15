"use client";

import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";

type FooterNavLinksProps = {
  aboutLabel: string;
  termsLabel: string;
  privacyLabel: string;
  supportLabel: string;
};

export function FooterNavLinks({
  aboutLabel,
  termsLabel,
  privacyLabel,
  supportLabel,
}: FooterNavLinksProps) {
  const locale = useLocale();
  const pricingLabel = locale === "en" ? "Pricing" : "이용요금";
  const refundLabel = locale === "en" ? "Refund Policy" : "환불 정책";

  const links = [
    { href: "/about" as const, label: aboutLabel },
    { href: "/terms" as const, label: termsLabel },
    { href: "/privacy" as const, label: privacyLabel },
    { href: "/support" as const, label: supportLabel },
    { href: "/pricing" as const, label: pricingLabel },
    { href: "/refund-policy" as const, label: refundLabel },
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
