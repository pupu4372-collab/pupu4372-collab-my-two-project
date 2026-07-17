import {
  assertDailyExtraPaymentForGeneration,
  getDailyExtraOrderByPaymentId,
  markDailyExtraOrderConsumed,
} from "@/lib/reports/human-premium/daily-extra-payment";
import {
  releaseDailyFreeLock,
  tryAcquireDailyFreeLock,
} from "@/lib/reports/human-premium/daily-free-lock";
import { persistHumanPremiumDailyRoutineReport } from "@/lib/reports/human-premium/daily-routine";
import { buildDailyRoutineResponseFromToken } from "@/lib/reports/human-premium/daily-routine-response";
import { formatHumanPremiumError } from "@/lib/reports/human-premium/client-errors";
import { scheduleHumanPremiumPdfPrewarm } from "@/lib/reports/human-premium/pdf-cache";
import {
  getCheckoutCurrency,
  getDailyExtraPrice,
} from "@/lib/reports/human-premium/pricing";
import { parseHumanPremiumReportInput } from "@/lib/reports/human-premium/service";
import { getHumanPremiumReportById } from "@/lib/reports/human-premium/storage";
import {
  COUPON_TYPE_DAILY_LUCKY_FREE,
  consumeCoupon,
  findUsableCoupon,
} from "@/lib/coupons/coupons";
import { getRegisteredUserIdFromRequest } from "@/lib/supabase/auth-server";
import { NextResponse, after } from "next/server";

export const maxDuration = 120;

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

    if (dailyExtraPaymentId) {
      if (!userId) {
        return NextResponse.json({ error: "login_required" }, { status: 401 });
      }

      const priorOrder = await getDailyExtraOrderByPaymentId(dailyExtraPaymentId);
      if (
        priorOrder?.user_id === userId &&
        priorOrder.status === "consumed" &&
        priorOrder.consumed_report_id
      ) {
        const priorRow = await getHumanPremiumReportById(priorOrder.consumed_report_id);
        if (priorRow?.web_access_token) {
          const reused = await buildDailyRoutineResponseFromToken(
            priorRow.web_access_token,
            request
          );
          if (reused) {
            return NextResponse.json({
              report: reused.payload,
              webToken: reused.webToken,
              webUrl: reused.webUrl,
              paidExtra: true,
              reused: true,
            });
          }
        }
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
          pgProvider: order.payment_provider,
        }
      );

      await markDailyExtraOrderConsumed(order.payment_order_id, row.id);

      after(() => {
        scheduleHumanPremiumPdfPrewarm(row, payload);
      });

      return NextResponse.json({ report: payload, webToken, webUrl, paidExtra: true });
    }

    // Coupon / signup gate (no daily free quota)
    if (!userId) {
      return NextResponse.json(
        { error: "signup_required", code: "signup_required" },
        { status: 402 }
      );
    }

    const coupon = await findUsableCoupon(userId, COUPON_TYPE_DAILY_LUCKY_FREE);
    if (!coupon) {
      return NextResponse.json(
        { error: "payment_required", code: "payment_required" },
        { status: 402 }
      );
    }

    const lock = await tryAcquireDailyFreeLock(userId);
    if (lock === "held") {
      return NextResponse.json(
        { error: "daily_generating_in_progress" },
        { status: 409 }
      );
    }

    try {
      const { payload, webToken, webUrl, row } = await persistHumanPremiumDailyRoutineReport(
        input,
        { request }
      );

      const consumed = await consumeCoupon(coupon.id, row.id);
      if (!consumed) {
        console.error("CONSUME_RACE", {
          couponId: coupon.id,
          userId,
          reportId: row.id,
        });
      }

      after(() => {
        scheduleHumanPremiumPdfPrewarm(row, payload);
      });

      return NextResponse.json({
        report: payload,
        webToken,
        webUrl,
        couponUsed: consumed,
      });
    } finally {
      if (lock === "acquired") {
        await releaseDailyFreeLock(userId);
      }
    }
  } catch (err) {
    const raw = err instanceof Error ? err.message : "Daily routine report failed.";
    return NextResponse.json({ error: formatHumanPremiumError(raw, locale) }, { status: 500 });
  }
}
