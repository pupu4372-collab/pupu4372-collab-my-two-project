import { ChannelArticleDetail } from "@/components/channel/ChannelArticleDetail";
import { ChannelShell } from "@/components/layout/ChannelShell";
import { fetchChannelArticle } from "@/lib/content/channel-feed";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function ReptileGuideDetailPage({ params }: PageProps) {
  const { id, locale } = await params;
  const isKo = locale !== "en";
  const { article, source } = await fetchChannelArticle("reptile", id, isKo ? "ko" : "en");
  if (!article) notFound();

  return (
    <ChannelShell
      theme="reptile"
      title={article.title}
      subtitle={isKo ? "렙타일(다른동물) 채널 가이드" : "Reptile & other pets guide"}
      backHref="/reptile"
      backLabel={isKo ? "← 렙타일(다른동물) 채널" : "← Reptile channel"}
      rightLinks={[
        { href: "/", label: isKo ? "홈" : "Home" },
        { href: "/community", label: isKo ? "커뮤니티" : "Community" },
      ]}
    >
      <ChannelArticleDetail channel="reptile" article={article} source={source} />
    </ChannelShell>
  );
}
