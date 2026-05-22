import { ZodiacForm } from "@/components/k-saju/ZodiacForm";
import { ChannelShell } from "@/components/layout/ChannelShell";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function ZodiacPage() {
  const t = await getTranslations("saju");

  return (
    <ChannelShell
      theme="saju"
      title={t("zodiacTitle")}
      subtitle={t("zodiacSubtitle")}
    >
      <ZodiacForm />
      <p className="mt-8 text-center text-sm text-plum/60">
        <Link href="/" className="underline hover:text-plum">
          {t("backBasic")}
        </Link>
      </p>
    </ChannelShell>
  );
}
