import { ChannelShell } from "@/components/layout/ChannelShell";
import { SajuForm } from "@/components/k-saju/SajuForm";
import { getTranslations } from "next-intl/server";

export default async function SajuHubPage() {
  const t = await getTranslations("saju");

  return (
    <ChannelShell theme="saju" title={t("hubTitle")} subtitle={t("hubSubtitle")}>
      <SajuForm />
    </ChannelShell>
  );
}
