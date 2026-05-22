import { PREMIUM_PRICE_USD } from "@/lib/paypal/config";
import { capturePremiumOrder } from "@/lib/paypal/server";
import { buildPremiumReport } from "@/lib/saju/premium-report";
import { persistPremiumReport } from "@/lib/saju/persist-premium";
import { validatePetName } from "@/lib/saju/moderation";
import {
  createUserSupabaseClient,
  getBearerToken,
  getUserIdFromRequest,
} from "@/lib/supabase/auth-server";
import type { Locale, Species } from "@/lib/saju/types";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);
  const token = getBearerToken(request);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const orderId = String(body.orderId ?? "");
  if (!orderId) {
    return NextResponse.json({ error: "orderId required." }, { status: 400 });
  }

  const petName = String(body.petName ?? "").trim();
  const nameError = validatePetName(petName);
  if (nameError) {
    return NextResponse.json({ error: nameError }, { status: 400 });
  }

  try {
    const capture = await capturePremiumOrder(orderId);

    const report = buildPremiumReport({
      petName,
      species: body.species as Species,
      birthDate: String(body.birthDate),
      birthTime: (body.birthTime as string) ?? null,
      birthTimeUnknown: Boolean(body.birthTimeUnknown),
      timezone: String(body.timezone),
      locale: (body.locale === "en" ? "en" : "ko") as Locale,
    });

    let persisted = false;
    let petId: string | null = null;
    let sajuResultId: string | null = null;

    if (userId && token) {
      const supabase = createUserSupabaseClient(token);
      if (supabase) {
        const saved = await persistPremiumReport(
          supabase,
          userId,
          {
            petName,
            species: body.species as Species,
            birthDate: String(body.birthDate),
            birthTime: (body.birthTime as string) ?? null,
            birthTimeUnknown: Boolean(body.birthTimeUnknown),
            timezone: String(body.timezone),
            locale: (body.locale === "en" ? "en" : "ko") as Locale,
            privacyConsent: true,
          },
          report,
          {
            orderId,
            captureId: capture.captureId,
            amount: PREMIUM_PRICE_USD,
            demo: capture.demo,
          }
        );
        persisted = true;
        petId = saved.petId;
        sajuResultId = saved.sajuResultId;
      }
    }

    return NextResponse.json({
      capture,
      report,
      persisted,
      petId,
      sajuResultId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Capture failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
