"use client";

import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { Link } from "@/i18n/navigation";
import {
  basicSajuResultHrefFromId,
} from "@/lib/saju/basic-saju-result-link";
import type { Locale } from "@/lib/saju/types";
import { useEffect, useState } from "react";

const LABEL = {
  ko: "← 사주 결과로 돌아가기",
  en: "← Back to saju result",
} as const;

type Props = {
  locale: Locale;
  sajuResultId?: string | null;
  petId?: string | null;
  className?: string;
};

export function PremiumHubBackToBasicLink({
  locale,
  sajuResultId,
  petId,
  className = "mb-4 inline-flex text-sm font-semibold text-white/90 underline-offset-2 hover:text-white hover:underline",
}: Props) {
  const t = LABEL[locale];
  const { ready, configured, accessToken, isAnonymous } = useSupabaseSession();
  const [resolvedId, setResolvedId] = useState<string | null>(sajuResultId ?? null);

  useEffect(() => {
    if (sajuResultId) {
      setResolvedId(sajuResultId);
      return;
    }

    if (!configured || !ready || isAnonymous || !accessToken || !petId) {
      setResolvedId(null);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch(
          `/api/profile/reports/latest-basic?petId=${encodeURIComponent(petId)}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!res.ok) return;
        const data = (await res.json()) as { id?: string | null };
        if (!cancelled) setResolvedId(data.id ?? null);
      } catch {
        // keep fallback href
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [accessToken, configured, isAnonymous, petId, ready, sajuResultId]);

  const href = basicSajuResultHrefFromId(resolvedId);

  return (
    <Link href={href} className={className}>
      {t}
    </Link>
  );
}
