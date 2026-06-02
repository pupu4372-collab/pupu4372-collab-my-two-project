"use client";

import { EmptyStatePanel, getEmptyStatePreset } from "@/components/ui/EmptyStatePanel";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { Link } from "@/i18n/navigation";
import { supabaseImageTransformUrl } from "@/lib/images/supabase-transform";
import type { CommunityPost } from "@/lib/supabase/types";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";

interface PostsResponse {
  posts: CommunityPost[];
  error?: string;
}

function categoryLabel(post: CommunityPost, isKo: boolean) {
  const category = post.tags.find((tag) => tag.startsWith("pet-show:"))?.replace("pet-show:", "");
  if (category === "dog") return isKo ? "강아지" : "Dog";
  if (category === "cat") return isKo ? "고양이" : "Cat";
  if (category === "other") return isKo ? "다른동물" : "Other animal";
  return isKo ? "미분류" : "Uncategorized";
}

export function PetShowPostsMiniGrid() {
  const locale = useLocale();
  const isKo = locale === "ko";
  const { ready, accessToken, configured, isAnonymous } = useSupabaseSession();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [editing, setEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!configured || !ready || !accessToken || isAnonymous) return;

    async function loadPosts() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/profile/pet-show-posts", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = (await res.json()) as PostsResponse;
        if (!res.ok) {
          setError(data.error ?? (isKo ? "올린 사진을 불러오지 못했어요." : "Could not load your photos."));
          return;
        }
        setPosts(data.posts ?? []);
      } catch {
        setError(isKo ? "네트워크 오류" : "Network error");
      } finally {
        setLoading(false);
      }
    }

    void loadPosts();
  }, [configured, ready, accessToken, isAnonymous, isKo]);

  function toggleSelected(postId: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  }

  async function deleteSelectedPosts() {
    if (!accessToken || deletingId) return;
    if (selectedIds.size === 0) {
      setEditing(false);
      return;
    }

    const ok = window.confirm(
      isKo
        ? `선택한 사진 ${selectedIds.size}개를 삭제할까요?`
        : `Delete ${selectedIds.size} selected photo(s)?`
    );
    if (!ok) return;

    setDeletingId("selected");
    setError(null);
    setMessage(null);
    try {
      const idsToDelete = [...selectedIds];
      for (const postId of idsToDelete) {
        const res = await fetch(`/api/community/pet-show/${postId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) {
          throw new Error(data.error ?? (isKo ? "삭제에 실패했어요." : "Could not delete the photo."));
        }
      }

      setPosts((prev) => prev.filter((post) => !selectedIds.has(post.id)));
      setSelectedIds(new Set());
      setEditing(false);
      setMessage(isKo ? "선택한 사진을 삭제했어요." : "Selected photos deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : isKo ? "네트워크 오류" : "Network error");
    } finally {
      setDeletingId(null);
    }
  }

  function renderPostContent(post: CommunityPost) {
    return (
      <>
        <div className="aspect-square overflow-hidden bg-channel-community/10">
          {post.image_urls[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={supabaseImageTransformUrl(post.image_urls[0], { width: 320, height: 320 })} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-2xl">🐾</span>
          )}
        </div>
        <div className="px-2 py-1.5">
          <p className="truncate text-[11px] font-semibold text-plum">
            {post.title ?? (isKo ? "무제" : "Untitled")}
          </p>
          <p className="text-[10px] text-plum/45">{categoryLabel(post, isKo)}</p>
        </div>
      </>
    );
  }

  if (!configured || isAnonymous) return null;

  return (
    <div className="glass-card space-y-3 rounded-[2rem] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-channel-community">
            {isKo ? "우리아이 자랑에 올린 사진" : "Pet Show Photos"}
          </h3>
          <p className="mt-1 text-xs text-plum/55">
            {isKo ? "최근 올린 사진을 모아 보여줘요." : "A gallery of your recent uploads."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => (editing ? void deleteSelectedPosts() : setEditing(true))}
          disabled={posts.length === 0}
          className="shrink-0 rounded-full bg-channel-community/10 px-3 py-1.5 text-xs font-bold text-channel-community transition hover:bg-channel-community/20"
        >
          {deletingId
            ? isKo
              ? "삭제 중..."
              : "Deleting..."
            : editing
              ? isKo
                ? "완료"
                : "Done"
              : isKo
                ? "편집"
                : "Edit"}
        </button>
      </div>

      {(message || error) && (
        <div className="rounded-2xl bg-white/70 px-3 py-2 text-xs">
          {message && <p className="font-medium text-channel-community">{message}</p>}
          {error && <p className="text-red-700/80">{error}</p>}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-plum/55">{isKo ? "올린 사진 불러오는 중..." : "Loading photos..."}</p>
      ) : posts.length === 0 ? (
        <EmptyStatePanel
          {...getEmptyStatePreset("petShow", isKo)}
          suggestions={undefined}
          className="py-8"
          imageSrc="/stitch/asset-69.jpg"
        />
      ) : (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {posts.map((post) => (
            <li key={post.id} className="group relative overflow-hidden rounded-2xl bg-white/75 shadow-sm">
              {editing && (
                <input
                  type="checkbox"
                  checked={selectedIds.has(post.id)}
                  onChange={() => toggleSelected(post.id)}
                  disabled={Boolean(deletingId)}
                  aria-label={isKo ? `${post.title ?? "사진"} 선택` : `Select ${post.title ?? "photo"}`}
                  className="absolute right-2 top-2 z-10 h-4 w-4 rounded border-white bg-white/90 shadow"
                />
              )}
              {editing ? (
                <button
                  type="button"
                  onClick={() => toggleSelected(post.id)}
                  disabled={Boolean(deletingId)}
                  className={`block w-full text-left transition ${
                    selectedIds.has(post.id) ? "ring-2 ring-channel-community" : ""
                  }`}
                >
                  {renderPostContent(post)}
                </button>
              ) : (
                <Link href={`/community/pet-show/${post.id}`} className="block">
                  {renderPostContent(post)}
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
