"use client";

import { getSafeInternalReturnPath } from "@/lib/auth/safe-internal-return-path";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

/** Guest-only vault notice: browser-local storage + signup CTA with return path. */
export function VaultGuestSignupBanner({
  returnPath,
  footer,
  className,
}: {
  /** Locale-free internal path, e.g. `/reports` or `/premium/human/vault`. */
  returnPath: string;
  /** Optional extra line (e.g. human web retention) inside the same block. */
  footer?: string;
  className?: string;
}) {
  const t = useTranslations("vaultGuest");
  const next = getSafeInternalReturnPath(returnPath);
  const signupHref = `/signup?next=${encodeURIComponent(next)}`;

  return (
    <section
      className={
        className ??
        "rounded-[1.5rem] border border-white/25 bg-white/15 px-5 py-4 text-left backdrop-blur-sm"
      }
      aria-label={t("title")}
    >
      <p className="text-sm font-extrabold text-white">{t("title")}</p>
      <p className="mt-2 text-sm leading-relaxed text-white/85 whitespace-pre-line">{t("body")}</p>
      {footer ? <p className="mt-2 text-sm leading-relaxed text-white/75">{footer}</p> : null}
      <Link
        href={signupHref}
        className="mt-4 inline-flex rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-105"
      >
        {t("signupCta")}
      </Link>
    </section>
  );
}
