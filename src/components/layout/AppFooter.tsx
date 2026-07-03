import { FooterNavLinks } from "@/components/layout/FooterNavLinks";
import { Link } from "@/i18n/navigation";
import { LEGAL_ENTITY } from "@/lib/legal/company";
import { getServerPaymentHistoryFlag } from "@/lib/reports/human-premium/payment-history";
import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";

export async function AppFooter() {
  const locale = await getLocale();
  const isKo = locale === "ko";
  const nav = await getTranslations("nav");
  const auth = await getTranslations("auth");
  const year = new Date().getFullYear();
  const hasServerPayments = await getServerPaymentHistoryFlag();

  return (
    <footer className="relative z-10 w-full border-t border-white/10 bg-night-sky py-12 md:py-14">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-5 px-5 text-center md:px-10">
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative h-11 w-11 overflow-hidden rounded-full border border-white/25 bg-white/10 shadow-[0_0_24px_rgba(245,217,255,0.15)]">
            <Image
              src="/stitch/asset-09.jpg"
              alt="K-Saju Pet"
              fill
              className="object-contain"
              sizes="44px"
            />
          </div>
          <span className="text-base font-bold text-white transition-colors group-hover:text-[#ffd7ff]">
            K-Saju Pet
          </span>
        </Link>

        <p className="text-xs text-white/50">© {year} K-Saju Pet. All rights reserved.</p>

        <FooterNavLinks
          aboutLabel={nav("about")}
          termsLabel={auth("terms")}
          privacyLabel={auth("privacy")}
          supportLabel={nav("support")}
          paymentsLabel={nav("paymentHistory")}
          hasServerPayments={hasServerPayments}
        />

        <div className="mt-2 max-w-3xl space-y-1.5 text-[11px] leading-relaxed text-white/40 md:text-xs">
          <p>
            {isKo ? "상호명" : "Business"}: 펫스토롤로지(petstrology) | {isKo ? "대표" : "CEO"}: 이경미
            | {isKo ? "사업자등록번호" : "BRN"}: {LEGAL_ENTITY.businessNumber}
          </p>
          <p>
            {isKo ? "주소" : "Address"}: {LEGAL_ENTITY.addressKo} | {isKo ? "전화" : "Tel"}:{" "}
            {LEGAL_ENTITY.phone} | {isKo ? "이메일" : "Email"}:{" "}
            <a
              href={`mailto:${LEGAL_ENTITY.email}`}
              className="text-white/55 underline decoration-white/20 hover:text-[#ffd7ff]"
            >
              {LEGAL_ENTITY.email}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
