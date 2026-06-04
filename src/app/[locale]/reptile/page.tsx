import { ReptileChannelHome } from "@/components/channel/ReptileChannelHome";
import { ChannelShell } from "@/components/layout/ChannelShell";
import { getChannelContent } from "@/lib/channel/content";
import { fetchChannelEditorial } from "@/lib/content/channel-feed";

interface ReptileChannelPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ReptileChannelPage({ params }: ReptileChannelPageProps) {
  const { locale } = await params;
  const isKo = locale !== "en";
  const editorial = await fetchChannelEditorial("reptile", isKo ? "ko" : "en");

  return (
    <ChannelShell
      theme="reptile"
      title={isKo ? "렙타일(다른동물) 채널" : "Reptile & Other Pets Channel"}
      subtitle={
        isKo
          ? "파충류, 앵무새(조류), 토끼·햄스터 등 환경·식단·건강 케어 가이드."
          : "Habitat, diet, and health guides for reptiles, birds, and small pets."
      }
      backHref="/"
      backLabel={isKo ? "← 홈" : "← Home"}
      rightLinks={[
        { href: "/dog", label: isKo ? "강아지 채널" : "Dog Channel" },
        { href: "/cat", label: isKo ? "고양이 채널" : "Cat Channel" },
        { href: "/community", label: isKo ? "커뮤니티" : "Community" },
      ]}
    >
      <ReptileChannelHome
        content={getChannelContent("reptile", isKo ? "ko" : "en")}
        featured={editorial.featured}
        articles={editorial.articles}
        source={editorial.source}
        isKo={isKo}
      />
    </ChannelShell>
  );
}
