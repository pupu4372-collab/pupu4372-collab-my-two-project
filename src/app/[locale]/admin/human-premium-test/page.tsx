import { HumanPremiumAdminTest } from "@/components/admin/HumanPremiumAdminTest";
import { AppTopNav } from "@/components/layout/AppTopNav";
import { PageContainer } from "@/components/layout/StitchLayout";

export default function HumanPremiumAdminTestPage() {
  return (
    <div className="min-h-screen night-sky-page">
      <AppTopNav active="profile" />
      <PageContainer className="max-w-4xl">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#ffd7ff]">
          Admin
        </p>
        <h1 className="mb-8 text-2xl font-extrabold text-white md:text-3xl">
          인간용 Premium 테스트 / A/S
        </h1>
        <HumanPremiumAdminTest />
      </PageContainer>
    </div>
  );
}
