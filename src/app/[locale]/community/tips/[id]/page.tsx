import { CommunityDetailSurface, COMMUNITY_DETAIL_BODY_CLASS, COMMUNITY_DETAIL_META_CLASS } from "@/components/community/CommunityDetailSurface";
import { PostDetailActions } from "@/components/community/PostDetailActions";
import { QaComments } from "@/components/community/QaComments";
import { QaPostActions } from "@/components/community/QaPostActions";
import { getAnimalLabel, getCategoryLabel, resolvePostAnimalType } from "@/lib/community/board-categories";
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

export default async function TipsPostDetailPage({ params }: PageProps) {
  const { id, locale } = await params;
  const isKo = locale !== "en";
  const post = await fetchQaPostDetail(id, "tips");
  if (!post) notFound();
  const comments = await fetchQaComments(post.id);
  const animal = resolvePostAnimalType(post.animal_type, post.tags);
  const animalLabel = getAnimalLabel(animal, isKo);
  const categoryLabel = animal ? getCategoryLabel("tips", animal, post.category, isKo) : null;

  return (
    <ChannelShell
      theme="community"
      title={post.title ?? (isKo ? "꿀팁게시판 상세" : "Tips Board Detail")}
      subtitle={isKo ? "반려생활 노하우와 케어 팁을 공유하는 게시판입니다." : "A board for pet care tips and know-how."}
      backHref="/community/tips"
      backLabel={isKo ? "← 꿀팁게시판" : "← Tips Board"}
      rightLinks={[{ href: "/", label: isKo ? "홈" : "Home" }, { href: "/community", label: isKo ? "커뮤니티" : "Community" }]}
    >
      <CommunityDetailSurface>
        <article className="space-y-5">
          <div className={COMMUNITY_DETAIL_META_CLASS}>
          {animalLabel && (
            <span className="rounded-full bg-sand/70 px-2 py-0.5 font-bold text-plum/70">{animalLabel}</span>
          )}
          {categoryLabel && (
            <span className="rounded-full bg-mint/40 px-2 py-0.5 font-bold text-plum/75">{categoryLabel}</span>
          )}
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
          board="tips"
          listHref="/community/tips"
          initialTitle={post.title ?? ""}
          initialContent={post.content ?? ""}
        />
        <PostDetailActions post={post} board="tips" />
        {post.content && <p className={COMMUNITY_DETAIL_BODY_CLASS}>{post.content}</p>}
        </article>
        <div className="mt-8 border-t border-plum/10 pt-6">
          <QaComments postId={post.id} initialComments={comments} board="tips" listHref="/community/tips" />
        </div>
      </CommunityDetailSurface>
      <div className="mt-8">
        <AdSlot />
      </div>
    </ChannelShell>
  );
}
