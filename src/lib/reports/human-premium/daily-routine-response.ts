import { buildHumanPremiumReportUrl } from "./email";
import { getHumanPremiumReportByWebToken } from "./storage";
import type { HumanPremiumReportPayload, HumanPremiumReportRow } from "./types";

export async function buildDailyRoutineResponseFromToken(
  webToken: string,
  request?: Request | null
): Promise<{
  row: HumanPremiumReportRow;
  payload: HumanPremiumReportPayload;
  webToken: string;
  webUrl: string;
  reused: true;
} | null> {
  const row = await getHumanPremiumReportByWebToken(webToken);
  if (!row?.report_payload || row.report_type !== "daily") return null;

  return {
    row,
    payload: row.report_payload as unknown as HumanPremiumReportPayload,
    webToken: row.web_access_token,
    webUrl: buildHumanPremiumReportUrl(row, request),
    reused: true,
  };
}
