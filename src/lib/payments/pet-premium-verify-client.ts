export type PetPremiumVerifyResult =
  | { ok: true }
  | { ok: false; status: number; error: string };

export async function verifyPetPremiumPayment(input: {
  paymentId: string;
  petId: string | null;
  accessToken: string | null;
}): Promise<PetPremiumVerifyResult> {
  const { paymentId, petId, accessToken } = input;

  try {
    const res = await fetch("/api/payment/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({
        payment_id: paymentId,
        product_code: "pet_premium_v1",
        pet_id: petId,
      }),
    });

    const data = (await res.json().catch(() => ({}))) as { error?: string };

    if (!res.ok) {
      const error = data.error ?? "verify_failed";
      console.error(
        `[PET_PREMIUM_VERIFY_FAILED] paymentId=${paymentId} status=${res.status} error=${error}`
      );
      return { ok: false, status: res.status, error };
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "network_error";
    console.error(
      `[PET_PREMIUM_VERIFY_FAILED] paymentId=${paymentId} status=0 error=${message}`
    );
    return { ok: false, status: 0, error: message };
  }
}
