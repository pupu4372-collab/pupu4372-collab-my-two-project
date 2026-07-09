import {
  hasPetPremiumUnlock,
} from "@/lib/payments/portone/entitlement";
import {
  PET_MBTI_STANDALONE_CODE,
  PET_PACKAGE_UNLOCK_CODES,
  type PetUnlockScope,
} from "@/lib/payments/pet-product-catalog";
import {
  createUserSupabaseClient,
  getBearerToken,
  getRegisteredUserIdFromRequest,
} from "@/lib/supabase/auth-server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { isPetUnlockDevBypassActive } from "@/lib/payments/pet-unlock-dev-bypass";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
};

function resolveUnlockScope(value: string | null): PetUnlockScope {
  return value === "mbti" ? "mbti" : "package";
}

export async function GET(request: Request) {
  if (isPetUnlockDevBypassActive()) {
    return NextResponse.json({ unlocked: true, devBypass: true }, { headers: NO_STORE_HEADERS });
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

  const productCode =
    scope === "mbti" ? PET_MBTI_STANDALONE_CODE : PET_PACKAGE_UNLOCK_CODES[0];

  const unlocked = await hasPetPremiumUnlock(
    userClient,
    userId,
    productCode,
    petId || null
  );

  return NextResponse.json({ unlocked, scope }, { headers: NO_STORE_HEADERS });
}
