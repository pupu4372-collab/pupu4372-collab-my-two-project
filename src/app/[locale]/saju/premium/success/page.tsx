"use client";

import { PremiumReportView } from "@/components/k-saju/PremiumReportView";
import { ChannelShell } from "@/components/layout/ChannelShell";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { Link } from "@/i18n/navigation";
import type { PremiumReport } from "@/lib/saju/premium-report";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function SuccessInner() {
  const t = useTranslations("saju");
  const params = useSearchParams();
  const token = params.get("token");
  const { accessToken, ready } = useSupabaseSession();
  const [report, setReport] = useState<PremiumReport | null>(null);
  const [petName, setPetName] = useState("");
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
    setPetName(String(pending.petName ?? ""));

    async function capture() {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

        const res = await fetch("/api/paypal/capture-order", {
          method: "POST",
          headers,
          body: JSON.stringify({ ...pending, orderId: token }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setReport(data.report);
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
      {report && <PremiumReportView report={report} petName={petName} />}
      <p className="mt-8 text-center">
        <Link href="/profile" className="underline">
          {t("profileSaved")}
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
