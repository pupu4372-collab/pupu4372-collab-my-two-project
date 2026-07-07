"use client";

import type { PetDailyFortune, PetFortunePetMeta } from "@/lib/saju/pet-daily-fortune";
import {
  buildInstaSectionBodies,
  formatInstaCardKstDate,
  harmonyScore,
  instaCardStatItems,
  petInstaEmoji,
} from "@/lib/share/daily-fortune-insta-card";
import { forwardRef } from "react";

type Props = {
  pet: PetFortunePetMeta;
  fortune: PetDailyFortune;
  isKo: boolean;
};

export const DailyFortuneInstaCard = forwardRef<HTMLDivElement, Props>(function DailyFortuneInstaCard(
  { pet, fortune, isKo },
  ref,
) {
  const harmony = harmonyScore(fortune);
  const stats = instaCardStatItems(fortune, isKo);
  const sections = buildInstaSectionBodies(pet, fortune, isKo);
  const dateLabel = formatInstaCardKstDate(isKo);
  const petEmoji = petInstaEmoji(pet.species);

  const sectionCards = [
    {
      title: isKo ? "오늘의 아이 상태" : "Today's mood",
      body: sections.todayState,
      accent: "#E8C04A",
    },
    {
      title: isKo ? "아이의 본성" : "Innate nature",
      body: sections.nature,
      accent: "#3A362D",
    },
    {
      title: isKo ? "집사를 위한 팁" : "Tip for butler",
      body: sections.tipBody,
      accent: "#E8874A",
    },
  ];

  return (
    <div ref={ref} className="daily-fortune-insta-card">
      <div className="daily-fortune-insta-card__body">
        <header className="daily-fortune-insta-card__header">
          <p className="daily-fortune-insta-card__date">{dateLabel}</p>
          <h2 className="daily-fortune-insta-card__title">
            {petEmoji} {pet.name}
            {isKo ? "의 오늘의 운세" : "'s fortune today"}
          </h2>
        </header>

        <div className="daily-fortune-insta-card__hero">
          <div className="daily-fortune-insta-card__harmony-wrap">
            <div className="daily-fortune-insta-card__harmony-ring" aria-hidden />
            <div className="daily-fortune-insta-card__harmony">
              <p className="daily-fortune-insta-card__harmony-label">
                {isKo ? "운세 조화도" : "Harmony"}
              </p>
              <p className="daily-fortune-insta-card__harmony-score">{harmony}%</p>
              <span className="daily-fortune-insta-card__harmony-pill">{fortune.title}</span>
            </div>
          </div>

          <div className="daily-fortune-insta-card__stats">
            {stats.map((stat) => (
              <div key={stat.label} className="daily-fortune-insta-card__stat">
                <div className="daily-fortune-insta-card__stat-head">
                  <span className="daily-fortune-insta-card__stat-label">{stat.label}</span>
                  <span className="daily-fortune-insta-card__stat-band">{stat.band}</span>
                </div>
                <div className="daily-fortune-insta-card__stat-bar-bg">
                  <div
                    className="daily-fortune-insta-card__stat-bar-fill"
                    style={{ width: `${stat.score}%`, backgroundColor: stat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="daily-fortune-insta-card__sections">
          {sectionCards.map((section) => (
            <article
              key={section.title}
              className="daily-fortune-insta-card__section"
              style={{ borderTopColor: section.accent }}
            >
              <h3 className="daily-fortune-insta-card__section-title">{section.title}</h3>
              <p className="daily-fortune-insta-card__section-body">{section.body}</p>
            </article>
          ))}
        </div>

        <p className="daily-fortune-insta-card__watermark">#ksajupet</p>
      </div>

      <footer className="daily-fortune-insta-card__footer">
        {isKo ? "내 아이 운세 보러가기  ksajupet.com" : "See my pet's fortune  ksajupet.com"}
      </footer>
    </div>
  );
});
