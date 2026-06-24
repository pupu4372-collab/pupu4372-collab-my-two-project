"use client";

import { useEffect, useState } from "react";

const KO_MESSAGES = [
  "만세력을 펼치는 중…",
  "사주 구조를 읽는 중…",
  "오행 균형을 계산하는 중…",
  "십성과 대운을 정리하는 중…",
  "리포트 문장을 짜는 중…",
  "거의 다 됐어요…",
];

const EN_MESSAGES = [
  "Opening your chart…",
  "Reading pillar structure…",
  "Balancing the five elements…",
  "Mapping ten gods and cycles…",
  "Writing your report…",
  "Almost ready…",
];

export function ReportGenerateLoader({
  isKo,
  active,
}: {
  isKo: boolean;
  active: boolean;
}) {
  const messages = isKo ? KO_MESSAGES : EN_MESSAGES;
  const [progress, setProgress] = useState(8);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!active) {
      setProgress(8);
      setMessageIndex(0);
      return;
    }

    const progressTimer = window.setInterval(() => {
      setProgress((value) => {
        if (value >= 92) return value;
        const bump = value < 40 ? 6 : value < 70 ? 4 : 2;
        return Math.min(92, value + bump);
      });
    }, 1400);

    const messageTimer = window.setInterval(() => {
      setMessageIndex((index) => (index + 1) % messages.length);
    }, 2800);

    return () => {
      window.clearInterval(progressTimer);
      window.clearInterval(messageTimer);
    };
  }, [active, messages.length]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#1a1030]/72 px-6 backdrop-blur-md">
      <div className="w-full max-w-md rounded-[2rem] border border-white/20 bg-white/95 p-8 text-center shadow-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-channel-saju">
          {isKo ? "K-Saju Premium" : "K-Saju Premium"}
        </p>
        <h2 className="mt-3 text-xl font-bold text-ink">
          {isKo ? "리포트를 생성하고 있어요" : "Generating your report"}
        </h2>
        <p className="mt-3 min-h-[3rem] text-sm leading-relaxed text-plum/80 transition-opacity duration-500">
          {messages[messageIndex]}
        </p>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-lavender/50">
          <div
            className="h-full rounded-full bg-gradient-to-r from-channel-saju to-plum transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-plum/55">
          {isKo ? "보통 1~2분 정도 걸려요" : "Usually takes 1–2 minutes"}
        </p>
      </div>
    </div>
  );
}
