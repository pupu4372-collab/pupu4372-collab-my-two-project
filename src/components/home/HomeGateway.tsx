"use client";

import { AuthRequiredLink } from "@/components/auth/AuthRequiredLink";
import { AppTopNav } from "@/components/layout/AppTopNav";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { GlassCard, PageContainer, SectionHeader } from "@/components/layout/StitchLayout";
import { HomeNoticeBanner } from "@/components/home/HomeNoticeBanner";
import { HomePetFortuneCard } from "@/components/home/pet-fortune/HomePetFortuneCard";
import { type FortuneTodayState } from "@/components/home/PetDailyFortunePanel";
import { SajuHubPremiumBanner } from "@/components/k-saju/SajuHubPremiumSidebar";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { supabaseImageTransformUrl } from "@/lib/images/supabase-transform";
import { mergeReptileChannelRankingRows } from "@/lib/pets/species";
import {
  EMPTY_RANKING_FALLBACK_FLAGS,
  petShowFallbackWeekLabel,
  type PetShowRankingFallbackFlags,
} from "@/lib/community/ranking";
import type { Notice, PetShowRankingRow } from "@/lib/supabase/types";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type WeeklyRankingRows = {
  dog: PetShowRankingRow[];
  cat: PetShowRankingRow[];
  reptile: PetShowRankingRow[];
  other: PetShowRankingRow[];
};

const emptyRankingRows: WeeklyRankingRows = {
  dog: [],
  cat: [],
  reptile: [],
  other: [],
};

