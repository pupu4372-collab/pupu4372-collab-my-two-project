"use client";

import { AuthRequiredLink } from "@/components/auth/AuthRequiredLink";
import { AdSlot } from "@/components/ads/AdSlot";
import { AppTopNav } from "@/components/layout/AppTopNav";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { GlassCard, PageContainer, SectionHeader } from "@/components/layout/StitchLayout";
import { OnboardingRoadmap } from "@/components/onboarding/OnboardingRoadmap";
import { PetDailyFortunePanel, type FortuneTodayState } from "@/components/home/PetDailyFortunePanel";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { supabaseImageTransformUrl } from "@/lib/images/supabase-transform";
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
    href: "/reptile" as const,
    emoji: "🦎",
    koTitle: "렙타일(다른동물)",
    enTitle: "Reptile & Other",
    koDesc: "파충류, 앵무새(조류), 소동물 케어 가이드를 모았어요.",
    enDesc: "Guides for reptiles, birds, and small pets.",
    className: "bg-channel-community/18 text-channel-community",
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
  isNight = false,
}: {
  emoji: string;
  label: string;
  rows: PetShowRankingRow[];
  emptyText: string;
  isNight?: boolean;
}) {
  return (
    <div
      className={`max-w-full overflow-hidden rounded-[1.75rem] p-4 shadow-sm ${
        isNight ? "border border-white/30 bg-white/32 backdrop-blur-sm" : "bg-white/55"
      }`}
    >
      <p className={`text-xs font-extrabold ${isNight ? "text-primary" : "text-primary"}`}>
        {emoji} {label}
      </p>
      {rows.length === 0 ? (
        <p
          className={`mt-2 rounded-xl px-2 py-2 text-[11px] ${
            isNight ? "bg-white/45 font-bold text-plum" : "bg-channel-community/10 text-plum/45"
          }`}
        >
          {emptyText}
        </p>
      ) : (
        <>
          <p className={`mt-1 text-[10px] font-extrabold ${isNight ? "text-plum/80" : "text-plum/40"}`}>
            {rows.length > 3 ? "옆으로 밀어 5위까지 볼 수 있어요." : "\u00a0"}
          </p>
          <div className="-mx-1 mt-1 max-w-full touch-pan-x overflow-x-auto overscroll-x-contain px-1 pb-2 pr-8 [scrollbar-width:thin]">
            <ol className="flex w-max min-w-full snap-x snap-mandatory gap-2">
              {rows.slice(0, 5).map((row, index) => (
                <li key={row.id} className="w-[34vw] max-w-28 shrink-0 snap-start sm:w-28 md:w-24 lg:w-28">
                  <AuthRequiredLink
                    href={
                      row.id.startsWith("mock-")
                        ? "/community/pet-show/snapzone"
                        : `/community/pet-show/${row.id}`
                    }
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
                    <p className="text-[10px] font-bold text-plum/70">♥ {row.like_count}</p>
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

interface HomeGatewayProps {
  previewTheme?: "night";
}

export function HomeGateway({ previewTheme }: HomeGatewayProps) {
  const locale = useLocale();
  const isKo = locale === "ko";
  const { ready, configured, isAnonymous, accessToken } = useSupabaseSession();
  const [rankingRows, setRankingRows] = useState<WeeklyRankingRows>(emptyRankingRows);
  const [rankingSource, setRankingSource] = useState<"supabase" | "mock" | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [fortuneData, setFortuneData] = useState<FortuneTodayState | null>(null);

  useEffect(() => {
    async function loadWeeklyRanking() {
      try {
        const res = await fetch("/api/community/pet-show/ranking?period=week&group=species");
        if (!res.ok) return;
        const data = (await res.json()) as {
          rows?: Partial<WeeklyRankingRows>;
          source?: "supabase" | "mock";
        };
        setRankingRows({
          dog: data.rows?.dog ?? [],
          cat: data.rows?.cat ?? [],
          other: data.rows?.other ?? [],
        });
        setRankingSource(data.source ?? null);
      } catch {
        setRankingRows(emptyRankingRows);
        setRankingSource(null);
      }
    }

    void loadWeeklyRanking();
  }, []);

  useEffect(() => {
    if (!ready) return;

    async function loadFortune() {
      try {
        const params = new URLSearchParams({ locale });
        const headers: HeadersInit = {};
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`;
        }

        const fortuneRes = await fetch(`/api/fortune/today?${params.toString()}`, { headers });
        if (!fortuneRes.ok) return;

        const data = (await fortuneRes.json()) as FortuneTodayState;
        setFortuneData(data);
      } catch {
        setFortuneData(null);
      }
    }

    void loadFortune();
  }, [ready, accessToken, locale]);

  async function handleSelectPet(petId: string) {
    try {
      const params = new URLSearchParams({ locale, petId });
      const headers: HeadersInit = {};
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }
      const fortuneRes = await fetch(`/api/fortune/today?${params.toString()}`, { headers });
      if (!fortuneRes.ok) return;
      const data = (await fortuneRes.json()) as FortuneTodayState;
      setFortuneData(data);
    } catch {
      // keep previous fortune visible
    }
  }

  useEffect(() => {
    if (!configured || !ready || isAnonymous || !accessToken) {
      setDisplayName(null);
      return;
    }

    async function loadProfile() {
      try {
        const profileRes = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await profileRes.json();
        setDisplayName(data.profile?.display_name ?? null);
      } catch {
        setDisplayName(null);
      }
    }

    void loadProfile();
  }, [configured, ready, isAnonymous, accessToken]);

  const isNight = previewTheme === "night";
  const nightGlassCard = isNight
    ? "border border-white/20 bg-white/12 shadow-[0_8px_32px_rgba(0,0,0,0.18)] backdrop-blur-md"
    : "";
  const nightFortuneCard = isNight
    ? "!border-0 !bg-[#260d35] shadow-[0_18px_48px_rgba(26,10,38,0.32)]"
    : "";
  const nightFortunePanel = isNight
    ? "relative max-w-[470px] border border-white/30 bg-[#351445] text-white shadow-[0_10px_26px_rgba(18,10,29,0.16)]"
    : "bg-white/55";

  return (
    <div className={isNight ? "min-h-screen overflow-x-hidden bg-transparent" : "min-h-screen overflow-x-hidden bg-dream-sky"}>
      <AppTopNav active="home" />
      <PageContainer className="space-y-10">
        <section className="grid items-center gap-8 py-6 md:grid-cols-[1.05fr_0.95fr] md:py-12">
          <div>
            <p
              className={`inline-flex rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] shadow-sm ${
                isNight
                  ? "border border-white/25 bg-white/12 text-[#ffd7ff]"
                  : "bg-white/70 text-channel-community"
              }`}
            >
              {isKo ? "Pet Saju · Community · Care" : "Pet saju · Community · Care"}
            </p>
            <h1 className={`mt-6 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl ${isNight ? "text-white drop-shadow-[0_0_20px_rgba(245,217,255,0.28)]" : "text-primary"}`}>
              {isKo ? "우리 아이의 특별한" : "Discover your pet's"}
              <span className={isNight ? "block text-[#ffd7ff]" : "block text-gradient-hero"}>
                {isKo ? "운명과 하루" : "cosmic daily story"}
              </span>
            </h1>
            {isKo && (
              <p className={`mt-4 text-lg font-extrabold ${isNight ? "text-[#ffd7ff]" : "text-channel-saju"}`}>
                2026 병오년, 우리 아이는 어떤 한 해를 보낼까?
              </p>
            )}
            <p className={`mt-5 max-w-xl text-base leading-8 ${isNight ? "font-semibold text-white/85 drop-shadow-[0_1px_12px_rgba(0,0,0,0.2)]" : "text-plum/70"}`}>
              {isKo
                ? "펫 사주로 성향을 읽고, 우리아이 자랑에서 사진을 나누고, 강아지·고양이·렙타일(다른동물) 채널에서 케어 팁을 찾아보세요."
                : "Read your pet's saju, share photos in Pet Show, and browse dog, cat, and reptile care guides."}
            </p>
          </div>

          <GlassCard className={`relative overflow-hidden p-6 md:p-8 ${nightFortuneCard}`}>
            {!isNight && (
              <>
                <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-lavender/60 blur-3xl" />
                <div className="absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-mint/70 blur-3xl" />
              </>
            )}
            <div className="relative">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p
                    className={`text-xs font-extrabold uppercase tracking-[0.18em] ${
                      isNight ? "text-white/85" : "text-channel-saju"
                    }`}
                  >
                    {isKo ? "오늘의 운세" : "Today's fortune"}
                  </p>
                  <h2 className={`mt-2 text-2xl font-extrabold ${isNight ? "text-white" : "text-primary"}`}>
                    {displayName ? `${displayName}${isKo ? "님" : ""}` : isKo ? "집사님" : "Pet parent"}{" "}
                    {isKo ? "행운을 빌어요" : "wishing you luck"}
                  </h2>
                </div>
                <span
                  className={`h-16 w-16 items-center justify-center rounded-full border-4 text-3xl shadow-sm ${
                    isNight ? "hidden" : "flex border-white bg-lavender/45"
                  }`}
                >
                  ✨
                </span>
              </div>

              {fortuneData ? (
                <PetDailyFortunePanel
                  data={fortuneData}
                  isKo={isKo}
                  isNight={isNight}
                  onSelectPet={handleSelectPet}
                />
              ) : (
                <div className={`mt-6 rounded-[1.5rem] p-5 ${nightFortunePanel}`}>
                  <p className={`text-sm font-semibold ${isNight ? "text-white/75" : "text-plum/60"}`}>
                    {isKo ? "오늘의 운세를 불러오는 중이에요…" : "Loading today's fortune…"}
                  </p>
                </div>
              )}
            </div>
          </GlassCard>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            {isNight ? (
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#22c55e] drop-shadow-[0_0_12px_rgba(34,197,94,0.28)]">
                  {isKo ? "Pet Show" : "Pet Show"}
                </p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white drop-shadow-[0_0_18px_rgba(245,217,255,0.2)] md:text-4xl">
                  {isKo ? "이번 주의 우리 아이들" : "Weekly Pet Show Top 5"}
                </h2>
                <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/80 md:text-base">
                  {isKo ? "최근 7일간 가장 많은 사랑을 받은 사진을 종별로 보여줘요." : "Top photos by likes from the last 7 days, grouped by species."}
                </p>
              </div>
            ) : (
              <SectionHeader
                eyebrow={isKo ? "Pet Show" : "Pet Show"}
                title={isKo ? "이번 주의 우리 아이들" : "Weekly Pet Show Top 5"}
                subtitle={isKo ? "최근 7일간 가장 많은 사랑을 받은 사진을 종별로 보여줘요." : "Top photos by likes from the last 7 days, grouped by species."}
              />
            )}
            {rankingSource === "mock" && (
              <p className={`mt-2 text-xs font-semibold ${isNight ? "text-white/60" : "text-plum/45"}`}>
                {isKo ? "데모 데이터 (DB 연결 또는 이번 주 게시물 없음)" : "Demo data (no DB or no posts this week)"}
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              <AuthRequiredLink
                href="/community/pet-show/upload"
                className={`inline-flex rounded-full px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:scale-105 hover:brightness-105 ${
                  isNight
                    ? "bg-[#22c55e] shadow-[0_0_22px_rgba(34,197,94,0.25)]"
                    : "bg-channel-community"
                }`}
              >
                {isKo ? "사진 업로드하고 랭킹 참여" : "Upload and join ranking"}
              </AuthRequiredLink>
              <AuthRequiredLink
                href="/community/pet-show/snapzone"
                className={`inline-flex rounded-full px-5 py-3 text-sm font-extrabold shadow-sm transition hover:scale-105 ${
                  isNight
                    ? "border border-white/30 bg-white/15 text-white backdrop-blur-sm hover:bg-white/25"
                    : "bg-white/75 text-channel-community hover:bg-white"
                }`}
              >
                {isKo ? "우리아이 자랑 보기" : "View Pet Show"}
              </AuthRequiredLink>
              <AuthRequiredLink
                href="/community/pet-show/fails"
                className={`inline-flex rounded-full px-5 py-3 text-sm font-extrabold shadow-sm transition hover:scale-105 ${
                  isNight
                    ? "bg-[#ffd7ff] text-primary hover:brightness-105"
                    : "bg-[#ffd7ff] text-primary hover:brightness-105"
                }`}
              >
                {isKo ? "웃긴 실패 사진" : "Funny fails"}
              </AuthRequiredLink>
            </div>
          </div>
          <GlassCard className={`min-w-0 p-4 sm:p-5 ${nightGlassCard}`}>
            <div className="grid gap-3">
              <RankingPreviewList
                emoji="🐕"
                label={isKo ? "강아지 Top 5" : "Dog Top 5"}
                rows={rankingRows.dog}
                emptyText={isKo ? "이번 주 강아지 사진을 기다려요." : "Waiting for dog photos."}
                isNight={isNight}
              />
              <RankingPreviewList
                emoji="🐈"
                label={isKo ? "고양이 Top 5" : "Cat Top 5"}
                rows={rankingRows.cat}
                emptyText={isKo ? "이번 주 고양이 사진을 기다려요." : "Waiting for cat photos."}
                isNight={isNight}
              />
              <RankingPreviewList
                emoji="🐾"
                label={isKo ? "렙타일(다른동물) Top 5" : "Other Animals Top 5"}
                rows={rankingRows.other}
                emptyText={isKo ? "이번 주 렙타일(다른동물) 사진을 기다려요." : "Waiting for other animal photos."}
                isNight={isNight}
              />
            </div>
          </GlassCard>
        </section>

        <AdSlot />

        <section>
          {previewTheme === "night" ? (
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#ffd7ff]">Explore</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white md:text-4xl">
                {isKo ? "어디부터 둘러볼까요?" : "Where should we go first?"}
              </h2>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/80 md:text-base">
                {isKo ? "K-Saju Pet의 핵심 기능을 빠르게 시작하세요." : "Start with the main K-Saju Pet spaces."}
              </p>
            </div>
          ) : (
            <SectionHeader
              eyebrow={isKo ? "Explore" : "Explore"}
              title={isKo ? "어디부터 둘러볼까요?" : "Where should we go first?"}
              subtitle={isKo ? "K-Saju Pet의 핵심 기능을 빠르게 시작하세요." : "Start with the main K-Saju Pet spaces."}
            />
          )}
          <div className="mt-6 grid grid-cols-2 gap-4">
            {featureCards.map((card) => (
              <AuthRequiredLink
                key={card.href}
                href={card.href}
                className={`p-5 shadow-sm transition hover:-translate-y-1 ${
                  isNight
                    ? "rounded-2xl border border-white/25 bg-white/80 shadow-[0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur-sm hover:bg-white/90"
                    : `pastel-card hover:bg-white/80 ${card.className}`
                }`}
              >
                <span className="text-3xl" aria-hidden>
                  {card.emoji}
                </span>
                <h2
                  className={`mt-3 text-base font-extrabold ${
                    isNight ? "text-primary" : ""
                  }`}
                >
                  {isKo ? card.koTitle : card.enTitle}
                </h2>
                <p
                  className={`mt-2 text-xs leading-5 ${
                    isNight ? "text-plum/70" : "text-plum/62"
                  }`}
                >
                  {isKo ? card.koDesc : card.enDesc}
                </p>
              </AuthRequiredLink>
            ))}
          </div>
        </section>

        <section>
          <OnboardingRoadmap locale={locale} showActions={false} compact />
        </section>
      </PageContainer>
      <MobileBottomNav active="home" />
    </div>
  );
}
