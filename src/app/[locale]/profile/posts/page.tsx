import { AppTopNav } from "@/components/layout/AppTopNav";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { GlassCard, PageContainer } from "@/components/layout/StitchLayout";
import { MyPostsPage } from "@/components/profile/MyPostsPage";
import { Link } from "@/i18n/navigation";

interface ProfilePostsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ProfilePostsPage({ params }: ProfilePostsPageProps) {
  const { locale } = await params;
  const isKo = locale === "ko";

  return (
    <div className="min-h-screen night-sky-page">
      <AppTopNav active="profile" />
      <PageContainer className="max-w-3xl pb-32">
        <Link href="/profile" className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition hover:opacity-80">
          <span aria-hidden>←</span>
          {isKo ? "프로필로" : "Back to profile"}
        </Link>
        <GlassCard className="mt-5">
          <p className="text-sm font-extrabold text-channel-community">💬 {isKo ? "커뮤니티" : "Community"}</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-primary">{isKo ? "내가 작성한 글" : "My posts"}</h1>
          <p className="mt-3 text-sm leading-relaxed text-plum/70">
            {isKo ? "커뮤니티에 작성한 글을 확인하고 편집할 수 있어요." : "Review and edit posts you wrote in the community."}
          </p>
        </GlassCard>
        <div className="mt-8">
        <MyPostsPage />
        </div>
      </PageContainer>
      <MobileBottomNav active="profile" />
    </div>
  );
}
