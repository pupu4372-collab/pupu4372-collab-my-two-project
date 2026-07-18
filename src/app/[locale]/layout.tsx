import { AppFooter } from "@/components/layout/AppFooter";
import { CapacitorShell } from "@/components/mobile/CapacitorShell";
import { NightSkyBackground } from "@/components/layout/NightSkyBackground";
import { routing } from "@/i18n/routing";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Noto_Sans_KR } from "next/font/google";
import Script from "next/script";

const noto = Noto_Sans_KR({
  variable: "--font-noto",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
      locale: locale === "en" ? "en_US" : "ko_KR",
    },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7486656033876734"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${noto.variable} safe-area-shell font-sans antialiased`}>
        <CapacitorShell />
        <NightSkyBackground>
          <NextIntlClientProvider messages={messages}>
            {children}
            <AppFooter />
          </NextIntlClientProvider>
        </NightSkyBackground>
      </body>
    </html>
  );
}
