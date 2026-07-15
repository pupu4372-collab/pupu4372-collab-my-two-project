import { sendPetDailyCareEmail } from "@/lib/fortune/daily-care-email";
import { isDeliverableHumanPremiumEmail } from "@/lib/reports/human-premium/email-policy";
import type { Locale } from "@/lib/saju/types";
import {
  createUserSupabaseClient,
  getBearerToken,
  getUserIdFromRequest,
} from "@/lib/supabase/auth-server";
import { NextResponse } from "next/server";

/**
 * Sends today's pet care card email (inline PNG) once per KST day per user.
 * Separate from human-premium report emails.
 */
export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);
  const token = getBearerToken(request);
  if (!userId || !token) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const supabase = createUserSupabaseClient(token);
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
  }

  let body: { locale?: string; email?: string; source?: string } = {};
  try {
    body = (await request.json()) as { locale?: string; email?: string; source?: string };
  } catch {
    body = {};
  }

  const locale: Locale = body.locale === "en" ? "en" : "ko";
  const bodyEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  /** Explicit email-link capture may send even if Redis idempotency is down. */
  const force = body.source === "email_capture";

  const {
    data: { user },
  } = await supabase.auth.getUser(token);
  const sessionEmail = (user?.email ?? "").trim().toLowerCase();
  const toEmail = isDeliverableHumanPremiumEmail(bodyEmail)
    ? bodyEmail
    : sessionEmail;

  if (!isDeliverableHumanPremiumEmail(toEmail)) {
    return NextResponse.json({ status: "skipped", reason: "email_not_deliverable" });
  }

  const result = await sendPetDailyCareEmail({
    supabase,
    ownerId: userId,
    toEmail,
    locale,
    force,
  });

  if (result.status === "failed") {
    return NextResponse.json({ status: "failed", error: result.error }, { status: 500 });
  }

  return NextResponse.json(result);
}
