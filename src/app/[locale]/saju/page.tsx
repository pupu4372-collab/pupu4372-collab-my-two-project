import { ChannelShell } from "@/components/layout/ChannelShell";
import { SajuForm } from "@/components/k-saju/SajuForm";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function SajuHubPage() {
  const t = await getTranslations("saju");

  return (
    <ChannelShell theme="saju" title={t("hubTitle")} subtitle={t("hubSubtitle")}>
      <section className="mb-6 overflow-hidden rounded-[2rem] bg-primary p-6 text-cream shadow-xl md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-cream/70">
              Premium
            </p>
            <h2 className="mt-2 text-2xl font-extrabold">{t("premiumTitle")}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-cream/80">
              {t("premiumSubtitle")}
            </p>
          </div>
          <Link
            href="/saju/premium"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-cream px-6 py-3 text-sm font-bold text-primary transition hover:bg-white"
          >
            {t("premium")}
          </Link>
        </div>
      </section>
      <SajuForm />
    </ChannelShell>
  );
}
