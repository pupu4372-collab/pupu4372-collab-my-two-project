import { QaComments } from "@/components/community/QaComments";
import { QaPostActions } from "@/components/community/QaPostActions";
import { AdSlot } from "@/components/ads/AdSlot";
import { ChannelShell } from "@/components/layout/ChannelShell";
import { fetchQaComments, fetchQaPostDetail } from "@/lib/community/qa-detail";
import { getCountryLabel } from "@/lib/i18n/countries";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

export default async function FreePostDetailPage({ params }: PageProps) {
  const { id, locale } = await params;
  const isKo = locale !== "en";
  const [post, comments] = await Promise.all([fetchQaPostDetail(id, "free"), fetchQaComments(id)]);

  if (!post) notFound();

  return (
    <ChannelShell
      theme="community"
      title={post.title ?? (isKo ? "자유게시판 상세" : "Free Board Detail")}
      subtitle={isKo ? "반려생활 이야기를 나누는 자유게시판입니다." : "A free board for everyday pet-parent stories."}
      backHref="/community/free"
      backLabel={isKo ? "← 자유게시판" : "← Free Board"}
      rightLinks={[{ href: "/", label: isKo ? "홈" : "Home" }, { href: "/community", label: isKo ? "커뮤니티" : "Community" }]}
    >
      <article className="space-y-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-plum/45">
          <span>{formatDate(post.created_at)}</span>
          <span>💬 {post.comment_count}</span>
          <span>👀 {post.view_count}</span>
          {getCountryLabel(post.country_code, locale) && (
            <span className="font-bold">{getCountryLabel(post.country_code, locale)}</span>
          )}
        </div>
        <QaPostActions
          postId={post.id}
          authorId={post.author_id}
          board="free"
          listHref="/community/free"
          initialTitle={post.title ?? ""}
          initialContent={post.content ?? ""}
        />
        {post.content && (
          <p className="whitespace-pre-wrap rounded-[1.5rem] bg-white/50 px-5 py-5 text-sm leading-relaxed text-plum/75">
            {post.content}
          </p>
        )}
      </article>
      <div className="mt-8">
        <AdSlot />
      </div>
      <div className="mt-8 border-t border-plum/10 pt-6">
        <QaComments postId={post.id} initialComments={comments} board="free" listHref="/community/free" />
      </div>
    </ChannelShell>
  );
}
