import { AppTopNav } from "@/components/layout/AppTopNav";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { PageContainer } from "@/components/layout/StitchLayout";
import { OnboardingRoadmap } from "@/components/onboarding/OnboardingRoadmap";

interface OnboardingPageProps {
  params: Promise<{ locale: string }>;
}

export default async function OnboardingPage({ params }: OnboardingPageProps) {
  const { locale } = await params;

  return (
    <div className="min-h-screen night-sky-page">
      <AppTopNav active="home" />
      <PageContainer>
        <OnboardingRoadmap locale={locale} />
      </PageContainer>
      <MobileBottomNav active="home" />
    </div>
  );
}
