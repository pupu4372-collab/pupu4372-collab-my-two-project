"use client";

import { ReportGenerateLoader } from "@/components/human-premium/ReportGenerateLoader";
import { Link } from "@/i18n/navigation";
import { formatHumanPremiumError } from "@/lib/reports/human-premium/client-errors";
import {
  loadHumanPremiumCart,
  loadHumanPremiumProfile,
  markHumanPremiumCartPaid,
  profileHasBirthData,
  removeFromHumanPremiumCart,
  resetHumanPremiumCart,
  saveHumanPremiumCart,
  type HumanPremiumCartState,
} from "@/lib/reports/human-premium/cart-session";
import { humanPremiumRetentionNotice } from "@/lib/reports/human-premium/retention";
import { parseBirthTimeSelect } from "@/lib/saju/birth-time-options";
import {
  formatKrw,
  REPORT_CARD_THEMES,
  REPORT_PRICING,
  sumCartAmount,
} from "@/lib/reports/human-premium/pricing";
import {
  REPORT_TYPE_LABELS,
  REPORT_TYPE_LABELS_EN,
  type ReportType,
} from "@/lib/reports/human-premium/types";
import { useLocale } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

function snapshotToUrls(
  generated: Partial<Record<ReportType, { webToken: string }>>,
  routeLocale: string
) {
  const urls: Partial<Record<ReportType, string>> = {};
  for (const [type, meta] of Object.entries(generated)) {
    if (meta?.webToken) {
      urls[type as ReportType] = `/${routeLocale}/reports/human/${meta.webToken}`;
    }
  }
  return urls;
}

