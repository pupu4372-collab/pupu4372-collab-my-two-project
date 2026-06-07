import type { ChannelContent } from "@/lib/channel/content";
import { AuthRequiredLink } from "@/components/auth/AuthRequiredLink";
import { Link } from "@/i18n/navigation";

interface ReptileChannelHomeProps {
  content: ChannelContent;
  featured?: ChannelContent["featured"];
  articles?: ChannelContent["articles"];
  source?: "supabase" | "static";
  isKo: boolean;
}

const IMAGE_BASE = "/stitch/reptile-renewal";

const SPECIES = [
  {
    key: "reptiles",
    emoji: "🦎",
    koTitle: "파충류",
    enTitle: "Reptiles",
    koDesc: "도마뱀, 거북이, 뱀 등",
    enDesc: "Lizards, turtles, snakes",
    koMeta: "UVB · 온도 구배 · 탈피",
    enMeta: "UVB · heat gradient · shedding",
    image: "community-chameleon.jpg",
  },
  {
    key: "birds",
    emoji: "🦜",
    koTitle: "앵무새(조류)",
    enTitle: "Birds",
    koDesc: "앵무새와 반려 조류",
    enDesc: "Parrots and companion birds",
    koMeta: "스트레스 · 놀이 · 깃털",
    enMeta: "Stress · play · feathers",
    image: "community-parrot.jpg",
  },
  {
    key: "small-pets",
    emoji: "🐰",
    koTitle: "소동물",
    enTitle: "Small pets",
    koDesc: "토끼, 햄스터, 기니피그 등",
    enDesc: "Rabbits, hamsters, guinea pigs",
    koMeta: "공간 · 식단 · 청결",
    enMeta: "Space · diet · hygiene",
    image: "community-rabbit.jpg",
  },
] as const;

const CHECKLIST = [
  { ko: "온도 구배 확인", en: "Check heat gradient", sub: "HOT & COOL ZONE BALANCE" },
  { ko: "습도 유지", en: "Keep humidity stable", sub: "HYGROMETER MONITORING" },
  { ko: "은신처 충분 여부", en: "Enough hiding spots", sub: "STRESS REDUCTION" },
  { ko: "UVB 램프 교체 주기", en: "UVB lamp cycle", sub: "6-12 MONTHS CYCLE" },
] as const;

