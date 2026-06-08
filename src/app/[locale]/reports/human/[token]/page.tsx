import { HumanPremiumReportView } from "@/components/reports/HumanPremiumReportView";
import { Link } from "@/i18n/navigation";
import { resolveHumanPremiumReportByToken } from "@/lib/reports/human-premium/resolve";
import { resolveAppBaseUrlFromHeaders } from "@/lib/app-url";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

interface HumanPremiumReportRouteProps {
  params: Promise<{ locale: string; token: string }>;
}

export default async function HumanPremiumReportRoute({
  params,
}: HumanPremiumReportRouteProps) {
  const { locale, token } = await params;

  let resolved: Awaited<ReturnType<typeof resolveHumanPremiumReportByToken>> = null;
  try {
    resolved = await resolveHumanPremiumReportByToken(token);
  } catch {
    return (
      <main className="safe-area-shell mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-plum">
          {locale === "en" ? "Report generation failed" : "리포트 생성에 실패했습니다"}
        </h1>
        <p className="mt-3 text-sm text-plum/70">
          {locale === "en"
            ? "Please try again later or contact support."
            : "잠시 후 다시 시도하거나 고객 지원에 문의해 주세요."}
        </p>
        <Link href="/saju/premium" className="mt-6 inline-block text-channel-saju underline">
          {locale === "en" ? "Back to Premium" : "Premium으로 돌아가기"}
        </Link>
      </main>
    );
  }

  if (!resolved) notFound();

  const baseUrl = resolveAppBaseUrlFromHeaders(await headers());
  const shareUrl = `${baseUrl}/${locale}/reports/human/${token}`;
  const emailUrl = `${baseUrl}/api/premium/human/email`;
  const pdfUrl = `${baseUrl}/api/premium/human/pdf`;

  return (
    <HumanPremiumReportView
      report={resolved.payload}
      shareUrl={shareUrl}
      emailUrl={emailUrl}
      pdfUrl={pdfUrl}
    />
  );
}
