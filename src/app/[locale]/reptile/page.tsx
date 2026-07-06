import { ReptileChannelHome } from "@/components/channel/ReptileChannelHome";
import { ChannelShell } from "@/components/layout/ChannelShell";
import { getChannelContent } from "@/lib/channel/content";
import { fetchChannelEditorial } from "@/lib/content/channel-feed";
import { getTranslations } from "next-intl/server";

interface ReptileChannelPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ReptileChannelPage({ params }: ReptileChannelPageProps) {
  const { locale } = await params;
  const isKo = locale !== "en";
  const t = await getTranslations({ locale, namespace: "reptileChannel" });
  const editorial = await fetchChannelEditorial("reptile", isKo ? "ko" : "en");

  return (
    <ChannelShell
      theme="reptile"
      title={t("channelTitle")}
      subtitle={t("channelSubtitle")}
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
