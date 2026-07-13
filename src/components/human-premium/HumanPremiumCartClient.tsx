"use client";

import { CartPayConfirmModal } from "@/components/human-premium/CartPayConfirmModal";
import { ReportGenerateLoader } from "@/components/human-premium/ReportGenerateLoader";
import { Link } from "@/i18n/navigation";
import { useHumanPremiumPurchases } from "@/hooks/useHumanPremiumPurchases";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { formatHumanPremiumError } from "@/lib/reports/human-premium/client-errors";
import {
  loadHumanPremiumCart,
  loadHumanPremiumProfile,
  markHumanPremiumCartPaid,
  profileHasBirthData,
  removeFromHumanPremiumCart,
  resetHumanPremiumCart,
  resolveHumanPremiumStorageUserId,
  saveHumanPremiumCart,
  type HumanPremiumCartState,
} from "@/lib/reports/human-premium/cart-session";
import { humanPremiumRetentionNotice } from "@/lib/reports/human-premium/retention";
import { parseBirthTimeSelect } from "@/lib/saju/birth-time-options";
import {
  formatPrice,
  getCartPricingSummary,
  getReportPrice,
  REPORT_CARD_THEMES,
} from "@/lib/reports/human-premium/pricing";
import {
  REPORT_TYPE_LABELS,
  REPORT_TYPE_LABELS_EN,
  type ReportType,
} from "@/lib/reports/human-premium/types";
import { useLocale } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type PaymentConfig = {
  portone: boolean;
  paypalLink: boolean;
  demoAllowed: boolean;
  demoReady: boolean;
};

type CartPaymentMethod = "portone" | "demo" | "unsupported";

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

/**
 * Cart payment-method resolution.
 * - KO + PortOne → portone
 * - KO + no PortOne + demo allowed → demo (dev only)
 * - EN → unsupported (PayPal not in this scope)
 *
 * TODO(EN launch): add `paypal_link` here using original shop pattern from commit d350855^
 * (HumanPremiumShop prepareCheckout("paypal_link") + success page). Extend without rewriting KO.
 */
function resolveCartPaymentMethod(
  locale: string,
  config: PaymentConfig | null
): CartPaymentMethod {
  if (locale === "en") return "unsupported";
  if (config?.portone) return "portone";
  if (config?.demoAllowed && config.demoReady) return "demo";
  return "unsupported";
}

