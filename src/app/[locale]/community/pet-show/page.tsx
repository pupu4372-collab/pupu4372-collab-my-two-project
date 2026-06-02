import { AuthRequiredLink } from "@/components/auth/AuthRequiredLink";
import { PetShowFeed } from "@/components/community/PetShowFeed";
import { PetShowShell } from "@/components/community/PetShowShell";
import { Link } from "@/i18n/navigation";
import { fetchPetShowRanking } from "@/lib/community/ranking";
import { supabaseImageTransformUrl } from "@/lib/images/supabase-transform";
import type { PetShowRankingRow } from "@/lib/supabase/types";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const FALLBACK_IMAGES = ["/stitch/asset-51.jpg", "/stitch/asset-52.jpg", "/stitch/asset-53.jpg"];

function rankingImage(row: PetShowRankingRow, index: number) {
  const src = row.image_urls?.[0];
  if (!src) return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
  return supabaseImageTransformUrl(src, { width: index === 0 ? 900 : 560, height: index === 0 ? 620 : 560 });
}

function RankingCard({
  row,
  index,
  isKo,
}: {
  row: PetShowRankingRow;
  index: number;
  isKo: boolean;
}) {
  const rank = index + 1;
  const href = row.id.startsWith("mock-") ? "/community/pet-show/snapzone" : `/community/pet-show/${row.id}`;
  const featured = index === 0;

  return (
    <Link href={href} className={`shrink-0 snap-start ${featured ? "w-[280px] md:w-[400px]" : "w-[240px]"}`}>
      <article
        className={`pastel-card glass-card group relative h-full overflow-hidden ${
          featured ? "" : index % 2 === 0 ? "bg-petal/40" : "bg-mint/40"
        }`}
      >
        <div className="absolute left-4 top-4 z-10 rounded-full bg-primary px-3 py-1 text-sm font-extrabold text-cream shadow-lg">
          {isKo ? `${rank}위` : `#${rank}`}
        </div>
        <div className={featured ? "aspect-[1.49] overflow-hidden bg-surface-container" : "aspect-square overflow-hidden bg-surface-container"}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={rankingImage(row, index)}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
        <div className={featured ? "space-y-2 p-6" : "p-4"}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className={featured ? "truncate text-xl font-extrabold text-primary" : "truncate text-lg font-bold text-primary"}>
                {row.title ?? (isKo ? "무제 사진 자랑" : "Untitled Pet Show")}
              </h3>
              <p className="mt-1 text-sm text-on-surface-variant">
                {row.pet_species === "dog"
                  ? isKo ? "강아지" : "Dog"
                  : row.pet_species === "cat"
                    ? isKo ? "고양이" : "Cat"
                    : row.pet_species === "other"
                      ? isKo ? "다른동물" : "Other animal"
                      : "Pet Show"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1 text-hwa-red">
              <span aria-hidden>♥</span>
              <span className="font-bold">{row.like_count}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
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
      title: isKo ? "다른동물" : "Other Animals",
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
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-cream via-lavender/35 to-mint/35 px-6 py-8 md:px-10 md:py-10">
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
                className="inline-flex rounded-full bg-white/70 px-6 py-3 text-sm font-extrabold text-channel-community shadow-sm transition hover:bg-white"
              >
                {isKo ? "랭킹 더보기" : "View ranking"}
              </Link>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-channel-community">Weekly Ranking</p>
              <h2 className="mt-2 text-2xl font-extrabold text-primary md:text-3xl">
                {isKo ? "이번 주의 인기 펫 Top 5" : "Popular pets Top 5"}
              </h2>
            </div>
            {ranking.source === "mock" && (
              <span className="rounded-full bg-white/70 px-3 py-1 text-xs text-plum/50">
                {isKo ? "데모 데이터" : "Demo data"}
              </span>
            )}
          </div>
          <div className="-mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-5 hide-scrollbar md:mx-0 md:px-0">
            {rankingRows.map((row, index) => (
              <RankingCard key={row.id} row={row} index={index} isKo={isKo} />
            ))}
            {rankingRows.length === 0 && (
              <div className="pastel-card w-full p-8 text-center text-sm text-plum/60">
                {isKo ? "이번 주 첫 사진을 기다리고 있어요." : "Waiting for the first photo this week."}
              </div>
            )}
          </div>
        </section>

        <nav className="flex gap-2 overflow-x-auto rounded-[2rem] bg-sand/55 p-1.5 hide-scrollbar md:w-fit" aria-label={isKo ? "Pet Show 카테고리" : "Pet Show categories"}>
          <Link href="/community/pet-show/snapzone" className="whitespace-nowrap rounded-full bg-primary px-6 py-2 text-sm font-bold text-cream">
            {isKo ? "전체" : "All"}
          </Link>
          {categoryCards.map((category) => (
            <AuthRequiredLink
              key={category.title}
              href={category.href}
              className="whitespace-nowrap rounded-full px-6 py-2 text-sm font-bold text-on-surface-variant transition hover:bg-white/60"
            >
              {category.title}
            </AuthRequiredLink>
          ))}
        </nav>

        <section className="grid gap-4 md:grid-cols-3">
          {categoryCards.map((category) => (
            <AuthRequiredLink key={category.title} href={category.href} className="block h-full">
              <article className={`pastel-card h-full border p-6 transition hover:-translate-y-1 hover:bg-white/75 ${category.className}`}>
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
