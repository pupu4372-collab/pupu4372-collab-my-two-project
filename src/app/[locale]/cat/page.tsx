import { ChannelContentHub } from "@/components/channel/ChannelContentHub";
import { ChannelShell } from "@/components/layout/ChannelShell";
import { getChannelContent } from "@/lib/channel/content";
import { fetchChannelEditorial } from "@/lib/content/channel-feed";

interface CatChannelPageProps {
  params: Promise<{ locale: string }>;
}

export default async function CatChannelPage({ params }: CatChannelPageProps) {
  const { locale } = await params;
  const isKo = locale !== "en";
  const editorial = await fetchChannelEditorial("cat", isKo ? "ko" : "en");

  return (
    <ChannelShell
      theme="cat"
      title={isKo ? "고양이 채널" : "Cat Channel"}
      subtitle={
        isKo
          ? "행동 심리, 화장실, 사냥 놀이, 식단까지 냥님 중심 케어 콘텐츠."
          : "Cat-first care content for behavior, litter, hunting play, and diet."
      }
      backHref="/community"
      backLabel={isKo ? "← 커뮤니티" : "← Community"}
      rightLinks={[
        { href: "/", label: isKo ? "홈" : "Home" },
        { href: "/dog", label: isKo ? "강아지 채널" : "Dog Channel" },
      ]}
    >
      <ChannelContentHub
        content={getChannelContent("cat", isKo ? "ko" : "en")}
        featured={editorial.featured}
        articles={editorial.articles}
        source={editorial.source}
      />
    </ChannelShell>
  );
}
