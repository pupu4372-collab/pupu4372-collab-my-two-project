import { AdSlot } from "@/components/ads/AdSlot";
import { QaComments } from "@/components/community/QaComments";
import { QaPostActions } from "@/components/community/QaPostActions";
import { ChannelShell } from "@/components/layout/ChannelShell";
import { fetchQaComments, fetchQaPostDetail } from "@/lib/community/qa-detail";
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

export default async function ExperiencePostDetailPage({ params }: PageProps) {
  const { id, locale } = await params;
  const isKo = locale !== "en";
  const [post, comments] = await Promise.all([
    fetchQaPostDetail(id, "experience"),
    fetchQaComments(id),
  ]);

  if (!post) notFound();

  return (
    <ChannelShell
      theme="community"
      title={post.title ?? (isKo ? "품종별 경험담" : "Breed Experience")}
      subtitle={isKo ? "견종, 묘종, 다른동물 종별 경험담입니다." : "Breed and species experience stories."}
      backHref="/community/experience"
      backLabel={isKo ? "← 품종별 경험담" : "← Breed Experiences"}
      rightLinks={[{ href: "/", label: isKo ? "홈" : "Home" }, { href: "/community", label: isKo ? "커뮤니티" : "Community" }]}
    >
      <article className="space-y-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-plum/45">
          <span>{formatDate(post.created_at)}</span>
          <span>💬 {post.comment_count}</span>
          <span>👀 {post.view_count}</span>
          {post.tags.filter((tag) => tag.startsWith("experience:")).map((tag) => (
            <span key={tag} className="rounded-full bg-channel-community/10 px-2 py-0.5 text-channel-community">
              #{tag.replace("experience:", "")}
            </span>
          ))}
        </div>
        <QaPostActions
          postId={post.id}
          authorId={post.author_id}
          board="experience"
          listHref="/community/experience"
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
        <QaComments postId={post.id} initialComments={comments} board="experience" listHref="/community/experience" />
      </div>
    </ChannelShell>
  );
}