export function HumanPremiumCartClient() {
  const routeLocale = useLocale();
  const isKo = routeLocale === "ko";
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeLabels = isKo ? REPORT_TYPE_LABELS : REPORT_TYPE_LABELS_EN;

  const [cart, setCart] = useState<HumanPremiumCartState>({ items: [], orderId: null, paid: false });
  const [profileReady, setProfileReady] = useState(false);
  const [paying, setPaying] = useState(false);
  const [generatingType, setGeneratingType] = useState<ReportType | null>(null);
  const [generated, setGenerated] = useState<Partial<Record<ReportType, string>>>({});
  const [error, setError] = useState<string | null>(null);

  const total = useMemo(() => sumCartAmount(cart.items), [cart.items]);
  const orderIdFromUrl = searchParams.get("orderId");

  const refreshCart = useCallback(() => {
    setCart(loadHumanPremiumCart());
    setProfileReady(profileHasBirthData(loadHumanPremiumProfile()));
  }, []);

  const loadOrderSnapshot = useCallback(
    async (orderId: string) => {
      const res = await fetch(`/api/payments/human-premium/cart/generate?orderId=${encodeURIComponent(orderId)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Order not found");

      const nextCart: HumanPremiumCartState = {
        items: data.items ?? [],
        orderId,
        paid: true,
      };
      saveHumanPremiumCart(nextCart);
      setCart(nextCart);
      setGenerated(snapshotToUrls(data.generated ?? {}, routeLocale));
    },
    [routeLocale]
  );

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  useEffect(() => {
    if (!orderIdFromUrl) return;
    void loadOrderSnapshot(orderIdFromUrl).catch(() => undefined);
  }, [orderIdFromUrl, loadOrderSnapshot]);

  useEffect(() => {
    if (!cart.paid || !cart.orderId) return;

    void fetch(`/api/payments/human-premium/cart/pregenerate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: cart.orderId, locale: routeLocale }),
    }).catch(() => undefined);

    const poll = window.setInterval(() => {
      void loadOrderSnapshot(cart.orderId!).catch(() => undefined);
    }, 5000);

    void loadOrderSnapshot(cart.orderId).catch(() => undefined);

    return () => window.clearInterval(poll);
  }, [cart.orderId, cart.paid, loadOrderSnapshot, routeLocale]);

  function buildCheckoutBody() {
    const profile = loadHumanPremiumProfile();
    const birthTimeUnknown = profile.birthTimeSelect === "unknown";
    const birthTime = birthTimeUnknown
      ? null
      : parseBirthTimeSelect(profile.birthTimeSelect).birthTime;

    return {
      personName: profile.personName.trim(),
      email: profile.email.trim(),
      birthDate: profile.birthDate,
      birthTime,
      birthTimeUnknown,
      timezone: profile.timezone,
      calendarType: profile.calendarType,
      gender: profile.gender || undefined,
      privacyConsent: profile.privacyConsent,
      locale: routeLocale,
      cartItems: cart.items,
    };
  }

  async function handlePay() {
    setError(null);
    if (!profileReady) {
      setError(isKo ? "먼저 사주 정보를 입력해 주세요." : "Enter your birth details first.");
      return;
    }
    if (!cart.items.length) {
      setError(isKo ? "장바구니가 비어 있어요." : "Your cart is empty.");
      return;
    }

    setPaying(true);
    try {
      const res = await fetch("/api/payments/human-premium/cart/demo-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildCheckoutBody()),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Payment failed");

      const next = markHumanPremiumCartPaid(String(data.orderId), loadHumanPremiumProfile());
      setCart(next);
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Payment failed";
      setError(formatHumanPremiumError(raw, routeLocale as "ko" | "en"));
    } finally {
      setPaying(false);
    }
  }

  async function handleViewReport(reportType: ReportType) {
    if (!cart.orderId) return;
    if (generated[reportType]) {
      router.push(generated[reportType]!);
      return;
    }

    setError(null);
    setGeneratingType(reportType);
    try {
      const res = await fetch("/api/payments/human-premium/cart/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: cart.orderId,
          reportType,
          locale: routeLocale,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");

      setGenerated((prev) => ({ ...prev, [reportType]: data.webUrl }));
      setGeneratingType(null);
      router.push(data.webUrl);
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Generation failed";
      setError(formatHumanPremiumError(raw, routeLocale as "ko" | "en"));
      setGeneratingType(null);
    }
  }

  function handleRemove(reportType: ReportType) {
    if (cart.paid) return;
    setCart(removeFromHumanPremiumCart(reportType));
  }

  return (
    <>
      <ReportGenerateLoader isKo={isKo} active={generatingType !== null} />

      <div className="mx-auto w-full max-w-lg space-y-6">
        <header className="text-center">
          <h1 className="text-2xl font-bold text-white">{isKo ? "장바구니" : "Cart"}</h1>
          <p className="mt-2 text-sm text-white/75">
            {cart.paid
              ? isKo
                ? "결제 완료 — 리포트가 준비되면 바로 열 수 있어요."
                : "Paid — reports open as soon as they are ready."
              : isKo
                ? "선택한 리포트를 확인하고 한 번에 결제하세요."
                : "Review your picks and pay once."}
          </p>
        </header>

        {cart.paid ? (
          <p className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-center text-xs leading-relaxed text-white/80">
            {humanPremiumRetentionNotice(routeLocale as "ko" | "en")}
          </p>
        ) : null}

        {!profileReady ? (
          <p className="rounded-2xl border border-amber-300/40 bg-amber-50/95 px-4 py-3 text-center text-sm text-amber-950">
            {isKo ? (
              <>
                <Link href="/premium/human" className="font-semibold underline">
                  사주 정보 입력
                </Link>
                을 먼저 완료해 주세요.
              </>
            ) : (
              <>
                Complete{" "}
                <Link href="/premium/human" className="font-semibold underline">
                  birth details
                </Link>{" "}
                first.
              </>
            )}
          </p>
        ) : null}

        <section className="pastel-card space-y-3 p-5">
          {cart.items.length === 0 ? (
            <p className="text-center text-sm text-plum/80">
              {isKo ? "담은 리포트가 없어요." : "No reports in cart."}{" "}
              <Link href="/premium/human/vault" className="font-semibold text-channel-saju underline">
                {isKo ? "보관함 보기" : "Open vault"}
              </Link>
            </p>
          ) : (
            cart.items.map((reportType) => {
              const theme = REPORT_CARD_THEMES[reportType];
              const ready = Boolean(generated[reportType]);
              return (
                <article
                  key={reportType}
                  className="flex items-center gap-3 rounded-2xl border border-plum/10 bg-white p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink" style={{ color: theme.accent }}>
                      {typeLabels[reportType]}
                    </p>
                    <p className="text-sm font-bold text-ink">{formatKrw(REPORT_PRICING[reportType])}</p>
                    {cart.paid ? (
                      <p className="text-[11px] text-plum/55">
                        {ready
                          ? isKo
                            ? "준비됨"
                            : "Ready"
                          : isKo
                            ? "생성 중…"
                            : "Generating…"}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                    {cart.paid ? (
                      <button
                        type="button"
                        onClick={() => void handleViewReport(reportType)}
                        disabled={generatingType !== null && generatingType !== reportType}
                        className="rounded-full bg-channel-saju px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
                      >
                        {generatingType === reportType
                          ? isKo
                            ? "생성 중…"
                            : "Generating…"
                          : ready
                            ? isKo
                              ? "사주 보기"
                              : "View report"
                            : isKo
                              ? "지금 생성"
                              : "Generate"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRemove(reportType)}
                        className="rounded-full border border-plum/20 px-4 py-2 text-xs font-semibold text-plum"
                      >
                        {isKo ? "삭제" : "Remove"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })
          )}

          {cart.items.length > 0 ? (
            <p className="border-t border-plum/10 pt-3 text-right text-lg font-bold text-ink">
              {isKo ? "합계" : "Total"} {formatKrw(total)}
            </p>
          ) : null}
        </section>

        {error ? (
          <p role="alert" className="rounded-2xl border border-red-300/80 bg-red-50 px-4 py-3 text-sm text-red-900">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap justify-center gap-3">
          {!cart.paid && cart.items.length > 0 ? (
            <button
              type="button"
              disabled={paying || !profileReady}
              onClick={() => void handlePay()}
              className="rounded-full bg-channel-saju px-6 py-3 font-bold text-white disabled:opacity-50"
            >
              {paying
                ? isKo
                  ? "결제 처리 중…"
                  : "Processing…"
                : isKo
                  ? `결제하기 ${formatKrw(total)}`
                  : `Pay ${formatKrw(total)}`}
            </button>
          ) : null}
          {cart.paid ? (
            <Link
              href="/premium/human/vault"
              className="rounded-full bg-white/90 px-6 py-3 text-sm font-bold text-primary"
            >
              {isKo ? "리포트 보관함" : "Report vault"}
            </Link>
          ) : null}
          <Link
            href="/premium/human"
            onClick={() => resetHumanPremiumCart()}
            className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white"
          >
            {isKo ? "리포트 더 담기" : "Add more"}
          </Link>
        </div>
      </div>
    </>
  );
}
