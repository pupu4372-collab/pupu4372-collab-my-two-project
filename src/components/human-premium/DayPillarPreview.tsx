"use client";

import { BirthDateSelect } from "@/components/k-saju/BirthDateSelect";
import { PrivacyConsent } from "@/components/legal/PrivacyConsent";
import { Link } from "@/i18n/navigation";
import { formatHumanPremiumError } from "@/lib/reports/human-premium/client-errors";
import type { DayPillarFreeFullView } from "@/lib/reports/human-premium/content";
import {
  BIRTH_TIME_OPTIONS,
  getBirthTimeOptionLabel,
  parseBirthTimeSelect,
} from "@/lib/saju/birth-time-options";
import { COMMON_TIMEZONES } from "@/lib/saju/timezone";
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
  fullView: DayPillarFreeFullView;
}

export function DayPillarPreview() {
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
  const [showFullResult, setShowFullResult] = useState(false);

  const birthTimeUnknown = birthTimeSelect === "unknown";
  const birthTime = useMemo(() => {
    if (birthTimeUnknown) return null;
    return parseBirthTimeSelect(birthTimeSelect).birthTime;
  }, [birthTimeSelect, birthTimeUnknown]);

  async function handlePreview() {
    setError(null);
    setShowFullResult(false);
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

  function resetPreview() {
    setPreview(null);
    setShowFullResult(false);
    setError(null);
  }

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

          {!showFullResult ? (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowFullResult(true)}
                className="rounded-full bg-channel-saju px-6 py-3 font-bold text-white shadow-lg transition hover:brightness-110"
              >
                {isKo ? "일주분석 보기" : "View day-pillar analysis"}
              </button>
              <p className="mt-3 text-xs text-plum/70">
                {isKo
                  ? "만세력·오행·일주 해석을 무료로 펼쳐봅니다."
                  : "Open your free pillars, elements, and day-master reading."}
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <header className="text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-channel-saju">
                  {preview.fullView.analysisModeLabel}
                </p>
                <h3 className="mt-2 text-lg font-bold text-ink">{preview.fullView.headline}</h3>
              </header>

              <div className="grid gap-3 sm:grid-cols-2">
                {preview.fullView.pillars.map((row) => (
                  <article
                    key={row.slot}
                    className="rounded-2xl border border-plum/10 bg-white/70 p-4"
                  >
                    <p className="text-xs font-semibold text-channel-saju">{row.label}</p>
                    <p className="mt-1 text-2xl font-bold text-ink">{row.pillar}</p>
                    <p className="mt-1 text-sm text-plum/80">{row.detail}</p>
                  </article>
                ))}
              </div>

              <section className="rounded-2xl border border-plum/10 bg-cream/60 p-4">
                <h4 className="font-semibold text-ink">
                  {isKo ? "오행 분포" : "Element balance"}
                </h4>
                <ul className="mt-3 space-y-2">
                  {preview.fullView.elements.map((item) => (
                    <li key={item.label}>
                      <div className="mb-1 flex justify-between text-xs text-plum/80">
                        <span>{item.label}</span>
                        <span>{item.percent}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/80">
                        <div
                          className="h-full rounded-full bg-channel-saju/80"
                          style={{ width: `${Math.max(item.percent, 4)}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-2xl border border-plum/10 bg-white/70 p-5">
                <h4 className="font-semibold text-ink">
                  {isKo ? "일주 · 사주 구조 해석" : "Day pillar · chart structure"}
                </h4>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink/90">
                  {preview.fullView.structureBody}
                </p>
              </section>

              <p className="text-center text-xs text-plum/65">
                {isKo
                  ? "점수·기회·리스크·로드맵 등 심층 리포트는 아래 프리미엄 상품에서 확인할 수 있어요."
                  : "Scores, opportunities, risks, and roadmap live in the premium reports below."}
              </p>
            </div>
          )}

          <p className="text-center text-sm">
            <button
              type="button"
              className="font-semibold text-channel-saju underline"
              onClick={resetPreview}
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
