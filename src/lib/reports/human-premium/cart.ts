import { randomBytes } from "node:crypto";
import { buildHumanPremiumReportUrl } from "./email";
import { resolveHumanPremiumEmail } from "./email-policy";
import { humanPremiumWebExpiresAt } from "./retention";
import { getCheckoutCurrency, isFullReportCart, resolveCartAmount } from "./pricing";
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
  HumanPremiumCartGeneratedItem,
  HumanPremiumCartMeta,
  HumanPremiumPaymentProvider,
  HumanPremiumReportInput,
  HumanPremiumReportRow,
  ReportType,
} from "./types";
import { normalizeReportTypeKey } from "./types";

const PAID_CART_STATUSES = new Set([
  "paid",
  "ready",
  "email_sent",
  "email_failed",
  "generating",
]);

function isFulfilledCartRow(row: HumanPremiumReportRow): boolean {
  return PAID_CART_STATUSES.has(row.status);
}

export function parseCartReportTypes(value: unknown): ReportType[] {
  if (!Array.isArray(value)) return [];
  const items: ReportType[] = [];
  for (const entry of value) {
    if (typeof entry !== "string") continue;
    const type = normalizeReportTypeKey(entry);
    if (!type || items.includes(type)) continue;
    items.push(type);
  }
  return items;
}

function normalizeCartMeta(cart: HumanPremiumCartMeta): HumanPremiumCartMeta {
  const items = parseCartReportTypes(cart.items);
  const generated: Partial<Record<ReportType, HumanPremiumCartGeneratedItem>> = {
    ...cart.generated,
  };
  const legacyWeekly = (cart.generated as Record<string, HumanPremiumCartGeneratedItem | undefined>)
    .weekly;
  if (legacyWeekly && !generated.decade) {
    generated.decade = legacyWeekly;
  }
  delete (generated as Record<string, unknown>).weekly;
  return { ...cart, items, generated };
}

function getCartMeta(row: HumanPremiumReportRow): HumanPremiumCartMeta | null {
  const cart = row.birth_basis?.cart;
  if (!cart?.cartOrder || !Array.isArray(cart.items)) return null;
  return normalizeCartMeta(cart);
}

export function isHumanPremiumCartOrderRow(row: HumanPremiumReportRow): boolean {
  return Boolean(getCartMeta(row));
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
    if (!isFulfilledCartRow(row)) continue;
    if (!rowMatchesBirthProfile(row, input)) continue;
    const cart = getCartMeta(row);
    if (!cart) continue;
    for (const item of cart.items) types.add(item);
  }
  return types;
}

async function buildCartOrderDraft(
  body: Record<string, unknown>,
  userId: string | null | undefined,
  options: {
    status: "paid" | "payment_pending";
    paymentProvider: HumanPremiumPaymentProvider | null;
    pgProvider?: string | null;
    captureId?: string | null;
  }
): Promise<{ orderId: string; cartRow: HumanPremiumReportRow; amount: number; items: ReportType[] }> {
  const items = parseCartReportTypes(body.cartItems);
  if (!items.length) throw new Error("cartItems required.");

  const input = parseHumanPremiumReportInput(body, userId);
  const { email, deliverEmail } = resolveHumanPremiumEmail(body.email);

  let effectiveItems = items;
  if (userId) {
    const orders = await listHumanPremiumVaultOrders({ userId });
    const purchased = new Set<ReportType>();
    for (const order of orders) {
      for (const item of order.items) purchased.add(item);
    }
    const excluded = items.filter((item) => purchased.has(item));
    effectiveItems = items.filter((item) => !purchased.has(item));
    if (!effectiveItems.length) {
      throw new Error("cart_items_already_purchased");
    }
    if (excluded.length) {
      console.error("[HUMAN_CART_PURCHASED_EXCLUDED]", {
        userId,
        excluded,
        remaining: effectiveItems,
      });
    }
  } else {
    // TODO: email-based purchased exclusion for guests / anonymous sessions
    const purchased = await getPurchasedReportTypesForInput(input, userId, email);
    const duplicates = items.filter((item) => purchased.has(item));
    if (duplicates.length) {
      throw new Error("cart_items_already_purchased");
    }
  }

  const amount = resolveCartAmount(effectiveItems, input.locale);
  const currency = getCheckoutCurrency(input.locale);
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
      items: effectiveItems,
      generated: {},
      deliverEmail,
    },
  };

  const cartRow = await createHumanPremiumReportDraft(
    { ...input, reportType: effectiveItems[0] },
    {
      status: options.status,
      paymentProvider: options.paymentProvider,
      pgProvider: options.pgProvider ?? null,
      paymentOrderId: orderId,
      checkoutSessionId: `cart:${orderId}`,
      amountPaid: amount,
      amountOriginal: amount,
      currency,
    }
  );

  const updated = await updateHumanPremiumReport(cartRow.id, {
    birth_basis: birthBasis,
    ...(options.captureId ? { payment_capture_id: options.captureId } : {}),
  });

  return { orderId, cartRow: updated, amount, items: effectiveItems };
}

