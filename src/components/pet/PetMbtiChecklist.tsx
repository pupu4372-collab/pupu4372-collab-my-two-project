"use client";

import { Link } from "@/i18n/navigation";
import {
  buildPetMbtiPremiumInsight,
  buildPetMbtiResult,
  isPetMbtiComplete,
  PET_MBTI_PREMIUM_PRICE,
  PET_MBTI_QUESTIONS,
  scoresFromAnswers,
  type PetMbtiResult,
} from "@/lib/pet/mbti-inference";
import { formatKrw } from "@/lib/reports/human-premium/pricing";
import { useLocale } from "next-intl";
import { useMemo, useState } from "react";

export function PetMbtiChecklist() {
  const routeLocale = useLocale();
  const isKo = routeLocale === "ko";
  const [petName, setPetName] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showPremium, setShowPremium] = useState(false);

  const complete = isPetMbtiComplete(answers);
  const result: PetMbtiResult | null = useMemo(() => {
    if (!complete) return null;
    return buildPetMbtiResult(scoresFromAnswers(answers));
  }, [answers, complete]);

  const premium = result && petName.trim()
    ? buildPetMbtiPremiumInsight(result, petName.trim(), isKo ? "ko" : "en")
    : null;

  function selectOption(questionId: string, optionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  return (
    <div className="space-y-8">
      <section className="pastel-card p-6 sm:p-8">
        <label className="block text-sm font-medium text-ink">
          {isKo ? "아이 이름" : "Pet name"}
          <input
            className="pastel-input mt-1 w-full"
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            placeholder={isKo ? "뽀미" : "Momo"}
          />
        </label>
      </section>

      <section className="space-y-4">
        {PET_MBTI_QUESTIONS.map((question, index) => (
          <article key={question.id} className="pastel-card p-5">
            <p className="text-xs font-semibold text-channel-dog">
              Q{index + 1}
            </p>
            <h3 className="mt-1 font-semibold text-ink">
              {isKo ? question.promptKo : question.promptEn}
            </h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {question.options.map((option) => {
                const selected = answers[question.id] === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => selectOption(question.id, option.id)}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                      selected
                        ? "border-channel-dog bg-channel-dog/10 font-semibold text-ink"
                        : "border-plum/15 bg-cream/50 text-plum hover:border-channel-dog/40"
                    }`}
                  >
                    {isKo ? option.labelKo : option.labelEn}
                  </button>
                );
              })}
            </div>
          </article>
        ))}
      </section>

      {result ? (
        <section className="pastel-card border-2 border-channel-dog/30 p-6 text-center sm:p-8">
          <p className="text-sm font-semibold text-channel-dog">
            {isKo ? "무료 결과" : "Free result"}
          </p>
          <h2 className="mt-2 text-3xl font-bold text-ink">
            {isKo
              ? `우리 아이는 ${result.type}형이에요`
              : `Your pet is ${result.type}`}
          </h2>
          <p className="mt-2 text-lg font-semibold text-plum">
            {isKo ? result.titleKo : result.titleEn}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink/85">
            {isKo ? result.summaryKo : result.summaryEn}
          </p>
        </section>
      ) : (
        <p className="text-center text-sm text-plum/70">
          {isKo ? "15문항을 모두 선택하면 결과가 나옵니다." : "Answer all 15 questions to see results."}
        </p>
      )}

      {result ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-ink">
              {isKo ? "심층 리포트 (유료)" : "Deep report (paid)"}
            </h3>
            <span className="font-bold text-channel-dog">
              {formatKrw(PET_MBTI_PREMIUM_PRICE)}
            </span>
          </div>

          {!showPremium ? (
            <div className="relative">
              <div className="space-y-3 blur-[4px] select-none" aria-hidden>
                <div className="pastel-card h-24" />
                <div className="pastel-card h-24" />
                <div className="pastel-card h-24" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  type="button"
                  disabled={!petName.trim()}
                  onClick={() => setShowPremium(true)}
                  className="rounded-full bg-channel-dog px-6 py-3 font-bold text-white disabled:opacity-50"
                >
                  {isKo ? "심층 분석 보기" : "View deep analysis"}
                </button>
              </div>
            </div>
          ) : premium ? (
            <div className="space-y-4">
              <article className="pastel-card p-5">
                <h4 className="font-semibold text-ink">
                  {isKo ? "성격 융합" : "Personality blend"}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-plum/90">{premium.personalityBlend}</p>
              </article>
              <article className="pastel-card p-5">
                <h4 className="font-semibold text-ink">
                  {isKo ? "사주 × MBTI 조합" : "Saju × MBTI blend"}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-plum/90">{premium.sajuCombo}</p>
              </article>
              <article className="pastel-card p-5">
                <h4 className="font-semibold text-ink">
                  {isKo ? "집사와의 궁합" : "Bond with butler"}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-plum/90">{premium.butlerFit}</p>
              </article>
              <article className="pastel-card p-5">
                <h4 className="font-semibold text-ink">
                  {isKo ? "건강 주의" : "Health notes"}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-plum/90">{premium.health}</p>
              </article>
              <article className="pastel-card p-5">
                <h4 className="font-semibold text-ink">
                  {isKo ? "일상 케어" : "Daily care"}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-plum/90">{premium.dailyCare}</p>
              </article>
              <p className="text-center text-xs text-plum/60">
                {isKo
                  ? "결제 연동 전 미리보기입니다. PortOne 연결 후 저장·PDF가 제공됩니다."
                  : "Preview before payment wiring. Save/PDF after PortOne checkout."}
              </p>
            </div>
          ) : null}
        </section>
      ) : null}

      <p className="text-center text-sm">
        <Link href="/saju" className="font-semibold text-channel-dog underline">
          {isKo ? "댕냥사주 홈" : "K-Saju home"}
        </Link>
      </p>
    </div>
  );
}
