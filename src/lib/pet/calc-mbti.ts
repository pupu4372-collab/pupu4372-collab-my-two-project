import type { MbtiAxis, MbtiQuestion } from "@/lib/pet/mbti-questions";

/** question id → selected value (0 = optionA, 1 = optionB) */
export type MbtiAnswerMap = Record<string, 0 | 1>;

export type MbtiResult = {
  type: string;
  scores: {
    EI: { E: number; I: number };
    SN: { S: number; N: number };
    TF: { T: number; F: number };
    JP: { J: number; P: number };
  };
};

const TF_INVERTED_QUESTION_IDS = new Set(["dog_tf_3"]);

function emptyScores(): MbtiResult["scores"] {
  return {
    EI: { E: 0, I: 0 },
    SN: { S: 0, N: 0 },
    TF: { T: 0, F: 0 },
    JP: { J: 0, P: 0 },
  };
}

function normalizeValue(questionId: string, axis: MbtiAxis, value: 0 | 1): 0 | 1 {
  if (axis === "TF" && TF_INVERTED_QUESTION_IDS.has(questionId)) {
    return value === 0 ? 1 : 0;
  }
  return value;
}

function letterFromValue(axis: MbtiAxis, value: 0 | 1): "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P" {
  switch (axis) {
    case "EI":
      return value === 0 ? "E" : "I";
    case "SN":
      return value === 0 ? "S" : "N";
    case "TF":
      return value === 0 ? "F" : "T";
    case "JP":
      return value === 0 ? "J" : "P";
  }
}

function incrementScore(
  scores: MbtiResult["scores"],
  axis: MbtiAxis,
  letter: ReturnType<typeof letterFromValue>
): void {
  switch (axis) {
    case "EI":
      scores.EI[letter as "E" | "I"] += 1;
      break;
    case "SN":
      scores.SN[letter as "S" | "N"] += 1;
      break;
    case "TF":
      scores.TF[letter as "T" | "F"] += 1;
      break;
    case "JP":
      scores.JP[letter as "J" | "P"] += 1;
      break;
  }
}

function letterFromAverage(axis: MbtiAxis, average: number): string {
  switch (axis) {
    case "EI":
      return average < 0.5 ? "E" : "I";
    case "SN":
      return average < 0.5 ? "S" : "N";
    case "TF":
      return average < 0.5 ? "F" : "T";
    case "JP":
      return average < 0.5 ? "J" : "P";
  }
}

export function calcMbti(answers: MbtiAnswerMap, questions: MbtiQuestion[]): MbtiResult {
  const scores = emptyScores();
  const valuesByAxis: Record<MbtiAxis, number[]> = {
    EI: [],
    SN: [],
    TF: [],
    JP: [],
  };

  for (const question of questions) {
    const raw = answers[question.id];
    if (raw !== 0 && raw !== 1) continue;

    const normalized = normalizeValue(question.id, question.axis, raw);
    const letter = letterFromValue(question.axis, normalized);

    incrementScore(scores, question.axis, letter);
    valuesByAxis[question.axis].push(normalized);
  }

  const type = (["EI", "SN", "TF", "JP"] as const)
    .map((axis) => {
      const values = valuesByAxis[axis];
      if (values.length === 0) return "";
      const average = values.reduce((sum, value) => sum + value, 0) / values.length;
      return letterFromAverage(axis, average);
    })
    .join("");

  return { type, scores };
}

export function isMbtiComplete(answers: MbtiAnswerMap, questions: MbtiQuestion[]): boolean {
  return questions.every((question) => {
    const value = answers[question.id];
    return value === 0 || value === 1;
  });
}
