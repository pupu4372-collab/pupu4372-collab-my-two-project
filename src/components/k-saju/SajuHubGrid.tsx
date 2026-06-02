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

  const iconBg = ["bg-lavender", "bg-petal", "bg-mint", "bg-sand"] as const;

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {cards.map((card, index) => {
        const inner = (
          <GlassCard
            className={`group flex h-full flex-col gap-4 p-6 transition duration-300 hover:-translate-y-1 hover:bg-white/80 ${
              card.featured ? "border-channel-saju/25 bg-channel-saju/10" : ""
            }`}
          >
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl transition group-hover:scale-110 ${iconBg[index] ?? "bg-lavender"}`}
            >
              <span aria-hidden>{card.icon}</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-plum/65">{card.description}</p>
            </div>
            <span className="mt-auto text-sm font-bold text-primary group-hover:underline">
              {card.featured ? "→ Home" : "→"}
            </span>
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
