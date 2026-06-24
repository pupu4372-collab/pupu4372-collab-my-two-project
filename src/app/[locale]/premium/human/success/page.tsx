import { HumanPremiumSuccessClient } from "@/components/human-premium/HumanPremiumSuccessClient";
import { ChannelShell } from "@/components/layout/ChannelShell";
import { Suspense } from "react";

export default function HumanPremiumSuccessPage() {
  return (
    <ChannelShell theme="saju" title="결제 완료" subtitle="리포트 생성 중" hideThemeLabel>
      <Suspense
        fallback={
          <div className="pastel-card mx-auto max-w-lg p-8 text-center text-sm text-plum/80">
            Loading…
          </div>
        }
      >
        <HumanPremiumSuccessClient />
      </Suspense>
    </ChannelShell>
  );
}
