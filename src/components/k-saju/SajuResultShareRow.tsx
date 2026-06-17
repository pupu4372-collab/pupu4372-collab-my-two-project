"use client";

import type { CompatibilityResponse } from "@/lib/saju/compatibility/engine";
import type { SajuBasicResponse } from "@/lib/saju/types";
import type { ZodiacFortuneResponse } from "@/lib/saju/zodiac/engine";
import {
  buildBasicSajuStorySlide,
  buildCompatibilityStorySlide,
  buildZodiacStorySlide,
  copySajuShareLink,
  getBasicSajuShareUrl,
  getCompatibilityShareUrl,
  getZodiacShareUrl,
  saveSajuStorySlide,
  shareBasicSajuToKakao,
  shareCompatibilityToKakao,
  shareZodiacToKakao,
} from "@/lib/share/saju-result-share";
import { useState } from "react";

const COPY = {
  ko: {
    basic: {
      intro: "우리 아이 사주가 재밌어요! 친구에게도 알려주세요",
      kakao: "카카오 공유",
      instagram: "인스타 스토리",
      link: "링크 복사",
      kakaoFail:
        "카카오 공유 검증 실패예요. developers.kakao.com 에서 Web 도메인(ksajupet.com, localhost) 등록을 확인해 주세요.",
      instagramOk: "스토리용 이미지를 저장했어요. 인스타에서 올려 주세요.",
      instagramFail: "인스타 스토리 이미지를 저장할 수 없어요.",
      linkOk: "링크를 복사했어요!",
      linkFail: "링크 복사에 실패했어요.",
      fileStem: "k-saju",
    },
    zodiac: {
      intro: "오늘 별자리 운세, 친구 펫도 같이 봐요!",
      kakao: "카카오 공유",
      instagram: "인스타 스토리",
      link: "링크 복사",
      kakaoFail:
        "카카오 공유 검증 실패예요. developers.kakao.com 에서 Web 도메인(ksajupet.com, localhost) 등록을 확인해 주세요.",
      instagramOk: "스토리용 이미지를 저장했어요. 인스타에서 올려 주세요.",
      instagramFail: "인스타 스토리 이미지를 저장할 수 없어요.",
      linkOk: "링크를 복사했어요!",
      linkFail: "링크 복사에 실패했어요.",
      fileStem: "zodiac",
    },
    compatibility: {
      intro: "펫과 집사 궁합 결과, 같이 공유해 보세요!",
      kakao: "카카오 공유",
      instagram: "인스타 스토리",
      link: "링크 복사",
      kakaoFail:
        "카카오 공유 검증 실패예요. developers.kakao.com 에서 Web 도메인(ksajupet.com, localhost) 등록을 확인해 주세요.",
      instagramOk: "스토리용 이미지를 저장했어요. 인스타에서 올려 주세요.",
      instagramFail: "인스타 스토리 이미지를 저장할 수 없어요.",
      linkOk: "링크를 복사했어요!",
      linkFail: "링크 복사에 실패했어요.",
      fileStem: "bond",
    },
  },
  en: {
    basic: {
      intro: "Love this K-Saju reading? Share it with a friend.",
      kakao: "Kakao",
      instagram: "Instagram",
      link: "Copy link",
      kakaoFail: "Kakao share verification failed. Register ksajupet.com in Kakao Developers.",
      instagramOk: "Story image saved. Upload it on Instagram.",
      instagramFail: "Could not save the Instagram story image.",
      linkOk: "Link copied!",
      linkFail: "Failed to copy link.",
      fileStem: "k-saju",
    },
    zodiac: {
      intro: "Share today's zodiac fortune with a friend.",
      kakao: "Kakao",
      instagram: "Instagram",
      link: "Copy link",
      kakaoFail: "Kakao share verification failed. Register ksajupet.com in Kakao Developers.",
      instagramOk: "Story image saved. Upload it on Instagram.",
      instagramFail: "Could not save the Instagram story image.",
      linkOk: "Link copied!",
      linkFail: "Failed to copy link.",
      fileStem: "zodiac",
    },
    compatibility: {
      intro: "Share your pet-parent bond reading.",
      kakao: "Kakao",
      instagram: "Instagram",
      link: "Copy link",
      kakaoFail: "Kakao share verification failed. Register ksajupet.com in Kakao Developers.",
      instagramOk: "Story image saved. Upload it on Instagram.",
      instagramFail: "Could not save the Instagram story image.",
      linkOk: "Link copied!",
      linkFail: "Failed to copy link.",
      fileStem: "bond",
    },
  },
} as const;

