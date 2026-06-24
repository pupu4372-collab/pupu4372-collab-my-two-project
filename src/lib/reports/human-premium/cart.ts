import { randomBytes } from "node:crypto";
import { buildHumanPremiumReportUrl } from "./email";
import { resolveHumanPremiumEmail } from "./email-policy";
import { humanPremiumWebExpiresAt } from "./retention";
import { REPORT_TYPE_ORDER, sumCartAmount } from "./pricing";
import {
  completeHumanPremiumPayment,
  parseHumanPremiumReportInput,
} from "./service";
import {
  createHumanPremiumReportDraft,
  getHumanPremiumReportByCheckoutSession,
  getHumanPremiumReportById,
  getHumanPremiumReportByPaymentOrderId,
  listHumanPremiumCartOrderRows,
  updateHumanPremiumReport,
} from "./storage";
import type {
  HumanPremiumBirthBasis,
  HumanPremiumCartMeta,
  HumanPremiumReportInput,
  HumanPremiumReportRow,
  ReportType,
} from "./types";

export function parseCartReportTypes(value: unknown): ReportType[] {
  if (!Array.isArray(value)) return [];
  const items: ReportType[] = [];
  const allowed = new Set<ReportType>(REPORT_TYPE_ORDER);
  for (const entry of value) {
    if (typeof entry !== "string" || !allowed.has(entry as ReportType)) continue;
    const type = entry as ReportType;
    if (!items.includes(type)) items.push(type);
  }
  return items;
}

function getCartMeta(row: HumanPremiumReportRow): HumanPremiumCartMeta | null {
  const cart = row.birth_basis?.cart;
  if (!cart?.cartOrder || !Array.isArray(cart.items)) return null;
  return cart;
}

function rowMatchesBirthProfile(
  row: HumanPremiumReportRow,
  input: HumanPremiumReportInput
): boolean {
  return (
    row.person_name.trim() === input.personName.trim() &&
    row.birth_date === input.birthDate &&
    row.birth_time_unknown === input.birthTimeUnknown &&
    (input.birthTimeUnknown || row.birth_time === input.birthTime) &&
    row.birth_timezone === input.timezone &&
    row.calendar_type === input.calendarType
  );
}

async function getPurchasedReportTypesForInput(
  input: HumanPremiumReportInput,
  userId?: string | null,
  email?: string
): Promise<Set<ReportType>> {
  const rows = await listHumanPremiumCartOrderRows({ userId, email, limit: 50 });
  const types = new Set<ReportType>();
  for (const row of rows) {
    if (!rowMatchesBirthProfile(row, input)) continue;
    const cart = getCartMeta(row);
    if (!cart) continue;
    for (const item of cart.items) types.add(item);
  }
  return types;
}

export async function createPaidCartOrder(
  body: Record<string, unknown>,
  userId?: string | null
): Promise<{ orderId: string; cartRow: HumanPremiumReportRow; amount: number }> {
  const items = parseCartReportTypes(body.cartItems);
  if (!items.length) throw new Error("cartItems required.");

  const input = parseHumanPremiumReportInput(body, userId);
  const { email, deliverEmail } = resolveHumanPremiumEmail(body.email);
  const purchased = await getPurchasedReportTypesForInput(input, userId, email);
  const duplicates = items.filter((item) => purchased.has(item));
  if (duplicates.length) {
    throw new Error("cart_items_already_purchased");
  }

  const amount = sumCartAmount(items);
  const orderId = `hp_cart_${randomBytes(10).toString("hex")}`;

  const birthBasis: HumanPremiumBirthBasis = {
    birthDate: input.birthDate,
    birthTime: input.birthTime,
    birthTimeUnknown: input.birthTimeUnknown,
    timezone: input.timezone,
    calendarType: input.calendarType,
    locale: input.locale,
    gender: input.gender ?? null,
    cart: {
      cartOrder: true,
      items,
      generated: {},
      deliverEmail,
    },
  };

  const cartRow = await createHumanPremiumReportDraft(
    { ...input, reportType: items[0] },
    {
      status: "paid",
      paymentProvider: "demo",
      paymentOrderId: orderId,
      checkoutSessionId: `cart:${orderId}`,
      amountPaid: amount,
      amountOriginal: amount,
      currency: "KRW",
    }
  );

  const updated = await updateHumanPremiumReport(cartRow.id, {
    birth_basis: birthBasis,
    payment_capture_id: `demo-cart-${cartRow.id}`,
  });

  return { orderId, cartRow: updated, amount };
}

