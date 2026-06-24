"use client";

import { BirthDateSelect } from "@/components/k-saju/BirthDateSelect";
import { PrivacyConsent } from "@/components/legal/PrivacyConsent";
import { Link } from "@/i18n/navigation";
import {
  BIRTH_TIME_OPTIONS,
  getBirthTimeOptionLabel,
  parseBirthTimeSelect,
} from "@/lib/saju/birth-time-options";
import { COMMON_TIMEZONES } from "@/lib/saju/timezone";
import { formatHumanPremiumError } from "@/lib/reports/human-premium/client-errors";
import type { ReportType } from "@/lib/reports/human-premium/types";
import { useLocale } from "next-intl";
import { useMemo, useState } from "react";

interface DayPillarPreviewData {
  dayPillar: string;
  dayStem: string;
  dayBranch: string;
  dayPillarNickname: string;
  dominantElement: string;
  story: string;
  traits: string[];
  analysisMode: "three_pillars" | "four_pillars";
}

interface DayPillarPreviewProps {
  onViewFull: (reportType: ReportType) => void;
}

const BLUR_SECTIONS_KO = [
  { title: "핵심 운세 지표", hint: "6개 영역 점수" },
  { title: "심층 분석", hint: "마스터 내러티브" },
  { title: "포착할 기회", hint: "5가지 기회" },
];

const BLUR_SECTIONS_EN = [
  { title: "Key indicators", hint: "Six domain scores" },
  { title: "Deep analysis", hint: "Master narrative" },
  { title: "Opportunities", hint: "Five openings" },
];

