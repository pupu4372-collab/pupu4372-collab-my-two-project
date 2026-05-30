"use client";

import { AuthRequiredLink } from "@/components/auth/AuthRequiredLink";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { AdSlot } from "@/components/ads/AdSlot";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { Link } from "@/i18n/navigation";
import { supabaseImageTransformUrl } from "@/lib/images/supabase-transform";
import { signOut } from "@/lib/supabase/auth-client";
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
    <div className="rounded-2xl bg-white/60 p-3">
      <p className="text-xs font-extrabold text-plum/75">
        {emoji} {label}
      </p>
      {rows.length === 0 ? (
        <p className="mt-2 rounded-xl bg-channel-community/10 px-2 py-2 text-[11px] text-plum/45">
          {emptyText}
        </p>
      ) : (
        <ol className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {rows.slice(0, 5).map((row, index) => (
            <li key={row.id} className="w-28 shrink-0">
              <AuthRequiredLink
                href={`/community/pet-show/${row.id}`}
                className="block rounded-xl bg-channel-community/10 p-1.5 transition hover:bg-channel-community/15"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-channel-community text-[10px] font-bold text-white">
                  {row.rank_position ?? index + 1}
                </span>
                <div className="mt-1 h-28 w-full overflow-hidden rounded-xl bg-white/70">
                  {row.image_urls?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={supabaseImageTransformUrl(row.image_urls[0], { width: 224, height: 224 })} alt="" className="h-full w-full object-cover" />
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
      )}
    </div>
  );
}

export function HomeGateway() {
  const locale = useLocale();
  const isKo = locale === "ko";
  const { ready, configured, isAnonymous, email, accessToken, refresh } = useSupabaseSession();
  const [rankingRows, setRankingRows] = useState<WeeklyRankingRows>(emptyRankingRows);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    setSigningOut(true);
    try {
      await signOut();
      await refresh();
      window.location.href = "/";
    } catch {
      setSigningOut(false);
    }
  }

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
      return;
    }

    async function loadProfileName() {
      try {
        const res = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        setDisplayName(data.profile?.display_name ?? null);
      } catch {
        setDisplayName(null);
      }
    }

    void loadProfileName();
  }, [configured, ready, isAnonymous, accessToken]);

  return (
    <main className="min-h-screen overflow-hidden bg-dream-sky">
      <header className="relative z-10 mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5 md:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/75 text-xl shadow-sm" aria-hidden>
            🐾
          </span>
          <span className="text-2xl font-extrabold tracking-tight text-plum">K-Saju Pet</span>
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-2 text-xs font-bold text-plum/75">
          <div className="flex items-center gap-2">
            {configured && ready && !isAnonymous ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="max-w-36 truncate rounded-full bg-white/75 px-4 py-2 text-xs font-extrabold text-plum shadow-sm transition hover:bg-white"
                  title={displayName ?? email ?? (isKo ? "내 계정" : "My account")}
                >
                  {displayName ?? email?.split("@")[0] ?? (isKo ? "내 계정" : "My account")}
                </Link>
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  disabled={signingOut}
                  className="rounded-full bg-channel-saju px-4 py-2 text-xs font-extrabold text-white shadow-sm transition hover:brightness-105 disabled:opacity-60"
                >
                  {signingOut ? (isKo ? "처리중" : "Wait") : isKo ? "로그아웃" : "Log out"}
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-channel-saju px-4 py-2 text-xs font-extrabold text-white shadow-sm transition hover:brightness-105"
              >
                {isKo ? "로그인" : "Log in"}
              </Link>
            )}
            <LanguageSwitcher />
          </div>
        </nav>
      </header>

      <section className="relative mx-auto grid max-w-6xl gap-8 px-5 pb-12 pt-5 md:grid-cols-[1.1fr_0.9fr] md:px-8 md:pb-16 md:pt-10">
        <div className="relative z-10">
          <p className="inline-flex rounded-full bg-white/65 px-4 py-2 text-xs font-bold text-channel-community shadow-sm">
            {isKo ? "반려동물 사주 · 커뮤니티 · 케어 콘텐츠" : "Pet saju · Community · Care content"}
          </p>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight text-plum md:text-6xl">
            {isKo ? "우리 아이의 하루를" : "Make your pet's day"}
            <span className="block text-gradient-hero">
              {isKo ? "조금 더 특별하게" : "a little more magical"}
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-plum/70 md:text-base">
            {isKo
              ? "펫 사주로 성향을 읽고, 우리아이 자랑에서 사진을 나누고, 강아지·고양이 채널에서 오늘 필요한 팁을 바로 찾아보세요."
              : "Read your pet's saju, share photos in Pet Show, and browse dog and cat guides for today's care."}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <AuthRequiredLink
              href="/home"
              className="rounded-full bg-channel-saju px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:brightness-105"
            >
              {isKo ? "펫 사주 바로 시작" : "Start Pet Saju"}
            </AuthRequiredLink>
            <AuthRequiredLink
              href="/community/pet-show/snapzone"
              className="rounded-full bg-white/75 px-5 py-3 text-sm font-extrabold text-channel-community shadow-sm transition hover:bg-white"
            >
              {isKo ? "우리아이 자랑 보기" : "View Pet Show"}
            </AuthRequiredLink>
          </div>
        </div>

        <div className="relative z-10 rounded-[2rem] border border-white/70 bg-white/55 p-5 shadow-sm backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-channel-community">
                {isKo ? "우리아이 자랑" : "Pet Show"}
              </p>
              <h2 className="mt-1 text-xl font-extrabold text-plum">
                {isKo ? "주간 랭킹 Top 5" : "Weekly Top 5"}
              </h2>
              <p className="mt-1 text-xs text-plum/55">
                {isKo ? "최근 7일간 좋아요 순위예요." : "Ranked by likes from the last 7 days."}
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-3">
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
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-8 md:px-8">
        <AdSlot />
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-16 md:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {featureCards.map((card) => (
            <AuthRequiredLink
              key={card.href}
              href={card.href}
              className={`rounded-[1.75rem] border border-white/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:bg-white/75 ${card.className}`}
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
    </main>
  );
}
