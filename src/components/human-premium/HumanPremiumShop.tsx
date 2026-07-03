"use client";

import { DayPillarPreview } from "@/components/human-premium/DayPillarPreview";
import { Link } from "@/i18n/navigation";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import {
  addManyToHumanPremiumCart,
  addToHumanPremiumCart,
  getPaidHumanPremiumOrderIds,
  getPurchasedReportTypes,
  loadHumanPremiumCart,
  loadHumanPremiumProfile,
  removeFromHumanPremiumCart,
  resetHumanPremiumCart,
  resolveHumanPremiumStorageUserId,
  saveHumanPremiumProfile,
  syncPaidOrdersFromVault,
  type HumanPremiumCartState,
  type HumanPremiumProfile,
} from "@/lib/reports/human-premium/cart-session";
import {
  formatPrice,
  getBundlePricing,
  getBundleSavings,
  getReportPrice,
  REPORT_CARD_THEMES,
  REPORT_TYPE_ORDER,
  REPORT_TYPE_SUBTITLES_EN,
  REPORT_TYPE_SUBTITLES_KO,
  sumPaidReportPricing,
  sumCartAmount,
} from "@/lib/reports/human-premium/pricing";
import {
  REPORT_TYPE_LABELS,
  REPORT_TYPE_LABELS_EN,
  type ReportType,
} from "@/lib/reports/human-premium/types";
import { useLocale } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function HumanPremiumShop() {
  const routeLocale = useLocale();
  const isKo = routeLocale === "ko";
  const priceLocale = isKo ? "ko" : "en";
  const cartRef = useRef<HTMLDivElement>(null);
  const { userId, isAnonymous } = useSupabaseSession();
  const storageUserId = resolveHumanPremiumStorageUserId(userId, isAnonymous);

  const [profile, setProfile] = useState<HumanPremiumProfile>(() => loadHumanPremiumProfile(storageUserId));
  const [cart, setCart] = useState<HumanPremiumCartState>({ items: [], orderId: null, paid: false });
  const [cartFlash, setCartFlash] = useState(false);
  const [purchasedTypes, setPurchasedTypes] = useState<ReportType[]>([]);

  const savings = getBundleSavings(priceLocale);
  const bundlePricing = getBundlePricing(priceLocale);
  const subtitles = isKo ? REPORT_TYPE_SUBTITLES_KO : REPORT_TYPE_SUBTITLES_EN;
  const typeLabels = isKo ? REPORT_TYPE_LABELS : REPORT_TYPE_LABELS_EN;
  const cartTotal = useMemo(() => sumCartAmount(cart.items, priceLocale), [cart.items, priceLocale]);
  const purchasedSet = useMemo(() => new Set(purchasedTypes), [purchasedTypes]);
  const bundleAddableCount = useMemo(
    () => REPORT_TYPE_ORDER.filter((type) => !purchasedSet.has(type) && !cart.items.includes(type)).length,
    [cart.items, purchasedSet]
  );

  useEffect(() => {
    const nextProfile = loadHumanPremiumProfile(storageUserId);
    setProfile(nextProfile);
    const stored = loadHumanPremiumCart(storageUserId);
    if (stored.paid) {
      setCart(resetHumanPremiumCart(storageUserId));
    } else {
      setCart(stored);
    }
    setPurchasedTypes(getPurchasedReportTypes(storageUserId, nextProfile));
  }, [storageUserId]);

  useEffect(() => {
    setPurchasedTypes(getPurchasedReportTypes(storageUserId, profile));

    async function syncPurchasedFromVault() {
      try {
        const orderIds = getPaidHumanPremiumOrderIds(storageUserId);
        const params = new URLSearchParams({ locale: routeLocale });
        if (orderIds.length) params.set("orderIds", orderIds.join(","));
        if (profile.email.trim()) params.set("email", profile.email.trim());

        const res = await fetch(`/api/payments/human-premium/vault?${params.toString()}`);
        const data = await res.json();
        if (!res.ok) return;

        syncPaidOrdersFromVault(storageUserId, data.orders ?? []);
        setPurchasedTypes(getPurchasedReportTypes(storageUserId, profile));
      } catch {
        // ignore vault sync errors; local paid orders still apply
      }
    }

    void syncPurchasedFromVault();
  }, [
    profile.personName,
    profile.birthDate,
    profile.birthTimeSelect,
    profile.email,
    routeLocale,
    storageUserId,
  ]);

  const patchProfile = useCallback(
    (partial: Partial<HumanPremiumProfile>) => {
      setProfile((prev) => {
        const next = { ...prev, ...partial };
        saveHumanPremiumProfile(storageUserId, next);
        return next;
      });
    },
    [storageUserId]
  );

  function handleAddToCart(reportType: ReportType) {
    if (purchasedSet.has(reportType)) return;
    setCart(addToHumanPremiumCart(storageUserId, reportType, profile));
    setCartFlash(true);
    window.setTimeout(() => setCartFlash(false), 600);
  }

  function handleAddBundle() {
    setCart(addManyToHumanPremiumCart(storageUserId, REPORT_TYPE_ORDER, profile));
    setCartFlash(true);
    window.setTimeout(() => setCartFlash(false), 600);
    cartRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleRemove(reportType: ReportType) {
    setCart(removeFromHumanPremiumCart(storageUserId, reportType));
  }

  return (
    <div className="space-y-10">
      <DayPillarPreview profile={profile} onPatchProfile={patchProfile} />

      <div className="space-y-6">
        <header className="text-center">
          <h2 className="text-2xl font-bold text-white">
            {isKo ? "리포트 선택" : "Choose your report"}
          </h2>
          <p className="mt-2 text-sm text-white/75">
            {isKo
              ? "원하는 리포트를 담고 장바구니에서 한 번에 결제하세요."
              : "Add reports to your cart and pay once."}
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REPORT_TYPE_ORDER.map((reportType) => {
            const theme = REPORT_CARD_THEMES[reportType];
            const inCart = cart.items.includes(reportType);
            const purchased = purchasedSet.has(reportType);
            return (
              <article
                key={reportType}
                className="flex flex-col rounded-[2rem] border p-5 shadow-[0_10px_30px_-16px_rgba(68,38,86,0.22)] backdrop-blur-md transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-18px_rgba(68,38,86,0.28)]"
                style={{
                  backgroundColor: theme.bg,
                  borderColor: theme.border,
                }}
              >
                <p
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: theme.accent }}
                >
                  {typeLabels[reportType]}
                </p>
                <p className="mt-2 text-sm text-ink/80">{subtitles[reportType]}</p>
                <p className="mt-4 text-2xl font-bold text-ink">
                  {formatPrice(getReportPrice(reportType, priceLocale), priceLocale)}
                </p>
                <button
                  type="button"
                  disabled={inCart || purchased}
                  onClick={() => handleAddToCart(reportType)}
                  className="mt-auto pt-4 text-sm font-bold underline underline-offset-4 disabled:cursor-default disabled:no-underline disabled:opacity-50"
                  style={{ color: theme.accent }}
                >
                  {purchased
                    ? isKo
                      ? "구매함"
                      : "Purchased"
                    : inCart
                      ? isKo
                        ? "담김"
                        : "Added"
                      : isKo
                        ? "담기"
                        : "Add"}
                </button>
                {purchased ? (
                  <Link
                    href="/premium/human/vault"
                    className="mt-1 text-center text-[11px] font-semibold text-ink/55 underline"
                  >
                    {isKo ? "보관함에서 보기" : "View in vault"}
                  </Link>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>

      <div
        ref={cartRef}
        className={`transition ${cartFlash ? "ring-2 ring-white/40 ring-offset-2 ring-offset-transparent" : ""}`}
      >
        <section className="pastel-card mx-auto w-full max-w-lg space-y-4 p-6">
          <header className="text-center">
            <h3 className="text-lg font-bold text-ink">{isKo ? "장바구니" : "Cart"}</h3>
            <p className="mt-1 text-sm text-plum/70">
              {isKo
                ? `${cart.items.length}개 · 합계 ${formatPrice(cartTotal, priceLocale)}`
                : `${cart.items.length} item(s) · ${formatPrice(cartTotal, priceLocale)}`}
            </p>
          </header>

          {cart.items.length === 0 ? (
            <p className="text-center text-sm text-plum/70">
              {isKo ? "리포트를 선택해 담아주세요." : "Add reports from the grid above."}{" "}
              <Link href="/premium/human/vault" className="font-semibold text-channel-saju underline">
                {isKo ? "구매한 리포트 보관함" : "Purchased reports"}
              </Link>
            </p>
          ) : (
            <ul className="space-y-2">
              {cart.items.map((reportType) => {
                const theme = REPORT_CARD_THEMES[reportType];
                return (
                  <li
                    key={reportType}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-plum/10 bg-white px-4 py-3"
                  >
                    <span className="font-semibold text-ink" style={{ color: theme.accent }}>
                      {typeLabels[reportType]}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-ink">
                        {formatPrice(getReportPrice(reportType, priceLocale), priceLocale)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemove(reportType)}
                        className="text-xs font-semibold text-plum underline"
                      >
                        {isKo ? "삭제" : "Remove"}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {cart.items.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-3 border-t border-plum/10 pt-4">
              <Link
                href="/premium/human/cart"
                className="rounded-full bg-channel-saju px-6 py-3 text-sm font-bold text-white"
              >
                {isKo ? `결제하기 ${formatPrice(cartTotal, priceLocale)}` : `Checkout ${formatPrice(cartTotal, priceLocale)}`}
              </Link>
            </div>
          ) : null}
        </section>
      </div>

      <section className="rounded-[2rem] bg-gradient-to-br from-channel-saju/90 to-plum p-6 text-white sm:p-8">
        <p className="text-sm font-semibold text-white/80">
          {isKo ? "올인원 번들" : "All-in-one bundle"}
        </p>
        <h3 className="mt-2 text-xl font-bold sm:text-2xl">
          {isKo
            ? `단품으로 모두 구매 시 ${formatPrice(sumPaidReportPricing(priceLocale), priceLocale)}`
            : `Buying all singles: ${formatPrice(sumPaidReportPricing(priceLocale), priceLocale)}`}
        </h3>
        <p className="mt-2 text-lg font-semibold">
          → {isKo ? "올인원 번들" : "All-in-one bundle"}{" "}
          <span className="text-2xl">{formatPrice(bundlePricing.all, priceLocale)}</span>
          <span className="ml-2 text-sm text-white/90">
            ({isKo ? `${formatPrice(savings, priceLocale)} 절약` : `save ${formatPrice(savings, priceLocale)}`})
          </span>
        </p>
        <button
          type="button"
          disabled={bundleAddableCount === 0}
          onClick={() => handleAddBundle()}
          className="mt-6 rounded-full bg-white px-8 py-3 font-bold text-channel-saju shadow-lg disabled:opacity-50"
        >
          {bundleAddableCount === 0
            ? isKo
              ? "모두 구매함"
              : "All purchased"
            : isKo
              ? "전체 담기"
              : "Add all"}
        </button>
      </section>
    </div>
  );
}
