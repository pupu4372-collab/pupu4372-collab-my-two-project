"use client";

import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useState } from "react";

interface PetShowDeleteButtonProps {
  postId: string;
  authorId: string;
  onDeleted?: () => void;
  redirectTo?: "/community/pet-show/snapzone" | "/community/pet-show";
  variant?: "text" | "icon";
  disabled?: boolean;
  className?: string;
}

export function PetShowDeleteButton({
  postId,
  authorId,
  onDeleted,
  redirectTo,
  variant = "text",
  disabled = false,
  className = "",
}: PetShowDeleteButtonProps) {
  const locale = useLocale();
  const isKo = locale === "ko";
  const router = useRouter();
  const { ready, accessToken, userId, isAnonymous } = useSupabaseSession();
  const [loading, setLoading] = useState(false);

  const canDelete = ready && !isAnonymous && userId === authorId && !disabled && !postId.startsWith("mock-");

  if (!canDelete) return null;

  async function handleDelete(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const ok = window.confirm(
      isKo ? "이 사진을 삭제할까요? 복구할 수 없어요." : "Delete this photo? This cannot be undone.",
    );
    if (!ok) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/community/pet-show/${postId}`, {
        method: "DELETE",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? (isKo ? "삭제에 실패했어요." : "Could not delete the photo."));
      }

      onDeleted?.();
      if (redirectTo) {
        router.push(redirectTo);
        router.refresh();
      }
    } catch (err) {
      window.alert(err instanceof Error ? err.message : isKo ? "삭제에 실패했어요." : "Could not delete the photo.");
    } finally {
      setLoading(false);
    }
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={(event) => void handleDelete(event)}
        disabled={loading}
        className={`flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-sm font-bold text-white shadow-sm backdrop-blur-sm transition hover:bg-black/70 disabled:opacity-60 ${className}`}
        aria-label={isKo ? "사진 삭제" : "Delete photo"}
      >
        {loading ? "…" : "✕"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(event) => void handleDelete(event)}
      disabled={loading}
      className={`rounded-full border border-red-200 bg-white px-3 py-1.5 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-60 ${className}`}
    >
      {loading ? (isKo ? "삭제 중…" : "Deleting…") : isKo ? "삭제" : "Delete"}
    </button>
  );
}
