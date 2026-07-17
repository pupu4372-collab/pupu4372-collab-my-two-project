import { randomBytes } from "node:crypto";
import {
  catalogAmountToPortOneTotal,
  fetchPortOnePayment,
  isPortOnePaymentPaid,
  parsePortOneCustomData,
  verifyPortOneAmount,
} from "@/lib/payments/portone/server";
import { resolveDailyExtraPayPalLink } from "@/lib/payments/paypal-links";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { DAILY_EXTRA_PRODUCT_CODE } from "./daily-extra-constants";
import {
  getCheckoutCurrency,
  resolveDailyExtraCheckout,
  type PricingLocale,
} from "./pricing";

export type DailyExtraPaymentProvider = "portone" | "paypal_link" | "demo";

export { DAILY_EXTRA_PRODUCT_CODE };

export interface DailyExtraOrderRow {
  id: string;
  user_id: string;
  payment_order_id: string;
  locale: PricingLocale;
  currency: "KRW" | "USD";
  amount_paid: number;
  payment_provider: DailyExtraPaymentProvider;
  status: "pending" | "paid" | "consumed";
  consumed_report_id: string | null;
  paid_at: string | null;
  created_at: string;
}

function requireDb() {
  const supabase = getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase;
}

export function createDailyExtraPaymentId(): string {
  return `daily_extra_${randomBytes(10).toString("hex")}`;
}

export async function createDailyExtraCheckoutOrder(
  userId: string,
  locale: PricingLocale
): Promise<DailyExtraOrderRow> {
  const supabase = requireDb();
  const { amount, currency } = resolveDailyExtraCheckout(locale);
  const paymentOrderId = createDailyExtraPaymentId();
  const paymentProvider: DailyExtraPaymentProvider =
    locale === "en" ? "paypal_link" : "portone";

  const { data, error } = await supabase
    .from("human_premium_daily_extra_orders")
    .insert({
      user_id: userId,
      payment_order_id: paymentOrderId,
      locale,
      currency,
      amount_paid: amount,
      payment_provider: paymentProvider,
      status: "pending",
    } as never)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create daily-extra checkout.");
  }

  return data as DailyExtraOrderRow;
}

export async function getDailyExtraOrderByPaymentId(
  paymentOrderId: string
): Promise<DailyExtraOrderRow | null> {
  const supabase = requireDb();
  const { data, error } = await supabase
    .from("human_premium_daily_extra_orders")
    .select("*")
    .eq("payment_order_id", paymentOrderId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? (data as DailyExtraOrderRow) : null;
}

export async function markDailyExtraOrderPaid(
  paymentOrderId: string
): Promise<DailyExtraOrderRow> {
  const supabase = requireDb();
  const { data, error } = await supabase
    .from("human_premium_daily_extra_orders")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
    } as never)
    .eq("payment_order_id", paymentOrderId)
    .eq("status", "pending")
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Daily-extra order not found or already paid.");
  }

  return data as DailyExtraOrderRow;
}

export async function markDailyExtraOrderConsumed(
  paymentOrderId: string,
  reportId: string
): Promise<void> {
  const supabase = requireDb();
  const { error } = await supabase
    .from("human_premium_daily_extra_orders")
    .update({
      status: "consumed",
      consumed_report_id: reportId,
    } as never)
    .eq("payment_order_id", paymentOrderId)
    .in("status", ["paid", "pending"]);

  if (error) throw new Error(error.message);
}

export function resolveDailyExtraPayPalLinkForOrder(paymentOrderId: string): string | null {
  return resolveDailyExtraPayPalLink(paymentOrderId);
}

export async function verifyDailyExtraPortOnePayment(
  userId: string,
  paymentOrderId: string,
  locale: PricingLocale
): Promise<DailyExtraOrderRow> {
  const order = await getDailyExtraOrderByPaymentId(paymentOrderId);
  if (!order || order.user_id !== userId) {
    throw new Error("Daily-extra order not found.");
  }
  if (order.status === "paid" || order.status === "consumed") {
    return order;
  }

  const payment = await fetchPortOnePayment(paymentOrderId);
  if (!payment || !isPortOnePaymentPaid(payment)) {
    throw new Error("Payment not completed.");
  }

  const customData = parsePortOneCustomData(payment.customData);
  const paidProductCode =
    typeof customData?.productCode === "string" ? customData.productCode : null;
  if (!paidProductCode || paidProductCode !== DAILY_EXTRA_PRODUCT_CODE) {
    console.error("[DAILY_EXTRA_CUSTOMDATA_MISMATCH]", {
      paymentId: paymentOrderId,
      paidProductCode,
      expected: DAILY_EXTRA_PRODUCT_CODE,
    });
    throw new Error("custom_data_mismatch");
  }

  // Order stores catalog units (USD whole dollars). PortOne total uses cents for USD.
  const expectedCurrency = order.currency || getCheckoutCurrency(locale);
  const expectedPortOneAmount = catalogAmountToPortOneTotal(
    Number(order.amount_paid),
    expectedCurrency
  );
  if (!verifyPortOneAmount(payment, expectedPortOneAmount)) {
    throw new Error("Payment amount mismatch.");
  }

  return markDailyExtraOrderPaid(paymentOrderId);
}

/** PayPal link flow — order must exist; fulfillment trusts checkout + invoice_id (same as human premium links). */
export async function verifyDailyExtraPayPalCheckout(
  userId: string,
  paymentOrderId: string
): Promise<DailyExtraOrderRow> {
  const order = await getDailyExtraOrderByPaymentId(paymentOrderId);
  if (!order || order.user_id !== userId) {
    throw new Error("Daily-extra order not found.");
  }
  if (order.payment_provider !== "paypal_link") {
    throw new Error("Invalid payment provider.");
  }
  if (order.status === "paid" || order.status === "consumed") {
    return order;
  }

  return markDailyExtraOrderPaid(paymentOrderId);
}

/**
 * Returns a paid daily-extra order eligible for one report generation.
 * Consumes the order after successful report persist.
 */
export async function assertDailyExtraPaymentForGeneration(
  userId: string,
  paymentOrderId: string
): Promise<DailyExtraOrderRow> {
  const order = await getDailyExtraOrderByPaymentId(paymentOrderId);
  if (!order || order.user_id !== userId) {
    throw new Error("Daily-extra payment not found.");
  }
  if (order.status === "consumed") {
    throw new Error("Daily-extra payment already used.");
  }
  if (order.status !== "paid") {
    throw new Error("Daily-extra payment not verified.");
  }
  return order;
}

export function getCheckoutCurrencyForLocale(locale: PricingLocale): "KRW" | "USD" {
  return getCheckoutCurrency(locale);
}
