import { SajuForm } from "@/components/k-saju/SajuForm";
import { SajuHubTopRow } from "@/components/k-saju/SajuHubTopRow";
import { SajuHubPremiumSidebar } from "@/components/k-saju/SajuHubPremiumSidebar";
import { ChannelShell } from "@/components/layout/ChannelShell";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

export default async function SajuHubPage() {
  const t = await getTranslations("saju");

  return (
    <ChannelShell
      theme="saju"
      title={t("hubTitle")}
      subtitle={t("hubSubtitle")}
      hideHero
      hideBreadcrumbRow
    >
      <div className="mx-auto max-w-6xl min-w-0">
        <div className="grid min-w-0 gap-6 lg:grid-cols-3 lg:items-start lg:gap-8">
          <div className="order-1 min-w-0 space-y-4 lg:col-span-2 lg:space-y-5">
            <SajuHubTopRow />
            <Suspense
              fallback={
                <div className="rounded-[1.75rem] border border-channel-saju/15 bg-surface px-5 py-8 text-center text-sm text-on-surface-variant shadow-sm">
                  …
                </div>
              }
            >
              <SajuForm />
            </Suspense>
          </div>

          <div className="order-2 min-w-0 lg:sticky lg:top-24 lg:col-span-1 lg:self-start">
            <SajuHubPremiumSidebar />
          </div>
        </div>
      </div>
    </ChannelShell>
  );
}
