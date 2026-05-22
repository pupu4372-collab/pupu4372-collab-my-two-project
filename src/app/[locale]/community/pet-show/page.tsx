import { PetShowClient } from "@/components/community/PetShowClient";
import { ChannelShell } from "@/components/layout/ChannelShell";
import { fetchPetShowRanking } from "@/lib/community/ranking";

interface PetShowPageProps {
  params: Promise<{ locale: string }>;
}

export default async function PetShowPage({ params }: PetShowPageProps) {
  const { locale } = await params;
  const isKo = locale !== "en";
  const [week, realtime] = await Promise.all([
    fetchPetShowRanking("week"),
    fetchPetShowRanking("realtime"),
  ]);

  return (
    <ChannelShell
      theme="community"
      title={isKo ? "우리아이 자랑" : "Pet Show"}
      subtitle={
        isKo ? "사진 업로드 · 좋아요 랭킹 · 무한 스크롤 피드" : "Photo uploads · Like rankings · Infinite feed"
      }
      backHref="/community"
      backLabel={isKo ? "← 커뮤니티" : "← Community"}
      rightLinks={[
        { href: "/", label: isKo ? "홈" : "Home" },
        { href: "/community/qa", label: "Q&A" },
      ]}
    >
      <PetShowClient
        weekRows={week.rows}
        weekSource={week.source}
        realtimeRows={realtime.rows}
        realtimeSource={realtime.source}
      />
    </ChannelShell>
  );
}
