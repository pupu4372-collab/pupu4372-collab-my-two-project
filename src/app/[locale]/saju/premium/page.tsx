import { PremiumHub } from "@/components/k-saju/PremiumHub";
import { SAJU_RESULT_DESKTOP_WIDTH_CLASS } from "@/components/k-saju/result-styles";
import { ChannelShell } from "@/components/layout/ChannelShell";
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
      <div className={SAJU_RESULT_DESKTOP_WIDTH_CLASS}>
        <PremiumHub />
      </div>
    </ChannelShell>
  );
}
