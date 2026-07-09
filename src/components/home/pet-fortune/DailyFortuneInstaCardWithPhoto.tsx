"use client";

import type { PetDailyFortune, PetFortunePetMeta } from "@/lib/saju/pet-daily-fortune";
import { elementBarHex } from "@/lib/saju/element-colors";
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

function findFortuneCategory(fortune: PetDailyFortune, labelKo: string, labelEn: string) {
  return fortune.categories.find((c) => c.label === labelKo || c.label === labelEn);
}

export const DailyFortuneInstaCardWithPhoto = forwardRef<HTMLDivElement, Props>(
  function DailyFortuneInstaCardWithPhoto({ pet, fortune, isKo, photoUrl, onPhotoReady }, ref) {
    const content = useMemo(
      () => buildPhotoInstaCardContent(pet, fortune, isKo),
      [pet, fortune, isKo]
    );
    const accent = elementBarHex(pet.dominantElement);
    const [displaySrc, setDisplaySrc] = useState<string | null>(null);

    const statBars = useMemo(() => {
      const health = findFortuneCategory(fortune, "건강운", "Health");
      const activity = findFortuneCategory(fortune, "활동운", "Activity");
      const appetite = findFortuneCategory(fortune, "식욕운", "Appetite");
      const sleep = findFortuneCategory(fortune, "수면운", "Sleep");

      return [
        health
          ? { key: "health", label: isKo ? "건강" : "Health", score: health.score, color: health.color }
          : null,
        activity
          ? { key: "activity", label: isKo ? "활력" : "Vitality", score: activity.score, color: activity.color }
          : null,
        appetite
          ? { key: "appetite", label: isKo ? "기쁨" : "Joy", score: appetite.score, color: appetite.color }
          : null,
        sleep
          ? { key: "sleep", label: isKo ? "행운" : "Luck", score: sleep.score, color: sleep.color }
          : null,
      ].filter((item): item is NonNullable<typeof item> => item !== null);
    }, [fortune, isKo]);

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
          <div className="daily-fortune-insta-card--photo__top">
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
            </div>

            <div className="daily-fortune-insta-card--photo__elements">
              {statBars.map((stat) => (
                <div key={stat.key} className="daily-fortune-insta-card--photo__element-row">
                  <div className="daily-fortune-insta-card--photo__element-head">
                    <span className="daily-fortune-insta-card--photo__element-label">{stat.label}</span>
                    <span className="daily-fortune-insta-card--photo__element-pct">{stat.score}%</span>
                  </div>
                  <div className="daily-fortune-insta-card--photo__element-track">
                    <div
                      className="daily-fortune-insta-card--photo__element-fill"
                      style={{ width: `${Math.max(4, stat.score)}%`, backgroundColor: stat.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="daily-fortune-insta-card--photo__info-panel">
            <div className="daily-fortune-insta-card--photo__info-head">
              <h2 className="daily-fortune-insta-card--photo__pet-title">{content.petTitle}</h2>
              <p className="daily-fortune-insta-card--photo__harmony" style={{ color: accent }}>
                {isKo ? `케어조화도 ${content.harmony}%` : `Care harmony ${content.harmony}%`}
              </p>
            </div>

            <div className="daily-fortune-insta-card--photo__sections">
              <article className="daily-fortune-insta-card--photo__section">
                <h3 className="daily-fortune-insta-card--photo__section-title">{content.todayStateTitle}</h3>
                <p className="daily-fortune-insta-card--photo__section-body">{content.todayStateBody}</p>
              </article>
              <article className="daily-fortune-insta-card--photo__section">
                <h3 className="daily-fortune-insta-card--photo__section-title">{content.tipTitle}</h3>
                <p className="daily-fortune-insta-card--photo__section-body">{content.tipBody}</p>
              </article>
            </div>

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
