"use client";

import { AuthRequiredLink } from "@/components/auth/AuthRequiredLink";
import { AdSlot } from "@/components/ads/AdSlot";
import { AppTopNav } from "@/components/layout/AppTopNav";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { GlassCard, PageContainer, SectionHeader } from "@/components/layout/StitchLayout";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { Link } from "@/i18n/navigation";
import { supabaseImageTransformUrl } from "@/lib/images/supabase-transform";
import type { OwnerDailyFortune } from "@/lib/saju/owner-daily-fortune";
import type { PetShowRankingRow } from "@/lib/supabase/types";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";

const featureCards = [
  {
    href: "/dog" as const,
    emoji: "🐕",
    koTitle: "강아지 채널",
    enTitle: "Dog Channel",
    koDesc: "행동, 산책, 사주 관리 팁을 모았어요.",
    enDesc: "Guides for behavior, walks, saju, and daily care.",
    className: "bg-channel-dog/18 text-channel-dog",
  },
  {
    href: "/cat" as const,
    emoji: "🐈",
    koTitle: "고양이 채널",
    enTitle: "Cat Channel",
    koDesc: "냥이 성향과 생활 케어 콘텐츠를 둘러보세요.",
    enDesc: "Explore cat personality and care content.",
    className: "bg-channel-cat/18 text-channel-cat",
  },
  {
    href: "/community" as const,
    emoji: "🏆",
    koTitle: "커뮤니티",
    enTitle: "Community",
    koDesc: "우리아이 자랑과 게시판을 둘러보세요.",
    enDesc: "Explore Pet Show and community boards.",
    className: "bg-channel-community/18 text-channel-community",
  },
  {
    href: "/profile" as const,
    emoji: "👤",
    koTitle: "프로필",
    enTitle: "Profile",
    koDesc: "내 정보, 펫 정보, 활동 기록을 확인하세요.",
    enDesc: "Check your profile, pets, and activity.",
    className: "bg-channel-saju/15 text-channel-saju",
  },
];

type WeeklyRankingRows = {
  dog: PetShowRankingRow[];
  cat: PetShowRankingRow[];
  other: PetShowRankingRow[];
};

const emptyRankingRows: WeeklyRankingRows = {
  dog: [],
  cat: [],
  other: [],
};

function RankingPreviewList({
  emoji,
  label,
  rows,
  emptyText,
}: {
  emoji: string;
  label: string;
  rows: PetShowRankingRow[];
  emptyText: string;
}) {
  return (
    <div className="max-w-full overflow-hidden rounded-[1.75rem] bg-white/55 p-4 shadow-sm">
      <p className="text-xs font-extrabold text-primary">
        {emoji} {label}
      </p>
      {rows.length === 0 ? (
        <p className="mt-2 rounded-xl bg-channel-community/10 px-2 py-2 text-[11px] text-plum/45">
          {emptyText}
        </p>
      ) : (
        <>
          <p className="mt-1 text-[10px] font-medium text-plum/40">
            {rows.length > 3 ? "옆으로 밀어 5위까지 볼 수 있어요." : "\u00a0"}
          </p>
          <div className="-mx-1 mt-1 max-w-full touch-pan-x overflow-x-auto overscroll-x-contain px-1 pb-2 pr-8 [scrollbar-width:thin]">
            <ol className="flex w-max min-w-full snap-x snap-mandatory gap-2">
              {rows.slice(0, 5).map((row, index) => (
                <li key={row.id} className="w-[34vw] max-w-28 shrink-0 snap-start sm:w-28 md:w-24 lg:w-28">
                  <AuthRequiredLink
                    href={`/community/pet-show/${row.id}`}
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
                  </AuthRequiredLink>
                </li>
              ))}
            </ol>
          </div>
        </>
      )}
    </div>
  );
}

