import { LegalPolicyDocument } from "@/components/legal/LegalPolicyDocument";
import { getTermsOfServiceContent } from "@/lib/legal/terms-of-service-content";
import type { Metadata } from "next";

interface TermsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: TermsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale !== "en";
  return {
    title: isKo ? "이용약관" : "Terms of Service",
    description: isKo
      ? `K-Saju Pet 이용약관 — ${isKo ? "펫스토롤로지" : "Petstrology"}`
      : "K-Saju Pet Terms of Service — Petstrology",
  };
}

export default async function TermsPage({ params }: TermsPageProps) {
  const { locale } = await params;
  const content = getTermsOfServiceContent(locale);

  return (
    <div className="min-h-screen night-sky-page px-4 py-10">
      <LegalPolicyDocument content={content} locale={locale} />
    </div>
  );
}
