"use client";

import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import {
  getAdminPostBoardLabel,
  getAdminPostHref,
  type AdminPostBoardFilter,
} from "@/lib/admin/post-board";
import type { CommunityPost } from "@/lib/supabase/types";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface AdminPostRow extends CommunityPost {
  author_name?: string;
}

const BOARD_FILTERS: Array<{ id: AdminPostBoardFilter; label: string }> = [
  { id: "all", label: "전체" },
  { id: "pet-show", label: "우리아이 자랑" },
  { id: "qa", label: "Q&A" },
  { id: "tips", label: "꿀팁" },
  { id: "free", label: "자유게시판" },
  { id: "experience", label: "품종별 경험담" },
];

export function AdminModeration() {
  const { accessToken, isAnonymous } = useSupabaseSession();
  const [posts, setPosts] = useState<AdminPostRow[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<AdminPostBoardFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ board: selectedBoard });
      const res = await fetch(`/api/admin/posts?${params.toString()}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "불러오기 실패");
      setPosts(data.posts ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "불러오기 실패");
    } finally {
      setLoading(false);
    }
  }, [accessToken, selectedBoard]);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleHidden(post: AdminPostRow) {
    if (!accessToken) return;
    const res = await fetch(`/api/admin/posts/${post.id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ is_hidden: !post.is_hidden }),
    });
    if (res.ok) void load();
  }

  async function deletePost(post: AdminPostRow) {
    if (!accessToken || deletingId) return;
    const ok = window.confirm(
      `"${post.title ?? "제목 없음"}" 게시글을 완전히 삭제할까요?\n삭제 후 복구할 수 없습니다.`
    );
    if (!ok) return;

    setDeletingId(post.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/posts/${post.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "삭제 실패");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제 실패");
    } finally {
      setDeletingId(null);
    }
  }

  if (isAnonymous) {
    return (
      <p className="text-sm text-plum/65">
        관리자 계정으로 로그인하면 게시글 숨김/복구를 할 수 있어요.{" "}
        <Link href="/login" className="underline">
          로그인
        </Link>
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {BOARD_FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setSelectedBoard(filter.id)}
            className={
              selectedBoard === filter.id
                ? "rounded-full bg-primary px-4 py-2 text-xs font-extrabold text-white shadow-sm"
                : "rounded-full border border-plum/10 bg-white/70 px-4 py-2 text-xs font-bold text-plum/65 transition hover:bg-white"
            }
          >
            {filter.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-plum/60">게시글 불러오는 중…</p>}
      {error && <p className="text-sm text-red-700/80">{error}</p>}
      {!loading && !error && posts.length === 0 && (
        <p className="text-sm text-plum/55">선택한 게시판에 표시할 게시글이 없습니다.</p>
      )}
      {!loading && !error && posts.map((post) => {
        const postHref = getAdminPostHref(post);

        return (
        <div
          key={post.id}
          className={`rounded-[1.25rem] border px-4 py-3 ${
            post.is_hidden ? "border-red-200/60 bg-red-50/50" : "border-plum/10 bg-white/60"
          }`}
        >
          <div className="flex flex-wrap items-center gap-2 text-xs text-plum/45">
            <span className="font-bold">{getAdminPostBoardLabel(post)}</span>
            <span>{post.author_name ?? post.author_id.slice(0, 8)}</span>
            {post.is_hidden && <span className="text-red-700/70">숨김</span>}
          </div>
          <p className="mt-2 font-semibold text-plum">{post.title ?? "(제목 없음)"}</p>
          {postHref && (
            <Link
              href={postHref}
              className="mt-1 inline-block text-xs text-channel-community underline"
            >
              상세 보기
            </Link>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void toggleHidden(post)}
              className="rounded-full border border-plum/15 bg-white px-4 py-1.5 text-xs font-semibold text-plum"
            >
              {post.is_hidden ? "복구" : "숨기기"}
            </button>
            <button
              type="button"
              onClick={() => void deletePost(post)}
              disabled={deletingId === post.id}
              className="rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-xs font-semibold text-red-700 disabled:opacity-60"
            >
              {deletingId === post.id ? "삭제 중…" : "삭제"}
            </button>
          </div>
        </div>
        );
      })}
    </div>
  );
}
