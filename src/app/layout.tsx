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
  title: "K-Saju Pet",
  description: "반려동물 K-사주와 커뮤니티",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f8e8ff",
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
