import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const noto = Noto_Sans_KR({
  variable: "--font-noto",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "K-Saju Pet | 반려동물 K-사주",
  description:
    "반려동물의 별자리와 운명 — 글로벌 펫 커뮤니티와 K-사주를 만나보세요.",
  openGraph: {
    title: "K-Saju Pet",
    description: "Discover your pet's elemental vibe with K-Saju storytelling.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${noto.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
