"use client";

import { SajuForm } from "@/components/k-saju/SajuForm";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { PastelDecor } from "./PastelDecor";
import { KittenCorner, PawCrystalOrb, PuppyOnMoon } from "./PetIllustrations";
import { SiteNav } from "./SiteNav";

export function HomeLanding() {
  const t = useTranslations("home");
  const locale = useLocale();
  const isKo = locale === "ko";

  return (
    <div id="top" className="relative min-h-screen bg-dream-sky">
      <PastelDecor />
      <PuppyOnMoon />
      <KittenCorner />
      <PawCrystalOrb />

      <SiteNav />

      <section className="relative z-10 mx-auto max-w-3xl px-5 pb-8 pt-4 text-center md:pt-8">
        <h1 className="text-3xl font-bold leading-tight text-plum md:text-[2.35rem] md:leading-snug">
          {t("heroTitle")}{" "}
          <span className="text-gradient-hero">{t("heroHighlight")}</span>
          <br />
          {t("heroTitleEnd")}
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-plum/75 md:text-[15px]">
          {isKo ? (
            <>
              한국 전통 사주명리학을 바탕으로 반려동물의 성격과 운명을 분석합니다.
              <br />
              생년월일시를 입력하면 사주팔자를 확인할 수 있어요.
            </>
          ) : (
            t("heroSubtitle")
          )}
        </p>
      </section>

      <section
        id="saju-form"
        className="relative z-10 mx-auto -mt-2 max-w-[30rem] scroll-mt-6 px-4 pb-12"
      >
        <div className="pastel-card px-5 py-6 md:px-6 md:py-7">
          <div className="mb-4 text-center">
            <div>
              <h2 className="text-base font-bold text-plum md:text-lg">
                <span aria-hidden className="mr-1">
                  🐾
                </span>
                {t("formSubtitle")}
              </h2>
              <p className="mt-1 text-xs text-plum/60">
                {t("petShowHintBefore")}{" "}
                <Link href="/community/pet-show" className="underline hover:text-plum">
                  {t("petShowHintLink")}
                </Link>
                {t("petShowHintAfter") ? ` ${t("petShowHintAfter")}` : ""}
              </p>
            </div>
          </div>
          <SajuForm embedded />
        </div>
      </section>

      <footer className="relative z-10 pb-8 text-center text-xs text-plum/50">
        <Link href="/privacy" className="underline hover:text-plum">
          {t("privacy")}
        </Link>
        {" · "}
        <Link href="/terms" className="underline hover:text-plum">
          {t("terms")}
        </Link>
      </footer>
    </div>
  );
}
