"use client";

import { SajuForm } from "@/components/k-saju/SajuForm";
import { PastelDecor } from "./PastelDecor";
import { KittenCorner, PuppyOnMoon } from "./PetIllustrations";
import { SiteNav } from "./SiteNav";

export function HomeLanding() {
  function scrollToForm() {
    document.getElementById("saju-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div id="top" className="relative min-h-screen bg-dream-sky">
      <PastelDecor />
      <PuppyOnMoon />
      <KittenCorner />

      <SiteNav />

      <section className="relative z-10 mx-auto max-w-3xl px-5 pb-8 pt-4 text-center md:pt-8">
        <h1 className="text-3xl font-bold leading-tight text-plum md:text-[2.35rem] md:leading-snug">
          반려동물의{" "}
          <span className="text-gradient-hero">별자리</span>와
          <br />
          운명을 알아보세요
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-plum/75 md:text-[15px]">
          한국 전통 사주명리학을 바탕으로 반려동물의 성격과 운명을 분석합니다.
          <br className="hidden sm:inline" />
          생년월일시를 입력하면 사주팔자를 확인할 수 있어요.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <button
            type="button"
            onClick={scrollToForm}
            className="inline-flex min-w-[240px] items-center justify-center gap-2 rounded-full bg-mint px-8 py-3.5 text-sm font-semibold text-ink transition hover:brightness-105 active:scale-[0.98]"
          >
            <span aria-hidden>🐾</span>
            우리 아이 댕냥 사주 보기
          </button>
          <button
            type="button"
            onClick={scrollToForm}
            className="inline-flex min-w-[200px] items-center justify-center rounded-full border-2 border-plum/25 bg-white/40 px-8 py-3.5 text-sm font-medium text-plum backdrop-blur-sm transition hover:bg-white/60 active:scale-[0.98]"
          >
            대표 사주 보기
          </button>
        </div>
      </section>

      <section
        id="saju-form"
        className="relative z-10 mx-auto -mt-2 max-w-2xl scroll-mt-6 px-4 pb-16 md:px-6"
      >
        <div className="pastel-card px-6 py-8 md:px-10 md:py-10">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-bold text-plum md:text-xl">
                <span aria-hidden className="mr-1">
                  🐾
                </span>
                반려동물 이름·생년월일을 입력해 주세요
              </h2>
              <p className="mt-1.5 text-sm text-plum/60">
                사진은 선택 사항이에요 (곧 업로드 연동 예정)
              </p>
            </div>
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-mint/50 text-2xl text-plum/70"
              title="사진 업로드 (준비 중)"
              aria-label="사진 업로드 준비 중"
            >
              📷
            </div>
          </div>
          <SajuForm embedded />
        </div>
      </section>

      <footer className="relative z-10 pb-8 text-center text-xs text-plum/50">
        <a href="/privacy" className="underline hover:text-plum">
          개인정보처리방침
        </a>
        {" · "}
        <a href="/terms" className="underline hover:text-plum">
          이용약관
        </a>
      </footer>
    </div>
  );
}
