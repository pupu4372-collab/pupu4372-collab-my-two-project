"use client";

import type { PetDailyFortune, PetFortunePetMeta } from "@/lib/saju/pet-daily-fortune";
import { elementBarHex, elementSoftHex } from "@/lib/saju/element-colors";
import {
  buildPhotoInstaCardContent,
  resolveImageForCanvasCapture,
} from "@/lib/share/daily-fortune-insta-card";
import { forwardRef, useEffect, useMemo, useState } from "react";

type Props = {
  pet: PetFortunePetMeta;
  fortune: PetDailyFortune;
  isKo: boolean;
  photoUrl: string;
  onPhotoReady?: () => void;
};

export const DailyFortuneInstaCardWithPhoto = forwardRef<HTMLDivElement, Props>(
  function DailyFortuneInstaCardWithPhoto({ pet, fortune, isKo, photoUrl, onPhotoReady }, ref) {
    const content = useMemo(
      () => buildPhotoInstaCardContent(pet, fortune, isKo),
      [pet, fortune, isKo]
    );
    const accent = elementBarHex(pet.dominantElement);
    const soft = elementSoftHex(pet.dominantElement);
    const [displaySrc, setDisplaySrc] = useState<string | null>(null);

    const luckyChips = useMemo(
      () => [
        {
          label: isKo ? "컬러" : "Color",
          value: content.luckyColor,
          icon: fortune.lucky.find((l) => l.type === "color")?.icon ?? "🎨",
        },
        {
          label: isKo ? "간식" : "Snack",
          value: content.luckySnack,
          icon: fortune.lucky.find((l) => l.type === "food")?.icon ?? "🍖",
        },
        {
          label: isKo ? "활동" : "Activity",
          value: content.luckyActivity,
          icon: fortune.lucky.find((l) => l.type === "act")?.icon ?? "✨",
        },
      ],
      [content, fortune.lucky, isKo]
    );

    useEffect(() => {
      let cancelled = false;
      let objectUrl: string | null = null;

      async function load() {
        setDisplaySrc(null);
        try {
          objectUrl = await resolveImageForCanvasCapture(photoUrl);
          if (!cancelled) setDisplaySrc(objectUrl);
        } catch {
          if (!cancelled) setDisplaySrc(photoUrl);
        }
      }

      void load();

      return () => {
        cancelled = true;
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      };
    }, [photoUrl]);

    return (
      <div ref={ref} className="daily-fortune-insta-card daily-fortune-insta-card--photo">
        <div className="daily-fortune-insta-card--photo__body">
          <div className="daily-fortune-insta-card--photo__media">
            {displaySrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displaySrc}
                alt=""
                className="daily-fortune-insta-card--photo__media-img"
                onLoad={() => onPhotoReady?.()}
                onError={() => onPhotoReady?.()}
              />
            ) : (
              <div
                className="daily-fortune-insta-card--photo__media-img daily-fortune-insta-card--photo__media-img--loading"
                aria-hidden
              />
            )}
            <div
              className="daily-fortune-insta-card--photo__media-fade"
              style={{
                background: `linear-gradient(to bottom, transparent 0%, ${soft}44 55%, ${accent}99 100%)`,
              }}
              aria-hidden
            />
          </div>

          <div
            className="daily-fortune-insta-card--photo__info-panel"
            style={{
              background: `linear-gradient(180deg, transparent 0%, ${soft}cc 12%, rgba(18, 16, 14, 0.94) 32%, rgba(12, 11, 10, 0.98) 100%)`,
            }}
          >
            <div className="daily-fortune-insta-card--photo__info-head">
              <h2 className="daily-fortune-insta-card--photo__pet-title">{content.petTitle}</h2>
              <div className="daily-fortune-insta-card--photo__harmony" style={{ color: accent }}>
                <span className="daily-fortune-insta-card--photo__harmony-score">{content.harmony}%</span>
                <span className="daily-fortune-insta-card--photo__harmony-label">
                  {isKo ? "케어 조화도" : "Care harmony"}
                </span>
              </div>
            </div>

            <p className="daily-fortune-insta-card--photo__fortune-title">{content.fortuneTitle}</p>

            <div className="daily-fortune-insta-card--photo__lucky-row">
              {luckyChips.map((chip) => (
                <div
                  key={chip.label}
                  className="daily-fortune-insta-card--photo__lucky-chip"
                  style={{ borderColor: `${accent}88` }}
                >
                  <span className="daily-fortune-insta-card--photo__lucky-chip-text">
                    {chip.icon} {chip.label} · {chip.value}
                  </span>
                </div>
              ))}
            </div>

            <p className="daily-fortune-insta-card--photo__today-line">{content.todayLine}</p>

            <p className="daily-fortune-insta-card--photo__watermark">#ksajupet</p>
          </div>
        </div>

        <footer className="daily-fortune-insta-card__footer">
          {isKo ? "내 아이 오늘의 케어법 보기  ksajupet.com" : "See my pet's care guide today  ksajupet.com"}
        </footer>
      </div>
    );
  }
);
