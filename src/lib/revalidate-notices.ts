import { revalidatePath } from "next/cache";

/**
 * Invalidate SSG caches for pages that read `notices`.
 * next-intl `localePrefix: "as-needed"` + `defaultLocale: "ko"`:
 *   ko → unprefixed (`/`, `/support`, …)
 *   en → `/en/...`
 *
 * Dynamic route patterns require the second arg `'page'` (Next.js 15).
 * Failures must not break admin notice writes.
 */
export function revalidateNoticePages(options?: { noticeId?: string }): void {
  try {
    // Literal URL paths (both locales)
    const literalPaths = [
      "/",
      "/en",
      "/support",
      "/en/support",
      "/community",
      "/en/community",
    ];

    for (const path of literalPaths) {
      revalidatePath(path);
    }

    // App Router file patterns under `[locale]` (covers generateStaticParams locales)
    revalidatePath("/[locale]", "page");
    revalidatePath("/[locale]/support", "page");
    revalidatePath("/[locale]/community", "page");
    revalidatePath("/[locale]/support/notices/[id]", "page");

    const noticeId = options?.noticeId?.trim();
    if (noticeId) {
      revalidatePath(`/support/notices/${noticeId}`);
      revalidatePath(`/en/support/notices/${noticeId}`);
    }
  } catch (err) {
    console.error("[revalidate-notices] failed", {
      noticeId: options?.noticeId ?? null,
      message: err instanceof Error ? err.message : String(err),
    });
  }
}
