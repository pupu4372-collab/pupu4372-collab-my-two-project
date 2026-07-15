"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

const FORTUNE_EXAMPLE_IMAGES = [
  "/home/fortune-carousel-1.png",
  "/home/fortune-carousel-2.png",
  "/home/fortune-carousel-3.png",
] as const;

export function PetFortuneExampleCarousel() {
  const t = useTranslations("home.guestFortune");
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries.reduce(
          (best, entry) =>
            entry.intersectionRatio > (best?.intersectionRatio ?? 0) ? entry : best,
          entries[0]
        );
        if (mostVisible?.isIntersecting) {
          const index = cardRefs.current.findIndex((el) => el === mostVisible.target);
          if (index !== -1) setActiveIndex(index);
        }
      },
      { root: container, threshold: [0.5, 0.75, 1] }
    );

    cardRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToIndex = (index: number) => {
    cardRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  return (
    <div className="space-y-3">
      <p className="px-1 text-center text-sm font-semibold leading-relaxed text-stone-700">
        {t("shareExampleCaption")}
      </p>

      {/* full-bleed wrapper: 부모의 padding 값과 무관하게 항상 뷰포트 기준으로 꽉 참 */}
      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen touch-pan-x overscroll-x-contain">
        <div
          ref={scrollRef}
          className="carousel-scroll flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-[6%] px-[6%] pb-2"
          role="region"
          aria-roledescription="carousel"
          aria-label={t("shareExampleCaption")}
        >
          {FORTUNE_EXAMPLE_IMAGES.map((src, index) => (
            <div
              key={src}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} / ${FORTUNE_EXAMPLE_IMAGES.length}`}
              className="w-[88%] max-w-xs shrink-0 snap-center overflow-hidden rounded-2xl border border-stone-200/80 bg-stone-100 shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="aspect-square w-full object-cover"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      {FORTUNE_EXAMPLE_IMAGES.length > 1 ? (
        <div
          className="flex items-center justify-center gap-1.5"
          role="tablist"
          aria-label={t("shareExampleCaption")}
        >
          {FORTUNE_EXAMPLE_IMAGES.map((_, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={activeIndex === index}
              aria-label={`${index + 1} / ${FORTUNE_EXAMPLE_IMAGES.length}`}
              onClick={() => scrollToIndex(index)}
              className={`h-1.5 rounded-full transition-all ${
                activeIndex === index ? "w-5 bg-stone-700" : "w-1.5 bg-stone-300"
              }`}
            />
          ))}
        </div>
      ) : null}

      <style jsx>{`
        .carousel-scroll::-webkit-scrollbar {
          display: none;
        }
        .carousel-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>
    </div>
  );
}
