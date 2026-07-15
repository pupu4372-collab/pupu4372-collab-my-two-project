"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

const FORTUNE_EXAMPLE_IMAGES = [
  "/home/fortune-carousel-1.png",
  "/home/fortune-carousel-2.png",
  "/home/fortune-carousel-3.png",
] as const;

const LAST_INDEX = FORTUNE_EXAMPLE_IMAGES.length - 1;
const AUTO_MS = 5000;
const SWIPE_THRESHOLD_PX = 50;

export function PetFortuneExampleCarousel() {
  const t = useTranslations("home.guestFortune");
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartXRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev >= LAST_INDEX ? 0 : prev + 1));
    }, AUTO_MS);
  }, [clearTimer]);

  useEffect(() => {
    startTimer();
    return clearTimer;
  }, [startTimer, clearTimer]);

  const goToClamped = useCallback(
    (index: number) => {
      setActiveIndex(Math.min(LAST_INDEX, Math.max(0, index)));
      startTimer();
    },
    [startTimer]
  );

  function handleTouchStart(event: React.TouchEvent) {
    touchStartXRef.current = event.changedTouches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: React.TouchEvent) {
    const startX = touchStartXRef.current;
    touchStartXRef.current = null;
    if (startX == null) return;

    const endX = event.changedTouches[0]?.clientX ?? startX;
    const delta = endX - startX;
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;

    // swipe left → next, swipe right → prev (manual: clamp, no wrap)
    if (delta < 0) {
      setActiveIndex((prev) => Math.min(LAST_INDEX, prev + 1));
    } else {
      setActiveIndex((prev) => Math.max(0, prev - 1));
    }
    startTimer();
  }

  return (
    <div className="space-y-3">
      <p className="px-1 text-center text-sm font-semibold leading-relaxed text-stone-700">
        {t("shareExampleCaption")}
      </p>

      <div
        className="[--slide-w:85%] overflow-hidden md:[--slide-w:70%]"
        role="region"
        aria-roledescription="carousel"
        aria-label={t("shareExampleCaption")}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{
            width: "100%",
            transform: `translateX(calc((100% - var(--slide-w)) / 2 - ${activeIndex} * var(--slide-w)))`,
          }}
        >
          {FORTUNE_EXAMPLE_IMAGES.map((src, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={src}
                type="button"
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} / ${FORTUNE_EXAMPLE_IMAGES.length}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => {
                  if (!isActive) goToClamped(index);
                }}
                className={`w-[85%] flex-shrink-0 origin-center overflow-hidden rounded-2xl border border-stone-200/80 bg-stone-100 shadow-sm transition duration-300 md:w-[70%] ${
                  isActive ? "scale-100 opacity-100" : "scale-95 opacity-60"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  className="aspect-square w-full object-cover"
                  draggable={false}
                />
              </button>
            );
          })}
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
              onClick={() => goToClamped(index)}
              className={`h-1.5 rounded-full transition-all ${
                activeIndex === index ? "w-5 bg-stone-700" : "w-1.5 bg-stone-300"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
