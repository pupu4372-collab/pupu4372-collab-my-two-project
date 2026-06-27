import { REPORT_TYPE_ORDER } from "../pricing";
import type { ReportType } from "../types";

/** All prompt products — one key per report type. */
export type HumanPremiumPromptProductKey = ReportType;

export const HUMAN_PREMIUM_PROMPT_PRODUCT_LINE: HumanPremiumPromptProductKey[] = [
  "daily",
  ...REPORT_TYPE_ORDER,
];

export const PROMPT_PRODUCT_LABELS_KO: Record<HumanPremiumPromptProductKey, string> = {
  daily: "데일리 럭키 루틴",
  decade: "10년 인생 청사진",
  monthly: "월간 로드맵",
  yearly: "올해의 인생 청사진",
  mental: "멘탈디톡스",
  love: "로맨스시그널",
  career: "커리어 빌드업",
  business: "비즈니스 파트너 플랜",
  wealth: "자산과 재테크",
  lifetime: "인생의 마스터플랜",
};

export const PROMPT_PRODUCT_LABELS_EN: Record<HumanPremiumPromptProductKey, string> = {
  daily: "Daily Lucky Routine",
  decade: "10-Year Life Blueprint",
  monthly: "Monthly Roadmap",
  yearly: "This Year's Major-Luck Plan",
  mental: "Mental Detox",
  love: "Romance Signal",
  career: "Career Build-up",
  business: "Business Partner",
  wealth: "Assets & Wealth",
  lifetime: "Life Master Plan",
};
