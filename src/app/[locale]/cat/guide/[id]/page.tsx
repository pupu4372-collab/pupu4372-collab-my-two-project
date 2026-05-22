import { ChannelArticleDetail } from "@/components/channel/ChannelArticleDetail";
import { ChannelShell } from "@/components/layout/ChannelShell";
import { fetchChannelArticle } from "@/lib/content/channel-feed";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function CatGuideDetailPage({ params }: PageProps) {
  const { id, locale } = await params;
  const isKo = locale !== "en";
  const { article, source } = await fetchChannelArticle("cat", id, isKo ? "ko" : "en");
  if (!article) notFound();

  return (
    <ChannelShell
      theme="cat"
      title={article.title}
      subtitle={isKo ? "고양이 채널 가이드" : "Cat channel guide"}
      backHref="/cat"
      backLabel={isKo ? "← 고양이 채널" : "← Cat Channel"}
      rightLinks={[
        { href: "/", label: isKo ? "홈" : "Home" },
        { href: "/community", label: isKo ? "커뮤니티" : "Community" },
      ]}
    >
      <ChannelArticleDetail channel="cat" article={article} source={source} />
    </ChannelShell>
  );
}
