"use client";

import { QaBoard } from "@/components/community/QaBoard";
import { QaComposer } from "@/components/community/QaComposer";
import { ChannelShell } from "@/components/layout/ChannelShell";
import { useLocale } from "next-intl";
import { useState } from "react";

export default function CommunityFreePage() {
  const locale = useLocale();
  const isKo = locale === "ko";
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <ChannelShell
      theme="community"
      title={isKo ? "자유게시판" : "Free Board"}
      subtitle={isKo ? "반려생활 이야기를 편하게 나누는 공간입니다." : "A casual board for everyday pet-parent stories."}
      backHref="/community"
      backLabel={isKo ? "← 커뮤니티" : "← Community"}
      rightLinks={[
        { href: "/", label: isKo ? "홈" : "Home" },
        { href: "/community/tips", label: isKo ? "꿀팁" : "Tips" },
      ]}
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <QaComposer board="free" onPosted={() => setRefreshKey((k) => k + 1)} />
        <QaBoard board="free" refreshKey={refreshKey} />
      </div>
    </ChannelShell>
  );
}
