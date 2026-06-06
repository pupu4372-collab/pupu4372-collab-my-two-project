import { CompatibilityForm } from "@/components/k-saju/CompatibilityForm";
import { ChannelShell } from "@/components/layout/ChannelShell";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function CompatibilityPage() {
  const t = await getTranslations("saju");

  return (
    <ChannelShell
      theme="saju"
      title={t("compatibilityTitle")}
      subtitle={t("compatibilitySubtitle")}
    >
      <CompatibilityForm />
      <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-plum/60">
        <Link href="/saju/zodiac" className="underline hover:text-plum">
          {t("toZodiac")}
        </Link>
        <Link href="/saju" className="underline hover:text-plum">
          {t("backSaju")}
        </Link>
      </div>
    </ChannelShell>
  );
}
