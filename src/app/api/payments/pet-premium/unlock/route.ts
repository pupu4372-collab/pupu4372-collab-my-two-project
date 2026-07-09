import {
  hasAnyPetProductUnlock,
  hasPetPremiumUnlock,
} from "@/lib/payments/portone/entitlement";
import {
  PET_MBTI_UNLOCK_CODES,
  PET_PACKAGE_UNLOCK_CODES,
  type PetProductCode,
  type PetUnlockScope,
} from "@/lib/payments/pet-product-catalog";
import {
  createUserSupabaseClient,
  getBearerToken,
  getRegisteredUserIdFromRequest,
} from "@/lib/supabase/auth-server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
};

function resolveUnlockScope(value: string | null): PetUnlockScope {
  return value === "mbti" ? "mbti" : "package";
}

export async function GET(request: Request) {
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.json({ unlocked: true }, { headers: NO_STORE_HEADERS });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { unlocked: false, reason: "service_unavailable" },
      { headers: NO_STORE_HEADERS }
    );
  }

  const userId = await getRegisteredUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json(
      { unlocked: false, reason: "login_required" },
      { headers: NO_STORE_HEADERS }
    );
  }

  const { searchParams } = new URL(request.url);
  const petId = searchParams.get("petId");
  const scope = resolveUnlockScope(searchParams.get("scope"));

  const token = getBearerToken(request);
  const userClient = token ? createUserSupabaseClient(token) : null;
  if (!userClient) {
    return NextResponse.json(
      { unlocked: false, reason: "login_required" },
      { headers: NO_STORE_HEADERS }
    );
  }

  const productCodes: readonly PetProductCode[] =
    scope === "mbti" ? PET_MBTI_UNLOCK_CODES : PET_PACKAGE_UNLOCK_CODES;

  const unlocked =
    scope === "mbti"
      ? await hasAnyPetProductUnlock(userClient, userId, productCodes, petId || null)
      : await hasPetPremiumUnlock(userClient, userId, PET_PACKAGE_UNLOCK_CODES[0], petId || null);

  return NextResponse.json({ unlocked, scope }, { headers: NO_STORE_HEADERS });
}
