"use client";

import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import type { SupportInquiry } from "@/lib/supabase/types";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useCallback, useEffect, useState } from "react";

const STATUS_LABELS: Record<SupportInquiry["status"], { ko: string; en: string }> = {
  pending: { ko: "대기", en: "Pending" },
  reviewing: { ko: "검토중", en: "Reviewing" },
  resolved: { ko: "처리완료", en: "Resolved" },
  closed: { ko: "종료", en: "Closed" },
};

const CATEGORY_LABELS: Record<SupportInquiry["category"], { ko: string; en: string }> = {
  guide: { ko: "이용방법", en: "Guide" },
  account: { ko: "계정/로그인", en: "Account" },
  payment_report: { ko: "결제/리포트", en: "Payment" },
  community: { ko: "커뮤니티", en: "Community" },
  partnership: { ko: "제휴문의", en: "Partnership" },
  general: { ko: "기타", en: "General" },
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function SupportInquiryHistory() {
  const locale = useLocale();
  const isKo = locale === "ko";
  const { accessToken, isAnonymous } = useSupabaseSession();
  const [inquiries, setInquiries] = useState<SupportInquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken || isAnonymous) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/support/inquiries", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load inquiries.");
      setInquiries(data.inquiries ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load inquiries.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, isAnonymous]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section id="support-history" className="relative z-10 mt-10 rounded-[2rem] border border-[#c5c8d6] bg-[#eef0f7] p-6 shadow-[0_12px_28px_rgba(61,42,74,0.14)] md:p-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-plum">Inquiry History</p>
          <h2 className="mt-2 text-2xl font-extrabold text-primary">{isKo ? "문의내역" : "Inquiry history"}</h2>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading || !accessToken || isAnonymous}
          className="self-start rounded-full border border-[#c5c8d6] bg-white px-4 py-2 text-xs font-extrabold text-primary transition hover:bg-[#f8f9fc] disabled:opacity-50"
        >
          {isKo ? "새로고침" : "Refresh"}
        </button>
      </div>

      {!accessToken || isAnonymous ? (
        <p className="mt-6 rounded-2xl bg-white px-4 py-4 text-sm font-semibold text-plum">
          {isKo ? "로그인하면 내 문의 진행 현황을 확인할 수 있어요." : "Log in to view your inquiry history."}{" "}
          <Link href="/login" className="font-extrabold text-primary underline">
            {isKo ? "로그인" : "Log in"}
          </Link>
        </p>
      ) : loading ? (
        <p className="mt-6 text-sm font-semibold text-plum">{isKo ? "문의내역 불러오는 중..." : "Loading inquiries..."}</p>
      ) : error ? (
        <p className="mt-6 text-sm font-bold text-red-600">{error}</p>
      ) : inquiries.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-white px-4 py-4 text-sm font-semibold text-plum">
          {isKo ? "아직 접수된 문의가 없습니다." : "No inquiries yet."}
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {inquiries.map((inquiry) => (
            <article key={inquiry.id} className="rounded-2xl border border-[#c5c8d6] bg-white p-4">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-plum/70">
                <span className="rounded-full bg-[#dde0ea] px-3 py-1 text-primary">
                  {isKo ? STATUS_LABELS[inquiry.status].ko : STATUS_LABELS[inquiry.status].en}
                </span>
                <span>{isKo ? CATEGORY_LABELS[inquiry.category].ko : CATEGORY_LABELS[inquiry.category].en}</span>
                <span>{formatDate(inquiry.created_at)}</span>
              </div>
              <h3 className="mt-3 text-base font-extrabold text-primary">{inquiry.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-plum">{inquiry.message}</p>
              {inquiry.admin_note && (
                <p className="mt-3 rounded-xl bg-[#f3edf8] px-3 py-2 text-sm font-semibold leading-6 text-primary">
                  {inquiry.admin_note}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
