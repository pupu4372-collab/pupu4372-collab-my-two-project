import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AppTopNav } from "@/components/layout/AppTopNav";
import { PageContainer } from "@/components/layout/StitchLayout";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-dream-sky">
      <AppTopNav active="profile" />
      <PageContainer className="max-w-6xl">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-channel-saju">Admin</p>
        <h1 className="mb-8 text-2xl font-extrabold text-primary md:text-3xl">K-Saju Pet 관리자</h1>
        <AdminDashboard />
      </PageContainer>
    </div>
  );
}
