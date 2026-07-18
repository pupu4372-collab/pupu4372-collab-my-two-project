import { Noto_Sans_KR } from "next/font/google";
import type { ReactNode } from "react";

const noto = Noto_Sans_KR({
  variable: "--font-noto",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/** Auth routes sit outside `[locale]`; provide html/body for the root passthrough layout. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${noto.variable} safe-area-shell font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
