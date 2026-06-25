"use client";

import { Link } from "@/i18n/navigation";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { formatHumanPremiumError } from "@/lib/reports/human-premium/client-errors";
import {
  getPaidHumanPremiumOrderIds,
  loadHumanPremiumProfile,
  syncPaidOrdersFromVault,
} from "@/lib/reports/human-premium/cart-session";
import { formatKrw } from "@/lib/reports/human-premium/pricing";
import {
  REPORT_TYPE_LABELS,
  REPORT_TYPE_LABELS_EN,
  type ReportType,
} from "@/lib/reports/human-premium/types";
import { useLocale } from "next-intl";
import { useCallback, useEffect, useState } from "react";

type PaymentOrder = {
  orderId: string;
  amount: number;
  currency: string;
  items: ReportType[];
  itemCount: number;
  personName: string;
  locale: "ko" | "en";
  createdAt: string;
  expiresAt: string;
  generatedCount: number;
};

function formatDate(value: string, isKo: boolean) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(isKo ? "ko-KR" : "en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PaymentHistoryClient() {
  const routeLocale = useLocale();
  const isKo = routeLocale === "ko";
  const typeLabels = isKo ? REPORT_TYPE_LABELS : REPORT_TYPE_LABELS_EN;
  const { accessToken } = useSupabaseSession();

  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = loadHumanPremiumProfile();
      const orderIds = getPaidHumanPremiumOrderIds();
      const params = new URLSearchParams({ locale: routeLocale });
      if (orderIds.length) params.set("orderIds", orderIds.join(","));
      if (profile.email.trim()) params.set("email", profile.email.trim());

      const res = await fetch(`/api/payments/human-premium/history?${params.toString()}`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Payment history load failed");

      const nextOrders = (data.orders ?? []) as PaymentOrder[];
      syncPaidOrdersFromVault(nextOrders);
      setOrders(nextOrders);
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Payment history load failed";
      setError(formatHumanPremiumError(raw, routeLocale as "ko" | "en"));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken, routeLocale]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <header className="text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#ffd7ff]">
          {isKo ? "결제 내역" : "Payment history"}
        </p>
        <h1 className="mt-2 text-2xl font-bold text-white">
          {isKo ? "프리미엄 리포트 결제" : "Premium report payments"}
        </h1>
        <p className="mt-2 text-sm text-white/75">
          {isKo
            ? "결제 완료된 주문만 표시됩니다. 리포트 열람은 보관함에서 할 수 있어요."
            : "Only completed orders are shown. Open reports from the vault."}
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
        <div className="rounded-[2rem] border border-white/15 bg-white/10 px-6 py-10 text-center backdrop-blur-sm">
          <p className="text-sm font-semibold text-white/85">
            {isKo ? "아직 결제 내역이 없어요." : "No payment history yet."}
          </p>
          <Link
            href="/premium/human"
            className="mt-4 inline-flex rounded-full bg-[#ffd7ff] px-5 py-2.5 text-sm font-extrabold text-[#442656] transition hover:bg-white"
          >
            {isKo ? "프리미엄 사주 보기" : "Browse premium reports"}
          </Link>
        </div>
      ) : null}

      <div className="space-y-4">
        {orders.map((order) => (
          <article
            key={order.orderId}
            className="rounded-[1.5rem] border border-white/15 bg-white p-5 shadow-[0_12px_28px_rgba(61,42,74,0.14)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-plum/55">
                  {formatDate(order.createdAt, isKo)}
                </p>
                <h2 className="mt-1 text-lg font-extrabold text-primary">{order.personName}</h2>
                <p className="mt-1 text-xs text-plum/60">
                  {isKo ? "주문번호" : "Order"}: {order.orderId}
                </p>
              </div>
              <p className="text-xl font-extrabold text-channel-saju">{formatKrw(order.amount)}</p>
            </div>

            <ul className="mt-4 flex flex-wrap gap-2">
              {order.items.map((type) => (
                <li
                  key={type}
                  className="rounded-full border border-plum/10 bg-cream/80 px-3 py-1 text-xs font-semibold text-plum"
                >
                  {typeLabels[type]}
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/premium/human/vault"
                className="inline-flex rounded-full bg-primary px-4 py-2 text-xs font-extrabold text-white transition hover:bg-plum"
              >
                {isKo ? "리포트 보관함" : "Report vault"}
              </Link>
              <span className="self-center text-xs text-plum/55">
                {isKo ? "생성 완료" : "Generated"}: {order.generatedCount}/{order.itemCount}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
