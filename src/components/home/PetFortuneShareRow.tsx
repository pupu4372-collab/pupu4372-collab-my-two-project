"use client";

import type { PetDailyFortune, PetFortunePetMeta } from "@/lib/saju/pet-daily-fortune";
import {
  buildFortuneShareStorySlides,
  copyPetFortuneShareLink,
  saveFortuneStorySlidesToDevice,
  sharePetFortuneToKakao,
} from "@/lib/share/pet-fortune-share";
import { useState } from "react";

export function PetFortuneShareRow({
  pet,
  fortune,
  isKo,
  isNight,
}: {
  pet: PetFortunePetMeta;
  fortune: PetDailyFortune;
  isKo: boolean;
  isNight: boolean;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState<"kakao" | "instagram" | "link" | null>(null);

  const boxClass = isNight
    ? "border border-white/25 bg-[#351445]"
    : "border border-channel-saju/25 bg-channel-saju/8";
  const textClass = isNight ? "text-[#f3e8ff]" : "text-primary";
  const buttonClass = isNight
    ? "border border-white/30 bg-[#6b4a82] text-white hover:bg-[#7a5892]"
    : "border border-channel-saju/30 bg-white text-primary hover:bg-white/90";

  async function handleKakaoShare() {
    setBusy("kakao");
    setStatus(null);
    try {
      await sharePetFortuneToKakao({
        petId: pet.id,
        petName: pet.name,
        fortune,
        imageUrl: pet.profileImageUrl,
        locale: isKo ? "ko" : "en",
      });
    } catch {
      setStatus(
        isKo
          ? "카카오 공유 검증 실패예요. developers.kakao.com 에서 Web 도메인(ksajupet.com, localhost) 등록을 확인해 주세요."
          : "Kakao share verification failed. Register ksajupet.com in Kakao Developers."
      );
    } finally {
      setBusy(null);
    }
  }

  async function handleInstagramShare() {
    setBusy("instagram");
    setStatus(null);
    try {
      const slides = await buildFortuneShareStorySlides({
        pet,
        fortune,
        isKo,
      });
      const count = await saveFortuneStorySlidesToDevice(slides, pet.name);
      setStatus(
        isKo
          ? `스토리용 이미지 ${count}장을 저장했어요. 인스타에서 1→${count} 순서로 올려 주세요.`
          : `Saved ${count} story images. Upload them in order on Instagram.`
      );
    } catch {
      setStatus(
        isKo
          ? "인스타 스토리 공유를 열 수 없어요."
          : "Could not open Instagram story share."
      );
    } finally {
      setBusy(null);
    }
  }

  async function handleCopyLink() {
    setBusy("link");
    setStatus(null);
    try {
      await copyPetFortuneShareLink(pet.id);
      setStatus(isKo ? "링크를 복사했어요!" : "Link copied!");
    } catch {
      setStatus(isKo ? "링크 복사에 실패했어요." : "Failed to copy link.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className={`rounded-[1.5rem] p-4 ${boxClass}`}>
      <p className={`text-center text-sm font-extrabold leading-6 ${textClass}`}>
        {isKo
          ? "오늘 운세가 너무 맞았개…! 친구 펫도 봐줄게요"
          : "Today's fortune was spot on! Share with a friend."}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void handleKakaoShare()}
          className={`flex-1 rounded-full px-3 py-2.5 text-xs font-extrabold transition disabled:opacity-60 ${buttonClass}`}
        >
          {busy === "kakao" ? "…" : isKo ? "카카오 공유" : "Kakao"}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void handleInstagramShare()}
          className={`flex-1 rounded-full px-3 py-2.5 text-xs font-extrabold transition disabled:opacity-60 ${buttonClass}`}
        >
          {busy === "instagram" ? "…" : isKo ? "인스타 스토리" : "Instagram"}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void handleCopyLink()}
          className={`flex-1 rounded-full px-3 py-2.5 text-xs font-extrabold transition disabled:opacity-60 ${buttonClass}`}
        >
          {busy === "link" ? "…" : isKo ? "링크 복사" : "Copy link"}
        </button>
      </div>
      {status && (
        <p className={`mt-3 text-center text-[11px] font-semibold ${isNight ? "text-[#ffd7ff]" : "text-plum/70"}`}>
          {status}
        </p>
      )}
    </div>
  );
}
