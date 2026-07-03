"use client";

import { BirthDateSelect } from "@/components/k-saju/BirthDateSelect";
import { HumanPremiumFreePreviewReport } from "@/components/human-premium/HumanPremiumFreePreviewReport";
import { ReportGenerateLoader } from "@/components/human-premium/ReportGenerateLoader";
import { PrivacyConsent } from "@/components/legal/PrivacyConsent";
import { Link } from "@/i18n/navigation";
import { formatHumanPremiumError } from "@/lib/reports/human-premium/client-errors";
import type { HumanPremiumProfile } from "@/lib/reports/human-premium/cart-session";
import {
  REPORT_TYPE_SUBTITLES_EN,
  REPORT_TYPE_SUBTITLES_KO,
} from "@/lib/reports/human-premium/pricing";
import {
  REPORT_TYPE_LABELS,
  REPORT_TYPE_LABELS_EN,
  type HumanPremiumReportPayload,
} from "@/lib/reports/human-premium/types";
import {
  BIRTH_TIME_OPTIONS,
  getBirthTimeOptionLabel,
  parseBirthTimeSelect,
} from "@/lib/saju/birth-time-options";
import { COMMON_TIMEZONES } from "@/lib/saju/timezone";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

export function DayPillarPreview({
  profile,
  onPatchProfile,
}: {
  profile: HumanPremiumProfile;
  onPatchProfile: (partial: Partial<HumanPremiumProfile>) => void;
}) {
  const routeLocale = useLocale();
  const tNav = useTranslations("nav");
  const isKo = routeLocale === "ko";
  const dailyTitle = isKo ? REPORT_TYPE_LABELS.daily : REPORT_TYPE_LABELS_EN.daily;
  const dailySubtitles = isKo ? REPORT_TYPE_SUBTITLES_KO : REPORT_TYPE_SUBTITLES_EN;
  const dailySubtitle = isKo
    ? `무료 · ${dailySubtitles.daily}`
    : `Free · ${dailySubtitles.daily}`;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<HumanPremiumReportPayload | null>(null);

  function patchProfile(partial: Partial<HumanPremiumProfile>) {
    onPatchProfile(partial);
  }

  const calendarType = profile.calendarType === "lunar" ? "lunar" : "solar";

  const birthTimeUnknown = profile.birthTimeSelect === "unknown";
  const birthTime = useMemo(() => {
    if (birthTimeUnknown) return null;
    return parseBirthTimeSelect(profile.birthTimeSelect).birthTime;
  }, [profile.birthTimeSelect, birthTimeUnknown]);

  async function handleGenerate() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/human-premium/daily-routine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personName: profile.personName.trim() || (isKo ? "게스트" : "Guest"),
          email: profile.email.trim(),
          birthDate: profile.birthDate,
          birthTime,
          birthTimeUnknown,
          timezone: profile.timezone,
          calendarType,
          locale: routeLocale,
          privacyConsent: profile.privacyConsent,
          gender: profile.gender || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Report failed");
      setReport(data.report as HumanPremiumReportPayload);
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Report failed";
      setError(formatHumanPremiumError(raw, routeLocale as "ko" | "en"));
    } finally {
      setLoading(false);
    }
  }

  function resetReport() {
    setReport(null);
    setError(null);
  }

  if (report) {
    return (
      <div className="space-y-6">
        <HumanPremiumFreePreviewReport report={report} />
        <p className="text-center text-sm">
          <button
            type="button"
            className="font-semibold text-white underline"
            onClick={resetReport}
          >
            {isKo ? "다시 입력" : "Enter again"}
          </button>
        </p>
      </div>
    );
  }

  return (
    <>
      <ReportGenerateLoader isKo={isKo} active={loading} />
      <section className="human-premium-birth-card mx-auto w-full max-w-sm space-y-6 p-6 sm:max-w-md sm:p-8">
        <div className="text-center">
          <p className="human-premium-birth-eyebrow">
            {isKo ? "집사님의 사주" : "Butler birth chart"}
          </p>
          <h2 className="mt-2 text-2xl font-bold">
            {isKo ? "사주 정보 입력" : "Birth details"}
          </h2>
        </div>

        <div className="human-premium-birth-form-inner space-y-4">
          <label className="human-premium-birth-field">
            {isKo ? "닉네임" : "Nickname"}
            <input
              className="human-premium-birth-input"
              value={profile.personName}
              onChange={(e) => patchProfile({ personName: e.target.value })}
              placeholder={isKo ? "닉네임 입력" : "Your nickname"}
            />
            <span className="human-premium-birth-hint">
              {isKo
                ? "보안을 위해 닉네임으로 넣어주세요."
                : "For your privacy, please use a nickname."}
            </span>
          </label>
          <label className="human-premium-birth-field">
            {isKo ? "이메일 (선택)" : "Email (optional)"}
            <input
              type="email"
              className="human-premium-birth-input"
              value={profile.email}
              onChange={(e) => patchProfile({ email: e.target.value })}
              placeholder="you@email.com"
            />
            <span className="human-premium-birth-hint">
              {isKo
                ? "원하시면 이메일을 적어주세요. 입력 시 리포트 링크를 보내드려요."
                : "Optional — we'll email your report link if provided."}
            </span>
          </label>
          <BirthDateSelect
            value={profile.birthDate}
            onChange={(birthDate) => patchProfile({ birthDate })}
            label={isKo ? "생년월일" : "Birth date"}
            locale={routeLocale as "ko" | "en"}
            className="human-premium-birth-field"
            selectClassName="human-premium-birth-input"
          />
          <label className="human-premium-birth-field">
            {isKo ? "출생 시간" : "Birth time"}
            <select
              className="human-premium-birth-input"
              value={profile.birthTimeSelect}
              onChange={(e) => patchProfile({ birthTimeSelect: e.target.value })}
            >
              {BIRTH_TIME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {getBirthTimeOptionLabel(opt, routeLocale as "ko" | "en")}
                </option>
              ))}
            </select>
          </label>
          <fieldset className="human-premium-birth-calendar">
            <legend className="human-premium-birth-field">
              {isKo ? "양력 / 음력" : "Solar / Lunar"}
            </legend>
            <div className="mt-1 flex gap-3">
              <button
                type="button"
                onClick={() => patchProfile({ calendarType: "solar" })}
                className={`human-premium-birth-pill flex-1 ${
                  calendarType === "solar"
                    ? "human-premium-birth-pill--active"
                    : "human-premium-birth-pill--idle"
                }`}
                aria-pressed={calendarType === "solar"}
              >
                {isKo ? "양력" : "Solar"}
              </button>
              <button
                type="button"
                onClick={() => patchProfile({ calendarType: "lunar" })}
                className={`human-premium-birth-pill flex-1 ${
                  calendarType === "lunar"
                    ? "human-premium-birth-pill--active"
                    : "human-premium-birth-pill--idle"
                }`}
                aria-pressed={calendarType === "lunar"}
              >
                {isKo ? "음력" : "Lunar"}
              </button>
            </div>
          </fieldset>
          <label className="human-premium-birth-field">
            {isKo ? "타임존" : "Timezone"}
            <select
              className="human-premium-birth-input"
              value={profile.timezone}
              onChange={(e) => patchProfile({ timezone: e.target.value })}
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </label>
          <fieldset className="human-premium-birth-calendar">
            <legend className="human-premium-birth-field">
              {isKo ? "성별" : "Gender"}
            </legend>
            <div className="mt-1 flex gap-3">
              <button
                type="button"
                onClick={() => patchProfile({ gender: "male" })}
                className={`human-premium-birth-pill flex-1 ${
                  profile.gender === "male"
                    ? "human-premium-birth-pill--active"
                    : "human-premium-birth-pill--idle"
                }`}
                aria-pressed={profile.gender === "male"}
              >
                {isKo ? "남성" : "Male"}
              </button>
              <button
                type="button"
                onClick={() => patchProfile({ gender: "female" })}
                className={`human-premium-birth-pill flex-1 ${
                  profile.gender === "female"
                    ? "human-premium-birth-pill--active"
                    : "human-premium-birth-pill--idle"
                }`}
                aria-pressed={profile.gender === "female"}
              >
                {isKo ? "여성" : "Female"}
              </button>
            </div>
          </fieldset>
          <div className="human-premium-birth-consent">
            <PrivacyConsent
              checked={profile.privacyConsent}
              onChange={(privacyConsent) => patchProfile({ privacyConsent })}
              locale={routeLocale as "ko" | "en"}
              variant="card"
              audience="human"
            />
          </div>
          {error ? (
            <p
              role="alert"
              className="rounded-2xl border border-red-300/80 bg-red-50 px-4 py-3 text-sm font-medium text-red-900"
            >
              {error}
            </p>
          ) : null}
          <button
            type="button"
            disabled={!profile.birthDate || !profile.privacyConsent || loading}
            onClick={() => void handleGenerate()}
            className="human-premium-birth-submit human-premium-birth-submit--plan"
          >
            {!loading ? (
              <span className="human-premium-birth-submit-index" aria-hidden>
                1
              </span>
            ) : null}
            <span className="human-premium-birth-submit-body">
              {loading ? (
                isKo ? "생성 중…" : "Generating…"
              ) : (
                <>
                  <span className="human-premium-birth-submit-title">{dailyTitle}</span>
                  <span className="human-premium-birth-submit-sub">{dailySubtitle}</span>
                </>
              )}
            </span>
          </button>
        </div>

        <p className="text-center text-xs text-plum/60">
          <Link href="/saju" className="underline">
            {tNav("saju")}
          </Link>
        </p>
      </section>
    </>
  );
}
