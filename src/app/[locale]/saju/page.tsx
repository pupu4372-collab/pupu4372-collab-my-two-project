import { ChannelShell } from "@/components/layout/ChannelShell";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function SajuHubPage() {
  const t = await getTranslations("saju");

  return (
    <ChannelShell
      theme="saju"
      title={t("hubTitle")}
      subtitle={t("hubSubtitle")}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/"
          className="rounded-2xl bg-channel-saju/20 px-5 py-4 font-medium text-channel-saju transition hover:bg-channel-saju/30"
        >
          {t("basic")}
        </Link>
        <Link
          href="/saju/zodiac"
          className="rounded-2xl border border-channel-saju/30 px-5 py-4 text-plum transition hover:bg-channel-saju/10"
        >
          {t("zodiac")}
        </Link>
        <Link
          href="/saju/compatibility"
          className="rounded-2xl border border-channel-saju/30 px-5 py-4 text-plum transition hover:bg-channel-saju/10"
        >
          {t("compatibility")}
        </Link>
        <Link
          href="/saju/premium"
          className="rounded-2xl border border-channel-saju/30 px-5 py-4 text-plum transition hover:bg-channel-saju/10"
        >
          {t("premium")}
        </Link>
      </div>
    </ChannelShell>
  );
}
