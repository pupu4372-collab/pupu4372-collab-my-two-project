"use client";

import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import type { PostComment } from "@/lib/supabase/types";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useState } from "react";
import { ReportButton } from "./ReportButton";

interface QaCommentsProps {
  postId: string;
  postAuthorId?: string;
  adoptedAnswerId?: string | null;
  isAnswered?: boolean;
  initialComments: PostComment[];
  board?: "qa" | "free" | "tips" | "experience";
  listHref?: string;
  enableAdopt?: boolean;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function QaComments({
  postId,
  postAuthorId,
  adoptedAnswerId: initialAdoptedId,
  isAnswered: initialAnswered,
  initialComments,
  board = "qa",
  listHref = "/community/qa",
  enableAdopt = false,
}: QaCommentsProps) {
  const locale = useLocale();
  const isKo = locale === "ko";
  const { accessToken, userId, configured, isAnonymous } = useSupabaseSession();
  const [comments, setComments] = useState(initialComments);
  const [adoptedAnswerId, setAdoptedAnswerId] = useState(initialAdoptedId ?? null);
  const [isAnswered, setIsAnswered] = useState(initialAnswered ?? false);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [adoptingId, setAdoptingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canAdopt = enableAdopt && Boolean(postAuthorId) && userId === postAuthorId && !isAnonymous;

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

  async function handleAdopt(commentId: string) {
    setError(null);
    setAdoptingId(commentId);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const res = await fetch(`/api/community/qa/${postId}/adopt`, {
        method: "POST",
        headers,
        body: JSON.stringify({ commentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? (isKo ? "채택 실패" : "Failed to adopt"));

      setAdoptedAnswerId(commentId);
      setIsAnswered(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : isKo ? "채택 실패" : "Failed to adopt");
    } finally {
      setAdoptingId(null);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-plum">
          {isKo ? "댓글" : "Comments"} {comments.length}
          {isAnswered && (
            <span className="ml-2 text-xs font-normal text-mint">
              {isKo ? "· 채택 완료" : "· Answer adopted"}
            </span>
          )}
        </h2>
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
        {comments.map((comment) => {
          const isAdopted = adoptedAnswerId === comment.id;
          return (
            <li
              key={comment.id}
              className={
                isAdopted
                  ? "rounded-2xl border-2 border-mint/50 bg-mint/15 px-4 py-3"
                  : "rounded-2xl bg-white/55 px-4 py-3"
              }
            >
              {isAdopted && (
                <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wide text-primary">
                  {isKo ? "채택된 답변" : "Adopted answer"}
                </p>
              )}
              <p className="text-sm leading-relaxed text-plum/75">{comment.content}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <p className="text-xs text-plum/40">{formatDate(comment.created_at)}</p>
                {canAdopt && !isAdopted && (
                  <button
                    type="button"
                    disabled={adoptingId === comment.id}
                    onClick={() => void handleAdopt(comment.id)}
                    className="text-xs font-bold text-channel-community underline disabled:opacity-60"
                  >
                    {adoptingId === comment.id
                      ? isKo
                        ? "채택 중…"
                        : "Adopting…"
                      : isKo
                        ? "이 답변 채택"
                        : "Adopt this answer"}
                  </button>
                )}
                {userId !== comment.author_id && (
                  <ReportButton commentId={comment.id} compact />
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {configured && !isAnonymous ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            className="pastel-input min-h-[100px] w-full resize-y rounded-[1.5rem] border-transparent bg-sand/50 px-4 py-3 text-sm"
            placeholder={isKo ? "답변을 입력해 주세요" : "Write your answer"}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            minLength={2}
            maxLength={2000}
          />
          {error && <p className="text-sm text-red-700/80">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-channel-community px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {loading ? (isKo ? "등록 중…" : "Posting…") : isKo ? "답변 등록" : "Post answer"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-plum/55">
          {isKo ? "답변을 남기려면 " : "Please "}
          <Link href="/login" className="font-semibold text-channel-community underline">
            {isKo ? "로그인" : "log in"}
          </Link>
          {isKo ? "이 필요해요." : " to post an answer."}
        </p>
      )}
    </section>
  );
}
