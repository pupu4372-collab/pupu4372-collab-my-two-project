import { HumanPremiumShop } from "@/components/human-premium/HumanPremiumShop";
import { ChannelShell } from "@/components/layout/ChannelShell";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

export default async function HumanPremiumPage() {
  const t = await getTranslations("saju");

  return (
    <ChannelShell
      theme="saju"
      title={t("premiumTitle")}
      subtitle={t("premiumSubtitle")}
      hideThemeLabel
      narrowHero
    >
      <Suspense fallback={<div className="mx-auto max-w-md rounded-[2rem] bg-white/90 p-8 text-center text-sm text-plum/70">Loading…</div>}>
        <HumanPremiumShop />
      </Suspense>
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
