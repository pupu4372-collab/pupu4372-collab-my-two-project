/** Fallback when no saved basic report id is known (session restore or fresh form). */
export const BASIC_SAJU_RESULT_FALLBACK_HREF = "/saju?restore=1";

export function basicSajuResultHrefFromId(sajuResultId: string | null | undefined): string {
  if (sajuResultId) return `/reports/${sajuResultId}`;
  return BASIC_SAJU_RESULT_FALLBACK_HREF;
}
