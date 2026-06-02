import { Link } from "@/i18n/navigation";
import Image from "next/image";

interface SajuHubHeroProps {
  isKo: boolean;
}

export function SajuHubHero({ isKo }: SajuHubHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-cream via-lavender/45 to-mint/35 px-6 py-10 md:grid md:grid-cols-2 md:items-center md:gap-10 md:px-10 md:py-12">
      <div className="relative z-10 text-center md:text-left">
        <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.14em] text-primary">
          {isKo ? "PREMIUM ASTROLOGY" : "PREMIUM ASTROLOGY"}
        </span>
        <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-primary md:text-4xl">
          {isKo ? (
            <>
              우리 아이의 운명을
              <br />
              확인해 보세요
            </>
          ) : (
            <>
              Discover your pet&apos;s
              <br />
              cosmic story
            </>
          )}
        </h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-on-surface-variant md:text-base">
          {isKo
            ? "K-사주의 통찰로 반려동물의 타고난 기운과 집사님과의 인연을 분석해 드립니다."
            : "K-Saju readings reveal your pet's elemental vibe and the bond you share with your pet parent."}
        </p>
        <Link
          href="/home"
          className="mt-8 inline-flex rounded-3xl bg-primary px-8 py-3.5 text-sm font-bold text-cream shadow-lg shadow-primary/20 transition hover:brightness-105"
        >
          {isKo ? "지금 바로 분석 시작하기" : "Start a reading"}
        </Link>
      </div>

      <div className="relative mx-auto mt-8 max-w-sm md:mt-0">
        <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-lavender/50 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-6 -left-6 h-40 w-40 rounded-full bg-mint/40 blur-3xl" aria-hidden />
        <div className="relative z-10 grid grid-cols-2 gap-4">
          <div className="aspect-square rotate-[-3deg] overflow-hidden rounded-3xl border-4 border-white shadow-xl">
            <Image
              src="/stitch/asset-12.jpg"
              alt=""
              width={320}
              height={320}
              unoptimized
              className="h-full w-full object-cover"
            />
          </div>
          <div className="aspect-square translate-y-6 rotate-[3deg] overflow-hidden rounded-3xl border-4 border-white shadow-xl">
            <Image
              src="/stitch/asset-13.jpg"
              alt=""
              width={320}
              height={320}
              unoptimized
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
