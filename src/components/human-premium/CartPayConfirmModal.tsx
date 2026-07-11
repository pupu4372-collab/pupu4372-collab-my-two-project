"use client";

import { formatPrice } from "@/lib/reports/human-premium/pricing";
import type { ReportType } from "@/lib/reports/human-premium/types";

export function CartPayConfirmModal({
  open,
  isKo,
  items,
  typeLabels,
  amount,
  listTotal,
  savings,
  isAllInOneBundle,
  paying,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  isKo: boolean;
  items: ReportType[];
  typeLabels: Record<ReportType, string>;
  amount: number;
  listTotal: number;
  savings: number;
  isAllInOneBundle: boolean;
  paying: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  const priceLocale = isKo ? "ko" : "en";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-pay-confirm-title"
    >
      <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-xl">
        <h3 id="cart-pay-confirm-title" className="text-lg font-bold text-ink">
          {isKo ? "결제 확인" : "Confirm payment"}
        </h3>
        <p className="mt-2 text-sm text-plum/75">
          {isKo
            ? "아래 내용을 확인한 뒤 결제를 진행해 주세요."
            : "Review your order before paying."}
        </p>

        <ul className="mt-4 max-h-48 space-y-1.5 overflow-y-auto rounded-2xl border border-plum/10 bg-cream/40 px-4 py-3">
          {items.map((type) => (
            <li key={type} className="text-sm font-semibold text-ink">
              {typeLabels[type]}
            </li>
          ))}
        </ul>

        <div className="mt-4 space-y-1 border-t border-plum/10 pt-4 text-sm">
          {isAllInOneBundle ? (
            <>
              <p className="font-bold text-channel-saju">
                {isKo ? "올인원 번들 적용" : "All-in-one bundle applied"}
              </p>
              <p className="text-plum/70 line-through">
                {isKo ? "정가 합계" : "List total"} {formatPrice(listTotal, priceLocale)}
              </p>
              <p className="text-plum/80">
                {isKo ? "할인" : "Savings"} −{formatPrice(savings, priceLocale)}
              </p>
            </>
          ) : null}
          <p className="text-lg font-bold text-ink">
            {isKo ? "결제 금액" : "Total"} {formatPrice(amount, priceLocale)}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            disabled={paying}
            onClick={() => void onConfirm()}
            className="rounded-full bg-channel-saju px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {paying
              ? isKo
                ? "결제 처리 중…"
                : "Processing…"
              : isKo
                ? `결제하기 ${formatPrice(amount, priceLocale)}`
                : `Pay ${formatPrice(amount, priceLocale)}`}
          </button>
          <button
            type="button"
            disabled={paying}
            onClick={onCancel}
            className="py-2 text-center text-sm text-plum/60 disabled:opacity-50"
          >
            {isKo ? "취소" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}
