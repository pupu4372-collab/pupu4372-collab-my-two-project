"use client";

import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import {
  getPurchasedReportTypes,
  type HumanPremiumProfile,
} from "@/lib/reports/human-premium/cart-session";
import type { ReportType } from "@/lib/reports/human-premium/types";
import { useCallback, useEffect, useState } from "react";

export function useHumanPremiumPurchases(options: {
  storageUserId: string;
  profile: HumanPremiumProfile;
}): {
  purchasedTypes: ReportType[];
  loading: boolean;
  degraded: boolean;
  refresh: () => void;
} {
  const { storageUserId, profile } = options;
  const { accessToken, userId, ready } = useSupabaseSession();
  const [apiTypes, setApiTypes] = useState<ReportType[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [degraded, setDegraded] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const res = await fetch("/api/premium/human/purchases", { headers });
      const data = (await res.json()) as {
        purchasedReportTypes?: ReportType[];
        degraded?: boolean;
      };

      if (!res.ok || data.degraded) {
        setUseFallback(true);
        setDegraded(true);
        setApiTypes(null);
        return;
      }

      setUseFallback(false);
      setDegraded(false);
      setApiTypes(data.purchasedReportTypes ?? []);
    } catch {
      setUseFallback(true);
      setDegraded(true);
      setApiTypes(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!ready) return;
    void refresh();
  }, [ready, userId, refresh]);

  const purchasedTypes = loading
    ? []
    : useFallback
      ? getPurchasedReportTypes(storageUserId, profile)
      : (apiTypes ?? []);

  return {
    purchasedTypes,
    loading,
    degraded,
    refresh: () => {
      void refresh();
    },
  };
}
