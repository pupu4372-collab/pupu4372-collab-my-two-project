import { ChannelShell } from "@/components/layout/ChannelShell";
import { AuthRequiredLink } from "@/components/auth/AuthRequiredLink";
import { CommunityPinnedNotices } from "@/components/community/CommunityPinnedNotices";
import { COMMUNITY_SOLID_CARD_CLASS } from "@/components/community/CommunityDetailSurface";
import { GlassCard, SectionHeader } from "@/components/layout/StitchLayout";
import { Link } from "@/i18n/navigation";
import { mergeReptileChannelRankingRows } from "@/lib/pets/species";
import { fetchWeeklyPetShowSpeciesRankings } from "@/lib/community/ranking";
import { fetchPinnedNotices } from "@/lib/notices/queries";
import { getTranslations } from "next-intl/server";
import { supabaseImageTransformUrl } from "@/lib/images/supabase-transform";

interface CommunityHubPageProps {
  params: Promise<{ locale: string }>;
}

export default async function CommunityHubPage({ params }: CommunityHubPageProps) {
  const { locale } = await params;
  const isKo = locale !== "en";
  const t = await getTranslations("community");
  const [weeklyRanking, pinnedNotices] = await Promise.all([
    fetchWeeklyPetShowSpeciesRankings(),
    fetchPinnedNotices(locale, 3),
  ]);
  const tPetShow = await getTranslations({ locale, namespace: "petshow" });
  const tSpecies = await getTranslations({ locale, namespace: "petSpecies" });
  const reptileTop5Rows = mergeReptileChannelRankingRows(
    weeklyRanking.rows.reptile,
    weeklyRanking.rows.other,
  );

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
        ? "견종·묘종·렙타일(다른동물) 종별 실제 생활 후기"
        : "Real stories by dog breed, cat breed, and other animal species",
    },
    {
      href: "/community/breeds" as const,
      emoji: "📖",
      title: isKo ? "품종별 가이드" : "Breed Guides",
      desc: isKo
        ? "견종·묘종 성격·건강·사주 힌트 레퍼런스 허브"
        : "Breed reference hub: personality, health, and saju hints",
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
        <CommunityPinnedNotices notices={pinnedNotices} isKo={isKo} />

        <nav className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar" aria-label={isKo ? "커뮤니티 카테고리" : "Community categories"}>
          <Link href="/community" className="whitespace-nowrap rounded-full bg-channel-community px-6 py-3 text-sm font-extrabold text-white shadow-md">
            {isKo ? "전체" : "All"}
          </Link>
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="whitespace-nowrap rounded-full border border-white/35 bg-white/95 px-6 py-3 text-sm font-extrabold text-primary shadow-sm transition hover:bg-white"
            >
              {section.title}
            </Link>
          ))}
        </nav>

        <section className="grid items-stretch gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <GlassCard className="relative min-h-[560px] overflow-hidden bg-cream p-0">
            <Link href="/community/pet-show/ranking" className="block h-full">
              <div className="relative h-full min-h-[560px] overflow-hidden bg-channel-community/10">
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
                      ? "최근 7일간 좋아요 순위로 강아지, 고양이, 렙타일 Top 5를 보여줘요."
                      : "Dog, cat, and reptile Top 5 by likes from the last 7 days."}
                  </p>
                </div>
              </div>
            </Link>
          </GlassCard>

          <GlassCard variant="solid" className="flex min-h-[560px] min-w-0 flex-col p-4 sm:p-5">
            <SectionHeader
              eyebrow={isKo ? "Ranking" : "Ranking"}
              title={isKo ? "종별 Top 5" : "Top 5 by species"}
              subtitle={isKo ? "사진을 올리면 주간 랭킹에 참여할 수 있어요." : "Upload a photo to join the weekly ranking."}
            />
            <div className="mt-5 grid flex-1 gap-3 overflow-y-auto pr-1">
              {([
                ["🐕", isKo ? "강아지" : "Dog", weeklyRanking.rows.dog],
                ["🐈", isKo ? "고양이" : "Cat", weeklyRanking.rows.cat],
                ["🦎", tSpecies("reptile"), reptileTop5Rows],
              ] as const).map(([emoji, label, rows]) => (
                <div key={label} className="max-w-full overflow-hidden rounded-[1.75rem] border border-white/35 bg-sand/40 p-4 shadow-sm">
                  <p className="text-xs font-extrabold text-primary">
                    {emoji} {label} Top 5
                  </p>
                  {rows.length === 0 ? (
                    <p className="mt-2 rounded-xl bg-white px-2 py-2 text-[11px] text-plum/65">
                      {isKo ? "첫 사진을 기다려요" : "Waiting for photos"}
                    </p>
                  ) : (
                    <>
                      <p className="mt-1 text-[10px] font-medium text-plum/50">
                        {rows.length > 3
                          ? isKo
                            ? "옆으로 밀어 5위까지 볼 수 있어요."
                            : "Swipe sideways to see up to 5th place."
                          : "\u00a0"}
                      </p>
                      <div className="-mx-1 mt-1 max-w-full touch-pan-x overflow-x-auto overscroll-x-contain px-1 pb-2 pr-8 [scrollbar-width:thin]">
                        <ol className="flex w-max min-w-full snap-x snap-mandatory gap-2">
                          {rows.slice(0, 5).map((row, index) => (
                            <li key={row.id} className="w-[34vw] max-w-28 shrink-0 snap-start sm:w-28 md:w-24 lg:w-28">
                              <Link
                                href={row.id.startsWith("mock-") ? "/community/pet-show/snapzone" : `/community/pet-show/${row.id}`}
                                className="block rounded-2xl bg-channel-community/10 p-2 transition hover:-translate-y-0.5 hover:bg-channel-community/15"
                              >
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-channel-community text-[10px] font-bold text-white">
                                  {row.rank_position ?? index + 1}
                                </span>
                                <div className="mt-1 aspect-square w-full overflow-hidden rounded-xl bg-white/70">
                                  {row.image_urls?.[0] ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={supabaseImageTransformUrl(row.image_urls[0], { width: 192, height: 192 })} alt="" className="h-full w-full object-cover" />
                                  ) : (
                                    <span className="flex h-full w-full items-center justify-center text-2xl">{emoji}</span>
                                  )}
                                </div>
                                <p className="mt-1 truncate text-[11px] font-bold text-plum">{row.title ?? "Pet Show"}</p>
                                <p className="text-[10px] text-plum/45">♥ {row.like_count}</p>
                              </Link>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </>
                  )}
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
            eyebrow={isKo ? "Channels" : "Channels"}
            title={isKo ? "종별 케어 채널" : "Species care channels"}
            subtitle={
              isKo
                ? "강아지·고양이·렙타일(다른동물) 채널에서 환경·식단·건강 가이드를 모았어요."
                : "Browse dog, cat, and reptile & other pet care guides."
            }
            onDark
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {([
              {
                href: "/dog" as const,
                emoji: "🐕",
                title: isKo ? "강아지 채널" : "Dog Channel",
                desc: isKo ? "견종·산책·식단·훈련 케어 팁" : "Breed, walks, food, and training tips",
                className: "bg-channel-dog/12 text-channel-dog",
              },
              {
                href: "/cat" as const,
                emoji: "🐈",
                title: isKo ? "고양이 채널" : "Cat Channel",
                desc: isKo ? "묘종·화장실·사냥놀이·건강 가이드" : "Breed, litter, play, and health guides",
                className: "bg-channel-cat/12 text-channel-cat",
              },
              {
                href: "/reptile" as const,
                emoji: "🦎",
                title: tSpecies("reptile"),
                desc: isKo ? "파충류·앵무새(조류)·소동물 케어" : "Reptiles, birds, and small pets",
                className: "bg-channel-community/12 text-channel-community",
              },
            ] as const).map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className={`block ${COMMUNITY_SOLID_CARD_CLASS} px-5 py-6 transition hover:-translate-y-1 hover:bg-white`}
              >
                <span className="text-3xl" aria-hidden>
                  {card.emoji}
                </span>
                <h2 className="mt-3 text-lg font-extrabold text-primary">{card.title}</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-plum/80">{card.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader
            eyebrow={isKo ? "Boards" : "Boards"}
            title={isKo ? "집사님들과 나누는 이야기" : "Stories from pet parents"}
            subtitle={isKo ? "Q&A, 꿀팁, 자유게시판, 품종별 경험담을 목적에 맞게 둘러보세요." : "Explore Q&A, tips, free board, and breed experiences."}
            onDark
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className={`block ${COMMUNITY_SOLID_CARD_CLASS} px-5 py-6 transition hover:-translate-y-1 hover:bg-white`}
              >
                <span className="text-3xl" aria-hidden>
                  {section.emoji}
                </span>
                <h2 className="mt-3 text-lg font-extrabold text-primary">{section.title}</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-plum/80">{section.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <p className="text-center">
          <Link
            href="/saju"
            className="inline-flex rounded-full border border-white/35 bg-white px-5 py-2.5 text-sm font-extrabold text-primary shadow-sm transition hover:brightness-105"
          >
            {t("toSaju")}
          </Link>
        </p>
      </div>
    </ChannelShell>
  );
}
