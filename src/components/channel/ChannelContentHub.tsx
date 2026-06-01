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
    heroImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDJDPbSMlr5IIjOl0yaF_C7rC-6pYCX_qKCueZPr0oKXmPsCp66gbHHphpbrKJv11qEuxZd8knSHr_fpS35qeqI7VccCxVcUDCctNs1Te_FpnXHQND-pglFnptTfWS8vsymNXU3zUGRZxFXrG1POr_cHZUYThYGhFEe7EU2gvuG2AQ4CtqKLjIuaw71fpfia5kYYLGicfdVYgLo_pYYQz1NNiK167W0ehdNr05jMStXxHFDu6bjHmkNg4UVP_HO960AjPuZl-Q_kdTR",
    heroLabel: "CHANNEL DOG",
    elementTitle: { ko: "사주 맞춤 훈련", en: "Saju-based training" },
    breedImages: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBFpb5atiGeMJWOzs-ehgEWdYF1puSZpVsL_fc-wLFZr3jwFRpelxvIHcaoqDIvoc2lxYApjoQSBeehMLkL3C8xbDXUuZObSpNenUNuC45UofDSedSGIQ3IOgVEESzYgJuvWkLDSYjLoB_HX4TQ4TcwVh61zXNAC-rMCu-JsUQXKYLgW8_K5gkKMmGBrQAQ7JmJbxoJ3BDnOd212F6JhGM7FZJnz8yQMpI7WBIaKQZNc6jFdEImiLBQltW1urFeG6FyjHJAQSYMccIy",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAhW81a0mVSt5m_qiPgnVpHtlqWueZzzQ5TvAMfGlhD9xnOq0CXQURF1ODYf_-6Oxzaw17Dvuf7AXuEoqB-4lCrH6SuoSqwOUamxlV6azgX-d5w0xGjLegwWgxTZj8es3lR_OFBdzYzW4HSrWjt0d2fQ1uC5Vg2o6OQ8YQIMrcIg6dwqo58CthVc8UM7FADtrOl4odxFuLhSvwWiVL6X--vjvDwF6DWaNL6ac3hMDLNCWcUu12yyQRXEu219ds6x4rRHeAxS-JgwcLI",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCs7Y10TtNO99hi1RhGmCqxqQ_iJqrxHRvhTBwQmOeWqA7G4AdFSdGT9cUiBAe1-SlYDL52ldwe57u9U-QjsbctTwBa99FamPsI1iPoi7mcVNhWdXaEw2VnAT4o9b1fqQkvqFlMH9g44pTEdp6D7l0w4llop6dBz9Bda71O9ypZ6Sx0PhY-7kYTv9G2vGkilwYCccxE8xaZ4qx6G0IXyNcfIGtoCJ-ULm5gxoBeoBjJ1W8xtxMbffBHGWG9dV7P8ZO2i7YG9AU875yE",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB5SwIjbjlpAmwYGx-siP_hI0kLbtPFgSaYhMjUl3IrHwrXmg5yGGvyocPH_dpBp6hyauv6NeI0Qa5EKSBA06sX7jAu0zV9LEJHFnYdTy7BQ9ZywOUurW-uXFYwHK2SOUsjIe-UqMxwr2Te-LPV-SWcIVn7yuoqGdwnfFFs9XDRsytcRMCQBI2UNyuHdyLDHljW9XGEjKFrAw9k0bhQ4xUc933l7LUUzhGdqvPlbSLuIpLjbSSKn9mera40ebBeo2MuI1Z8ROdEF9S0",
    ],
  },
  cat: {
    accent: "text-channel-cat",
    softBg: "bg-channel-cat/10",
    border: "border-channel-cat/25",
    button: "bg-channel-cat text-white hover:brightness-105",
    ring: "bg-channel-cat/15",
    heroImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCft3vuFZTk5g4dUamMX271kizRiOvBQ0iBVMJkxotHv63DHhnDSAAF6_hBs1m_PBcNpftT4CbetRV-3P5oyLdsVTCxSawupFR2gQcjI70-t0pKJDvP3DjTcM0mMhX0JnMxebi7ty2cZhs27lzJbAolzV2BhWrVDPOW_oeDkqgj1hMPYfiWgnhgDZMuuoJLuX6izbYxkCGwZiQIf8NWmLHnv5tW6TMH-O23cZcErTKKM3NhwcS4rwFChJGEQ4Rt50jGGE0NZSFAqQH4",
    heroLabel: "CHANNEL CAT",
    elementTitle: { ko: "사주 맞춤 케어", en: "Saju-based care" },
    breedImages: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBMR1uL5pSLE7MbSSJkyf-Et6u19PPoF-jTDxOMncDHt4K56S3UFTkbw36jZHa0_gLCB3fgpOqit-1mbU69unqAbp03AstDqMG3s81Cy6K2rplNl9EndwO9pEj98kZVgROEnK0ljOCPuYOOgkpv9rti-6X6LIHSe__S47Qop8vQ25vtU_3DsBFVWltkzL-bgFc6ZKoF_CEK2--gE97OOsmRmFTKaz4CJL3E7whbF48tpW_bYp2VM3F1vjGWeeeR56jflMIDjfm1b6Xm",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBCcsJtFVTMNYVzMqhZ-GQOSERDCW_6RtqAhV_AL0HNU4pWMV2YEawB-UYhyrpQQiX6_4YpmX6-z4heYIlTCg1Ou9A2EnH2lNI5MfBmPNWYdrHWIb4BJ4iyWpteD9O3n3HzVCizj7jM8PGB432T-3tOiSyDUrDhqu9gEGVeqsqUyWIDKiOx6kBJbEK6s1Juo5Go3SRxQYt2JmO1lNkMlsY7SXN0VnW-tmudDu_W6Uzo1mS0eaqqii2pD3esT6dLJEzO_5F3VNCXqQ9n",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuChLO7HJgOgcahJJpWbnR_AbUlwmHOCO4qRm4ih6oCDKOcdPabduXbz8oIfh9fP1KsHO7WQeHKOW8wNh1uXYRLpMqPqZ-ADb_pNtC6ylyrAvFk_vw7py0EfQCZZf9VvJmReIXPpoCd-i-Cp5xDpOxI1jMEK0QtjtsA_xgjZ9WVDCAbRsvzmV4P1x2-mgCyiP_ac1qSDwRf-6iFcvWWUgRHbLfpO6B3gfdxskqyp8Ct5zVko5mULkoJ5Yy3JWoYS-nLEltulBbWPdswU",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBalhp-6f2YKc_IfdLR1B0ruZTHBtm9u51j3TdEnoKs6JervpuNsHIZPi4_XLNy0hemWljGbkZJqYdRFTnDiBaJU_urECHd3cZAxk4yk_jHbeRArenq4q7GkmPFHT9vZ3xPcKFI6JjwxtDxb_oXuteLkcGylqz02cRc15M2pJLkt0YEpLDqhgLlN306HSFdOnSyZnswzR-5DUCxTt2ClCUX-fP08n_UTzgpkL5eX7C5cfx_F-WvQLixn9PbvtdO0V7Kd_WhWWvQdUQC",
    ],
  },
};

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

  return (
    <div className="space-y-12">
      <section className="relative min-h-[360px] overflow-hidden rounded-[2.5rem] shadow-xl md:min-h-[500px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={theme.heroImage} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
        <div className="relative z-10 flex min-h-[360px] flex-col justify-end p-7 text-white md:min-h-[500px] md:p-12">
          <span className={`mb-4 w-fit rounded-full px-4 py-1 text-xs font-extrabold tracking-[0.18em] text-white ${content.channel === "dog" ? "bg-channel-dog" : "bg-channel-cat"}`}>
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
          eyebrow={content.channel === "dog" ? "Training" : "Care"}
          title={isKo ? theme.elementTitle.ko : theme.elementTitle.en}
          subtitle={isKo ? "오행의 기운에 맞춰 우리 아이의 성향과 돌봄 루틴을 가볍게 살펴보세요." : "Browse care patterns inspired by the five K-Saju elements."}
          action={
            <AuthRequiredLink
              href="/saju/compatibility"
              className={`inline-flex rounded-full px-5 py-3 text-sm font-extrabold shadow-sm transition hover:scale-105 ${theme.button}`}
            >
              {isKo ? "펫과 집사 궁합 보기" : "Check pet-parent bond"}
            </AuthRequiredLink>
          }
        />
        <div className="mt-6 grid gap-4 md:grid-cols-12">
          {ELEMENT_CARDS.map((card, index) => (
            <article
              key={card.key}
              className={`pastel-card p-6 ${index === 0 ? "md:col-span-6" : index === 1 ? "md:col-span-6" : "md:col-span-4"}`}
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
          eyebrow={isKo ? "Breed Guide" : "Breed Guide"}
          title={isKo ? "품종별 가이드" : "Breed guide"}
          subtitle={isKo ? `${content.label} 집사가 자주 찾는 핵심 정보를 카드로 정리했어요.` : `Essential ${content.label.toLowerCase()} info in quick cards.`}
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
