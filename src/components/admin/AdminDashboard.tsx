"use client";

import { AdminModeration } from "@/components/admin/AdminModeration";
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

type Tab = "stats" | "moderation";

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

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab("stats")}
          className={
            tab === "stats"
              ? "rounded-full bg-plum px-4 py-2 text-sm font-semibold text-white"
              : "rounded-full bg-white/60 px-4 py-2 text-sm font-semibold text-plum/70"
          }
        >
          통계
        </button>
        <button
          type="button"
          onClick={() => setTab("moderation")}
          className={
            tab === "moderation"
              ? "rounded-full bg-plum px-4 py-2 text-sm font-semibold text-white"
              : "rounded-full bg-white/60 px-4 py-2 text-sm font-semibold text-plum/70"
          }
        >
          게시글 관리
        </button>
      </div>

      {tab === "stats" && (
        <div className="space-y-4">
          {!stats && <p className="text-plum/60">통계 불러오는 중…</p>}
          {stats?.source === "mock" && (
            <p className="text-xs text-plum/50">데모 통계 (Supabase 미연동)</p>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => (
              <div
                key={c.label}
                className="rounded-2xl bg-lavender/30 px-5 py-4 text-center"
              >
                <p className="text-2xl font-bold text-plum">{c.value}</p>
                <p className="text-sm text-plum/60">{c.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "moderation" && <AdminModeration />}
    </div>
  );
}
