import { buildHumanPremiumReportHybrid } from "./hybrid";
import type { HumanPremiumReportInput, HumanPremiumReportPayload, ReportType } from "./types";

export const DAILY_ROUTINE_REPORT_TYPE: ReportType = "daily";

/** 무료 데일리 럭키 루틴 — `daily-action-plan-report-prompt` (`daily` product key). */
export async function buildHumanPremiumDailyRoutineReport(
  input: HumanPremiumReportInput
): Promise<HumanPremiumReportPayload> {
  return buildHumanPremiumReportHybrid({
    ...input,
    reportType: DAILY_ROUTINE_REPORT_TYPE,
  });
}
