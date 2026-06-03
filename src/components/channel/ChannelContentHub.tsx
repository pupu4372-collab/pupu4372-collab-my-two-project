import type { ChannelContent, PetChannel } from "@/lib/channel/content";
import { getChannelInfoCards } from "@/lib/channel/content";
import { AuthRequiredLink } from "@/components/auth/AuthRequiredLink";
import { AdSlot } from "@/components/ads/AdSlot";
import { GlassCard, SectionHeader } from "@/components/layout/StitchLayout";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";

const THEME: Record<
  PetChannel,
  {
    accent: string;
    softBg: string;
    border: string;
    button: string;
    ring: string;
    heroImage: string;
    heroLabel: string;
    elementTitle: { ko: string; en: string };
    breedImages: string[];
  }
> = {
  dog: {
    accent: "text-channel-dog",
    softBg: "bg-channel-dog/10",
    border: "border-channel-dog/25",
    button: "bg-channel-dog text-white hover:brightness-105",
    ring: "bg-channel-dog/15",
    heroImage: "/stitch/asset-24.jpg",
    heroLabel: "CHANNEL DOG",
    elementTitle: { ko: "사주 맞춤 훈련", en: "Saju-based training" },
    breedImages: [
      "/stitch/asset-26.jpg",
      "/stitch/asset-27.jpg",
      "/stitch/asset-28.jpg",
      "/stitch/asset-29.jpg",
    ],
  },
  cat: {
    accent: "text-channel-cat",
    softBg: "bg-channel-cat/10",
    border: "border-channel-cat/25",
    button: "bg-channel-cat text-white hover:brightness-105",
    ring: "bg-channel-cat/15",
    heroImage: "/stitch/asset-37.jpg",
    heroLabel: "CHANNEL CAT",
    elementTitle: { ko: "사주 맞춤 케어", en: "Saju-based care" },
    breedImages: [
      "/stitch/asset-38.jpg",
      "/stitch/asset-39.jpg",
      "/stitch/asset-40.jpg",
      "/stitch/asset-41.jpg",
    ],
  },
  reptile: {
    accent: "text-channel-community",
    softBg: "bg-channel-community/10",
    border: "border-channel-community/25",
    button: "bg-channel-community text-white hover:brightness-105",
    ring: "bg-channel-community/15",
    heroImage: "/stitch/asset-17.jpg",
    heroLabel: "REPTILE & OTHER",
    elementTitle: { ko: "환경·케어 핵심", en: "Habitat essentials" },
    breedImages: ["/stitch/asset-22.jpg", "/stitch/asset-20.jpg", "/stitch/asset-23.jpg"],
  },
};

const REPTILE_CARE_CARDS = [
  {
    key: "habitat",
    tag: "Habitat",
    koTitle: "온도·습도·조명",
    enTitle: "Heat, humidity, light",
    koDesc: "종별 목표 온도와 습도를 맞추고, 급격한 환경 변화는 피해 주세요.",
    enDesc: "Match target heat and humidity by species and avoid sudden habitat shifts.",
    className: "bg-mint/50 text-channel-community",
  },
  {
    key: "diet",
    tag: "Diet",
    koTitle: "식단·급여 루틴",
    enTitle: "Diet and feeding",
    koDesc: "건초, 곤충, 펠릿, 습식 비율 등 종에 맞는 급여가 중요해요.",
    enDesc: "Hay, insects, pellets, and wet food ratios depend on the species.",
    className: "bg-sand text-to-yellow",
  },
  {
    key: "health",
    tag: "Health",
    koTitle: "스트레스·건강 신호",
    enTitle: "Stress and health cues",
    koDesc: "식욕, 활동량, 탈피, 깃털, 배변 변화를 매일 가볍게 체크하세요.",
    enDesc: "Watch appetite, activity, shedding, feathers, and droppings daily.",
    className: "bg-lavender/55 text-su-black",
  },
];

const ELEMENT_CARDS = [
  {
    key: "mok",
    tag: "Mok(木)",
    koTitle: "성장과 호기심",
    enTitle: "Growth and curiosity",
    koDesc: "새로운 산책길, 장난감, 환경 탐색에서 에너지를 잘 씁니다.",
    enDesc: "Best supported with new routes, toys, and safe exploration.",
    className: "bg-mint/50 text-mok-green",
  },
  {
    key: "hwa",
    tag: "Hwa(火)",
    koTitle: "표현과 교감",
    enTitle: "Expression and bonding",
    koDesc: "흥분을 낮추는 루틴과 짧은 칭찬 훈련이 잘 맞아요.",
    enDesc: "Short praise routines and calming care fit expressive pets.",
    className: "bg-blush/60 text-hwa-red",
  },
  {
    key: "to",
    tag: "To(土)",
    koTitle: "안정과 신뢰",
    enTitle: "Stability and trust",
    koDesc: "일정한 식사·휴식 리듬이 컨디션을 지켜줍니다.",
    enDesc: "Steady meal and rest rhythm helps keep balance.",
    className: "bg-sand text-to-yellow",
  },
  {
    key: "su",
    tag: "Su(水)",
    koTitle: "차분한 회복",
    enTitle: "Calm recovery",
    koDesc: "조용한 공간과 천천히 적응하는 환경 설계가 중요해요.",
    enDesc: "Quiet spaces and gradual changes support sensitive pets.",
    className: "bg-lavender/55 text-su-black",
  },
];

