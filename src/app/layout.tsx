import { NIGHT_SKY_BASE } from "@/lib/theme/night-sky";
import { CapacitorShell } from "@/components/mobile/CapacitorShell";
import { NightSkyBackground } from "@/components/layout/NightSkyBackground";
import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const noto = Noto_Sans_KR({
  variable: "--font-noto",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "K-Saju Pet — 사주로 알아보는 우리 아이 맞춤 케어",
  description: "생일만 입력하면 우리 아이 타고난 성향과 오늘의 맞춤 케어 팁을 알려드려요.",
  // Icons: App Router file convention (app/favicon.ico, app/icon.png, app/apple-icon.png)
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: NIGHT_SKY_BASE,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${noto.variable} safe-area-shell font-sans antialiased`}>
        <CapacitorShell />
        <NightSkyBackground>{children}</NightSkyBackground>
      </body>
    </html>
  );
}
