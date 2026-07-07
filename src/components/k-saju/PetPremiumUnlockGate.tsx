"use client";

import { PetPremiumPaywall } from "@/components/k-saju/PetPremiumPaywall";
import { PetPremiumUnlockSkeleton } from "@/components/k-saju/PetPremiumUnlockSkeleton";
import { usePetPremiumUnlock } from "@/hooks/usePetPremiumUnlock";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import type { PetPremiumContinuation, PetPremiumReturnTo } from "@/lib/payments/pet-premium-unlock-client";
import type { Locale } from "@/lib/saju/types";

type Props = {
  locale: Locale;
  petId?: string | null;
  continuation: Omit<PetPremiumContinuation, "returnTo" | "locale">;
  returnTo?: PetPremiumReturnTo;
  children: React.ReactNode;
};

export function PetPremiumUnlockGate({ locale, petId, continuation, returnTo, children }: Props) {
  const { ready, accessToken, configured, isAnonymous } = useSupabaseSession();
  const checkEnabled = configured && ready && !isAnonymous;
  const { loading, unlocked, loginRequired } = usePetPremiumUnlock(
    petId,
    accessToken,
    checkEnabled
  );

  if (configured && ready && isAnonymous) {
    return (
      <PetPremiumPaywall
        locale={locale}
        continuation={{ ...continuation, locale }}
        returnTo={returnTo}
        loginRequired
      />
    );
  }

  if (!checkEnabled || loading) {
    return <PetPremiumUnlockSkeleton />;
  }

  if (loginRequired) {
    return (
      <PetPremiumPaywall
        locale={locale}
        continuation={{ ...continuation, locale }}
        returnTo={returnTo}
        loginRequired
      />
    );
  }

  if (!unlocked) {
    return (
      <PetPremiumPaywall
        locale={locale}
        continuation={{ ...continuation, locale }}
        returnTo={returnTo}
      />
    );
  }

  return <>{children}</>;
}
