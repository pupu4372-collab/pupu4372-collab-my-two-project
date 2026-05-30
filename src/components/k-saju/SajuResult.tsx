"use client";

import { AdSlot } from "@/components/ads/AdSlot";
import { formatJijiDisplay } from "@/lib/saju/jiji-hours";
import { ELEMENT_META } from "@/lib/saju/elements";
import type { SajuBasicResponse } from "@/lib/saju/types";
import { formatUtcForDisplay } from "@/lib/saju/timezone";

interface SajuResultProps {
  result: SajuBasicResponse;
  variant?: "default" | "pastel";
}

const LABELS = {
  en: {
    pillars: "Four Pillars",
    year: "Year",
    month: "Month",
    day: "Day",
    hour: "Hour",
    unknown: "Unknown (excluded)",
    elements: "Element mix",
    traits: "Vibe check",
    stored: "Stored birth time",
    savedDb: "Saved to your pet profile",
    saveFailed: "Could not save (check Supabase Auth)",
    notSaved: "Sign in or enable anonymous auth to save",
    kstHour: "KST double-hour (12 branches)",
    kstAt: "Birth time in KST",
    kstWindow: "KST window",
  },
  ko: {
    pillars: "사주 네 기둥",
    year: "년",
    month: "월",
    day: "일",
    hour: "시",
    unknown: "모름 (제외)",
    elements: "오행 밸런스",
    traits: "성향 키워드",
    stored: "저장된 출생 시간",
    savedDb: "반려동물 프로필에 저장됨",
    saveFailed: "저장 실패 (Supabase Auth 확인)",
    notSaved: "익명 로그인 활성화 시 자동 저장",
    kstHour: "KST 12지지 (시간대)",
    kstAt: "한국 표준시 기준",
    kstWindow: "KST 구간",
  },
};

function PillarRow({
  label,
  pillar,
  pastel,
}: {
  label: string;
  pillar: SajuBasicResponse["pillars"]["year"];
  pastel: boolean;
}) {
  return (
    <div
      className={
        pastel
          ? "flex items-center justify-between rounded-2xl bg-lavender/20 px-3 py-2 text-sm"
          : "flex items-center justify-between rounded-xl bg-sand/50 px-3 py-2 text-sm"
      }
    >
      <span className={pastel ? "text-plum/60" : "text-ink/60"}>{label}</span>
      <div className="text-right">
        <span className="font-medium text-plum">{pillar.pillar}</span>
        <p className={pastel ? "text-xs text-plum/55" : "text-xs text-ink/55"}>
          {pillar.stemLabel} · {pillar.branchLabel}
        </p>
      </div>
    </div>
  );
}

export function SajuResult({ result, variant = "default" }: SajuResultProps) {
  const t = LABELS[result.locale];
  const pastel = variant === "pastel";
  const card = pastel ? "pastel-card overflow-hidden" : "oriental-card overflow-hidden";
  const section = pastel ? "pastel-card space-y-2 p-4" : "oriental-card space-y-2 p-4";
  const heroBg = pastel
    ? "bg-gradient-to-r from-lavender/50 via-petal/40 to-mint/40 px-5 py-4"
    : "bg-gradient-to-r from-blush/60 to-sage/50 px-5 py-4";

  const saveBanner = result.persisted
    ? t.savedDb
    : result.persistError
      ? `${t.saveFailed}: ${result.persistError}`
      : result.persisted === false
        ? t.notSaved
        : null;

  return (
    <div className="space-y-4">
      {saveBanner && (
        <p
          className={
            result.persisted
              ? "rounded-2xl bg-mint/30 px-4 py-2 text-sm font-medium text-plum"
              : "rounded-2xl bg-petal/40 px-4 py-2 text-sm text-plum/80"
          }
          role="status"
        >
          {result.persisted ? "🐾 " : ""}
          {saveBanner}
          {result.petId && (
            <span className="mt-1 block text-xs opacity-70">
              pet: {result.petId.slice(0, 8)}…
            </span>
          )}
        </p>
      )}
      <article className={card}>
        <div className={heroBg}>
          <h2 className="text-xl font-semibold leading-snug text-plum">{result.headline}</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-plum/80">
            {result.story}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 px-5 py-3">
          {result.traits.map((trait) => (
            <span
              key={trait}
              className="rounded-full bg-mint/35 px-3 py-1 text-xs font-medium text-plum"
            >
              {trait}
            </span>
          ))}
        </div>
      </article>

      <section className={section}>
        <h3 className="text-sm font-semibold text-plum/70">{t.pillars}</h3>
        <PillarRow label={t.year} pillar={result.pillars.year} pastel={pastel} />
        <PillarRow label={t.month} pillar={result.pillars.month} pastel={pastel} />
        <PillarRow label={t.day} pillar={result.pillars.day} pastel={pastel} />
        {result.pillars.hour ? (
          <PillarRow label={t.hour} pillar={result.pillars.hour} pastel={pastel} />
        ) : (
          <p className="text-xs text-plum/50">{t.hour}: {t.unknown}</p>
        )}
        {result.kstJiji && (
          <div className="mt-2 rounded-2xl border border-mint/40 bg-mint/20 px-3 py-3 text-sm">
            <p className="text-xs font-medium text-plum/55">{t.kstHour}</p>
            <p className="mt-1 font-medium text-plum">
              {formatJijiDisplay(result.kstJiji, result.locale)}
            </p>
            <p className="mt-1 text-xs text-plum/55">
              {t.kstAt}: {result.kstJiji.kstTime} (KST) · {t.kstWindow}: {result.kstJiji.kstRange}
            </p>
            <p className="mt-1 text-xs text-plum/50">
              {ELEMENT_META[result.kstJiji.element].hanja}{" "}
              {ELEMENT_META[result.kstJiji.element].meaning} ·{" "}
              {ELEMENT_META[result.kstJiji.element].hangul}
            </p>
          </div>
        )}
        <p className="pt-1 text-xs text-plum/45">
          {t.stored}: {formatUtcForDisplay(result.birthUtc, result.timezone)} ({result.timezone})
        </p>
      </section>

      <section className={pastel ? "pastel-card p-4" : "oriental-card p-4"}>
        <h3 className="mb-3 text-sm font-semibold text-plum/70">{t.elements}</h3>
        <div className="flex flex-wrap gap-2">
          {result.elements.map((el) => (
            <div
              key={el.key}
              className="rounded-2xl border border-lavender/50 bg-white/80 px-3 py-2 text-center"
            >
              <p className="text-lg font-semibold text-plum">
                {el.hanja}{" "}
                <span className="text-sm font-normal text-plum/60">
                  {el.meaning} · {el.hangul}
                </span>
              </p>
              <p className="text-xs text-plum/50">×{el.count}</p>
            </div>
          ))}
        </div>
      </section>

      <AdSlot />
    </div>
  );
}
