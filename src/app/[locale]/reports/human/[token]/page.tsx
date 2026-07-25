import { HumanPremiumReportView } from "@/components/reports/HumanPremiumReportView";
import { Link } from "@/i18n/navigation";
import { scheduleHumanPremiumPdfPrewarm } from "@/lib/reports/human-premium/pdf-cache";
import {
  HumanPremiumTokenResolveError,
  resolveHumanPremiumReportByToken,
} from "@/lib/reports/human-premium/resolve";
import { after } from "next/server";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

interface HumanPremiumReportRouteProps {
  params: Promise<{ locale: string; token: string }>;
}

function maskToken(token: string): string {
  if (token.length <= 8) return `${token.slice(0, 2)}…`;
  return `${token.slice(0, 8)}…`;
}

function resolveFailureKind(
  error: unknown
): "load" | "generate" {
  if (error instanceof HumanPremiumTokenResolveError) return error.kind;
  const message = error instanceof Error ? error.message : String(error);
  if (
    message === "Supabase is not configured." ||
    /supabase|fetch|network|jwt|permission|rls|pgrst|failed to update|not configured/i.test(
      message
    )
  ) {
    return "load";
  }
  return "generate";
}

export default async function HumanPremiumReportRoute({
  params,
}: HumanPremiumReportRouteProps) {
  const { locale, token } = await params;
  const t = await getTranslations({ locale, namespace: "humanPremiumReport" });

  let resolved: Awaited<ReturnType<typeof resolveHumanPremiumReportByToken>> = null;
  try {
    resolved = await resolveHumanPremiumReportByToken(token);
  } catch (error) {
    const kind = resolveFailureKind(error);
    const message = error instanceof Error ? error.message : String(error);
    const stage =
      error instanceof HumanPremiumTokenResolveError ? error.stage : "unknown";
    console.error("[human-premium-token]", {
      token: maskToken(token),
      stage,
      kind,
      message,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return (
      <main className="safe-area-shell mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-plum">
          {kind === "load" ? t("loadFailed") : t("generateFailed")}
        </h1>
        <p className="mt-3 text-sm text-plum/70">{t("failureHint")}</p>
        <Link href="/premium/human" className="mt-6 inline-block text-channel-saju underline">
          {t("backToPremium")}
        </Link>
      </main>
    );
  }

  if (!resolved) notFound();

  after(() => {
    scheduleHumanPremiumPdfPrewarm(resolved!.row, resolved!.payload);
  });

  return (
    <HumanPremiumReportView
      report={resolved.payload}
      webToken={token}
      backHref="/premium/human/vault"
    />
  );
}
