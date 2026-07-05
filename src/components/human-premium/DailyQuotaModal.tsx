"use client";

import { Link } from "@/i18n/navigation";
import { formatPrice, getDailyExtraPrice } from "@/lib/reports/human-premium/pricing";

const UI = {
  ko: {
    title: "오늘의 무료 리포트를 이미 확인하셨어요",
    body: "계정당 하루 1회 무료예요. 다른 사주 리포트는 유료로 이용할 수 있어요.",
    viewAgain: "오늘 본 내 리포트 다시 보기",
    close: "닫기",
    paying: "결제 처리 중…",
  },
  en: {
    title: "You've used today's free report",
    body: "One free daily report per account (KST). Additional charts require payment.",
    viewAgain: "View today's report again",
    close: "Close",
    paying: "Processing payment…",
  },
} as const;

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
    ? "1,900원으로 추가 리포트 보기"
    : `Unlock another report for ${formatPrice(getDailyExtraPrice("en"), "en")}`;

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
