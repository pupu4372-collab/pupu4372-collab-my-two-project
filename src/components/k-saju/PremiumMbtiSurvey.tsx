"use client";

import { PET_MBTI_QUESTIONS } from "@/lib/pet/mbti-inference";

interface PremiumMbtiSurveyProps {
  locale: "ko" | "en";
  answers: Record<string, string>;
  onSelect: (questionId: string, optionId: string) => void;
}

export function PremiumMbtiSurvey({ locale, answers, onSelect }: PremiumMbtiSurveyProps) {
  const isKo = locale === "ko";
  const answered = Object.keys(answers).length;

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-on-surface-variant">
        {isKo
          ? "15문항을 모두 선택하면 상세 MBTI 리포트를 볼 수 있어요."
          : "Answer all 15 questions to unlock your detailed MBTI report."}
      </p>
      <p className="text-xs font-semibold text-channel-saju">
        {isKo ? `${answered} / ${PET_MBTI_QUESTIONS.length} 완료` : `${answered} / ${PET_MBTI_QUESTIONS.length} done`}
      </p>
      {PET_MBTI_QUESTIONS.map((question, index) => (
        <article
          key={question.id}
          className="rounded-[2rem] border border-channel-saju/15 bg-white p-5 shadow-sm"
        >
          <p className="text-xs font-semibold text-channel-saju">Q{index + 1}</p>
          <h3 className="mt-1 text-sm font-bold text-primary">
            {isKo ? question.promptKo : question.promptEn}
          </h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {question.options.map((option) => {
              const selected = answers[question.id] === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onSelect(question.id, option.id)}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                    selected
                      ? "border-channel-saju bg-channel-saju/10 font-semibold text-primary"
                      : "border-plum/15 bg-sand/30 text-plum hover:border-channel-saju/40"
                  }`}
                >
                  {isKo ? option.labelKo : option.labelEn}
                </button>
              );
            })}
          </div>
        </article>
      ))}
    </div>
  );
}
