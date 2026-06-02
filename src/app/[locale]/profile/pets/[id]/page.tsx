import { AppTopNav } from "@/components/layout/AppTopNav";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { PageContainer } from "@/components/layout/StitchLayout";
import { PetDetailPage } from "@/components/profile/PetDetailPage";

interface PetDetailRoutePageProps {
  params: Promise<{ id: string }>;
}

export default async function PetDetailRoutePage({ params }: PetDetailRoutePageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-dream-sky">
      <AppTopNav active="profile" />
      <PageContainer className="max-w-6xl">
        <PetDetailPage petId={id} />
      </PageContainer>
      <MobileBottomNav active="profile" />
    </div>
  );
}
