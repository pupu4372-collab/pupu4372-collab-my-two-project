import { ProfilePage } from "@/components/profile/ProfilePage";
import { ChannelShell } from "@/components/layout/ChannelShell";

interface ProfileRoutePageProps {
  params: Promise<{ locale: string }>;
}

export default async function ProfileRoutePage({ params }: ProfileRoutePageProps) {
  const { locale } = await params;
  const isKo = locale !== "en";

  return (
    <ChannelShell
      theme="neutral"
      title={isKo ? "프로필" : "Profile"}
      subtitle={
        isKo
          ? "내 정보와 펫 프로필을 한곳에서 확인하세요."
          : "View your account and pet profiles in one place."
      }
      backLabel={isKo ? "← 홈" : "← Home"}
      rightLinks={[
        { href: "/", label: isKo ? "홈" : "Home" },
        { href: "/community", label: isKo ? "커뮤니티" : "Community" },
        { href: "/saju", label: isKo ? "펫 사주" : "Pet Saju" },
      ]}
    >
      <ProfilePage />
    </ChannelShell>
  );
}
