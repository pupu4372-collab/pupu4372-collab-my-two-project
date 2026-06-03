"use client";

import { QaBoard } from "@/components/community/QaBoard";
import { QaComposer } from "@/components/community/QaComposer";
import { ChannelShell } from "@/components/layout/ChannelShell";
import { useLocale } from "next-intl";
import { useState } from "react";

export default function CommunityExperiencePage() {
  const locale = useLocale();
  const isKo = locale === "ko";
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <ChannelShell
      theme="community"
      title={isKo ? "품종별 경험담" : "Breed Experiences"}
      subtitle={
        isKo
          ? "견종, 묘종, 그리고 렙타일(다른동물) 종별 생활 경험을 나누는 공간입니다."
          : "Share dog breed, cat breed, and other animal species experiences."
      }
      backHref="/community"
      backLabel={isKo ? "← 커뮤니티" : "← Community"}
      rightLinks={[
        { href: "/", label: isKo ? "홈" : "Home" },
        { href: "/community/tips", label: isKo ? "꿀팁" : "Tips" },
      ]}
    >
      <div className="mb-6 rounded-[1.5rem] bg-white/55 p-4 text-sm leading-relaxed text-plum/70 shadow-sm">
        {isKo
          ? "렙타일(다른동물)은 토끼, 햄스터, 새, 파충류, 물고기, 소동물처럼 여러 종을 포괄합니다. 제목이나 내용에 종 이름을 함께 적어주면 검색과 분류에 도움이 됩니다."
          : "Other animals include rabbits, hamsters, birds, reptiles, fish, and small pets. Add the species name in the title or body for easier discovery."}
      </div>
      <div className="grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
        <QaComposer board="experience" onPosted={() => setRefreshKey((k) => k + 1)} />
        <QaBoard board="experience" refreshKey={refreshKey} />
      </div>
    </ChannelShell>
  );
}
