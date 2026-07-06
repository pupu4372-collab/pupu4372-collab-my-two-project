import { PetShowWeeklySpeciesRanking } from "@/components/community/PetShowRanking";
import { PetShowShell } from "@/components/community/PetShowShell";
import { Link } from "@/i18n/navigation";
import { mergeReptileChannelRankingRows } from "@/lib/pets/species";
import { fetchPetShowSpeciesRankings } from "@/lib/community/ranking";
import type { RankingPeriod } from "@/lib/supabase/types";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ period?: string | string[] }>;
}

function getRankingPeriod(value?: string | string[]): Extract<RankingPeriod, "week" | "month"> {
  const period = Array.isArray(value) ? value[0] : value;
  return period === "month" ? "month" : "week";
}

export default async function PetShowRankingPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const query = await searchParams;
  const isKo = locale !== "en";
  const period = getRankingPeriod(query?.period);
  const isMonthly = period === "month";
  const ranking = await fetchPetShowSpeciesRankings(period);

  return (
    <PetShowShell
      theme="community"
      title={isMonthly ? (isKo ? "우리아이 자랑 월간 랭킹" : "Pet Show Monthly Ranking") : isKo ? "우리아이 자랑 주간 랭킹" : "Pet Show Weekly Ranking"}
      subtitle={
        isMonthly
          ? isKo
            ? "최근 30일간 좋아요 순위예요."
            : "Ranked by likes from the last 30 days."
          : isKo
            ? "최근 7일간 좋아요 순위예요."
            : "Ranked by likes from the last 7 days."
      }
    >
      <div className="mb-3 inline-flex rounded-full border border-white/35 bg-white/95 p-1.5 shadow-sm">
        <Link
          href="/community/pet-show/ranking?period=week"
          className={`rounded-full px-5 py-2.5 text-sm font-extrabold transition ${
            period === "week" ? "bg-channel-community text-white shadow-sm" : "text-plum/60 hover:bg-channel-community/10 hover:text-channel-community"
          }`}
        >
          {isKo ? "주간 랭킹" : "Weekly"}
        </Link>
        <Link
          href="/community/pet-show/ranking?period=month"
          className={`rounded-full px-5 py-2.5 text-sm font-extrabold transition ${
            period === "month" ? "bg-channel-community text-white shadow-sm" : "text-plum/60 hover:bg-channel-community/10 hover:text-channel-community"
          }`}
        >
          {isKo ? "월간 랭킹" : "Monthly"}
        </Link>
      </div>
      <PetShowWeeklySpeciesRanking
        dogRows={ranking.rows.dog}
        catRows={ranking.rows.cat}
        otherRows={mergeReptileChannelRankingRows(ranking.rows.reptile, ranking.rows.other)}
        period={period}
        source={ranking.source}
      />
    </PetShowShell>
  );
}
