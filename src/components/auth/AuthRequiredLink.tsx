"use client";

import { getSafeInternalReturnPath } from "@/lib/auth/safe-internal-return-path";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { Link } from "@/i18n/navigation";
import type { ComponentProps } from "react";

type LinkProps = ComponentProps<typeof Link>;

function hrefToPath(href: LinkProps["href"]): string {
  if (typeof href === "string") return href;
  if (href && typeof href === "object" && "pathname" in href && typeof href.pathname === "string") {
    return href.pathname;
  }
  return "/";
}

/** Link that sends anonymous / signed-out users to login with `next` return path. */
export function AuthRequiredLink({ href, onClick, className, tabIndex, ...props }: LinkProps) {
  const { ready, configured, isAnonymous } = useSupabaseSession();
  const isPending = !configured || !ready;
  const returnPath = getSafeInternalReturnPath(hrefToPath(href));
  const nextHref = isPending
    ? "#"
    : isAnonymous
      ? (`/login?next=${encodeURIComponent(returnPath)}` as LinkProps["href"])
      : href;
  const pendingClassName =
    typeof className === "string" && isPending
      ? `${className} cursor-wait opacity-60`
      : className;

  return (
    <Link
      {...props}
      href={nextHref}
      aria-disabled={isPending || undefined}
      tabIndex={isPending ? -1 : tabIndex}
      className={pendingClassName}
      onClick={(event) => {
        if (isPending) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
    />
  );
}
