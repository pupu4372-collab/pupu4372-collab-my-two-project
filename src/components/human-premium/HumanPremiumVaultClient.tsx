"use client";

import { Link } from "@/i18n/navigation";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { formatHumanPremiumError } from "@/lib/reports/human-premium/client-errors";
import {
  getPaidHumanPremiumOrderIds,
  loadHumanPremiumProfile,
  resolveHumanPremiumStorageUserId,
} from "@/lib/reports/human-premium/cart-session";
import {
  formatMoney,
  formatPrice,
  getCheckoutCurrency,
  getReportPrice,
  REPORT_CARD_THEMES,
} from "@/lib/reports/human-premium/pricing";
import { humanPremiumRetentionNotice } from "@/lib/reports/human-premium/retention";
import {
  REPORT_TYPE_LABELS,
  REPORT_TYPE_LABELS_EN,
  type ReportType,
} from "@/lib/reports/human-premium/types";
import { useLocale } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

type VaultOrder = {
  orderId: string;
  amount: number;
  currency: string;
  items: ReportType[];
  generated: Partial<Record<ReportType, { reportId: string; webToken: string }>>;
  personName: string;
  locale: "ko" | "en";
  createdAt: string;
  expiresAt: string;
};

export function HumanPremiumVaultClient() {
  const routeLocale = useLocale();
  const isKo = routeLocale === "ko";
  const typeLabels = isKo ? REPORT_TYPE_LABELS : REPORT_TYPE_LABELS_EN;
  const { userId, isAnonymous, accessToken } = useSupabaseSession();
  const storageUserId = resolveHumanPremiumStorageUserId(userId, isAnonymous);

  const [orders, setOrders] = useState<VaultOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingKey, setGeneratingKey] = useState<string | null>(null);
  const pregenerateStarted = useRef(new Set<string>());

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = loadHumanPremiumProfile(storageUserId);
      const orderIds = getPaidHumanPremiumOrderIds(storageUserId);
      const params = new URLSearchParams({ locale: routeLocale });
      if (orderIds.length) params.set("orderIds", orderIds.join(","));
      if (profile.email.trim()) params.set("email", profile.email.trim());

      const headers: Record<string, string> = {};
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      // Always fetch: registered users rely on Bearer → server userId lookup
      // even when localStorage orderIds is empty.
      const res = await fetch(`/api/payments/human-premium/vault?${params.toString()}`, {
        headers,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Vault load failed");
      setOrders((data.orders ?? []) as VaultOrder[]);
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Vault load failed";
      setError(formatHumanPremiumError(raw, routeLocale as "ko" | "en"));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [routeLocale, storageUserId, accessToken]);

  async function handleGenerate(orderId: string, reportType: ReportType) {
    const key = `${orderId}:${reportType}`;
    setGeneratingKey(key);
    setError(null);
    try {
      const res = await fetch("/api/payments/human-premium/cart/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, reportType, locale: routeLocale }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      await refresh();
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Generation failed";
      setError(formatHumanPremiumError(raw, routeLocale as "ko" | "en"));
    } finally {
      setGeneratingKey(null);
    }
  }

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => {
      void refresh();
    }, 8000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    for (const order of orders) {
      const pending = order.items.some((type) => !order.generated[type]?.webToken);
      if (!pending || pregenerateStarted.current.has(order.orderId)) continue;
      pregenerateStarted.current.add(order.orderId);
      void fetch("/api/payments/human-premium/cart/pregenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.orderId, locale: routeLocale }),
      }).catch(() => undefined);
    }
  }, [orders, routeLocale]);

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <header className="text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#ffd7ff]">
          {isKo ? "프리미엄 리포트 보관함" : "Premium report vault"}
        </p>
        <h1 className="mt-2 text-2xl font-bold text-white">
          {isKo ? "결제한 리포트" : "Your paid reports"}
        </h1>
        <p className="mt-2 text-sm text-white/75">
          {humanPremiumRetentionNotice(routeLocale as "ko" | "en")}
        </p>
      </header>

      {loading && orders.length === 0 ? (
        <p className="text-center text-sm text-white/65">{isKo ? "불러오는 중…" : "Loading…"}</p>
      ) : null}

      {error ? (
        <p role="alert" className="rounded-2xl border border-red-300/80 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </p>
      ) : null}

      {!loading && orders.length === 0 ? (
        <section className="pastel-card p-6 text-center text-sm text-plum/80">
          <p>{isKo ? "저장된 결제 내역이 없어요." : "No paid orders found."}</p>
          <Link href="/premium/human" className="mt-4 inline-flex font-semibold text-channel-saju underline">
            {isKo ? "리포트 선택하러 가기" : "Browse reports"}
          </Link>
        </section>
      ) : (
        orders.map((order) => (
          <section key={order.orderId} className="pastel-card space-y-3 p-5">
            <header className="border-b border-plum/10 pb-3">
              <p className="text-sm font-bold text-ink">{order.personName}</p>
              <p className="mt-1 text-xs text-plum/60">
                {new Date(order.createdAt).toLocaleDateString(isKo ? "ko-KR" : "en-US")} ·{" "}
                {formatMoney(order.amount, order.currency ?? getCheckoutCurrency(order.locale))}
              </p>
              <p className="mt-1 text-[11px] text-plum/50">
                {isKo ? "보관 만료" : "Available until"}{" "}
                {new Date(order.expiresAt).toLocaleDateString(isKo ? "ko-KR" : "en-US")}
              </p>
            </header>

            {order.items.map((reportType) => {
              const theme = REPORT_CARD_THEMES[reportType];
              const token = order.generated[reportType]?.webToken;
              const ready = Boolean(token);
              const itemKey = `${order.orderId}:${reportType}`;
              const isGenerating = generatingKey === itemKey;
              return (
                <article
                  key={`${order.orderId}-${reportType}`}
                  className="flex items-center gap-3 rounded-2xl border border-plum/10 bg-white p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold" style={{ color: theme.accent }}>
                      {typeLabels[reportType]}
                    </p>
                    <p className="text-sm font-bold text-ink">
                      {formatPrice(
                        getReportPrice(reportType, order.locale === "en" ? "en" : "ko"),
                        order.locale === "en" ? "en" : "ko"
                      )}
                    </p>
                    <p className="text-[11px] text-plum/55">
                      {ready
                        ? isKo
                          ? "생성 완료"
                          : "Ready"
                        : isKo
                          ? "생성 중…"
                          : "Generating…"}
                    </p>
                  </div>
                  {ready ? (
                    <Link
                      href={`/reports/human/${token}`}
                      className="rounded-full bg-channel-saju px-4 py-2 text-xs font-bold text-white"
                    >
                      {isKo ? "보기" : "View"}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled={isGenerating || generatingKey !== null}
                      onClick={() => void handleGenerate(order.orderId, reportType)}
                      className="rounded-full bg-channel-saju px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
                    >
                      {isGenerating
                        ? isKo
                          ? "생성 중…"
                          : "Generating…"
                        : isKo
                          ? "준비중"
                          : "Coming soon"}
                    </button>
                  )}
                </article>
              );
            })}

            <Link
              href={`/premium/human/cart?orderId=${encodeURIComponent(order.orderId)}`}
              className="block text-center text-xs font-semibold text-channel-saju underline"
            >
              {isKo ? "장바구니 화면에서 열기" : "Open in cart view"}
            </Link>
          </section>
        ))
      )}

      <div className="flex justify-center">
        <Link
          href="/premium/human"
          className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white"
        >
          {isKo ? "리포트 더 담기" : "Add more reports"}
        </Link>
      </div>
    </div>
  );
}
