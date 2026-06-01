import { ChannelShell } from "@/components/layout/ChannelShell";
import { AuthRequiredLink } from "@/components/auth/AuthRequiredLink";
import { GlassCard, SectionHeader } from "@/components/layout/StitchLayout";
import { Link } from "@/i18n/navigation";
import { fetchWeeklyPetShowSpeciesRankings } from "@/lib/community/ranking";
import { supabaseImageTransformUrl } from "@/lib/images/supabase-transform";
import { getTranslations } from "next-intl/server";

interface CommunityHubPageProps {
  params: Promise<{ locale: string }>;
}

export default async function CommunityHubPage({ params }: CommunityHubPageProps) {
  const { locale } = await params;
  const isKo = locale !== "en";
  const t = await getTranslations("community");
  const weeklyRanking = await fetchWeeklyPetShowSpeciesRankings();

  const sections = [
    { href: "/community/qa" as const, emoji: "❓", title: t("qa"), desc: t("qaDesc") },
    {
      href: "/community/free" as const,
      emoji: "💬",
      title: isKo ? "자유게시판" : "Free Board",
      desc: isKo ? "댕냥 집사들의 일상 수다와 자유글" : "Casual posts and everyday pet-parent stories",
    },
    {
      href: "/community/tips" as const,
      emoji: "🍯",
      title: isKo ? "꿀팁게시판" : "Tips Board",
      desc: isKo ? "행동·건강·사주 연계 관리 노하우" : "Behavior, health, and care know-how",
    },
    {
      href: "/community/experience" as const,
      emoji: "🧬",
      title: isKo ? "품종별 경험담" : "Breed Experiences",
      desc: isKo
        ? "견종·묘종·다른동물 종별 실제 생활 후기"
        : "Real stories by dog breed, cat breed, and other animal species",
    },
  ];

  return (
    <ChannelShell
      theme="community"
      title={t("hubTitle")}
      subtitle={t("hubSubtitle")}
      backHref="/"
      backLabel={isKo ? "← 홈" : "← Home"}
      rightLinks={[
        { href: "/", label: isKo ? "홈" : "Home" },
        { href: "/saju", label: isKo ? "펫 사주" : "Pet Saju" },
      ]}
    >
      <div className="space-y-10">
        <nav className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar" aria-label={isKo ? "커뮤니티 카테고리" : "Community categories"}>
          <Link href="/community" className="whitespace-nowrap rounded-full bg-channel-community px-6 py-3 text-sm font-extrabold text-white shadow-md">
            {isKo ? "전체" : "All"}
          </Link>
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="whitespace-nowrap rounded-full bg-white/65 px-6 py-3 text-sm font-extrabold text-primary shadow-sm transition hover:bg-mint"
            >
              {section.title}
            </Link>
          ))}
        </nav>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <GlassCard className="relative overflow-hidden p-0">
            <Link href="/community/pet-show/ranking" className="block">
              <div className="relative h-64 overflow-hidden bg-channel-community/10 md:h-80">
                {weeklyRanking.rows.dog[0]?.image_urls?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={supabaseImageTransformUrl(weeklyRanking.rows.dog[0].image_urls[0], { width: 960, height: 540 })}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-7xl">🏆</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-extrabold text-primary">PET SHOW</span>
                  <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">
                    {isKo ? "우리아이 자랑 주간 랭킹 Top 5" : "Pet Show Weekly Top 5"}
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-white/85">
                    {isKo
                      ? "최근 7일간 좋아요 순위로 강아지, 고양이, 다른동물 Top 5를 보여줘요."
                      : "Dog, cat, and other animal Top 5 by likes from the last 7 days."}
                  </p>
                </div>
              </div>
            </Link>
          </GlassCard>

          <GlassCard>
            <SectionHeader
              eyebrow={isKo ? "Ranking" : "Ranking"}
              title={isKo ? "종별 Top 5" : "Top 5 by species"}
              subtitle={isKo ? "사진을 올리면 주간 랭킹에 참여할 수 있어요." : "Upload a photo to join the weekly ranking."}
            />
            <div className="mt-5 grid gap-3">
              {([
                ["🐕", isKo ? "강아지" : "Dog", weeklyRanking.rows.dog],
                ["🐈", isKo ? "고양이" : "Cat", weeklyRanking.rows.cat],
                ["🐾", isKo ? "다른동물" : "Other Animals", weeklyRanking.rows.other],
              ] as const).map(([emoji, label, rows]) => (
                <div key={label} className="rounded-2xl bg-white/55 px-4 py-3">
                  <p className="text-xs font-extrabold text-primary">
                    {emoji} {label} Top 5
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {rows.slice(0, 5).map((row) => (
                        <span key={row.id} className="flex h-11 w-11 overflow-hidden rounded-full border-2 border-white bg-channel-community/10">
                          {row.image_urls?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={supabaseImageTransformUrl(row.image_urls[0], { width: 88, height: 88 })} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-lg">{emoji}</span>
                          )}
                        </span>
                      ))}
                    </div>
                    {rows.length === 0 && <span className="text-xs text-plum/45">{isKo ? "첫 사진을 기다려요" : "Waiting for photos"}</span>}
                  </div>
                </div>
              ))}
            </div>
            <AuthRequiredLink
              href="/community/pet-show/upload"
              className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-channel-community px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:scale-105 hover:brightness-105"
            >
              📷 {isKo ? "사진 업로드하고 주간 랭킹 참여하기" : "Upload a photo and join the weekly ranking"}
            </AuthRequiredLink>
          </GlassCard>
        </section>

        <section>
          <SectionHeader
            eyebrow={isKo ? "Boards" : "Boards"}
            title={isKo ? "집사님들과 나누는 이야기" : "Stories from pet parents"}
            subtitle={isKo ? "Q&A, 꿀팁, 자유게시판, 품종별 경험담을 목적에 맞게 둘러보세요." : "Explore Q&A, tips, free board, and breed experiences."}
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="pastel-card block px-5 py-6 shadow-sm transition hover:-translate-y-1 hover:bg-white/80"
              >
                <span className="text-3xl" aria-hidden>
                  {section.emoji}
                </span>
                <h2 className="mt-3 text-lg font-extrabold text-primary">{section.title}</h2>
                <p className="mt-2 text-sm leading-6 text-plum/65">{section.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <p className="text-center text-sm text-plum/55">
          <Link href="/saju" className="underline hover:text-plum">
            {t("toSaju")}
          </Link>
        </p>
      </div>
    </ChannelShell>
  );
}
