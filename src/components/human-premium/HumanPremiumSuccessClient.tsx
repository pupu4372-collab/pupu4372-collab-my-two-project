"use client";

import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type StatusPayload = {
  reportId: string;
  status: string;
  emailStatus: string | null;
  ready: boolean;
  webUrl: string | null;
  paymentProvider: string | null;
};

const PENDING_KEY = "human_premium_pending";

export function HumanPremiumSuccessClient() {
  const locale = useLocale();
  const isKo = locale === "ko";
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<StatusPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let reportId = String(searchParams.get("reportId") ?? "").trim();
    let token = String(searchParams.get("token") ?? "").trim();

    if (!reportId) {
      try {
        const raw = sessionStorage.getItem(PENDING_KEY);
        if (raw) {
          const pending = JSON.parse(raw) as { reportId?: string; token?: string };
          reportId = pending.reportId ?? "";
          token = pending.token ?? token;
        }
      } catch {
        // ignore
      }
    }

    if (!reportId) return;

    let cancelled = false;

    async function poll() {
      const query = new URLSearchParams({ reportId });
      if (token) query.set("token", token);

      try {
        const res = await fetch(`/api/payments/human-premium/status?${query.toString()}`);
        const data = (await res.json()) as StatusPayload & { error?: string };
        if (!res.ok) throw new Error(data.error ?? "Status check failed");
        if (!cancelled) setStatus(data);
        if (!cancelled && !data.ready) {
          window.setTimeout(() => void poll(), 4000);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Status check failed");
        }
      }
    }

    void poll();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  if (status?.ready && status.webUrl) {
    return (
      <div className="pastel-card mx-auto max-w-lg p-8 text-center">
        <p className="text-lg font-semibold text-ink">
          {isKo ? "리포트가 준비되었습니다." : "Your report is ready."}
        </p>
        <p className="mt-2 text-sm text-plum/80">
          {status.emailStatus === "sent"
            ? isKo
              ? "이메일로도 링크를 보냈습니다."
              : "We also emailed you the link."
            : isKo
              ? "아래에서 바로 열어보세요."
              : "Open it below."}
        </p>
        <a
          href={status.webUrl}
          className="mt-6 inline-block rounded-full bg-channel-saju px-6 py-3 font-bold text-white"
        >
          {isKo ? "리포트 열기" : "Open report"}
        </a>
        <Link
          href="/premium/human"
          className="mt-4 block text-sm font-semibold text-plum underline underline-offset-4"
        >
          {isKo ? "돌아가기" : "Back to shop"}
        </Link>
      </div>
    );
  }

  return (
    <div className="pastel-card mx-auto max-w-lg p-8 text-center">
      <p className="text-lg font-semibold text-ink">
        {isKo ? "결제가 접수되었습니다." : "Payment received."}
      </p>
      <p className="mt-2 text-sm text-plum/80">
        {status?.paymentProvider === "paypal"
          ? isKo
            ? "PayPal 결제 확인 후 리포트를 생성합니다. 완료되면 이메일로 링크를 보내드립니다."
            : "After PayPal confirms payment, we generate your report and email the link."
          : isKo
            ? "리포트가 준비되면 이메일로 링크를 보내드립니다."
            : "We will email you when the report is ready."}
      </p>
      {status ? (
        <p className="mt-4 text-xs text-plum/60">
          {isKo ? "상태" : "Status"}: {status.status}
        </p>
      ) : null}
      {error ? (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : (
        <p className="mt-4 text-sm text-plum/70">
          {isKo ? "리포트 생성 중…" : "Generating report…"}
        </p>
      )}
      <Link
        href="/premium/human"
        className="mt-6 inline-block rounded-full bg-channel-saju px-6 py-3 font-bold text-white"
      >
        {isKo ? "돌아가기" : "Back to shop"}
      </Link>
    </div>
  );
}
