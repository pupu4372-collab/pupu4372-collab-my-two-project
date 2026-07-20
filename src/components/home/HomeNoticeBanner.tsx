"use client";

import type { Notice } from "@/lib/supabase/types";
import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";

const DISMISS_STORAGE_KEY = "ksaju.homeNoticeBanner.dismissedId";

interface HomeNoticeBannerProps {
  notice: Pick<Notice, "id" | "title">;
  isKo: boolean;
}

export function HomeNoticeBanner({ notice, isKo }: HomeNoticeBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissedId = window.localStorage.getItem(DISMISS_STORAGE_KEY);
      setVisible(dismissedId !== notice.id);
    } catch {
      setVisible(true);
    }
  }, [notice.id]);

  function handleDismiss(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    try {
      window.localStorage.setItem(DISMISS_STORAGE_KEY, notice.id);
    } catch {
      /* ignore quota / private mode */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="border-b border-white/10 bg-[#3d5a8c] text-white"
      role="region"
      aria-label={isKo ? "홈 공지 배너" : "Home notice banner"}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-2 sm:px-4">
        <Link
          href={`/support/notices/${notice.id}`}
          className="min-w-0 flex-1 truncate text-center text-xs font-semibold tracking-tight text-white/90 transition hover:text-white sm:text-sm"
        >
          <span className="mr-2 inline-flex rounded bg-channel-community px-1.5 py-0.5 text-[10px] font-extrabold text-white">
            {isKo ? "공지" : "Notice"}
          </span>
          {notice.title}
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white/65 transition hover:bg-white/10 hover:text-white"
          aria-label={isKo ? "배너 닫기" : "Dismiss banner"}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
