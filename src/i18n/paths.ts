/** Public paths for localePrefix "as-needed" (ko has no /ko prefix). */

export function getHomePath(locale: "ko" | "en"): string {
  return locale === "en" ? "/en" : "/";
}

export function getLoginPath(locale: "ko" | "en"): string {
  return locale === "en" ? "/en/login" : "/login";
}

/** Normalize legacy /ko/* redirects from older auth flows. */
export function normalizePostAuthPath(path: string | null | undefined): string {
  if (!path || path === "/profile") return "/";
  if (path === "/ko" || path === "/ko/") return "/";
  if (path === "/ko/login") return "/login";
  return path;
}

export function localeFromDocument(): "ko" | "en" {
  if (typeof document !== "undefined" && document.documentElement.lang === "en") {
    return "en";
  }
  return "ko";
}
