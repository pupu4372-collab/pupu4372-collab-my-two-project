import type { PetShowRankingRow } from "@/lib/supabase/types";
import { Link } from "@/i18n/navigation";
import { supabaseImageTransformUrl } from "@/lib/images/supabase-transform";
import { COMMUNITY_SOLID_CARD_CLASS } from "@/components/community/CommunityDetailSurface";

export function petShowRankingHref(row: PetShowRankingRow): string {
  return row.id.startsWith("mock-") ? "/community/pet-show/snapzone" : `/community/pet-show/${row.id}`;
}

export function RankBadge({ rank, isKo, large }: { rank: number; isKo: boolean; large?: boolean }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-primary font-extrabold text-white shadow-sm ${
        large ? "h-10 min-w-10 px-3 text-sm" : "h-8 min-w-8 text-xs"
      }`}
    >
      {isKo ? `${rank}위` : `#${rank}`}
    </span>
  );
}

export function FirstPlaceCard({ row, isKo }: { row: PetShowRankingRow; isKo: boolean }) {
  const rank = row.rank_position ?? 1;
  const imageUrl = row.image_urls?.[0]
    ? supabaseImageTransformUrl(row.image_urls[0], { width: 960, height: 720 })
    : null;

  return (
    <Link
      href={petShowRankingHref(row)}
      className={`${COMMUNITY_SOLID_CARD_CLASS} block overflow-hidden transition hover:-translate-y-0.5 hover:bg-white`}
    >
      <div className="relative min-h-[280px] w-full md:min-h-[360px]">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="h-full min-h-[280px] w-full object-cover md:min-h-[360px]" />
        ) : (
          <div className="flex min-h-[280px] w-full items-center justify-center bg-channel-community/10 text-7xl md:min-h-[360px]">
            🐾
          </div>
        )}
        <span className="absolute left-4 top-4">
          <RankBadge rank={rank} isKo={isKo} large />
        </span>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-extrabold text-primary md:text-2xl">
          {row.title ?? (isKo ? "무제" : "Untitled")}
        </h3>
        <p className="mt-2 text-sm font-bold text-plum/70">
          ♥ {row.like_count} · 💬 {row.comment_count}
        </p>
      </div>
    </Link>
  );
}

export function RunnerUpCard({ row, rank, isKo }: { row: PetShowRankingRow; rank: number; isKo: boolean }) {
  const imageUrl = row.image_urls?.[0]
    ? supabaseImageTransformUrl(row.image_urls[0], { width: 192, height: 192 })
    : null;

  return (
    <li>
      <Link
        href={petShowRankingHref(row)}
        className="flex items-center gap-3 rounded-2xl border border-white/35 bg-white/95 p-3 shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
      >
        <RankBadge rank={rank} isKo={isKo} />
        <div className="h-24 w-24 min-h-[96px] min-w-[96px] shrink-0 overflow-hidden rounded-xl bg-channel-community/10">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-3xl">🐾</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-extrabold text-primary">
            {row.title ?? (isKo ? "무제" : "Untitled")}
          </p>
          <p className="mt-1 text-sm font-bold text-plum/65">
            ♥ {row.like_count} · 💬 {row.comment_count}
          </p>
        </div>
      </Link>
    </li>
  );
}
