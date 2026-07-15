import {
  getPortOneApiSecret,
  isPortOneConfigured,
  PORTONE_API_BASE,
} from "./config";

export { catalogAmountToPortOneTotal } from "./amount";

export interface PortOnePaymentSnapshot {
  id: string;
  status: string;
  amount: { total: number };
  currency: string;
  /** PortOne V2 returns an object; older payloads may stringify JSON. */
  customData?: Record<string, unknown> | string | null;
}

/** Parse PortOne payment customData whether object or JSON string. */
export function parsePortOneCustomData(
  customData: PortOnePaymentSnapshot["customData"]
): Record<string, unknown> | null {
  if (customData == null) return null;
  if (typeof customData === "object" && !Array.isArray(customData)) {
    return customData as Record<string, unknown>;
  }
  if (typeof customData === "string") {
    const trimmed = customData.trim();
    if (!trimmed) return null;
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return null;
    }
  }
  return null;
}

export async function fetchPortOnePayment(
  paymentId: string
): Promise<PortOnePaymentSnapshot | null> {
  if (!isPortOneConfigured()) return null;

  const secret = getPortOneApiSecret();
  if (!secret) return null;

  const response = await fetch(`${PORTONE_API_BASE}/payments/${encodeURIComponent(paymentId)}`, {
    headers: {
      Authorization: `PortOne ${secret}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) return null;
  return (await response.json()) as PortOnePaymentSnapshot;
}

/** True only when funds are captured — virtual-account issued is not paid yet. */
export function isPortOnePaymentPaid(payment: PortOnePaymentSnapshot): boolean {
  const status = payment.status?.toUpperCase() ?? "";
  return status === "PAID";
}

export function verifyPortOneAmount(
  payment: PortOnePaymentSnapshot,
  expectedAmount: number
): boolean {
  return Math.round(payment.amount?.total ?? 0) === Math.round(expectedAmount);
}
