import type { PetProductCode } from "@/lib/payments/pet-product-catalog";

export type PetPremiumVerifyResult =
  | { ok: true }
  | { ok: false; status: number; error: string; message: string };

const PET_VERIFY_KO: Record<string, string> = {
  custom_data_mismatch:
    "결제 정보 확인에 실패했습니다. 결제가 진행된 경우 고객센터로 문의해주세요.",
};

const PET_VERIFY_EN: Record<string, string> = {
  custom_data_mismatch:
    "Payment information could not be verified. If you were charged, please contact support.",
};

export function formatPetPremiumVerifyError(
  error: string,
  locale: "ko" | "en",
  fallback: string
): string {
  const map = locale === "en" ? PET_VERIFY_EN : PET_VERIFY_KO;
  return map[error] ?? fallback;
}

export async function verifyPetPremiumPayment(input: {
  paymentId: string;
  productCode: PetProductCode;
  petId: string | null;
  accessToken: string | null;
  locale?: "ko" | "en";
}): Promise<PetPremiumVerifyResult> {
  const { paymentId, productCode, petId, accessToken, locale = "ko" } = input;

  try {
    const res = await fetch("/api/payment/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({
        payment_id: paymentId,
        product_code: productCode,
        pet_id: petId,
      }),
    });

    const data = (await res.json().catch(() => ({}))) as { error?: string };

    if (!res.ok) {
      const error = data.error ?? "verify_failed";
      console.error(
        `[PET_PREMIUM_VERIFY_FAILED] paymentId=${paymentId} product_code=${productCode} status=${res.status} error=${error}`
      );
      return {
        ok: false,
        status: res.status,
        error,
        message: formatPetPremiumVerifyError(error, locale, error),
      };
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "network_error";
    console.error(
      `[PET_PREMIUM_VERIFY_FAILED] paymentId=${paymentId} product_code=${productCode} status=0 error=${message}`
    );
    return { ok: false, status: 0, error: message, message };
  }
}
