"use client";

import { ChannelShell } from "@/components/layout/ChannelShell";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function SuccessInner() {
  const t = useTranslations("saju");
  const locale = useLocale();
  const isKo = locale !== "en";
  const params = useSearchParams();
  const token = params.get("token");
  const { accessToken, ready } = useSupabaseSession();
  const [webUrl, setWebUrl] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready || !token) {
      setLoading(false);
      if (!token) setError("Missing PayPal token.");
      return;
    }

    const raw = sessionStorage.getItem("premium_pending");
    if (!raw) {
      setError("Session expired. Please try checkout again.");
      setLoading(false);
      return;
    }

    const pending = JSON.parse(raw) as Record<string, unknown>;

    async function capture() {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

        const res = await fetch("/api/paypal/capture-order", {
          method: "POST",
          headers,
          body: JSON.stringify({
            orderId: token,
            reportId: pending.reportId,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setWebUrl(data.webUrl);
        setEmailStatus(data.report?.email_status ?? null);
        setReportId(data.report?.id ?? null);
        sessionStorage.removeItem("premium_pending");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Capture failed");
      } finally {
        setLoading(false);
      }
    }

    void capture();
  }, [ready, token, accessToken]);

  return (
    <ChannelShell theme="saju" title={t("successTitle")} subtitle={t("successSubtitle")}>
      {loading && <p className="text-plum/70">{t("creatingReport")}</p>}
      {error && <p className="text-red-700/80">{error}</p>}
      {webUrl && (
        <div className="pastel-card space-y-4 p-6 text-center">
          <h2 className="text-xl font-extrabold text-plum">
            {t("successTitle")}
          </h2>
          <p className="text-sm text-plum/70">
            {emailStatus === "sent"
              ? isKo
                ? "이메일로 리포트 링크도 발송했습니다."
                : "We also sent the report link to your email."
              : isKo
                ? "웹 리포트가 준비됐습니다."
                : "Your web report is ready."}
          </p>
          <a
            href={webUrl}
            className="inline-flex rounded-full bg-channel-saju px-5 py-3 text-sm font-semibold text-white"
          >
            {isKo ? "웹 리포트 열기" : "Open web report"}
          </a>
          {reportId && (
            <p className="break-all text-xs text-plum/50">ID: {reportId}</p>
          )}
        </div>
      )}
      <p className="mt-8 text-center">
        <Link href="/saju/premium" className="underline">
          {isKo ? "Premium으로 돌아가기" : "Back to Premium"}
        </Link>
      </p>
    </ChannelShell>
  );
}

export default function PremiumSuccessPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center">Loading…</p>}>
      <SuccessInner />
    </Suspense>
  );
}