export function DayPillarPreview({ onViewFull }: DayPillarPreviewProps) {
  const routeLocale = useLocale();
  const isKo = routeLocale === "ko";
  const [personName, setPersonName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTimeSelect, setBirthTimeSelect] = useState("unknown");
  const [timezone, setTimezone] = useState("Asia/Seoul");
  const [calendarType, setCalendarType] = useState<"solar" | "lunar">("solar");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<DayPillarPreviewData | null>(null);

  const birthTimeUnknown = birthTimeSelect === "unknown";
  const birthTime = useMemo(() => {
    if (birthTimeUnknown) return null;
    return parseBirthTimeSelect(birthTimeSelect).birthTime;
  }, [birthTimeSelect, birthTimeUnknown]);

  async function handlePreview() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/human-premium/day-pillar-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personName: personName.trim() || (isKo ? "게스트" : "Guest"),
          email: "preview@ksajupet.local",
          birthDate,
          birthTime,
          birthTimeUnknown,
          timezone,
          calendarType,
          locale: routeLocale,
          privacyConsent,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Preview failed");
      setPreview(data as DayPillarPreviewData);
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Preview failed";
      setError(formatHumanPremiumError(raw, routeLocale as "ko" | "en"));
    } finally {
      setLoading(false);
    }
  }

  const blurSections = isKo ? BLUR_SECTIONS_KO : BLUR_SECTIONS_EN;

  return (
    <section className="pastel-card space-y-6 p-6 sm:p-8">
      <div className="text-center">
        <p className="text-sm font-semibold text-channel-saju">
          {isKo ? "무료 맛보기" : "Free preview"}
        </p>
        <h2 className="mt-2 text-2xl font-bold text-ink">
          {isKo ? "일주 분석 무료로 보기" : "Free day-pillar reading"}
        </h2>
        <p className="mt-2 text-sm text-plum/80">
          {isKo
            ? "생년월일만 입력하면 일주(日柱)와 오행 기질을 먼저 확인할 수 있어요."
            : "Enter your birth date to preview your day pillar and element tone."}
        </p>
      </div>

      {!preview ? (
        <div className="mx-auto max-w-lg space-y-4">
          <label className="block text-sm font-medium text-ink">
            {isKo ? "이름" : "Name"}
            <input
              className="pastel-input mt-1 w-full"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder={isKo ? "홍길동" : "Alex"}
            />
          </label>
          <BirthDateSelect
            value={birthDate}
            onChange={setBirthDate}
            label={isKo ? "생년월일" : "Birth date"}
            locale={routeLocale as "ko" | "en"}
          />
          <label className="block text-sm font-medium text-ink">
            {isKo ? "출생 시간" : "Birth time"}
            <select
              className="pastel-input mt-1 w-full"
              value={birthTimeSelect}
              onChange={(e) => setBirthTimeSelect(e.target.value)}
            >
              {BIRTH_TIME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {getBirthTimeOptionLabel(opt, routeLocale as "ko" | "en")}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-ink">
            {isKo ? "타임존" : "Timezone"}
            <select
              className="pastel-input mt-1 w-full"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </label>
          <div className="flex gap-3 text-sm">
            <button
              type="button"
              onClick={() => setCalendarType("solar")}
              className={`rounded-full px-4 py-2 font-semibold ${
                calendarType === "solar"
                  ? "bg-channel-saju text-white"
                  : "bg-cream text-plum"
              }`}
            >
              {isKo ? "양력" : "Solar"}
            </button>
            <button
              type="button"
              onClick={() => setCalendarType("lunar")}
              className={`rounded-full px-4 py-2 font-semibold ${
                calendarType === "lunar"
                  ? "bg-channel-saju text-white"
                  : "bg-cream text-plum"
              }`}
            >
              {isKo ? "음력" : "Lunar"}
            </button>
          </div>
          <PrivacyConsent
            checked={privacyConsent}
            onChange={setPrivacyConsent}
            locale={routeLocale as "ko" | "en"}
            variant="pastel"
            audience="human"
          />
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
            disabled={!birthDate || !privacyConsent || loading}
            onClick={handlePreview}
            className="w-full rounded-full bg-channel-saju py-3 font-bold text-white disabled:opacity-50"
          >
            {loading
              ? isKo
                ? "분석 중…"
                : "Analyzing…"
              : isKo
                ? "일주 분석 무료로 보기 →"
                : "See free day-pillar reading →"}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <article className="rounded-3xl border border-channel-saju/20 bg-lavender/30 p-6 text-center">
            <p className="text-sm font-semibold text-channel-saju">{preview.dayPillarNickname}</p>
            <p className="mt-2 text-3xl font-bold text-ink">{preview.dayPillar}</p>
            <p className="mt-1 text-plum">
              {preview.dayStem} · {preview.dayBranch}
            </p>
            <p className="mt-3 text-sm text-plum/80">
              {isKo ? "주도 오행" : "Dominant element"}: {preview.dominantElement}
            </p>
            <p className="mt-4 text-left text-sm leading-relaxed text-ink/90">{preview.story}</p>
            {preview.traits.length > 0 ? (
              <ul className="mt-3 flex flex-wrap justify-center gap-2">
                {preview.traits.map((trait) => (
                  <li
                    key={trait}
                    className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-plum"
                  >
                    {trait}
                  </li>
                ))}
              </ul>
            ) : null}
          </article>

          <div className="relative space-y-3">
            {blurSections.map((section) => (
              <div
                key={section.title}
                className="select-none rounded-2xl border border-plum/10 bg-cream/60 p-4 blur-[3px]"
                aria-hidden
              >
                <p className="font-semibold text-ink">{section.title}</p>
                <p className="text-sm text-plum/70">{section.hint}</p>
                <div className="mt-2 h-10 rounded-lg bg-plum/5" />
              </div>
            ))}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                type="button"
                onClick={() => onViewFull("lifetime")}
                className="rounded-full bg-channel-saju px-6 py-3 font-bold text-white shadow-lg"
              >
                {isKo ? "전체 분석 보기" : "View full analysis"}
              </button>
            </div>
          </div>

          <p className="text-center text-sm">
            <button
              type="button"
              className="font-semibold text-channel-saju underline"
              onClick={() => setPreview(null)}
            >
              {isKo ? "다시 입력" : "Enter again"}
            </button>
          </p>
        </div>
      )}

      <p className="text-center text-xs text-plum/60">
        {isKo ? "운세는 재미로만 보세요~" : "For entertainment only."}{" "}
        <Link href="/saju" className="underline">
          {isKo ? "댕냥사주 홈" : "K-Saju home"}
        </Link>
      </p>
    </section>
  );
}
