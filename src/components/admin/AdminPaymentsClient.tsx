"use client";

import { Link } from "@/i18n/navigation";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import type { AdminPaymentHistoryEntry } from "@/lib/admin/payment-history";
import { formatMoney } from "@/lib/reports/human-premium/pricing";
import {
  REPORT_TYPE_LABELS,
  REPORT_TYPE_LABELS_EN,
  type ReportType,
} from "@/lib/reports/human-premium/types";
import { PET_PREMIUM_PRODUCT_LABELS } from "@/lib/payments/pet-premium-shared";
import { notFound } from "next/navigation";
import { useLocale } from "next-intl";
import { useEffect, useMemo, useState } from "react";

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

/** Local calendar day bounds for YYYY-MM-DD filters (inclusive). */
function entryInDateRange(createdAt: string, startDate: string, endDate: string): boolean {
  const t = new Date(createdAt).getTime();
  if (Number.isNaN(t)) return false;
  if (startDate) {
    const start = new Date(`${startDate}T00:00:00`).getTime();
    if (!Number.isNaN(start) && t < start) return false;
  }
  if (endDate) {
    const end = new Date(`${endDate}T23:59:59.999`).getTime();
    if (!Number.isNaN(end) && t > end) return false;
  }
  return true;
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function accountLabel(entry: AdminPaymentHistoryEntry): string {
  const parts = [entry.userLabel];
  if (entry.userId) parts.push(entry.userId);
  if (entry.kind === "human" && entry.order.email) parts.push(entry.order.email);
  return parts.filter(Boolean).join(" · ");
}

function productLabel(
  entry: AdminPaymentHistoryEntry,
  typeLabels: Record<ReportType, string>,
  petLabels: Record<string, string>
): string {
  if (entry.kind === "human") {
    return entry.order.items.map((type) => typeLabels[type] ?? type).join(" / ");
  }
  return petLabels[entry.order.productCode] ?? entry.order.productCode;
}

function orderIdOf(entry: AdminPaymentHistoryEntry): string {
  return entry.kind === "human" ? entry.order.orderId : entry.order.paymentId;
}

function downloadPaymentsCsv(
  rows: AdminPaymentHistoryEntry[],
  options: {
    isKo: boolean;
    startDate: string;
    endDate: string;
    typeLabels: Record<ReportType, string>;
    petLabels: Record<string, string>;
  }
) {
  const headers = options.isKo
    ? ["결제일시", "계정 식별정보", "상품명", "주문번호", "결제금액", "통화"]
    : ["Paid at", "Account", "Product", "Order ID", "Amount", "Currency"];

  const lines = [
    headers.join(","),
    ...rows.map((entry) =>
      [
        csvEscape(formatDate(entry.createdAt, options.isKo)),
        csvEscape(accountLabel(entry)),
        csvEscape(productLabel(entry, options.typeLabels, options.petLabels)),
        csvEscape(orderIdOf(entry)),
        String(entry.order.amount),
        csvEscape(entry.order.currency ?? ""),
      ].join(",")
    ),
  ];

  const startPart = options.startDate || "all";
  const endPart = options.endDate || "all";
  const filename =
    !options.startDate && !options.endDate
      ? "payments_all.csv"
      : `payments_${startPart}_${endPart}.csv`;

  const blob = new Blob(["\uFEFF" + lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

  const filteredEntries = useMemo(
    () => entries.filter((entry) => entryInDateRange(entry.createdAt, startDate, endDate)),
    [entries, startDate, endDate]
  );

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
        <Link
          href="/admin"
          className="mt-3 inline-flex text-sm font-semibold text-white/85 underline-offset-2 hover:text-white hover:underline"
        >
          {isKo ? "← 관리자 대시보드" : "← Admin dashboard"}
        </Link>
      </header>

      <div className="pastel-card flex flex-col gap-3 rounded-2xl border border-plum/10 p-4 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="flex min-w-[9rem] flex-1 flex-col gap-1 text-xs font-bold text-plum">
          {isKo ? "시작일" : "Start"}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-xl border border-plum/15 bg-white px-3 py-2 text-sm font-semibold text-primary outline-none focus:border-channel-saju"
          />
        </label>
        <label className="flex min-w-[9rem] flex-1 flex-col gap-1 text-xs font-bold text-plum">
          {isKo ? "종료일" : "End"}
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-xl border border-plum/15 bg-white px-3 py-2 text-sm font-semibold text-primary outline-none focus:border-channel-saju"
          />
        </label>
        <button
          type="button"
          disabled={loading || filteredEntries.length === 0}
          onClick={() =>
            downloadPaymentsCsv(filteredEntries, {
              isKo,
              startDate,
              endDate,
              typeLabels,
              petLabels,
            })
          }
          className="inline-flex rounded-full bg-channel-saju px-5 py-2.5 text-sm font-extrabold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isKo ? "다운로드" : "Download"}
        </button>
        {(startDate || endDate) && (
          <button
            type="button"
            onClick={() => {
              setStartDate("");
              setEndDate("");
            }}
            className="text-sm font-semibold text-plum/70 underline-offset-2 hover:text-plum hover:underline"
          >
            {isKo ? "전체 기간" : "All dates"}
          </button>
        )}
      </div>

      {loading ? <p className="text-sm text-white/65">{isKo ? "불러오는 중…" : "Loading…"}</p> : null}
      {error ? (
        <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {!loading && filteredEntries.length === 0 ? (
        <p className="text-sm text-white/65">{isKo ? "결제 내역이 없습니다." : "No payments found."}</p>
      ) : null}

      <div className="space-y-3">
        {filteredEntries.map((entry) =>
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
