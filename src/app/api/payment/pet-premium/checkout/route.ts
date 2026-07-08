import { getRegisteredUserIdFromRequest } from "@/lib/supabase/auth-server";
import { NextResponse } from "next/server";

/** Gate before PortOne: registered (non-anonymous) session required. */
export async function POST(request: Request) {
  const userId = await getRegisteredUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let body: { product_code?: string } = {};
  try {
    body = (await request.json()) as { product_code?: string };
  } catch {
    // empty body is fine for pet_premium_v1 default
  }

  if (body.product_code && body.product_code !== "pet_premium_v1") {
    return NextResponse.json({ error: "unknown product" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
