import { PetShowComments } from "@/components/community/PetShowComments";
import { ChannelShell } from "@/components/layout/ChannelShell";
import { fetchPetShowComments, fetchPetShowPost } from "@/lib/community/pet-show-detail";
import { notFound } from "next/navigation";

interface PetShowDetailPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function PetShowDetailPage({ params }: PetShowDetailPageProps) {
  const { id, locale } = await params;
  const isKo = locale !== "en";
  const [post, comments] = await Promise.all([fetchPetShowPost(id), fetchPetShowComments(id)]);

  if (!post) notFound();

  return (
    <ChannelShell
      theme="community"
      title={post.title ?? (isKo ? "우리아이 자랑" : "Pet Show")}
      subtitle={isKo ? "Pet Show 상세 · 사진과 댓글" : "Pet Show detail · Photos and comments"}
      backHref="/community/pet-show"
      backLabel={isKo ? "← 우리아이 자랑" : "← Pet Show"}
      rightLinks={[
        { href: "/", label: isKo ? "홈" : "Home" },
        { href: "/community", label: isKo ? "커뮤니티" : "Community" },
      ]}
    >
      <article className="space-y-5">
        <div className="flex aspect-video items-center justify-center overflow-hidden rounded-[1.75rem] bg-channel-community/10">
          {post.image_urls?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.image_urls[0]}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-5xl" aria-hidden>
              🐾
            </span>
          )}
        </div>

        {post.content && (
          <p className="text-sm leading-relaxed text-plum/75">{post.content}</p>
        )}

        <div className="flex gap-4 text-sm text-plum/50">
          <span>♥ {post.like_count}</span>
          <span>💬 {post.comment_count}</span>
          <span>👀 {post.view_count}</span>
        </div>
      </article>

      <div className="mt-8 border-t border-plum/10 pt-6">
        <PetShowComments postId={post.id} initialComments={comments} />
      </div>
    </ChannelShell>
  );
}
