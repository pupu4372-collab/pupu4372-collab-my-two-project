import { CommunityDetailSurface, COMMUNITY_DETAIL_BODY_CLASS, COMMUNITY_DETAIL_META_CLASS } from "@/components/community/CommunityDetailSurface";
import { PostDetailActions } from "@/components/community/PostDetailActions";
import { QaComments } from "@/components/community/QaComments";
import { ChannelShell } from "@/components/layout/ChannelShell";
import { fetchQaComments, fetchQaPostDetail } from "@/lib/community/qa-detail";
import { getAnimalLabel, getCategoryLabel, resolvePostAnimalType } from "@/lib/community/board-categories";
import { getCountryLabel } from "@/lib/i18n/countries";
import { notFound } from "next/navigation";

interface QaDetailPageProps {
  params: Promise<{ id: string; locale: string }>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

export default async function QaDetailPage({ params }: QaDetailPageProps) {
  const { id, locale } = await params;
  const isKo = locale !== "en";
  const post = await fetchQaPostDetail(id);
  if (!post) notFound();
  const comments = await fetchQaComments(post.id);
  const animal = resolvePostAnimalType(post.animal_type, post.tags);
  const animalLabel = getAnimalLabel(animal, isKo);
  const categoryLabel = animal ? getCategoryLabel("qa", animal, post.category, isKo) : null;

  return (
    <ChannelShell
      theme="community"
      title={post.title ?? (isKo ? "Q&A 상세" : "Q&A Detail")}
      subtitle={
        isKo
          ? "집사들의 경험과 조언이 모이는 질문 상세 페이지입니다."
          : "A question detail page where pet parents share experience and advice."
      }
      backHref="/community/qa"
      backLabel={isKo ? "← Q&A 게시판" : "← Q&A Board"}
      rightLinks={[
        { href: "/", label: isKo ? "홈" : "Home" },
        { href: "/community", label: isKo ? "커뮤니티" : "Community" },
      ]}
    >
      <CommunityDetailSurface>
        <article className="space-y-5">
          <div className={COMMUNITY_DETAIL_META_CLASS}>
          {post.is_pinned && (
            <span className="rounded-full bg-gold/40 px-2 py-0.5 font-bold text-plum">
              {isKo ? "고정" : "Pinned"}
            </span>
          )}
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

        <PostDetailActions post={post} board="qa" />

        {post.content && (
          <p className={COMMUNITY_DETAIL_BODY_CLASS}>{post.content}</p>
        )}

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-channel-community/10 px-2.5 py-1 text-xs text-channel-community"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        </article>

        <div className="mt-8 border-t border-plum/10 pt-6">
          <QaComments
            postId={post.id}
            postAuthorId={post.author_id}
            adoptedAnswerId={post.adopted_answer_id}
            isAnswered={post.is_answered}
            initialComments={comments}
            enableAdopt
          />
        </div>
      </CommunityDetailSurface>
    </ChannelShell>
  );
}
