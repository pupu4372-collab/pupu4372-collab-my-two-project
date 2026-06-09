"use client";

import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import type { SupportInquiry } from "@/lib/supabase/types";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const CATEGORY_LABELS: Record<SupportInquiry["category"], string> = {
  guide: "이용방법",
  account: "계정/로그인",
  payment_report: "결제/리포트",
  community: "커뮤니티",
  partnership: "제휴문의",
  general: "기타",
};

const STATUS_LABELS: Record<SupportInquiry["status"], string> = {
  pending: "대기",
  reviewing: "검토중",
  resolved: "처리완료",
  closed: "종료",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function AdminSupportInquiries() {
  const { accessToken, isAnonymous } = useSupabaseSession();
  const [inquiries, setInquiries] = useState<SupportInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/support-inquiries", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "문의함 불러오기 실패");
      setInquiries(data.inquiries ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "문의함 불러오기 실패");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void load();
  }, [load]);

  if (isAnonymous) {
    return (
      <p className="text-sm text-plum/65">
        관리자 계정으로 로그인하면 문의함을 볼 수 있어요.{" "}
        <Link href="/login" className="underline">
          로그인
        </Link>
      </p>
    );
  }

  if (loading) return <p className="text-sm text-plum/60">문의함 불러오는 중...</p>;
  if (error) return <p className="text-sm text-red-700/80">{error}</p>;

  return (
    <div className="space-y-3">
      {inquiries.length === 0 && <p className="text-sm text-plum/55">접수된 문의가 없습니다.</p>}
      {inquiries.map((inquiry) => (
        <article key={inquiry.id} className="rounded-[1.25rem] border border-plum/10 bg-white/60 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-plum/45">
            <span className="font-extrabold text-primary">{STATUS_LABELS[inquiry.status]}</span>
            <span>{CATEGORY_LABELS[inquiry.category]}</span>
            <span>{formatDate(inquiry.created_at)}</span>
            <a href={`mailto:${inquiry.email}`} className="font-bold text-channel-saju hover:underline">
              {inquiry.email}
            </a>
            {inquiry.name && <span>{inquiry.name}</span>}
          </div>
          <h4 className="mt-2 text-sm font-extrabold text-plum">{inquiry.title}</h4>
          <p className="mt-2 whitespace-pre-wrap rounded-xl bg-white/65 px-3 py-2 text-sm leading-relaxed text-plum/70">
            {inquiry.message}
          </p>
        </article>
      ))}
    </div>
  );
}
