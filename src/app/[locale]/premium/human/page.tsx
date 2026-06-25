import { HumanPremiumShop } from "@/components/human-premium/HumanPremiumShop";
import { ChannelShell } from "@/components/layout/ChannelShell";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function HumanPremiumPage() {
  const t = await getTranslations("saju");

  return (
    <ChannelShell
      theme="saju"
      title={t("premiumTitle")}
      subtitle={t("premiumSubtitle")}
      hideThemeLabel
      narrowHero
    >
      <HumanPremiumShop />
      <p className="mt-8 text-center text-sm">
        <Link
          href="/saju"
          className="font-semibold text-white/88 underline underline-offset-4 transition hover:text-white"
        >
          {t("backHub")}
        </Link>
      </p>
    </ChannelShell>
  );
}
