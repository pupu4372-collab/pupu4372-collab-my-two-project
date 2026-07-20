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

/** Mockup neon pill colors (health / vitality / joy / luck) — visual only; scores stay dynamic. */
const STAT_PILL_COLORS: Record<string, string> = {
  health: "#ec4899",
  activity: "#10b981",
  appetite: "#fb923c",
  sleep: "#a855f7",
};

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
          ? { key: "health", label: isKo ? "건강" : "Health", score: health.score }
          : null,
        activity
          ? { key: "activity", label: isKo ? "활력" : "Vitality", score: activity.score }
          : null,
        appetite
          ? { key: "appetite", label: isKo ? "기쁨" : "Joy", score: appetite.score }
          : null,
        sleep
          ? { key: "sleep", label: isKo ? "행운" : "Luck", score: sleep.score }
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
        <div className="daily-fortune-insta-card--photo__aurora" aria-hidden />
        <div className="daily-fortune-insta-card--photo__stars" aria-hidden />
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
              {statBars.map((stat) => {
                const pillColor = STAT_PILL_COLORS[stat.key] ?? "#a855f7";
                const fillPct = Math.max(12, Math.min(100, Math.round(stat.score)));
                return (
                  <div
                    key={stat.key}
                    className="daily-fortune-insta-card--photo__element-row"
                    style={{
                      ["--stat-color" as string]: pillColor,
                      boxShadow: `0 0 16px ${pillColor}99, 0 0 28px ${pillColor}55`,
                      borderRadius: 9999,
                    }}
                  >
                    <div className="daily-fortune-insta-card--photo__element-track">
                      <div
                        className="daily-fortune-insta-card--photo__element-fill"
                        style={{
                          width: `${fillPct}%`,
                          backgroundColor: pillColor,
                          boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.25), 0 0 14px ${pillColor}aa`,
                        }}
                      />
                      <div className="daily-fortune-insta-card--photo__element-head">
                        <span className="daily-fortune-insta-card--photo__element-label">
                          {stat.label}
                        </span>
                        <span className="daily-fortune-insta-card--photo__element-pct">
                          {stat.score}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
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

            <p className="daily-fortune-insta-card--photo__watermark">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icon-192.png"
                alt=""
                width={28}
                height={28}
                className="daily-fortune-insta-card--photo__brand-icon"
              />
              <span>K-Saju Pet</span>
            </p>
          </div>
        </div>

        <footer className="daily-fortune-insta-card__footer daily-fortune-insta-card__footer--photo">
          {isKo ? "내 아이 오늘의 케어법 보기  ksajupet.com" : "See my pet's care guide today  ksajupet.com"}
        </footer>
      </div>
    );
  }
);
