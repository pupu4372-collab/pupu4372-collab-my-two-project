"use client";

import type { SajuBasicResponse } from "@/lib/saju/types";
import { shareBasicSajuInstaCarousel } from "@/lib/share/saju-result-share";
import { useState } from "react";

const COPY = {
  ko: {
    intro: "우리 아이 맞춤 케어가 도움이 됐어요! 친구에게도 알려주세요",
    instagram: "인스타로 공유하기",
    instagramOk: "인스타용 이미지 3장을 저장했어요. 1→3 순서로 올려 주세요.",
    instagramFail: "인스타 스토리 이미지를 저장할 수 없어요.",
  },
  en: {
    intro: "Love this personalized care guide? Share it with a friend.",
    instagram: "Share on Instagram",
    instagramOk: "Saved 3 carousel images. Upload them in order on Instagram.",
    instagramFail: "Could not save the Instagram story image.",
  },
} as const;

type Props = {
  result: SajuBasicResponse;
  mbtiType?: string | null;
};

export function BasicSajuInstaShareRow({ result, mbtiType }: Props) {
  const t = COPY[result.locale];
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleInstagram() {
    setBusy(true);
    setStatus(null);
    try {
      const outcome = await shareBasicSajuInstaCarousel(result, mbtiType);
      if (outcome === "downloaded") setStatus(t.instagramOk);
    } catch {
      setStatus(t.instagramFail);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-[1.5rem] border-2 border-channel-saju/30 bg-gradient-to-br from-white via-lavender/40 to-mint/25 p-5 shadow-lg">
      <p className="text-center text-sm font-extrabold leading-6 text-primary">{t.intro}</p>
      <div className="mt-4">
        <button
          type="button"
          disabled={busy}
          onClick={() => void handleInstagram()}
          className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-hwa-red/35 bg-gradient-to-br from-petal via-blush to-gold/40 px-4 py-3.5 text-sm font-extrabold text-[#8b3a3a] shadow-sm transition hover:border-hwa-red hover:shadow-md disabled:opacity-60"
        >
          <span className="text-lg leading-none" aria-hidden>
            📷
          </span>
          {busy ? "…" : t.instagram}
        </button>
      </div>
      {status && <p className="mt-3 text-center text-[11px] font-semibold text-plum">{status}</p>}
    </div>
  );
}
