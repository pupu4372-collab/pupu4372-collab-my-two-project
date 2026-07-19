import { AdminNoticesManager } from "@/components/admin/AdminNoticesManager";
import { AppTopNav } from "@/components/layout/AppTopNav";
import { PageContainer } from "@/components/layout/StitchLayout";
import { Link } from "@/i18n/navigation";

export default function AdminNoticesPage() {
  return (
    <div className="min-h-screen night-sky-page">
      <AppTopNav active="profile" />
      <PageContainer className="max-w-4xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#ffd7ff]">Admin</p>
            <h1 className="text-2xl font-extrabold text-white md:text-3xl">공지사항 관리</h1>
          </div>
          <Link
            href="/admin"
            className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/20"
          >
            ← 대시보드
          </Link>
        </div>
        <AdminNoticesManager />
      </PageContainer>
    </div>
  );
}
