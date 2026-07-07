import type { CompatibilityResponse } from "@/lib/saju/compatibility/engine";
import type { Locale } from "@/lib/saju/types";
import type { LlmPromptPair } from "../../types";
import { petPremiumSystemRules } from "../base-prompt";

export function buildPetCompatibilityPremiumPrompts(options: {
  locale: Locale;
  result: CompatibilityResponse;
}): LlmPromptPair {
  const { locale, result } = options;
  const isKo = locale === "ko";

  const system = [
    petPremiumSystemRules(locale),
    isKo
      ? [
          'JSON 키: story, relationDescription, petElementNote, ownerElementNote, details (배열: {title, body}), careTips (string 배열 4개).',
          "details 각 body는 반드시 3단 구조로 작성:",
          "① 집사님은 (일상 언어 성향) → ② 우리 아이는 (일상 언어 성향) → ③ 그래서 (잘 맞는 점/어긋나는 점) + 구체 행동 1~2개",
          "details는 3개 섹션 유지. careTips는 오늘 실행 가능한 짧은 행동.",
        ].join("\n")
      : [
          "JSON keys: story, relationDescription, petElementNote, ownerElementNote, details ({title, body}[]), careTips (4 strings).",
          "Each details[].body must use 3 parts:",
          "① Butler tends to… ② Our pet tends to… ③ So together… + 1–2 concrete actions.",
          "Keep 3 detail sections. careTips = actionable today.",
        ].join("\n"),
  ].join("\n");

  const user = isKo
    ? [
        `${result.petName} × ${result.ownerName} 집사 궁합 프리미엄 JSON을 작성하세요.`,
        `- 인연 지수: ${result.bondScore} (${result.bondLabel})`,
        `- 관계 유형 코드: ${result.relation}`,
        `- 펫 성별: ${result.petGender === "male" ? "수" : "암"}, 집사 성별: ${result.ownerGender === "male" ? "남성" : "여성"}`,
        `- 펫 성향 메모: ${result.petElementNote}`,
        `- 집사 성향 메모: ${result.ownerElementNote}`,
        "",
        "기존 섹션 제목 참고:",
        result.details.map((d) => `- ${d.title}`).join("\n"),
        "",
        "입력(내부 참고용, 출력에 한자·일주 노출 금지):",
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
      ].join("\n")
    : [
        `Write pet–butler bond premium JSON for ${result.petName} × ${result.ownerName}.`,
        `- Bond score: ${result.bondScore} (${result.bondLabel})`,
        `- Relation: ${result.relation}`,
        `- Pet gender: ${result.petGender}, butler gender: ${result.ownerGender}`,
        "",
        "Section title hints:",
        result.details.map((d) => `- ${d.title}`).join("\n"),
        "",
        "Input (do not expose jargon in output):",
        JSON.stringify(
          {
            bondScore: result.bondScore,
            relation: result.relation,
            petDayPillar: result.petDayPillar,
            ownerDayPillar: result.ownerDayPillar,
          },
          null,
          2
        ),
      ].join("\n");

  return { system, user };
}
