import {
  hasAnyPetProductUnlock,
  hasPetPremiumUnlock,
} from "@/lib/payments/portone/entitlement";
import {
  PET_MBTI_UNLOCK_CODES,
  PET_PACKAGE_UNLOCK_CODES,
  PET_PREMIUM_PACKAGE_CODE,
  type PetProductCode,
} from "@/lib/payments/pet-product-catalog";
import {
  createUserSupabaseClient,
  getBearerToken,
  getUserIdFromRequest,
} from "@/lib/supabase/auth-server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export type PetPremiumLlmGateError = {
  status: number;
  error: string;
};

/** Production/preview: require Supabase + login + premium unlock. Dev: bypass gate. */
export async function checkPetPremiumLlmGate(
  request: Request,
  petId?: string | null,
  allowedProductCodes: readonly PetProductCode[] = PET_PACKAGE_UNLOCK_CODES
): Promise<PetPremiumLlmGateError | null> {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  if (!isSupabaseConfigured()) {
    return { status: 503, error: "premium_service_unavailable" };
  }

  const userId = await getUserIdFromRequest(request);
  const token = getBearerToken(request);
  const userClient = token ? createUserSupabaseClient(token) : null;

  if (!userId || !userClient) {
    return { status: 401, error: "login_required" };
  }

  const unlocked =
    allowedProductCodes.length === 1 && allowedProductCodes[0] === PET_PREMIUM_PACKAGE_CODE
      ? await hasPetPremiumUnlock(userClient, userId, PET_PREMIUM_PACKAGE_CODE, petId ?? null)
      : await hasAnyPetProductUnlock(userClient, userId, allowedProductCodes, petId ?? null);

  if (!unlocked) {
    return { status: 403, error: "premium_required" };
  }

  return null;
}

/** MBTI premium API gate — pet_mbti_v1 OR pet_premium_v1. */
export function checkPetMbtiLlmGate(request: Request, petId?: string | null) {
  return checkPetPremiumLlmGate(request, petId, PET_MBTI_UNLOCK_CODES);
}