export async function generateCartReportItem(options: {
  orderId: string;
  reportType: ReportType;
  userId?: string | null;
  request?: Request | null;
}): Promise<{ reportId: string; webUrl: string; reportType: ReportType }> {
  const cartRow = await getHumanPremiumReportByPaymentOrderId(options.orderId);
  if (!cartRow) throw new Error("Cart order not found.");

  const cart = getCartMeta(cartRow);
  if (!cart) throw new Error("Invalid cart order.");
  if (!cart.items.includes(options.reportType)) {
    throw new Error("Report type not in cart.");
  }

  const existing = cart.generated[options.reportType];
  if (existing) {
    const report = await getHumanPremiumReportById(existing.reportId);
    if (report?.report_payload) {
      return {
        reportId: report.id,
        webUrl: buildHumanPremiumReportUrl(report, options.request),
        reportType: options.reportType,
      };
    }
    if (report) {
      return finalizeCartReportItem({
        cartRow,
        cart,
        report,
        reportType: options.reportType,
        request: options.request,
        deliverEmail: cart.deliverEmail,
      });
    }
  }

  const sessionId = `cart-item:${options.orderId}:${options.reportType}`;
  const priorDraft = await getHumanPremiumReportByCheckoutSession(sessionId);
  if (priorDraft) {
    if (priorDraft.report_payload) {
      return registerCartGeneratedItem({
        cartRow,
        cart,
        report: priorDraft,
        reportType: options.reportType,
        request: options.request,
      });
    }
    return finalizeCartReportItem({
      cartRow,
      cart,
      report: priorDraft,
      reportType: options.reportType,
      request: options.request,
      deliverEmail: cart.deliverEmail,
    });
  }

  const input: HumanPremiumReportInput = {
    personName: cartRow.person_name,
    email: cartRow.email,
    birthDate: cartRow.birth_date,
    birthTime: cartRow.birth_time,
    birthTimeUnknown: cartRow.birth_time_unknown,
    timezone: cartRow.birth_timezone,
    calendarType: cartRow.calendar_type,
    locale: cartRow.locale,
    privacyConsent: cartRow.privacy_consent,
    gender: cartRow.birth_basis?.gender ?? null,
    userId: options.userId ?? cartRow.user_id,
    reportType: options.reportType,
  };

  const paymentId = `${options.orderId}_${options.reportType}_${randomBytes(4).toString("hex")}`;
  const draft = await createHumanPremiumReportDraft(input, {
    status: "payment_pending",
    paymentProvider: cartRow.payment_provider ?? "demo",
    paymentOrderId: paymentId,
    checkoutSessionId: `cart-item:${options.orderId}:${options.reportType}`,
    amountPaid: 0,
    amountOriginal: 0,
    currency: "KRW",
  });

  const completed = await completeHumanPremiumPayment(
    draft,
    {
      provider: cartRow.payment_provider ?? "demo",
      orderId: paymentId,
      captureId: `cart-item-cap-${draft.id}`,
      amountPaid: 0,
    },
    { sendEmail: cart.deliverEmail, request: options.request }
  );

  return registerCartGeneratedItem({
    cartRow,
    cart,
    report: completed.row,
    reportType: options.reportType,
    request: options.request,
    webUrl: completed.webUrl,
  });
}

async function registerCartGeneratedItem(options: {
  cartRow: HumanPremiumReportRow;
  cart: HumanPremiumCartMeta;
  report: HumanPremiumReportRow;
  reportType: ReportType;
  request?: Request | null;
  webUrl?: string;
}) {
  const nextGenerated = {
    ...options.cart.generated,
    [options.reportType]: {
      reportId: options.report.id,
      webToken: options.report.web_access_token,
    },
  };

  await updateHumanPremiumReport(options.cartRow.id, {
    birth_basis: {
      ...options.cartRow.birth_basis,
      cart: {
        ...options.cart,
        generated: nextGenerated,
      },
    },
  });

  return {
    reportId: options.report.id,
    webUrl:
      options.webUrl ?? buildHumanPremiumReportUrl(options.report, options.request),
    reportType: options.reportType,
  };
}

