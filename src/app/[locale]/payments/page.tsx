import { ChannelShell } from "@/components/layout/ChannelShell";
import { PaymentHistoryClient } from "@/components/payments/PaymentHistoryClient";
import type { Metadata } from "next";

interface PaymentsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PaymentsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale !== "en";
  return {
    title: isKo ? "결제 내역" : "Payment history",
  };
}

export default async function PaymentsPage({ params }: PaymentsPageProps) {
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
