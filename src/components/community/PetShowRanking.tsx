"use client";

import { COMMUNITY_SOLID_SURFACE_CLASS } from "@/components/community/CommunityDetailSurface";
import { FirstPlaceCard, RunnerUpCard, petShowRankingHref } from "@/components/community/PetShowRankingCards";
import type { PetShowRankingRow, RankingPeriod } from "@/lib/supabase/types";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

interface PetShowRankingProps {
  rows: PetShowRankingRow[];
  period: RankingPeriod;
  source: "supabase" | "mock";
}

interface PetShowWeeklySpeciesRankingProps {
  dogRows: PetShowRankingRow[];
  catRows: PetShowRankingRow[];
  otherRows: PetShowRankingRow[];
  period?: Extract<RankingPeriod, "week" | "month">;
  source: "supabase" | "mock";
}

type RankingSpeciesTab = "dog" | "cat" | "reptile";

export function PetShowRanking({ rows, period, source }: PetShowRankingProps) {
  const locale = useLocale();
  const isKo = locale === "ko";
  const label = period === "week" ? (isKo ? "주간 Top 5" : "Weekly Top 5") : isKo ? "실시간 Top 5" : "Realtime Top 5";

  return (
    <section className={`${COMMUNITY_SOLID_SURFACE_CLASS} p-6`}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-channel-community">📸 Pet Show · {label}</h2>
        {source === "mock" && (
          <span className="text-xs text-plum/50">{isKo ? "데모 데이터" : "Demo data"}</span>
        )}
      </div>
      <ol className="mt-4 space-y-3">
        {rows.map((row, i) => (
          <li key={row.id}>
            <Link
              href={petShowRankingHref(row)}
              className="flex items-center gap-4 rounded-2xl bg-channel-community/10 px-4 py-3 transition hover:bg-channel-community/15"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-channel-community text-sm font-bold text-white">
                {row.rank_position ?? i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-plum">
                  {row.title ?? (isKo ? "무제 사진 자랑" : "Untitled pet show")}
                </p>
                <p className="text-xs text-plum/60">
                  ♥ {row.like_count} · 💬 {row.comment_count}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

function SpeciesRankingPanel({
  rows,
  emptyText,
  isKo,
}: {
  rows: PetShowRankingRow[];
  emptyText: string;
  isKo: boolean;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-channel-community/25 bg-white px-6 py-10 text-center">
        <p className="text-sm leading-relaxed text-plum/65">{emptyText}</p>
        <Link
          href="/community/pet-show/upload"
          className="mt-4 inline-flex rounded-full bg-channel-community px-5 py-2.5 text-sm font-extrabold text-white"
        >
          {isKo ? "사진 올리기" : "Upload photo"}
        </Link>
      </div>
    );
  }

  const [first, ...rest] = rows.slice(0, 5);

  return (
    <div className="space-y-4">
      <FirstPlaceCard row={first} isKo={isKo} />
      {rest.length > 0 && (
        <ol className="space-y-3">
          {rest.map((row, index) => (
            <RunnerUpCard key={row.id} row={row} rank={row.rank_position ?? index + 2} isKo={isKo} />
          ))}
        </ol>
      )}
    </div>
  );
}

export function PetShowWeeklySpeciesRanking({
  dogRows,
  catRows,
  otherRows,
  period = "week",
  source,
}: PetShowWeeklySpeciesRankingProps) {
  const locale = useLocale();
  const isKo = locale === "ko";
  const t = useTranslations("petshow");
  const tSpecies = useTranslations("petSpecies");
  const [activeSpecies, setActiveSpecies] = useState<RankingSpeciesTab>("dog");
  const isMonthly = period === "month";

  const rowsBySpecies: Record<RankingSpeciesTab, PetShowRankingRow[]> = {
    dog: dogRows,
    cat: catRows,
    reptile: otherRows,
  };

  const emptyBySpecies: Record<RankingSpeciesTab, string> = {
    dog: isMonthly ? t("rankingEmptyDogMonth") : t("rankingEmptyDogWeek"),
    cat: isMonthly ? t("rankingEmptyCatMonth") : t("rankingEmptyCatWeek"),
    reptile: isMonthly ? t("rankingEmptyReptileMonth") : t("rankingEmptyReptileWeek"),
  };

  const speciesTabs: Array<{ id: RankingSpeciesTab; label: string }> = [
    { id: "dog", label: tSpecies("dog") },
    { id: "cat", label: tSpecies("cat") },
    { id: "reptile", label: tSpecies("reptile") },
  ];

  return (
    <section className={`${COMMUNITY_SOLID_SURFACE_CLASS} p-5 md:p-6`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-channel-community md:text-xl">
            {isMonthly ? t("rankingTitleMonth") : t("rankingTitleWeek")}
          </h2>
          <p className="mt-1 text-xs text-plum/55 md:text-sm">
            {isMonthly ? t("rankingDescMonth") : t("rankingDescWeek")}
          </p>
        </div>
        {source === "mock" && (
          <span className="rounded-full border border-white/35 bg-white px-3 py-1 text-xs text-plum/60">
            {isKo ? "데모 데이터" : "Demo data"}
          </span>
        )}
      </div>

      <nav
        className="mt-5 inline-flex w-full max-w-full gap-1 overflow-x-auto rounded-full border border-white/35 bg-white/95 p-1.5 shadow-sm hide-scrollbar sm:w-auto"
        aria-label={t("rankingSpeciesNav")}
      >
        {speciesTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSpecies(tab.id)}
            className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-extrabold transition ${
              activeSpecies === tab.id
                ? "bg-channel-community text-white shadow-sm"
                : "text-plum/60 hover:bg-channel-community/10 hover:text-channel-community"
            }`}
            aria-current={activeSpecies === tab.id ? "page" : undefined}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="mt-5">
        <SpeciesRankingPanel
          rows={rowsBySpecies[activeSpecies]}
          emptyText={emptyBySpecies[activeSpecies]}
          isKo={isKo}
        />
      </div>
    </section>
  );
}
