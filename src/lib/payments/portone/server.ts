import {
  getPortOneApiSecret,
  isPortOneConfigured,
  PORTONE_API_BASE,
} from "./config";

export interface PortOnePaymentSnapshot {
  id: string;
  status: string;
  amount: { total: number };
  currency: string;
  customData?: Record<string, unknown> | null;
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
