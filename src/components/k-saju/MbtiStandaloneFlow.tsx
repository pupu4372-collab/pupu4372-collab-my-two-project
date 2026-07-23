"use client";

import { ReportGenerateLoader } from "@/components/human-premium/ReportGenerateLoader";
import { PetPremiumPaywall } from "@/components/k-saju/PetPremiumPaywall";
import { PetPremiumUnlockSkeleton } from "@/components/k-saju/PetPremiumUnlockSkeleton";
import { PremiumHubBackToBasicLink } from "@/components/k-saju/PremiumHubBackToBasicLink";
import { PremiumMbtiReport } from "@/components/k-saju/PremiumMbtiReport";
import { PremiumMbtiSurvey } from "@/components/k-saju/PremiumMbtiSurvey";
import { COMMUNITY_SOLID_SURFACE_CLASS } from "@/components/community/CommunityDetailSurface";
import { usePetPremiumUnlock } from "@/hooks/usePetPremiumUnlock";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { Link } from "@/i18n/navigation";
import {
  buildPetMbtiResult,
  buildPetMbtiResultFromType,
  isPetMbtiComplete,
  scoresFromAnswers,
  type PetMbtiPremiumInsight,
  type PetMbtiResult,
  type PetMbtiType,
} from "@/lib/pet/mbti-inference";
import { computeBasicSaju } from "@/lib/saju/engine";
import type { ElementKey, Gender, Locale, Species } from "@/lib/saju/types";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const UI = {
  ko: {
    missingPet: "펫 정보가 없어요. 무료 사주 결과부터 다시 시작해 주세요.",
    backSaju: "K-사주로 돌아가기",
    loading: "불러오는 중…",
    networkError: "네트워크 오류가 발생했어요.",
    premiumRequired: "결제 후 이용할 수 있어요.",
    retake: "다시 진단하기",
    retakeLimited: "오늘은 더 이상 다시 입력할 수 없어요. 내일 다시 시도해주세요.",
    viewReport: "저장된 결과 보기",
    typeTitle: (name: string, type: string) => `${name}은(는) ${type}형이에요`,
  },
  en: {
    missingPet: "Missing pet info. Start again from free K-Saju.",
    backSaju: "Back to K-Saju",
    loading: "Loading…",
    networkError: "Network error.",
    premiumRequired: "Available after payment.",
    retake: "Diagnose again",
    retakeLimited: "You've reached today's retake limit. Please try again tomorrow.",
    viewReport: "View saved result",
    typeTitle: (name: string, type: string) => `${name} is ${type}`,
  },
} as const;

type StoredMbtiReport = {
  reportId: string;
  insight: PetMbtiPremiumInsight;
  mbtiResult: PetMbtiResult;
  mbtiType: string;
};

function parseGender(value: string | null): Gender {
  return value === "male" ? "male" : "female";
}

function parseSpecies(value: string | null): Species {
  if (value === "cat" || value === "reptile" || value === "other") return value;
  return "dog";
}

function insightFromReportPayload(
  payload: Record<string, unknown>,
  summary: string,
  mbtiType: PetMbtiType
): PetMbtiPremiumInsight {
  return {
    mbtiType,
    axisPercents: (payload.axisPercents as PetMbtiPremiumInsight["axisPercents"]) ?? {
      EI: { E: 50, I: 50 },
      SN: { S: 50, N: 50 },
      TF: { T: 50, F: 50 },
      JP: { J: 50, P: 50 },
    },
    personalityBlend: String(payload.personalityBlend ?? summary ?? ""),
    sajuCombo: String(payload.sajuCombo ?? ""),
    butlerFit: String(payload.butlerFit ?? ""),
    health: String(payload.health ?? ""),
    dailyCare: String(payload.dailyCare ?? ""),
    narrativeSource: (payload.narrativeSource as PetMbtiPremiumInsight["narrativeSource"]) ?? "template",
  };
}