export function ReptileChannelHome({
  content,
  featured,
  articles,
  source,
  isKo,
}: ReptileChannelHomeProps) {
  const heroFeatured = featured ?? content.featured;
  const guideArticles = articles?.length ? articles : content.articles;
  const guideCards = [heroFeatured, ...guideArticles].slice(0, 4);

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#fbfaee] p-4 shadow-xl md:p-6">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-channel-community/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-gold/20 blur-3xl" />
        <div className="relative overflow-hidden rounded-[1.5rem]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${IMAGE_BASE}/hero-crested-gecko.jpg`}
            alt=""
            className="h-[360px] w-full object-cover transition duration-700 hover:scale-105 md:h-[520px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-10">
            <span className="inline-flex rounded-full bg-channel-community px-4 py-1.5 text-xs font-extrabold tracking-[0.18em]">
              REPTILE & OTHER PETS
            </span>
            <h2 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight md:text-5xl">
              {isKo ? "렙타일(다른동물) 케어 허브" : "Reptile & Other Pets Care Hub"}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/90 md:text-lg">
              {isKo
                ? "파충류, 앵무새, 토끼·햄스터까지. 온도·습도·식단 정보를 한 곳에서 확인하세요."
                : "Reptiles, birds, rabbits, and hamsters. Check habitat, humidity, diet, and care in one place."}
            </p>
          </div>
        </div>
        <div className="relative -mt-8 grid gap-3 px-2 sm:grid-cols-3 md:px-6">
          {[
            ["🌡️", isKo ? "온도" : "Heat", "26~28°C"],
            ["💧", isKo ? "습도" : "Humidity", "60%"],
            ["🥬", isKo ? "식단" : "Diet", isKo ? "급여 루틴" : "Routine"],
          ].map(([emoji, label, value]) => (
            <div key={label} className="rounded-3xl border border-sand bg-white/95 p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl" aria-hidden>{emoji}</span>
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-plum/50">{label}</p>
                  <p className="mt-1 text-lg font-extrabold text-channel-community">{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="species" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-channel-community">Species</p>
            <h2 className="mt-2 text-2xl font-extrabold text-primary md:text-3xl">
              {isKo ? "품종별 가이드" : "Breed guide"}
            </h2>
            <p className="mt-1 text-sm text-plum/65">
              {isKo
                ? "파충류·조류·소동물 가이드를 커뮤니티에서 확인하세요"
                : "Browse reptile, bird, and small-pet guides in the community"}
            </p>
          </div>
          <Link
            href="/community/breeds?animal=other"
            className="text-sm font-extrabold text-channel-community"
          >
            {isKo ? "전체 가이드" : "All guides"} →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {SPECIES.map((item) => (
            <Link
              key={item.key}
              href="/community/breeds?animal=other"
              className="group overflow-hidden rounded-[1.75rem] border border-channel-community/15 bg-white/75 shadow-sm transition hover:-translate-y-1 hover:bg-white"
            >
              <div className="relative h-44 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${IMAGE_BASE}/${item.image}`}
                  alt={isKo ? item.koTitle : item.enTitle}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/85 text-2xl shadow-sm backdrop-blur">
                  {item.emoji}
                </span>
                <span className="absolute right-4 top-4 rounded-full bg-white/85 px-3 py-1 text-channel-community shadow-sm transition group-hover:translate-x-1">→</span>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-extrabold text-primary">{isKo ? item.koTitle : item.enTitle}</h3>
                <p className="mt-2 text-sm text-plum/65">{isKo ? item.koDesc : item.enDesc}</p>
                <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.12em] text-plum/45">
                  {isKo ? item.koMeta : item.enMeta}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-12">
        <div className="rounded-[2rem] border border-sand bg-sand/40 p-6 lg:col-span-5">
          <h2 className="text-2xl font-extrabold text-primary">
            {isKo ? "건강한 생활 환경 체크" : "Healthy habitat checklist"}
          </h2>
          <ul className="mt-6 space-y-4">
            {CHECKLIST.map((item, index) => (
              <li key={item.sub} className="flex gap-3">
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                    index === 0 ? "border-channel-community text-channel-community" : "border-channel-community/25"
                  }`}
                >
                  {index === 0 ? "✓" : ""}
                </span>
                <span>
                  <span className="block font-bold text-primary">{isKo ? item.ko : item.en}</span>
                  <span className="mt-1 block text-[11px] font-extrabold uppercase tracking-[0.16em] text-plum/45">
                    {item.sub}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-7">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-channel-community">Guide</p>
              <h2 className="mt-2 text-2xl font-extrabold text-primary">{isKo ? "추천 가이드" : "Featured guides"}</h2>
            </div>
            {source && (
              <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-plum/50">
                {source === "supabase" ? "DB" : "Static"}
              </span>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {guideCards.map((article, index) => (
              <Link
                key={article.id}
                href={`/reptile/guide/${article.id}`}
                className="group relative min-h-[230px] overflow-hidden rounded-[1.5rem] bg-primary shadow-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${IMAGE_BASE}/${index % 2 === 0 ? "guide-terrarium-humidity.jpg" : "guide-checklist-workspace.jpg"}`}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/45" />
                <div className="relative flex h-full min-h-[230px] flex-col justify-end p-5 text-white">
                  <span className="w-fit rounded-full bg-white/20 px-3 py-1 text-[11px] font-extrabold backdrop-blur">
                    {article.category}
                  </span>
                  <h3 className="mt-3 line-clamp-2 text-lg font-extrabold leading-snug">{article.title}</h3>
                  <p className="mt-2 text-xs font-bold text-white/75">READ GUIDE →</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] bg-gradient-to-br from-channel-community/15 to-gold/20 p-6 text-center">
        <h2 className="text-2xl font-extrabold text-primary">{isKo ? "우리 아이 사주도 같이 볼까요?" : "Want to read your pet's K-Saju too?"}</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-plum/65">
          {isKo
            ? "강아지, 고양이, 다른 동물까지 생일 정보로 오행 밸런스와 성향을 확인할 수 있어요."
            : "Use birth data to check elemental balance and care cues for dogs, cats, and other pets."}
        </p>
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
