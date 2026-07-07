"use client";

import { useEffect, useState } from "react";

export type PetPremiumUnlockStatus =
  | "idle"
  | "loading"
  | "unlocked"
  | "locked"
  | "login_required";

const POLL_INTERVAL_MS = 2500;
const MAX_POLL_ATTEMPTS = 5;

function shouldPollAfterPayment(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("premiumUnlockPoll") === "1";
}

async function fetchUnlockStatus(
  petId: string | null | undefined,
  accessToken: string
): Promise<{ unlocked?: boolean; reason?: string }> {
  const qs = petId ? `?petId=${encodeURIComponent(petId)}` : "";
  const res = await fetch(`/api/payments/pet-premium/unlock${qs}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  return (await res.json()) as { unlocked?: boolean; reason?: string };
}

export function usePetPremiumUnlock(
  petId: string | null | undefined,
  accessToken: string | null,
  enabled: boolean
) {
  const [status, setStatus] = useState<PetPremiumUnlockStatus>("idle");

  useEffect(() => {
    if (!enabled) {
      setStatus("idle");
      return;
    }

    if (!accessToken) {
      setStatus("login_required");
      return;
    }

    let cancelled = false;
    setStatus("loading");

    const pollAfterPayment = shouldPollAfterPayment();
    const maxAttempts = pollAfterPayment ? MAX_POLL_ATTEMPTS : 1;

    void (async () => {
      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        if (cancelled) return;

        try {
          const data = await fetchUnlockStatus(petId, accessToken);
          if (cancelled) return;

          if (data.unlocked === true) {
            setStatus("unlocked");
            return;
          }
          if (data.reason === "login_required") {
            setStatus("login_required");
            return;
          }
        } catch {
          if (cancelled) return;
        }

        if (attempt < maxAttempts - 1) {
          await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        }
      }

      if (!cancelled) setStatus("locked");
    })();

    return () => {
      cancelled = true;
    };
  }, [petId, accessToken, enabled]);

  return {
    status,
    loading: status === "loading",
    unlocked: status === "unlocked",
    locked: status === "locked",
    loginRequired: status === "login_required",
  };
}
