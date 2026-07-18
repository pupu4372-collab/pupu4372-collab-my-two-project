import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

/** Bare `/` with no preference: skip Accept-Language so IP/default wins. */
const handleRootFirstVisitKo = createMiddleware({
  ...routing,
  localeDetection: false,
});

function hasLocalePreferenceCookie(request: NextRequest): boolean {
  const value = request.cookies.get("NEXT_LOCALE")?.value;
  return (
    value != null &&
    routing.locales.includes(value as (typeof routing.locales)[number])
  );
}

/** Vercel geo header → locale. Missing header (local) → default ko. */
function localeFromIpCountry(request: NextRequest): "ko" | "en" {
  const country = request.headers.get("x-vercel-ip-country")?.trim().toUpperCase();
  if (!country) return routing.defaultLocale;
  return country === "KR" ? "ko" : "en";
}

function isSearchBot(request: NextRequest): boolean {
  const ua = request.headers.get("user-agent")?.toLowerCase() ?? "";
  return /googlebot|bingbot|yeti|naverbot|daum|kakaotalk-scrap|slurp|duckduckbot|baiduspider|yandexbot|applebot|facebookexternalhit|twitterbot/.test(
    ua
  );
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bare root, no NEXT_LOCALE: bots stay on ko; humans use geo (KR→ko, else→/en).
  if (pathname === "/" && !hasLocalePreferenceCookie(request)) {
    if (isSearchBot(request)) {
      return handleRootFirstVisitKo(request);
    }

    const locale = localeFromIpCountry(request);
    if (locale === "en") {
      // as-needed keeps default (ko) unprefixed; force /en for non-KR.
      const url = request.nextUrl.clone();
      url.pathname = "/en";
      return NextResponse.redirect(url);
    }
    return handleRootFirstVisitKo(request);
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: ["/((?!api|auth|_next|_vercel|.*\\..*).*)"],
};