export function HomeGateway() {
  const locale = useLocale();
  const isKo = locale === "ko";
  const { ready, configured, isAnonymous, accessToken } = useSupabaseSession();
  const [rankingRows, setRankingRows] = useState<WeeklyRankingRows>(emptyRankingRows);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [dailyFortune, setDailyFortune] = useState<OwnerDailyFortune | null>(null);

  useEffect(() => {
    async function loadWeeklyRanking() {
      try {
        const res = await fetch("/api/community/pet-show/ranking?period=week&group=species");
        if (!res.ok) return;
        const data = (await res.json()) as { rows?: Partial<WeeklyRankingRows> };
        setRankingRows({
          dog: data.rows?.dog ?? [],
          cat: data.rows?.cat ?? [],
          other: data.rows?.other ?? [],
        });
      } catch {
        setRankingRows(emptyRankingRows);
      }
    }

    void loadWeeklyRanking();
  }, []);

  useEffect(() => {
    if (!configured || !ready || isAnonymous || !accessToken) {
      setDisplayName(null);
      setDailyFortune(null);
      return;
    }

    async function loadMemberHomeData() {
      try {
        const [profileRes, fortuneRes] = await Promise.all([
          fetch("/api/profile", {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          fetch(`/api/fortune/today?locale=${locale}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
        ]);

        const data = await profileRes.json();
        setDisplayName(data.profile?.display_name ?? null);

        if (fortuneRes.ok) {
          const fortuneData = (await fortuneRes.json()) as { fortune?: OwnerDailyFortune | null };
          setDailyFortune(fortuneData.fortune ?? null);
        }
      } catch {
        setDisplayName(null);
        setDailyFortune(null);
      }
    }

    void loadMemberHomeData();
  }, [configured, ready, isAnonymous, accessToken, locale]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-dream-sky">
      <AppTopNav active="home" />
      <PageContainer className="space-y-10">
        <section className="grid items-center gap-8 py-6 md:grid-cols-[1.05fr_0.95fr] md:py-12">
          <div>
            <p className="inline-flex rounded-full bg-white/70 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-channel-community shadow-sm">
              {isKo ? "Pet Saju · Community · Care" : "Pet saju · Community · Care"}
            </p>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-primary md:text-6xl">
              {isKo ? "우리 아이의 특별한" : "Discover your pet's"}
              <span className="block text-gradient-hero">
                {isKo ? "운명과 하루" : "cosmic daily story"}
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-plum/70">
              {isKo
                ? "펫 사주로 성향을 읽고, 우리아이 자랑에서 사진을 나누고, 강아지·고양이 채널에서 오늘 필요한 케어 팁을 바로 찾아보세요."
                : "Read your pet's saju, share photos in Pet Show, and browse dog and cat guides for today's care."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <AuthRequiredLink
                href="/home"
                className="rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-white shadow-sm transition hover:scale-105 hover:brightness-105"
              >
                {isKo ? "펫 사주 바로 시작" : "Start Pet Saju"}
              </AuthRequiredLink>
              <AuthRequiredLink
                href="/community/pet-show/snapzone"
                className="rounded-full bg-white/75 px-6 py-3 text-sm font-extrabold text-channel-community shadow-sm transition hover:scale-105 hover:bg-white"
              >
                {isKo ? "우리아이 자랑 보기" : "View Pet Show"}
              </AuthRequiredLink>
            </div>
          </div>

          <GlassCard className="relative overflow-hidden p-6 md:p-8">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-lavender/60 blur-3xl" />
            <div className="absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-mint/70 blur-3xl" />
            <div className="relative">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-channel-saju">
                    {isKo ? "오늘의 운세" : "Today's fortune"}
                  </p>
                  <h2 className="mt-2 text-2xl font-extrabold text-primary">
                    {displayName ? `${displayName}${isKo ? "님" : ""}` : isKo ? "집사님" : "Pet parent"}{" "}
                    {isKo ? "행운을 빌어요" : "wishing you luck"}
                  </h2>
                </div>
                <span className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-lavender/45 text-3xl shadow-sm">
                  ✨
                </span>
              </div>

              {configured && ready && !isAnonymous && dailyFortune ? (
                <div className="mt-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-extrabold text-primary">
                      {dailyFortune.title}
                    </span>
                    <span className="text-xs font-semibold text-plum/45">
                      {dailyFortune.dayPillar} · {dailyFortune.elementLabel}
                    </span>
                  </div>
                  <p className="mt-4 text-base leading-8 text-plum/72 md:text-lg">{dailyFortune.message}</p>
                  <div className="mt-5 grid grid-cols-3 gap-3 text-center text-xs">
                    <div className="rounded-2xl bg-lavender/45 px-3 py-3">
                      <p className="font-extrabold text-primary">{isKo ? "행운의 수" : "Number"}</p>
                      <p className="mt-1 text-channel-saju">{dailyFortune.luckyNumber}</p>
                    </div>
                    <div className="rounded-2xl bg-mint/55 px-3 py-3">
                      <p className="font-extrabold text-primary">{isKo ? "색상" : "Color"}</p>
                      <p className="mt-1 text-channel-saju">{dailyFortune.luckyColor}</p>
                    </div>
                    <div className="rounded-2xl bg-petal/45 px-3 py-3">
                      <p className="font-extrabold text-primary">{isKo ? "방향" : "Direction"}</p>
                      <p className="mt-1 text-channel-saju">{dailyFortune.luckyDirection}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs font-semibold text-plum/40">{dailyFortune.disclaimer}</p>
                </div>
              ) : (
                <div className="mt-6 rounded-[1.5rem] bg-white/55 p-5">
                  <p className="text-sm leading-7 text-plum/65">
                    {isKo
                      ? "로그인 후 펫·집사 궁합을 저장하면 보호자 생년월일 기반 오늘의 운세가 표시됩니다."
                      : "Log in and save a pet-parent compatibility reading to see your daily fortune."}
                  </p>
                </div>
              )}
            </div>
          </GlassCard>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <SectionHeader
              eyebrow={isKo ? "Pet Show" : "Pet Show"}
              title={isKo ? "이번 주의 우리 아이들" : "Weekly Pet Show Top 5"}
              subtitle={isKo ? "최근 7일간 가장 많은 사랑을 받은 사진을 종별로 보여줘요." : "Top photos by likes from the last 7 days, grouped by species."}
            />
            <div className="mt-5">
              <AuthRequiredLink
                href="/community/pet-show/upload"
                className="inline-flex rounded-full bg-channel-community px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:scale-105 hover:brightness-105"
              >
                {isKo ? "사진 업로드하고 랭킹 참여" : "Upload and join ranking"}
              </AuthRequiredLink>
            </div>
          </div>
          <GlassCard className="min-w-0 p-4 sm:p-5">
            <div className="grid gap-3">
              <RankingPreviewList
                emoji="🐕"
                label={isKo ? "강아지 Top 5" : "Dog Top 5"}
                rows={rankingRows.dog}
                emptyText={isKo ? "이번 주 강아지 사진을 기다려요." : "Waiting for dog photos."}
              />
              <RankingPreviewList
                emoji="🐈"
                label={isKo ? "고양이 Top 5" : "Cat Top 5"}
                rows={rankingRows.cat}
                emptyText={isKo ? "이번 주 고양이 사진을 기다려요." : "Waiting for cat photos."}
              />
              <RankingPreviewList
                emoji="🐾"
                label={isKo ? "다른동물 Top 5" : "Other Animals Top 5"}
                rows={rankingRows.other}
                emptyText={isKo ? "이번 주 다른동물 사진을 기다려요." : "Waiting for other animal photos."}
              />
            </div>
          </GlassCard>
        </section>

        <AdSlot />

        <section>
          <SectionHeader
            eyebrow={isKo ? "Explore" : "Explore"}
            title={isKo ? "어디부터 둘러볼까요?" : "Where should we go first?"}
            subtitle={isKo ? "K-Saju Pet의 핵심 기능을 빠르게 시작하세요." : "Start with the main K-Saju Pet spaces."}
          />
          <div className="mt-6 grid grid-cols-2 gap-4">
            {featureCards.map((card) => (
              <AuthRequiredLink
                key={card.href}
                href={card.href}
                className={`pastel-card p-5 shadow-sm transition hover:-translate-y-1 hover:bg-white/80 ${card.className}`}
              >
                <span className="text-3xl" aria-hidden>
                  {card.emoji}
                </span>
                <h2 className="mt-3 text-base font-extrabold">
                  {isKo ? card.koTitle : card.enTitle}
                </h2>
                <p className="mt-2 text-xs leading-5 text-plum/62">
                  {isKo ? card.koDesc : card.enDesc}
                </p>
              </AuthRequiredLink>
            ))}
          </div>
        </section>
      </PageContainer>
      <MobileBottomNav active="home" />
    </div>
  );
}
