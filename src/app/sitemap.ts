import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import type { MetadataRoute } from "next";

const HOST = "https://ksajupet.com";

/** Public marketing / channel routes (no login, vault, admin, or API). */
const PUBLIC_PATHS = [
  "/",
  "/saju",
  "/dog",
  "/cat",
  "/reptile",
  "/community",
  "/pricing",
  "/about",
  "/premium/human",
] as const;

type AppPathname = (typeof PUBLIC_PATHS)[number];

function absoluteUrl(locale: (typeof routing.locales)[number], href: AppPathname): string {
  const path = getPathname({ locale, href });
  return `${HOST}${path}`;
}

function languageAlternates(href: AppPathname): Record<string, string> {
  return {
    ko: absoluteUrl("ko", href),
    en: absoluteUrl("en", href),
    "x-default": absoluteUrl(routing.defaultLocale, href),
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const href of PUBLIC_PATHS) {
    const languages = languageAlternates(href);
    for (const locale of routing.locales) {
      entries.push({
        url: absoluteUrl(locale, href),
        lastModified: new Date(),
        alternates: { languages },
      });
    }
  }

  return entries;
}
