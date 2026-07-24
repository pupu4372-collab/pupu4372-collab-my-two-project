"use client";

import { GlassCard } from "@/components/layout/StitchLayout";
import { EmptyStatePanel, getEmptyStatePreset } from "@/components/ui/EmptyStatePanel";
import { VaultGuestSignupBanner } from "@/components/reports/VaultGuestSignupBanner";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { Link } from "@/i18n/navigation";
import type { VaultReportRow } from "@/lib/reports/vault-policy";
import { supabaseImageTransformUrl } from "@/lib/images/supabase-transform";
import { vaultTypeLabel } from "@/lib/reports/vault-policy";
import type { Pet } from "@/lib/supabase/types";
import { useLocale } from "next-intl";
import { useEffect, useMemo, useState } from "react";

const PET_AVATAR_THEMES = {
  dog: {
    ring: "from-channel-dog via-sky to-channel-dog/40",
    face: "border-channel-dog/30 bg-gradient-to-br from-sky/70 via-white to-channel-dog/15",
  },
  cat: {
    ring: "from-channel-cat via-petal to-channel-cat/40",
    face: "border-channel-cat/30 bg-gradient-to-br from-petal/80 via-white to-channel-cat/15",
  },
  other: {
    ring: "from-channel-community via-mint to-sage",
    face: "border-channel-community/30 bg-gradient-to-br from-mint via-white to-sage/50",
  },
} as const;

function petAvatarTheme(species: Pet["species"] | null | undefined) {
  if (species === "cat") return PET_AVATAR_THEMES.cat;
  if (species === "other") return PET_AVATAR_THEMES.other;
  return PET_AVATAR_THEMES.dog;
}

