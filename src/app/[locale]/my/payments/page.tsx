import { ChannelShell } from "@/components/layout/ChannelShell";
import { PaymentHistoryClient } from "@/components/payments/PaymentHistoryClient";
import type { Metadata } from "next";

interface MyPaymentsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: MyPaymentsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale !== "en";
  return {
    title: isKo ? "내 결제 내역" : "My payment history",
  };
}

export default async function MyPaymentsPage({ params }: MyPaymentsPageProps) {
  const { locale } = await params;
  const isKo = locale !== "en";

  return (
    <ChannelShell
      theme="saju"
      title={isKo ? "결제 내역" : "Payment history"}
      hideThemeLabel
      hideHero
    >
      <PaymentHistoryClient />
    </ChannelShell>
  );
}
