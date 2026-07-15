"use client";

import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import type { AdminPaymentHistoryEntry } from "@/lib/admin/payment-history";
import { formatMoney } from "@/lib/reports/human-premium/pricing";
import {
  REPORT_TYPE_LABELS,
  REPORT_TYPE_LABELS_EN,
} from "@/lib/reports/human-premium/types";
import { PET_PREMIUM_PRODUCT_LABELS } from "@/lib/payments/pet-premium-shared";
import { notFound } from "next/navigation";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";

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

export function AdminPaymentsClient() {
  const locale = useLocale();
  const isKo = locale === "ko";
  const typeLabels = isKo ? REPORT_TYPE_LABELS : REPORT_TYPE_LABELS_EN;
  const petLabels = PET_PREMIUM_PRODUCT_LABELS[isKo ? "ko" : "en"];
  const { ready, accessToken, configured, isAnonymous } = useSupabaseSession();
  const [entries, setEntries] = useState<AdminPaymentHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!configured || !ready) return;
    if (isAnonymous || !accessToken) {
      notFound();
      return;
    }

    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/payments", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.status === 404 || res.status === 401) {
          notFound();
          return;
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load payments");
        if (!cancelled) setEntries((data.entries ?? []) as AdminPaymentHistoryEntry[]);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load payments");
          setEntries([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [configured, ready, isAnonymous, accessToken]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#ffd7ff]">Admin</p>
        <h2 className="mt-1 text-2xl font-extrabold text-white">
          {isKo ? "전체 결제 내역" : "All payments"}
        </h2>
        <p className="mt-1 text-sm text-white/75">
          {isKo
            ? "최신순 · 펫·사람 프리미엄 결제 (관리자 전용)"
            : "Newest first · pet & human premium (admins only)"}
        </p>
      </header>

      {loading ? <p className="text-sm text-white/65">{isKo ? "불러오는 중…" : "Loading…"}</p> : null}
      {error ? (
        <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {!loading && entries.length === 0 ? (
        <p className="text-sm text-white/65">{isKo ? "결제 내역이 없습니다." : "No payments found."}</p>
      ) : null}

      <div className="space-y-3">
        {entries.map((entry) =>
          entry.kind === "human" ? (
            <article
              key={`human-${entry.order.orderId}`}
              className="pastel-card rounded-2xl border border-plum/10 p-4 shadow-[0_12px_28px_rgba(61,42,74,0.14)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-channel-saju">
                    {isKo ? "사람 프리미엄" : "Human premium"}
                  </p>
                  <p className="mt-1 text-xs text-plum/55">{formatDate(entry.createdAt, isKo)}</p>
                  <h3 className="mt-1 font-extrabold text-primary">{entry.order.personName}</h3>
                  <p className="mt-1 text-xs text-plum/70">
                    {isKo ? "계정" : "Account"}: {entry.userLabel}
                    {entry.userId ? ` · ${entry.userId.slice(0, 8)}…` : ""}
                    {entry.order.email ? ` · ${entry.order.email}` : ""}
                  </p>
                  <p className="text-xs text-plum/60">
                    {isKo ? "주문번호" : "Order"}: {entry.order.orderId}
                  </p>
                </div>
                <p className="text-lg font-extrabold text-channel-saju">
                  {formatMoney(entry.order.amount, entry.order.currency)}
                </p>
              </div>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {entry.order.items.map((type) => (
                  <li
                    key={type}
                    className="rounded-full bg-cream px-2.5 py-0.5 text-[11px] font-semibold text-plum"
                  >
                    {typeLabels[type] ?? type}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-plum/55">
                {isKo ? "생성" : "Generated"}: {entry.order.generatedCount}/{entry.order.itemCount}
              </p>
            </article>
          ) : (
            <article
              key={`pet-${entry.order.paymentId}`}
              className="pastel-card rounded-2xl border border-plum/10 p-4 shadow-[0_12px_28px_rgba(61,42,74,0.14)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-channel-saju">
                    {isKo ? "펫 프리미엄" : "Pet premium"}
                  </p>
                  <p className="mt-1 text-xs text-plum/55">{formatDate(entry.createdAt, isKo)}</p>
                  <h3 className="mt-1 font-extrabold text-primary">{entry.order.petName}</h3>
                  <p className="mt-1 text-xs text-plum/70">
                    {isKo ? "계정" : "Account"}: {entry.userLabel}
                    {entry.userId ? ` · ${entry.userId.slice(0, 8)}…` : ""}
                  </p>
                  <p className="text-xs text-plum/60">
                    {petLabels[entry.order.productCode as keyof typeof petLabels] ??
                      entry.order.productCode}{" "}
                    · {entry.order.paymentId}
                  </p>
                </div>
                <p className="text-lg font-extrabold text-channel-saju">
                  {formatMoney(entry.order.amount, entry.order.currency)}
                </p>
              </div>
            </article>
          )
        )}
      </div>
    </div>
  );
}
