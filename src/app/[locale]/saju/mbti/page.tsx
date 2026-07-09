import { MbtiStandaloneFlow } from "@/components/k-saju/MbtiStandaloneFlow";
import { SAJU_RESULT_DESKTOP_WIDTH_CLASS } from "@/components/k-saju/result-styles";
import { ChannelShell } from "@/components/layout/ChannelShell";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

export default async function MbtiStandalonePage() {
  const t = await getTranslations("saju");

  return (
    <ChannelShell
      theme="saju"
      title={t("premiumHubTitle")}
      subtitle={t("premiumHubSubtitle")}
      narrowHero
    >
      <div className={SAJU_RESULT_DESKTOP_WIDTH_CLASS}>
        <Suspense>
          <MbtiStandaloneFlow />
        </Suspense>
      </div>
    </ChannelShell>
  );
}
