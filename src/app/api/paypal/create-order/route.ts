import { createPremiumOrder } from "@/lib/paypal/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const order = await createPremiumOrder();
    return NextResponse.json(order);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Create order failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
