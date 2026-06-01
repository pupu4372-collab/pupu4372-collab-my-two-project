import { AuthRequiredLink } from "@/components/auth/AuthRequiredLink";
import { GlassCard } from "@/components/layout/StitchLayout";
import { Link } from "@/i18n/navigation";

interface SajuHubGridProps {
  labels: {
    basic: string;
    basicDesc: string;
    zodiac: string;
    zodiacDesc: string;
    compatibility: string;
    compatibilityDesc: string;
    premium: string;
    premiumDesc: string;
  };
}

export function SajuHubGrid({ labels }: SajuHubGridProps) {
  const cards = [
    {
      href: "/home" as const,
      title: labels.basic,
      description: labels.basicDesc,
      icon: "🔮",
      featured: true,
      auth: false,
    },
    {
      href: "/saju/zodiac" as const,
      title: labels.zodiac,
      description: labels.zodiacDesc,
      icon: "⭐",
      featured: false,
      auth: true,
    },
    {
      href: "/saju/compatibility" as const,
      title: labels.compatibility,
      description: labels.compatibilityDesc,
      icon: "💞",
      featured: false,
      auth: true,
    },
    {
      href: "/saju/premium" as const,
      title: labels.premium,
      description: labels.premiumDesc,
      icon: "👑",
      featured: false,
      auth: false,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {cards.map((card) => {
        const inner = (
          <GlassCard
            className={`group flex h-full flex-col gap-3 transition hover:-translate-y-0.5 ${
              card.featured ? "border-channel-saju/25 bg-channel-saju/10" : ""
            }`}
          >
            <span className="text-3xl" aria-hidden>
              {card.icon}
            </span>
            <div>
              <h3 className="text-lg font-bold text-primary">{card.title}</h3>
              <p className="mt-1 text-sm text-plum/65">{card.description}</p>
            </div>
            <span className="mt-auto text-sm font-bold text-channel-saju group-hover:underline">→</span>
          </GlassCard>
        );

        if (card.auth) {
          return (
            <AuthRequiredLink key={card.href} href={card.href} className="block h-full">
              {inner}
            </AuthRequiredLink>
          );
        }

        return (
          <Link key={card.href} href={card.href} className="block h-full">
            {inner}
          </Link>
        );
      })}
    </div>
  );
}
