"use client";

import type { PremiumReport } from "@/lib/saju/premium-report";
import { CharacterCard } from "./CharacterCard";

interface PremiumReportViewProps {
  report: PremiumReport;
  petName: string;
  demo?: boolean;
}

export function PremiumReportView({
  report,
  petName,
  demo = false,
}: PremiumReportViewProps) {
  const isKo = report.basic.locale === "ko";

  return (
    <div className="space-y-6">
      {demo && (
        <p className="rounded-2xl bg-gold/30 px-4 py-2 text-center text-sm text-plum">
          {isKo
            ? "데모 결제 모드 — PayPal 키 설정 시 실제 결제가 진행됩니다."
            : "Demo payment — configure PayPal keys for live checkout."}
        </p>
      )}

      <CharacterCard report={report} petName={petName} />

      <article className="pastel-card p-6">
        <h2 className="text-lg font-bold text-channel-saju">
          {report.lifetimeHeadline}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-plum/85">
          {report.lifetimeStory}
        </p>
      </article>

      <article className="pastel-card p-6">
        <h3 className="font-bold text-plum">
          {isKo ? "연간 테마" : "Yearly themes"}
        </h3>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-plum/80">
          {report.yearlyThemes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>

      <article className="pastel-card p-6">
        <h3 className="font-bold text-plum">
          {isKo ? "평생 케어 가이드" : "Lifetime care guide"}
        </h3>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-plum/80">
          {report.careGuide.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-plum/65">
          {isKo ? "럭키 컬러: " : "Lucky colors: "}
          {report.luckyColors.join(", ")}
        </p>
      </article>
    </div>
  );
}