async function finalizeCartReportItem(options: {
  cartRow: HumanPremiumReportRow;
  cart: HumanPremiumCartMeta;
  report: HumanPremiumReportRow;
  reportType: ReportType;
  request?: Request | null;
  deliverEmail: boolean;
}) {
  const paymentId =
    options.report.payment_order_id ??
    `${options.cartRow.payment_order_id}_${options.reportType}_${randomBytes(4).toString("hex")}`;

  const completed = await completeHumanPremiumPayment(
    options.report,
    {
      provider: options.cartRow.payment_provider ?? "demo",
      orderId: paymentId,
      captureId: options.report.payment_capture_id ?? `cart-item-retry-${options.report.id}`,
      amountPaid: 0,
    },
    { sendEmail: options.deliverEmail, request: options.request }
  );

  return registerCartGeneratedItem({
    cartRow: options.cartRow,
    cart: options.cart,
    report: completed.row,
    reportType: options.reportType,
    request: options.request,
    webUrl: completed.webUrl,
  });
}

export function parseCartParentOrderId(paymentOrderId: string | null | undefined): string | null {
  if (!paymentOrderId?.startsWith("hp_cart_")) return null;
  if (/^hp_cart_[a-f0-9]{20}$/.test(paymentOrderId)) return paymentOrderId;
  const match = paymentOrderId.match(/^(hp_cart_[a-f0-9]{20})_/);
  return match?.[1] ?? null;
}

export async function pregenerateAllCartReports(options: {
  orderId: string;
  userId?: string | null;
  request?: Request | null;
}): Promise<{ generated: ReportType[]; failed: ReportType[] }> {
  const cartRow = await getHumanPremiumReportByPaymentOrderId(options.orderId);
  if (!cartRow) throw new Error("Cart order not found.");

  const cart = getCartMeta(cartRow);
  if (!cart) throw new Error("Invalid cart order.");

  const generated: ReportType[] = [];
  const failed: ReportType[] = [];

  for (const reportType of cart.items) {
    const freshRow = await getHumanPremiumReportByPaymentOrderId(options.orderId);
    const freshCart = freshRow ? getCartMeta(freshRow) : null;
    if (freshCart?.generated[reportType]) {
      generated.push(reportType);
      continue;
    }
    try {
      await generateCartReportItem({
        orderId: options.orderId,
        reportType,
        userId: options.userId,
        request: options.request,
      });
      generated.push(reportType);
    } catch {
      failed.push(reportType);
    }
  }

  return { generated, failed };
}

export async function listHumanPremiumVaultOrders(options: {
  userId?: string | null;
  email?: string | null;
  orderIds?: string[];
}) {
  const rows = await listHumanPremiumCartOrderRows(options);
  const orders = rows
    .map((row) => {
      const snapshot = cartOrderSnapshot(row);
      if (!snapshot) return null;
      return {
        ...snapshot,
        createdAt: row.created_at,
        expiresAt: humanPremiumWebExpiresAt(new Date(row.created_at).getTime()),
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry?.orderId));

  orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const seen = new Set<string>();
  return orders.filter((order): order is typeof order & { orderId: string } => {
    if (!order.orderId || seen.has(order.orderId)) return false;
    seen.add(order.orderId);
    return true;
  });
}

export function cartOrderSnapshot(row: HumanPremiumReportRow) {
  const cart = getCartMeta(row);
  if (!cart) return null;
  return {
    orderId: row.payment_order_id,
    amount: Number(row.amount_paid ?? 0),
    items: cart.items,
    generated: cart.generated,
    deliverEmail: cart.deliverEmail,
    personName: row.person_name,
    email: row.email,
    locale: row.locale,
    birthDate: row.birth_date,
    birthTime: row.birth_time,
    birthTimeUnknown: row.birth_time_unknown,
  };
}
