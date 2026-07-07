import type { PetPremiumReturnTo } from "@/lib/payments/pet-premium-return-to";

const CHECKOUT_KEY = "pet_premium_checkout_v1";
const PENDING_PAYMENT_KEY = "pet_premium_pending_payment_id";

export type PetPremiumCheckoutSnapshot = {
  continuationQuery: string;
  returnTo: PetPremiumReturnTo | null;
};

export function savePetPremiumCheckout(snapshot: PetPremiumCheckoutSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CHECKOUT_KEY, JSON.stringify(snapshot));
  } catch {
    // ignore quota / private mode
  }
}

export function readPetPremiumCheckout(): PetPremiumCheckoutSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CHECKOUT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PetPremiumCheckoutSnapshot;
  } catch {
    return null;
  }
}

export function savePendingPetPremiumPaymentId(paymentId: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(PENDING_PAYMENT_KEY, paymentId);
  } catch {
    // ignore
  }
}

export function readPendingPetPremiumPaymentId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(PENDING_PAYMENT_KEY);
  } catch {
    return null;
  }
}

export function clearPendingPetPremiumPaymentId(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(PENDING_PAYMENT_KEY);
  } catch {
    // ignore
  }
}
