import { AppTopNav } from "@/components/layout/AppTopNav";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { PageContainer } from "@/components/layout/StitchLayout";
import { ReportVaultPage } from "@/components/reports/ReportVaultPage";

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-transparent">
      <AppTopNav active="profile" />
      <PageContainer className="max-w-6xl">
        <ReportVaultPage />
      </PageContainer>
      <MobileBottomNav active="profile" />
    </div>
  );
}
