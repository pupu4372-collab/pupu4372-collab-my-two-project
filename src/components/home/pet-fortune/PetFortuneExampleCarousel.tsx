"use client";

import { useTranslations } from "next-intl";

const FORTUNE_EXAMPLE_IMAGES = [
  "/home/fortune-carousel-1.png",
  "/home/fortune-carousel-2.png",
  "/home/fortune-carousel-3.png",
] as const;

export function PetFortuneExampleCarousel() {
  const t = useTranslations("home.guestFortune");

  return (
    <div className="space-y-3">
      <p className="px-1 text-center text-sm font-semibold leading-relaxed text-stone-700">
        {t("shareExampleCaption")}
      </p>
      <div className="-mx-1 touch-pan-x overscroll-x-contain">
        <div
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 pr-8 hide-scrollbar"
          role="region"
          aria-label={t("shareExampleCaption")}
        >
          {FORTUNE_EXAMPLE_IMAGES.map((src, index) => (
            <div
              key={src}
              className="w-[min(100%,20rem)] shrink-0 snap-center overflow-hidden rounded-2xl border border-stone-200/80 bg-stone-100 shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="aspect-square w-full object-cover"
                draggable={false}
              />
              {FORTUNE_EXAMPLE_IMAGES.length > 1 ? (
                <span className="sr-only">
                  {index + 1} / {FORTUNE_EXAMPLE_IMAGES.length}
                </span>
              ) : null}
            </div>
          ))}
          {FORTUNE_EXAMPLE_IMAGES.length > 1 ? (
            <div className="w-2 shrink-0 snap-none" aria-hidden />
          ) : null}
        </div>
      </div>
    </div>
  );
}
