import {
  parseMasterNarrative,
  parseMasterNarrativeResult,
} from "../src/lib/saju/llm/human-interpretation-parse";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const dailyScores = [
  {
    label: "현재운세강도",
    score: 78,
    description: "오늘 일진과 원국이 맞물려 실행 에너지가 선명합니다.",
  },
  {
    label: "시기적합도",
    score: 82,
    description: "오전 정리·오후 실행 흐름이 자연스럽게 이어집니다.",
  },
  {
    label: "기회포착력",
    score: 74,
    description: "짧은 대화에서 실마리가 보이니 메모를 남기세요.",
  },
  {
    label: "위기회피력",
    score: 66,
    description: "성급한 약속은 미루고 확인 루틴을 한 번 더 거치세요.",
  },
  {
    label: "관계운",
    score: 71,
    description: "부드러운 톤 한 문장이 오해를 줄이고 신뢰를 쌓습니다.",
  },
  {
    label: "재물흐름",
    score: 69,
    description: "소액 지출은 줄이고 반복 수입 루틴을 점검하기 좋습니다.",
  },
];

const legacy = parseMasterNarrativeResult({ narrative: "오늘 서사 본문" });
assert(legacy?.narrative === "오늘 서사 본문", "legacy narrative");
assert(legacy?.scores === null, "legacy scores should be null");

const withScores = parseMasterNarrativeResult({
  narrative: "오늘 서사",
  scores: dailyScores,
});
assert(withScores?.scores?.length === 6, "expected 6 parsed scores");
assert(withScores?.scores?.[0]?.label === "현재운세강도", "first label");
assert(parseMasterNarrative(withScores) === "오늘 서사", "parseMasterNarrative backward compat");

const partial = parseMasterNarrativeResult({
  narrative: "ok",
  scores: dailyScores.slice(0, 2),
});
assert(partial?.scores === null, "fewer than 4 scores should not apply");

console.log("OK master-narrative scores parsing tests passed.");
