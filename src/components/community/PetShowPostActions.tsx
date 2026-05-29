"use client";

import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { Link, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useState } from "react";

interface PetShowPostActionsProps {
  postId: string;
  initialLikeCount: number;
  commentCount: number;
  commentsHref?: string;
  disabled?: boolean;
}

export function PetShowPostActions({
  postId,
  initialLikeCount,
  commentCount,
  commentsHref,
  disabled = false,
}: PetShowPostActionsProps) {
  const locale = useLocale();
  const isKo = locale === "ko";
  const router = useRouter();
  const { accessToken, configured, isAnonymous } = useSupabaseSession();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);

  async function handleLike() {
    if (disabled || loading || !configured) return;
    if (isAnonymous || !accessToken) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/community/pet-show/like", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
      });
      const data = await res.json();
      if (!res.ok) return;
      setLiked(Boolean(data.liked));
      setLikeCount(Number(data.like_count ?? likeCount));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => void handleLike()}
        disabled={disabled || loading || !configured}
        className={`rounded-full px-3 py-1.5 text-sm font-bold transition ${
          liked
            ? "bg-channel-community text-white"
            : "bg-channel-community/10 text-channel-community hover:bg-channel-community/20"
        } disabled:cursor-not-allowed disabled:opacity-45`}
      >
        {liked ? "♥" : "♡"} {likeCount}
      </button>
      {commentsHref ? (
        <Link
          href={commentsHref}
          className="rounded-full bg-white/65 px-3 py-1.5 text-sm font-bold text-plum/65 transition hover:bg-white hover:text-plum"
        >
          💬 {isKo ? "댓글 보기" : "Comments"} {commentCount}
        </Link>
      ) : (
        <span className="rounded-full bg-white/50 px-3 py-1.5 text-sm font-bold text-plum/55">💬 {commentCount}</span>
      )}
    </div>
  );
}