function formatCreatedAt(value: string, isKo: boolean) {
  return new Date(value).toLocaleDateString(isKo ? "ko-KR" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ReportVaultCard({
  report,
  isKo,
}: {
  report: VaultReportRow;
  isKo: boolean;
}) {
  const pet = report.pet;
  const avatarTheme = petAvatarTheme(pet?.species);
  const isPremium = report.vault.tier === "premium";
  const typeLabel = vaultTypeLabel(report.saju_type, isKo ? "ko" : "en", report.is_premium);
  const createdLabel = formatCreatedAt(report.created_at, isKo);
  const daysRemaining = report.vault.daysRemaining;

  return (
    <GlassCard
      variant="solid"
      className={`flex flex-col gap-4 !bg-white p-6 transition hover:-translate-y-0.5 ${
        isPremium
          ? "border border-channel-saju/25 shadow-[0_0_24px_rgba(139,92,246,0.18)]"
          : "border-plum/10"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`shrink-0 rounded-full bg-gradient-to-br p-[3px] shadow-[0_4px_14px_rgba(68,38,86,0.12)] ${avatarTheme.ring}`}
          >
            <div
              className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 text-xl ${avatarTheme.face}`}
            >
              {pet?.profile_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={supabaseImageTransformUrl(pet.profile_image_url, { width: 96, height: 96 })}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span aria-hidden>
                  {pet?.species === "cat" ? "🐱" : pet?.species === "other" ? "🐾" : "🐶"}
                </span>
              )}
            </div>
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-primary">
              {pet?.name ?? (isKo ? "알 수 없는 펫" : "Unknown pet")}
            </p>
            <p className="text-xs text-on-surface-variant">{createdLabel}</p>
          </div>
        </div>
        <span
          className={
            isPremium
              ? "rounded-full bg-channel-saju/15 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-channel-saju"
              : "rounded-full bg-sand px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-plum/55"
          }
        >
          {isPremium ? (isKo ? "프리미엄" : "Premium") : (isKo ? "무료" : "Free")}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-block rounded-lg px-3 py-1 text-xs font-bold ${
              isPremium ? "bg-lavender/70 text-channel-saju" : "bg-sand/80 text-plum/70"
            }`}
          >
            {typeLabel}
          </span>
          {!isPremium && daysRemaining != null ? (
            <span
              className={`text-xs font-bold ${
                daysRemaining <= 7 ? "text-amber-700" : "text-on-surface-variant"
              }`}
            >
              {isKo ? `${daysRemaining}일 남음` : `${daysRemaining} days left`}
            </span>
          ) : null}
        </div>
        <h2 className="line-clamp-2 text-base font-bold text-on-surface">
          {report.title ?? (isKo ? "저장된 리포트" : "Saved report")}
        </h2>
      </div>

      <Link
        href={`/reports/${report.id}`}
        className={
          isPremium
            ? "mt-auto rounded-xl bg-channel-saju py-3 text-center text-sm font-bold text-white"
            : "mt-auto rounded-xl bg-plum/80 py-3 text-center text-sm font-bold text-white"
        }
      >
        {isKo ? "다시보기" : "View again"}
      </Link>
    </GlassCard>
  );
}

export function ReportVaultPage() {
  const locale = useLocale();
  const isKo = locale === "ko";
  const { ready, accessToken, configured, isAnonymous } = useSupabaseSession();
  const [premiumReports, setPremiumReports] = useState<VaultReportRow[]>([]);
  const [freeReports, setFreeReports] = useState<VaultReportRow[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!configured || !ready || !accessToken) {
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
        setPremiumReports((data.premiumReports ?? []) as VaultReportRow[]);
        setFreeReports((data.freeReports ?? []) as VaultReportRow[]);
      } catch {
        setError(isKo ? "네트워크 오류" : "Network error");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [configured, ready, accessToken, isKo]);

  const filterReports = (reports: VaultReportRow[]) => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return reports;
    return reports.filter((report) => {
      const haystack = [report.title, report.summary, report.pet?.name, report.pet?.breed]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  };

  const filteredPremium = useMemo(() => filterReports(premiumReports), [premiumReports, query]);
  const filteredFree = useMemo(() => filterReports(freeReports), [freeReports, query]);
  const hasAny = filteredPremium.length > 0 || filteredFree.length > 0;

  if (!configured) {
    return <GlassCard className="text-sm text-white/75">Supabase 설정 후 리포트 보관함을 사용할 수 있어요.</GlassCard>;
  }

  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#ffd7ff]">Report Vault</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white drop-shadow-[0_0_18px_rgba(245,217,255,0.15)] md:text-4xl">
              {isKo ? "내 리포트 보관함" : "My Report Vault"}
            </h1>
            <p className="mt-2 text-sm text-white/75">
              {isKo
                ? "프리미엄 결과는 영구 보관, 무료 결과는 30일간 보관돼요."
                : "Premium results stay forever; free results are kept for 30 days."}
            </p>
            <Link
              href="/premium/human/vault"
              className="mt-3 inline-flex text-sm font-semibold text-[#ffd7ff] underline hover:text-white"
            >
              {isKo ? "집사 프리미엄 보관함 →" : "Pet parent premium vault →"}
            </Link>
          </div>
          <label className="relative w-full md:w-80">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-plum/45" aria-hidden>
              🔎
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full rounded-2xl border border-white/25 bg-white/92 py-3 pl-11 pr-4 text-sm text-on-surface shadow-sm placeholder:text-plum/40 focus:ring-2 focus:ring-primary/25"
              placeholder={isKo ? "반려동물 이름 검색..." : "Search pet name..."}
            />
          </label>
        </div>
        {isAnonymous ? <VaultGuestSignupBanner returnPath="/reports" /> : null}
      </section>

      {loading || !ready ? (
        <p className="text-sm text-white/65">{isKo ? "리포트 불러오는 중..." : "Loading reports..."}</p>
      ) : error ? (
        <GlassCard className="text-sm text-red-700/80">{error}</GlassCard>
      ) : !hasAny ? (
        <EmptyStatePanel {...getEmptyStatePreset("reports", isKo)} />
      ) : (
        <div className="space-y-10">
          {filteredPremium.length > 0 ? (
            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-extrabold text-white">
                  {isKo ? "프리미엄" : "Premium"}
                </h2>
                <p className="mt-1 text-sm text-white/70">
                  {isKo
                    ? "MBTI · 궁합 · 별자리 · 결제 리포트는 기간 제한 없이 보관돼요."
                    : "MBTI, bond, zodiac, and paid reports are stored with no expiry."}
                </p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPremium.map((report) => (
                  <ReportVaultCard key={report.id} report={report} isKo={isKo} />
                ))}
              </div>
            </section>
          ) : null}

          {filteredFree.length > 0 ? (
            <section className="space-y-4">
              <div className="rounded-[1.5rem] border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-sm">
                <h2 className="text-xl font-extrabold text-white">
                  {isKo ? "무료" : "Free"}
                </h2>
                <p className="mt-1 text-sm text-white/80">
                  {isKo
                    ? "무료 결과는 30일간 보관됩니다. 프리미엄 결과는 기간 제한 없이 보관돼요."
                    : "Free results are kept for 30 days. Premium results stay without a time limit."}
                </p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredFree.map((report) => (
                  <ReportVaultCard key={report.id} report={report} isKo={isKo} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
