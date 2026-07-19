"use client";

import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { SajuHubHero } from "@/components/k-saju/SajuHubHero";
import { SajuHubVaultLink } from "@/components/k-saju/SajuHubVaultLink";

export function SajuHubTopRow() {
  const { ready, configured, isAnonymous } = useSupabaseSession();
  const showVault = configured && ready && !isAnonymous;

  if (!showVault) {
    return <SajuHubHero />;
  }

  return (
    <div className="grid grid-cols-1 items-stretch gap-3 lg:grid-cols-[minmax(0,1fr)_12rem]">
      <SajuHubHero />
      <SajuHubVaultLink />
    </div>
  );
}
