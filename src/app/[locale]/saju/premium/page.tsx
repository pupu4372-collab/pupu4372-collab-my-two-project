import { PremiumHub } from "@/components/k-saju/PremiumHub";
import { ChannelShell } from "@/components/layout/ChannelShell";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function PremiumHubPage() {
  const t = await getTranslations("saju");

  return (
    <ChannelShell
      theme="saju"
      title={t("premiumHubTitle")}
      subtitle={t("premiumHubSubtitle")}
      narrowHero
    >
      <div className="mx-auto w-full max-w-xl md:max-w-2xl">
        <PremiumHub />
        <p className="mt-8 text-center text-sm text-white/75">
          <Link href="/saju" className="underline hover:text-white">
            {t("backSaju")}
          </Link>
        </p>
      </div>
    </ChannelShell>
  );
}
