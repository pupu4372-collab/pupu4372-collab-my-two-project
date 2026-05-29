"use client";

import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { Link } from "@/i18n/navigation";
import type { ComponentProps } from "react";

type LinkProps = ComponentProps<typeof Link>;

export function AuthRequiredLink({ href, ...props }: LinkProps) {
  const { ready, configured, isAnonymous } = useSupabaseSession();
  const nextHref = configured && ready && isAnonymous ? "/login" : href;

  return <Link href={nextHref} {...props} />;
}
