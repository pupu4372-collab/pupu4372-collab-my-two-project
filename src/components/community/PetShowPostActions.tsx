"use client";

import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Link, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useState } from "react";
import { ReportButton } from "./ReportButton";
import { PetShowDeleteButton } from "./PetShowDeleteButton";

interface PetShowPostActionsProps {
  postId: string;
  authorId?: string;
  initialLikeCount: number;
  commentCount: number;
  commentsHref?: string;
  disabled?: boolean;
  showOwnerDelete?: boolean;
}

async function resolveAccessToken(fallback: string | null): Promise<string | null> {
  const client = getSupabaseBrowserClient();
  if (!client) return fallback;

  const { data: { session } } = await client.auth.getSession();
  if (session?.access_token) return session.access_token;

  const { data: refreshed } = await client.auth.refreshSession();
  return refreshed.session?.access_token ?? fallback;
}

export function PetShowPostActions({
  postId,
  authorId,
  initialLikeCount,
  commentCount,
  commentsHref,
  disabled = false,
  showOwnerDelete = false,
}: PetShowPostActionsProps) {
  const locale = useLocale();
  const isKo = locale === "ko";
  const router = useRouter();
  const { accessToken, configured, isAnonymous, ready } = useSupabaseSession();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestLike(token: string) {
    return fetch("/api/community/pet-show/like", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ postId }),
    });
  }

  async function handleLike() {
    if (disabled || loading || !configured || !ready) return;
    setError(null);

    if (isAnonymous || !accessToken) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      let token = await resolveAccessToken(accessToken);
      if (!token) {
        router.push("/login");
        return;
      }

      let res = await requestLike(token);
      if (res.status === 401) {
        const client = getSupabaseBrowserClient();
        const { data: refreshed } = await client?.auth.refreshSession() ?? { data: { session: null } };
        token = refreshed.session?.access_token ?? null;
        if (token) {
          res = await requestLike(token);
        }
      }

      const data = (await res.json()) as { liked?: boolean; like_count?: number; error?: string };
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        setError(
          data.error ??
            (isKo ? "좋아요에 실패했어요. 잠시 후 다시 시도해 주세요." : "Could not like this post. Try again.")
        );
        return;
      }

      setLiked(Boolean(data.liked));
      setLikeCount(Number(data.like_count ?? likeCount));
    } catch {
      setError(isKo ? "좋아요에 실패했어요." : "Could not like this post.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void handleLike();
          }}
          disabled={disabled || loading || !configured || !ready}
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
            className="rounded-full border border-white/35 bg-white px-3 py-1.5 text-sm font-bold text-plum/75 transition hover:bg-sand/50 hover:text-primary"
          >
            💬 {isKo ? "댓글 보기" : "Comments"} {commentCount}
          </Link>
        ) : (
          <span className="rounded-full border border-white/35 bg-white px-3 py-1.5 text-sm font-bold text-plum/65">
            💬 {commentCount}
          </span>
        )}
        <ReportButton postId={postId} compact />
        {showOwnerDelete && authorId ? (
          <PetShowDeleteButton
            postId={postId}
            authorId={authorId}
            redirectTo="/community/pet-show/snapzone"
            disabled={disabled}
          />
        ) : null}
      </div>
      {error ? (
        <p role="alert" className="text-xs font-semibold text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
