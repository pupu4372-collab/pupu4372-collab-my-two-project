import { AuthRequiredLink } from "@/components/auth/AuthRequiredLink";
import { PetShowFeed } from "@/components/community/PetShowFeed";
import { PetShowShell } from "@/components/community/PetShowShell";
import { PetShowTopFiveStrip } from "@/components/community/PetShowTopFiveStrip";
import { SectionHeader } from "@/components/layout/StitchLayout";
import { Link } from "@/i18n/navigation";
import { fetchWeeklyPetShowSpeciesRankings } from "@/lib/community/ranking";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function PetShowSnapzonePage({ params }: PageProps) {
  const { locale } = await params;
  const isKo = locale !== "en";
  const weeklyRanking = await fetchWeeklyPetShowSpeciesRankings();
  const rankingRows = [
    ...weeklyRanking.rows.dog,
    ...weeklyRanking.rows.cat,
    ...weeklyRanking.rows.other,
  ];

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
      <div className="space-y-10">
        <section>
          <SectionHeader
            eyebrow={isKo ? "Weekly Ranking" : "Weekly Ranking"}
            title={isKo ? "이번 주의 인기 펫 Top 5" : "This week's popular pets"}
            subtitle={isKo ? "가장 많은 사랑을 받은 사진을 가로로 넘겨보세요." : "Swipe through the photos that received the most love."}
            onDark
            action={
              <div className="flex flex-wrap gap-2">
                <AuthRequiredLink
                  href="/community/pet-show/upload"
                  className="inline-flex rounded-full bg-channel-community px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:scale-105 hover:brightness-105"
                >
                  {isKo ? "나도 자랑하기" : "Post my pet"}
                </AuthRequiredLink>
                <Link
                  href="/community/pet-show/fails"
                  className="inline-flex rounded-full bg-[#ffd7ff] px-5 py-3 text-sm font-extrabold text-primary shadow-sm transition hover:scale-105 hover:brightness-105"
                >
                  {isKo ? "웃긴 실패 사진" : "Funny fails"}
                </Link>
              </div>
            }
          />
          <PetShowTopFiveStrip
            rows={rankingRows}
            isKo={isKo}
            emptyText={isKo ? "이번 주 첫 사진을 기다리고 있어요." : "Waiting for the first photo this week."}
          />
        </section>

        <PetShowFeed />
      </div>
    </PetShowShell>
  );
}
