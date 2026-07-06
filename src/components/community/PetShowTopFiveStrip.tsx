"use client";

import { COMMUNITY_SOLID_CARD_CLASS, COMMUNITY_SOLID_SURFACE_CLASS } from "@/components/community/CommunityDetailSurface";
import { Link } from "@/i18n/navigation";
import { supabaseImageTransformUrl } from "@/lib/images/supabase-transform";
import type { PetShowRankingRow } from "@/lib/supabase/types";
import { useTranslations } from "next-intl";

function rankingHref(row: PetShowRankingRow): string {
  return row.id.startsWith("mock-") ? "/community/pet-show/snapzone" : `/community/pet-show/${row.id}`;
}

function speciesLabel(row: PetShowRankingRow, labels: { dog: string; cat: string; reptile: string; otherFriends: string }): string | null {
  if (row.pet_species === "dog") return labels.dog;
  if (row.pet_species === "cat") return labels.cat;
  if (row.pet_species === "reptile") return labels.reptile;
  if (row.pet_species === "other") return labels.otherFriends;
  return null;
}

function RankingStripCard({
  row,
  rank,
  isKo,
  labels,
}: {
  row: PetShowRankingRow;
  rank: number;
  isKo: boolean;
  labels: { dog: string; cat: string; reptile: string; otherFriends: string };
}) {
  const href = rankingHref(row);
  const imageUrl = row.image_urls?.[0]
    ? supabaseImageTransformUrl(row.image_urls[0], { width: 720, height: 900 })
    : null;
  const species = speciesLabel(row, labels);

  return (
    <article
      className={`${COMMUNITY_SOLID_CARD_CLASS} flex w-[min(72vw,280px)] shrink-0 snap-start flex-col overflow-hidden sm:w-[260px] md:w-[280px]`}
    >
      <Link href={href} className="block min-w-0 flex-1">
        <div className="relative aspect-[4/5] overflow-hidden bg-channel-community/10">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=""
              className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl">🐾</div>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-extrabold text-white shadow-sm">
            {isKo ? `${rank}위` : `#${rank}`}
          </span>
        </div>
        <div className="p-4 pb-2">
          <h3 className="truncate text-lg font-extrabold text-primary">
            {row.title ?? (isKo ? "무제" : "Untitled")}
          </h3>
          {species ? <p className="mt-1 truncate text-sm text-plum/55">{species}</p> : null}
        </div>
      </Link>
      <p className="flex items-center gap-1 px-4 pb-4 text-sm font-bold text-plum/70 select-none">
        <span className="text-hwa-red" aria-hidden>
          ♥
        </span>
        <span>{row.like_count}</span>
      </p>
    </article>
  );
}

/** Horizontal Top 5 strip — padded scroll so the last card is not clipped. */
export function PetShowTopFiveStrip({
  rows,
  isKo,
  emptyText,
}: {
  rows: PetShowRankingRow[];
  isKo: boolean;
  emptyText: string;
}) {
  const tSpecies = useTranslations("petSpecies");
  const speciesLabels = {
    dog: tSpecies("dog"),
    cat: tSpecies("cat"),
    reptile: tSpecies("reptile"),
    otherFriends: tSpecies("otherFriends"),
  };

  const sorted = [...rows]
    .sort((a, b) => {
      if (b.like_count !== a.like_count) return b.like_count - a.like_count;
      return String(a.created_at ?? "").localeCompare(String(b.created_at ?? ""));
    })
    .slice(0, 5);

  if (sorted.length === 0) {
    return (
      <div className={`${COMMUNITY_SOLID_SURFACE_CLASS} mt-6 w-full p-8 text-center text-sm text-plum/70`}>
        {emptyText}
      </div>
    );
  }

  return (
    <div className="-mx-5 mt-6 touch-pan-x overscroll-x-contain md:mx-0">
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 pt-1 pr-10 hide-scrollbar scroll-pr-10 md:px-0 md:pr-12 md:scroll-pr-12">
        {sorted.map((row, index) => (
          <RankingStripCard key={row.id} row={row} rank={index + 1} isKo={isKo} labels={speciesLabels} />
        ))}
        <div className="w-3 shrink-0 snap-none md:w-6" aria-hidden />
      </div>
    </div>
  );
}
