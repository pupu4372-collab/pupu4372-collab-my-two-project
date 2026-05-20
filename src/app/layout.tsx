import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "K-Saju Pet | Your pet's K-culture destiny",
  description:
    "Global pet community meets K-Saju — playful four-pillars readings for dogs and cats.",
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
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <header className="border-b border-white/60 bg-white/50 backdrop-blur-md">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
            <div>
              <p className="text-xs tracking-[0.2em] text-ink/50 uppercase">K-Saju Pet</p>
              <h1 className="text-lg font-semibold text-ink">Community · Destiny · Love</h1>
            </div>
            <span className="rounded-full bg-sage/40 px-3 py-1 text-xs text-ink/70">MVP</span>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-3xl px-4 py-8 text-center text-xs text-ink/50">
          <a href="/privacy" className="underline hover:text-ink">
            Privacy
          </a>
          {" · "}
          <a href="/terms" className="underline hover:text-ink">
            Terms
          </a>
        </footer>
      </body>
    </html>
  );
}
