import {
  assertDailyExtraPaymentForGeneration,
  markDailyExtraOrderConsumed,
} from "@/lib/reports/human-premium/daily-extra-payment";
import {
  checkDailyReportLimit,
  type DailyBirthInput,
} from "@/lib/reports/human-premium/daily-limit";
import { persistHumanPremiumDailyRoutineReport } from "@/lib/reports/human-premium/daily-routine";
import { buildDailyRoutineResponseFromToken } from "@/lib/reports/human-premium/daily-routine-response";
import { formatHumanPremiumError } from "@/lib/reports/human-premium/client-errors";
import { scheduleHumanPremiumPdfPrewarm } from "@/lib/reports/human-premium/pdf-cache";
import {
  getCheckoutCurrency,
  getDailyExtraPrice,
} from "@/lib/reports/human-premium/pricing";
import { parseHumanPremiumReportInput } from "@/lib/reports/human-premium/service";
import type { HumanPremiumReportInput } from "@/lib/reports/human-premium/types";
import { getRegisteredUserIdFromRequest } from "@/lib/supabase/auth-server";
import { NextResponse, after } from "next/server";

export const maxDuration = 120;

function toDailyBirthInput(input: HumanPremiumReportInput): DailyBirthInput {
  return {
    birthDate: input.birthDate,
    birthTime: input.birthTime,
    birthTimeUnknown: input.birthTimeUnknown,
    birthTimezone: input.timezone,
    calendarType: input.calendarType,
    gender: input.gender ?? null,
  };
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const locale = body.locale === "en" ? "en" : "ko";
  const userId = await getRegisteredUserIdFromRequest(request);
  const dailyExtraPaymentId = String(
    body.dailyExtraPaymentId ?? body.paymentId ?? ""
  ).trim();

  try {
    const input = parseHumanPremiumReportInput(body, userId);
    const birthInput = toDailyBirthInput(input);

    if (dailyExtraPaymentId) {
      if (!userId) {
        return NextResponse.json({ error: "login_required" }, { status: 401 });
      }

      const order = await assertDailyExtraPaymentForGeneration(
        userId,
        dailyExtraPaymentId
      );
      const priceLocale = order.locale === "en" ? "en" : "ko";
      const { payload, webToken, webUrl, row } = await persistHumanPremiumDailyRoutineReport(
        input,
        {
          request,
          paymentProvider: order.payment_provider === "paypal_link" ? "paypal" : "card_pg",
          paymentOrderId: order.payment_order_id,
          amountPaid: getDailyExtraPrice(priceLocale),
          amountOriginal: getDailyExtraPrice(priceLocale),
          currency: getCheckoutCurrency(priceLocale),
          checkoutSessionId: "daily-extra",
          pgProvider: order.payment_provider,
        }
      );

      await markDailyExtraOrderConsumed(order.payment_order_id, row.id);

      after(() => {
        scheduleHumanPremiumPdfPrewarm(row, payload);
      });

      return NextResponse.json({ report: payload, webToken, webUrl, paidExtra: true });
    }

    const limit = await checkDailyReportLimit(userId, birthInput);

    if (!limit.allowed) {
      if (limit.reason === "guest") {
        return NextResponse.json({ error: "login_required" }, { status: 401 });
      }
      if (limit.reason === "quota_exceeded") {
        return NextResponse.json(
          {
            error: "daily_quota_exceeded",
            todayReportToken: limit.todayFreeReportToken ?? null,
          },
          { status: 402 }
        );
      }
    }

    if (limit.existingReportToken) {
      const reused = await buildDailyRoutineResponseFromToken(
        limit.existingReportToken,
        request
      );
      if (reused) {
        return NextResponse.json({
          report: reused.payload,
          webToken: reused.webToken,
          webUrl: reused.webUrl,
          reused: true,
        });
      }
    }

    const { payload, webToken, webUrl, row } = await persistHumanPremiumDailyRoutineReport(
      input,
      { request }
    );

    after(() => {
      scheduleHumanPremiumPdfPrewarm(row, payload);
    });

    return NextResponse.json({ report: payload, webToken, webUrl });
  } catch (err) {
    const raw = err instanceof Error ? err.message : "Daily routine report failed.";
    return NextResponse.json({ error: formatHumanPremiumError(raw, locale) }, { status: 500 });
  }
}
