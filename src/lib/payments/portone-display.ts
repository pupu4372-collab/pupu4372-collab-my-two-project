/**
 * PortOne V2 payment window display helpers.
 * Does not change amount / product / verify payloads — only how the PG UI is shown.
 *
 * Docs pattern: PC IFRAME (modal), mobile REDIRECTION (full page + redirectUrl).
 */

export const PORTONE_WINDOW_TYPE = {
  pc: "IFRAME",
  mobile: "REDIRECTION",
} as const;

/** Current page URL with prior PortOne return query keys stripped. */
export function buildPortOnePageRedirectUrl(
  href: string | undefined = typeof window !== "undefined" ? window.location.href : undefined,
): string | undefined {
  if (!href) return undefined;
  try {
    const url = new URL(href);
    for (const key of ["paymentId", "code", "message", "pgCode", "pgMessage"] as const) {
      url.searchParams.delete(key);
    }
    return url.toString();
  } catch {
    return undefined;
  }
}

/** Spread into PortOne.requestPayment for mobile-safe display. */
export function portOnePaymentDisplayOptions(redirectHref?: string): {
  windowType: typeof PORTONE_WINDOW_TYPE;
  redirectUrl?: string;
} {
  const redirectUrl = buildPortOnePageRedirectUrl(redirectHref);
  return {
    windowType: PORTONE_WINDOW_TYPE,
    ...(redirectUrl ? { redirectUrl } : {}),
  };
}
