import { AdminPaymentsClient } from "@/components/admin/AdminPaymentsClient";
import { AppTopNav } from "@/components/layout/AppTopNav";
import { PageContainer } from "@/components/layout/StitchLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin payments",
  robots: { index: false, follow: false },
};

export default function AdminPaymentsPage() {
  return (
    <div className="min-h-screen night-sky-page">
      <AppTopNav active="profile" />
      <PageContainer className="max-w-3xl py-8">
        <AdminPaymentsClient />
      </PageContainer>
    </div>
  );
}
