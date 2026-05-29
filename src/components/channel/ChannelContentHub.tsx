import type { ChannelContent, PetChannel } from "@/lib/channel/content";
import { AuthRequiredLink } from "@/components/auth/AuthRequiredLink";
import { AdSlot } from "@/components/ads/AdSlot";
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
  }
> = {
  dog: {
    accent: "text-channel-dog",
    softBg: "bg-channel-dog/10",
    border: "border-channel-dog/25",
    button: "bg-channel-dog text-white hover:brightness-105",
    ring: "bg-channel-dog/15",
  },
  cat: {
    accent: "text-channel-cat",
    softBg: "bg-channel-cat/10",
    border: "border-channel-cat/25",
    button: "bg-channel-cat text-white hover:brightness-105",
    ring: "bg-channel-cat/15",
  },
};

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

  return (
    <div className="space-y-8">
      <section
        className={`relative overflow-hidden rounded-[2rem] border ${theme.border} ${theme.softBg} px-5 py-6 md:px-7`}
      >
        <div className={`absolute -right-10 -top-10 h-40 w-40 rounded-full ${theme.ring} blur-3xl`} />
        <Link
          href="/community/pet-show/upload"
          className={`relative z-10 mb-5 inline-flex rounded-full bg-white/75 px-4 py-2 text-sm font-bold shadow-sm transition hover:bg-white md:absolute md:right-6 md:top-6 md:mb-0 ${theme.accent}`}
        >
          {isKo ? "우리아이 자랑하기" : "Join Pet Show"} →
        </Link>
        <div className="relative">
          <p className={`text-sm font-bold ${theme.accent}`}>
            {content.emoji} {content.label} {isKo ? "채널" : "channel"}
          </p>
          <h2 className="mt-2 text-2xl font-extrabold leading-tight text-plum">
            {content.headline}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-plum/70">
            {content.intro}
          </p>
          {source && (
            <p className="mt-2 text-xs text-plum/45">
              {source === "supabase"
                ? isKo
                  ? "DB 콘텐츠 연동"
                  : "Connected DB content"
                : isKo
                  ? "기본 가이드 콘텐츠"
                  : "Default guide content"}
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            {content.heroPoints.map((point) => (
              <span
                key={point}
                className="rounded-full bg-white/70 px-3 py-1.5 text-xs font-semibold text-plum shadow-sm"
              >
                {point}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Link
          href={`/${content.channel}/guide/${heroFeatured.id}`}
          className={`block rounded-[2rem] border-2 ${theme.border} bg-white/75 p-5 transition hover:bg-white md:p-6`}
        >
          <div className="flex flex-wrap items-center gap-2">
            {heroFeatured.badge && (
              <span className={`rounded-full ${theme.softBg} px-3 py-1 text-xs font-bold ${theme.accent}`}>
                {heroFeatured.badge}
              </span>
            )}
            <span className="text-xs font-medium text-plum/45">
              {heroFeatured.category} · {heroFeatured.readTime}
            </span>
          </div>
          <h3 className="mt-3 text-xl font-bold text-plum">{heroFeatured.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-plum/70">
            {heroFeatured.summary}
          </p>
          <Checklist items={heroFeatured.checklist} />
          <p className={`mt-4 text-sm font-semibold ${theme.accent}`}>
            {isKo ? "자세히 읽기" : "Read more"} →
          </p>
        </Link>

        <aside className="rounded-[2rem] border border-white/70 bg-white/60 p-5">
          <h3 className="font-bold text-plum">{isKo ? "오늘의 케어 루틴" : "Today's care routine"}</h3>
          <div className="mt-4 space-y-4">
            {content.routines.map((routine) => (
              <div key={routine.title}>
                <p className={`text-sm font-bold ${theme.accent}`}>{routine.title}</p>
                <ul className="mt-2 space-y-1 text-sm text-plum/70">
                  {routine.items.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-plum">{isKo ? "추천 콘텐츠" : "Recommended reads"}</h3>
            <p className="text-sm text-plum/55">
              {isKo ? "가볍게 읽고 바로 실천할 수 있는 글" : "Quick reads you can try right away"}
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {listArticles.map((article) => (
            <Link
              key={article.id}
              href={`/${content.channel}/guide/${article.id}`}
              className="block rounded-[1.75rem] border border-white/70 bg-white/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
            >
              <p className={`text-xs font-bold ${theme.accent}`}>
                {article.category} · {article.readTime}
              </p>
              <h4 className="mt-2 font-bold leading-snug text-plum">{article.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-plum/65">{article.summary}</p>
              <Checklist items={article.checklist.slice(0, 2)} compact />
            </Link>
          ))}
        </div>
      </section>

      <AdSlot />

      <section className="rounded-[2rem] bg-white/60 p-5">
        <h3 className="font-bold text-plum">{isKo ? "인기 키워드" : "Popular keywords"}</h3>
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
      </section>
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
