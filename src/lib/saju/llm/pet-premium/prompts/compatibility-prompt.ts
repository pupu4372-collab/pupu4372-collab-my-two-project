import type { CompatibilityResponse } from "@/lib/saju/compatibility/engine";
import { ELEMENT_META } from "@/lib/saju/elements";
import type { Locale } from "@/lib/saju/types";
import type { LlmPromptPair } from "../../types";
import { petPremiumSystemRules } from "../base-prompt";

const DETAIL_TITLES = {
  ko: ["궁합 흐름", "성별·생활 리듬", "오행 교감 포인트"],
  en: ["Bond flow", "Gender and daily rhythm", "Element bonding point"],
} as const;

export function buildPetCompatibilityPremiumPrompts(options: {
  locale: Locale;
  result: CompatibilityResponse;
  petChartSummary: string;
  ownerChartSummary: string;
}): LlmPromptPair {
  const { locale, result, petChartSummary, ownerChartSummary } = options;
  const isKo = locale === "ko";
  const titles = DETAIL_TITLES[locale];

  const system = [
    petPremiumSystemRules(locale),
    isKo
      ? [
          'JSON 키: story, relationDescription, petElementNote, ownerElementNote, details (정확히 3개 {title, body}), careTips (string 4개).',
          "details 각 body는 반드시 3단 구조:",
          "① 집사님은 ~한 타입 (사주 근거를 일상 언어로) → ② 우리 아이는 ~한 성향 (동일) → ③ 그래서 잘 맞고/어긋나기 쉬우니 이렇게 맞춰가라 (구체 행동 1~2개)",
          `details 제목은 순서대로: "${titles[0]}", "${titles[1]}", "${titles[2]}"`,
          "일반론 금지. 입력된 인연 지수·오행·일주 근거만 일상 언어로.",
        ].join("\n")
      : [
          "JSON keys: story, relationDescription, petElementNote, ownerElementNote, details (exactly 3 {title, body}), careTips (4 strings).",
          "Each details[].body: ① Butler tends to… ② Pet tends to… ③ So together… + 1–2 concrete actions.",
          `Use titles in order: "${titles[0]}", "${titles[1]}", "${titles[2]}"`,
          "No generic advice — only bond score and chart input in plain language.",
        ].join("\n"),
  ].join("\n");

  const petEl = ELEMENT_META[result.petElement];
  const ownerEl = ELEMENT_META[result.ownerElement];

  const user = isKo
    ? [
        `${result.petName} × ${result.ownerName} 집사 궁합 프리미엄 JSON을 작성하세요.`,
        `- 인연 지수: ${result.bondScore}점 (${result.bondLabel})`,
        `- 관계 유형: ${result.relation}`,
        `- 펫: ${result.species}, ${result.petGender === "male" ? "수" : "암"} / 집사: ${result.ownerGender === "male" ? "남성" : "여성"}`,
        `- 펫 사주 요약: ${petChartSummary}`,
        `- 집사 사주 요약: ${ownerChartSummary}`,
        `- 펫 대표 오행: ${petEl.hangul}, 집사 대표 오행: ${ownerEl.hangul}`,
        "",
        "입력(내부 참고, 출력에 한자·일주·명리 용어 노출 금지):",
        JSON.stringify(
          {
            bondScore: result.bondScore,
            bondLabel: result.bondLabel,
            relation: result.relation,
            petDayPillar: result.petDayPillar,
            ownerDayPillar: result.ownerDayPillar,
            petElement: result.petElement,
            ownerElement: result.ownerElement,
          },
          null,
          2
        ),
      ].join("\n")
    : [
        `Write pet–butler bond premium JSON for ${result.petName} × ${result.ownerName}.`,
        `- Bond: ${result.bondScore} (${result.bondLabel}), relation: ${result.relation}`,
        `- Pet: ${result.species}, ${result.petGender}; butler: ${result.ownerGender}`,
        `- Pet chart: ${petChartSummary}`,
        `- Butler chart: ${ownerChartSummary}`,
        "",
        "Input (do not expose jargon in output):",
        JSON.stringify(
          {
            bondScore: result.bondScore,
            relation: result.relation,
            petDayPillar: result.petDayPillar,
            ownerDayPillar: result.ownerDayPillar,
            petElement: result.petElement,
            ownerElement: result.ownerElement,
          },
          null,
          2
        ),
      ].join("\n");

  return { system, user };
}
