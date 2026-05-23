import { fetchPetShowRanking, fetchWeeklyPetShowSpeciesRankings } from "@/lib/community/ranking";
import type { RankingPeriod } from "@/lib/supabase/types";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = (searchParams.get("period") ?? "week") as RankingPeriod;

  if (period !== "week" && period !== "realtime") {
    return NextResponse.json(
      { error: "period must be 'week' or 'realtime'" },
      { status: 400 }
    );
  }

  if (searchParams.get("group") === "species") {
    const { rows, source } = await fetchWeeklyPetShowSpeciesRankings();
    return NextResponse.json({
      period: "week",
      group: "species",
      source,
      limit: 5,
      rows,
    });
  }

  const { rows, source } = await fetchPetShowRanking(period);

  return NextResponse.json({
    period,
    source,
    limit: 5,
    rows,
  });
}
