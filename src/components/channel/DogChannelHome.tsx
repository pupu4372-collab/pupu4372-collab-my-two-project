import type { ChannelContent } from "@/lib/channel/content";
import { AuthRequiredLink } from "@/components/auth/AuthRequiredLink";
import { Link } from "@/i18n/navigation";
import { SAJU_TRAINING_CARDS, type SajuTrainingElement } from "@/lib/channel/saju-training";

interface DogChannelHomeProps {
  content: ChannelContent;
  featured?: ChannelContent["featured"];
  articles?: ChannelContent["articles"];
  source?: "supabase" | "static";
  isKo: boolean;
}

const IMAGE_BASE = "/stitch/global-design-system/dog";

const ELEMENT_TAG_CLASS: Record<SajuTrainingElement, string> = {
  mok: "bg-green-500/10 text-green-500",
  hwa: "bg-red-500/10 text-red-500",
  to: "bg-amber-500/10 text-amber-500",
  geum: "bg-slate-400/10 text-slate-500",
  su: "bg-slate-800/10 text-slate-800",
};

function ElementTag({ element, isKo }: { element: SajuTrainingElement; isKo: boolean }) {
  const labels: Record<SajuTrainingElement, { ko: string; en: string }> = {
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

const DOG_BREED_CATEGORIES = [
  {
    id: "large",
    image: "dog-02.jpg",
    ko: "대형견",
    en: "Large breeds",
    koDesc: "골든 리트리버, 래브라도, 허스키 등",
    enDesc: "Golden Retriever, Labrador, Husky, and more",
  },
  {
    id: "medium",
    image: "dog-07.jpg",
    ko: "중형견",
    en: "Medium breeds",
    koDesc: "코기, 시바, 비글, 보더 콜리 등",
    enDesc: "Corgi, Shiba, Beagle, Border Collie, and more",
  },
  {
    id: "small",
    image: "dog-05.jpg",
    ko: "소형견",
    en: "Small breeds",
    koDesc: "말티즈, 푸들, 포메, 치와와 등",
    enDesc: "Maltese, Poodle, Pomeranian, Chihuahua, and more",
  },
  {
    id: "mixed",
    image: "dog-01.jpg",
    ko: "믹스견",
    en: "Mixed breeds",
    koDesc: "품종보다 개체 성향과 입양 경험이 중요해요",
    enDesc: "Individual temperament matters more than breed label",
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

export function DogChannelHome({
  content,
  featured,
  articles,
  source,
  isKo,
}: DogChannelHomeProps) {
  const heroFeatured = featured ?? content.featured;
  const heroGuide = isKo && source === "supabase" ? heroFeatured : content.featured;
  const guideArticles = articles?.length ? articles : content.articles;
  const editorialGuideCards =
    source === "supabase" ? [heroFeatured, ...guideArticles].slice(0, 3) : [];
  const guideCards = isKo ? editorialGuideCards : [content.featured, ...content.articles].slice(0, 3);

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
            href={`/dog/guide/${heroGuide.id}`}
            className="mt-6 w-fit rounded-full bg-white px-10 py-4 text-sm font-extrabold text-primary shadow-lg transition hover:bg-lavender active:scale-95"
          >
            {isKo ? "자세히 보기" : "Learn more"}
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-white md:text-3xl">
              {isKo ? "사주 맞춤 훈련" : "K-Saju tailored training"}
            </h2>
            <p className="mt-1 text-sm text-white/75">
              {isKo ? "오행의 기운에 따른 우리 아이 맞춤 교감법" : "Bonding methods aligned with elemental energy"}
            </p>
          </div>
          <Link href="/saju" className="flex items-center gap-1 text-sm font-extrabold text-[#ffd7ff]">
            {isKo ? "모두 보기" : "View all"} <span aria-hidden>→</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {SAJU_TRAINING_CARDS.map((item) => (
            <Link
              key={item.element}
              href={`/dog/training/${item.element}`}
              className="group flex min-h-[13rem] flex-col rounded-[1.5rem] border border-white/20 bg-cream p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <ElementTag element={item.element} isKo={isKo} />
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-channel-dog/10 text-xl font-extrabold leading-none text-channel-dog/45 transition group-hover:bg-channel-dog/15" aria-hidden>
                    {item.icon}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-extrabold leading-snug text-primary">{isKo ? item.ko : item.en}</h3>
                <p className="mt-3 text-sm font-semibold leading-7 text-plum/80">{isKo ? item.koDesc : item.enDesc}</p>
              </div>
              <div className="mt-auto flex flex-wrap gap-2 pt-5">
                {(isKo ? item.koActions : item.enActions).map((action) => (
                  <span key={action} className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-plum shadow-sm">
                    {action}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-white md:text-3xl">
              {isKo ? "품종별 가이드" : "Breed guide"}
            </h2>
            <p className="mt-1 text-sm text-white/75">
              {isKo
                ? "크기별로 나눠 커뮤니티 품종 가이드에서 자세히 볼 수 있어요"
                : "Browse community breed guides by size"}
            </p>
          </div>
          <Link
            href="/community/breeds?animal=dog"
            className="text-sm font-extrabold text-[#ffd7ff]"
          >
            {isKo ? "전체 가이드" : "All guides"} →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {DOG_BREED_CATEGORIES.map((category) => (
            <Link
              key={category.id}
              href="/community/breeds?animal=dog"
              className="group cursor-pointer"
            >
              <div className="relative mb-3 aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/15 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${IMAGE_BASE}/${category.image}`}
                  alt=""
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-cream/95 p-4 shadow-lg backdrop-blur-md transition duration-300 group-hover:-translate-y-1 group-hover:bg-white">
                  <h3 className="text-base font-extrabold text-ink">{isKo ? category.ko : category.en}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-plum/80">
                    {isKo ? category.koDesc : category.enDesc}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-extrabold text-white md:text-3xl">
            {isKo ? "전문가 팁" : "Expert tips"}
          </h2>
          <p className="mt-2 text-sm text-white/75">
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
              <h3 className="font-extrabold text-white transition group-hover:text-[#ffd7ff]">
                {isKo ? tip.ko : tip.en}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/75">{isKo ? tip.koDesc : tip.enDesc}</p>
            </Link>
          ))}
        </div>
        {guideCards.length > 0 && (isKo ? source === "supabase" : true) && (
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {guideCards.map((article) => (
              <Link
                key={article.id}
                href={`/dog/guide/${article.id}`}
                className="rounded-[1.5rem] border border-white/20 bg-cream p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <span className="text-xs font-extrabold uppercase tracking-wider text-channel-dog">
                  {article.category}
                </span>
                <h3 className="mt-2 line-clamp-2 font-extrabold text-ink">{article.title}</h3>
                <p className="mt-2 text-xs font-bold text-channel-dog">
                  {isKo ? "가이드 읽기" : "Read guide"} →
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-[2rem] border border-white/30 bg-cream p-6 text-center shadow-lg md:p-8">
        <h2 className="text-2xl font-extrabold text-ink md:text-3xl">
          {isKo ? "우리 댕댕이 사주도 같이 볼까요?" : "Read your dog's K-Saju too?"}
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-plum/80">{content.sajuCta}</p>
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
