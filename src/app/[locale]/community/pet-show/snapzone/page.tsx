import { AuthRequiredLink } from "@/components/auth/AuthRequiredLink";
import { PetShowFeed } from "@/components/community/PetShowFeed";
import { PetShowShell } from "@/components/community/PetShowShell";
import { SectionHeader } from "@/components/layout/StitchLayout";
import { fetchWeeklyPetShowSpeciesRankings } from "@/lib/community/ranking";
import { supabaseImageTransformUrl } from "@/lib/images/supabase-transform";

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
  ]
    .sort((a, b) => (a.rank_position ?? 99) - (b.rank_position ?? 99))
    .slice(0, 5);

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
            action={
              <AuthRequiredLink
                href="/community/pet-show/upload"
                className="inline-flex rounded-full bg-channel-community px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:scale-105 hover:brightness-105"
              >
                {isKo ? "나도 자랑하기" : "Post my pet"}
              </AuthRequiredLink>
            }
          />
          <div className="-mx-5 mt-6 flex snap-x gap-4 overflow-x-auto px-5 pb-5 hide-scrollbar md:mx-0 md:px-0">
            {rankingRows.map((row, index) => (
              <article key={row.id} className={`pastel-card shrink-0 snap-start overflow-hidden ${index === 0 ? "w-[280px] md:w-[400px]" : "w-[240px]"}`}>
                <div className={index === 0 ? "aspect-[1.45] overflow-hidden bg-channel-community/10" : "aspect-square overflow-hidden bg-channel-community/10"}>
                  {row.image_urls?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={supabaseImageTransformUrl(row.image_urls[0], { width: 800, height: 600 })} alt="" className="h-full w-full object-cover transition duration-500 hover:scale-105" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-5xl">🐾</div>
                  )}
                </div>
                <div className="p-4">
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-extrabold text-white">{row.rank_position ?? index + 1}위</span>
                  <h3 className="mt-3 text-lg font-extrabold text-primary">{row.title ?? "Pet Show"}</h3>
                  <p className="mt-1 text-sm text-plum/55">♥ {row.like_count}</p>
                </div>
              </article>
            ))}
            {rankingRows.length === 0 && (
              <div className="pastel-card w-full p-8 text-center text-sm text-plum/60">
                {isKo ? "이번 주 첫 사진을 기다리고 있어요." : "Waiting for the first photo this week."}
              </div>
            )}
          </div>
        </section>

        <PetShowFeed />
      </div>
    </PetShowShell>
  );
}