function RankingPreviewList({
  emoji,
  label,
  rows,
  emptyText,
  isNight = false,
  isKo = true,
  isLastWeekFallback = false,
  lastWeekLabel,
}: {
  emoji: string;
  label: string;
  rows: PetShowRankingRow[];
  emptyText: string;
  isNight?: boolean;
  isKo?: boolean;
  isLastWeekFallback?: boolean;
  lastWeekLabel?: string;
}) {
  return (
    <div
      className={`max-w-full overflow-hidden p-5 shadow-sm ${
        isNight
          ? "rounded-[1.75rem] border border-white/30 bg-white/32 backdrop-blur-sm"
          : "rounded-[4px] border-2 border-[#2a2520] bg-[#f8f1e4]"
      }`}
    >
      <p className={`text-xs font-extrabold ${isNight ? "text-primary" : "text-plum"}`}>
        {emoji} {label}
        {isLastWeekFallback && lastWeekLabel ? (
          <span className="ml-2 rounded-full bg-[#ffd7ff]/55 px-2 py-0.5 text-[10px] font-extrabold text-primary">
            {lastWeekLabel}
          </span>
        ) : null}
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
            {rows.length > 3
              ? isKo
                ? "옆으로 밀어 5위까지 볼 수 있어요."
                : "Swipe sideways to see up to 5th place."
              : "\u00a0"}
          </p>
          <div className="-mx-1 mt-1 max-w-full touch-pan-x overflow-x-auto overscroll-x-contain px-1 pb-2 pr-8 [scrollbar-width:thin]">
            <ol className="flex w-max min-w-full snap-x snap-mandatory gap-2">
              {rows.slice(0, 5).map((row, index) => (
                <li key={row.id} className="w-[38vw] max-w-32 shrink-0 snap-start sm:w-32 md:w-28 lg:w-32">
                  <Link
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
                  </Link>
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
  homeBannerNotice?: Pick<Notice, "id" | "title"> | null;
}

export function HomeGateway({ previewTheme, homeBannerNotice = null }: HomeGatewayProps) {
  const locale = useLocale();
  const t = useTranslations("home");
  const tPetShow = useTranslations("petshow");
  const isKo = locale === "ko";
  const { ready, accessToken } = useSupabaseSession();
  const [rankingRows, setRankingRows] = useState<WeeklyRankingRows>(emptyRankingRows);
  const [funnyRankingRows, setFunnyRankingRows] = useState<PetShowRankingRow[]>([]);
  const [rankingFallback, setRankingFallback] = useState<PetShowRankingFallbackFlags>(
    EMPTY_RANKING_FALLBACK_FLAGS,
  );
  const [rankingSource, setRankingSource] = useState<"supabase" | "mock" | null>(null);
  const [fortuneData, setFortuneData] = useState<FortuneTodayState | null>(null);
  const [fortuneLoading, setFortuneLoading] = useState(true);

  useEffect(() => {
    async function loadWeeklyRanking() {
      try {
        const res = await fetch("/api/community/pet-show/ranking?period=week&group=species");
        if (!res.ok) return;
        const data = (await res.json()) as {
          rows?: Partial<WeeklyRankingRows>;
          funny?: PetShowRankingRow[];
          source?: "supabase" | "mock";
          lastWeekFallback?: PetShowRankingFallbackFlags;
        };
        setRankingRows({
          dog: data.rows?.dog ?? [],
          cat: data.rows?.cat ?? [],
          reptile: data.rows?.reptile ?? [],
          other: data.rows?.other ?? [],
        });
        setFunnyRankingRows(data.funny ?? []);
        setRankingFallback(data.lastWeekFallback ?? EMPTY_RANKING_FALLBACK_FLAGS);
        setRankingSource(data.source ?? null);
      } catch {
        setRankingRows(emptyRankingRows);
        setFunnyRankingRows([]);
        setRankingFallback(EMPTY_RANKING_FALLBACK_FLAGS);
        setRankingSource(null);
      }
    }

    void loadWeeklyRanking();
  }, []);

  useEffect(() => {
    if (!ready) return;

    async function loadFortune() {
      setFortuneLoading(true);
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
      } finally {
        setFortuneLoading(false);
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

  const isNight = previewTheme === "night";
  /** Home lower-section CTAs only — not in global palette */
  const homeGoldCtaClass =
    "inline-flex rounded-full bg-[#e6c15e] px-5 py-3 text-sm font-extrabold text-[#3a2c08] shadow-sm transition hover:scale-105 hover:brightness-105";

  const fortunePanel = fortuneLoading ? (
    <div className="space-y-4">
      <SajuHubPremiumBanner />
      <div className="pet-fortune-guest-shell flex min-h-[280px] items-center justify-center">
        <p className="text-sm font-semibold text-stone-600">
          {isKo ? "오늘의 케어 가이드를 불러오는 중이에요…" : "Loading today's care guide…"}
        </p>
      </div>
    </div>
  ) : (
    <div className="space-y-4">
      <SajuHubPremiumBanner />
      <HomePetFortuneCard
        fortuneData={fortuneData}
        careReminders={fortuneData?.careReminders}
        onSelectPet={handleSelectPet}
        onPetAdded={handleSelectPet}
      />
    </div>
  );

  /* Lower section: light surfaces + ink/plum text (hero stays night) */
  const petShowSection = (
    <div className="space-y-6 rounded-[2rem] bg-cream px-4 py-6 sm:px-5 sm:py-7 md:px-6">
      <SectionHeader
        eyebrow={isKo ? "Pet Show" : "Pet Show"}
        title={isKo ? "이번 주의 우리 아이들" : "Weekly Pet Show Top 5"}
        subtitle={
          isKo
            ? "최근 7일간 가장 많은 사랑을 받은 사진을 종별로 보여줘요."
            : "Top photos by likes from the last 7 days, grouped by species."
        }
      />
      {rankingSource === "mock" && (
        <p className="text-xs font-semibold text-plum/45">
          {isKo
            ? "데모 데이터 (DB 연결 또는 이번 주 게시물 없음)"
            : "Demo data (no DB or no posts this week)"}
        </p>
      )}
      <div className="flex flex-col items-start gap-2">
        <Link href="/community/pet-show/snapzone" className={homeGoldCtaClass}>
          {isKo ? "우리아이 자랑 보기" : "View Pet Show"}
        </Link>
        <AuthRequiredLink
          href="/community/pet-show/upload"
          className="text-sm font-semibold text-channel-community/80 underline-offset-2 transition hover:text-channel-community hover:underline"
        >
          {isKo ? "사진 업로드하고 랭킹 참여" : "Upload and join ranking"}
        </AuthRequiredLink>
      </div>
      <GlassCard className="min-w-0 border border-plum/20 bg-[#ffffff] p-5 shadow-sm sm:p-6">
        <div className="grid gap-4">
          <RankingPreviewList
            emoji="🐕"
            label={isKo ? "강아지 Top 5" : "Dog Top 5"}
            rows={rankingRows.dog}
            emptyText={isKo ? "이번 주 강아지 사진을 기다려요." : "Waiting for dog photos."}
            isLastWeekFallback={rankingFallback.dog > 0}
            lastWeekLabel={petShowFallbackWeekLabel(rankingFallback.dog, tPetShow)}
            isNight={false}
            isKo={isKo}
          />
          <RankingPreviewList
            emoji="🐈"
            label={isKo ? "고양이 Top 5" : "Cat Top 5"}
            rows={rankingRows.cat}
            emptyText={isKo ? "이번 주 고양이 사진을 기다려요." : "Waiting for cat photos."}
            isLastWeekFallback={rankingFallback.cat > 0}
            lastWeekLabel={petShowFallbackWeekLabel(rankingFallback.cat, tPetShow)}
            isNight={false}
            isKo={isKo}
          />
          <RankingPreviewList
            emoji="🦎"
            label={tPetShow("reptileTop5")}
            rows={mergeReptileChannelRankingRows(rankingRows.reptile, rankingRows.other)}
            emptyText={tPetShow("reptileTop5Empty")}
            isLastWeekFallback={rankingFallback.reptile > 0}
            lastWeekLabel={petShowFallbackWeekLabel(rankingFallback.reptile, tPetShow)}
            isNight={false}
            isKo={isKo}
          />
          <RankingPreviewList
            emoji="😂"
            label={isKo ? "웃긴 사진 Top 5" : "Funny Top 5"}
            rows={funnyRankingRows}
            emptyText={isKo ? "이번 주 웃긴 사진을 기다려요." : "Waiting for funny photos this week."}
            isLastWeekFallback={rankingFallback.funny > 0}
            lastWeekLabel={petShowFallbackWeekLabel(rankingFallback.funny, tPetShow)}
            isNight={false}
            isKo={isKo}
          />
        </div>
      </GlassCard>
    </div>
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-transparent">
      <AppTopNav active="home" />
      {homeBannerNotice ? <HomeNoticeBanner notice={homeBannerNotice} isKo={isKo} /> : null}
      <PageContainer className="space-y-10 md:space-y-14">
        <section className="py-4 md:py-8">
          <div className="md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:grid-rows-[auto_auto_1fr] md:items-start md:gap-x-12 md:gap-y-8 lg:gap-x-16">
            <div className="min-w-0 md:col-start-1 md:row-start-1">
              <p
                className={`inline-flex rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] shadow-sm ${
                  isNight
                    ? "border border-white/25 bg-white/12 text-[#ffd7ff]"
                    : "bg-white/70 text-channel-community"
                }`}
              >
                {t("heroEyebrow")}
              </p>
              <h1 className={`mt-4 text-4xl font-extrabold leading-tight tracking-tight md:mt-5 md:text-6xl ${isNight ? "text-white drop-shadow-[0_0_20px_rgba(245,217,255,0.28)]" : "text-primary"}`}>
                {t("heroTitleLine1")}
                <span className={isNight ? "block text-[#ffd7ff]" : "block text-gradient-hero"}>
                  {t("heroTitleLine2")}
                </span>
              </h1>
              <p className="mt-4 max-w-xl text-base font-semibold leading-8 text-[#faf5ff] drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)] md:mt-5">
                {t("heroSubtitle")}
              </p>
              <ul className="mt-5 space-y-2.5 text-sm font-semibold leading-relaxed text-[#f5f0ff] md:mt-6 md:text-[15px]">
                {[t("heroFeature1"), t("heroFeature2"), t("heroFeature3")].map((line) => (
                  <li key={line} className="flex gap-2.5">
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ffd7ff]/25 text-[11px] font-bold text-[#ffd7ff]"
                      aria-hidden
                    >
                      ✓
                    </span>
                    <span className="text-[#faf5ff] drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]">{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 min-w-0 md:col-start-1 md:row-start-2 md:mt-0">
              <Link
                href="/saju"
                className={`inline-flex rounded-full px-6 py-3.5 text-sm font-extrabold text-white shadow-sm transition hover:scale-[1.02] hover:brightness-105 ${
                  isNight
                    ? "bg-channel-saju shadow-[0_0_24px_rgba(139,92,246,0.35)]"
                    : "bg-channel-saju"
                }`}
              >
                {t("heroCta")}
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 items-start gap-6 sm:grid-cols-2 md:contents md:gap-0">
              <div className="min-w-0 space-y-8 md:col-start-1 md:row-start-3">
                {petShowSection}
              </div>

              <div className="relative min-w-0 overflow-visible md:col-start-2 md:row-start-1 md:row-span-3 md:pl-2 md:sticky md:top-24 lg:pl-4">
                <div className="rounded-[2rem] border border-plum/15 bg-white p-4 shadow-sm sm:p-5">
                  {fortunePanel}
                </div>
              </div>
            </div>
          </div>
        </section>

        {isKo ? (
          <section
            className="rounded-[2rem] border border-plum/10 bg-cream px-5 py-8 md:px-8 md:py-10"
            aria-labelledby="what-is-pet-saju-heading"
          >
            <h2
              id="what-is-pet-saju-heading"
              className="text-xl font-extrabold text-primary md:text-2xl"
            >
              {t("whatIsPetSajuTitle")}
            </h2>
            <div className="mt-4 space-y-4 text-sm font-semibold leading-7 text-plum/80 md:text-[15px] md:leading-8">
              <p>{t("whatIsPetSajuP1")}</p>
              <p>{t("whatIsPetSajuP2")}</p>
              <p>{t("whatIsPetSajuP3")}</p>
            </div>
          </section>
        ) : null}
      </PageContainer>
      <MobileBottomNav active="home" />
    </div>
  );
}
