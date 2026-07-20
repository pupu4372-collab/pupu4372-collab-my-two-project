import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { NIGHT_SKY_BASE } from "@/lib/theme/night-sky";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ksajupet.com"),
  // Icons: App Router file convention (app/favicon.ico, app/icon.png, app/apple-icon.png)
  manifest: "/site.webmanifest",
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
  verification: {
    google: "0LhfXoi9YGFBX-1xvYkYFZh1gd1K2X7RXEhdEp8uLf4",
    other: {
      "naver-site-verification": "2188bc0307dfa5a7f22f3f8d3039a5354661c805",
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: NIGHT_SKY_BASE,
};

/** Root shell only — `<html lang>` lives in `[locale]/layout` (and auth layout). */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Script id="pwa-capture" strategy="beforeInteractive">
        {`window.addEventListener('beforeinstallprompt',function(e){
    e.preventDefault();
    window.__deferredInstallPrompt=e;
    window.dispatchEvent(new Event('pwa-installable'));
  });`}
      </Script>
      {children}
      <ServiceWorkerRegister />
    </>
  );
}
