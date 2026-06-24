import { HumanPremiumCartClient } from "@/components/human-premium/HumanPremiumCartClient";
import { ChannelShell } from "@/components/layout/ChannelShell";
import { Suspense } from "react";

export default function HumanPremiumCartPage() {
  return (
    <ChannelShell theme="saju" title="장바구니" hideThemeLabel hideHero>
      <Suspense
        fallback={
          <div className="mx-auto max-w-lg rounded-[2rem] bg-white p-8 text-center text-sm text-plum/80">
            Loading…
          </div>
        }
      >
        <HumanPremiumCartClient />
      </Suspense>
    </ChannelShell>
  );
}
