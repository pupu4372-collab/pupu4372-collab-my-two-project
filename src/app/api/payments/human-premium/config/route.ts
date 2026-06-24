import { isHumanPremiumDemoCheckoutEnabled } from "@/lib/payments/human-premium-demo";
import { isPayPalLinkConfigured } from "@/lib/payments/paypal-links";
import { isPortOneConfigured } from "@/lib/payments/portone/config";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    portone: isPortOneConfigured(),
    paypalLink: isPayPalLinkConfigured(),
    demoAllowed: isHumanPremiumDemoCheckoutEnabled(),
  });
}
