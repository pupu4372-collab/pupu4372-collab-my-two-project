import type { ChannelContent } from "@/lib/channel/content";
import { AuthRequiredLink } from "@/components/auth/AuthRequiredLink";
import { Link } from "@/i18n/navigation";

interface DogChannelHomeProps {
  content: ChannelContent;
  featured?: ChannelContent["featured"];
  articles?: ChannelContent["articles"];
  source?: "supabase" | "static";
  isKo: boolean;
}

const IMAGE_BASE = "/stitch/global-design-system/dog";

type ElementKey = "mok" | "hwa" | "to" | "geum" | "su";

const ELEMENT_TAG_CLASS: Record<ElementKey, string> = {
  mok: "bg-green-500/10 text-green-500",
  hwa: "bg-red-500/10 text-red-500",
  to: "bg-amber-500/10 text-amber-500",
  geum: "bg-slate-400/10 text-slate-500",
  su: "bg-slate-800/10 text-slate-800",
};

function ElementTag({ element, isKo }: { element: ElementKey; isKo: boolean }) {
  const labels: Record<ElementKey, { ko: string; en: string }> = {
    mok: { ko: "Mok(木) 기운", en: "Mok (Wood)" },
    hwa: { ko: "Hwa(火) 기운", en: "Hwa (Fire)" },
    to: { ko: "To(土) 기운", en: "To (Earth)" },
    geum: { ko: "Geum(金) 기운", en: "Geum (Metal)" },
    su: { ko: "Su(水) 기운", en: "Su (Water)" },
  };
  return (
    <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${ELEMENT_TAG_CLASS[element]}`}>
      {isKo ? labels[element].ko : labels[element].en}
    </span>
  );
}

function breedGuideHref(slug: string | undefined, animal: "dog" | "cat") {
  if (!slug) return `/community/breeds?animal=${animal}`;
  return `/community/breeds/${slug}?from=${animal}`;
}

const DOG_BREEDS = [
  {
    image: "dog-02.jpg",
    ko: "골든 리트리버",
    en: "Golden Retriever",
    seoSlug: "golden-retriever",
    element: "to" as const,
    koSize: "대형견",
    enSize: "Large",
    koDesc: "친화력이 높고 영리한 골든 리트리버는 모든 가족에게 최고의 파트너입니다.",
    enDesc: "Friendly and bright — a classic family companion.",
  },
  {
    image: "dog-03.jpg",
    ko: "포메라니안",
    en: "Pomeranian",
    seoSlug: "pomeranian",
    element: "hwa" as const,
    koSize: "소형견",
    enSize: "Small",
    koDesc: "작지만 용감한 포메라니안은 화려한 외모만큼이나 풍부한 표현력을 가졌습니다.",
    enDesc: "Small but bold, with vivid personality.",
  },
  {
    image: "dog-04.jpg",
    ko: "푸들",
    en: "Poodle",
    seoSlug: "poodle",
    element: "su" as const,
    koSize: "다재다능",
    enSize: "Versatile",
    koDesc: "지능이 매우 높고 털 빠짐이 적어 한국 가정에서 가장 사랑받는 품종 중 하나입니다.",
    enDesc: "Smart, low-shedding, and widely loved.",
  },
  {
    image: "dog-05.jpg",
    ko: "말티즈",
    en: "Maltese",
    seoSlug: "maltese",
    element: "to" as const,
    koSize: "온순한",
    enSize: "Gentle",
    koDesc: "작고 하얀 털이 매력적인 말티즈는 집사님 곁을 지키는 가장 사랑스러운 파트너입니다.",
    enDesc: "A gentle lap companion with a soft white coat.",
  },
  {
    image: "dog-06.jpg",
    ko: "비숑 프리제",
    en: "Bichon Frise",
    seoSlug: "bichon-frise",
    element: "mok" as const,
    koSize: "활발한",
    enSize: "Playful",
    koDesc: "솜사탕 같은 털과 밝은 성격을 가진 비숑은 주변에 긍정적인 에너지를 전해줍니다.",
    enDesc: "Fluffy coat and upbeat energy for the home.",
  },
  {
    image: "dog-07.jpg",
    ko: "시바 Inu",
    en: "Shiba Inu",
    seoSlug: "shiba-inu",
    element: "geum" as const,
    koSize: "충직한",
    enSize: "Loyal",
    koDesc: "영리하고 독립심 강한 시바견은 때로는 진중하게, 때로는 귀엽게 집사님을 미소 짓게 합니다.",
    enDesc: "Clever, independent, and quietly charming.",
  },
  {
    image: "dog-08.jpg",
    ko: "웰시 코기",
    en: "Welsh Corgi",
    seoSlug: "welsh-corgi",
    element: "hwa" as const,
    koSize: "사교적인",
    enSize: "Social",
    koDesc: "짧은 다리와 넘치는 애교를 가진 웰시 코기는 어디서나 활력을 불어넣는 분위기 메이커입니다.",
    enDesc: "Short legs, big charm — a social mood booster.",
  },
] as const;

const EXPERT_TIPS = [
  {
    image: "dog-09.jpg",
    tag: { ko: "영양", en: "Nutrition" },
    ko: "나이별 필수 영양소 가이드",
    en: "Nutrients by life stage",
    koDesc: "퍼피부터 시니어까지, 시기별로 꼭 필요한 영양소는 무엇일까요?",
    enDesc: "What puppies, adults, and seniors need most.",
  },
  {
    image: "dog-10.jpg",
    tag: { ko: "행동", en: "Behavior" },
    ko: "분리불안을 줄이는 5가지 습관",
    en: "5 habits to ease separation anxiety",
    koDesc: "보호자가 외출할 때 우리 아이가 편안하게 기다릴 수 있는 방법.",
    enDesc: "Help your dog feel safe when you leave home.",
  },
  {
    image: "dog-11.jpg",
    tag: { ko: "건강", en: "Health" },
    ko: "집에서 하는 간단 건강 체크리스트",
    en: "At-home health checklist",
    koDesc: "매일 5분, 우리 아이의 건강 이상 신호를 미리 발견하세요.",
    enDesc: "Spot early warning signs in five minutes a day.",
  },
] as const;

const SAJU_TRAINING_CARDS = [
  {
    element: "mok" as const,
    icon: "🌿",
    ko: "Mok(木) 산책 훈련",
    en: "Mok walk training",
    koDesc: "호기심 많은 아이를 위한 야외 활동",
    enDesc: "Outdoor routines for curious dogs",
    className: "bg-mint/40",
  },
  {
    element: "hwa" as const,
    icon: "♥",
    ko: "Hwa(火) 진정 마사지",
    en: "Hwa calming massage",
    koDesc: "표현이 큰 아이를 위한 차분한 터치",
    enDesc: "Calming touch for expressive dogs",
    className: "bg-blush/40",
  },
  {
    element: "su" as const,
    icon: "💧",
    ko: "Su(水) 안정감",
    en: "Su calm stability",
    koDesc: "불안이 많은 아이를 위한 솔루션",
    enDesc: "For anxious dogs",
    className: "bg-lavender/40",
  },
  {
    element: "to" as const,
    icon: "⛰️",
    ko: "To(土) 포용력",
    en: "To grounded warmth",
    koDesc: "사회성을 기르는 그룹 훈련",
    enDesc: "Group social training",
    className: "bg-sand",
  },
  {
    element: "geum" as const,
    icon: "✨",
    ko: "Geum(金) 규칙",
    en: "Geum clear structure",
    koDesc: "단호하고 명확한 신호 교육",
    enDesc: "Clear cue-based training",
    className: "bg-slate-400/10",
  },
] as const;

export function DogChannelHome({
  content,
  featured,
  articles,
  source,
  isKo,
}: DogChannelHomeProps) {
  const heroFeatured = featured ?? content.featured;
  const guideArticles = articles?.length ? articles : content.articles;
  const guideCards = [heroFeatured, ...guideArticles].slice(0, 3);

  return (
    <div className="space-y-10">
      <section className="group relative h-[400px] overflow-hidden rounded-[3rem] shadow-2xl md:h-[520px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${IMAGE_BASE}/dog-01.jpg`}
          alt=""
          className="h-full w-full object-cover transition duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/30 to-transparent p-8 text-white md:p-16">
          <span className="inline-flex w-fit rounded-full bg-channel-dog px-4 py-1 text-xs font-extrabold uppercase tracking-wider">
            {isKo ? "건강" : "Wellness"}
          </span>
          <h2 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight md:text-5xl">
            {isKo ? (
              <>
                이번 달의 강아지 건강 리포트:
                <br />
                환절기 면역력 관리
              </>
            ) : (
              <>
                This month&apos;s dog health report:
                <br />
                Seasonal immunity care
              </>
            )}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/90 md:text-lg">
            {isKo
              ? "우리 아이를 위한 건강 정보와 맞춤형 사주 가이드를 통해 환절기 건강을 지켜주세요."
              : "Protect seasonal health with practical care and K-Saju guidance."}
          </p>
          <Link
            href={`/dog/guide/${heroFeatured.id}`}
            className="mt-6 w-fit rounded-full bg-white px-10 py-4 text-sm font-extrabold text-primary shadow-lg transition hover:bg-lavender active:scale-95"
          >
            {isKo ? "자세히 보기" : "Learn more"}
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-primary md:text-3xl">
              {isKo ? "사주 맞춤 훈련" : "K-Saju tailored training"}
            </h2>
            <p className="mt-1 text-sm text-plum/65">
              {isKo ? "오행의 기운에 따른 우리 아이 맞춤 교감법" : "Bonding methods aligned with elemental energy"}
            </p>
          </div>
          <Link href="/saju" className="flex items-center gap-1 text-sm font-extrabold text-primary">
            {isKo ? "모두 보기" : "View all"} <span aria-hidden>→</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {SAJU_TRAINING_CARDS.map((item) => (
            <div
              key={item.element}
              className={`flex min-h-[11rem] flex-col rounded-[1.5rem] border border-primary/5 p-5 ${item.className}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <ElementTag element={item.element} isKo={isKo} />
                  <span className="text-2xl leading-none text-channel-dog/35" aria-hidden>
                    {item.icon}
                  </span>
                </div>
                <h3 className="mt-4 text-sm font-extrabold leading-snug text-primary">{isKo ? item.ko : item.en}</h3>
                <p className="mt-2 text-xs leading-5 text-plum/65">{isKo ? item.koDesc : item.enDesc}</p>
              </div>
              <p className="mt-auto pt-4 text-[11px] font-extrabold text-primary/60">
                {isKo ? "준비중입니다" : "Coming soon"}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-primary md:text-3xl">
              {isKo ? "품종별 가이드" : "Breed guide"}
            </h2>
            <p className="mt-1 text-sm text-plum/65">
              {isKo ? "내 반려견의 특징을 더 깊이 이해해보세요" : "Understand your dog's breed traits"}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {DOG_BREEDS.map((breed) => (
            <Link
              key={breed.image}
              href={breedGuideHref(breed.seoSlug, "dog")}
              className="group cursor-pointer"
            >
              <div className="relative mb-3 aspect-[4/5] overflow-hidden rounded-[2rem] border border-black/5 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${IMAGE_BASE}/${breed.image}`}
                  alt={isKo ? breed.ko : breed.en}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />
                <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/75 p-4 backdrop-blur-md">
                  <h3 className="text-sm font-extrabold text-primary">{isKo ? breed.ko : breed.en}</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-primary/5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                      {isKo ? breed.koSize : breed.enSize}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-extrabold text-primary md:text-3xl">
            {isKo ? "전문가 팁" : "Expert tips"}
          </h2>
          <p className="mt-2 text-sm text-plum/65">
            {isKo ? "전문가들이 전하는 슬기로운 반려 생활 팁" : "Smarter daily care from experienced guardians"}
          </p>
        </div>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {EXPERT_TIPS.map((tip) => (
            <Link key={tip.image} href="/community/tips" className="group">
              <div className="relative mb-6 h-72 overflow-hidden rounded-[2.5rem] shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${IMAGE_BASE}/${tip.image}`}
                  alt=""
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />
                <span className="absolute left-5 top-5 rounded-full bg-white/90 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary backdrop-blur-md">
                  {isKo ? tip.tag.ko : tip.tag.en}
                </span>
              </div>
              <h3 className="font-extrabold text-primary transition group-hover:text-channel-dog">
                {isKo ? tip.ko : tip.en}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-plum/65">{isKo ? tip.koDesc : tip.enDesc}</p>
            </Link>
          ))}
        </div>
        {source && guideCards.length > 0 && (
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {guideCards.map((article) => (
              <Link
                key={article.id}
                href={`/dog/guide/${article.id}`}
                className="rounded-[1.5rem] border border-channel-dog/15 bg-white/80 p-5 shadow-sm transition hover:-translate-y-0.5"
              >
                <span className="text-xs font-extrabold uppercase tracking-wider text-channel-dog">
                  {article.category}
                </span>
                <h3 className="mt-2 line-clamp-2 font-extrabold text-primary">{article.title}</h3>
                <p className="mt-2 text-xs font-bold text-plum/50">READ GUIDE →</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-[2rem] bg-gradient-to-br from-channel-dog/15 to-lavender/30 p-6 text-center">
        <h2 className="text-2xl font-extrabold text-primary">
          {isKo ? "우리 댕댕이 사주도 같이 볼까요?" : "Read your dog's K-Saju too?"}
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-plum/65">{content.sajuCta}</p>
        <AuthRequiredLink
          href="/saju"
          className="mt-5 inline-flex rounded-full bg-channel-dog px-6 py-3 text-sm font-extrabold text-white shadow-sm transition hover:brightness-105"
        >
          {isKo ? "우리 아이 사주 보기" : "Read K-Saju"}
        </AuthRequiredLink>
      </section>
    </div>
  );
}