/** Demo / bypass: create an already-paid cart parent order. */
export async function createPaidCartOrder(
  body: Record<string, unknown>,
  userId?: string | null
): Promise<{ orderId: string; cartRow: HumanPremiumReportRow; amount: number }> {
  const { orderId, cartRow, amount } = await buildCartOrderDraft(body, userId, {
    status: "paid",
    paymentProvider: "demo",
    captureId: undefined,
  });

  const updated = await updateHumanPremiumReport(cartRow.id, {
    payment_capture_id: `demo-cart-${cartRow.id}`,
  });

  return { orderId, cartRow: updated, amount };
}

/** PortOne: create payment_pending cart parent; amount from resolveCartAmount only. */
export async function createPendingCartOrder(
  body: Record<string, unknown>,
  userId?: string | null
): Promise<{ orderId: string; cartRow: HumanPremiumReportRow; amount: number; items: ReportType[] }> {
  return buildCartOrderDraft(body, userId, {
    status: "payment_pending",
    paymentProvider: "card_pg",
    pgProvider: "portone",
  });
}

export function cartOrderDisplayName(
  items: ReportType[],
  locale: "ko" | "en" = "ko"
): string {
  if (isFullReportCart(items)) {
    return locale === "ko" ? "K-Saju 올인원 번들" : "K-Saju all-in-one bundle";
  }
  return locale === "ko" ? "K-Saju 리포트 장바구니" : "K-Saju report cart";
}

/** Mark pending cart paid after PortOne verify/webhook. Idempotent. */
export async function fulfillPaidCartOrder(options: {
  orderId: string;
  captureId: string;
  provider?: HumanPremiumPaymentProvider;
}): Promise<{ orderId: string; cartRow: HumanPremiumReportRow; amount: number }> {
  const cartRow = await getHumanPremiumReportByPaymentOrderId(options.orderId);
  if (!cartRow) throw new Error("Cart order not found.");
  if (!getCartMeta(cartRow)) throw new Error("Invalid cart order.");

  if (isFulfilledCartRow(cartRow)) {
    return {
      orderId: options.orderId,
      cartRow,
      amount: Number(cartRow.amount_paid ?? cartRow.amount_original ?? 0),
    };
  }

  if (cartRow.status !== "payment_pending") {
    throw new Error(`Cart order status is ${cartRow.status}, cannot fulfill.`);
  }

  const updated = await updateHumanPremiumReport(cartRow.id, {
    status: "paid",
    payment_provider: options.provider ?? cartRow.payment_provider ?? "card_pg",
    payment_capture_id: options.captureId,
  });

  return {
    orderId: options.orderId,
    cartRow: updated,
    amount: Number(updated.amount_paid ?? updated.amount_original ?? 0),
  };
}

export async function generateCartReportItem(options: {
  orderId: string;
  reportType: ReportType;
  userId?: string | null;
  request?: Request | null;
}): Promise<{ reportId: string; webUrl: string; reportType: ReportType }> {
  const cartRow = await getHumanPremiumReportByPaymentOrderId(options.orderId);
  if (!cartRow) throw new Error("Cart order not found.");
  if (!isFulfilledCartRow(cartRow)) {
    throw new Error("Cart order is not paid.");
  }

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
    .filter((row) => isFulfilledCartRow(row))
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
    currency: row.currency ?? "KRW",
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
