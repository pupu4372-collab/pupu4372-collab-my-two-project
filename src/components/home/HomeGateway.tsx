"use client";

import { AuthRequiredLink } from "@/components/auth/AuthRequiredLink";
import { AppTopNav } from "@/components/layout/AppTopNav";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { GlassCard, PageContainer, SectionHeader } from "@/components/layout/StitchLayout";
import { PetDailyFortunePanel, type FortuneTodayState } from "@/components/home/PetDailyFortunePanel";
import { PetCareReminderBanner } from "@/components/home/PetCareReminderBanner";
import { JigFortuneOrnateCorners } from "@/components/home/jig-fortune/JigFortuneDecor";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { supabaseImageTransformUrl } from "@/lib/images/supabase-transform";
import type { PetShowRankingRow } from "@/lib/supabase/types";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

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
  const t = useTranslations("home");
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

  return (
    <div className="min-h-screen overflow-x-hidden bg-transparent">
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
              {t("heroEyebrow")}
            </p>
            <h1 className={`mt-6 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl ${isNight ? "text-white drop-shadow-[0_0_20px_rgba(245,217,255,0.28)]" : "text-primary"}`}>
              {t("heroTitleLine1")}
              <span className={isNight ? "block text-[#ffd7ff]" : "block text-gradient-hero"}>
                {t("heroTitleLine2")}
              </span>
            </h1>
            <p className={`mt-5 max-w-xl text-base leading-8 ${isNight ? "font-semibold text-white/85 drop-shadow-[0_1px_12px_rgba(0,0,0,0.2)]" : "text-plum/70"}`}>
              {t("heroSubtitle")}
            </p>
            <ul
              className={`mt-6 space-y-2.5 text-sm leading-relaxed md:text-[15px] ${
                isNight ? "font-semibold text-white/88" : "font-medium text-plum/80"
              }`}
            >
              {[t("heroFeature1"), t("heroFeature2"), t("heroFeature3")].map((line) => (
                <li key={line} className="flex gap-2.5">
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                      isNight
                        ? "bg-[#ffd7ff]/20 text-[#ffd7ff]"
                        : "bg-channel-saju/12 text-channel-saju"
                    }`}
                    aria-hidden
                  >
                    ✓
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <AuthRequiredLink
                href="/profile"
                className={`inline-flex rounded-full px-6 py-3.5 text-sm font-extrabold text-white shadow-sm transition hover:scale-[1.02] hover:brightness-105 ${
                  isNight
                    ? "bg-channel-saju shadow-[0_0_24px_rgba(139,92,246,0.35)]"
                    : "bg-channel-saju"
                }`}
              >
                {t("heroCta")}
              </AuthRequiredLink>
            </div>
          </div>

          <div className="pet-fortune-jigwanjae relative overflow-visible p-4 shadow-lg md:p-5">
            <div className="jig-fortune-body">
              <JigFortuneOrnateCorners />

              <div className="relative z-[2] mb-2 text-center">
                <p className="human-premium-label-caps text-[var(--jig-seal)] tracking-widest">
                  {isKo ? "지관재 (知觀齋)" : "Jigwanjae (知觀齋)"}
                </p>
                <h2 className="human-premium-serif mt-1.5 text-2xl font-bold text-[var(--jig-ink)] md:text-3xl">
                  {isKo ? "오늘의 운세" : "Today's fortune"}
                </h2>
                <div className="mx-auto my-2 h-0.5 w-10 bg-[var(--jig-ink)]/20" />
                <p className="text-xs text-[var(--jig-muted)] md:text-sm">
                  {displayName ? `${displayName}${isKo ? "님" : ""}` : isKo ? "집사님" : "Pet parent"}{" "}
                  {isKo ? "행운을 빌어요" : "wishing you luck"}
                </p>
              </div>

              {fortuneData?.careReminders && (
                <PetCareReminderBanner careReminders={fortuneData.careReminders} isKo={isKo} />
              )}

              {fortuneData ? (
                <div className="relative z-[2]">
                  <PetDailyFortunePanel
                    data={fortuneData}
                    isKo={isKo}
                    variant="jigwanjae"
                    onSelectPet={handleSelectPet}
                  />
                </div>
              ) : (
                <div className="jig-fortune-content-box relative z-[2] text-center">
                  <p className="text-sm font-semibold text-[var(--jig-muted)]">
                    {isKo ? "오늘의 운세를 불러오는 중이에요…" : "Loading today's fortune…"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section>
          {isNight ? (
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#22c55e] drop-shadow-[0_0_12px_rgba(34,197,94,0.28)]">
                🏅
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white drop-shadow-[0_0_18px_rgba(245,217,255,0.2)] md:text-4xl">
                {isKo ? "챌린지" : "Challenge"}
              </h2>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/80 md:text-base">
                {isKo
                  ? "미션 인증하고 다른 집사들과 함께해요"
                  : "Complete missions with other pet parents"}
              </p>
            </div>
          ) : (
            <SectionHeader
              eyebrow="🏅"
              title={isKo ? "챌린지" : "Challenge"}
              subtitle={
                isKo
                  ? "미션 인증하고 다른 집사들과 함께해요"
                  : "Complete missions with other pet parents"
              }
            />
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <AuthRequiredLink
              href="/community/challenge"
              className={`inline-flex rounded-full px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:scale-105 hover:brightness-105 ${
                isNight
                  ? "bg-[#22c55e] shadow-[0_0_22px_rgba(34,197,94,0.25)]"
                  : "bg-channel-community"
              }`}
            >
              {isKo ? "챌린지 참여하기" : "Join Challenge"}
            </AuthRequiredLink>
          </div>
        </section>

        <section className="grid items-start gap-6 md:grid-cols-[1.05fr_0.95fr]">
          <div className="min-w-0 space-y-6">
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
              <p className={`text-xs font-semibold ${isNight ? "text-white/60" : "text-plum/45"}`}>
                {isKo ? "데모 데이터 (DB 연결 또는 이번 주 게시물 없음)" : "Demo data (no DB or no posts this week)"}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
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
          </div>
          <div className="hidden min-h-0 md:block" aria-hidden />
        </section>
      </PageContainer>
      <MobileBottomNav active="home" />
    </div>
  );
}
