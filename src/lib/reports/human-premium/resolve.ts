import { buildHumanPremiumReportHybrid } from "./hybrid";
import {
  getHumanPremiumReportByWebToken,
  incrementHumanPremiumWebViewCount,
  markHumanPremiumReportReady,
  updateHumanPremiumReport,
} from "./storage";
import {
  HUMAN_PREMIUM_SECTION_IDS,
  parseReportType,
  type HumanPremiumReportInput,
  type HumanPremiumReportPayload,
  type HumanPremiumReportRow,
} from "./types";

export type HumanPremiumTokenFailureKind = "load" | "generate";

/** Staged failure from token resolve — page maps `kind` to user copy; details stay in logs. */
export class HumanPremiumTokenResolveError extends Error {
  readonly stage: string;
  readonly kind: HumanPremiumTokenFailureKind;

  constructor(stage: string, kind: HumanPremiumTokenFailureKind, cause: unknown) {
    const message = cause instanceof Error ? cause.message : String(cause);
    super(message);
    this.name = "HumanPremiumTokenResolveError";
    this.stage = stage;
    this.kind = kind;
    if (cause instanceof Error && cause.stack) {
      this.stack = cause.stack;
    }
  }
}

async function runStage<T>(
  stage: string,
  kind: HumanPremiumTokenFailureKind,
  fn: () => Promise<T>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof HumanPremiumTokenResolveError) throw error;
    const message = error instanceof Error ? error.message : String(error);
    if (stage === "select" && message === "Supabase is not configured.") {
      throw new HumanPremiumTokenResolveError("requireDb", "load", error);
    }
    throw new HumanPremiumTokenResolveError(stage, kind, error);
  }
}

function rowToInput(row: HumanPremiumReportRow): HumanPremiumReportInput {
  return {
    personName: row.person_name,
    email: row.email,
    birthDate: row.birth_date,
    birthTime: row.birth_time,
    birthTimeUnknown: row.birth_time_unknown,
    timezone: row.birth_timezone,
    calendarType: row.calendar_type,
    locale: row.locale,
    privacyConsent: row.privacy_consent,
    gender: row.birth_basis?.gender ?? null,
    userId: row.user_id,
    reportType: parseReportType(row.report_type),
  };
}

function isAccessExpired(row: HumanPremiumReportRow): boolean {
  if (!row.web_access_expires_at) return false;
  return new Date(row.web_access_expires_at).getTime() < Date.now();
}

function isCurrentReportTemplate(payload: HumanPremiumReportPayload): boolean {
  const sectionIds = new Set(
    payload.saju.chapters.flatMap((chapter) =>
      chapter.sections.map((section) => section.id)
    )
  );

  return (
    Boolean(payload.structured?.scores?.length) &&
    HUMAN_PREMIUM_SECTION_IDS.every((id) => sectionIds.has(id))
  );
}

export async function resolveHumanPremiumReportByToken(
  token: string
): Promise<{
  row: HumanPremiumReportRow;
  payload: HumanPremiumReportPayload;
} | null> {
  const row = await runStage("select", "load", () => getHumanPremiumReportByWebToken(token));
  if (!row || isAccessExpired(row)) return null;

  if (row.report_payload) {
    const payload = row.report_payload as unknown as HumanPremiumReportPayload;
    if (!isCurrentReportTemplate(payload)) {
      const rebuilt = await runStage("regenerate", "generate", () =>
        buildHumanPremiumReportHybrid(rowToInput(row))
      );
      const saved = await runStage("regenerate", "generate", () =>
        markHumanPremiumReportReady(
          row.id,
          rebuilt as unknown as Record<string, unknown>,
          rebuilt.birthBasis
        )
      );
      await runStage("incrementView", "load", () =>
        incrementHumanPremiumWebViewCount(saved.id)
      );
      return { row: saved, payload: rebuilt };
    }

    await runStage("incrementView", "load", () =>
      incrementHumanPremiumWebViewCount(row.id)
    );
    return {
      row,
      payload,
    };
  }

  const allowedStatuses = new Set([
    "paid",
    "generating",
    "ready",
    "email_sent",
    "failed",
    "email_failed",
  ]);
  if (!allowedStatuses.has(row.status) && row.payment_provider !== "demo") {
    return null;
  }

  await runStage("regenerate", "generate", () =>
    updateHumanPremiumReport(row.id, { status: "generating" })
  );

  try {
    const payload = await runStage("regenerate", "generate", () =>
      buildHumanPremiumReportHybrid(rowToInput(row))
    );
    const saved = await runStage("regenerate", "generate", () =>
      markHumanPremiumReportReady(
        row.id,
        payload as unknown as Record<string, unknown>,
        payload.birthBasis
      )
    );
    await runStage("incrementView", "load", () =>
      incrementHumanPremiumWebViewCount(saved.id)
    );
    return { row: saved, payload };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Report generation failed.";
    await updateHumanPremiumReport(row.id, {
      status: "failed",
      failure_stage: "generation",
      failure_message: message,
    });
    if (error instanceof HumanPremiumTokenResolveError) throw error;
    throw new HumanPremiumTokenResolveError("regenerate", "generate", error);
  }
}
