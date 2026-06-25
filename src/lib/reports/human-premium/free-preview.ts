import { FREE_DAILY_PREVIEW_PROMPT_PRODUCT } from "@/lib/reports/human-premium/report-prompts";
import { buildHumanPremiumReport } from "./generator";
import type {
  HumanPremiumReportInput,
  HumanPremiumReportPayload,
  ReportType,
} from "./types";

/** Report skeleton uses daily; prompts use {@link FREE_DAILY_PREVIEW_PROMPT_PRODUCT}. */
export const FREE_DAILY_PREVIEW_REPORT_TYPE: ReportType = "daily";

export { FREE_DAILY_PREVIEW_PROMPT_PRODUCT };

export function buildHumanPremiumFreePreviewReport(
  input: HumanPremiumReportInput
): HumanPremiumReportPayload {
  return buildHumanPremiumReport({
    ...input,
    reportType: FREE_DAILY_PREVIEW_REPORT_TYPE,
    deliveryMode: "free-preview",
  });
}

export type { HumanPremiumDeliveryMode } from "./types";
