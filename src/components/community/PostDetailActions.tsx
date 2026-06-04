"use client";

import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { TIPS_DIFFICULTY_OPTIONS } from "@/lib/community/board-categories";
import type { CommunityPost } from "@/lib/supabase/types";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useState } from "react";

interface PostDetailActionsProps {
  post: CommunityPost;
  board: "qa" | "tips";
  initialSaved?: boolean;
}

export function PostDetailActions({ post, board, initialSaved = false }: PostDetailActionsProps) {
  const locale = useLocale();
  const isKo = locale === "ko";
  const { accessToken, isAnonymous, configured } = useSupabaseSession();
  const [saved, setSaved] = useState(initialSaved);
  const [saveCount, setSaveCount] = useState(post.save_count ?? 0);
  const [loading, setLoading] = useState(false);

  const difficultyLabel = TIPS_DIFFICULTY_OPTIONS.find((d) => d.id === post.difficulty);

  async function toggleSave() {
    if (!configured || isAnonymous) return;
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
      const res = await fetch(`/api/community/posts/${post.id}/save`, {
        method: "POST",
        headers,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSaved(data.saved);
      setSaveCount(data.save_count);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {post.is_answered && board === "qa" && (
        <span className="rounded-full bg-mint/50 px-3 py-1 text-xs font-extrabold text-primary">
          {isKo ? "해결됨" : "Resolved"}
        </span>
      )}
      {difficultyLabel && (
        <span className="rounded-full bg-sand/80 px-3 py-1 text-xs font-bold text-plum/70">
          {isKo ? difficultyLabel.ko : difficultyLabel.en}
        </span>
      )}
      <span className="text-xs text-plum/45">
        {isKo ? `저장 ${saveCount}` : `${saveCount} saves`}
      </span>
      {configured && !isAnonymous && (board === "qa" || board === "tips") && (
        <button
          type="button"
          disabled={loading}
          onClick={() => void toggleSave()}
          className="rounded-full border border-channel-community/25 bg-white/60 px-4 py-1.5 text-xs font-bold text-channel-community disabled:opacity-60"
        >
          {saved ? (isKo ? "저장됨 ★" : "Saved ★") : isKo ? "저장하기" : "Save"}
        </button>
      )}
      {configured && isAnonymous && (
        <Link href="/login" className="text-xs font-semibold text-channel-community underline">
          {isKo ? "로그인 후 저장" : "Log in to save"}
        </Link>
      )}
    </div>
  );
}
