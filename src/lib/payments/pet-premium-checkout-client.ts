import type { PetProductCode } from "@/lib/payments/pet-product-catalog";
import { PET_PREMIUM_PACKAGE_CODE } from "@/lib/payments/pet-product-catalog";

export type PetPremiumCheckoutResult =
  | { ok: true }
  | { ok: false; status: number; error: string };

export async function assertPetPremiumCheckoutAllowed(
  accessToken: string | null,
  productCode: PetProductCode = PET_PREMIUM_PACKAGE_CODE
): Promise<PetPremiumCheckoutResult> {
  if (!accessToken) {
    return { ok: false, status: 401, error: "login_required" };
  }

  try {
    const res = await fetch("/api/payment/pet-premium/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ product_code: productCode }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      return { ok: false, status: res.status, error: data.error ?? "checkout_denied" };
    }

    return { ok: true };
  } catch {
    return { ok: false, status: 0, error: "network_error" };
  }
}
