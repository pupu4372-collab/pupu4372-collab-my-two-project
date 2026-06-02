"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";

const COPY = {
  ko: {
    badge: "404 오류",
    title: "길을 잃은 것 같아요",
    description:
      "찾으시는 페이지가 존재하지 않거나 주소가 변경되었어요. 집사님, 다시 별의 길을 따라가 볼까요?",
    home: "홈으로 돌아가기",
    back: "이전 페이지로",
  },
  en: {
    badge: "404 Error",
    title: "Looks like we're off the path",
    description:
      "This page does not exist or the address may have changed. Let's find the starry trail back home.",
    home: "Back to home",
    back: "Go back",
  },
} as const;

export function NotFoundView() {
  const locale = useLocale();
  const router = useRouter();
  const copy = COPY[locale === "ko" ? "ko" : "en"];

  return (
    <main className="relative flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center overflow-hidden px-5 py-12">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cream via-surface-container-low to-secondary-container/30" />
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-lavender/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-petal/30 blur-3xl" />

      <section className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center">
        <div className="relative mb-10 w-full max-w-md animate-float">
          <div className="absolute inset-0 -z-10 scale-125 rounded-full bg-primary-fixed/15 blur-3xl" />
          <Image
            src="/stitch/asset-70.jpg"
            alt=""
            width={480}
            height={480}
            unoptimized
            className="h-auto w-full drop-shadow-2xl"
            priority
          />
        </div>

        <span className="rounded-full bg-lavender/50 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
          {copy.badge}
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-primary md:text-5xl">{copy.title}</h1>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-plum/70 md:text-base">{copy.description}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:brightness-105"
          >
            <span aria-hidden>🏠</span>
            {copy.home}
          </Link>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center rounded-full border-2 border-primary/15 bg-white/70 px-8 py-3.5 text-sm font-bold text-primary transition hover:bg-white"
          >
            {copy.back}
          </button>
        </div>
      </section>
    </main>
  );
}
