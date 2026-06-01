"use client";

import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import type { PostComment } from "@/lib/supabase/types";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useState } from "react";

interface QaCommentsProps {
  postId: string;
  initialComments: PostComment[];
  board?: "qa" | "free" | "tips" | "experience";
  listHref?: string;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function QaComments({ postId, initialComments, board = "qa", listHref = "/community/qa" }: QaCommentsProps) {
  const locale = useLocale();
  const isKo = locale === "ko";
  const { accessToken, configured, isAnonymous } = useSupabaseSession();
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const res = await fetch(`/api/community/${board}/${postId}/comments`, {
        method: "POST",
        headers,
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? (isKo ? "댓글 등록 실패" : "Failed to post comment"));

      setComments((prev) => [...prev, data.comment]);
      setContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : isKo ? "댓글 등록 실패" : "Failed to post comment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-plum">{isKo ? "댓글" : "Comments"} {comments.length}</h2>
        <Link href={listHref} className="text-sm text-plum/55 underline hover:text-plum">
          {isKo ? "목록으로" : "Back to list"}
        </Link>
      </div>

      <ul className="space-y-3">
        {comments.length === 0 && (
          <li className="rounded-2xl border border-dashed border-plum/15 bg-white/40 px-4 py-5 text-sm text-plum/55">
            {isKo ? "아직 댓글이 없어요. 첫 답변을 남겨보세요." : "No comments yet. Be the first to answer."}
          </li>
        )}
        {comments.map((comment) => (
          <li key={comment.id} className="rounded-2xl bg-white/55 px-4 py-3">
            <p className="text-sm leading-relaxed text-plum/75">{comment.content}</p>
            <p className="mt-2 text-xs text-plum/40">{formatDate(comment.created_at)}</p>
          </li>
        ))}
      </ul>

      {!configured && (
        <p className="rounded-2xl bg-white/45 px-4 py-3 text-sm text-plum/60">
          {isKo ? "Supabase 연동 후 댓글을 등록할 수 있어요." : "Comments are available after Supabase is connected."}
        </p>
      )}

      {configured && isAnonymous && (
        <div className="rounded-2xl border border-dashed border-channel-community/30 bg-channel-community/5 px-4 py-4 text-center">
          <p className="text-sm text-plum/70">{isKo ? "댓글을 남기려면 로그인이 필요해요." : "Please log in to leave a comment."}</p>
          <Link
            href="/login"
            className="mt-3 inline-flex rounded-full bg-channel-community px-5 py-2 text-sm font-semibold text-white"
          >
            {isKo ? "로그인하기" : "Log in"}
          </Link>
        </div>
      )}

      {configured && !isAnonymous && (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl bg-white/55 p-4">
          <textarea
            className="pastel-input min-h-[90px] resize-y"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={isKo ? "경험이나 조언을 따뜻하게 남겨주세요." : "Share your experience or advice kindly."}
            required
            minLength={2}
            maxLength={1000}
          />
          {error && <p className="text-sm text-red-700/80">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-channel-community py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? (isKo ? "등록 중..." : "Posting...") : isKo ? "댓글 등록" : "Post comment"}
          </button>
        </form>
      )}
    </section>
  );
}
