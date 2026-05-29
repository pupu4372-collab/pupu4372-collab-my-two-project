import { PetShowWeeklySpeciesRanking } from "@/components/community/PetShowRanking";
import { PetShowShell } from "@/components/community/PetShowShell";
import { fetchWeeklyPetShowSpeciesRankings } from "@/lib/community/ranking";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function PetShowRankingPage({ params }: PageProps) {
  const { locale } = await params;
  const isKo = locale !== "en";
  const ranking = await fetchWeeklyPetShowSpeciesRankings();

  return (
    <PetShowShell
      theme="community"
      title={isKo ? "우리아이 자랑 주간 랭킹" : "Pet Show Weekly Ranking"}
      subtitle={isKo ? "최근 7일간 좋아요 순위예요." : "Ranked by likes from the last 7 days."}
      backHref="/community"
      backLabel={isKo ? "← 커뮤니티" : "← Community"}
      rightLinks={[
        { href: "/", label: isKo ? "홈" : "Home" },
        { href: "/community", label: isKo ? "커뮤니티" : "Community" },
      ]}
    >
      <PetShowWeeklySpeciesRanking
        dogRows={ranking.rows.dog}
        catRows={ranking.rows.cat}
        otherRows={ranking.rows.other}
        source={ranking.source}
      />
    </PetShowShell>
  );
}
