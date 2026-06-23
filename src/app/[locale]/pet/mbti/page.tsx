import { PetMbtiChecklist } from "@/components/pet/PetMbtiChecklist";
import { ChannelShell } from "@/components/layout/ChannelShell";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function PetMbtiPage() {
  const t = await getTranslations("saju");

  return (
    <ChannelShell
      theme="dog"
      title="Pet MBTI"
      subtitle="우리 아이 성향 체크리스트"
      hideThemeLabel
    >
      <PetMbtiChecklist />
      <p className="mt-8 text-center text-sm">
        <Link
          href="/saju"
          className="font-semibold text-white/88 underline underline-offset-4 transition hover:text-white"
        >
          {t("backHub")}
        </Link>
      </p>
    </ChannelShell>
  );
}
