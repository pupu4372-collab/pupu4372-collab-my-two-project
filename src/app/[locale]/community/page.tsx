import { ChannelShell } from "@/components/layout/ChannelShell";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

interface CommunityHubPageProps {
  params: Promise<{ locale: string }>;
}

export default async function CommunityHubPage({ params }: CommunityHubPageProps) {
  const { locale } = await params;
  const isKo = locale !== "en";
  const t = await getTranslations("community");

  const sections = [
    { href: "/community/pet-show" as const, emoji: "📸", title: t("petShow"), desc: t("petShowDesc"), primary: true },
    { href: "/community/qa" as const, emoji: "❓", title: t("qa"), desc: t("qaDesc"), primary: false },
    { href: "/dog" as const, emoji: "🐕", title: t("dogChannel"), desc: t("dogChannelDesc"), primary: false },
    { href: "/cat" as const, emoji: "🐈", title: t("catChannel"), desc: t("catChannelDesc"), primary: false },
  ];

  return (
    <ChannelShell
      theme="community"
      title={t("hubTitle")}
      subtitle={t("hubSubtitle")}
      backHref="/"
      backLabel={isKo ? "← 홈" : "← Home"}
      rightLinks={[
        { href: "/", label: isKo ? "홈" : "Home" },
        { href: "/saju", label: isKo ? "펫 사주" : "Pet Saju" },
      ]}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className={
              section.primary
                ? "rounded-[1.75rem] bg-channel-community/20 px-5 py-5 transition hover:bg-channel-community/30 sm:col-span-2"
                : "rounded-[1.75rem] border border-channel-community/25 bg-white/50 px-5 py-5 transition hover:bg-channel-community/10"
            }
          >
            <span className="text-2xl" aria-hidden>
              {section.emoji}
            </span>
            <h2
              className={`mt-2 text-lg font-bold ${
                section.primary ? "text-channel-community" : "text-plum"
              }`}
            >
              {section.title}
            </h2>
            <p className="mt-1 text-sm text-plum/65">{section.desc}</p>
          </Link>
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-plum/55">
        <Link href="/saju" className="underline hover:text-plum">
          {t("toSaju")}
        </Link>
      </p>
    </ChannelShell>
  );
}
