/**
 * Local / non-production unlock API may short-circuit to unlocked for DX.
 * Set DISABLE_PET_UNLOCK_DEV_BYPASS=true to exercise real SKU checks in dev.
 *
 * Vercel production AND preview builds run with NODE_ENV=production — bypass is off.
 */
export function isPetUnlockDevBypassActive(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  if (process.env.DISABLE_PET_UNLOCK_DEV_BYPASS === "true") return false;
  return true;
}
