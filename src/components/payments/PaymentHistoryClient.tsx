"use client";

import { Link, useRouter } from "@/i18n/navigation";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { getSafeInternalReturnPath } from "@/lib/auth/safe-internal-return-path";
import { formatHumanPremiumError } from "@/lib/reports/human-premium/client-errors";
import { formatMoney } from "@/lib/reports/human-premium/pricing";
import {
  REPORT_TYPE_LABELS,
  REPORT_TYPE_LABELS_EN,
  type ReportType,
} from "@/lib/reports/human-premium/types";
import {
  buildPetPremiumHubHref,
  PET_PREMIUM_INCLUDES,
  PET_PREMIUM_PRODUCT_LABELS,
  type PetPremiumPaymentRecord,
} from "@/lib/payments/pet-premium-shared";
import { useLocale } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

type HumanPaymentOrder = {
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

type HistoryEntry =
  | { kind: "human"; createdAt: string; order: HumanPaymentOrder }
  | { kind: "pet"; createdAt: string; order: PetPremiumPaymentRecord };

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
  const locale = isKo ? "ko" : "en";
  const typeLabels = isKo ? REPORT_TYPE_LABELS : REPORT_TYPE_LABELS_EN;
  const petProductLabels = PET_PREMIUM_PRODUCT_LABELS[locale];
  const petIncludes = PET_PREMIUM_INCLUDES[locale];
  const router = useRouter();
  const { ready, accessToken, configured, isAnonymous } = useSupabaseSession();

  const [humanOrders, setHumanOrders] = useState<HumanPaymentOrder[]>([]);
  const [petOrders, setPetOrders] = useState<PetPremiumPaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const entries = useMemo(() => {
    const merged: HistoryEntry[] = [
      ...humanOrders.map((order) => ({ kind: "human" as const, createdAt: order.createdAt, order })),
      ...petOrders.map((order) => ({ kind: "pet" as const, createdAt: order.createdAt, order })),
    ];
    return merged.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [humanOrders, petOrders]);

  useEffect(() => {
    if (!configured || !ready) return;
    if (isAnonymous || !accessToken) {
      const next = getSafeInternalReturnPath("/my/payments");
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [configured, ready, isAnonymous, accessToken, router]);

  const refresh = useCallback(async () => {
    if (!accessToken || isAnonymous) return;

    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${accessToken}` };
      const [humanRes, petRes] = await Promise.all([
        fetch(`/api/payments/human-premium/history?locale=${routeLocale}`, { headers }),
        fetch("/api/payments/pet-premium/history", { headers }),
      ]);

      const humanData = await humanRes.json();
      const petData = await petRes.json();

      if (humanRes.status === 401 || petRes.status === 401) {
        const next = getSafeInternalReturnPath("/my/payments");
        router.replace(`/login?next=${encodeURIComponent(next)}`);
        return;
      }

      if (!humanRes.ok) {
        throw new Error(humanData.error ?? "Payment history load failed");
      }
      if (!petRes.ok) {
        throw new Error(petData.error ?? "Payment history load failed");
      }

      setHumanOrders((humanData.orders ?? []) as HumanPaymentOrder[]);
      setPetOrders((petData.orders ?? []) as PetPremiumPaymentRecord[]);
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Payment history load failed";
      setError(formatHumanPremiumError(raw, routeLocale as "ko" | "en"));
      setHumanOrders([]);
      setPetOrders([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken, isAnonymous, routeLocale, router]);

  useEffect(() => {
    if (!ready || !configured || isAnonymous || !accessToken) return;
    void refresh();
  }, [ready, configured, isAnonymous, accessToken, refresh]);

  if (!configured || !ready || isAnonymous || !accessToken) {
    return (
      <p className="text-center text-sm text-white/65">
        {isKo ? "로그인 상태를 확인하는 중…" : "Checking sign-in…"}
      </p>
    );
  }

  const hasPayments = entries.length > 0;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 pb-24 md:pb-12">
      <header className="text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#ffd7ff]">
          {isKo ? "결제 내역" : "Payment history"}
        </p>
        <h1 className="mt-2 text-2xl font-bold text-white">
          {isKo ? "내 프리미엄 결제" : "My premium payments"}
        </h1>
        <p className="mt-2 text-sm text-white/75">
          {isKo
            ? "본인 계정의 펫·사람 프리미엄 결제만 표시됩니다."
            : "Only payments on your account are shown."}
        </p>
      </header>

      {loading && !hasPayments ? (
        <p className="text-center text-sm text-white/65">{isKo ? "불러오는 중…" : "Loading…"}</p>
      ) : null}

      {error ? (
        <p role="alert" className="rounded-2xl border border-red-300/80 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </p>
      ) : null}

      {!loading && !hasPayments ? (
        <div className="rounded-[2rem] border border-white/15 bg-white/10 px-6 py-10 text-center backdrop-blur-sm">
          <p className="text-sm font-semibold text-white/85">
            {isKo ? "아직 결제 내역이 없어요." : "No payment history yet."}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Link
              href="/saju"
              className="inline-flex rounded-full bg-[#ffd7ff] px-5 py-2.5 text-sm font-extrabold text-[#442656] transition hover:bg-white"
            >
              {isKo ? "댕냥사주 보기" : "K-Saju"}
            </Link>
            <Link
              href="/premium/human"
              className="inline-flex rounded-full border border-white/30 px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-white/10"
            >
              {isKo ? "사람 프리미엄" : "Human premium"}
            </Link>
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        {entries.map((entry) =>
          entry.kind === "human" ? (
            <article
              key={`human-${entry.order.orderId}`}
              className="rounded-[1.5rem] border border-white/15 bg-white p-5 shadow-[0_12px_28px_rgba(61,42,74,0.14)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-channel-saju">
                    {isKo ? "사람 프리미엄" : "Human premium"}
                  </p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-plum/55">
                    {formatDate(entry.order.createdAt, isKo)}
                  </p>
                  <h2 className="mt-1 text-lg font-extrabold text-primary">{entry.order.personName}</h2>
                  <p className="mt-1 text-xs text-plum/60">
                    {isKo ? "주문번호" : "Order"}: {entry.order.orderId}
                  </p>
                </div>
                <p className="text-xl font-extrabold text-channel-saju">
                  {formatMoney(entry.order.amount, entry.order.currency)}
                </p>
              </div>

              <ul className="mt-4 flex flex-wrap gap-2">
                {entry.order.items.map((type) => (
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
                  {isKo ? "생성 완료" : "Generated"}: {entry.order.generatedCount}/{entry.order.itemCount}
                </span>
              </div>
            </article>
          ) : (
            <article
              key={`pet-${entry.order.paymentId}`}
              className="rounded-[1.5rem] border border-channel-saju/25 bg-lavender/30 p-5 shadow-[0_12px_28px_rgba(61,42,74,0.14)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-channel-saju">
                    {isKo ? "펫 프리미엄" : "Pet premium"}
                  </p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-plum/55">
                    {formatDate(entry.order.createdAt, isKo)}
                  </p>
                  <h2 className="mt-1 text-lg font-extrabold text-primary">{entry.order.petName}</h2>
                  <p className="mt-1 text-sm font-semibold text-plum/75">
                    {petProductLabels[entry.order.productCode as keyof typeof petProductLabels] ??
                      entry.order.productCode}
                  </p>
                  <p className="mt-1 text-xs text-plum/60">
                    {isKo ? "결제번호" : "Payment"}: {entry.order.paymentId}
                  </p>
                </div>
                <p className="text-xl font-extrabold text-channel-saju">
                  {formatMoney(entry.order.amount, entry.order.currency)}
                </p>
              </div>

              <ul className="mt-4 flex flex-wrap gap-2">
                {petIncludes.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-channel-saju/20 bg-white/80 px-3 py-1 text-xs font-semibold text-primary"
                  >
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  href={buildPetPremiumHubHref(entry.order, locale)}
                  className="inline-flex rounded-full bg-channel-saju px-4 py-2 text-xs font-extrabold text-white transition hover:brightness-110"
                >
                  {isKo ? "프리미엄 결과 보기" : "Open premium hub"}
                </Link>
                <span className="text-xs text-plum/55">
                  {entry.order.isLifetime
                    ? isKo
                      ? "영구 이용"
                      : "Lifetime access"
                    : isKo
                      ? `이용 가능 ~ ${formatDate(entry.order.expiresAt ?? "", isKo)}`
                      : `Available until ${formatDate(entry.order.expiresAt ?? "", isKo)}`}
                </span>
              </div>
            </article>
          )
        )}
      </div>
    </div>
  );
}
