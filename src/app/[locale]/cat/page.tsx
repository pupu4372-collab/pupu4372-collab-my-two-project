import { CatChannelHome } from "@/components/channel/CatChannelHome";
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
      backHref="/"
      backLabel={isKo ? "← 홈" : "← Home"}
      rightLinks={[
        { href: "/dog", label: isKo ? "강아지 채널" : "Dog Channel" },
        { href: "/reptile", label: isKo ? "렙타일" : "Reptiles" },
        { href: "/community", label: isKo ? "커뮤니티" : "Community" },
      ]}
    >
      <CatChannelHome
        content={getChannelContent("cat", isKo ? "ko" : "en")}
        featured={editorial.featured}
        articles={editorial.articles}
        source={editorial.source}
        isKo={isKo}
      />
    </ChannelShell>
  );
}
