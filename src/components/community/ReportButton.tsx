"use client";

import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { getSafeInternalReturnPath } from "@/lib/auth/safe-internal-return-path";
import { Link, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useState } from "react";

type ReportReason =
  | "spam"
  | "abuse"
  | "adult"
  | "privacy"
  | "animal_harm"
  | "misinformation"
  | "other";

const REASONS: { id: ReportReason; ko: string; en: string }[] = [
  { id: "spam", ko: "스팸/광고", en: "Spam or ads" },
  { id: "abuse", ko: "욕설/혐오", en: "Abuse or hate" },
  { id: "adult", ko: "음란/부적절한 이미지", en: "Adult or inappropriate content" },
  { id: "privacy", ko: "개인정보 노출", en: "Personal information" },
  { id: "animal_harm", ko: "동물 학대/위험한 정보", en: "Animal harm or unsafe advice" },
  { id: "misinformation", ko: "잘못된 정보", en: "Misinformation" },
  { id: "other", ko: "기타", en: "Other" },
];

interface ReportButtonProps {
  postId?: string;
  commentId?: string;
  compact?: boolean;
}

export function ReportButton({ postId, commentId, compact = false }: ReportButtonProps) {
  const locale = useLocale();
  const isKo = locale === "ko";
  const pathname = usePathname();
  const { accessToken, configured, isAnonymous } = useSupabaseSession();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>("spam");
  const [detail, setDetail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!configured) return null;

  if (isAnonymous || !accessToken) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(getSafeInternalReturnPath(pathname || "/"))}`}
        className="text-xs font-semibold text-plum/45 underline hover:text-plum"
      >
        {isKo ? "로그인 후 신고" : "Log in to report"}
      </Link>
    );
  }

  async function submitReport() {
    if (loading) return;
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/community/reports", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: postId ?? null,
          commentId: commentId ?? null,
          reason,
          detail,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? (isKo ? "신고 접수 실패" : "Failed to report"));
      }
      setMessage(isKo ? "신고가 접수되었습니다." : "Report submitted.");
      setDetail("");
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : isKo ? "신고 접수 실패" : "Failed to report");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={compact ? "space-y-2" : "w-full max-w-md space-y-2"}>
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          setError(null);
          setMessage(null);
        }}
        className="rounded-full border border-red-200/70 bg-white/70 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50"
      >
        {isKo ? "신고" : "Report"}
      </button>

      {open && (
        <div className="rounded-2xl border border-red-100 bg-white/90 p-3 shadow-sm">
          <label className="block space-y-1 text-xs font-semibold text-plum/65">
            <span>{isKo ? "신고 사유" : "Reason"}</span>
            <select
              value={reason}
              onChange={(event) => setReason(event.target.value as ReportReason)}
              className="w-full rounded-xl border border-plum/10 bg-sand/40 px-3 py-2 text-sm text-plum"
            >
              {REASONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {isKo ? item.ko : item.en}
                </option>
              ))}
            </select>
          </label>

          <textarea
            value={detail}
            onChange={(event) => setDetail(event.target.value)}
            maxLength={1000}
            className="mt-2 min-h-[72px] w-full resize-y rounded-xl border border-plum/10 bg-sand/40 px-3 py-2 text-sm text-plum"
            placeholder={isKo ? "관리자에게 전달할 내용을 적어주세요. (선택)" : "Add details for moderators. (optional)"}
          />

          {error && <p className="mt-2 text-xs text-red-700/80">{error}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-plum/60"
            >
              {isKo ? "취소" : "Cancel"}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => void submitReport()}
              className="rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
            >
              {loading ? (isKo ? "접수 중..." : "Submitting...") : isKo ? "신고 접수" : "Submit"}
            </button>
          </div>
        </div>
      )}

      {message && <p className="text-xs font-semibold text-channel-community">{message}</p>}
    </div>
  );
}
