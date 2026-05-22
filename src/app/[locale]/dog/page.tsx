import { ChannelContentHub } from "@/components/channel/ChannelContentHub";
import { ChannelShell } from "@/components/layout/ChannelShell";
import { getChannelContent } from "@/lib/channel/content";
import { fetchChannelEditorial } from "@/lib/content/channel-feed";

interface DogChannelPageProps {
  params: Promise<{ locale: string }>;
}

export default async function DogChannelPage({ params }: DogChannelPageProps) {
  const { locale } = await params;
  const isKo = locale !== "en";
  const editorial = await fetchChannelEditorial("dog", isKo ? "ko" : "en");

  return (
    <ChannelShell
      theme="dog"
      title={isKo ? "강아지 채널" : "Dog Channel"}
      subtitle={
        isKo
          ? "산책, 훈련, 식단, 견종 성향까지 댕댕이 집사를 위한 실전 콘텐츠."
          : "Practical content for walks, training, food, and breed tendencies."
      }
      backHref="/community"
      backLabel={isKo ? "← 커뮤니티" : "← Community"}
      rightLinks={[
        { href: "/", label: isKo ? "홈" : "Home" },
        { href: "/cat", label: isKo ? "고양이 채널" : "Cat Channel" },
      ]}
    >
      <ChannelContentHub
        content={getChannelContent("dog", isKo ? "ko" : "en")}
        featured={editorial.featured}
        articles={editorial.articles}
        source={editorial.source}
      />
    </ChannelShell>
  );
}
