"use client";

import { CompatibilityResult } from "@/components/k-saju/CompatibilityResult";
import { PremiumReportView } from "@/components/k-saju/PremiumReportView";
import { SajuResult } from "@/components/k-saju/SajuResult";
import { ZodiacResult } from "@/components/k-saju/ZodiacResult";
import { ChannelShell } from "@/components/layout/ChannelShell";
import { GlassCard } from "@/components/layout/StitchLayout";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { Link } from "@/i18n/navigation";
import type { CompatibilityResponse } from "@/lib/saju/compatibility/engine";
import type { PremiumReport } from "@/lib/saju/premium-report";
import type { ElementKey, ElementDisplay, Gender, Locale, SajuBasicResponse, Species } from "@/lib/saju/types";
import type { ZodiacFortuneResponse } from "@/lib/saju/zodiac/engine";
import type { Pet, SajuResultRow } from "@/lib/supabase/types";
import { useLocale } from "next-intl";
import { useEffect, useMemo, useState } from "react";

interface ReportDetailRow extends SajuResultRow {
  pet: Pet | null;
}

const DB_ELEMENT_TO_KEY: Record<NonNullable<SajuResultRow["dominant_element"]>, ElementKey> = {
  mok: "wood",
  hwa: "fire",
  to: "earth",
  geum: "metal",
  su: "water",
};

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function localeFrom(value: unknown): Locale {
  return value === "en" ? "en" : "ko";
}

function speciesFrom(report: ReportDetailRow): Species {
  return report.pet?.species === "cat" ? "cat" : "dog";
}

function elementFrom(report: ReportDetailRow): ElementKey {
  return report.dominant_element ? DB_ELEMENT_TO_KEY[report.dominant_element] : "earth";
}

function baseSajuResult(report: ReportDetailRow): SajuBasicResponse {
  const birth = asObject(report.birth_basis);
  const payload = asObject(report.storytelling_payload);
  const birthUtc = asString(birth.birthUtc, `${report.pet?.birth_date ?? report.created_at.slice(0, 10)}T12:00:00.000Z`);
  const locale = localeFrom(birth.locale);

  return {
    petName: report.pet?.name ?? "반려동물",
    species: speciesFrom(report),
    petGender: (asString(birth.petGender, report.pet?.gender ?? "") as Gender) || null,
    locale,
    birthUtc,
    timezone: asString(birth.timezone, report.pet?.birth_timezone ?? "Asia/Seoul"),
    birthTimeUnknown: asBoolean(birth.birthTimeUnknown, report.pet?.birth_time_unknown ?? false),
    kstJiji: (payload.kstJiji as SajuBasicResponse["kstJiji"]) ?? null,
    pillars: report.pillars as SajuBasicResponse["pillars"],
    elements: (Array.isArray(report.five_elements) ? report.five_elements : []) as ElementDisplay[],
    dominantElement: elementFrom(report),
    headline: report.title ?? (locale === "ko" ? "저장된 사주 리포트" : "Saved saju report"),
    story: report.summary ?? "",
    traits: asStringArray(payload.traits),
    narrativeSource: asString(payload.narrativeSource, "template") as SajuBasicResponse["narrativeSource"],
    narrativeError: asString(payload.narrativeError) || null,
    persisted: true,
    petId: report.pet_id,
    sajuResultId: report.id,
  };
}

function zodiacResult(report: ReportDetailRow): ZodiacFortuneResponse {
  const birth = asObject(report.birth_basis);
  const payload = asObject(report.storytelling_payload);
  const elements = asObject(report.five_elements);
  const locale = localeFrom(birth.locale);

  return {
    petName: report.pet?.name ?? "반려동물",
    species: speciesFrom(report),
    locale,
    birthDate: asString(birth.birthDate, report.pet?.birth_date ?? report.created_at.slice(0, 10)),
    fortuneDateKst: asString(birth.fortuneDateKst, report.created_at.slice(0, 10)),
    persisted: true,
    petId: report.pet_id,
    sajuResultId: report.id,
    sign: asObject(payload.sign) as unknown as ZodiacFortuneResponse["sign"],
    elementAffinity: asString(elements.affinity, elementFrom(report)) as ElementKey,
    elementLabel: asObject(elements.label) as unknown as ZodiacFortuneResponse["elementLabel"],
    personality: asObject(payload.personality) as unknown as ZodiacFortuneResponse["personality"],
    daily: asObject(payload.daily) as unknown as ZodiacFortuneResponse["daily"],
  };
}

