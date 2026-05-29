import { PetShowFeed } from "@/components/community/PetShowFeed";
import { PetShowShell } from "@/components/community/PetShowShell";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function PetShowSnapzonePage({ params }: PageProps) {
  const { locale } = await params;
  const isKo = locale !== "en";

  return (
    <PetShowShell
      theme="community"
      title={isKo ? "우리아이 자랑 스냅존" : "Pet Show Snapzone"}
      subtitle={isKo ? "올라온 사진을 둘러보고 좋아요·댓글을 남겨보세요." : "Browse photos and leave likes and comments."}
      backHref="/community"
      backLabel={isKo ? "← 커뮤니티" : "← Community"}
      rightLinks={[
        { href: "/", label: isKo ? "홈" : "Home" },
        { href: "/community", label: isKo ? "커뮤니티" : "Community" },
      ]}
    >
      <PetShowFeed />
    </PetShowShell>
  );
}
