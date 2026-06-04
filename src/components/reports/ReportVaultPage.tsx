"use client";

import { GlassCard } from "@/components/layout/StitchLayout";
import { EmptyStatePanel, getEmptyStatePreset } from "@/components/ui/EmptyStatePanel";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { Link } from "@/i18n/navigation";
import { supabaseImageTransformUrl } from "@/lib/images/supabase-transform";
import type { Pet, SajuResultRow, SajuType } from "@/lib/supabase/types";
import { useLocale } from "next-intl";
import { useEffect, useMemo, useState } from "react";

interface ReportRow extends SajuResultRow {
  pet: Pet | null;
}

type FilterKey = "all" | SajuType;

const TYPE_LABELS = {
  ko: {
    all: "전체",
    basic: "사주",
    zodiac: "별자리",
    compatibility: "궁합",
    character_card: "캐릭터",
    premium: "프리미엄",
  },
  en: {
    all: "All",
    basic: "Saju",
    zodiac: "Zodiac",
    compatibility: "Bond",
    character_card: "Character",
    premium: "Premium",
  },
} as const;

const FILTERS: FilterKey[] = ["all", "basic", "zodiac", "compatibility", "premium"];

function fallbackSummary(report: ReportRow, isKo: boolean) {
  if (report.summary) return report.summary;
  if (report.title) return report.title;
  return isKo
    ? "저장된 리포트입니다. 펫 상세 프로필에서 연결된 정보를 다시 확인할 수 있어요."
    : "Saved report. Revisit connected context from the pet profile.";
}

export function ReportVaultPage() {
  const locale = useLocale();
  const isKo = locale === "ko";
  const { ready, accessToken, configured, isAnonymous } = useSupabaseSession();
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const labels = TYPE_LABELS[isKo ? "ko" : "en"];

  useEffect(() => {
    if (!configured || !ready || !accessToken || isAnonymous) {
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/profile/reports", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? (isKo ? "리포트를 불러오지 못했어요." : "Could not load reports."));
          return;
        }
        setReports((data.reports ?? []) as ReportRow[]);
      } catch {
        setError(isKo ? "네트워크 오류" : "Network error");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [configured, ready, accessToken, isAnonymous, isKo]);

  const filteredReports = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return reports.filter((report) => {
      const matchesFilter = filter === "all" || report.saju_type === filter || (filter === "premium" && report.is_premium);
      const haystack = [report.title, report.summary, report.pet?.name, report.pet?.breed]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesFilter && (!normalized || haystack.includes(normalized));
    });
  }, [reports, query, filter]);

  if (!configured) {
    return <GlassCard className="text-sm text-plum/70">Supabase 설정 후 리포트 보관함을 사용할 수 있어요.</GlassCard>;
  }

  if (isAnonymous) {
    return (
      <GlassCard className="text-center">
        <p className="text-sm text-plum/70">{isKo ? "리포트 보관함을 보려면 로그인이 필요해요." : "Please log in to view your report vault."}</p>
        <Link href="/login" className="mt-4 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-bold text-white">
          {isKo ? "로그인하기" : "Log in"}
        </Link>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-8">
      <section className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-channel-saju">Report Vault</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-primary md:text-4xl">
              {isKo ? "내 리포트 보관함" : "My Report Vault"}
            </h1>
            <p className="mt-2 text-sm text-plum/65">
              {isKo ? "저장된 사주, 별자리, 궁합, 프리미엄 리포트를 한곳에서 다시 확인하세요." : "Revisit saved saju, zodiac, bond, and premium reports."}
            </p>
          </div>
          <label className="relative w-full md:w-80">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-plum/35" aria-hidden>
              🔎
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full rounded-2xl border-0 bg-surface-container-low py-3 pl-11 pr-4 text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20"
              placeholder={isKo ? "반려동물 이름 검색..." : "Search pet name..."}
            />
          </label>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={
                filter === item
                  ? "shrink-0 rounded-full bg-primary px-6 py-2 text-xs font-bold text-white"
                  : "shrink-0 rounded-full bg-surface-container-high px-6 py-2 text-xs font-bold text-on-surface-variant transition hover:bg-secondary-container/60"
              }
            >
              {labels[item]}
            </button>
          ))}
        </div>
      </section>

      {loading || !ready ? (
        <p className="text-sm text-plum/60">{isKo ? "리포트 불러오는 중..." : "Loading reports..."}</p>
      ) : error ? (
        <GlassCard className="text-sm text-red-700/80">{error}</GlassCard>
      ) : filteredReports.length === 0 ? (
        <EmptyStatePanel {...getEmptyStatePreset("reports", isKo)} />
      ) : (
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredReports.map((report) => {
            const isPremium = report.is_premium || report.saju_type === "premium";
            const pet = report.pet;
            return (
              <GlassCard
                key={report.id}
                className={`flex flex-col gap-4 p-6 transition hover:-translate-y-0.5 ${
                  isPremium ? "border border-secondary-container shadow-[0_0_24px_rgba(249,217,200,0.65)]" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-primary-fixed text-xl">
                      {pet?.profile_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={supabaseImageTransformUrl(pet.profile_image_url, { width: 96, height: 96 })} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span aria-hidden>{pet?.species === "cat" ? "🐱" : pet?.species === "other" ? "🐾" : "🐶"}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-lg font-bold text-primary">{pet?.name ?? (isKo ? "알 수 없는 펫" : "Unknown pet")}</p>
                      <p className="text-xs text-on-surface-variant">
                        {new Date(report.created_at).toLocaleDateString(isKo ? "ko-KR" : "en-US")}
                      </p>
                    </div>
                  </div>
                  {isPremium && (
                    <span className="rounded-full bg-secondary-fixed px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-secondary">
                      Premium
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <span className="inline-block rounded-lg bg-primary-fixed/35 px-3 py-1 text-xs font-bold text-primary">
                    {labels[report.saju_type] ?? report.saju_type}
                  </span>
                  <h2 className="line-clamp-2 text-base font-bold text-on-surface">
                    {report.title ?? (isKo ? "저장된 리포트" : "Saved report")}
                  </h2>
                  <p className="line-clamp-3 text-sm leading-6 text-on-surface-variant">{fallbackSummary(report, isKo)}</p>
                </div>

                <Link
                  href={`/reports/${report.id}`}
                  className={isPremium ? "mt-auto rounded-xl bg-primary py-3 text-center text-sm font-bold text-white" : "mt-auto rounded-xl bg-secondary py-3 text-center text-sm font-bold text-white"}
                >
                  {isKo ? "다시보기" : "View again"}
                </Link>
              </GlassCard>
            );
          })}
        </section>
      )}
    </div>
  );
}
