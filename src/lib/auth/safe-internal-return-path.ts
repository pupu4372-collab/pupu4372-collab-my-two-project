/** Allow only same-origin relative paths (no protocol / host / open redirects). */
export function getSafeInternalReturnPath(value: string | null | undefined): string {
  if (!value) return "/";
  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return "/";
  if (trimmed.includes("\\")) return "/";
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) return "/";

  if (trimmed === "/ko" || trimmed === "/en") return "/";
  if (trimmed.startsWith("/ko/")) return trimmed.slice(3) || "/";
  if (trimmed.startsWith("/en/")) return trimmed.slice(3) || "/";

  return trimmed;
}
