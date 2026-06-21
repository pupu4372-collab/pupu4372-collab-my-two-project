import type { HumanSajuMapping } from "@/lib/saju/human-trait-mapping";
import { dominantElementLabel } from "@/lib/saju/pet-lucky-scores";
import type { Locale } from "@/lib/saju/types";
import type { LlmPromptPair } from "../types";

export function buildHumanInterpretationPrompts(options: {
  mapping: HumanSajuMapping;
  locale: Locale;
  subjectName?: string;
}): LlmPromptPair {
  const { mapping, locale, subjectName } = options;
  const isKo = locale === "ko";
  const dominantEl = dominantElementLabel(mapping.dominantElement, locale);
  const weakEl = dominantElementLabel(mapping.weakElement, locale);

  const system = isKo
    ? [
        "당신은 전통 명리학 기반 사람 사주 해석 전문가입니다.",
        "입력 데이터의 십신·신살·대운 사실만 활용하고, 확정적 미래 예언은 피하고 '경향·가능성'으로 표현합니다.",
        "신뢰감 있는 전문가 톤, ko locale.",
        '반드시 JSON만 출력: personality, tenGodAnalysis, daewoonOutlook (모두 string).',
      ].join("\n")
    : [
        "You are a traditional saju interpreter for human clients.",
        "Use only provided ten-god, sal, and daewoon facts. Avoid definitive predictions; use tendencies.",
        "Professional, trustworthy tone in English.",
        'Return JSON only: personality, tenGodAnalysis, daewoonOutlook (all strings).',
      ].join("\n");

  const tenGodLines = mapping.tenGods
    .map((tg) => `${tg.label} ${tg.ganzi}: ${tg.tenGod}`)
    .join("\n");
  const daewoonLines = mapping.daewoonUpcoming
    .map((d) =>
      isKo
        ? `${d.ganzi} (${d.startAge}세~ / ${d.startYear}년~)`
        : `${d.ganzi} (from age ${d.startAge} / ${d.startYear}~)`
    )
    .join("\n");

  const user = isKo
    ? [
        "다음 사람 사주 매핑을 바탕으로 유료 리포트용 JSON 해석을 작성해주세요.",
        subjectName ? `- 대상: ${subjectName}` : null,
        `- 사주 4주: 년 ${mapping.pillars.year} / 월 ${mapping.pillars.month} / 일 ${mapping.pillars.day} / 시 ${mapping.pillars.hour}`,
        `- 일간: ${mapping.dayMaster} (${mapping.dayMasterElement}, ${mapping.dayMasterYinYang})`,
        `- 주도/결핍 오행: ${dominantEl} / ${weakEl}`,
        `- 균형 점수: ${mapping.balanceScore}/100`,
        `- 십신:\n${tenGodLines}`,
        `- 신살: ${mapping.specialSalSummary.join(", ") || "특이 신살 없음"}`,
        `- 공망: ${mapping.gongmangBranches.join("") || "없음"}`,
        `- 향후 대운:\n${daewoonLines}`,
        "",
        "personality: 성격·기질 3~5문장",
        "tenGodAnalysis: 십신 해석 3~5문장",
        "daewoonOutlook: 대운 흐름 3~5문장",
        "",
        JSON.stringify(mapping, null, 2),
      ]
        .filter(Boolean)
        .join("\n")
    : [
        "Write premium human saju JSON interpretation from this mapping.",
        subjectName ? `- Subject: ${subjectName}` : null,
        `- Four pillars: ${mapping.pillars.year} / ${mapping.pillars.month} / ${mapping.pillars.day} / ${mapping.pillars.hour}`,
        `- Day master: ${mapping.dayMaster} (${mapping.dayMasterElement}, ${mapping.dayMasterYinYang})`,
        `- Dominant/weak: ${dominantEl} / ${weakEl}`,
        `- Balance: ${mapping.balanceScore}/100`,
        `- Ten gods:\n${tenGodLines}`,
        `- Special sal: ${mapping.specialSalSummary.join(", ") || "none"}`,
        `- Gongmang: ${mapping.gongmangBranches.join("") || "none"}`,
        `- Upcoming daewoon:\n${daewoonLines}`,
        "",
        JSON.stringify(mapping, null, 2),
      ]
        .filter(Boolean)
        .join("\n");

  return { system, user };
}