function compatibilityResult(report: ReportDetailRow): CompatibilityResponse {
  const birth = asObject(report.birth_basis);
  const payload = asObject(report.storytelling_payload);
  const elements = asObject(report.five_elements);
  const pillars = asObject(report.pillars);

  return {
    petName: report.pet?.name ?? "반려동물",
    ownerName: asString(payload.ownerName, asString(birth.ownerName, "집사")),
    species: speciesFrom(report),
    petGender: asString(payload.petGender, asString(birth.petGender, "male")) as Gender,
    ownerGender: asString(payload.ownerGender, asString(birth.ownerGender, "male")) as Gender,
    locale: localeFrom(birth.locale),
    persisted: true,
    petId: report.pet_id,
    sajuResultId: report.id,
    bondScore: Number(payload.bondScore ?? 0),
    bondLabel: asString(payload.bondLabel),
    bondEmoji: asString(payload.bondEmoji, "🐾"),
    relation: asString(payload.relation, asString(elements.relation, "neutral")) as CompatibilityResponse["relation"],
    petElement: asString(elements.pet, elementFrom(report)) as ElementKey,
    ownerElement: asString(elements.owner, "earth") as ElementKey,
    petElementLabel: asObject(payload.petElementLabel) as unknown as CompatibilityResponse["petElementLabel"],
    ownerElementLabel: asObject(payload.ownerElementLabel) as unknown as CompatibilityResponse["ownerElementLabel"],
    petDayPillar: asString(pillars.petDay),
    ownerDayPillar: asString(pillars.ownerDay),
    headline: report.title ?? "",
    story: report.summary ?? "",
    details: (payload.details as unknown as CompatibilityResponse["details"]) ?? [],
    careTips: asStringArray(payload.careTips),
  };
}

function premiumResult(report: ReportDetailRow): PremiumReport {
  const payload = asObject(report.storytelling_payload);
  const basic = baseSajuResult(report);

  return {
    basic,
    lifetimeHeadline: report.title ?? basic.headline,
    lifetimeStory: report.summary ?? basic.story,
    yearlyThemes: asStringArray(payload.yearlyThemes),
    careGuide: asStringArray(payload.careGuide),
    luckyColors: asStringArray(payload.luckyColors),
    characterTitle: asString(payload.characterTitle),
  };
}

function ReportRenderer({ report }: { report: ReportDetailRow }) {
  if (report.saju_type === "zodiac") {
    return <ZodiacResult result={zodiacResult(report)} />;
  }

  if (report.saju_type === "compatibility") {
    return <CompatibilityResult result={compatibilityResult(report)} />;
  }

  if (report.is_premium || report.saju_type === "premium") {
    return <PremiumReportView report={premiumResult(report)} petName={report.pet?.name ?? "반려동물"} />;
  }

  return <SajuResult result={baseSajuResult(report)} />;
}

export function ReportDetailPage({ reportId }: { reportId: string }) {
  const locale = useLocale();
  const isKo = locale === "ko";
  const { ready, accessToken, configured, isAnonymous } = useSupabaseSession();
  const [report, setReport] = useState<ReportDetailRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!configured || !ready || !accessToken || isAnonymous) {
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/profile/reports/${reportId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? (isKo ? "리포트를 불러오지 못했어요." : "Could not load report."));
          return;
        }
        setReport(data.report as ReportDetailRow);
      } catch {
        setError(isKo ? "네트워크 오류" : "Network error");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [accessToken, configured, isAnonymous, isKo, ready, reportId]);

  const title = useMemo(() => {
    if (report?.title) return report.title;
    return isKo ? "저장된 리포트 다시보기" : "Saved report";
  }, [isKo, report?.title]);

  return (
    <ChannelShell
      theme="saju"
      title={title}
      subtitle={isKo ? "보관함에 저장된 당시 결과 화면입니다." : "This is the saved result from your vault."}
      backHref="/reports"
      backLabel={isKo ? "← 리포트 보관함" : "← Report vault"}
      rightLinks={[{ href: "/", label: isKo ? "홈" : "Home" }]}
    >
      {!configured ? (
        <GlassCard className="text-sm text-plum/70">Supabase 설정 후 리포트 다시보기를 사용할 수 있어요.</GlassCard>
      ) : isAnonymous ? (
        <GlassCard className="text-center">
          <p className="text-sm text-plum/70">{isKo ? "리포트를 보려면 로그인이 필요해요." : "Please log in to view this report."}</p>
          <Link href="/login" className="mt-4 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-bold text-white">
            {isKo ? "로그인하기" : "Log in"}
          </Link>
        </GlassCard>
      ) : loading || !ready ? (
        <p className="text-sm text-plum/60">{isKo ? "리포트 불러오는 중..." : "Loading report..."}</p>
      ) : error ? (
        <GlassCard className="text-sm text-red-700/80">{error}</GlassCard>
      ) : report ? (
        <ReportRenderer report={report} />
      ) : (
        <GlassCard className="text-sm text-plum/70">{isKo ? "리포트를 찾을 수 없어요." : "Report not found."}</GlassCard>
      )}
    </ChannelShell>
  );
}
