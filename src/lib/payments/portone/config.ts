/** PortOne V2 — shop ID from console (used as `storeId` in browser SDK). */
export function getPortOneShopId(): string | null {
  return process.env.PORTONE_SHOP_ID?.trim() || null;
}

export function getPortOneApiSecret(): string | null {
  return process.env.PORTONE_API_SECRET?.trim() || null;
}

export function isPortOneConfigured(): boolean {
  return Boolean(getPortOneShopId() && getPortOneApiSecret());
}

export const PORTONE_API_BASE = "https://api.portone.io";
