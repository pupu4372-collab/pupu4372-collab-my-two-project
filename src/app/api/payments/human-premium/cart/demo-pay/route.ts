import {
  isHumanPremiumDemoBackendReady,
  isHumanPremiumDemoCheckoutEnabled,
} from "@/lib/payments/human-premium-demo";
import { createPaidCartOrder, pregenerateAllCartReports } from "@/lib/reports/human-premium/cart";
import { formatHumanPremiumError } from "@/lib/reports/human-premium/client-errors";
import { getUserIdFromRequest } from "@/lib/supabase/auth-server";
import { NextResponse } from "next/server";
import { after } from "next/server";

export async function POST(request: Request) {
  if (!isHumanPremiumDemoCheckoutEnabled()) {
    return NextResponse.json({ error: "Demo checkout is disabled." }, { status: 403 });
  }
  if (!isHumanPremiumDemoBackendReady()) {
    return NextResponse.json({ error: "Supabase is not configured.", code: "supabase_missing" }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const locale = body.locale === "en" ? "en" : "ko";

  try {
    const userId = await getUserIdFromRequest(request);
    const { orderId, amount } = await createPaidCartOrder(body, userId);

    after(() => {
      void pregenerateAllCartReports({ orderId, userId, request }).catch(() => undefined);
    });

    return NextResponse.json({ orderId, amount, paid: true, demo: true });
  } catch (err) {
    const raw = err instanceof Error ? err.message : "Cart checkout failed.";
    return NextResponse.json({ error: formatHumanPremiumError(raw, locale) }, { status: 500 });
  }
}