export function MbtiStandaloneFlow() {
  const params = useSearchParams();
  const { ready, configured, isAnonymous, accessToken } = useSupabaseSession();
  const routeLocale = useLocale();

  const locale = (routeLocale === "en" ? "en" : "ko") as Locale;
  const t = UI[locale];

  const petName = params.get("petName")?.trim() ?? "";
  const species = parseSpecies(params.get("species"));
  const petGender = parseGender(params.get("petGender"));
  const birthDate = params.get("birthDate") ?? "";
  const birthTimeRaw = params.get("birthTime");
  const birthTimeUnknown = !birthTimeRaw || birthTimeRaw === "unknown";
  const birthTime = birthTimeUnknown ? null : birthTimeRaw;
  const timezone = params.get("timezone") ?? "Asia/Seoul";
  const petId = params.get("petId");
  const sajuResultId = params.get("sajuResultId");

  const hasPetContext = Boolean(petName && birthDate);

  const [mbtiAnswers, setMbtiAnswers] = useState<Record<string, string>>({});
  const [mbtiType, setMbtiType] = useState<string | null>(null);
  const [mbtiResult, setMbtiResult] = useState<PetMbtiResult | null>(null);
  const [mbtiInsight, setMbtiInsight] = useState<PetMbtiPremiumInsight | null>(null);
  const [storedReport, setStoredReport] = useState<StoredMbtiReport | null>(null);
  const [retakeMode, setRetakeMode] = useState(false);
  const [loadingStored, setLoadingStored] = useState(false);
  const [insightLoading, setInsightLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unlockCheckEnabled = configured && ready && !isAnonymous && Boolean(petId);
  const { unlocked, loading: unlockLoading } = usePetPremiumUnlock(
    petId,
    accessToken,
    unlockCheckEnabled,
    "mbti"
  );

  const dominantElement = useMemo((): ElementKey | undefined => {
    if (!hasPetContext) return undefined;
    return computeBasicSaju({
      petName,
      species,
      petGender,
      birthDate,
      calendarType: "solar",
      birthTime,
      birthTimeUnknown,
      timezone,
      locale,
      privacyConsent: true,
    }).dominantElement;
  }, [birthDate, birthTime, birthTimeUnknown, hasPetContext, locale, petGender, petName, species, timezone]);

  const mbtiSurveyComplete = isPetMbtiComplete(mbtiAnswers);

  const paymentContinuation = {
    petName,
    species,
    petGender,
    birthDate,
    birthTime: birthTime ?? "unknown",
    timezone,
    locale,
    petId,
    sajuResultId,
  };

  const loadStoredReport = useCallback(async () => {
    if (!accessToken || !petId || retakeMode) return;
    setLoadingStored(true);
    setError(null);
    try {
      const latestRes = await fetch(
        `/api/profile/reports/latest-mbti?petId=${encodeURIComponent(petId)}`,
        { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" }
      );
      const latest = (await latestRes.json()) as { id?: string | null };
      if (!latest.id) {
        setStoredReport(null);
        return;
      }

      const detailRes = await fetch(`/api/profile/reports/${latest.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      if (!detailRes.ok) {
        setStoredReport(null);
        return;
      }
      const detail = (await detailRes.json()) as {
        id: string;
        summary?: string;
        storytelling_payload?: Record<string, unknown>;
      };
      const payload = detail.storytelling_payload ?? {};
      const type = String(payload.mbtiType ?? "").toUpperCase();
      if (!/^[EI][SN][TF][JP]$/.test(type)) {
        setStoredReport(null);
        return;
      }
      const result = buildPetMbtiResultFromType(type as PetMbtiType);
      if (!result) {
        setStoredReport(null);
        return;
      }
      setStoredReport({
        reportId: detail.id,
        mbtiType: type,
        mbtiResult: result,
        insight: insightFromReportPayload(payload, detail.summary ?? "", type as PetMbtiType),
      });
    } catch {
      setError(t.networkError);
    } finally {
      setLoadingStored(false);
    }
  }, [accessToken, petId, retakeMode, t.networkError]);

  useEffect(() => {
    if (!unlocked || retakeMode) return;
    void loadStoredReport();
  }, [loadStoredReport, retakeMode, unlocked]);

  useEffect(() => {
    if (!mbtiSurveyComplete || mbtiType) return;
    const result = buildPetMbtiResult(scoresFromAnswers(mbtiAnswers));
    setMbtiType(result.type);
    setMbtiResult(result);
    setMbtiInsight(null);
  }, [mbtiAnswers, mbtiSurveyComplete, mbtiType]);

  useEffect(() => {
    if (!unlocked || !hasPetContext || !mbtiType || !mbtiResult || mbtiInsight || insightLoading) {
      return;
    }
    if (storedReport && !retakeMode) return;

    setInsightLoading(true);
    setError(null);

    void (async () => {
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

        const res = await fetch("/api/saju/premium/mbti", {
          method: "POST",
          headers,
          body: JSON.stringify({
            petName,
            species,
            petGender,
            birthDate,
            calendarType: "solar",
            birthTime,
            birthTimeUnknown,
            timezone,
            locale,
            mbtiType,
            mbtiAnswers,
            petId,
            retake: retakeMode,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (data.code === "mbti_retake_limited" || res.status === 429) {
            setError(t.retakeLimited);
            return;
          }
          setError(data.error === "premium_required" ? t.premiumRequired : (data.error ?? t.networkError));
          return;
        }
        setMbtiInsight(data as PetMbtiPremiumInsight);
        setRetakeMode(false);
      } catch {
        setError(t.networkError);
      } finally {
        setInsightLoading(false);
      }
    })();
  }, [
    accessToken,
    birthDate,
    birthTime,
    birthTimeUnknown,
    hasPetContext,
    insightLoading,
    locale,
    loadStoredReport,
    mbtiAnswers,
    mbtiInsight,
    mbtiResult,
    mbtiType,
    petGender,
    petId,
    petName,
    retakeMode,
    species,
    storedReport,
    timezone,
    t.networkError,
    t.premiumRequired,
    t.retakeLimited,
    unlocked,
  ]);

  function handleRetake() {
    setRetakeMode(true);
    setMbtiAnswers({});
    setMbtiType(null);
    setMbtiResult(null);
    setMbtiInsight(null);
    setStoredReport(null);
    setError(null);
  }

  function handleMbtiAnswer(questionId: string, optionId: string) {
    setMbtiAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  if (!hasPetContext) {
    return (
      <div className={`${COMMUNITY_SOLID_SURFACE_CLASS} space-y-4 p-6 text-center`}>
        <p className="text-sm text-plum/70">{t.missingPet}</p>
        <Link href="/saju" className="inline-flex rounded-full bg-channel-saju px-6 py-3 text-sm font-semibold text-white">
          {t.backSaju}
        </Link>
      </div>
    );
  }

  if (unlockCheckEnabled && unlockLoading) {
    return (
      <div className="space-y-4">
        <PremiumHubBackToBasicLink locale={locale} sajuResultId={sajuResultId} petId={petId} />
        <PetPremiumUnlockSkeleton />
      </div>
    );
  }

  if ((configured && ready && isAnonymous) || !unlocked) {
    return (
      <div className="space-y-4">
        <PremiumHubBackToBasicLink locale={locale} sajuResultId={sajuResultId} petId={petId} />
        <PetPremiumPaywall
          locale={locale}
          continuation={paymentContinuation}
          returnTo="mbti_standalone"
          loginRequired={configured && ready && isAnonymous}
        />
      </div>
    );
  }

  const showStored =
    storedReport && !retakeMode && !mbtiInsight && !insightLoading && !mbtiSurveyComplete;

  return (
    <div className="space-y-6">
      <PremiumHubBackToBasicLink locale={locale} sajuResultId={sajuResultId} petId={petId} />
      <ReportGenerateLoader isKo={locale === "ko"} active={loadingStored || insightLoading} />

      {error ? (
        <p className="rounded-2xl border border-red-300/70 bg-white/95 px-4 py-2.5 text-sm font-semibold text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      {showStored && storedReport ? (
        <div className="space-y-4">
          <div className={`${COMMUNITY_SOLID_SURFACE_CLASS} flex flex-wrap items-center justify-between gap-3 p-4`}>
            <Link
              href={`/reports/${storedReport.reportId}`}
              className="text-sm font-semibold text-channel-saju underline-offset-2 hover:underline"
            >
              {t.viewReport}
            </Link>
            <button
              type="button"
              onClick={handleRetake}
              className="rounded-full border border-channel-saju/30 bg-white px-4 py-2 text-sm font-bold text-channel-saju"
            >
              {t.retake}
            </button>
          </div>
          <article className={`${COMMUNITY_SOLID_SURFACE_CLASS} p-5 text-center`}>
            <p className="text-lg font-extrabold text-primary">
              {t.typeTitle(petName, storedReport.mbtiType)}
            </p>
            <p className="mt-1 text-sm font-semibold text-plum/90">
              {locale === "ko" ? storedReport.mbtiResult.titleKo : storedReport.mbtiResult.titleEn}
            </p>
          </article>
          <PremiumMbtiReport
            insight={storedReport.insight}
            locale={locale}
            dominantElement={dominantElement}
          />
        </div>
      ) : null}

      {!showStored && !mbtiType && !insightLoading ? (
        <PremiumMbtiSurvey locale={locale} answers={mbtiAnswers} onSelect={handleMbtiAnswer} />
      ) : null}

      {!showStored && mbtiType && mbtiResult && mbtiInsight ? (
        <div className="space-y-4">
          <article className={`${COMMUNITY_SOLID_SURFACE_CLASS} p-5 text-center`}>
            <p className="text-lg font-extrabold text-primary">{t.typeTitle(petName, mbtiType)}</p>
            <p className="mt-1 text-sm font-semibold text-plum/90">
              {locale === "ko" ? mbtiResult.titleKo : mbtiResult.titleEn}
            </p>
          </article>
          <PremiumMbtiReport insight={mbtiInsight} locale={locale} dominantElement={dominantElement} />
          <button
            type="button"
            onClick={handleRetake}
            className={`${COMMUNITY_SOLID_SURFACE_CLASS} w-full py-3 text-sm font-bold text-channel-saju`}
          >
            {t.retake}
          </button>
        </div>
      ) : null}
    </div>
  );
}
