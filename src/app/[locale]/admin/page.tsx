import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { ChannelShell } from "@/components/layout/ChannelShell";

export default function AdminPage() {
  return (
    <ChannelShell
      theme="neutral"
      title="관리자 대시보드"
      subtitle="펫·게시글·사주·결제 통계 (MVP)"
    >
      <AdminDashboard />
    </ChannelShell>
  );
}
