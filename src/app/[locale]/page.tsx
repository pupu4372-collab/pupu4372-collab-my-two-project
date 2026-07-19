import { HomeGateway } from "@/components/home/HomeGateway";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  const canonical = getPathname({ locale: locale as "ko" | "en", href: "/" });
  const languages: Record<string, string> = {
    ko: getPathname({ locale: "ko", href: "/" }),
    en: getPathname({ locale: "en", href: "/" }),
    "x-default": getPathname({ locale: routing.defaultLocale, href: "/" }),
  };

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
      locale: locale === "en" ? "en_US" : "ko_KR",
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HomeGateway previewTheme="night" />;
}
