"use client";

import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import type { CommunityPost, PostComment, PostReport, ReportStatus } from "@/lib/supabase/types";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface AdminReportRow extends PostReport {
  reporter_name?: string;
  post?: CommunityPost | null;
  comment?: PostComment | null;
  target_author_name?: string;
  target_href?: string;
}

const REASON_LABELS: Record<string, string> = {
  spam: "스팸/광고",
  abuse: "욕설/혐오",
  adult: "음란/부적절한 이미지",
  privacy: "개인정보 노출",
  animal_harm: "동물 학대/위험한 정보",
  misinformation: "잘못된 정보",
  other: "기타",
};

const STATUS_LABELS: Record<ReportStatus, string> = {
  pending: "대기",
  reviewing: "검토중",
  resolved: "처리완료",
  rejected: "기각",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function AdminReportsInbox() {
  const { accessToken, isAnonymous } = useSupabaseSession();
  const [reports, setReports] = useState<AdminReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workingId, setWorkingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/reports", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "신고함 불러오기 실패");
      setReports(data.reports ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "신고함 불러오기 실패");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void load();
  }, [load]);

  async function updateReport(
    report: AdminReportRow,
    status: ReportStatus,
    action: "hide_post" | "unhide_post" | "hide_comment" | "unhide_comment" | "none" = "none"
  ) {
    if (!accessToken || workingId) return;

    setWorkingId(report.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reports/${report.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          action,
          postId: report.post?.id ?? report.post_id,
          commentId: report.comment?.id ?? report.comment_id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "신고 처리 실패");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "신고 처리 실패");
    } finally {
      setWorkingId(null);
    }
  }

  if (isAnonymous) {
    return (
      <p className="text-sm text-plum/65">
        관리자 계정으로 로그인하면 신고함을 볼 수 있어요.{" "}
        <Link href="/login" className="underline">
          로그인
        </Link>
      </p>
    );
  }

  if (loading) return <p className="text-sm text-plum/60">신고함 불러오는 중…</p>;
  if (error) return <p className="text-sm text-red-700/80">{error}</p>;

  return (
    <div className="space-y-3">
      {reports.length === 0 && (
        <p className="text-sm text-plum/55">접수된 신고가 없습니다.</p>
      )}
      {reports.map((report) => {
        const targetLabel = report.comment ? "댓글" : "게시글";
        const hidden = report.comment?.is_hidden ?? report.post?.is_hidden ?? false;
        const pending = report.status === "pending" || report.status === "reviewing";

        return (
          <article
            key={report.id}
            className={`rounded-[1.25rem] border px-4 py-3 ${
              pending ? "border-red-200/70 bg-red-50/40" : "border-plum/10 bg-white/60"
            }`}
          >
            <div className="flex flex-wrap items-center gap-2 text-xs text-plum/45">
              <span className="font-extrabold text-red-600">{STATUS_LABELS[report.status]}</span>
              <span>{formatDate(report.created_at)}</span>
              <span>{targetLabel}</span>
              <span>신고자: {report.reporter_name ?? "집사"}</span>
              <span>대상 작성자: {report.target_author_name ?? "집사"}</span>
              {hidden && <span className="font-bold text-red-700">숨김</span>}
            </div>

            <div className="mt-2 space-y-1">
              <p className="text-sm font-bold text-plum">
                사유: {REASON_LABELS[report.reason] ?? report.reason}
              </p>
              {report.detail && (
                <p className="rounded-xl bg-white/65 px-3 py-2 text-sm leading-relaxed text-plum/70">
                  {report.detail}
                </p>
              )}
              {report.post && (
                <p className="text-sm text-plum/70">
                  게시글: <span className="font-semibold">{report.post.title ?? "(제목 없음)"}</span>
                </p>
              )}
              {report.comment && (
                <p className="line-clamp-3 rounded-xl bg-sand/50 px-3 py-2 text-sm text-plum/70">
                  {report.comment.content}
                </p>
              )}
              {report.target_href && (
                <Link href={report.target_href} className="inline-block text-xs font-bold text-channel-community underline">
                  대상 보기
                </Link>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {report.post && (
                <button
                  type="button"
                  disabled={workingId === report.id}
                  onClick={() =>
                    void updateReport(report, "resolved", report.post?.is_hidden ? "unhide_post" : "hide_post")
                  }
                  className="rounded-full border border-red-200 bg-white px-4 py-1.5 text-xs font-semibold text-red-700 disabled:opacity-60"
                >
                  {report.post.is_hidden ? "게시글 복구 + 완료" : "게시글 숨김 + 완료"}
                </button>
              )}
              {report.comment && (
                <button
                  type="button"
                  disabled={workingId === report.id}
                  onClick={() =>
                    void updateReport(report, "resolved", report.comment?.is_hidden ? "unhide_comment" : "hide_comment")
                  }
                  className="rounded-full border border-red-200 bg-white px-4 py-1.5 text-xs font-semibold text-red-700 disabled:opacity-60"
                >
                  {report.comment.is_hidden ? "댓글 복구 + 완료" : "댓글 숨김 + 완료"}
                </button>
              )}
              <button
                type="button"
                disabled={workingId === report.id}
                onClick={() => void updateReport(report, "reviewing")}
                className="rounded-full border border-plum/15 bg-white px-4 py-1.5 text-xs font-semibold text-plum"
              >
                검토중
              </button>
              <button
                type="button"
                disabled={workingId === report.id}
                onClick={() => void updateReport(report, "rejected")}
                className="rounded-full border border-plum/15 bg-white px-4 py-1.5 text-xs font-semibold text-plum/65"
              >
                기각
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
