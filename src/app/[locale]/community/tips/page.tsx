"use client";

import { QaBoard } from "@/components/community/QaBoard";
import { QaComposer } from "@/components/community/QaComposer";
import { ChannelShell } from "@/components/layout/ChannelShell";
import { useLocale } from "next-intl";
import { useState } from "react";

export default function CommunityTipsPage() {
  const locale = useLocale();
  const isKo = locale === "ko";
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <ChannelShell
      theme="community"
      title={isKo ? "꿀팁게시판" : "Tips Board"}
      subtitle={isKo ? "행동, 건강, 사주 연계 관리 노하우를 공유해요." : "Share behavior, health, and saju-linked care tips."}
      backHref="/community"
      backLabel={isKo ? "← 커뮤니티" : "← Community"}
      rightLinks={[
        { href: "/", label: isKo ? "홈" : "Home" },
        { href: "/community/free", label: isKo ? "자유게시판" : "Free Board" },
      ]}
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <QaComposer board="tips" onPosted={() => setRefreshKey((k) => k + 1)} />
        <QaBoard board="tips" refreshKey={refreshKey} />
      </div>
    </ChannelShell>
  );
}
