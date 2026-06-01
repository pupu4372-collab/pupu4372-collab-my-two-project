"use client";

import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { useRouter } from "@/i18n/navigation";
import type { CommunityBoardKind } from "@/lib/community/qa-feed";
import { useLocale } from "next-intl";
import { useState } from "react";

type EditableBoard = Extract<CommunityBoardKind, "free" | "tips" | "experience">;

interface QaPostActionsProps {
  postId: string;
  authorId: string;
  board: EditableBoard;
  listHref: "/community/free" | "/community/tips" | "/community/experience";
  initialTitle: string;
  initialContent: string;
}

export function QaPostActions({
  postId,
  authorId,
  board,
  listHref,
  initialTitle,
  initialContent,
}: QaPostActionsProps) {
  const locale = useLocale();
  const isKo = locale === "ko";
  const router = useRouter();
  const { ready, accessToken, userId, isAnonymous } = useSupabaseSession();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!ready || isAnonymous || userId !== authorId) return null;

  async function savePost(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
      const res = await fetch(`/api/community/${board}/${postId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ title, content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? (isKo ? "수정 실패" : "Failed to update"));
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : isKo ? "수정 실패" : "Failed to update");
    } finally {
      setLoading(false);
    }
  }

  async function deletePost() {
    const ok = window.confirm(isKo ? "이 글을 삭제할까요?" : "Delete this post?");
    if (!ok) return;

    setError(null);
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
      const res = await fetch(`/api/community/${board}/${postId}`, {
        method: "DELETE",
        headers,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? (isKo ? "삭제 실패" : "Failed to delete"));
      router.push(listHref);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : isKo ? "삭제 실패" : "Failed to delete");
      setLoading(false);
    }
  }

  if (editing) {
    return (
      <form onSubmit={savePost} className="rounded-[1.5rem] bg-white/65 p-4 shadow-sm">
        <div className="space-y-3">
          <input
            className="pastel-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={120}
            placeholder={isKo ? "제목" : "Title"}
          />
          <textarea
            className="pastel-input min-h-[160px] resize-y"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            minLength={10}
            maxLength={2000}
            placeholder={isKo ? "내용을 적어주세요" : "Write your post"}
          />
          {error && <p className="text-sm text-red-700/80">{error}</p>}
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setTitle(initialTitle);
                setContent(initialContent);
                setEditing(false);
                setError(null);
              }}
              disabled={loading}
              className="rounded-full bg-white/70 px-4 py-2 text-sm font-bold text-plum/65"
            >
              {isKo ? "취소" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-channel-community px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              {loading ? (isKo ? "저장 중..." : "Saving...") : isKo ? "저장" : "Save"}
            </button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {error && <p className="w-full text-right text-sm text-red-700/80">{error}</p>}
      <button
        type="button"
        onClick={() => setEditing(true)}
        disabled={loading}
        className="rounded-full bg-white/70 px-4 py-2 text-sm font-bold text-channel-community shadow-sm"
      >
        {isKo ? "수정" : "Edit"}
      </button>
      <button
        type="button"
        onClick={() => void deletePost()}
        disabled={loading}
        className="rounded-full bg-red-50 px-4 py-2 text-sm font-bold text-red-600 shadow-sm disabled:opacity-60"
      >
        {loading ? (isKo ? "처리 중..." : "Working...") : isKo ? "삭제" : "Delete"}
      </button>
    </div>
  );
}