type Props =
  | { kind: "basic"; result: SajuBasicResponse }
  | { kind: "zodiac"; result: ZodiacFortuneResponse }
  | { kind: "compatibility"; result: CompatibilityResponse };

export function SajuResultShareRow(props: Props) {
  const locale = props.result.locale;
  const isKo = locale === "ko";
  const t = COPY[locale][props.kind];
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState<"kakao" | "instagram" | "link" | null>(null);

  const fileStem =
    props.kind === "basic"
      ? props.result.petName
      : props.kind === "zodiac"
        ? props.result.petName
        : `${props.result.petName}-${props.result.ownerName}`;

  const shareUrl =
    props.kind === "basic"
      ? getBasicSajuShareUrl(props.result)
      : props.kind === "zodiac"
        ? getZodiacShareUrl(props.result)
        : getCompatibilityShareUrl(props.result);

  async function handleKakao() {
    setBusy("kakao");
    setStatus(null);
    try {
      if (props.kind === "basic") await shareBasicSajuToKakao(props.result);
      else if (props.kind === "zodiac") await shareZodiacToKakao(props.result);
      else await shareCompatibilityToKakao(props.result);
    } catch {
      setStatus(t.kakaoFail);
    } finally {
      setBusy(null);
    }
  }

  async function handleInstagram() {
    setBusy("instagram");
    setStatus(null);
    try {
      const slide =
        props.kind === "basic"
          ? await buildBasicSajuStorySlide(props.result)
          : props.kind === "zodiac"
            ? await buildZodiacStorySlide(props.result)
            : await buildCompatibilityStorySlide(props.result);
      await saveSajuStorySlide(slide, fileStem || t.fileStem);
      setStatus(t.instagramOk);
    } catch {
      setStatus(t.instagramFail);
    } finally {
      setBusy(null);
    }
  }

  async function handleCopyLink() {
    setBusy("link");
    setStatus(null);
    try {
      await copySajuShareLink(shareUrl);
      setStatus(t.linkOk);
    } catch {
      setStatus(t.linkFail);
    } finally {
      setBusy(null);
    }
  }

  const btnClass =
    "flex-1 rounded-full border border-channel-saju/30 bg-white px-3 py-2.5 text-xs font-extrabold text-primary transition hover:bg-white/90 disabled:opacity-60";

  return (
    <div className="rounded-[1.5rem] border border-channel-saju/25 bg-channel-saju/8 p-4">
      <p className="text-center text-sm font-extrabold leading-6 text-primary">{t.intro}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" disabled={busy !== null} onClick={() => void handleKakao()} className={btnClass}>
          {busy === "kakao" ? "…" : t.kakao}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void handleInstagram()}
          className={`${btnClass} border-petal/50 bg-gradient-to-r from-petal/80 via-blush/80 to-gold/40`}
        >
          {busy === "instagram" ? "…" : t.instagram}
        </button>
        <button type="button" disabled={busy !== null} onClick={() => void handleCopyLink()} className={btnClass}>
          {busy === "link" ? "…" : t.link}
        </button>
      </div>
      {status && <p className="mt-3 text-center text-[11px] font-semibold text-plum/70">{status}</p>}
    </div>
  );
}
