import { PetShowComments } from "@/components/community/PetShowComments";
import { PetShowPostActions } from "@/components/community/PetShowPostActions";
import { PetShowShell } from "@/components/community/PetShowShell";
import { supabaseImageTransformUrl } from "@/lib/images/supabase-transform";
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
    <PetShowShell
      theme="community"
      title={post.title ?? (isKo ? "우리아이 자랑" : "Pet Show")}
      subtitle={isKo ? "Pet Show 상세 · 사진과 댓글" : "Pet Show detail · Photos and comments"}
      backHref="/community/pet-show/snapzone"
      backLabel={isKo ? "← 스냅존" : "← Snapzone"}
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
              src={supabaseImageTransformUrl(post.image_urls[0], { width: 1280, height: 720 })}
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

        <div className="flex flex-wrap items-center gap-3">
          <PetShowPostActions
            postId={post.id}
            initialLikeCount={post.like_count}
            commentCount={post.comment_count}
            commentsHref="#comments"
            disabled={post.id.startsWith("mock-")}
          />
          <span className="rounded-full bg-white/50 px-3 py-1.5 text-sm font-bold text-plum/55">👀 {post.view_count}</span>
        </div>
      </article>

      <div id="comments" className="mt-8 scroll-mt-24 border-t border-plum/10 pt-6">
        <PetShowComments postId={post.id} initialComments={comments} />
      </div>
    </PetShowShell>
  );
}