interface ChannelContentHubProps {
  content: ChannelContent;
  featured?: ChannelContent["featured"];
  articles?: ChannelContent["articles"];
  source?: "supabase" | "static";
}

export function ChannelContentHub({
  content,
  featured,
  articles,
  source,
}: ChannelContentHubProps) {
  const locale = useLocale();
  const isKo = locale === "ko";
  const theme = THEME[content.channel];
  const heroFeatured = featured ?? content.featured;
  const listArticles = articles ?? content.articles;
  const infoCards = getChannelInfoCards(content.channel, isKo ? "ko" : "en");
  const isReptile = content.channel === "reptile";
  const heroBadgeClass =
    content.channel === "dog"
      ? "bg-channel-dog"
      : content.channel === "cat"
        ? "bg-channel-cat"
        : "bg-channel-community";

  return (
    <div className="space-y-12">
      <section className="relative min-h-[360px] overflow-hidden rounded-[2.5rem] shadow-xl md:min-h-[500px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={theme.heroImage} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
        <div className="relative z-10 flex min-h-[360px] flex-col justify-end p-7 text-white md:min-h-[500px] md:p-12">
          <span className={`mb-4 w-fit rounded-full px-4 py-1 text-xs font-extrabold tracking-[0.18em] text-white ${heroBadgeClass}`}>
            {theme.heroLabel}
          </span>
          <h2 className="max-w-3xl text-3xl font-extrabold leading-tight md:text-5xl">{content.headline}</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/90 md:text-lg">{content.intro}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {content.heroPoints.map((point) => (
              <span key={point} className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-extrabold text-primary shadow-sm">
                {point}
              </span>
            ))}
          </div>
          {source && (
            <p className="mt-3 text-xs font-semibold text-white/70">
              {source === "supabase"
                ? isKo
                  ? "DB 콘텐츠 연동"
                  : "Connected DB content"
                : isKo
                  ? "기본 가이드 콘텐츠"
                  : "Default guide content"}
            </p>
          )}
        </div>
      </section>

      <section>
        <SectionHeader
          eyebrow={isReptile ? (isKo ? "Care" : "Care") : content.channel === "dog" ? "Training" : "Care"}
          title={isKo ? theme.elementTitle.ko : theme.elementTitle.en}
          subtitle={
            isReptile
              ? isKo
                ? "파충류·조류·소동물에게 공통으로 중요한 환경과 건강 포인트를 정리했어요."
                : "Core habitat and health points for reptiles, birds, and small pets."
              : isKo
                ? "오행의 기운에 맞춰 우리 아이의 성향과 돌봄 루틴을 가볍게 살펴보세요."
                : "Browse care patterns inspired by the five K-Saju elements."
          }
          action={
            <AuthRequiredLink
              href="/saju/compatibility"
              className={`inline-flex rounded-full px-5 py-3 text-sm font-extrabold shadow-sm transition hover:scale-105 ${theme.button}`}
            >
              {isKo ? "펫과 집사 궁합 보기" : "Check pet-parent bond"}
            </AuthRequiredLink>
          }
        />
        <div className={`mt-6 grid gap-4 ${isReptile ? "md:grid-cols-3" : "md:grid-cols-12"}`}>
          {(isReptile ? REPTILE_CARE_CARDS : ELEMENT_CARDS).map((card, index) => (
            <article
              key={card.key}
              className={`pastel-card p-6 ${isReptile ? "" : index === 0 ? "md:col-span-6" : index === 1 ? "md:col-span-6" : "md:col-span-4"}`}
            >
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${card.className}`}>{card.tag}</span>
              <h3 className="mt-4 text-xl font-extrabold text-primary">{isKo ? card.koTitle : card.enTitle}</h3>
              <p className="mt-2 text-sm leading-7 text-plum/65">{isKo ? card.koDesc : card.enDesc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="overflow-hidden">
        <SectionHeader
          eyebrow={isReptile ? (isKo ? "Species" : "Species") : isKo ? "Breed Guide" : "Breed Guide"}
          title={isReptile ? (isKo ? "종류별 가이드" : "Species guide") : isKo ? "품종별 가이드" : "Breed guide"}
          subtitle={
            isReptile
              ? isKo
                ? "파충류, 앵무새(조류), 다른동물 순으로 핵심 케어를 살펴보세요."
                : "Explore reptiles, birds, and other small pets."
              : isKo
                ? `${content.label} 집사가 자주 찾는 핵심 정보를 카드로 정리했어요.`
                : `Essential ${content.label.toLowerCase()} info in quick cards.`
          }
        />
        <div className="-mx-5 mt-6 flex snap-x gap-5 overflow-x-auto px-5 pb-6 md:-mx-10 md:px-10 hide-scrollbar">
          {infoCards.map((card, index) => (
            <article key={card.title} className="pastel-card w-[280px] shrink-0 snap-start overflow-hidden md:w-[320px]">
              <div className="h-44 overflow-hidden bg-white/45">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={theme.breedImages[index % theme.breedImages.length]} alt="" className="h-full w-full object-cover transition duration-500 hover:scale-105" />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-extrabold text-primary">{card.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-plum/65">{card.summary}</p>
                <ul className="mt-4 space-y-1.5 text-xs leading-5 text-plum/65">
                  {card.points.slice(0, 2).map((point) => (
                    <li key={point} className="flex gap-1.5">
                      <span className={theme.accent} aria-hidden>
                        •
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <Link
          href={`/${content.channel}/guide/${heroFeatured.id}`}
          className={`group block overflow-hidden rounded-[2rem] border-2 ${theme.border} bg-white/70 p-6 shadow-sm transition hover:-translate-y-1 hover:bg-white`}
        >
          <div className="flex flex-wrap items-center gap-2">
            {heroFeatured.badge && (
              <span className={`rounded-full ${theme.softBg} px-3 py-1 text-xs font-extrabold ${theme.accent}`}>
                {heroFeatured.badge}
              </span>
            )}
            <span className="text-xs font-semibold text-plum/45">
              {heroFeatured.categoryEmoji ? `${heroFeatured.categoryEmoji} ` : ""}
              {heroFeatured.category} · {heroFeatured.readTime}
            </span>
          </div>
          <h3 className="mt-4 text-2xl font-extrabold leading-tight text-primary group-hover:underline">{heroFeatured.title}</h3>
          <p className="mt-3 text-sm leading-7 text-plum/70">{heroFeatured.summary}</p>
          <Checklist items={heroFeatured.checklist} />
          <p className={`mt-5 text-sm font-extrabold ${theme.accent}`}>{isKo ? "자세히 읽기" : "Read more"} →</p>
        </Link>

        <GlassCard>
          <h3 className="text-lg font-extrabold text-primary">{isKo ? "오늘의 케어 루틴" : "Today's care routine"}</h3>
          <div className="mt-5 space-y-5">
            {content.routines.map((routine) => (
              <div key={routine.title}>
                <p className={`text-sm font-extrabold ${theme.accent}`}>{routine.title}</p>
                <ul className="mt-2 space-y-1 text-sm leading-6 text-plum/70">
                  {routine.items.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>

      <section>
        <SectionHeader
          eyebrow={isKo ? "Expert Tips" : "Expert Tips"}
          title={isKo ? "추천 콘텐츠" : "Recommended reads"}
          subtitle={isKo ? "가볍게 읽고 바로 실천할 수 있는 글" : "Quick reads you can try right away"}
        />
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {listArticles.map((article) => (
            <Link
              key={article.id}
              href={`/${content.channel}/guide/${article.id}`}
              className="pastel-card block p-5 shadow-sm transition hover:-translate-y-1 hover:bg-white/80"
            >
              <p className={`text-xs font-extrabold ${theme.accent}`}>
                {article.categoryEmoji ? `${article.categoryEmoji} ` : ""}
                {article.category} · {article.readTime}
              </p>
              <h4 className="mt-3 font-extrabold leading-snug text-primary">{article.title}</h4>
              <p className="mt-2 text-sm leading-6 text-plum/65">{article.summary}</p>
              <Checklist items={article.checklist.slice(0, 2)} compact />
            </Link>
          ))}
        </div>
      </section>

      <AdSlot />

      <GlassCard>
        <h3 className="font-extrabold text-primary">{isKo ? "인기 키워드" : "Popular keywords"}</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {content.keywords.map((keyword) => (
            <span
              key={keyword}
              className={`rounded-full ${theme.softBg} px-3 py-1.5 text-xs font-semibold text-plum`}
            >
              #{keyword}
            </span>
          ))}
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className={`inline-flex justify-center rounded-full px-6 py-3 text-sm font-bold transition ${theme.button}`}
          >
            {content.sajuCta}
          </Link>
          <AuthRequiredLink
            href="/saju/compatibility"
            className="inline-flex justify-center rounded-full border border-plum/15 bg-white px-6 py-3 text-sm font-bold text-plum transition hover:bg-petal/20"
          >
            {isKo ? "펫과 집사 궁합 보기" : "Check pet-parent bond"}
          </AuthRequiredLink>
        </div>
      </GlassCard>
    </div>
  );
}

function Checklist({ items, compact = false }: { items: string[]; compact?: boolean }) {
  return (
    <ul className={`mt-4 space-y-1.5 text-sm text-plum/70 ${compact ? "text-xs" : ""}`}>
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="text-mint" aria-hidden>
            ✓
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
