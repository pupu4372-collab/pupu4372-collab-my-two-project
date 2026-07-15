/**
 * Catalog/DB amounts → PortOne V2 totalAmount units.
 * KRW = won (1×), USD = ISO minor units / cents (×100).
 * Safe for client and server.
 */
export function catalogAmountToPortOneTotal(
  catalogAmount: number,
  currency: string | null | undefined
): number {
  const code = String(currency ?? "").trim().toUpperCase();
  if (code === "USD" || code === "CURRENCY_USD") {
    return Math.round(catalogAmount * 100);
  }
  return Math.round(catalogAmount);
}
