"use client";

import { Link } from "@/i18n/navigation";
import { formatPrice, getDailyExtraPrice } from "@/lib/reports/human-premium/pricing";

const UI = {
  ko: {
    title: "결제가 필요해요",
    body: "데일리 럭키는 유료 상품이에요. 오픈기념 쿠폰이 있으면 무료로 볼 수 있어요.",
    viewAgain: "내 리포트 다시 보기",
    close: "닫기",
    paying: "결제 처리 중…",
  },
  en: {
    title: "Payment required",
    body: "Daily Lucky Reading is a paid product. Use a launch coupon for one free reading.",
    viewAgain: "View my report again",
    close: "Close",
    paying: "Processing payment…",
  },
} as const;

/** Paywall when coupon is unavailable (kept for optional reuse). */
export function DailyQuotaModal({
  open,
  isKo,
  todayReportToken,
  paying,
  onClose,
  onPay,
}: {
  open: boolean;
  isKo: boolean;
  todayReportToken: string | null;
  paying: boolean;
  onClose: () => void;
  onPay: () => void;
}) {
  if (!open) return null;

  const t = UI[isKo ? "ko" : "en"];
  const payCta = isKo
    ? `${formatPrice(getDailyExtraPrice("ko"), "ko")}으로 보기`
    : `Unlock for ${formatPrice(getDailyExtraPrice("en"), "en")}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="daily-quota-title"
    >
      <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-xl">
        <h3 id="daily-quota-title" className="text-lg font-bold text-ink">
          {t.title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-plum/80">{t.body}</p>
        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            disabled={paying}
            onClick={() => void onPay()}
            className="human-premium-birth-submit human-premium-birth-submit--plan disabled:opacity-60"
          >
            <span className="human-premium-birth-submit-body">
              {paying ? t.paying : payCta}
            </span>
          </button>
          {todayReportToken ? (
            <Link
              href={`/reports/human/${todayReportToken}`}
              className="rounded-2xl border border-plum/20 py-3 text-center text-sm font-semibold text-plum underline"
            >
              {t.viewAgain}
            </Link>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="py-2 text-center text-sm text-plum/60"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}
