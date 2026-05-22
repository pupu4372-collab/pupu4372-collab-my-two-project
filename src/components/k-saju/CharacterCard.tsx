"use client";

import { ELEMENT_META } from "@/lib/saju/elements";
import type { PremiumReport } from "@/lib/saju/premium-report";

interface CharacterCardProps {
  report: PremiumReport;
  petName: string;
}

export function CharacterCard({ report, petName }: CharacterCardProps) {
  const el = ELEMENT_META[report.basic.dominantElement];
  const isKo = report.basic.locale === "ko";

  return (
    <div className="mx-auto max-w-sm overflow-hidden rounded-3xl border-2 border-channel-saju/30 bg-gradient-to-br from-lavender/60 via-petal/40 to-mint/40 p-6 shadow-lg">
      <p className="text-center text-xs font-medium uppercase tracking-widest text-plum/50">
        Cosmic Paws · K-Saju
      </p>
      <h3 className="mt-2 text-center text-xl font-bold text-plum">
        {report.characterTitle}
      </h3>
      <p className="text-center text-sm text-plum/70">{petName}</p>

      <div className="my-5 flex justify-center gap-2 text-3xl" aria-hidden>
        <span>{el.hanja}</span>
        <span className="text-plum/40">·</span>
        <span className="text-lg font-semibold text-channel-saju">
          {el.meaning}
        </span>
      </div>

      <p className="text-center text-sm leading-relaxed text-plum/80">
        {report.basic.headline}
      </p>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {report.basic.traits.map((t) => (
          <span
            key={t}
            className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-medium text-plum"
          >
            {t}
          </span>
        ))}
      </div>

      <p className="mt-5 text-center text-xs text-plum/55">
        {isKo ? "공유용 캐릭터 카드" : "Shareable character card"}
      </p>
    </div>
  );
}
