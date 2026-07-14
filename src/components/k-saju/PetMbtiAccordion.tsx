"use client";

import type { MbtiAnswerMap } from "@/lib/pet/calc-mbti";
import { isMbtiComplete } from "@/lib/pet/calc-mbti";
import type { MbtiAxis, MbtiQuestion } from "@/lib/pet/mbti-questions";
import { useState } from "react";

interface PetMbtiAccordionProps {
  species: string;
  questions: MbtiQuestion[];
  answers: MbtiAnswerMap;
  onAnswer: (questionId: string, value: 0 | 1) => void;
  locale: "ko" | "en";
}

const UI = {
  ko: {
    title: "MBTI테스트(선택)",
    hint: "설문을 작성하시면 MBTI유형을 알려드립니다.",
    languageNote: "결과 리포트는 현재 언어(한국어)로 생성됩니다.",
    complete: "✓ 완료",
    axis: {
      EI: "에너지",
      SN: "인식",
      TF: "결정",
      JP: "생활",
    },
  },
  en: {
    title: "MBTI test (optional)",
    hint: "Complete the survey to see your pet's MBTI type.",
    languageNote: "Your report will be generated in the current language (English).",
    complete: "✓ Done",
    axis: {
      EI: "Energy",
      SN: "Focus",
      TF: "Style",
      JP: "Routine",
    },
  },
};

/** 축별 포인트 색 — 카드 배경은 공통, 여기만 살짝 구분 */
const AXIS_ACCENT: Record<
  MbtiAxis,
  { dot: string; badge: string; selected: string }
> = {
  EI: {
    dot: "bg-[#7FB8B0]",
    badge: "text-[#3D7A6E]",
    selected: "border-[#7FB8B0] bg-element-wood",
  },
  SN: {
    dot: "bg-[#E6C994]",
    badge: "text-[#8A6B3A]",
    selected: "border-[#E6C994] bg-element-earth",
  },
  TF: {
    dot: "bg-[#F28C82]",
    badge: "text-[#A64B42]",
    selected: "border-[#F28C82] bg-element-fire",
  },
  JP: {
    dot: "bg-[#7BAFD4]",
    badge: "text-[#3E6B8A]",
    selected: "border-[#7BAFD4] bg-element-water",
  },
};

const AXIS_ORDER: MbtiAxis[] = ["EI", "SN", "TF", "JP"];

const OPTION_IDLE =
  "border border-surface-container bg-surface-container-low text-on-surface-variant hover:border-primary/20";

export function PetMbtiAccordion({
  questions,
  answers,
  onAnswer,
  locale,
}: PetMbtiAccordionProps) {
  const [open, setOpen] = useState(false);
  const t = UI[locale];

  const answeredCount = Object.keys(answers).length;
  const total = questions.length;
  const complete = isMbtiComplete(answers, questions);
  const progress = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

  return (
    <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition hover:bg-surface-container-low/50"
      >
        <div className="space-y-2">
          <span className="text-sm font-extrabold text-primary">{t.title}</span>
          <div className="flex gap-1.5">
            {AXIS_ORDER.map((axis) => (
              <span
                key={axis}
                className={`h-2 w-2 rounded-full ${AXIS_ACCENT[axis].dot}`}
                aria-hidden
              />
            ))}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {complete ? (
            <span className="rounded-full bg-surface-container px-2.5 py-1 text-xs font-bold text-mok-green">
              {t.complete}
            </span>
          ) : (
            <span className="rounded-full bg-surface-container px-2.5 py-1 text-xs font-bold text-plum">
              {answeredCount} / {total}
            </span>
          )}
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full bg-surface-container text-xs text-plum transition ${
              open ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </div>
      </button>

      {!complete && (
        <div className="border-t border-surface-container px-6 py-3">
          <p className="text-xs leading-5 text-on-surface-variant">{t.hint}</p>
          <p className="mt-1.5 text-xs leading-5 text-on-surface-variant">{t.languageNote}</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-container">
            <div
              className="h-full rounded-full bg-primary/50 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div
        className={`transition-all duration-300 ease-in-out ${
          open ? "max-h-[9999px] opacity-100" : "max-h-0 overflow-hidden opacity-0"
        }`}
      >
        <div className="space-y-3 border-t border-surface-container px-4 pb-5 pt-4 sm:px-6 sm:pb-6">
          {questions.map((q, idx) => {
            const selected = answers[q.id];
            const accent = AXIS_ACCENT[q.axis];
            return (
              <section
                key={q.id}
                className="rounded-2xl border border-surface-container bg-surface-container-low/40 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-extrabold text-primary">
                    Q{idx + 1}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold ${accent.badge}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
                    {t.axis[q.axis]}
                  </span>
                </div>
                <p className="mt-2 text-sm font-extrabold leading-6 text-primary">
                  {q.question}
                </p>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {([q.optionA, q.optionB] as const).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => onAnswer(q.id, opt.value)}
                      className={`rounded-xl border-2 px-3 py-3 text-left text-sm font-semibold transition ${
                        selected === opt.value
                          ? `${accent.selected} text-primary shadow-sm`
                          : OPTION_IDLE
                      }`}
                      aria-pressed={selected === opt.value}
                    >
                      <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-extrabold text-plum">
                        {opt.value === 0 ? "A" : "B"}
                      </span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
