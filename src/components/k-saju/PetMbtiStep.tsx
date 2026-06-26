"use client";

import type { MbtiAnswerMap } from "@/lib/pet/calc-mbti";
import { isMbtiComplete } from "@/lib/pet/calc-mbti";
import type { MbtiQuestion } from "@/lib/pet/mbti-questions";

interface PetMbtiStepProps {
  petName: string;
  questions: MbtiQuestion[];
  answers: MbtiAnswerMap;
  onAnswer: (questionId: string, value: 0 | 1) => void;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
  locale: "ko" | "en";
}

const UI = {
  ko: {
    heading: (name: string) => `${name}의 성격을 알아볼게요`,
    subheading: "가장 가까운 행동을 골라주세요",
    progress: (current: number, total: number) => `${current} / ${total}`,
    back: "← 이전",
    submit: "결과 보기",
    loading: "분석 중...",
    incomplete: "모든 문항에 답해주세요",
  },
  en: {
    heading: (name: string) => `Let's explore ${name}'s personality`,
    subheading: "Choose the behaviour that fits best",
    progress: (current: number, total: number) => `${current} / ${total}`,
    back: "← Back",
    submit: "See results",
    loading: "Analysing...",
    incomplete: "Please answer all questions",
  },
};

export function PetMbtiStep({
  petName,
  questions,
  answers,
  onAnswer,
  onBack,
  onSubmit,
  loading,
  locale,
}: PetMbtiStepProps) {
  const t = UI[locale];
  const answeredCount = Object.keys(answers).length;
  const complete = isMbtiComplete(answers, questions);
  const progress = Math.round((answeredCount / questions.length) * 100);

  return (
    <div className="space-y-6 pb-28 md:pb-10">
      <section className="rounded-[2rem] bg-surface px-6 py-8 shadow-sm md:px-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-primary md:text-4xl">
          {t.heading(petName)}
        </h2>
        <p className="mt-3 text-sm leading-7 text-on-surface-variant">
          {t.subheading}
        </p>
        <div className="mt-5 space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-outline">
            <span>{t.progress(answeredCount, questions.length)}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </section>

      <div className="space-y-4">
        {questions.map((q, idx) => {
          const selected = answers[q.id];
          return (
            <section
              key={q.id}
              className="rounded-[2rem] bg-white p-6 shadow-sm"
            >
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-outline">
                Q{idx + 1}
              </p>
              <p className="mt-2 text-base font-extrabold text-primary">
                {q.question}
              </p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {([q.optionA, q.optionB] as const).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onAnswer(q.id, opt.value)}
                    className={
                      selected === opt.value
                        ? "rounded-2xl border-2 border-primary bg-primary/10 px-4 py-3.5 text-left text-sm font-semibold text-primary shadow-sm transition"
                        : "rounded-2xl border-2 border-surface-container bg-white px-4 py-3.5 text-left text-sm font-semibold text-on-surface-variant transition hover:border-primary/30 hover:bg-surface-container-low"
                    }
                    aria-pressed={selected === opt.value}
                  >
                    <span className="mr-2 text-base">
                      {opt.value === 0 ? "🅐" : "🅑"}
                    </span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="space-y-3">
        {!complete && answeredCount > 0 && (
          <p className="text-center text-xs text-outline">{t.incomplete}</p>
        )}
        <button
          type="button"
          onClick={onSubmit}
          disabled={!complete || loading}
          className="mt-2 flex w-full items-center justify-center rounded-full bg-[#6f4b8b] px-8 py-4 text-base font-extrabold text-white shadow-xl shadow-[#6f4b8b]/25 transition hover:bg-[#5f3f78] active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? t.loading : t.submit}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="w-full rounded-full py-3 text-sm font-semibold text-on-surface-variant transition hover:text-primary"
        >
          {t.back}
        </button>
      </div>
    </div>
  );
}
