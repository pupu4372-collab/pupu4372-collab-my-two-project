import { LegalPolicyDocument } from "@/components/legal/LegalPolicyDocument";
import { getPrivacyPolicyContent } from "@/lib/legal/privacy-policy-content";
import type { Metadata } from "next";

interface PrivacyPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PrivacyPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale !== "en";
  return {
    title: isKo ? "개인정보 처리방침" : "Privacy Policy",
    description: isKo
      ? "K-Saju Pet 개인정보 처리방침 — 펫스토롤로지"
      : "K-Saju Pet Privacy Policy — Petstrology",
  };
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;
  const content = getPrivacyPolicyContent(locale);

  return (
    <div className="min-h-screen bg-dream-sky px-4 py-10">
      <LegalPolicyDocument content={content} locale={locale} />
    </div>
  );
}
