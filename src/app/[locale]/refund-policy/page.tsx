import { Link } from "@/i18n/navigation";
import { LEGAL_ENTITY } from "@/lib/legal/company";
import type { Metadata } from "next";

interface RefundPolicyPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: RefundPolicyPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale !== "en";
  return {
    title: isKo ? "환불 정책" : "Refund Policy",
    description: isKo
      ? "K-Saju Pet 디지털 콘텐츠 환불 정책 안내"
      : "K-Saju Pet digital content refund policy",
  };
}

export default async function RefundPolicyPage({ params }: RefundPolicyPageProps) {
  const { locale } = await params;
  const isKo = locale !== "en";

  return (
    <div className="min-h-screen night-sky-page px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-white md:text-3xl">
            {isKo ? "환불 정책" : "Refund Policy"}
          </h1>
          <p className="text-sm text-white/75">
            {isKo
              ? "이용약관 제7조(환불 정책)에 따른 안내입니다."
              : "This page follows Article 7 (Refund Policy) of the Terms of Service."}
          </p>
        </header>

        <section className="pastel-card space-y-4 p-5 md:p-6">
          <h2 className="text-lg font-semibold text-ink">
            {isKo ? "디지털 콘텐츠 특성" : "Nature of digital content"}
          </h2>
          <p className="text-sm leading-relaxed text-plum/85">
            {isKo
              ? "디지털 콘텐츠 특성상, 결제 후 리포트가 정상적으로 생성·열람된 경우에는 단순 변심에 의한 환불이 제한될 수 있습니다."
              : "Due to the nature of digital content, refunds for change of mind may be limited once a report has been successfully generated and viewed after payment."}
          </p>
        </section>

        <section className="pastel-card space-y-4 p-5 md:p-6">
          <h2 className="text-lg font-semibold text-ink">
            {isKo ? "환불 가능 조건" : "Cases eligible for a full refund"}
          </h2>
          <p className="text-sm text-plum/85">
            {isKo ? "다음의 경우 전액 환불됩니다." : "A full refund is provided in the following cases."}
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-plum/85">
            {isKo ? (
              <>
                <li>회사의 시스템 장애로 리포트가 생성되지 않은 경우</li>
                <li>결제 후 리포트를 한 번도 열람하지 않은 상태에서 7일 이내 환불을 요청한 경우</li>
                <li>중복 결제 등 명백한 결제 오류가 발생한 경우</li>
              </>
            ) : (
              <>
                <li>The report was not generated due to a system failure of the Company</li>
                <li>
                  A refund is requested within 7 days of payment without the report ever having been
                  viewed
                </li>
                <li>A clear payment error occurred, such as a duplicate charge</li>
              </>
            )}
          </ul>
        </section>

        <section className="pastel-card space-y-4 p-5 md:p-6">
          <h2 className="text-lg font-semibold text-ink">
            {isKo ? "환불 요청 절차" : "How to request a refund"}
          </h2>
          <p className="text-sm leading-relaxed text-plum/85">
            {isKo ? (
              <>
                환불 요청은{" "}
                <Link href="/support" className="font-medium text-ink underline hover:text-plum">
                  1:1 문의
                </Link>
                또는 이메일(
                <a
                  href={`mailto:${LEGAL_ENTITY.email}`}
                  className="font-medium text-ink underline hover:text-plum"
                >
                  {LEGAL_ENTITY.email}
                </a>
                )을 통해 접수합니다.
              </>
            ) : (
              <>
                Refund requests are accepted via{" "}
                <Link href="/support" className="font-medium text-ink underline hover:text-plum">
                  1:1 inquiry
                </Link>{" "}
                or email (
                <a
                  href={`mailto:${LEGAL_ENTITY.email}`}
                  className="font-medium text-ink underline hover:text-plum"
                >
                  {LEGAL_ENTITY.email}
                </a>
                ).
              </>
            )}
          </p>
        </section>

        <section className="pastel-card space-y-4 p-5 md:p-6">
          <h2 className="text-lg font-semibold text-ink">
            {isKo ? "처리 기한" : "Processing time"}
          </h2>
          <p className="text-sm leading-relaxed text-plum/85">
            {isKo
              ? "환불 처리는 결제 취소를 통해 원래 결제 수단으로 환원되며, 카드사 정책에 따라 영업일 기준 3~7일이 소요될 수 있습니다."
              : "Refunds are processed by canceling the payment and returning funds to the original payment method. Depending on card issuer policy, this may take 3–7 business days."}
          </p>
        </section>

        <section className="pastel-card space-y-3 p-5 text-sm text-plum md:p-6">
          <h2 className="text-base font-semibold text-ink">
            {isKo ? "문의 연락처" : "Contact"}
          </h2>
          <p>
            {isKo ? "이메일" : "Email"}:{" "}
            <a
              href={`mailto:${LEGAL_ENTITY.email}`}
              className="font-medium text-ink underline hover:text-plum"
            >
              {LEGAL_ENTITY.email}
            </a>
          </p>
          <p>
            {isKo ? "전화" : "Tel"}: {LEGAL_ENTITY.phone}
          </p>
          <p className="pt-2">
            {isKo ? (
              <>
                전체 약관은{" "}
                <Link href="/terms" className="font-medium text-ink underline hover:text-plum">
                  이용약관
                </Link>
                에서 확인할 수 있습니다.
              </>
            ) : (
              <>
                See the full{" "}
                <Link href="/terms" className="font-medium text-ink underline hover:text-plum">
                  Terms of Service
                </Link>{" "}
                for complete terms.
              </>
            )}
          </p>
        </section>
      </div>
    </div>
  );
}
