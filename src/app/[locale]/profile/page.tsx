import { AppTopNav } from "@/components/layout/AppTopNav";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { PageContainer } from "@/components/layout/StitchLayout";
import { ProfilePage } from "@/components/profile/ProfilePage";

interface ProfileRoutePageProps {
  params: Promise<{ locale: string }>;
}

export default async function ProfileRoutePage({ params }: ProfileRoutePageProps) {
  await params;

  return (
    <div className="min-h-screen night-sky-page">
      <AppTopNav active="profile" />
      <PageContainer className="max-w-6xl pb-32">
        <ProfilePage />
      </PageContainer>
      <MobileBottomNav active="profile" />
    </div>
  );
}
