"use client";

import type { HumanPremiumReportPayload } from "@/lib/reports/human-premium/types";
import {
  DEFAULT_REPORT_TYPE,
  REPORT_TYPE_LABELS,
  REPORT_TYPE_LABELS_EN,
} from "@/lib/reports/human-premium/types";
import html2canvas from "html2canvas";
import { useRef, useState } from "react";
import { dayPillarNickname, firstProphecyLine } from "./report-helpers";
import { ScoreBar } from "./report-ui";

interface InstaCardProps {
  report: HumanPremiumReportPayload;
  isKo: boolean;
}

export function InstaCard({ report, isKo }: InstaCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reportTypeKey = report.reportType ?? DEFAULT_REPORT_TYPE;
  const typeLabel = isKo
    ? REPORT_TYPE_LABELS[reportTypeKey]
    : REPORT_TYPE_LABELS_EN[reportTypeKey];
  const nickname = dayPillarNickname(report, isKo);
  const scores = report.structured?.scores ?? [];
  const overall =
    scores.find((item) => item.label === (isKo ? "종합운" : "Overall")) ??
    scores[scores.length - 1];
  const miniScores = scores.filter((item) => item.label !== (isKo ? "종합운" : "Overall")).slice(0, 3);
  const prophecyLine = firstProphecyLine(report.structured?.prophecy?.short ?? "");

  async function downloadCard() {
    if (!cardRef.current) return;
    setBusy(true);
    setError(null);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#f4f1ea",
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `ksajupet-${report.personName}-card.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      setError(isKo ? "카드 저장에 실패했습니다." : "Card download failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="no-print space-y-4">
      <div className="mx-auto w-full max-w-sm">
        <div
          ref={cardRef}
          className="aspect-square w-full rounded-2xl border border-[var(--jig-ink)]/10 bg-[#f4f1ea] p-6 shadow-sm"
        >
          <div className="flex h-full flex-col justify-between">
            <div>
              <p className="human-premium-label-caps text-[var(--jig-seal)]">{typeLabel}</p>
              <h3 className="human-premium-serif mt-2 text-2xl font-bold text-[var(--jig-ink)]">
                {nickname}
              </h3>
              {overall ? (
                <div className="mt-6">
                  <div className="flex items-end justify-between">
                    <span className="text-sm font-medium text-[var(--jig-muted)]">
                      {overall.label}
                    </span>
                    <span className="text-4xl font-bold tabular-nums text-[var(--jig-seal)]">
                      {overall.score}
                    </span>
                  </div>
                  <ScoreBar score={overall.score} />
                </div>
              ) : null}
              <div className="mt-6 space-y-3">
                {miniScores.map((item) => (
                  <div key={item.label}>
                    <div className="mb-1 flex justify-between text-xs font-medium">
                      <span>{item.label}</span>
                      <span>{item.score}</span>
                    </div>
                    <ScoreBar score={item.score} color="var(--jig-obang-blue)" />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="human-premium-serif text-sm italic leading-relaxed text-[var(--jig-ink)]/85">
                {prophecyLine}
              </p>
              <p className="mt-4 text-right text-xs font-semibold tracking-wide text-[var(--jig-muted)]">
                #ksajupet
              </p>
            </div>
          </div>
        </div>
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={() => void downloadCard()}
        className="human-premium-share-btn human-premium-share-btn--link mx-auto w-full max-w-sm disabled:opacity-60"
      >
        {busy ? "…" : isKo ? "인스타 카드 저장" : "Save Instagram card"}
      </button>
      {error ? <p className="text-center text-xs text-[var(--jig-seal)]">{error}</p> : null}
    </section>
  );
}
