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
import { useCallback, useEffect, useState } from "react";

const PAGE_LIMIT = 50;

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

function toYmdLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function defaultDateRange(): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 7);
  return { start: toYmdLocal(start), end: toYmdLocal(end) };
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

  const filename = `payments_${options.startDate}_${options.endDate}.csv`;

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
  const defaults = defaultDateRange();
  const [startDate, setStartDate] = useState(defaults.start);
  const [endDate, setEndDate] = useState(defaults.end);
  const [entries, setEntries] = useState<AdminPaymentHistoryEntry[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(
    async (opts: { cursor?: string | null }) => {
      if (!accessToken) {
        throw new Error("Not signed in.");
      }
      const params = new URLSearchParams({
        from: startDate,
        to: endDate,
        limit: String(PAGE_LIMIT),
      });
      if (opts.cursor) params.set("cursor", opts.cursor);

      const res = await fetch(`/api/admin/payments?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.status === 404 || res.status === 401) {
        notFound();
        throw new Error("Not found.");
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load payments");

      return {
        page: (data.entries ?? []) as AdminPaymentHistoryEntry[],
        nextCursor: typeof data.nextCursor === "string" ? data.nextCursor : null,
        hasMore: Boolean(data.hasMore),
      };
    },
    [accessToken, startDate, endDate]
  );

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
      setEntries([]);
      setNextCursor(null);
      setHasMore(false);
      try {
        const result = await fetchPage({});
        if (cancelled) return;
        setEntries(result.page);
        setNextCursor(result.nextCursor);
        setHasMore(result.hasMore);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load payments");
          setEntries([]);
          setNextCursor(null);
          setHasMore(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [configured, ready, isAnonymous, accessToken, startDate, endDate, fetchPage]);

  async function onLoadMore() {
    if (!hasMore || !nextCursor || loadingMore || loading) return;
    setLoadingMore(true);
    setError(null);
    try {
      const result = await fetchPage({ cursor: nextCursor });
      setEntries((prev) => [...prev, ...result.page]);
      setNextCursor(result.nextCursor);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payments");
    } finally {
      setLoadingMore(false);
    }
  }

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
            max={endDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-xl border border-plum/15 bg-white px-3 py-2 text-sm font-semibold text-primary outline-none focus:border-channel-saju"
          />
        </label>
        <label className="flex min-w-[9rem] flex-1 flex-col gap-1 text-xs font-bold text-plum">
          {isKo ? "종료일" : "End"}
          <input
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-xl border border-plum/15 bg-white px-3 py-2 text-sm font-semibold text-primary outline-none focus:border-channel-saju"
          />
        </label>
        <button
          type="button"
          disabled={loading || entries.length === 0}
          onClick={() =>
            downloadPaymentsCsv(entries, {
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
        <button
          type="button"
          onClick={() => {
            const range = defaultDateRange();
            setStartDate(range.start);
            setEndDate(range.end);
          }}
          className="text-sm font-semibold text-plum/70 underline-offset-2 hover:text-plum hover:underline"
        >
          {isKo ? "최근 7일" : "Last 7 days"}
        </button>
      </div>

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

      {!loading && hasMore ? (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            disabled={loadingMore}
            onClick={() => void onLoadMore()}
            className="inline-flex rounded-full border border-plum/20 bg-white px-5 py-2.5 text-sm font-extrabold text-plum transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingMore
              ? isKo
                ? "불러오는 중…"
                : "Loading…"
              : isKo
                ? "더 보기"
                : "Load more"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
