/** Public paths when localePrefix is "always". */

export function getHomePath(locale: "ko" | "en"): string {
  return locale === "en" ? "/en" : "/ko";
}

export function getLoginPath(locale: "ko" | "en"): string {
  return locale === "en" ? "/en/login" : "/ko/login";
}

/** Normalize legacy auth callback targets. */
export function normalizePostAuthPath(path: string | null | undefined): string {
  if (!path || path === "/profile") return "/ko";
  if (path === "/" || path === "/login") return "/ko";
  return path;
}

export function localeFromDocument(): "ko" | "en" {
  if (typeof document !== "undefined" && document.documentElement.lang === "en") {
    return "en";
  }
  return "ko";
}
