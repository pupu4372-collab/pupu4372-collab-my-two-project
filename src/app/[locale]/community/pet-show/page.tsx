import { AuthRequiredLink } from "@/components/auth/AuthRequiredLink";
import { COMMUNITY_SOLID_CARD_CLASS, COMMUNITY_SOLID_SURFACE_CLASS } from "@/components/community/CommunityDetailSurface";
import { PetShowFeed } from "@/components/community/PetShowFeed";
import { PetShowShell } from "@/components/community/PetShowShell";
import { PetShowTopFiveStrip } from "@/components/community/PetShowTopFiveStrip";
import { Link } from "@/i18n/navigation";
import { fetchPetShowRanking } from "@/lib/community/ranking";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function PetShowIndexPage({ params }: PageProps) {
  const { locale } = await params;
  const isKo = locale !== "en";
  const ranking = await fetchPetShowRanking("week");
  const rankingRows = ranking.rows.slice(0, 5);

  const categoryCards = [
    {
      emoji: "🐶",
      title: isKo ? "강아지" : "Dogs",
      body: isKo ? "산책, 장난감, 웃는 얼굴을 자랑해 보세요." : "Share walks, toys, and happy faces.",
      href: "/community/pet-show/upload",
      className: "bg-channel-dog/10 border-channel-dog/20",
    },
    {
      emoji: "🐱",
      title: isKo ? "고양이" : "Cats",
      body: isKo ? "햇살, 식빵 자세, 장난스러운 순간을 모아요." : "Collect sun naps, loaf poses, and playful moments.",
      href: "/community/pet-show/upload",
      className: "bg-petal/45 border-channel-cat/20",
    },
    {
      emoji: "🐰",
      title: isKo ? "렙타일(다른동물)" : "Other Animals",
      body: isKo ? "토끼, 햄스터, 새, 파충류 친구들도 환영해요." : "Rabbits, hamsters, birds, reptiles, and more are welcome.",
      href: "/community/pet-show/upload",
      className: "bg-mint/45 border-channel-community/20",
    },
  ];

  return (
    <PetShowShell
      theme="community"
      title={isKo ? "우리아이 자랑" : "Pet Show"}
      subtitle={
        isKo
          ? "우리 아이의 가장 예쁜 순간을 공유하고 친구들과 소통해 보세요."
          : "Share your pet's sweetest moments and connect with other pet parents."
      }
      backHref="/community"
      backLabel={isKo ? "← 커뮤니티" : "← Community"}
      rightLinks={[
        { href: "/", label: isKo ? "홈" : "Home" },
        { href: "/community", label: isKo ? "커뮤니티" : "Community" },
      ]}
    >
      <div className="space-y-12">
        <section className={`${COMMUNITY_SOLID_SURFACE_CLASS} relative overflow-hidden px-6 py-8 md:px-10 md:py-10`}>
          <div className="pointer-events-none absolute -right-14 -top-14 h-56 w-56 rounded-full bg-petal/45 blur-3xl" aria-hidden />
          <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full bg-channel-community/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-channel-community">
                Pet Show
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-primary md:text-4xl">
                {isKo ? "이번 주 가장 사랑받는 반려동물" : "This week's most loved pets"}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-on-surface-variant md:text-base">
                {isKo
                  ? "좋아요와 댓글로 서로의 순간을 응원하고, 주간 랭킹 Top 5에 도전해 보세요."
                  : "Cheer each other on with likes and comments, then aim for the weekly Top 5."}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <AuthRequiredLink
                href="/community/pet-show/upload"
                className="inline-flex rounded-full bg-channel-community px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-channel-community/20 transition hover:scale-105 hover:brightness-105"
              >
                {isKo ? "나도 자랑하기" : "Post my pet"}
              </AuthRequiredLink>
              <Link
                href="/community/pet-show/ranking"
                className="inline-flex rounded-full border border-white/35 bg-white px-6 py-3 text-sm font-extrabold text-channel-community shadow-sm transition hover:brightness-105"
              >
                {isKo ? "랭킹 더보기" : "View ranking"}
              </Link>
              <Link
                href="/community/pet-show/fails"
                className="inline-flex rounded-full bg-[#ffd7ff] px-6 py-3 text-sm font-extrabold text-primary shadow-sm transition hover:scale-105 hover:brightness-105"
              >
                {isKo ? "웃긴 실패 사진" : "Funny fails"}
              </Link>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-channel-community drop-shadow-[0_0_12px_rgba(34,197,94,0.28)]">
                Weekly Ranking
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-white md:text-3xl">
                {isKo ? "이번 주의 인기 펫 Top 5" : "Popular pets Top 5"}
              </h2>
              <p className="mt-2 text-sm font-semibold text-white/75">
                {isKo ? "가장 많은 사랑을 받은 사진을 가로로 넘겨보세요." : "Swipe through the photos that received the most love."}
              </p>
            </div>
            {ranking.source === "mock" && (
              <span className="rounded-full border border-white/35 bg-white px-3 py-1 text-xs text-plum/65">
                {isKo ? "데모 데이터" : "Demo data"}
              </span>
            )}
          </div>
          <PetShowTopFiveStrip
            rows={rankingRows}
            isKo={isKo}
            emptyText={isKo ? "이번 주 첫 사진을 기다리고 있어요." : "Waiting for the first photo this week."}
          />
        </section>

        <nav className="flex gap-2 overflow-x-auto rounded-[2rem] border border-white/35 bg-white/95 p-1.5 shadow-sm hide-scrollbar md:w-fit" aria-label={isKo ? "Pet Show 카테고리" : "Pet Show categories"}>
          <Link href="/community/pet-show/snapzone" className="whitespace-nowrap rounded-full bg-primary px-6 py-2 text-sm font-bold text-cream">
            {isKo ? "전체" : "All"}
          </Link>
          <Link href="/community/pet-show/fails" className="whitespace-nowrap rounded-full px-6 py-2 text-sm font-bold text-on-surface-variant transition hover:bg-sand/60">
            {isKo ? "웃긴 실패 사진" : "Funny fails"}
          </Link>
          {categoryCards.map((category) => (
            <AuthRequiredLink
              key={category.title}
              href={category.href}
              className="whitespace-nowrap rounded-full px-6 py-2 text-sm font-bold text-on-surface-variant transition hover:bg-sand/60"
            >
              {category.title}
            </AuthRequiredLink>
          ))}
        </nav>

        <section className="grid gap-4 md:grid-cols-3">
          {categoryCards.map((category) => (
            <AuthRequiredLink key={category.title} href={category.href} className="block h-full">
              <article className={`${COMMUNITY_SOLID_CARD_CLASS} h-full border p-6 transition hover:-translate-y-1 hover:bg-white ${category.className}`}>
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/70 text-2xl">
                  <span aria-hidden>{category.emoji}</span>
                </div>
                <h3 className="text-lg font-extrabold text-primary">{category.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{category.body}</p>
                <p className="mt-5 text-sm font-bold text-channel-community">
                  {isKo ? "사진 올리기 →" : "Upload photo →"}
                </p>
              </article>
            </AuthRequiredLink>
          ))}
        </section>

        <PetShowFeed />
      </div>
    </PetShowShell>
  );
}
