"use client";

import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import type { CommunityPost } from "@/lib/supabase/types";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface AdminPostRow extends CommunityPost {
  author_name?: string;
}

export function AdminModeration() {
  const { accessToken, isAnonymous } = useSupabaseSession();
  const [posts, setPosts] = useState<AdminPostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/posts", {
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
  }, [accessToken]);

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

  if (loading) return <p className="text-sm text-plum/60">게시글 불러오는 중…</p>;
  if (error) return <p className="text-sm text-red-700/80">{error}</p>;

  return (
    <div className="space-y-3">
      {posts.length === 0 && (
        <p className="text-sm text-plum/55">표시할 게시글이 없습니다.</p>
      )}
      {posts.map((post) => (
        <div
          key={post.id}
          className={`rounded-2xl border px-4 py-3 ${
            post.is_hidden ? "border-red-200/60 bg-red-50/40" : "border-white/70 bg-white/55"
          }`}
        >
          <div className="flex flex-wrap items-center gap-2 text-xs text-plum/45">
            <span className="font-bold">{post.post_type}</span>
            <span>{post.author_name ?? post.author_id.slice(0, 8)}</span>
            {post.is_hidden && <span className="text-red-700/70">숨김</span>}
          </div>
          <p className="mt-2 font-semibold text-plum">{post.title ?? "(제목 없음)"}</p>
          {post.post_type === "qa" && (
            <Link
              href={`/community/qa/${post.id}`}
              className="mt-1 inline-block text-xs text-channel-community underline"
            >
              상세 보기
            </Link>
          )}
          <button
            type="button"
            onClick={() => void toggleHidden(post)}
            className="mt-3 rounded-full border border-plum/15 bg-white px-4 py-1.5 text-xs font-semibold text-plum"
          >
            {post.is_hidden ? "복구" : "숨기기"}
          </button>
        </div>
      ))}
    </div>
  );
}
