import type { PetShowRankingRow, RankingPeriod } from "@/lib/supabase/types";
import { useLocale } from "next-intl";

interface PetShowRankingProps {
  rows: PetShowRankingRow[];
  period: RankingPeriod;
  source: "supabase" | "mock";
}

export function PetShowRanking({ rows, period, source }: PetShowRankingProps) {
  const locale = useLocale();
  const isKo = locale === "ko";
  const label = period === "week" ? (isKo ? "주간 Top 5" : "Weekly Top 5") : isKo ? "실시간 Top 5" : "Realtime Top 5";

  return (
    <section className="rounded-3xl border border-channel-community/25 bg-white/50 p-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-channel-community">
          📸 Pet Show · {label}
        </h2>
        {source === "mock" && (
          <span className="text-xs text-plum/50">{isKo ? "데모 데이터" : "Demo data"}</span>
        )}
      </div>
      <ol className="mt-4 space-y-3">
        {rows.map((row, i) => (
          <li
            key={row.id}
            className="flex items-center gap-4 rounded-2xl bg-channel-community/10 px-4 py-3"
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
          </li>
        ))}
      </ol>
    </section>
  );
}
