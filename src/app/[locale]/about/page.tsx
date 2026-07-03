import { AppTopNav } from "@/components/layout/AppTopNav";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { GlassCard, PageContainer } from "@/components/layout/StitchLayout";
import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });

  const productBullets = [
    t("bulletDailyFortune"),
    t("bulletPersonality"),
    t("bulletPremium"),
    t("bulletCommunity"),
  ];

  const screenshots = [
    { src: "/about/daily-fortune.png", caption: t("screenshot1Caption") },
    { src: "/about/premium-report.png", caption: t("screenshot2Caption") },
    { src: "/about/report-catalog.png", caption: t("screenshot3Caption") },
  ] as const;

  return (
    <div className="min-h-screen bg-transparent">
      <AppTopNav />
      <PageContainer className="max-w-5xl">
        <GlassCard variant="solid" className="space-y-10">
          <section className="space-y-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-primary md:text-3xl">
              {t("aboutUsTitle")}
            </h1>
            <p className="text-sm leading-7 text-plum/80 md:text-base">{t("aboutUsBody")}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-extrabold text-primary md:text-2xl">{t("productTitle")}</h2>
            <p className="text-sm leading-7 text-plum/80 md:text-base">{t("productIntro")}</p>
            <ul className="list-disc space-y-3 pl-5 text-sm leading-7 text-plum/80 md:text-base">
              {productBullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="text-sm leading-7 text-plum/70 md:text-base">{t("paymentsNote")}</p>
          </section>

          <section className="space-y-4 border-t border-plum/10 pt-8">
            <h2 className="text-xl font-extrabold text-primary md:text-2xl">{t("screenshotsTitle")}</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {screenshots.map((shot) => (
                <figure key={shot.src} className="space-y-2">
                  <div className="overflow-hidden rounded-xl border border-white/15 bg-white/5 shadow-sm">
                    <Image
                      src={shot.src}
                      alt={shot.caption}
                      width={800}
                      height={600}
                      className="h-auto w-full object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <figcaption className="text-center text-xs font-semibold text-plum/70 md:text-sm">
                    {shot.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>

          <section className="space-y-3 border-t border-plum/10 pt-8">
            <h2 className="text-xl font-extrabold text-primary md:text-2xl">{t("contactTitle")}</h2>
            <div className="space-y-1.5 text-sm leading-7 text-plum/75 md:text-base">
              <p>{t("contactLine1")}</p>
              <p>{t("contactLine2")}</p>
              <p>{t("contactLine3")}</p>
              <p>{t("contactLine4")}</p>
            </div>
          </section>
        </GlassCard>
      </PageContainer>
      <MobileBottomNav />
    </div>
  );
}
