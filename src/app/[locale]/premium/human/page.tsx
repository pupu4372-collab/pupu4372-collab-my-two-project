import { HumanPremiumShop } from "@/components/human-premium/HumanPremiumShop";
import { ChannelShell } from "@/components/layout/ChannelShell";
import { Link } from "@/i18n/navigation";
import Script from "next/script";
import { getTranslations } from "next-intl/server";

export default async function HumanPremiumPage() {
  const t = await getTranslations("saju");

  return (
    <>
      <Script src="https://cdn.portone.io/v2/browser-sdk.js" strategy="lazyOnload" />
      <ChannelShell
        theme="saju"
        title="Human Premium"
        subtitle="K-Saju Pet · 사람 사주 프리미엄"
        hideThemeLabel
      >
        <HumanPremiumShop />
        <p className="mt-8 text-center text-sm">
          <Link
            href="/saju"
            className="font-semibold text-white/88 underline underline-offset-4 transition hover:text-white"
          >
            {t("backHub")}
          </Link>
        </p>
      </ChannelShell>
    </>
  );
}
