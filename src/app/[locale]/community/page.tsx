import { ChannelShell } from "@/components/layout/ChannelShell";
import { AuthRequiredLink } from "@/components/auth/AuthRequiredLink";
import { Link } from "@/i18n/navigation";
import { fetchWeeklyPetShowSpeciesRankings } from "@/lib/community/ranking";
import { getTranslations } from "next-intl/server";

interface CommunityHubPageProps {
  params: Promise<{ locale: string }>;
}

export default async function CommunityHubPage({ params }: CommunityHubPageProps) {
  const { locale } = await params;
  const isKo = locale !== "en";
  const t = await getTranslations("community");
  const weeklyRanking = await fetchWeeklyPetShowSpeciesRankings();

  const sections = [
    { href: "/community/qa" as const, emoji: "❓", title: t("qa"), desc: t("qaDesc") },
    {
      href: "/community/free" as const,
      emoji: "💬",
      title: isKo ? "자유게시판" : "Free Board",
      desc: isKo ? "댕냥 집사들의 일상 수다와 자유글" : "Casual posts and everyday pet-parent stories",
    },
    {
      href: "/community/tips" as const,
      emoji: "🍯",
      title: isKo ? "꿀팁게시판" : "Tips Board",
      desc: isKo ? "행동·건강·사주 연계 관리 노하우" : "Behavior, health, and care know-how",
    },
  ];

  return (
    <ChannelShell
      theme="community"
      title={t("hubTitle")}
      subtitle={t("hubSubtitle")}
      backHref="/"
      backLabel={isKo ? "← 홈" : "← Home"}
      rightLinks={[
        { href: "/", label: isKo ? "홈" : "Home" },
        { href: "/saju", label: isKo ? "펫 사주" : "Pet Saju" },
      ]}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/community/pet-show/ranking"
          className="rounded-[1.75rem] bg-channel-community/20 px-5 py-5 transition hover:bg-channel-community/30 sm:col-span-2"
        >
          <span className="text-2xl" aria-hidden>
            🏆
          </span>
          <h2 className="mt-2 text-lg font-bold text-channel-community">
            {isKo ? "우리아이 자랑 주간 랭킹 Top 5" : "Pet Show Weekly Top 5"}
          </h2>
          <p className="mt-1 text-sm text-plum/65">
            {isKo
              ? "최근 7일간 좋아요 순위로 강아지, 고양이, 다른동물 Top 5를 보여줘요."
              : "Dog, cat, and other animal Top 5 by likes from the last 7 days."}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {([
              ["🐕", isKo ? "강아지" : "Dog", weeklyRanking.rows.dog],
              ["🐈", isKo ? "고양이" : "Cat", weeklyRanking.rows.cat],
              ["🐾", isKo ? "다른동물" : "Other Animals", weeklyRanking.rows.other],
            ] as const).map(([emoji, label, rows]) => (
              <div key={label} className="rounded-2xl bg-white/55 px-4 py-3">
                <p className="text-xs font-bold text-plum/70">
                  {emoji} {label} Top 5
                </p>
                <div className="mt-2 flex -space-x-2">
                  {rows.slice(0, 5).map((row) => (
                    <span
                      key={row.id}
                      className="flex h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-channel-community/10"
                    >
                      {row.image_urls?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={row.image_urls[0]} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-lg">{emoji}</span>
                      )}
                    </span>
                  ))}
                  {rows.length === 0 && (
                    <span className="text-xs text-plum/45">
                      {isKo ? "첫 사진을 기다려요" : "Waiting for photos"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Link>
        <AuthRequiredLink
          href="/community/pet-show/upload"
          className="flex items-center justify-center gap-3 rounded-[1.75rem] border border-channel-community/25 bg-white/70 px-5 py-4 text-sm font-bold text-channel-community shadow-sm transition hover:bg-channel-community/10 sm:col-span-2"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-channel-community text-xl text-white" aria-hidden>
            📷
          </span>
          {isKo ? "사진 업로드하고 주간 랭킹 참여하기" : "Upload a photo and join the weekly ranking"}
        </AuthRequiredLink>
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className={
              "rounded-[1.75rem] border border-channel-community/25 bg-white/50 px-5 py-5 transition hover:bg-channel-community/10"
            }
          >
            <span className="text-2xl" aria-hidden>
              {section.emoji}
            </span>
            <h2
              className={`mt-2 text-lg font-bold ${
                "text-plum"
              }`}
            >
              {section.title}
            </h2>
            <p className="mt-1 text-sm text-plum/65">{section.desc}</p>
          </Link>
        ))}
        <button
          type="button"
          disabled
          className="rounded-[1.75rem] border border-dashed border-channel-community/25 bg-white/35 px-5 py-5 text-left opacity-75"
        >
          <span className="text-2xl" aria-hidden>
            🛒
          </span>
          <h2 className="mt-2 text-lg font-bold text-plum">
            {isKo ? "쇼핑몰" : "Shopping Mall"}
          </h2>
          <p className="mt-1 text-sm text-plum/65">
            {isKo ? "준비 중이에요. 나중에 구현할 기능입니다." : "Coming soon. This feature will be implemented later."}
          </p>
        </button>
      </div>
      <p className="mt-8 text-center text-sm text-plum/55">
        <Link href="/saju" className="underline hover:text-plum">
          {t("toSaju")}
        </Link>
      </p>
    </ChannelShell>
  );
}
