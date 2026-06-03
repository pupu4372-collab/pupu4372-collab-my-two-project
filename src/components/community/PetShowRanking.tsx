import type { PetShowRankingRow, RankingPeriod } from "@/lib/supabase/types";
import { Link } from "@/i18n/navigation";
import { supabaseImageTransformUrl } from "@/lib/images/supabase-transform";
import { useLocale } from "next-intl";

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
          <li key={row.id}>
            <Link
              href={`/community/pet-show/${row.id}`}
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

function SpeciesList({
  rows,
  emoji,
  title,
  emptyText,
  locale,
}: {
  rows: PetShowRankingRow[];
  emoji: string;
  title: string;
  emptyText: string;
  locale: string;
}) {
  return (
    <div className="rounded-2xl bg-white/55 p-4">
      <h3 className="text-sm font-bold text-plum">
        {emoji} {title}
      </h3>
      {rows.length === 0 ? (
        <div className="mt-3 rounded-2xl border border-dashed border-channel-community/25 bg-white/60 px-4 py-4 text-center">
          <p className="text-xs leading-relaxed text-plum/60">{emptyText}</p>
          <Link
            href="/community/pet-show/upload"
            className="mt-2 inline-flex rounded-full bg-channel-community px-4 py-2 text-[11px] font-bold text-white"
          >
            {locale === "ko" ? "사진 올리기" : "Upload photo"}
          </Link>
        </div>
      ) : (
        <ol className="mt-3 space-y-2">
          {rows.slice(0, 5).map((row, i) => (
            <li key={row.id}>
              <Link
                href={`/community/pet-show/${row.id}`}
                className="flex items-center gap-3 rounded-xl bg-channel-community/10 p-2 transition hover:bg-channel-community/15"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-channel-community text-xs font-bold text-white">
                  {row.rank_position ?? i + 1}
                </span>
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white/70">
                  {row.image_urls?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={supabaseImageTransformUrl(row.image_urls[0], { width: 96, height: 96 })} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-xl">{emoji}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-plum">{row.title ?? "Pet Show"}</p>
                  <p className="text-xs text-plum/55">♥ {row.like_count} · 💬 {row.comment_count}</p>
                </div>
              </Link>
            </li>
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
  const isMonthly = period === "month";

  return (
    <section className="rounded-3xl border border-channel-community/25 bg-channel-community/10 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-channel-community">
            {isMonthly
              ? isKo
                ? "우리아이 자랑 월간 랭킹 Top 5"
                : "Pet Show Monthly Top 5"
              : isKo
                ? "우리아이 자랑 주간 랭킹 Top 5"
                : "Pet Show Weekly Top 5"}
          </h2>
          <p className="mt-1 text-xs text-plum/55">
            {isMonthly
              ? isKo
                ? "최근 30일간 좋아요 순위입니다. 동점일 때는 먼저 올린 사진이 앞에 배정돼요."
                : "Ranked by likes from the last 30 days. Ties go to earlier uploads first."
              : isKo
                ? "최근 7일간 좋아요 순위입니다. 동점일 때는 먼저 올린 사진이 앞에 배정돼요."
                : "Ranked by likes from the last 7 days. Ties go to earlier uploads first."}
          </p>
        </div>
        {source === "mock" && (
          <span className="rounded-full bg-white/70 px-3 py-1 text-xs text-plum/50">
            {isKo ? "데모 데이터" : "Demo data"}
          </span>
        )}
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <SpeciesList
          rows={dogRows}
          emoji="🐕"
          title={isKo ? "강아지 Top 5" : "Dog Top 5"}
          emptyText={
            isMonthly
              ? isKo
                ? "이번 달 강아지 사진을 기다리는 중이에요."
                : "Waiting for dog photos this month."
              : isKo
                ? "이번 주 강아지 사진을 기다리는 중이에요."
                : "Waiting for dog photos this week."
          }
          locale={locale}
        />
        <SpeciesList
          rows={catRows}
          emoji="🐈"
          title={isKo ? "고양이 Top 5" : "Cat Top 5"}
          emptyText={
            isMonthly
              ? isKo
                ? "이번 달 고양이 사진을 기다리는 중이에요."
                : "Waiting for cat photos this month."
              : isKo
                ? "이번 주 고양이 사진을 기다리는 중이에요."
                : "Waiting for cat photos this week."
          }
          locale={locale}
        />
        <SpeciesList
          rows={otherRows}
          emoji="🐾"
          title={isKo ? "렙타일(다른동물) Top 5" : "Other Animals Top 5"}
          emptyText={
            isMonthly
              ? isKo
                ? "이번 달 렙타일(다른동물) 사진을 기다리는 중이에요."
                : "Waiting for other animal photos this month."
              : isKo
                ? "이번 주 렙타일(다른동물) 사진을 기다리는 중이에요."
                : "Waiting for other animal photos this week."
          }
          locale={locale}
        />
      </div>
    </section>
  );
}
