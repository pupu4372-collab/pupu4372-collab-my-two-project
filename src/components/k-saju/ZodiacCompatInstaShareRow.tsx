"use client";

import type { CompatibilityResponse } from "@/lib/saju/compatibility/engine";
import type { ZodiacFortuneResponse } from "@/lib/saju/zodiac/engine";
import {
  buildCompatibilityStorySlide,
  buildZodiacStorySlide,
  saveSajuStorySlide,
} from "@/lib/share/saju-result-share";
import { useState } from "react";

const COPY = {
  ko: {
    zodiac: {
      intro: "오늘 별자리 케어 가이드, 친구 펫도 같이 봐요!",
      instagram: "인스타로 공유하기",
      instagramOk: "스토리용 이미지를 저장했어요. 인스타에서 올려 주세요.",
      instagramFail: "인스타 스토리 이미지를 저장할 수 없어요.",
      fileStem: "zodiac",
    },
    compatibility: {
      intro: "펫과 집사가 서로 맞춰가는 케어 방법, 같이 공유해 보세요!",
      instagram: "인스타로 공유하기",
      instagramOk: "스토리용 이미지를 저장했어요. 인스타에서 올려 주세요.",
      instagramFail: "인스타 스토리 이미지를 저장할 수 없어요.",
      fileStem: "bond",
    },
  },
  en: {
    zodiac: {
      intro: "Share today's zodiac care guide with a friend.",
      instagram: "Share on Instagram",
      instagramOk: "Story image saved. Upload it on Instagram.",
      instagramFail: "Could not save the Instagram story image.",
      fileStem: "zodiac",
    },
    compatibility: {
      intro: "Share how you and your pet care for each other.",
      instagram: "Share on Instagram",
      instagramOk: "Story image saved. Upload it on Instagram.",
      instagramFail: "Could not save the Instagram story image.",
      fileStem: "bond",
    },
  },
} as const;

type Props =
  | { kind: "zodiac"; result: ZodiacFortuneResponse }
  | { kind: "compatibility"; result: CompatibilityResponse };

export function ZodiacCompatInstaShareRow(props: Props) {
  const locale = props.result.locale;
  const t = COPY[locale][props.kind];
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const fileStem =
    props.kind === "zodiac"
      ? props.result.petName
      : `${props.result.petName}-${props.result.ownerName}`;

  async function handleInstagram() {
    setBusy(true);
    setStatus(null);
    try {
      const slide =
        props.kind === "zodiac"
          ? await buildZodiacStorySlide(props.result)
          : await buildCompatibilityStorySlide(props.result);
      await saveSajuStorySlide(slide, fileStem || t.fileStem);
      setStatus(t.instagramOk);
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
