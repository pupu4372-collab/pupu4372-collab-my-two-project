import type { ChannelContent } from "@/lib/channel/content";
import { AuthRequiredLink } from "@/components/auth/AuthRequiredLink";
import { Link } from "@/i18n/navigation";

interface CatChannelHomeProps {
  content: ChannelContent;
  featured?: ChannelContent["featured"];
  articles?: ChannelContent["articles"];
  source?: "supabase" | "static";
  isKo: boolean;
}

const IMAGE_BASE = "/stitch/global-design-system/cat";

type ElementKey = "mok" | "hwa" | "to" | "geum" | "su";

const ELEMENT_TAG_CLASS: Record<ElementKey, string> = {
  mok: "bg-green-500/10 text-green-500",
  hwa: "bg-red-500/10 text-red-500",
  to: "bg-amber-500/10 text-amber-500",
  geum: "bg-slate-500/10 text-slate-600",
  su: "bg-slate-800/10 text-slate-800",
};

function ElementTag({ element, isKo }: { element: ElementKey; isKo: boolean }) {
  const labels: Record<ElementKey, { ko: string; en: string }> = {
    mok: { ko: "Mok(木)", en: "Mok (Wood)" },
    hwa: { ko: "Hwa(火)", en: "Hwa (Fire)" },
    to: { ko: "To(土)", en: "To (Earth)" },
    geum: { ko: "Geum(金)", en: "Geum (Metal)" },
    su: { ko: "Su(水)", en: "Su (Water)" },
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${ELEMENT_TAG_CLASS[element]}`}>
      {isKo ? labels[element].ko : labels[element].en}
    </span>
  );
}

const SAJU_CARE = [
  {
    element: "mok" as const,
    koTitle: "성장과 호기심",
    enTitle: "Growth & curiosity",
    koDesc: "수직 공간 정복을 즐기며 새로운 장난감에 민감한 성향입니다.",
    enDesc: "Loves vertical space and reacts quickly to new toys.",
    koLuck: "행운의 색: 그린",
    enLuck: "Lucky color: green",
    highlight: false,
  },
  {
    element: "hwa" as const,
    koTitle: "열정과 사교성",
    enTitle: "Passion & sociability",
    koDesc: "에너지가 넘치고 집사와의 교감을 강력하게 원하는 타입입니다.",
    enDesc: "High energy and strong desire to bond with guardians.",
    koLuck: "행운의 색: 레드",
    enLuck: "Lucky color: red",
    highlight: true,
  },
  {
    element: "to" as const,
    koTitle: "안정과 신뢰",
    enTitle: "Stability & trust",
    koDesc: "변화를 싫어하며 자신만의 루틴이 확실한 고양이입니다.",
    enDesc: "Dislikes change and keeps a steady daily routine.",
    koLuck: "행운의 색: 옐로우",
    enLuck: "Lucky color: yellow",
    highlight: false,
  },
  {
    element: "geum" as const,
    koTitle: "결단과 독립성",
    enTitle: "Focus & independence",
    koDesc: "깔끔한 성격으로 그루밍에 진심이며 독립적인 공간을 선호합니다.",
    enDesc: "Neat, grooming-focused, and prefers personal space.",
    koLuck: "행운의 색: 화이트",
    enLuck: "Lucky color: white",
    highlight: false,
  },
] as const;

function breedGuideHref(slug: string | undefined, animal: "dog" | "cat") {
  if (!slug) return `/community/breeds?animal=${animal}`;
  return `/community/breeds/${slug}?from=${animal}`;
}

const CAT_BREEDS: Array<{ image: string; ko: string; en: string; seoSlug?: string }> = [
  { image: "cat-03.jpg", ko: "페르시안", en: "Persian", seoSlug: "persian" },
  { image: "cat-04.jpg", ko: "터키시 앙고라", en: "Turkish Angora" },
  { image: "cat-05.jpg", ko: "코리안 쇼트헤어", en: "Korean Short Hair", seoSlug: "korean-shorthair" },
  { image: "cat-06.jpg", ko: "아비시니안", en: "Abyssinian" },
  { image: "cat-07.jpg", ko: "아메리칸 쇼트헤어", en: "American Short Hair" },
  { image: "cat-08.jpg", ko: "스코티시 폴드", en: "Scottish Fold", seoSlug: "scottish-fold" },
  { image: "cat-09.jpg", ko: "샴", en: "Siamese", seoSlug: "siamese" },
  { image: "cat-10.jpg", ko: "뱅갈", en: "Bengal", seoSlug: "bengal" },
  { image: "cat-11.jpg", ko: "먼치킨", en: "Munchkin" },
  { image: "cat-12.jpg", ko: "러시안 블루", en: "Russian Blue", seoSlug: "russian-blue" },
  { image: "cat-13.jpg", ko: "노르웨이 숲", en: "Norwegian Forest" },
];

const EXPERT_TIPS = [
  {
    image: "cat-14.jpg",
    ko: "고양이 수직 공간 구성법",
    en: "Vertical space for cats",
    koDesc: "좁은 공간에서도 만족할 수 있는 효율적인 수직 동선 설계 가이드입니다.",
    enDesc: "Design vertical routes that work even in compact homes.",
  },
  {
    image: "cat-15.jpg",
    ko: "식습관 체크리스트",
    en: "Diet checklist",
    koDesc: "나이별, 체질별 맞춤 사료 선택과 음수량 관리를 위한 필수 항목들을 확인하세요.",
    enDesc: "Age- and body-type-aware feeding and hydration checks.",
  },
  {
    image: "cat-16.jpg",
    ko: "환절기 털 관리 비책",
    en: "Seasonal coat care",
    koDesc: "헤어볼 예방과 윤기 나는 피모를 위한 브러싱 테크닉과 영양제 추천.",
    enDesc: "Brushing routines and supplements for coat health and hairballs.",
  },
  {
    image: "cat-17.jpg",
    ko: "고양이 언어 이해하기",
    en: "Reading cat language",
    koDesc: "꼬리 모양과 울음소리로 분석하는 반려묘의 심리 상태와 대화법.",
    enDesc: "Decode mood from tail posture and vocal cues.",
  },
] as const;

export function CatChannelHome({
  content,
  featured,
  articles,
  source,
  isKo,
}: CatChannelHomeProps) {
  const heroFeatured = featured ?? content.featured;
  const guideArticles = articles?.length ? articles : content.articles;
  const guideCards = [heroFeatured, ...guideArticles].slice(0, 4);

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[2.5rem] shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${IMAGE_BASE}/cat-02.jpg`}
          alt=""
          className="aspect-[16/9] w-full object-cover md:aspect-[21/9]"
        />
        <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-r from-primary/60 to-transparent px-8 text-white md:px-16">
          <span className="inline-flex w-fit rounded-full bg-channel-cat px-4 py-1 text-xs font-extrabold tracking-[0.18em]">
            CHANNEL CAT
          </span>
          <h2 className="mt-4 max-w-2xl text-3xl font-extrabold leading-tight md:text-5xl">
            {isKo ? (
              <>
                이번 달의 고양이 건강 리포트:
                <br />
                환절기 면역력 관리
              </>
            ) : (
              <>
                This month&apos;s cat health report:
                <br />
                Seasonal immunity care
              </>
            )}
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-7 text-white/90 md:text-lg">
            {isKo
              ? "기온 변화에 민감한 고양이를 위한 사주 기반의 맞춤형 건강 관리 비책을 확인해보세요."
              : "K-Saju based wellness tips for cats sensitive to temperature shifts."}
          </p>
          <Link
            href={`/cat/guide/${heroFeatured.id}`}
            className="mt-6 w-fit rounded-full bg-channel-cat px-8 py-4 text-sm font-extrabold text-white shadow-sm transition hover:scale-105 active:scale-95"
          >
            {isKo ? "리포트 읽어보기" : "Read report"}
          </Link>
        </div>
      </section>

      <section className="overflow-hidden">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-primary md:text-3xl">
              {isKo ? "사주 맞춤 케어" : "K-Saju tailored care"}
            </h2>
            <p className="mt-1 text-sm text-plum/65">
              {isKo ? "오행(五行)으로 분석하는 반려묘의 성향과 돌봄법" : "Care cues from the five elements"}
            </p>
          </div>
          <Link href="/saju" className="flex items-center gap-1 text-sm font-extrabold text-channel-cat">
            {isKo ? "전체보기" : "View all"} <span aria-hidden>→</span>
          </Link>
        </div>
        <div className="-mx-2 flex gap-4 overflow-x-auto px-2 pb-4 hide-scrollbar">
          {SAJU_CARE.map((card) => (
            <div
              key={card.element}
              className={`flex min-w-[280px] flex-col rounded-[2rem] border border-primary/10 bg-white/60 p-8 backdrop-blur-md md:min-w-[320px] ${
                card.highlight ? "border-channel-cat/20 bg-channel-cat/5" : ""
              }`}
            >
              <ElementTag element={card.element} isKo={isKo} />
              <h3 className="mt-4 text-xl font-extrabold text-primary">{isKo ? card.koTitle : card.enTitle}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-plum/65">{isKo ? card.koDesc : card.enDesc}</p>
              <p className="mt-6 border-t border-primary/5 pt-4 text-xs text-plum/55">
                {isKo ? card.koLuck : card.enLuck}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-primary md:text-3xl">
            {isKo ? "품종별 가이드" : "Breed guide"}
          </h2>
          <p className="mt-1 text-sm text-plum/65">
            {isKo ? "묘종에 따른 유전적 특성과 사주 에너지의 조화" : "Traits and elemental energy by breed"}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {CAT_BREEDS.map((breed) => (
            <Link
              key={breed.image}
              href={breedGuideHref(breed.seoSlug, "cat")}
              className="group cursor-pointer"
            >
              <div className="relative mb-3 aspect-[4/5] overflow-hidden rounded-[2rem] border border-black/5 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${IMAGE_BASE}/${breed.image}`}
                  alt={isKo ? breed.ko : breed.en}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />
                <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/70 p-4 backdrop-blur-md">
                  <h3 className="text-sm font-extrabold text-primary">{isKo ? breed.ko : breed.en}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-[3rem] bg-primary/5 p-6 md:p-12">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-primary md:text-3xl">
              {isKo ? "전문가 팁" : "Expert tips"}
            </h2>
            <p className="mt-1 text-sm text-plum/65">
              {isKo ? "베테랑 집사들과 수의사가 제안하는 묘생 꿀팁" : "Practical tips from experienced cat parents"}
            </p>
          </div>
          <Link
            href="/community/tips"
            className="w-fit rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-white"
          >
            {isKo ? "더 많은 팁 보기" : "More tips"}
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {EXPERT_TIPS.map((tip) => (
            <Link
              key={tip.image}
              href="/community/tips"
              className="group flex items-center gap-6 rounded-[2rem] bg-white p-6 transition hover:shadow-md"
            >
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-sand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${IMAGE_BASE}/${tip.image}`} alt="" className="h-full w-full object-cover" />
              </div>
              <div>
                <h3 className="font-extrabold text-primary transition group-hover:text-channel-cat">
                  {isKo ? tip.ko : tip.en}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-plum/65">{isKo ? tip.koDesc : tip.enDesc}</p>
              </div>
            </Link>
          ))}
        </div>
        {source && guideCards.length > 0 && (
          <div className="mt-10 border-t border-primary/10 pt-8">
            <div className="mb-4 flex items-end justify-between gap-3">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-channel-cat">
                {isKo ? "추천 가이드" : "Featured guides"}
              </p>
              <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-plum/50">
                {source === "supabase" ? "DB" : "Static"}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {guideCards.map((article) => (
                <Link
                  key={article.id}
                  href={`/cat/guide/${article.id}`}
                  className="rounded-[1.5rem] border border-channel-cat/15 bg-white/80 p-5 shadow-sm transition hover:-translate-y-0.5"
                >
                  <span className="text-xs font-extrabold uppercase tracking-wider text-channel-cat">
                    {article.category}
                  </span>
                  <h3 className="mt-2 line-clamp-2 font-extrabold text-primary">{article.title}</h3>
                  <p className="mt-2 text-xs font-bold text-plum/50">READ GUIDE →</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="rounded-[2rem] bg-gradient-to-br from-channel-cat/15 to-gold/20 p-6 text-center">
        <h2 className="text-2xl font-extrabold text-primary">
          {isKo ? "우리 냥이 사주도 같이 볼까요?" : "Read your cat's K-Saju too?"}
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-plum/65">{content.sajuCta}</p>
        <AuthRequiredLink
          href="/saju"
          className="mt-5 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-white shadow-sm transition hover:brightness-105"
        >
          {isKo ? "우리 아이 사주 보기" : "Read K-Saju"}
        </AuthRequiredLink>
      </section>
    </div>
  );
}
