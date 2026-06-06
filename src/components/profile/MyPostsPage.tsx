"use client";

import { GlassCard } from "@/components/layout/StitchLayout";
import { EmptyStatePanel } from "@/components/ui/EmptyStatePanel";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { Link } from "@/i18n/navigation";
import type { CommunityPost } from "@/lib/supabase/types";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";

type EditablePost = CommunityPost & {
  title: string | null;
  content: string | null;
};

function boardInfo(post: CommunityPost, isKo: boolean) {
  if (post.post_type === "photo_show") {
    return {
      label: isKo ? "우리아이 자랑" : "Pet Show",
      href: `/community/pet-show/${post.id}` as const,
    };
  }
  if (post.post_type === "qa") {
    return {
      label: "Q&A",
      href: `/community/qa/${post.id}` as const,
    };
  }
  if (post.tags.includes("tips")) {
    return {
      label: isKo ? "꿀팁" : "Tips",
      href: `/community/tips/${post.id}` as const,
    };
  }
  if (post.tags.includes("experience")) {
    return {
      label: isKo ? "품종별 경험담" : "Experience",
      href: `/community/experience/${post.id}` as const,
    };
  }
  return {
    label: isKo ? "자유게시판" : "Free",
    href: `/community/free/${post.id}` as const,
  };
}

export function MyPostsPage() {
  const locale = useLocale();
  const isKo = locale === "ko";
  const { ready, accessToken, configured, isAnonymous } = useSupabaseSession();
  const [posts, setPosts] = useState<EditablePost[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!configured || !ready || !accessToken || isAnonymous) {
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/profile/posts", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? (isKo ? "작성글을 불러오지 못했어요." : "Could not load your posts."));
          return;
        }
        setPosts((data.posts ?? []) as EditablePost[]);
      } catch {
        setError(isKo ? "네트워크 오류" : "Network error");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [configured, ready, accessToken, isAnonymous, isKo]);

  function startEdit(post: EditablePost) {
    setEditingId(post.id);
    setTitle(post.title ?? "");
    setContent(post.content ?? "");
    setError(null);
    setMessage(null);
  }

  async function savePost(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken || !editingId) return;

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/profile/posts", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: editingId, title, content }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? (isKo ? "글 수정에 실패했어요." : "Could not update the post."));
      }

      const updated = data.post as EditablePost;
      setPosts((prev) => prev.map((post) => (post.id === updated.id ? updated : post)));
      setEditingId(null);
      setMessage(isKo ? "글을 수정했어요." : "Post updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : isKo ? "글 수정에 실패했어요." : "Could not update the post.");
    } finally {
      setSaving(false);
    }
  }

  if (!configured || isAnonymous) {
    return (
      <GlassCard className="text-center">
        <p className="text-sm text-plum/65">
          {isKo ? "로그인 후 내가 작성한 글을 확인할 수 있어요." : "Log in to view your posts."}
        </p>
        <Link href="/login" className="mt-4 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white">
          {isKo ? "로그인하기" : "Log in"}
        </Link>
      </GlassCard>
    );
  }

  if (!ready || loading) {
    return <p className="text-sm text-plum/60">{isKo ? "작성글 불러오는 중..." : "Loading your posts..."}</p>;
  }

  if (posts.length === 0) {
    return (
      <EmptyStatePanel
        title={isKo ? "아직 작성한 글이 없어요" : "No posts yet"}
        description={isKo ? "커뮤니티에서 첫 글을 작성해 보세요." : "Write your first post in the community."}
        primaryAction={{ href: "/community", label: isKo ? "커뮤니티로 가기" : "Go to community" }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {(message || error) && (
        <div className="rounded-2xl bg-white/65 px-4 py-3 text-sm">
          {message && <p className="font-bold text-channel-community">{message}</p>}
          {error && <p className="text-red-700/80">{error}</p>}
        </div>
      )}

      <div className="grid gap-4">
        {posts.map((post) => {
          const info = boardInfo(post, isKo);
          const isEditing = editingId === post.id;
          const createdAt = new Date(post.created_at).toLocaleDateString(isKo ? "ko-KR" : "en-US");

          return (
            <GlassCard key={post.id} className="p-5">
              {isEditing ? (
                <form onSubmit={savePost} className="space-y-3">
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="pastel-input"
                    required
                    maxLength={120}
                    placeholder={isKo ? "제목" : "Title"}
                  />
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="pastel-input min-h-[150px] resize-y"
                    required
                    minLength={10}
                    maxLength={2000}
                    placeholder={isKo ? "내용" : "Content"}
                  />
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      disabled={saving}
                      className="rounded-full bg-white px-4 py-2 text-sm font-bold text-plum/70"
                    >
                      {isKo ? "취소" : "Cancel"}
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                    >
                      {saving ? (isKo ? "저장 중..." : "Saving...") : isKo ? "저장" : "Save"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-channel-community/10 px-3 py-1 text-xs font-bold text-channel-community">
                      {info.label}
                    </span>
                    <span className="text-xs font-medium text-plum/45">{createdAt}</span>
                  </div>
                  <div>
                    <h3 className="line-clamp-2 text-lg font-extrabold text-primary">
                      {post.title ?? (isKo ? "제목 없음" : "Untitled")}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-plum/65">{post.content}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-plum/50">
                    <span>{isKo ? `좋아요 ${post.like_count}` : `${post.like_count} likes`}</span>
                    <span>·</span>
                    <span>{isKo ? `댓글 ${post.comment_count}` : `${post.comment_count} comments`}</span>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Link
                      href={info.href}
                      className="rounded-full bg-white px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary hover:text-white"
                    >
                      {isKo ? "보기" : "View"}
                    </Link>
                    <button
                      type="button"
                      onClick={() => startEdit(post)}
                      className="rounded-full bg-channel-saju/12 px-4 py-2 text-sm font-bold text-channel-saju transition hover:bg-channel-saju hover:text-white"
                    >
                      {isKo ? "편집" : "Edit"}
                    </button>
                  </div>
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
