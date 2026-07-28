import {
  isHumanPremiumDemoBackendReady,
  isHumanPremiumDemoCheckoutAllowed,
} from "@/lib/payments/human-premium-demo";
import { isPortOneConfigured } from "@/lib/payments/portone/config";
import { NextResponse } from "next/server";

export async function GET() {
  const demoAllowed = isHumanPremiumDemoCheckoutAllowed();
  return NextResponse.json({
    portone: isPortOneConfigured(),
    demoAllowed,
    demoReady: isHumanPremiumDemoBackendReady(),
  });
}
