import { HumanPremiumVaultClient } from "@/components/human-premium/HumanPremiumVaultClient";
import { ChannelShell } from "@/components/layout/ChannelShell";
import { Suspense } from "react";

export default function HumanPremiumVaultPage() {
  return (
    <ChannelShell theme="saju" title="프리미엄 리포트 보관함" hideThemeLabel hideHero>
      <Suspense
        fallback={
          <div className="mx-auto max-w-lg rounded-[2rem] bg-white p-8 text-center text-sm text-plum/80">
            Loading…
          </div>
        }
      >
        <HumanPremiumVaultClient />
      </Suspense>
    </ChannelShell>
  );
}
