"use client";

import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { Link } from "@/i18n/navigation";
import type { ComponentProps } from "react";

type LinkProps = ComponentProps<typeof Link>;

export function AuthRequiredLink({ href, onClick, className, tabIndex, ...props }: LinkProps) {
  const { ready, configured, isAnonymous } = useSupabaseSession();
  const isPending = !configured || !ready;
  const nextHref = isPending ? "#" : isAnonymous ? "/login" : href;
  const pendingClassName =
    typeof className === "string" && isPending
      ? `${className} cursor-wait opacity-60`
      : className;

  return (
    <Link
      {...props}
      href={nextHref as LinkProps["href"]}
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