export function HumanPremiumCartClient() {
  const routeLocale = useLocale();
  const isKo = routeLocale === "ko";
  const priceLocale = isKo ? "ko" : "en";
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeLabels = isKo ? REPORT_TYPE_LABELS : REPORT_TYPE_LABELS_EN;
  const { userId, isAnonymous, accessToken } = useSupabaseSession();
  const storageUserId = resolveHumanPremiumStorageUserId(userId, isAnonymous);
  const purchaseProfile = loadHumanPremiumProfile(storageUserId);
  const { purchasedTypes, loading: purchasesLoading } = useHumanPremiumPurchases({
    storageUserId,
    profile: purchaseProfile,
  });

  const [cart, setCart] = useState<HumanPremiumCartState>({ items: [], orderId: null, paid: false });
  const [profileReady, setProfileReady] = useState(false);
  const [paying, setPaying] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [generatingType, setGeneratingType] = useState<ReportType | null>(null);
  const [generated, setGenerated] = useState<Partial<Record<ReportType, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [portoneReady, setPortoneReady] = useState(false);

  const visibleItems = useMemo(() => {
    if (purchasesLoading || cart.paid) return cart.items;
    const purchased = new Set(purchasedTypes);
    return cart.items.filter((type) => !purchased.has(type));
  }, [purchasesLoading, cart.paid, cart.items, purchasedTypes]);

  const cartPricing = useMemo(
    () => getCartPricingSummary(visibleItems, priceLocale),
    [visibleItems, priceLocale]
  );
  const paymentMethod = resolveCartPaymentMethod(routeLocale, paymentConfig);
  const orderIdFromUrl = searchParams.get("orderId");

  const refreshCart = useCallback(() => {
    setCart(loadHumanPremiumCart(storageUserId));
    setProfileReady(profileHasBirthData(loadHumanPremiumProfile(storageUserId)));
  }, [storageUserId]);

  useEffect(() => {
    if (purchasesLoading || cart.paid) return;
    const purchased = new Set(purchasedTypes);
    const stale = cart.items.filter((type) => purchased.has(type));
    if (!stale.length) return;
    for (const type of stale) {
      removeFromHumanPremiumCart(storageUserId, type);
    }
    setCart(loadHumanPremiumCart(storageUserId));
  }, [purchasesLoading, purchasedTypes, cart.items, cart.paid, storageUserId]);

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
      saveHumanPremiumCart(storageUserId, nextCart);
      setCart(nextCart);
      setGenerated(snapshotToUrls(data.generated ?? {}, routeLocale));
    },
    [routeLocale, storageUserId]
  );

  useEffect(() => {
    refreshCart();
  }, [refreshCart, storageUserId]);

  useEffect(() => {
    void fetch("/api/payments/human-premium/config")
      .then((res) => res.json())
      .then((data: PaymentConfig) => setPaymentConfig(data))
      .catch(() =>
        setPaymentConfig({
          portone: false,
          paypalLink: false,
          demoAllowed: false,
          demoReady: false,
        })
      );
  }, []);

  useEffect(() => {
    if (document.querySelector('script[src*="cdn.portone.io"]')) {
      setPortoneReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.portone.io/v2/browser-sdk.js";
    script.async = true;
    script.onload = () => setPortoneReady(true);
    document.head.appendChild(script);
  }, []);

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

  function authHeaders(extra?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = { ...extra };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    return headers;
  }

  function buildCheckoutBody() {
    const profile = loadHumanPremiumProfile(storageUserId);
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
      cartItems: visibleItems,
    };
  }

  function markPaidLocally(orderId: string) {
    const next = markHumanPremiumCartPaid(
      storageUserId,
      orderId,
      loadHumanPremiumProfile(storageUserId)
    );
    setCart(next);
    setConfirmOpen(false);
  }

  function openPayConfirm() {
    setError(null);
    if (!profileReady) {
      setError(isKo ? "먼저 사주 정보를 입력해 주세요." : "Enter your birth details first.");
      return;
    }
    if (!visibleItems.length) {
      setError(isKo ? "장바구니가 비어 있어요." : "Your cart is empty.");
      return;
    }
    if (paymentMethod === "unsupported") {
      setError(
        isKo
          ? "결제 수단을 준비 중이에요. 잠시 후 다시 시도해 주세요."
          : // TODO(EN launch): replace with PayPal cart checkout (d350855^ shop pattern)
            "English cart checkout is not available yet. Please use the Korean (KO) checkout for now."
      );
      return;
    }
    setConfirmOpen(true);
  }

  async function handleDemoPay() {
    const res = await fetch("/api/payments/human-premium/cart/demo-pay", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(buildCheckoutBody()),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Payment failed");
    markPaidLocally(String(data.orderId));
  }

  async function handlePortOnePay() {
    const checkoutRes = await fetch("/api/payments/human-premium/cart/checkout", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        ...buildCheckoutBody(),
        paymentMethod: "portone",
      }),
    });
    const checkout = (await checkoutRes.json()) as Record<string, unknown>;
    if (!checkoutRes.ok) {
      throw new Error(String(checkout.error ?? "Checkout failed"));
    }

    const paymentId = String(checkout.paymentId ?? "");
    const amount = Number(checkout.amount);
    if (!paymentId || !Number.isFinite(amount)) {
      throw new Error(isKo ? "결제 준비에 실패했어요." : "Checkout failed.");
    }

    const PortOne = (
      window as unknown as {
        PortOne?: { requestPayment: (args: unknown) => Promise<{ code?: string }> };
      }
    ).PortOne;
    if (!PortOne || !portoneReady || !process.env.NEXT_PUBLIC_PORTONE_SHOP_ID) {
      throw new Error(isKo ? "결제 모듈을 불러오지 못했어요." : "Payment module unavailable.");
    }

    const payResult = await PortOne.requestPayment({
      storeId: process.env.NEXT_PUBLIC_PORTONE_SHOP_ID,
      paymentId,
      orderName: String(checkout.orderName ?? "K-Saju"),
      totalAmount: amount,
      currency: String(checkout.currency ?? "KRW"),
      channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY ?? "",
      payMethod: "CARD",
    });

    if (payResult?.code !== undefined) {
      throw new Error(isKo ? "결제가 취소되었어요." : "Payment cancelled.");
    }

    const verifyRes = await fetch("/api/payments/human-premium/cart/verify", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        paymentId,
        locale: routeLocale,
        paymentMethod: "portone",
      }),
    });
    const verifyData = (await verifyRes.json()) as { error?: string; orderId?: string };
    if (!verifyRes.ok) {
      throw new Error(verifyData.error ?? "Payment verify failed");
    }

    markPaidLocally(String(verifyData.orderId ?? paymentId));
  }

  async function handleConfirmPay() {
    setError(null);
    setPaying(true);
    try {
      // Explicit payment-method fork — add EN paypal_link case here later.
      switch (paymentMethod) {
        case "portone":
          await handlePortOnePay();
          break;
        case "demo":
          await handleDemoPay();
          break;
        case "unsupported":
        default:
          throw new Error(
            isKo
              ? "결제 수단을 준비 중이에요."
              : // TODO(EN launch): PayPal cart (d350855^)
                "English cart checkout is not available yet."
          );
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Payment failed";
      setError(formatHumanPremiumError(raw, routeLocale as "ko" | "en"));
      // Cancel / failure: keep cart unpaid; leave confirm open so user can retry or cancel.
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
    setCart(removeFromHumanPremiumCart(storageUserId, reportType));
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
          {visibleItems.length === 0 ? (
            <p className="text-center text-sm text-plum/80">
              {isKo ? "담은 리포트가 없어요." : "No reports in cart."}{" "}
              <Link href="/premium/human/vault" className="font-semibold text-channel-saju underline">
                {isKo ? "보관함 보기" : "Open vault"}
              </Link>
            </p>
          ) : (
            visibleItems.map((reportType) => {
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
                    <p className="text-sm font-bold text-ink">
                      {formatPrice(getReportPrice(reportType, priceLocale), priceLocale)}
                    </p>
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
                              ? "준비중"
                              : "Coming soon"}
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

          {visibleItems.length > 0 ? (
            <div className="space-y-1 border-t border-plum/10 pt-3 text-right">
              {cartPricing.isAllInOneBundle ? (
                <>
                  <p className="text-xs font-semibold text-channel-saju">
                    {isKo ? "올인원 번들 적용" : "All-in-one bundle applied"}
                  </p>
                  <p className="text-xs text-plum/55 line-through">
                    {formatPrice(cartPricing.listTotal, priceLocale)}
                  </p>
                  <p className="text-xs text-plum/70">
                    {isKo ? "할인" : "Savings"} −{formatPrice(cartPricing.savings, priceLocale)}
                  </p>
                </>
              ) : null}
              <p className="text-lg font-bold text-ink">
                {isKo ? "합계" : "Total"} {formatPrice(cartPricing.amount, priceLocale)}
              </p>
            </div>
          ) : null}
        </section>

        {error ? (
          <p role="alert" className="rounded-2xl border border-red-300/80 bg-red-50 px-4 py-3 text-sm text-red-900">
            {error}
          </p>
        ) : null}

        <CartPayConfirmModal
          open={confirmOpen}
          isKo={isKo}
          items={visibleItems}
          typeLabels={typeLabels}
          amount={cartPricing.amount}
          listTotal={cartPricing.listTotal}
          savings={cartPricing.savings}
          isAllInOneBundle={cartPricing.isAllInOneBundle}
          paying={paying}
          onConfirm={() => void handleConfirmPay()}
          onCancel={() => {
            if (!paying) setConfirmOpen(false);
          }}
        />

        <div className="flex flex-wrap justify-center gap-3">
          {!cart.paid && visibleItems.length > 0 ? (
            <button
              type="button"
              disabled={paying || !profileReady}
              onClick={openPayConfirm}
              className="rounded-full bg-channel-saju px-6 py-3 font-bold text-white disabled:opacity-50"
            >
              {isKo
                ? `결제하기 ${formatPrice(cartPricing.amount, priceLocale)}`
                : `Pay ${formatPrice(cartPricing.amount, priceLocale)}`}
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
            onClick={() => resetHumanPremiumCart(storageUserId)}
            className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white"
          >
            {isKo ? "리포트 더 담기" : "Add more"}
          </Link>
        </div>
      </div>
    </>
  );
}
