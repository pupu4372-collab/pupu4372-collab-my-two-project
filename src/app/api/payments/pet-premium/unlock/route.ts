import { hasPetPremiumUnlock } from "@/lib/payments/portone/entitlement";
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

  const token = getBearerToken(request);
  const userClient = token ? createUserSupabaseClient(token) : null;
  if (!userClient) {
    return NextResponse.json(
      { unlocked: false, reason: "login_required" },
      { headers: NO_STORE_HEADERS }
    );
  }

  const unlocked = await hasPetPremiumUnlock(
    userClient,
    userId,
    "pet_premium_v1",
    petId || null
  );

  return NextResponse.json({ unlocked }, { headers: NO_STORE_HEADERS });
}
