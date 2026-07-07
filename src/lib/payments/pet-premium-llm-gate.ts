import { hasPetPremiumUnlock } from "@/lib/payments/portone/entitlement";
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
  petId?: string | null
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

  const unlocked = await hasPetPremiumUnlock(
    userClient,
    userId,
    "pet_premium_v1",
    petId ?? null
  );

  if (!unlocked) {
    return { status: 403, error: "premium_required" };
  }

  return null;
}
