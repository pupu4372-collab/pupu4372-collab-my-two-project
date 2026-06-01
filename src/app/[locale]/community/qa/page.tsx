"use client";

import { QaBoard } from "@/components/community/QaBoard";
import { QaComposer } from "@/components/community/QaComposer";
import { ChannelShell } from "@/components/layout/ChannelShell";
import { useLocale } from "next-intl";
import { useState } from "react";

export default function CommunityQaPage() {
  const locale = useLocale();
  const isKo = locale === "ko";
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <ChannelShell
      theme="community"
      title={isKo ? "Q&A · 글로벌 집사 지식 공유" : "Q&A · Pet Parent Knowledge"}
      subtitle={
        isKo
          ? "반려동물 행동, 건강, 사료, 사주 연계 질문을 나누는 게시판입니다."
          : "Share questions about pet behavior, health, food, and saju-linked care."
      }
      backHref="/community"
      backLabel={isKo ? "← 커뮤니티" : "← Community"}
      rightLinks={[
        { href: "/", label: isKo ? "홈" : "Home" },
        { href: "/community/pet-show/upload", label: isKo ? "우리아이 자랑" : "Pet Show" },
      ]}
    >
      <div className="grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
        <QaComposer onPosted={() => setRefreshKey((k) => k + 1)} />
        <QaBoard refreshKey={refreshKey} />
      </div>
    </ChannelShell>
  );
}
