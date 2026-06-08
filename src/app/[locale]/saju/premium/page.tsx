import { PremiumCheckout } from "@/components/k-saju/PremiumCheckout";
import { ChannelShell } from "@/components/layout/ChannelShell";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function PremiumPage() {
  const t = await getTranslations("saju");

  return (
    <ChannelShell
      theme="saju"
      title={t("premiumTitle")}
      subtitle={t("premiumSubtitle")}
      hideThemeLabel
    >
      <PremiumCheckout />
      <p className="mt-8 text-center text-sm">
        <Link href="/saju" className="text-plum underline">
          {t("backHub")}
        </Link>
      </p>
    </ChannelShell>
  );
}
