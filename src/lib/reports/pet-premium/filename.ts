import type { Locale } from "@/lib/saju/types";

const SITE_SLUG = "ksajupet";
const INVALID_FILENAME_CHARS = /[/\\:*?"<>|]/g;

/**
 * Build PDF download filenames for pet premium unified guide.
 * - display: localized filename (spaces removed)
 * - asciiFallback: ASCII-only fallback for Content-Disposition
 */
export function buildPetPremiumPdfFilename(
  petName: string,
  locale: Locale
): { display: string; asciiFallback: string } {
  const base =
    locale === "ko"
      ? `${petName.trim()}프리미엄케어가이드`
      : `${petName.trim()}-Premium-Care-Guide`;
  const cleanLabel = base.replace(/\s+/g, "").replace(INVALID_FILENAME_CHARS, "") || "PetPremiumCare";
  const display = `${cleanLabel}-${SITE_SLUG}.pdf`;
  const asciiFallback = `pet-premium-care-${SITE_SLUG}.pdf`;
  return { display, asciiFallback };
}
