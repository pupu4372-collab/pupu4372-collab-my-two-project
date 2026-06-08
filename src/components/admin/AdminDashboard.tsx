"use client";

import { AdminModeration } from "@/components/admin/AdminModeration";
import { AdminReportsInbox } from "@/components/admin/AdminReportsInbox";
import { GlassCard } from "@/components/layout/StitchLayout";
import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";

interface Stats {
  source: string;
  pets?: number;
  photoPosts?: number;
  qaPosts?: number;
  comments?: number;
  posts?: number;
  payments?: number;
  sajuResults?: number;
}

type Tab = "stats" | "reports" | "moderation";

const STAT_ICONS = ["👤", "📸", "💬", "🗨️", "✨", "💳"] as const;

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [tab, setTab] = useState<Tab>("stats");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  const cards = stats
    ? [
        { label: "반려동물", value: stats.pets ?? 0 },
        { label: "Pet Show", value: stats.photoPosts ?? stats.posts ?? 0 },
        { label: "Q&A", value: stats.qaPosts ?? 0 },
        { label: "댓글", value: stats.comments ?? 0 },
        { label: "사주 결과", value: stats.sajuResults ?? 0 },
        { label: "결제 완료", value: stats.payments ?? 0 },
      ]
    : [];

  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-primary">대시보드 개요</h2>
          <p className="mt-1 text-sm text-plum/65">K-Saju Pet 서비스의 실시간 현황을 한눈에 파악하세요.</p>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-full bg-surface-container-high px-4 py-2 text-xs font-bold text-secondary">
          <span aria-hidden>📅</span>
          {today}
        </div>
      </div>

      <GlassCard className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-plum">인간용 Premium 테스트</p>
            <p className="mt-1 text-sm text-plum/65">
              무결제 생성, 웹 리포트 링크, 이메일 재발송 A/S
            </p>
          </div>
          <Link
            href="/admin/human-premium-test"
            className="inline-flex rounded-full bg-channel-saju px-4 py-2 text-sm font-semibold text-white"
          >
            테스트 루트 열기
          </Link>
        </div>
      </GlassCard>

      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: "stats" as const, label: "통계" },
            { id: "reports" as const, label: "신고함" },
            { id: "moderation" as const, label: "게시글 관리" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={
              tab === item.id
                ? "rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm"
                : "rounded-full bg-white/70 px-5 py-2.5 text-sm font-semibold text-plum/70 transition hover:bg-white"
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "stats" && (
        <div className="space-y-4">
          {!stats && <p className="text-sm text-plum/60">통계 불러오는 중…</p>}
          {stats?.source === "mock" && (
            <p className="rounded-full bg-surface-container-high px-4 py-2 text-xs text-plum/55">
              데모 통계 (Supabase 미연동)
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {cards.map((card, index) => (
              <GlassCard key={card.label} className="flex flex-col items-center p-6 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-xl">
                  {STAT_ICONS[index] ?? "📊"}
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{card.label}</p>
                <p className="mt-2 text-2xl font-bold text-primary">{card.value.toLocaleString()}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {tab === "reports" && (
        <GlassCard>
          <h3 className="mb-4 text-lg font-bold text-primary">신고함</h3>
          <AdminReportsInbox />
        </GlassCard>
      )}

      {tab === "moderation" && (
        <GlassCard>
          <h3 className="mb-4 text-lg font-bold text-primary">커뮤니티 모니터링</h3>
          <AdminModeration />
        </GlassCard>
      )}
    </div>
  );
}
