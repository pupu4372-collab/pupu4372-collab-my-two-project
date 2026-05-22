import { ChannelArticleDetail } from "@/components/channel/ChannelArticleDetail";
import { ChannelShell } from "@/components/layout/ChannelShell";
import { fetchChannelArticle } from "@/lib/content/channel-feed";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function DogGuideDetailPage({ params }: PageProps) {
  const { id, locale } = await params;
  const isKo = locale !== "en";
  const { article, source } = await fetchChannelArticle("dog", id, isKo ? "ko" : "en");
  if (!article) notFound();

  return (
    <ChannelShell
      theme="dog"
      title={article.title}
      subtitle={isKo ? "강아지 채널 가이드" : "Dog channel guide"}
      backHref="/dog"
      backLabel={isKo ? "← 강아지 채널" : "← Dog Channel"}
      rightLinks={[
        { href: "/", label: isKo ? "홈" : "Home" },
        { href: "/community", label: isKo ? "커뮤니티" : "Community" },
      ]}
    >
      <ChannelArticleDetail channel="dog" article={article} source={source} />
    </ChannelShell>
  );
}
