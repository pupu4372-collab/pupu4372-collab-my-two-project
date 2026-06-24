export function isHumanPremiumDemoCheckoutEnabled(): boolean {
  const flag = process.env.HUMAN_PREMIUM_DEMO_CHECKOUT?.trim();
  if (flag === "0" || flag === "false") return false;
  if (flag === "1" || flag === "true") return true;
  return true;
}
