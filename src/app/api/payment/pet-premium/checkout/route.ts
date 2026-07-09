import {
  isAllowedPetProductCode,
  PET_PREMIUM_PACKAGE_CODE,
} from "@/lib/payments/pet-product-catalog";
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
    // empty body defaults to pet_premium_v1
  }

  if (body.product_code && !isAllowedPetProductCode(body.product_code)) {
    return NextResponse.json({ error: "unknown product" }, { status: 400 });
  }

  const productCode = body.product_code ?? PET_PREMIUM_PACKAGE_CODE;

  return NextResponse.json({ ok: true, product_code: productCode });
}
